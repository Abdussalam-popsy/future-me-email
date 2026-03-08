// =============================================================
// Cloudflare Turnstile Configuration
// Get your keys from: Cloudflare Dashboard → Turnstile → Add Site
// TURNSTILE_SECRET_KEY: Add as a secret in wrangler.toml or via
//   `wrangler secret put TURNSTILE_SECRET_KEY`
// VITE_TURNSTILE_SITE_KEY: Add to client/.env as VITE_TURNSTILE_SITE_KEY
// =============================================================

import { generateEmailHTML } from './emailTemplate.js';

// Durable Object for scheduling emails with alarms
export class EmailScheduler {
  constructor(state, env) {
    this.state = state;
    this.env = env;
  }

  async fetch(request) {
    const url = new URL(request.url);

    if (url.pathname === '/schedule' && request.method === 'POST') {
      const { emailId, sendAt } = await request.json();
      
      // Store the email ID
      await this.state.storage.put('emailId', emailId);
      
      // Set alarm for when email should be sent
      const sendTime = new Date(sendAt).getTime();
      await this.state.storage.setAlarm(sendTime);
      
      return new Response('Alarm set!');
    }

    return new Response('Not found', { status: 404 });
  }

  async alarm() {
    // This runs when the alarm fires
    const emailId = await this.state.storage.get('emailId');
    
    if (!emailId) return;

    // Get email details from D1
    const { results } = await this.env.DB.prepare(
      'SELECT * FROM scheduled_emails WHERE id = ?'
    ).bind(emailId).all();

    if (results.length === 0) return;

    const email = results[0];

    // Format dates for the email template
    const sentDate = new Date(email.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const deliveryDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    // Generate the HTML version of the email
    const htmlContent = generateEmailHTML({
      message: email.message,
      sentDate,
      deliveryDate,
    });

    // Send the email
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'Future Me <noreply@futureme.dev>',
          to: email.recipient,
          subject: email.subject,
          html: htmlContent,
          text: email.message,
        }),
      });

      if (response.ok) {
        console.log(`✅ Sent email to ${email.recipient}`);
        
        // Delete from database
        await this.env.DB.prepare(
          'DELETE FROM scheduled_emails WHERE id = ?'
        ).bind(emailId).run();
      } else {
        console.error(`❌ Failed to send email: ${await response.text()}`);
      }
    } catch (error) {
      console.error(`Error sending email: ${error.message}`);
    }
  }
}

// Input validation helper
function validateEmailInput({ to, subject, message, timeValue, timeUnit }) {
  const errors = [];

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!to || typeof to !== 'string') {
    errors.push('Recipient email is required.');
  } else if (to.length > 254) {
    errors.push('Email address is too long (max 254 characters).');
  } else if (!emailRegex.test(to)) {
    errors.push('Invalid email address format.');
  }

  // Subject validation
  if (!subject || typeof subject !== 'string') {
    errors.push('Subject is required.');
  } else if (subject.length > 200) {
    errors.push('Subject is too long (max 200 characters).');
  }

  // Message validation
  if (!message || typeof message !== 'string') {
    errors.push('Message is required.');
  } else if (message.length < 10) {
    errors.push('Message is too short (min 10 characters).');
  } else if (message.length > 10000) {
    errors.push('Message is too long (max 10,000 characters).');
  }

  // Time value validation
  const parsedTimeValue = parseInt(timeValue);
  if (!timeValue || isNaN(parsedTimeValue)) {
    errors.push('Time value is required and must be a number.');
  } else if (parsedTimeValue < 1 || parsedTimeValue > 100) {
    errors.push('Time value must be between 1 and 100.');
  }

  // Time unit validation
  const validUnits = ['minutes', 'hours', 'days', 'weeks', 'months', 'years'];
  if (!timeUnit || !validUnits.includes(timeUnit)) {
    errors.push('Time unit must be one of: minutes, hours, days, weeks, months, years.');
  }

  return errors;
}

// Input sanitization helper
function sanitizeInput(str) {
  if (typeof str !== 'string') return str;
  return str.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            .replace(/<[^>]*>/g, '');
}

