export interface SubmitFormResult {
  success: boolean
  error?: string
}

const FALLBACK_URL = 'https://us-central1-the-hub-website.cloudfunctions.net/submitForm'

/**
 * POSTs a form to the submitForm Cloud Function.
 * Never throws — errors are returned via the result object.
 */
export async function useSubmitForm(
  formType: string,
  data: Record<string, unknown>,
  recaptchaToken?: string
): Promise<SubmitFormResult> {
  const configured = useRuntimeConfig().public.submitFormUrl as string | undefined
  const url = configured && configured !== 'REPLACE_ME' ? configured : FALLBACK_URL

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ formType, data, recaptchaToken })
    })
    const body = await res.json().catch(() => ({})) as { success?: boolean, error?: unknown }

    if (!res.ok || !body.success) {
      const error = typeof body.error === 'string' ? body.error : `Request failed (${res.status})`
      return { success: false, error }
    }
    return { success: true }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Network error' }
  }
}
