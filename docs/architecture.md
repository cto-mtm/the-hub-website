# Architecture

## Overview

- **Site:** `www/` is a Nuxt 4 marketing site. It is generated statically and the output is placed in `firebase/www/`.
- **Hosting:** Firebase Hosting serves `firebase/www/` (`hosting.public` is `"www"` in `firebase/firebase.json`, relative to the `firebase/` folder). Because that folder is a build artifact it is git-ignored.
- **Forms:** The static site POSTs JSON `{ formType, data, recaptchaToken }` to the `submitForm` Cloud Function (v2 `onRequest`, `us-central1`). The function only accepts requests from the CORS allow-list in `submitForm.ts` — update it with your real domains.
- **Validation:** `models.ts` maps each `formType` to a zod schema plus email settings.
- **Spam protection:** reCAPTCHA v3 tokens are verified server-side (min score 0.5; bypassed in the emulator).
- **Email:** nodemailer over the client's Gmail (SMTP with an app password) sends a notification to the team and, when the submission has an `email`, a confirmation to the sender. This is a client project, so it uses the client's own Gmail account — not MTM's shared mtmcya-mailer.
- **Secrets:** `GMAIL_USER`, `GMAIL_APP_PASSWORD`, `GMAIL_SENDER`, `RECAPTCHA_API_KEY` (reCAPTCHA Enterprise) live in Firebase secrets (never in the repo).
- **Deploy:** `npm run deploy` (`scripts/deploy.mjs`) is the only deploy path — see `README.md`.
- **Content:** Markdown content lives in `www/content/` and is managed by `@nuxt/content` (see `content.config.ts`).

## Routing & i18n (important)

The site uses `@nuxtjs/i18n` (English default, Spanish secondary). When creating any new page:

1. Create the page in `www/app/pages/`.
2. Add translations in `www/i18n/locales/` and register them in `www/i18n/i18n.config.ts`.
3. **Always** link with `localePath()` — never hardcode paths in `<NuxtLink to="...">` — so the user's selected language persists.

## Legacy URLs

Real 301s live in `firebase/firebase.json` (`hosting.redirects`) because the site is static; `routeRules` in `www/nuxt.config.ts` mirrors them for dev. Both are tracked in `legacy_urls.md`.
