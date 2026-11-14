# Boilerplate Co — Web Boilerplate

## What's in the box

- `www/` — Nuxt 4 marketing site (Nuxt UI, Content, i18n, SEO, Image)
- `firebase/` — Firebase Hosting config + Cloud Functions (`submitForm` for forms)
- `docs/architecture.md` — how the pieces fit together

## Quick start

```bash
cd www && npm install && npm run dev          # marketing site on app.vite from ports.json
cd ../firebase/functions && npm install        # cloud functions deps
npm run build                                  # compile functions
firebase emulators:start --only functions      # forms backend locally
```

## Routing Note

All internal app navigation uses `@nuxtjs/i18n`. Use `localePath()` to ensure language preferences persist across page loads.

```vue
<NuxtLink :to="localePath('contact')">Contact</NuxtLink>
```

## Image Optimization

Run `npm run optimize:images` in `www/` to batch convert `public/images/` content to `.webp`.
Use `npm run optimize:images -- --dry-run` to preview.

## Adding a new form type

1. Edit `firebase/functions/src/models.ts` and add a new entry to `formConfigs` (zod schema, notify email, subjects).
2. Redeploy functions: `npm run deploy -- --only-functions` from the repo root.
3. Call `useSubmitForm('your-type', { ... })` from the site.

## Adding a legacy redirect

Add the 301 to `hosting.redirects` in `firebase/firebase.json` (the real one, since the site is static), mirror it in `routeRules` in `www/nuxt.config.ts` for dev, then record it in `legacy_urls.md`.

## Required secrets (before deploying functions)

```bash
firebase functions:secrets:set RECAPTCHA_API_KEY
```

### Email (mtmcya-mailer)

Forms send through **mtmcya-mailer** — no SMTP, no Gmail app password. See
`docs/mtmcya-mailer.md`. `firebase/functions/.env` (committed) holds
`MAILER_URL`. After the first functions deploy, a mailer admin onboards the
project from the `mtmcya-mailer` repo; until then sends are refused with `403`.

### reCAPTCHA Enterprise

The forms use **reCAPTCHA Enterprise** (score-based, invisible).

- **Site key** (public): `6Le8Sh8uAAAAAE8oTTrbPH-hSHDlHvdRf9GF1Ezi`, set in `www/nuxt.config.ts` (`runtimeConfig.public.recaptchaSiteKey`) and in `firebase/functions/src/submitForm.ts`.
- **API key** (secret, `RECAPTCHA_API_KEY`): Google Cloud console → APIs & Services → Credentials → Create API key, restricted to the *reCAPTCHA Enterprise API*.
- **Project**: assessments are created in the Google Cloud project that owns the key. It defaults to the Firebase project; if the key lives elsewhere, add `RECAPTCHA_PROJECT_ID=<project-id>` to `firebase/functions/.env`.
- In the reCAPTCHA key settings, add the domains `hublouisville.com` and `www.hublouisville.com` (and your dev/Tailscale host for testing).
- Each form sends its own action (`vip`, `private_event`, `contact`); the backend rejects a token whose action doesn't match, or that scores below 0.5.

## Deploy notes

Firebase project: **`the-hub-website`** (set in `firebase/.firebaserc`, next to `firebase.json`, so run the CLI from `firebase/`).

1. **Secrets (once):** from `firebase/`, set `RECAPTCHA_API_KEY` (above). Email needs none.
2. **Deploy:** from the repo root, after `npm install` in `www/` and `firebase/functions/`:

   ```bash
   npm run deploy                        # hosting + functions
   npm run deploy -- --only-hosting      # site only
   npm run deploy -- --only-functions    # submitForm only
   npm run deploy:dry-run                # print every step, change nothing
   ```

   `scripts/deploy.mjs` is the only deploy path: it refuses to run while `firebase/.firebaserc` holds a `REPLACE_ME` id or
   `firebase/functions/.env` lacks `MAILER_URL`, compiles the functions, runs `nuxt generate`, copies `www/.output/public`
   to `firebase/www/`, deploys from `firebase/`, and logs the run in the git-ignored `deploys/LEDGER.md`.
   The form endpoint is `https://us-central1-the-hub-website.cloudfunctions.net/submitForm` (already set as the site's `submitFormUrl`).
3. **Mailer access (once, after the first functions deploy):** onboard the project from the `mtmcya-mailer` repo
   (`node scripts/onboard-project.mjs the-hub-website --from=… --apply`). Until then form submissions fail with a 502.
   Test on `https://the-hub-website.web.app` first (it's an allowed form origin), then point `hublouisville.com` at Hosting.
4. **reCAPTCHA domains:** the key currently allows `hublouisville.com` (subdomains included). Add `the-hub-website.web.app` in the key settings if you want forms to pass reCAPTCHA on the preview domain.
5. **Analytics (optional):** build with `NUXT_PUBLIC_GTAG_ID=G-XXXX` to turn on Google Analytics; without it no tag loads.

## Keeping dependencies fresh

Versions in `package.json` are pinned to the dates this boilerplate was
generated. They're intentionally NOT auto-updated on install — the goal is
that `npm install && npm run dev` always works on day one.

Recommended workflow when starting a new project from this scaffold:

1. `npm install` in both `www/` and `firebase/functions/` and confirm
   `npm run dev` boots cleanly.
2. Commit the scaffold as your baseline (`git commit -m "initial scaffold"`).
3. Run `npm outdated` in each folder to see drift, and `npm audit` for
   security issues.
4. Upgrade deliberately — one major version at a time, testing between each.
   Watch especially for breaking changes in Nuxt, Nuxt UI, Firebase
   Functions, and zod (these have all shipped breaking majors in the past).
5. After upgrading, re-run `npm run dev` and click through the key pages /
   submit the contact form before committing.

Avoid running `npm update` blindly — it will pull breaking majors without
warning and you'll lose the "clean baseline" property.
