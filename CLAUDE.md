# The Hub Louisville

Nightclub website (1133 Bardstown Rd, Louisville, KY). Dark neon theme, EN/ES.

## Project Structure

- `www/` — Nuxt 4 marketing website (static assets in `www/public/`: `images/`, `videos/`, `bottle-service-menu.pdf`)
- `firebase/` — Firebase Hosting config + Cloud Functions
- `docs/` — Internal documentation (`architecture.md`; read `code-review.md` before reviewing any diff)
- `scripts/deploy.mjs` — the only deploy path (`npm run deploy`): guard → compile functions → generate → stage into `firebase/www/` → deploy → `deploys/LEDGER.md`. Flags: `--only-hosting`, `--only-functions`, `--dry-run`.
- `legacy_urls.md` — old WordPress URL → new URL map; real 301s live in `firebase/firebase.json`
- `ports.json` — the only source of dev ports
- `assets-src/images/` — full-size originals (not deployed). Site serves WebP from `www/public/images/` (`img()`), 1200×630 JPG share cards from `www/public/images/og/` (`ogImg()`)

## Email

This is a client project, so form email goes out through **the client's own
Gmail** (nodemailer + app password, secrets `GMAIL_USER` / `GMAIL_APP_PASSWORD`
/ `GMAIL_SENDER`) — **not** MTM's shared mtmcya-mailer. Don't wire it into the
mailer. Notifications go to the hardcoded `notifyEmail` in `models.ts` with the
visitor in `replyTo`; no personal data in logs.

## Development

- Never hardcode a port; every port comes from `ports.json` (repo root); browser code never imports it.
- **Do not** run `nuxi build`, `npm run build`, or any build commands unless explicitly asked.
- **Do not** prompt the user asking if they would like to run a build.
- The dev server (`npm run dev`) is managed by the user separately.
- Use `npm` as the package manager (not yarn or pnpm).

## Nuxt & i18n Guardrails
- **Internationalized Routing:** NEVER hardcode standard links (e.g., `<NuxtLink to="/about">`). You must ALWAYS use `localePath()` for internal navigation (e.g., `<NuxtLink :to="localePath('about')">`) so the i18n module can correctly route users based on their active language.

## Agent Guidance (Modern Web Standards)
- **Zero Legacy Bloat:** You must prioritize modern, native browser APIs over legacy libraries or polyfills. 
- **WebMCP:** When building forms or interactive components, utilize WebMCP annotations (Declarative API) so the site's features are exposed as structured tools for browser-based AI agents.
