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

    // Send the email
    try {
      const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.env.SENDGRID_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          personalizations: [{ to: [{ email: email.recipient }] }],
          from: { 
            email: 'noreply@futureme.dev',
            name: 'FutureMe'
          },
          subject: email.subject,
          content: [{ type: 'text/plain', value: email.message }],
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
        const { to, subject, message, timeValue, timeUnit } = await request.json();

        if (!to || !subject || !message || !timeValue || !timeUnit) {
          return new Response('All fields are required', { 
            status: 400,
            headers: corsHeaders 
          });
        }

        // Calculate send time
        const now = new Date();
        let sendAt = new Date(now);

        switch(timeUnit) {
          case 'minutes':
            sendAt.setMinutes(sendAt.getMinutes() + parseInt(timeValue));
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
        ).bind(to, subject, message, sendAt.toISOString()).run();

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
        return new Response('Error: ' + error.message, { 
          status: 500,
          headers: corsHeaders 
        });
      }
    }

    return new Response('Not Found', { status: 404, headers: corsHeaders });
  }
};