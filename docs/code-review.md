# Code Review — The Hub Louisville Website

How to review the pending changes. The subject is **the diff**, not the whole
site: `git diff` (unstaged) + `git diff --staged` + untracked files
(`git status --porcelain`). If the work spans commits, use
`git diff <base>...HEAD`. Start from `git diff --stat` to get the shape, then
read every changed file in full — a diff hunk without its surrounding file lies
about context.

This is a static Nuxt 4 marketing site plus one Cloud Function, `submitForm`,
behind the contact / VIP / private-event forms (see `docs/architecture.md`).
Most real defects here are **wrong facts** (hours, DJs, address, prices),
**broken i18n**, **off-brand styling** and **form/email mistakes** — review
with that weighting.

## 1. DRY

- Does the new code duplicate something that already exists? Before accepting a
  new component, composable or CSS class, grep for a sibling: `InquiryForm`,
  `NightLanding`, `PolaroidCard`, `BrandBand`, `BrandIcon`, `BubbleField`,
  `StickyBookBar`, `useReveal`, `useParallax`, `.glow-card`, `.neon-red`,
  `.bg-club`, `.reveal`, `.depth-*`, `.edge-slant-*`.
- Brand colours and fonts are defined ONLY in `www/app/assets/css/main.css`
  (`@theme`: `hub-*`, `night*`, `cream`, Oswald / Inter / Yellowtail) and mapped
  to Nuxt UI in `www/app/app.config.ts`. A raw hex value or an arbitrary
  `shadow-[…]` in a template is a DRY violation — use the token.
- Venue facts have one home each: address, phone, socials and email in
  `www/app/utils/site.ts` (`SITE`); nights, hours and DJ lineups in
  `www/app/utils/nights.ts` (`NIGHTS`); image paths through `img()` / `ogImg()`.
  A phone number or address typed into a template is a finding.
- One form component serves all three forms. A second form component, or a
  second `fetch` to `submitForm` outside `useSubmitForm`, is a finding.
- Repeated Tailwind class strings across several pages that belong in a
  `main.css` class count. Two copies is a watch-list item; three is a finding.
- **Intentional duplication, do NOT flag:**
  - form fields in `InquiryForm.vue` and the zod schemas in
    `firebase/functions/src/models.ts` (browser and backend validate
    separately, on purpose),
  - the reCAPTCHA site key in `www/nuxt.config.ts` and `submitForm.ts`,
  - legacy redirects in `firebase/firebase.json` (the real 301s) and
    `routeRules` in `nuxt.config.ts` (dev mirror), tracked in `legacy_urls.md`,
  - venue facts repeated in `www/public/llms.txt`.

  DO flag a diff that changes **one** copy and not the others — see § 6.

## 2. Elegance / simplicity

- Is this the simplest change that solves the problem? Flag detours:
  client-side JS for something CSS already does, state that mirrors existing
  state, a composable wrapping a single `useRuntimeConfig()` read.
- Does it read like the surrounding code? Same page rhythm, same `useSeoMeta`
  pattern, same `{ en, es }` locale module shape, the same early-return style
  in `submitForm.ts`. A correct change in a foreign style is a finding.
- Prefer native elements and browser APIs: `<details>` for disclosures,
  `<input type="date">`, `<a href="tel:">` / `sms:` / `mailto:` for contact.

## 3. Overengineering

- Abstractions need ≥2 real consumers **in this diff or already in the tree**.
  A generic section builder, props for variants nothing uses, or config for a
  page that exists once is a finding.
- The backend is one function. A database, a second function, auth, a queue or
  storing submissions added without an explicit request is a finding.
- New dependencies need a reason the existing stack (Nuxt UI, Iconify lucide /
  simple-icons, `@nuxt/content`, native CSS, zod) can't cover. Animation or UI
  libraries are almost never justified here. In `firebase/functions`, a
  second mail path next to nodemailer + the client's Gmail is a guardrail hit,
  not a judgement call (§ 6).

## 4. Dead code & stale files

Check both directions:

- **Introduced by the diff:** components never rendered, i18n keys never
  resolved, CSS classes nothing uses, public files nothing references,
  commented-out blocks, `console.log` leftovers, ownerless TODOs.
- **Orphaned by the diff:** if the change replaces something, did the old
  version go? A removed page whose nav/footer link, locale module, localized
  slug in `nuxt.config.ts`, `llms.txt` line or redirect stays behind is
  incomplete. A removed form type whose `models.ts` entry or `InquiryForm`
  branch stays behind is too.

