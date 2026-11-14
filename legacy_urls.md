# Legacy URL map

Every URL from the old WordPress site (hublouisville.com) and where it lives now.
Audited 2026-11-13 from `/page-sitemap.xml` (Yoast) plus a crawl of every page's internal links.

**Where redirects live:** the site is generated statically, so real HTTP 301s come from
`firebase/firebase.json` → `hosting.redirects`. The `routeRules` block in `www/nuxt.config.ts`
mirrors them for `nuxt dev`. Keep all three in sync.

`firebase.json` also sets `"trailingSlash": false`, so every old URL with a trailing slash
(`/es/galeria/`) 301s once to its slash-less form (`/es/galeria`).

## Pages

| Old URL | New URL | How | Notes |
| --- | --- | --- | --- |
| `/` | `/` | Same URL | English home |
| `/en/` | `/` | 301 | Already 301'd to `/` on the old site |
| `/es/` | `/es` | Same URL | Spanish home |
| `/en/vip-service/` | `/vip-service` | 301 | Same slug, `/en/` prefix dropped |
| `/es/servicio-vip/` | `/es/servicio-vip` | Same URL | Localized slug via i18n `pages` config |
| `/en/private-events/` | `/private-events` | 301 | |
| `/es/eventos-privados/` | `/es/eventos-privados` | Same URL | |
| `/en/gallery/` | `/gallery` | 301 | Gallery page rebuilt |
| `/es/galeria/` | `/es/galeria` | Same URL | |
| `/text/` | `/text` | Same URL | Klaviyo SMS birthday signup (form `VTSG6G`). Likely on QR codes / bio links — never move it |
| `/vip-service/`, `/private-events/`, `/gallery/` | same, no slash | Same URL | Old site served these too (canonical pointed at `/en/…`) |
| `/en/bottle-service-menu/` | `/bottle-service-menu.pdf` | 301 | Old URL 301'd to a PDF in wp-content; now served from `www/public/bottle-service-menu.pdf` |
| `/wp-content/uploads/2025/12/Bottle-Service-Menu.pdf` | `/bottle-service-menu.pdf` | 301 | Direct PDF link people may have shared |
| `/en/*` (anything else) | `/*` | 301 | Catch-all for any `/en/` URL not listed |
| `/feed/`, `/es/feed/` | `/`, `/es` | 301 | WordPress RSS feed, no equivalent |
| `/sitemap_index.xml` | `/sitemap_index.xml` | Same URL | Yoast used this name too; Nuxt SEO now serves it (split en-US / es-ES with hreflang) |
| `/page-sitemap.xml`, `/wp-sitemap.xml`, `/sitemap.xml` | `/sitemap_index.xml` | 301 | Firebase only; in `nuxt dev` the sitemap module answers `.xml` paths itself |

## New pages (no old equivalent)

| URL | Notes |
| --- | --- |
| `/contact`, `/es/contacto` | Contact form |
| `/latin-night`, `/es/noche-latina` | Friday Latin Night landing page (Event + FAQPage schema) |
| `/saturday-night`, `/es/sabado` | Saturday club night landing page (Event + FAQPage schema) |
| `/llms.txt` | Plain-text fact sheet for AI assistants. Update it when hours, nights or VIP rules change |

Event dates in the structured data are computed at build time (next 4 weeks). Redeploy at least weekly,
for example a scheduled CI job, so the upcoming dates never go stale. The recurring `eventSchedule` stays valid regardless.

## Deliberately not redirected (404 is the correct signal)

| Old URL pattern | Why |
| --- | --- |
| `/wp-admin/*`, `/wp-login.php`, `/wp-json/*` | WordPress internals, never indexed |
| `/wp-content/uploads/*` (images) | Old image files. Redirecting images to pages is treated as a soft 404. If image search traffic matters, re-host the gallery photos and add specific redirects |
| `/?s=…` | WordPress search, no equivalent |

## Before launch

1. Deploy to a Firebase preview channel and run every "Old URL" above through `curl -I` — expect a single 301 or a 200.
2. After DNS switches: submit the new `/sitemap.xml` in Google Search Console and watch Pages → "Not found (404)" for two weeks.
