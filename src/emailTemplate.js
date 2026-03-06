/**
 * Generates a beautiful HTML email template for Future Me letters.
 *
 * Table-based layout for Outlook compatibility, inline styles for
 * broad email-client support, with progressive-enhancement media
 * queries for mobile.
 *
 * @param {Object} options
 * @param {string} options.message   - The letter body text
 * @param {string} options.sentDate  - Human-readable date the letter was written
 * @param {string} options.deliveryDate - Human-readable delivery date
 * @returns {string} Complete HTML document string
 */
export function generateEmailHTML({ message, sentDate, deliveryDate } = {}) {
  // ── helpers ──────────────────────────────────────────────────
  const escapeHtml = (str) => {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  };

  const safeMessage = escapeHtml(message).replace(/\n/g, '<br>');
  const formattedSentDate = sentDate || 'Unknown date';
  const formattedDeliveryDate = deliveryDate || 'Today';

  // ── colours ──────────────────────────────────────────────────
  const bg        = '#f5f0eb';
  const card      = '#ffffff';
  const divider   = '#e8e0d8';
  const textDark  = '#2c2420';
  const textMid   = '#6b5e54';
  const textLight  = '#8b7e74';
  const textMuted = '#a89e94';
  const textFaint = '#b5aaa0';
  const linkColor = '#8b7355';

  // ── template ─────────────────────────────────────────────────
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
    /* Progressive enhancement – stripped by Gmail but used by Apple Mail, Outlook.com, etc. */
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

  <!-- Outer wrapper table — full width background -->
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