Verify before flagging (grep, don't guess):

1. Pages → routes come from `www/app/pages/` filenames, with localized slugs in
   `i18n.pages` (`nuxt.config.ts`); grep the route name in `localePath('…')`
   calls (header, footer, mobile menu, other pages).
2. Components → Nuxt auto-imports by path, so grep the **tag name**
   (`<InquiryForm`, `<NightLanding`, `<PolaroidCard`) as well as explicit
   `import` lines.
3. i18n keys → grep the key path in `www/app/`; some are read as lists with
   `tm()` / `rt()` (`Forms.occasions`, `IndexPage.vipRules`), so check those
   before calling a key dead. New locale modules must be registered in
   `www/i18n/i18n.config.ts`.
4. Public assets → grep the filename under `www/app/` and `www/content/`.
   Originals live in `assets-src/images/` and are never deployed.
5. Docs → if the diff changes behaviour `README.md`, `CLAUDE.md`,
   `docs/architecture.md` or `legacy_urls.md` describes, they're stale.

## 5. Checks this change needs

There is no automated test suite; the deploy script's only gate is the
functions compile. The review therefore names the **manual** check each change
needs — it doesn't claim them done:

| The diff touches… | Then the review requires… |
|---|---|
| Any user-facing string | Key present in **both** `en` and `es`; `{'@'}` for `@`, no bare `\|` (vue-i18n plural separator). |
| A new page or link | Works in both locales with its localized slug (`/vip-service` and `/es/servicio-vip`), and switching language on it keeps you on the same page. |
| Layout or a new section | Phone width (375px) without horizontal scroll, touch targets ≥ 44px, keyboard focus visible, text contrast on the dark background. |
| An animation | Only `transform` / `opacity`; disabled under `prefers-reduced-motion`; content still visible if the reveal never fires. |
| `firebase/functions/src/**` | `npx tsc --noEmit` in `firebase/functions` passes. |
| A form field or `models.ts` | Field exists in **both** `InquiryForm.vue` and the zod schema, with the same name and required/optional status; submit each affected form once against the emulator (mail is skipped there) and confirm a 200. |
| Email templates or `transporter.sendMail` calls | Notification `to` is the hardcoded `notifyEmail` with the visitor in `replyTo`; every interpolated value goes through `escapeHtml`; header values (subject) have CR/LF stripped. `npm run preview:emails` to look at the result. |
| Venue facts (hours, DJs, address, phone, prices) | `SITE` / `NIGHTS`, the i18n copy, the schema.org JSON-LD and `public/llms.txt` all agree. |
| A URL or slug change | 301 added in `firebase/firebase.json`, mirrored in `routeRules`, recorded in `legacy_urls.md`. |
| `nuxt.config.ts`, content, routes | `npm run generate` succeeds (prerenders both locales — a broken link or a 404 thrown during prerender fails here). |
| `scripts/deploy.mjs` | `npm run deploy:dry-run` prints the expected steps for the default run and for `--only-hosting` / `--only-functions`. |

Also check the inverse: a guard **removed or weakened** (reCAPTCHA
verification, the honeypot, the CORS allow-list, zod validation, the deploy
script's `REPLACE_ME` check) is a finding unless the diff says why.

## 6. Guardrails (quick pass, always)

Scan the diff for these — from `CLAUDE.md`. Any hit is automatically HIGH:

- A hardcoded user-facing string (must be an i18n key in **both** `en` and
  `es`).
- An internal link not built with `localePath()` (`to="/gallery"`,
  `href="/contact"`) — it silently drops Spanish visitors into English.
  Markdown links inside `www/content/` are the one exception.
- A hardcoded port. Every port comes from `ports.json`; browser code and
  Cloud Functions never import it.
- **Untrusted input in an email's `to`.** Form notifications go to the
  hardcoded `notifyEmail` in `models.ts`. The only mail sent to a
  visitor-typed address is the confirmation; a new send to a typed address,
  or a confirmation that grows beyond a copy of the submission, is a finding.
- Email sent any other way than the transporter in
  `firebase/functions/src/helpers/mailer.ts` (nodemailer over the client's
  Gmail). This is a client project: wiring it into MTM's mtmcya-mailer, SES or
  any MTM-owned sender is a finding.
- Marketing, newsletter or bulk mail (e.g. the text-list signup) sent through
  the Gmail account — Gmail caps daily sends and will lock the client's
  mailbox.
- Personal data in logs: a name, email, phone or message passed to `logger`.
  Log `formType`, status and error codes only.
- A secret in the repo (Gmail app password, reCAPTCHA API key, any token).
  They live in Firebase secrets; `.env` files are git-ignored.
- A form, or a `submitForm` branch, that skips reCAPTCHA, the honeypot or zod
  validation.
- A new form or interactive control without WebMCP annotations
  (`toolname` / `tooldescription` / `toolparamdescription`).
- **A claim the venue can't back.** Hours, cover charges, VIP rules, DJ
  lineups, drink prices and event availability come from the client — never
  invented or "improved" in copy. If the diff changes one and doesn't say where
  the new fact came from, ask.
- A venue fact changed in one place and not the others (§ 1, § 5).
- A changed or removed URL with no 301 — the old WordPress URLs still have
  search traffic.
- Off-brand styling: light backgrounds on a page section, the old yellow
  accent, colours outside the `hub-*` / `night*` tokens, Yellowtail on body
  text, Oswald on long paragraphs.
- Legacy bloat: a polyfill or library for something the platform already does.

## Output format

1. **Blocking** — guardrail hits and missing required checks. file:line + what
   to do.
2. **DRY / simplification / overengineering** — ranked HIGH/MEDIUM/LOW with the
   suggested shape of the fix.
3. **Dead code & stale files/docs** — table: path, status (dead / orphaned /
   stale doc), evidence (the grep that proved it).
4. **Checks to run** — which rows of § 5 apply, and which were actually done
   (say so plainly when they weren't).
5. **Watch list** — fine today, worth a note (e.g. a second copy of a class
   string that becomes a DRY violation on the third).

Keep it concise and actionable. Identify problems and point at the fix — the
review is not the place to redesign the site.
