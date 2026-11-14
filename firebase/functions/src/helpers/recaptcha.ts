/**
 * reCAPTCHA Enterprise verification via the REST "create assessment" API.
 * https://cloud.google.com/recaptcha/docs/create-assessment-website
 *
 * Passes only when the token is valid, was generated for the expected action
 * (so a token from one form can't be replayed on another) and scores >= MIN_SCORE.
 */
const MIN_SCORE = 0.5;

export interface RecaptchaResult {
  success: boolean;
  score?: number;
  error?: string;
}

interface AssessmentResponse {
  tokenProperties?: { valid?: boolean; invalidReason?: string; action?: string };
  riskAnalysis?: { score?: number; reasons?: string[] };
  error?: { message?: string };
}

export async function verifyRecaptcha(opts: {
  token: string | undefined;
  expectedAction: string;
  siteKey: string;
  apiKey: string;
  projectId: string | undefined;
}): Promise<RecaptchaResult> {
  // Bypass inside the local emulator.
  if (process.env.FUNCTIONS_EMULATOR === "true") {
    return { success: true, score: 1.0 };
  }

  const { token, expectedAction, siteKey, apiKey, projectId } = opts;
  if (!token) return { success: false, error: "Missing reCAPTCHA token" };
  if (!projectId) return { success: false, error: "reCAPTCHA project id not configured" };

  try {
    const url = `https://recaptchaenterprise.googleapis.com/v1/projects/${encodeURIComponent(projectId)}/assessments?key=${encodeURIComponent(apiKey)}`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event: { token, siteKey, expectedAction } }),
    });
    const json = (await res.json()) as AssessmentResponse;

    if (!res.ok) {
      return { success: false, error: json.error?.message ?? `Assessment failed (${res.status})` };
    }
    if (!json.tokenProperties?.valid) {
      return { success: false, error: `Invalid token: ${json.tokenProperties?.invalidReason ?? "unknown"}` };
    }
    if (json.tokenProperties.action !== expectedAction) {
      return { success: false, error: `Action mismatch: got "${json.tokenProperties.action}", expected "${expectedAction}"` };
    }
    const score = json.riskAnalysis?.score ?? 0;
    if (score < MIN_SCORE) {
      return { success: false, score, error: "Score below threshold" };
    }
    return { success: true, score };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "reCAPTCHA request failed",
    };
  }
}
