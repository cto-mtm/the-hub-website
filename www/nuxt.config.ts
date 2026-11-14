import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

// Ports are declared once in ports.json at the repo root (Node-side only).
const ports = JSON.parse(
  readFileSync(fileURLToPath(new URL('../ports.json', import.meta.url)), 'utf-8')
) as { app: { vite: number, tailscale: number } }
const tailscaleHost = process.env.TAILSCALE_HOST

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',

  devServer: {
    host: '0.0.0.0',
    port: ports.app.vite
  },

  vite: {
    server: {
      host: '0.0.0.0',
      port: ports.app.vite,
      strictPort: true,
      allowedHosts: true,
      hmr: tailscaleHost
        ? { protocol: 'wss', host: tailscaleHost, clientPort: ports.app.tailscale }
        : undefined
    }
  },
  devtools: { enabled: true, timeline: { enabled: true } },

  css: ['~/assets/css/main.css'],

  modules: [
    '@nuxt/content',
    '@nuxt/eslint',
    '@nuxt/image',
    '@nuxt/ui',
    '@nuxt/fonts',
    '@nuxtjs/seo',
    'nuxt-gtag',
    '@nuxtjs/i18n'
  ],

  i18n: {
    // Resolved relative to the i18n/ restructureDir, not the project root.
    vueI18n: './i18n.config.ts',
    defaultLocale: 'en',
    strategy: 'prefix_except_default',
    // Absolute hreflang URLs. Production origin, not a dev port.
    baseUrl: 'https://hublouisville.com',
    locales: [
      { code: 'en', language: 'en-US', name: 'English' },
      { code: 'es', language: 'es-ES', name: 'Español' }
    ],
    // Localized slugs. Spanish slugs match the old WordPress site exactly so those
    // URLs need no redirect; English drops the old /en/ prefix (301s below).
    customRoutes: 'config',
    pages: {
      'vip': { en: '/vip-service', es: '/servicio-vip' },
      'private-events': { en: '/private-events', es: '/eventos-privados' },
      'gallery': { en: '/gallery', es: '/galeria' },
      'contact': { en: '/contact', es: '/contacto' },
      'text': { en: '/text', es: '/text' },
      'latin-night': { en: '/latin-night', es: '/noche-latina' },
      'saturday-night': { en: '/saturday-night', es: '/sabado' }
    }
  },

  runtimeConfig: {
    public: {
      // Override at build time with NUXT_PUBLIC_SUBMIT_FORM_URL / NUXT_PUBLIC_RECAPTCHA_SITE_KEY.
      submitFormUrl: 'https://us-central1-the-hub-website.cloudfunctions.net/submitForm',
      // reCAPTCHA Enterprise site key (public by design; the secret side is the API key in Functions).
      recaptchaSiteKey: '6Le8Sh8uAAAAAE8oTTrbPH-hSHDlHvdRf9GF1Ezi'
    }
  },

  app: {
    pageTransition: { name: 'page', mode: 'out-in' }
  },

  // The prerender crawler follows links like /vip-service?night=fri as if they were
  // separate pages and reports them as 404s. They're the same static page (the form
  // reads the query on the client), so skip query-string links when crawling.
  nitro: {
    prerender: {
      ignore: [(path: string) => path.includes('?')]
    }
  },

  // Google Analytics loads only once a real ID is provided (NUXT_PUBLIC_GTAG_ID at build time).
  gtag: {
    enabled: !!process.env.NUXT_PUBLIC_GTAG_ID,
    id: process.env.NUXT_PUBLIC_GTAG_ID || ''
  },

  site: {
    url: 'https://hublouisville.com',
    name: 'The Hub Louisville',
    description: 'Louisville\'s late-night destination on Bardstown Road: local DJs, multiple dance floors, a patio, craft cocktails, VIP bottle service and private events.',
    defaultLocale: 'en'
  },

  colorMode: {
    preference: 'dark',
    fallback: 'dark'
  },

  image: {
    provider: 'none'
  },

  // Icons come from the installed @iconify-json packs and are bundled; no runtime API calls.
  icon: {
    provider: 'none',
    serverBundle: { collections: ['lucide', 'simple-icons'] },
    clientBundle: { scan: true, sizeLimitKb: 256 },
    fallbackToApi: false
  },

  ui: {
    theme: {
      colors: ['primary', 'secondary', 'accent', 'success', 'info', 'warning', 'error', 'neutral']
    }
  },

  routeRules: {
    // ────────────────────────────────────────────────────────────
    // LEGACY URL REDIRECTS
    // Add 301 redirects for old URLs from a prior site or domain
    // restructure. Keep this list in sync with /legacy_urls.md.
    //
    // Pattern A — single page:
    //   '/old-path': { redirect: { to: '/new-path', statusCode: 301 } },
    //
    // Pattern B — directory with wildcard:
    //   '/old-section/**': { redirect: { to: '/new-section', statusCode: 301 } },
    //
    // Pattern C — section merged into another:
    //   '/team': { redirect: { to: '/about#team', statusCode: 301 } },
    // ────────────────────────────────────────────────────────────

    // Old WordPress URLs (audited 2026-11-13 from page-sitemap.xml + a crawl).
    // Static hosting ignores these: the real 301s live in firebase/firebase.json
    // "redirects". These mirror them so `nuxt dev` behaves the same.
    '/en': { redirect: { to: '/', statusCode: 301 } },
    '/en/vip-service': { redirect: { to: '/vip-service', statusCode: 301 } },
    '/en/private-events': { redirect: { to: '/private-events', statusCode: 301 } },
    '/en/gallery': { redirect: { to: '/gallery', statusCode: 301 } },
    '/en/bottle-service-menu': { redirect: { to: '/bottle-service-menu.pdf', statusCode: 301 } },
    '/wp-content/uploads/2025/12/Bottle-Service-Menu.pdf': { redirect: { to: '/bottle-service-menu.pdf', statusCode: 301 } },
    '/feed': { redirect: { to: '/', statusCode: 301 } },
    '/page-sitemap.xml': { redirect: { to: '/sitemap_index.xml', statusCode: 301 } },
    '/wp-sitemap.xml': { redirect: { to: '/sitemap_index.xml', statusCode: 301 } }
  }
})
