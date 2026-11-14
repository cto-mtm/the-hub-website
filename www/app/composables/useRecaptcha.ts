/**
 * reCAPTCHA Enterprise (score-based), loaded lazily the first time someone
 * interacts with a form, so no script runs on page load. The site key is public
 * by design (NUXT_PUBLIC_RECAPTCHA_SITE_KEY overrides it). Returns undefined when
 * no key is set, which the Functions emulator accepts for local testing.
 */
declare global {
  interface Window {
    grecaptcha?: {
      enterprise: {
        ready: (cb: () => void) => void
        execute: (key: string, opts: { action: string }) => Promise<string>
      }
    }
  }
}

let loading: Promise<void> | null = null

export function useRecaptcha() {
  const siteKey = useRuntimeConfig().public.recaptchaSiteKey as string | undefined

  function load() {
    if (!siteKey || import.meta.server) return Promise.resolve()
    loading ??= new Promise<void>((resolve, reject) => {
      const s = document.createElement('script')
      s.src = `https://www.google.com/recaptcha/enterprise.js?render=${encodeURIComponent(siteKey)}`
      s.async = true
      s.onload = () => resolve()
      s.onerror = () => { loading = null; reject(new Error('reCAPTCHA failed to load')) }
      document.head.appendChild(s)
    })
    return loading
  }

  /** `action` must match what the backend expects for this form (e.g. "vip", "private_event", "contact"). */
  async function token(action: string): Promise<string | undefined> {
    if (!siteKey) return undefined
    await load()
    const g = window.grecaptcha?.enterprise
    if (!g) return undefined
    await new Promise<void>(r => g.ready(r))
    return g.execute(siteKey, { action })
  }

  return { load, token }
}
