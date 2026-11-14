<script setup lang="ts">
/**
 * Full-screen mobile navigation. Native <dialog> + showModal() gives focus
 * trapping, Esc to close and an inert page behind it with zero dependencies.
 * Open: a pink circle wipes out from the menu button, black follows it, then
 * the links rise in one by one. Close plays it in reverse.
 */
const open = defineModel<boolean>('open', { default: false })

const { t, locale } = useI18n()
const localePath = useLocalePath()
const switchLocalePath = useSwitchLocalePath()
const route = useRoute()

const dialog = ref<HTMLDialogElement | null>(null)
const closing = ref(false)
const tonight = ref<'latin' | 'saturday' | null>(null)
const otherLocale = computed(() => (locale.value === 'en' ? 'es' : 'en'))

const items = computed<{ key: string, label: string, to: string, sub?: string, night?: 'latin' | 'saturday' }[]>(() => [
  { key: 'latin', label: t('AppHeader.latinNightShort'), to: localePath('latin-night'), sub: t('AppHeader.everyFriday'), night: 'latin' },
  { key: 'saturday', label: t('AppHeader.saturdaysShort'), to: localePath('saturday-night'), sub: t('AppHeader.everySaturday'), night: 'saturday' },
  { key: 'vip', label: t('AppHeader.vip'), to: localePath('vip') },
  { key: 'private', label: t('AppHeader.privateEvents'), to: localePath('private-events') },
  { key: 'gallery', label: t('AppHeader.gallery'), to: localePath('gallery') },
  { key: 'contact', label: t('AppHeader.contact'), to: localePath('contact') }
])

const CLOSE_MS = 480
let closeTimer: ReturnType<typeof setTimeout> | undefined

function reducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function whichNightIsTonight() {
  const day = new Intl.DateTimeFormat('en-US', { timeZone: 'America/Kentucky/Louisville', weekday: 'short' }).format(new Date())
  return day === 'Fri' ? 'latin' : day === 'Sat' ? 'saturday' : null
}

function show() {
  const el = dialog.value
  if (!el || el.open) return
  clearTimeout(closeTimer)
  closing.value = false
  tonight.value = whichNightIsTonight()
  el.showModal()
  document.documentElement.style.overflow = 'hidden'
}

function finish() {
  dialog.value?.close()
  closing.value = false
  document.documentElement.style.overflow = ''
}

function hide() {
  if (!dialog.value?.open) return
  if (reducedMotion()) return finish()
  closing.value = true
  closeTimer = setTimeout(finish, CLOSE_MS)
}

watch(open, v => (v ? show() : hide()))
// Any navigation (including hash links and language switch) closes the menu.
watch(() => route.fullPath, () => { open.value = false })

onBeforeUnmount(() => {
  clearTimeout(closeTimer)
  document.documentElement.style.overflow = ''
})
</script>

