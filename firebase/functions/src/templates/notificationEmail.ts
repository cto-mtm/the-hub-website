import { escapeHtml } from "../helpers/escapeHtml";
import type { FormConfig } from "../models";

const FOOTER = "The Hub Louisville · 1133 Bardstown Rd, Louisville, KY 40204";

/** Internal notification to the team: the submitted fields, escaped. */
export function buildNotificationEmail(
  config: FormConfig,
  data: Record<string, unknown>
): { html: string; text: string } {
  const keys = [...config.requiredFields, ...config.optionalFields].filter(
    (k) => data[k] !== undefined && data[k] !== ""
  );
  const rows = keys
    .map(
      (k) => `
        <tr>
          <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;font-weight:bold;color:#374151;vertical-align:top;">${escapeHtml(k)}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;color:#111827;white-space:pre-wrap;">${escapeHtml(data[k])}</td>
        </tr>`
    )
    .join("");

  const html = `<!DOCTYPE html>
<html lang="en">
<body style="margin:0;padding:24px;background:#f3f4f6;font-family:Arial,Helvetica,sans-serif;">
  <table role="presentation" align="center" width="600" style="max-width:600px;width:100%;background:#ffffff;border-radius:8px;padding:24px;">
    <tr><td>
      <h1 style="margin:0 0 16px;font-size:20px;color:#111827;">${escapeHtml(config.subject)}</h1>
      <table role="presentation" width="100%" style="border-collapse:collapse;font-size:14px;">${rows}
      </table>
      <p style="margin:24px 0 0;font-size:12px;color:#6b7280;">${FOOTER}</p>
    </td></tr>
  </table>
</body>
</html>`;

  const text = [
    config.subject,
    "",
    ...keys.map((k) => `${k}: ${String(data[k])}`),
    "",
    FOOTER,
  ].join("\n");

  return { html, text };
}
