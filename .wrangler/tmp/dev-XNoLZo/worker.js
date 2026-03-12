var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// src/emailTemplate.js
function generateEmailHTML({ message, sentDate, deliveryDate } = {}) {
  const escapeHtml = /* @__PURE__ */ __name((str) => {
    if (!str) return "";
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }, "escapeHtml");
  const safeMessage = escapeHtml(message).replace(/\n/g, "<br>");
  const formattedSentDate = sentDate || "Unknown date";
  const formattedDeliveryDate = deliveryDate || "Today";
  const bg = "#f5f0eb";
  const card = "#ffffff";
  const divider = "#e8e0d8";
  const textDark = "#2c2420";
  const textMid = "#6b5e54";
  const textLight = "#8b7e74";
  const textMuted = "#a89e94";
  const textFaint = "#b5aaa0";
  const linkColor = "#8b7355";
  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="x-apple-disable-message-reformatting">
  <title>A letter from your past self</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style>
    /* Progressive enhancement \u2013 stripped by Gmail but used by Apple Mail, Outlook.com, etc. */
    @media only screen and (max-width: 600px) {
      .email-container {
        width: 100% !important;
        max-width: 100% !important;
      }
      .email-body-cell {
        padding: 24px 20px !important;
      }
      .header-cell {
        padding: 28px 20px 0 20px !important;
      }
      .footer-cell {
        padding: 0 20px 28px 20px !important;
      }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: ${bg}; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%;">

  <!-- Visually hidden preview text -->
  <div style="display: none; max-height: 0; overflow: hidden; mso-hide: all;" aria-hidden="true">
    A letter from your past self, written on ${formattedSentDate}.
  </div>

  <!-- Outer wrapper table \u2014 full width background -->
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: ${bg};">
    <tr>
      <td style="padding: 40px 20px; text-align: center;">

        <!--[if mso]>
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" align="center"><tr><td>
        <![endif]-->

        <!-- Inner card container -->
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" align="center" class="email-container" style="max-width: 600px; width: 100%; background-color: ${card}; border-radius: 8px;">

          <!-- ============ HEADER ============ -->
          <tr>
            <td class="header-cell" style="padding: 36px 40px 0 40px; text-align: center;">
              <p style="margin: 0 0 8px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; font-size: 13px; color: ${textLight}; letter-spacing: 0.5px; text-transform: uppercase;">
                A letter from your past self
              </p>
              <p style="margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; font-size: 14px; color: ${textMid};">
                Written on ${formattedSentDate} &middot; Delivered today, ${formattedDeliveryDate}
              </p>
            </td>
          </tr>

          <!-- ============ DIVIDER ============ -->
          <tr>
            <td style="padding: 24px 40px 0 40px;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td style="border-top: 1px solid ${divider}; font-size: 0; line-height: 0;">&nbsp;</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ============ MESSAGE BODY ============ -->
          <tr>
            <td class="email-body-cell" style="padding: 24px 40px 24px 40px;">
              <p style="margin: 0; font-family: Georgia, 'Times New Roman', Times, serif; font-size: 17px; line-height: 1.75; color: ${textDark};">
                ${safeMessage}
              </p>
            </td>
          </tr>

          <!-- ============ DIVIDER ============ -->
          <tr>
            <td style="padding: 0 40px;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td style="border-top: 1px solid ${divider}; font-size: 0; line-height: 0;">&nbsp;</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ============ FOOTER ============ -->
          <tr>
            <td class="footer-cell" style="padding: 24px 40px 36px 40px; text-align: center;">
              <p style="margin: 0 0 6px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; font-size: 13px; color: ${textMuted};">
                Sent with Future Me
              </p>
              <p style="margin: 0 0 16px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; font-size: 12px; color: ${textFaint};">
                You wrote this to yourself on ${formattedSentDate}
              </p>
              <a href="https://futureme.dev" target="_blank" style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; font-size: 13px; color: ${linkColor}; text-decoration: none;">
                Write a letter to your future self &rarr;
              </a>
            </td>
          </tr>

        </table>
        <!-- /Inner card container -->

        <!--[if mso]>
        </td></tr></table>
        <![endif]-->

      </td>
    </tr>
  </table>
  <!-- /Outer wrapper table -->

</body>
</html>`;
}
__name(generateEmailHTML, "generateEmailHTML");

// src/worker.js
function generateConfirmationHTML(formattedDate) {
  const bg = "#f5f0eb";
  const card = "#ffffff";
  const divider = "#e8e0d8";
  const textDark = "#2c2420";
  const textMid = "#6b5e54";
  const textLight = "#8b7e74";
  const textMuted = "#a89e94";
  const linkColor = "#8b7355";
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
__name(generateConfirmationHTML, "generateConfirmationHTML");
var EmailScheduler = class {
  static {
    __name(this, "EmailScheduler");
  }
  constructor(state, env) {
    this.state = state;
    this.env = env;
  }
  async fetch(request) {
    const url = new URL(request.url);
    if (url.pathname === "/schedule" && request.method === "POST") {
      const { emailId, sendAt } = await request.json();
      await this.state.storage.put("emailId", emailId);
      const sendTime = new Date(sendAt).getTime();
      await this.state.storage.setAlarm(sendTime);
      return new Response("Alarm set!");
    }
    return new Response("Not found", { status: 404 });
  }
  async alarm() {
    const emailId = await this.state.storage.get("emailId");
    if (!emailId) return;
    const { results } = await this.env.DB.prepare(
      "SELECT * FROM scheduled_emails WHERE id = ?"
    ).bind(emailId).all();
    if (results.length === 0) return;
    const email = results[0];
    const sentDate = new Date(email.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
    const deliveryDate = (/* @__PURE__ */ new Date()).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
    const htmlContent = generateEmailHTML({
      message: email.message,
      sentDate,
      deliveryDate
    });
    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${this.env.RESEND_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          from: "Future Me <noreply@futureme.dev>",
          to: email.recipient,
          subject: email.subject,
          html: htmlContent,
          text: email.message
        })
      });
      if (response.ok) {
        console.log("Email sent successfully");
        await this.env.DB.prepare(
          "UPDATE scheduled_emails SET status = ? WHERE id = ?"
        ).bind("sent", emailId).run();
      } else {
        const errorText = await response.text();
        console.error(`Failed to send email: ${errorText}`);
        await this.env.DB.prepare(
          "UPDATE scheduled_emails SET status = ?, failure_reason = ? WHERE id = ?"
        ).bind("failed", errorText, emailId).run();
      }
    } catch (error) {
      console.error(`Error sending email: ${error.message}`);
      await this.env.DB.prepare(
        "UPDATE scheduled_emails SET status = ?, failure_reason = ? WHERE id = ?"
      ).bind("failed", error.message, emailId).run();
    }
  }
};
function validateEmailInput({ to, subject, message, sendAt }) {
  const errors = [];
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!to || typeof to !== "string") {
    errors.push("Recipient email is required.");
  } else if (to.length > 254) {
    errors.push("Email address is too long (max 254 characters).");
  } else if (!emailRegex.test(to)) {
    errors.push("Invalid email address format.");
  }
  if (!subject || typeof subject !== "string") {
    errors.push("Subject is required.");
  } else if (subject.length > 200) {
    errors.push("Subject is too long (max 200 characters).");
  }
  if (!message || typeof message !== "string") {
    errors.push("Message is required.");
  } else if (message.length < 10) {
    errors.push("Message is too short (min 10 characters).");
  } else if (message.length > 1e4) {
    errors.push("Message is too long (max 10,000 characters).");
  }
  if (!sendAt || typeof sendAt !== "string") {
    errors.push("Delivery date is required.");
  } else {
    const parsed = new Date(sendAt);
    if (isNaN(parsed.getTime())) {
      errors.push("Delivery date is invalid.");
    } else if (parsed.getTime() <= Date.now()) {
      errors.push("Delivery date must be in the future.");
    } else {
      const maxDate = /* @__PURE__ */ new Date();
      maxDate.setFullYear(maxDate.getFullYear() + 30);
      if (parsed.getTime() > maxDate.getTime()) {
        errors.push("Delivery date must be within 30 years.");
      }
    }
  }
  return errors;
}
__name(validateEmailInput, "validateEmailInput");
function sanitizeInput(str) {
  if (typeof str !== "string") return str;
  return str.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "").replace(/<[^>]*>/g, "");
}
__name(sanitizeInput, "sanitizeInput");
var worker_default = {
  async fetch(request, env) {
    const url = new URL(request.url);
    const origin = request.headers.get("Origin");
    const allowedOrigin = origin?.includes("localhost") ? origin : "https://futureme.dev";
    const corsHeaders = {
      "Access-Control-Allow-Origin": allowedOrigin,
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    };
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }
    if (url.pathname === "/" && request.method === "GET") {
      return new Response("Hello World \u{1F44B}", { headers: corsHeaders });
    }
    if (url.pathname === "/schedule-email" && request.method === "POST") {
      try {
        const clientIP = request.headers.get("CF-Connecting-IP") || "unknown";
        const nowEpoch = Math.floor(Date.now() / 1e3);
        const oneHourAgo = nowEpoch - 3600;
        await env.DB.prepare("DELETE FROM rate_limits WHERE window_start < ?").bind(oneHourAgo).run();
        const rateRow = await env.DB.prepare("SELECT request_count, window_start FROM rate_limits WHERE ip = ?").bind(clientIP).first();
        if (rateRow) {
          if (rateRow.window_start > oneHourAgo && rateRow.request_count >= 5) {
            return new Response(JSON.stringify({ error: "Too many requests. Please try again later." }), {
              status: 429,
              headers: { ...corsHeaders, "Content-Type": "application/json" }
            });
          }
          if (rateRow.window_start <= oneHourAgo) {
            await env.DB.prepare("UPDATE rate_limits SET request_count = 1, window_start = ? WHERE ip = ?").bind(nowEpoch, clientIP).run();
          } else {
            await env.DB.prepare("UPDATE rate_limits SET request_count = request_count + 1 WHERE ip = ?").bind(clientIP).run();
          }
        } else {
          await env.DB.prepare("INSERT INTO rate_limits (ip, request_count, window_start) VALUES (?, 1, ?)").bind(clientIP, nowEpoch).run();
        }
        const { to, subject, message, sendAt, cf_turnstile_response } = await request.json();
        const validationErrors = validateEmailInput({ to, subject, message, sendAt });
        if (validationErrors.length > 0) {
          return new Response(JSON.stringify({ error: validationErrors[0] }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          });
        }
        const sanitizedMessage = sanitizeInput(message);
        const sanitizedSubject = sanitizeInput(subject);
        if (!cf_turnstile_response) {
          return new Response(JSON.stringify({ error: "Bot verification failed" }), {
            status: 403,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          });
        }
        const turnstileVerification = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            secret: env.TURNSTILE_SECRET_KEY,
            response: cf_turnstile_response
          })
        });
        const turnstileResult = await turnstileVerification.json();
        if (!turnstileResult.success) {
          return new Response(JSON.stringify({ error: "Bot verification failed" }), {
            status: 403,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          });
        }
        const parsedSendAt = new Date(sendAt);
        const result = await env.DB.prepare(
          "INSERT INTO scheduled_emails (recipient, subject, message, send_at) VALUES (?, ?, ?, ?)"
        ).bind(to, sanitizedSubject, sanitizedMessage, parsedSendAt.toISOString()).run();
        const emailId = result.meta.last_row_id;
        const id = env.EMAIL_SCHEDULER.idFromName(`email-${emailId}`);
        const stub = env.EMAIL_SCHEDULER.get(id);
        await stub.fetch("https://fake-host/schedule", {
          method: "POST",
          body: JSON.stringify({ emailId, sendAt: parsedSendAt.toISOString() })
        });
        const formattedDeliveryDate = parsedSendAt.toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric"
        });
        try {
          await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${env.RESEND_API_KEY}`,
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              from: "Future Me <noreply@futureme.dev>",
              to,
              subject: `Your letter is saved \u2014 arriving ${formattedDeliveryDate}`,
              html: generateConfirmationHTML(formattedDeliveryDate)
            })
          });
        } catch (confirmErr) {
          console.error("Failed to send confirmation email:", confirmErr.message);
        }
        return new Response("Email scheduled successfully!", {
          headers: corsHeaders
        });
      } catch (error) {
        return new Response("Something went wrong. Please try again.", {
          status: 500,
          headers: corsHeaders
        });
      }
    }
    return new Response("Not Found", { status: 404, headers: corsHeaders });
  }
};

// ../../../.npm-global/lib/node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
var drainBody = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;

// ../../../.npm-global/lib/node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e) {
    const error = reduceError(e);
    return Response.json(error, {
      status: 500,
      headers: { "MF-Experimental-Error-Stack": "true" }
    });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;

// .wrangler/tmp/bundle-kf0zgR/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = worker_default;

// ../../../.npm-global/lib/node_modules/wrangler/templates/middleware/common.ts
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");

// .wrangler/tmp/bundle-kf0zgR/middleware-loader.entry.ts
var __Facade_ScheduledController__ = class ___Facade_ScheduledController__ {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  static {
    __name(this, "__Facade_ScheduledController__");
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof ___Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = /* @__PURE__ */ __name((request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    }, "#fetchDispatcher");
    #dispatcher = /* @__PURE__ */ __name((type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    }, "#dispatcher");
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;
export {
  EmailScheduler,
  __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default as default
};
//# sourceMappingURL=worker.js.map