<template>
  <dialog
    id="mobile-menu"
    ref="dialog"
    class="mobile-menu"
    :class="{ 'is-closing': closing }"
    :aria-label="t('AppHeader.menuTitle')"
    @cancel.prevent="open = false"
    @keydown.esc.prevent="open = false"
  >
    <div class="mm-wipe mm-wipe-pink" aria-hidden="true" />
    <div class="mm-wipe mm-wipe-night" aria-hidden="true" />

    <div class="mm-panel">
      <div class="flex items-center justify-between px-4 py-3 sm:px-8">
        <NuxtLink :to="localePath('index')" class="mm-fade" aria-label="The Hub Louisville">
          <img src="/images/logo.webp" alt="" width="72" height="72" class="size-14 invert sm:size-[72px]">
        </NuxtLink>
        <button
          type="button"
          class="mm-close flex size-14 items-center justify-center rounded-full bg-hub-400 text-night"
          :aria-label="t('AppHeader.closeMenu')"
          @click="open = false"
        >
          <UIcon name="i-lucide-x" class="size-6" />
        </button>
      </div>

      <nav class="flex-1 px-6 pt-6 sm:px-10" :aria-label="t('AppHeader.menuTitle')">
        <ul class="flex flex-col">
          <li v-for="(item, i) in items" :key="item.key" class="mm-item" :style="{ '--i': i }">
            <NuxtLink
              :to="item.to"
              class="group flex items-center gap-4 border-b border-white/10 py-3.5"
              :aria-current="route.path === item.to ? 'page' : undefined"
            >
              <span class="w-7 font-display text-sm tracking-[0.15em] text-hub-400">0{{ i + 1 }}</span>
              <span class="flex min-w-0 flex-1 flex-col">
                <span class="flex flex-wrap items-center gap-3">
                  <span class="mm-label font-display text-[clamp(28px,8vw,46px)] leading-none font-bold uppercase">{{ item.label }}</span>
                  <span v-if="item.night && tonight === item.night" class="mm-tonight rounded-full bg-hub-400 px-2.5 py-1 font-display text-xs font-semibold tracking-[0.12em] text-night uppercase">
                    {{ t('AppHeader.tonight') }}
                  </span>
                </span>
                <span v-if="item.sub" class="mt-1 text-sm text-[#a39fa8]">{{ item.sub }}</span>
              </span>
              <UIcon name="i-lucide-arrow-up-right" class="size-6 shrink-0 text-white/40 transition group-hover:text-hub-400 group-focus-visible:text-hub-400" />
            </NuxtLink>
          </li>
        </ul>
      </nav>

      <div class="mm-item flex flex-col gap-4 px-6 pt-8 pb-8 sm:px-10" :style="{ '--i': items.length }">
        <NuxtLink :to="localePath('vip')" class="btn-pill btn-pink w-full">
          {{ t('AppHeader.bookVip') }}
          <UIcon name="i-lucide-arrow-right" class="size-5" />
        </NuxtLink>
        <div class="flex items-center justify-between gap-4">
          <a :href="SITE.mapsUrl" target="_blank" rel="noopener" class="inline-flex min-h-11 items-center gap-2 text-sm text-[#c4c0c8] hover:text-white" @click="open = false">
            <UIcon name="i-lucide-map-pin" class="size-4 text-hub-400" />
            1133 Bardstown Rd
          </a>
          <NuxtLink :to="switchLocalePath(otherLocale)" :hreflang="otherLocale" class="inline-flex min-h-11 items-center font-display text-sm tracking-[0.12em] uppercase hover:text-hub-300">
            {{ t('AppHeader.switchLang') }}
          </NuxtLink>
        </div>
        <a :href="SITE.phoneHref" class="inline-flex min-h-11 items-center gap-2 font-display text-lg tracking-[0.08em] text-white hover:text-hub-300">
          <UIcon name="i-lucide-phone" class="size-5 text-hub-400" />
          {{ SITE.phone }}
        </a>
        <div class="flex gap-2">
          <a :href="SITE.instagram" target="_blank" rel="noopener" aria-label="Instagram" class="flex size-11 items-center justify-center rounded-full border border-white/15 hover:border-hub-400"><UIcon name="i-simple-icons-instagram" class="size-5" /></a>
          <a :href="SITE.facebook" target="_blank" rel="noopener" aria-label="Facebook" class="flex size-11 items-center justify-center rounded-full border border-white/15 hover:border-hub-400"><UIcon name="i-simple-icons-facebook" class="size-5" /></a>
          <a :href="SITE.yelp" target="_blank" rel="noopener" aria-label="Yelp" class="flex size-11 items-center justify-center rounded-full border border-white/15 hover:border-hub-400"><UIcon name="i-simple-icons-yelp" class="size-5" /></a>
        </div>
      </div>
    </div>
  </dialog>
</template>

<style scoped>
.mobile-menu {
  /* Circle origin = centre of the header's menu button (px-4/py-3, 56px button). */
  --origin: calc(100% - 44px) 40px;
  position: fixed;
  inset: 0;
  margin: 0;
  padding: 0;
  border: 0;
  width: 100vw;
  max-width: 100vw;
  height: 100dvh;
  max-height: 100dvh;
  background: transparent;
  color: #fff;
  overflow: hidden;
}
@media (min-width: 640px) {
  .mobile-menu { --origin: calc(100% - 60px) 48px; }
}
.mobile-menu::backdrop { background: transparent; }

