import { escapeHtml } from "../helpers/escapeHtml";
import type { FormConfig } from "../models";

const FOOTER = "The Hub Louisville · 1133 Bardstown Rd, Louisville, KY 40204";
const BODY = "Thanks for reaching out to The Hub Louisville. We received your message and will get back to you soon.";

/**
 * Confirmation to the submitter.
 *
 * Content is deliberately fixed: this goes to an address typed into a public
 * form, so it must never echo any submitted field (name, message, …) — otherwise
 * anyone could use the form to deliver their own text to any inbox from our
 * domain. See docs/mtmcya-mailer.md, rule 1.
 */
export function buildConfirmationEmail(config: FormConfig): {
  subject: string;
  html: string;
  text: string;
} {
  const subject = config.confirmationSubject;

  const html = `<!DOCTYPE html>
<html lang="en">
<body style="margin:0;padding:24px;background:#f3f4f6;font-family:Arial,Helvetica,sans-serif;">
  <table role="presentation" align="center" width="600" style="max-width:600px;width:100%;background:#ffffff;border-radius:8px;padding:24px;">
    <tr><td>
      <h1 style="margin:0 0 16px;font-size:20px;color:#111827;">${escapeHtml(subject)}</h1>
      <p style="margin:0 0 16px;font-size:14px;color:#374151;">Hi,</p>
      <p style="margin:0 0 16px;font-size:14px;color:#374151;">${escapeHtml(BODY)}</p>
      <p style="margin:24px 0 0;font-size:12px;color:#6b7280;">${FOOTER}</p>
    </td></tr>
  </table>
</body>
</html>`;

  const text = [subject, "", "Hi,", "", BODY, "", FOOTER].join("\n");

  return { subject, html, text };
}
