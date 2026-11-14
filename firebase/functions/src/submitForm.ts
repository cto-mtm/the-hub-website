import { randomUUID } from "node:crypto";
import { onRequest } from "firebase-functions/v2/https";
import { defineSecret } from "firebase-functions/params";
import { logger } from "firebase-functions/v2";
import { ZodError } from "zod";
import formConfigs from "./models";
import { sendMail } from "./helpers/mailer";
import { verifyRecaptcha } from "./helpers/recaptcha";
import { buildNotificationEmail } from "./templates/notificationEmail";
import { buildConfirmationEmail } from "./templates/confirmationEmail";

// reCAPTCHA Enterprise: the API key is the secret; the site key is public (same one the website uses).
const RECAPTCHA_API_KEY = defineSecret("RECAPTCHA_API_KEY");
const RECAPTCHA_SITE_KEY = "6Le8Sh8uAAAAAE8oTTrbPH-hSHDlHvdRf9GF1Ezi";
// Google Cloud project that owns the reCAPTCHA key. Defaults to this Firebase project;
// set RECAPTCHA_PROJECT_ID in functions/.env if the key lives in a different project.
const recaptchaProjectId = () => process.env.RECAPTCHA_PROJECT_ID || process.env.GCLOUD_PROJECT;

// Production domain + Firebase's own hosting domains (for testing before DNS moves).
const ALLOWED_ORIGINS = [
  "https://hublouisville.com",
  "https://www.hublouisville.com",
  "https://the-hub-website.web.app",
  "https://the-hub-website.firebaseapp.com",
  // Optional dev origin (e.g. the Tailscale https origin); functions can't read the repo-root ports.json when deployed.
  ...(process.env.DEV_ORIGIN ? [process.env.DEV_ORIGIN] : []),
];

export const submitForm = onRequest(
  {
    region: "us-central1",
    maxInstances: 10,
    cors: ALLOWED_ORIGINS,
    secrets: [RECAPTCHA_API_KEY],
  },
  async (req, res) => {
    if (req.method !== "POST") {
      res.status(405).json({ success: false, error: "Method not allowed" });
      return;
    }

    const { formType, data, recaptchaToken } = (req.body ?? {}) as {
      formType?: string;
      data?: Record<string, unknown>;
      recaptchaToken?: string;
    };

    if (typeof formType !== "string" || !Object.hasOwn(formConfigs, formType)) {
      res.status(400).json({
        success: false,
        error: `Unknown formType. Valid types: ${Object.keys(formConfigs).join(", ")}`,
      });
      return;
    }
    const config = formConfigs[formType];

    // Honeypot: the hidden "company" field is only ever filled in by bots.
    if (data && typeof data === "object" && typeof data.company === "string" && data.company.trim() !== "") {
      logger.warn("Honeypot triggered", { formType });
      res.status(200).json({ success: true });
      return;
    }
    if (data && typeof data === "object") delete data.company;

    const captcha = await verifyRecaptcha({
      token: recaptchaToken,
      expectedAction: formType.replace("-", "_"),
      siteKey: RECAPTCHA_SITE_KEY,
      apiKey: RECAPTCHA_API_KEY.value(),
      projectId: recaptchaProjectId(),
    });
    if (!captcha.success) {
      logger.warn("reCAPTCHA failed", { formType, score: captcha.score, error: captcha.error });
      res.status(403).json({ success: false, error: "reCAPTCHA verification failed" });
      return;
    }

    let parsed: Record<string, unknown>;
    try {
      parsed = config.schema.parse(data);
    } catch (err) {
      if (err instanceof ZodError) {
        res.status(400).json({ success: false, error: err.flatten() });
        return;
      }
      throw err;
    }

    // ── Send email(s) via mtmcya-mailer (see docs/mtmcya-mailer.md) ──
    const submissionId = randomUUID();
    const email = typeof parsed.email === "string" && parsed.email ? parsed.email : undefined;
    const safeName = String(parsed.name ?? "Unknown").replace(/[\r\n]/g, "");

    // Internal notification — hardcoded destination, visitor only in replyTo.
    // Nothing else stores the submission, so if the mailer refuses it the
    // visitor has to know it didn't go through.
    const notification = buildNotificationEmail(config, parsed);
    const notified = await sendMail({
      to: config.notifyEmail,
      replyTo: email,
      subject: `${config.subject} — ${safeName}`.slice(0, 200),
      html: notification.html,
      text: notification.text,
      kind: formType,
      idempotencyKey: `${formType}-${submissionId}`,
    });
    // (skipped_emulator = local dev: skipped on purpose, not a failure.)
    if (!notified.ok && notified.error !== "skipped_emulator") {
      logger.error("Form notification not sent", {
        formType,
        status: notified.status,
        error: notified.error,
      });
      res.status(502).json({ success: false, error: "Failed to send message" });
      return;
    }

    // Submitter confirmation — fixed content only (rule 1), best-effort.
    // Replies go to the team, since no-reply@ bounces.
    if (email) {
      const confirmation = buildConfirmationEmail(config);
      await sendMail({
        to: email,
        replyTo: config.notifyEmail,
        subject: confirmation.subject,
        html: confirmation.html,
        text: confirmation.text,
        kind: `${formType}-confirmation`,
        idempotencyKey: `${formType}-confirmation-${submissionId}`,
      });
    }

    logger.info("Form submitted", {
      formType,
      mailId: "mailId" in notified ? notified.mailId : undefined,
    });
    res.status(200).json({ success: true });
  }
);