.mm-wipe {
  position: absolute;
  inset: 0;
  clip-path: circle(0 at var(--origin));
}
.mm-wipe-pink { background: var(--color-hub-400); }
.mm-wipe-night { background: #0a0a0b; }

.mm-panel {
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow-y: auto;
  overscroll-behavior: contain;
}

/* ── Open ── */
.mobile-menu[open] .mm-wipe-pink { animation: mm-grow 0.5s cubic-bezier(0.7, 0, 0.2, 1) forwards; }
.mobile-menu[open] .mm-wipe-night { animation: mm-grow 0.55s cubic-bezier(0.7, 0, 0.2, 1) 0.09s forwards; }
.mobile-menu[open] .mm-close { animation: mm-spin-in 0.45s cubic-bezier(0.2, 0.8, 0.2, 1) both; }
.mobile-menu[open] .mm-fade { animation: mm-fade-in 0.4s ease 0.25s both; }
.mobile-menu[open] .mm-item {
  animation: mm-rise 0.55s cubic-bezier(0.2, 0.8, 0.2, 1) both;
  animation-delay: calc(0.22s + var(--i) * 0.055s);
}
.mobile-menu[open] .mm-tonight { animation: mm-pulse 1.6s ease-in-out 0.9s infinite; }

/* ── Close: same wipe in reverse, links drop out fast ── */
.mobile-menu.is-closing .mm-wipe-night { animation: mm-shrink 0.42s cubic-bezier(0.7, 0, 0.2, 1) forwards; }
.mobile-menu.is-closing .mm-wipe-pink { animation: mm-shrink 0.42s cubic-bezier(0.7, 0, 0.2, 1) 0.06s forwards; }
.mobile-menu.is-closing .mm-item,
.mobile-menu.is-closing .mm-fade { animation: mm-drop 0.18s ease forwards; }
.mobile-menu.is-closing .mm-close { animation: mm-spin-out 0.3s ease forwards; }

/* Link hover: label slides and turns pink */
.mm-label { display: inline-block; transition: transform 0.25s ease, color 0.25s ease; }
a:hover .mm-label, a:focus-visible .mm-label, a[aria-current='page'] .mm-label { color: var(--color-hub-400); transform: translateX(6px); }
a:focus-visible { outline: 2px solid #fff; outline-offset: 4px; }

@keyframes mm-grow { from { clip-path: circle(0 at var(--origin)); } to { clip-path: circle(150% at var(--origin)); } }
@keyframes mm-shrink { from { clip-path: circle(150% at var(--origin)); } to { clip-path: circle(0 at var(--origin)); } }
@keyframes mm-rise { from { opacity: 0; transform: translateY(32px); } to { opacity: 1; transform: none; } }
@keyframes mm-drop { to { opacity: 0; transform: translateY(12px); } }
@keyframes mm-fade-in { from { opacity: 0; } to { opacity: 1; } }
@keyframes mm-spin-in { from { transform: rotate(-90deg) scale(0.6); } to { transform: none; } }
@keyframes mm-spin-out { to { transform: rotate(90deg) scale(0.6); opacity: 0; } }
@keyframes mm-pulse { 0%, 100% { box-shadow: 0 0 0 0 rgb(232 51 122 / 0.6); } 50% { box-shadow: 0 0 0 8px rgb(232 51 122 / 0); } }

@media (prefers-reduced-motion: reduce) {
  .mobile-menu .mm-wipe { clip-path: none; animation: none !important; }
  .mobile-menu .mm-wipe-pink { display: none; }
  .mobile-menu .mm-item, .mobile-menu .mm-fade, .mobile-menu .mm-close, .mobile-menu .mm-tonight { animation: none !important; }
}
</style>