// Main Worker
export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    // Handle preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // Root route
    if (url.pathname === '/' && request.method === 'GET') {
      return new Response('Hello World 👋', { headers: corsHeaders });
    }

    // Schedule email route
    if (url.pathname === '/schedule-email' && request.method === 'POST') {
      try {
        // Rate limiting - 5 requests per IP per hour
        const clientIP = request.headers.get('CF-Connecting-IP') || 'unknown';
        const nowEpoch = Math.floor(Date.now() / 1000);
        const oneHourAgo = nowEpoch - 3600;

        // Clean up stale entries
        await env.DB.prepare('DELETE FROM rate_limits WHERE window_start < ?').bind(oneHourAgo).run();

        // Check current rate
        const rateRow = await env.DB.prepare('SELECT request_count, window_start FROM rate_limits WHERE ip = ?').bind(clientIP).first();

        if (rateRow) {
          if (rateRow.window_start > oneHourAgo && rateRow.request_count >= 5) {
            return new Response(JSON.stringify({ error: 'Too many requests. Please try again later.' }), {
              status: 429,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
          }

          if (rateRow.window_start <= oneHourAgo) {
            // Reset window
            await env.DB.prepare('UPDATE rate_limits SET request_count = 1, window_start = ? WHERE ip = ?').bind(nowEpoch, clientIP).run();
          } else {
            // Increment counter
            await env.DB.prepare('UPDATE rate_limits SET request_count = request_count + 1 WHERE ip = ?').bind(clientIP).run();
          }
        } else {
          // First request from this IP
          await env.DB.prepare('INSERT INTO rate_limits (ip, request_count, window_start) VALUES (?, 1, ?)').bind(clientIP, nowEpoch).run();
        }

        // Parse request body
        const { to, subject, message, timeValue, timeUnit, cf_turnstile_response } = await request.json();

        // Validate input
        const validationErrors = validateEmailInput({ to, subject, message, timeValue, timeUnit });
        if (validationErrors.length > 0) {
          return new Response(JSON.stringify({ error: validationErrors[0] }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        // Sanitize message content
        const sanitizedMessage = sanitizeInput(message);
        const sanitizedSubject = sanitizeInput(subject);

        // Verify Turnstile token
        if (!cf_turnstile_response) {
          return new Response(JSON.stringify({ error: 'Bot verification failed' }), {
            status: 403,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        const turnstileVerification = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            secret: env.TURNSTILE_SECRET_KEY,
            response: cf_turnstile_response,
          }),
        });

        const turnstileResult = await turnstileVerification.json();
        if (!turnstileResult.success) {
          return new Response(JSON.stringify({ error: 'Bot verification failed' }), {
            status: 403,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        // Calculate send time
        const now = new Date();
        let sendAt = new Date(now);

        switch(timeUnit) {
          case 'minutes':
            sendAt.setMinutes(sendAt.getMinutes() + parseInt(timeValue));
            break;
          case 'hours':
            sendAt.setHours(sendAt.getHours() + parseInt(timeValue));
            break;
          case 'days':
            sendAt.setDate(sendAt.getDate() + parseInt(timeValue));
            break;
          case 'weeks':
            sendAt.setDate(sendAt.getDate() + (parseInt(timeValue) * 7));
            break;
          case 'months':
            sendAt.setMonth(sendAt.getMonth() + parseInt(timeValue));
            break;
          case 'years':
            sendAt.setFullYear(sendAt.getFullYear() + parseInt(timeValue));
            break;
        }

        // Save to D1 database
        const result = await env.DB.prepare(
          'INSERT INTO scheduled_emails (recipient, subject, message, send_at) VALUES (?, ?, ?, ?)'
        ).bind(to, sanitizedSubject, sanitizedMessage, sendAt.toISOString()).run();

        const emailId = result.meta.last_row_id;

        // Create a Durable Object instance for this email
        const id = env.EMAIL_SCHEDULER.idFromName(`email-${emailId}`);
        const stub = env.EMAIL_SCHEDULER.get(id);

        // Tell the Durable Object to set an alarm
        await stub.fetch('https://fake-host/schedule', {
          method: 'POST',
          body: JSON.stringify({ emailId, sendAt: sendAt.toISOString() }),
        });

        return new Response('Email scheduled successfully!', {
          headers: corsHeaders
        });

      } catch (error) {
        return new Response('Something went wrong. Please try again.', {
          status: 500,
          headers: corsHeaders
        });
      }
    }

    return new Response('Not Found', { status: 404, headers: corsHeaders });
  }
};