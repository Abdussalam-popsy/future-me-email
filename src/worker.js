// =============================================================
// Cloudflare Turnstile Configuration
// Get your keys from: Cloudflare Dashboard → Turnstile → Add Site
// TURNSTILE_SECRET_KEY: Add as a secret in wrangler.toml or via
//   `wrangler secret put TURNSTILE_SECRET_KEY`
// VITE_TURNSTILE_SITE_KEY: Add to client/.env as VITE_TURNSTILE_SITE_KEY
// =============================================================

import { generateEmailHTML } from './emailTemplate.js';

// Generates a confirmation email HTML matching the existing template aesthetic
function generateConfirmationHTML(formattedDate) {
  const bg        = '#f5f0eb';
  const card      = '#ffffff';
  const divider   = '#e8e0d8';
  const textDark  = '#2c2420';
  const textMid   = '#6b5e54';
  const textLight = '#8b7e74';
  const textMuted = '#a89e94';
  const linkColor = '#8b7355';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your letter is saved</title>
  <style>
    @media only screen and (max-width: 600px) {
      .email-container { width: 100% !important; max-width: 100% !important; }
      .email-body-cell { padding: 24px 20px !important; }
      .header-cell { padding: 28px 20px 0 20px !important; }
      .footer-cell { padding: 0 20px 28px 20px !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: ${bg}; -webkit-text-size-adjust: 100%;">
  <div style="display: none; max-height: 0; overflow: hidden;" aria-hidden="true">
    Your letter is on its way to the future.
  </div>
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: ${bg};">
    <tr>
      <td style="padding: 40px 20px; text-align: center;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" align="center" class="email-container" style="max-width: 600px; width: 100%; background-color: ${card}; border-radius: 8px;">
          <tr>
            <td class="header-cell" style="padding: 36px 40px 0 40px; text-align: center;">
              <p style="margin: 0 0 8px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; font-size: 13px; color: ${textLight}; letter-spacing: 0.5px; text-transform: uppercase;">
                Confirmation
              </p>
              <p style="margin: 0; font-family: Georgia, 'Times New Roman', Times, serif; font-size: 22px; color: ${textDark}; line-height: 1.4;">
                Your letter is on its way to the future
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 24px 40px 0 40px;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr><td style="border-top: 1px solid ${divider}; font-size: 0; line-height: 0;">&nbsp;</td></tr>
              </table>
            </td>
          </tr>
          <tr>
            <td class="email-body-cell" style="padding: 24px 40px 24px 40px; text-align: center;">
              <p style="margin: 0 0 16px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; font-size: 15px; color: ${textMid}; line-height: 1.6;">
                Arriving
              </p>
              <p style="margin: 0 0 20px 0; font-family: Georgia, 'Times New Roman', Times, serif; font-size: 20px; color: ${textDark}; font-weight: bold;">
                ${formattedDate}
              </p>
              <p style="margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; font-size: 15px; color: ${textMid}; line-height: 1.6;">
                We have your letter safe. You'll hear from us on ${formattedDate}.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 0 40px;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr><td style="border-top: 1px solid ${divider}; font-size: 0; line-height: 0;">&nbsp;</td></tr>
              </table>
            </td>
          </tr>
          <tr>
            <td class="footer-cell" style="padding: 24px 40px 36px 40px; text-align: center;">
              <p style="margin: 0 0 6px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; font-size: 13px; color: ${textMuted};">
                Sent with Future Me &middot;
                <a href="https://futureme.dev" target="_blank" style="color: ${linkColor}; text-decoration: none;">futureme.dev</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

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
      const parsed = new Date(sendAt);
      const sendTime = parsed.getTime();

      if (!sendTime || isNaN(sendTime)) {
        return new Response(JSON.stringify({ error: 'Invalid delivery date.' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }

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
        console.log('Email sent successfully');
        await this.env.DB.prepare(
          'UPDATE scheduled_emails SET status = ? WHERE id = ?'
        ).bind('sent', emailId).run();
      } else {
        const errorText = await response.text();
        console.error(`Failed to send email: ${errorText}`);
        await this.env.DB.prepare(
          'UPDATE scheduled_emails SET status = ?, failure_reason = ? WHERE id = ?'
        ).bind('failed', errorText, emailId).run();
      }
    } catch (error) {
      console.error(`Error sending email: ${error.message}`);
      await this.env.DB.prepare(
        'UPDATE scheduled_emails SET status = ?, failure_reason = ? WHERE id = ?'
      ).bind('failed', error.message, emailId).run();
    }
  }
}

// Input validation helper
function validateEmailInput({ to, subject, message, sendAt }) {
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

  // sendAt validation
  if (!sendAt || typeof sendAt !== 'string') {
    errors.push('Delivery date is required.');
  } else {
    const parsed = new Date(sendAt);
    if (isNaN(parsed.getTime())) {
      errors.push('Delivery date is invalid.');
    } else if (parsed.getTime() <= Date.now()) {
      errors.push('Delivery date must be in the future.');
    } else {
      // Must be within 30 years
      const maxDate = new Date();
      maxDate.setFullYear(maxDate.getFullYear() + 30);
      if (parsed.getTime() > maxDate.getTime()) {
        errors.push('Delivery date must be within 30 years.');
      }
    }
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

    // CORS headers — dynamic origin
    const origin = request.headers.get('Origin');
    const allowedOrigin = origin?.includes('localhost') ? origin : 'https://futureme.dev';
    const corsHeaders = {
      'Access-Control-Allow-Origin': allowedOrigin,
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

    // Stats route
    if (url.pathname === '/stats' && request.method === 'GET') {
      try {
        const row = await env.DB.prepare('SELECT COUNT(*) as total FROM scheduled_emails').first();
        return new Response(JSON.stringify({ total: row?.total ?? 0 }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } catch (error) {
        console.error('Stats error:', error.message);
        return new Response(JSON.stringify({ total: 0 }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
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
        const { to, subject, message, sendAt, cf_turnstile_response } = await request.json();

        // Validate input
        const validationErrors = validateEmailInput({ to, subject, message, sendAt });
        if (validationErrors.length > 0) {
          return new Response(JSON.stringify({ error: validationErrors[0] }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        // Sanitize message content
        const sanitizedMessage = sanitizeInput(message);
        const sanitizedSubject = sanitizeInput(subject);

        // Verify Turnstile token (skip in local development)
        const isLocalDev = origin?.includes('localhost');
        const skipTurnstile = isLocalDev && cf_turnstile_response === 'dev-bypass-token';

        if (!skipTurnstile) {
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
        }

        // Parse the delivery date
        const parsedSendAt = new Date(sendAt);

        // Save to D1 database
        const result = await env.DB.prepare(
          'INSERT INTO scheduled_emails (recipient, subject, message, send_at) VALUES (?, ?, ?, ?)'
        ).bind(to, sanitizedSubject, sanitizedMessage, parsedSendAt.toISOString()).run();

        const emailId = result.meta.last_row_id;

        // Create a Durable Object instance for this email
        const id = env.EMAIL_SCHEDULER.idFromName(`email-${emailId}`);
        const stub = env.EMAIL_SCHEDULER.get(id);

        // Tell the Durable Object to set an alarm
        await stub.fetch('https://fake-host/schedule', {
          method: 'POST',
          body: JSON.stringify({ emailId, sendAt: parsedSendAt.toISOString() }),
        });

        // Send confirmation email (fire-and-forget — never block the response)
        const formattedDeliveryDate = parsedSendAt.toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });

        try {
          await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${env.RESEND_API_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              from: 'Future Me <noreply@futureme.dev>',
              to,
              subject: `Your letter is saved — arriving ${formattedDeliveryDate}`,
              html: generateConfirmationHTML(formattedDeliveryDate),
            }),
          });
        } catch (confirmErr) {
          console.error('Failed to send confirmation email:', confirmErr.message);
        }

        return new Response('Email scheduled successfully!', {
          headers: corsHeaders
        });

      } catch (error) {
        console.error('Schedule email error:', error.message);
        return new Response(JSON.stringify({ error: 'Something went wrong. Please try again.' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }

    return new Response('Not Found', { status: 404, headers: corsHeaders });
  }
};