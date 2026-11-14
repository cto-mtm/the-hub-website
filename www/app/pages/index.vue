<script setup lang="ts">
const { t, tm, rt, locale } = useI18n()
const localePath = useLocalePath()
const switchLocalePath = useSwitchLocalePath()
useSeoMeta({
  title: () => t('IndexPage.metaTitle'),
  description: () => t('IndexPage.tagline')
})
useReveal()
useParallax()

const otherLocale = computed(() => (locale.value === 'en' ? 'es' : 'en'))
const eventsAnchor = computed(() => ({ path: localePath('index'), hash: '#events' }))
// Every "reserve" CTA lands on the form itself, not the top of the VIP page.
const vipForm = computed(() => ({ path: localePath('vip'), hash: '#request' }))

const facts = ['open', 'vipArrival', 'private', 'entry'] as const

const events = [
  { key: 'latin', image: NIGHTS.latin.image, route: NIGHTS.latin.route, alt: 'Latin Night flyer: Friday nights, resident DJs All Sensation' },
  { key: 'saturday', image: NIGHTS.saturday.image, route: NIGHTS.saturday.route, alt: 'Saturday Dance Party flyer, The Hub Louisville' }
]

const ways = computed(() => [
  { key: 'w1', to: eventsAnchor.value, featured: false, photo: photo('32'), icon: 'turntable' as const },
  { key: 'w2', to: localePath('vip'), featured: true, photo: photo('11'), icon: 'bottle' as const },
  { key: 'w3', to: localePath('private-events'), featured: false, photo: photo('40'), icon: 'balloon' as const }
])

const perks = [
  { key: 'p1', icon: 'ticket' as const },
  { key: 'p2', icon: 'bell' as const },
  { key: 'p3', icon: 'bottle' as const },
  { key: 'p4', icon: 'balloon' as const }
]
const vipRules = computed(() => (tm('IndexPage.vipRules') as unknown[]).map(r => rt(r as Parameters<typeof rt>[0])))
const privatePoints = ['pe1', 'pe2', 'pe3'] as const

const gallery = ['25', '13', '22', '02', '33', '29'].map(id => photo(id))
const heroPhoto = photo('34')
// VIP polaroid stack: three layers that scroll at different speeds.
const vipStack = computed(() => [
  // Fanned so every caption stays visible; the middle card sits on top.
  { photo: photo('24'), caption: t('Brand.polaroid.parade'), tilt: -7, speed: 0.3, cls: 'left-[2%] top-[2%] w-[44%] z-10' },
  { photo: photo('23'), caption: t('Brand.polaroid.crew'), tilt: 3, speed: 0.55, cls: 'left-[28%] top-[18%] w-[44%] z-20' },
  { photo: photo('14'), caption: t('Brand.polaroid.booth'), tilt: 8, speed: -0.2, cls: 'right-[2%] top-[4%] w-[42%] z-0' }
])
const textList = computed(() => localePath('text'))

// The hero video is a landscape 1280px clip: sharp on wide screens, a blurry crop on phones.
// Phones, reduced-motion users and Data Saver / slow connections get the still photo
// and never download the 3.5 MB video. Everyone else gets a pause button (WCAG 2.2.2).
const playVideo = ref(false)
const heroVideo = ref<HTMLVideoElement | null>(null)
const videoPaused = ref(false)
onMounted(() => {
  const conn = (navigator as Navigator & { connection?: { saveData?: boolean, effectiveType?: string } }).connection
  const slow = !!conn?.saveData || /(^|-)2g|3g/.test(conn?.effectiveType ?? '')
  playVideo.value = window.matchMedia('(min-width: 640px)').matches
    && !window.matchMedia('(prefers-reduced-motion: reduce)').matches
    && !slow
})
function toggleVideo() {
  const v = heroVideo.value
  if (!v) return
  if (v.paused) {
    v.play()
    videoPaused.value = false
  } else {
    v.pause()
    videoPaused.value = true
  }
}
</script>

<template>
  <div class="bg-night text-[#f4f2f3]">
    <!-- ========== HERO (kept from the live site, accent now pink) ========== -->
    <header class="relative flex min-h-[100svh] flex-col overflow-hidden bg-[#07070d]">
      <img
        :src="heroPhoto.src"
        :srcset="heroPhoto.srcset"
        sizes="100vw"
        alt=""
        fetchpriority="high"
        class="absolute inset-0 h-full w-full object-cover"
      >
      <video
        v-if="playVideo"
        ref="heroVideo"
        class="absolute inset-0 h-full w-full object-cover"
        src="/videos/hero.mp4"
        :poster="heroPhoto.src"
        autoplay
        muted
        loop
        playsinline
        aria-hidden="true"
      />
      <div class="absolute inset-0 bg-[linear-gradient(180deg,rgb(0_0_0/0.6)_0%,rgb(0_0_0/0.3)_25%,rgb(0_0_0/0.72)_55%,rgb(0_0_0/0.85)_85%,#0a0a0b_100%)]" aria-hidden="true" />
      <BubbleField :density="2.2" />
      <button
        v-if="playVideo"
        type="button"
        class="absolute right-4 bottom-24 z-20 flex size-11 items-center justify-center rounded-full border border-white/30 bg-black/50 text-white backdrop-blur transition hover:border-hub-400 sm:right-8 lg:right-12"
        :aria-label="videoPaused ? t('IndexPage.playVideo') : t('IndexPage.pauseVideo')"
        :aria-pressed="videoPaused"
        @click="toggleVideo"
      >
        <UIcon :name="videoPaused ? 'i-lucide-play' : 'i-lucide-pause'" class="size-5" />
      </button>

      <div class="relative z-10 flex flex-1 flex-col items-center justify-end px-4 pt-32 pb-14 text-center">
        <p class="eyebrow mb-3 !text-sm text-hub-400 sm:!text-lg">{{ t('IndexPage.eyebrow') }}</p>
        <h1 class="text-[clamp(72px,11vw,168px)] leading-[0.88] font-bold text-white/90">
          {{ t('IndexPage.title1') }}<br>{{ t('IndexPage.title2') }}
        </h1>
        <div class="mt-9 flex w-full flex-col justify-center gap-3 sm:w-auto sm:flex-row sm:gap-4">
          <NuxtLink :to="vipForm" class="btn-pill btn-pink">{{ t('IndexPage.ctaVip') }}</NuxtLink>
          <NuxtLink :to="eventsAnchor" class="btn-pill btn-ghost">{{ t('IndexPage.ctaWeekend') }}</NuxtLink>
        </div>
      </div>

      <div class="relative z-10 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 px-4 py-5 font-display text-[15px] tracking-[0.06em] uppercase sm:px-8 lg:px-12">
        <a :href="SITE.mapsUrl" target="_blank" rel="noopener" class="inline-flex items-center gap-2 hover:text-hub-300">
          <UIcon name="i-lucide-map-pin" class="size-4" />
          1133 Bardstown Road · Louisville, KY 40204
        </a>
        <NuxtLink :to="switchLocalePath(otherLocale)" :hreflang="otherLocale" class="hidden hover:text-hub-300 sm:inline">{{ t('AppHeader.switchLang') }}</NuxtLink>
        <div class="flex gap-1">
          <a :href="SITE.instagram" target="_blank" rel="noopener" aria-label="Instagram" class="flex size-11 items-center justify-center hover:text-hub-300"><UIcon name="i-simple-icons-instagram" class="size-5" /></a>
          <a :href="SITE.facebook" target="_blank" rel="noopener" aria-label="Facebook" class="flex size-11 items-center justify-center hover:text-hub-300"><UIcon name="i-simple-icons-facebook" class="size-5" /></a>
          <a :href="SITE.yelp" target="_blank" rel="noopener" aria-label="Yelp" class="flex size-11 items-center justify-center hover:text-hub-300"><UIcon name="i-simple-icons-yelp" class="size-5" /></a>
        </div>
      </div>
    </header>

    <!-- ========== QUICK FACTS ========== -->
    <section :aria-label="t('IndexPage.factsLabel')" class="bg-hub-400 text-night">
      <dl class="mx-auto grid max-w-7xl grid-cols-2 gap-4 px-4 py-5 font-display tracking-[0.06em] uppercase sm:px-8 lg:grid-cols-[repeat(4,auto)] lg:justify-between lg:gap-8 lg:px-12">
        <div v-for="f in facts" :key="f">
          <dt class="text-[11px] opacity-75 sm:text-[13px]">{{ t(`IndexPage.facts.${f}.label`) }}</dt>
          <dd class="text-[17px] font-semibold sm:text-[20px] xl:text-[22px]">{{ t(`IndexPage.facts.${f}.value`) }}</dd>
        </div>
      </dl>
    </section>

    <!-- ========== EVENTS ========== -->
    <section id="events" class="mx-auto max-w-7xl scroll-mt-24 px-4 pt-24 pb-24 sm:px-8 md:pt-32 lg:px-12">
      <div class="mb-12 flex flex-wrap items-end justify-between gap-6">
        <div>
          <p class="eyebrow reveal mb-3 text-hub-400">{{ t('IndexPage.eventsEyebrow') }}</p>
          <h2 class="reveal text-[clamp(44px,6vw,80px)] leading-[0.95] font-bold">{{ t('IndexPage.eventsTitle') }}</h2>
        </div>
        <a :href="SITE.instagram" target="_blank" rel="noopener" class="link-underline font-display tracking-[0.1em] uppercase">{{ t('IndexPage.eventsMore') }}</a>
      </div>
      <div class="grid gap-7 sm:grid-cols-2">
        <article v-for="e in events" :key="e.key" class="reveal flex flex-col gap-4">
          <div class="relative aspect-square overflow-hidden rounded-[10px] bg-night-card">
            <img :src="e.image" :alt="e.alt" width="1080" height="1080" loading="lazy" class="reveal-img h-full w-full object-cover">
            <div class="absolute top-3.5 left-3.5 rounded-md bg-night px-3 py-2 text-center font-display leading-none">
              <div class="text-xs tracking-[0.14em] text-hub-400">{{ t(`IndexPage.events.${e.key}.every`) }}</div>
              <div class="text-[26px] font-bold">{{ t(`IndexPage.events.${e.key}.day`) }}</div>
            </div>
          </div>
          <div>
            <h3 class="mb-1.5 text-[28px] font-semibold">
              <NuxtLink :to="localePath(e.route)" class="hover:text-hub-300">{{ t(`IndexPage.events.${e.key}.title`) }}</NuxtLink>
            </h3>
            <p class="text-[#b9b5bd]">{{ t(`IndexPage.events.${e.key}.details`) }}</p>
          </div>
          <div class="flex gap-3">
            <NuxtLink :to="vipForm" class="btn-pill btn-pink !min-h-[46px] !px-5 !text-[15px]">{{ t('IndexPage.bookTable') }}</NuxtLink>
            <NuxtLink :to="localePath(e.route)" class="btn-pill !min-h-[46px] border border-[#3a3740] !px-5 !text-[15px] hover:border-hub-400">{{ t('IndexPage.details') }}</NuxtLink>
          </div>
        </article>
      </div>
    </section>

    <BrandBand />

    <!-- ========== THREE WAYS ========== -->
    <section aria-labelledby="ways" class="border-y border-[#222025] bg-night-raised">
      <div class="mx-auto max-w-7xl px-4 py-24 sm:px-8 md:py-28 lg:px-12">
        <h2 id="ways" class="reveal mb-12 max-w-3xl text-[clamp(40px,5vw,64px)] leading-none font-bold">{{ t('IndexPage.waysTitle') }}</h2>
        <div class="grid gap-6 lg:grid-cols-3">
          <NuxtLink
            v-for="(w, i) in ways"
            :key="w.key"
            :to="w.to"
            class="reveal group flex flex-col overflow-hidden rounded-xl bg-night-card transition hover:-translate-y-1"
            :class="w.featured ? 'outline-2 outline-hub-400' : 'hover:outline-1 hover:outline-[#3a3740]'"
          >
            <div class="overflow-hidden">
              <img
                :src="w.photo.src"
                :srcset="w.photo.srcset"
                sizes="(min-width: 1024px) 400px, 100vw"
                :alt="w.photo.alt"
                :width="w.photo.width"
                :height="w.photo.height"
                loading="lazy"
                class="aspect-[16/10] w-full object-cover transition-transform duration-500 group-hover:scale-105"
              >
            </div>
            <div class="flex flex-1 flex-col gap-3 p-7">
              <div class="flex items-center justify-between">
                <div class="font-display text-sm tracking-[0.2em] text-hub-400">0{{ i + 1 }} · {{ t(`IndexPage.${w.key}.tag`) }}</div>
                <BrandIcon :name="w.icon" :size="36" class="text-white" />
              </div>
              <h3 class="text-[32px] leading-[1.05] font-semibold">{{ t(`IndexPage.${w.key}.title`) }}</h3>
              <p class="leading-relaxed text-[#b9b5bd]">{{ t(`IndexPage.${w.key}.body`) }}</p>
              <span class="mt-auto inline-flex items-center gap-2 pt-2 font-display text-[15px] tracking-[0.1em] uppercase">
                {{ t(`IndexPage.${w.key}.cta`) }}
                <UIcon name="i-lucide-arrow-right" class="transition-transform group-hover:translate-x-1" />
              </span>
            </div>
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- ========== VIP ========== -->
    <section id="vip" class="relative scroll-mt-24 overflow-hidden">
      <BubbleField :density="1.6" :pink="0.5" />
      <div class="relative mx-auto flex max-w-7xl flex-wrap items-center gap-14 px-4 py-24 sm:px-8 md:py-32 lg:px-12">
        <div class="relative h-[300px] min-w-0 flex-[1_1_360px] sm:h-[440px]">
          <PolaroidCard
            v-for="(p, i) in vipStack"
            :key="i"
            :photo="p.photo"
            :caption="p.caption"
            :tilt="p.tilt"
            :speed="p.speed"
            :to="vipForm"
            sizes="(min-width: 1024px) 300px, 55vw"
            class="absolute"
            :class="p.cls"
          />
        </div>
        <div class="flex min-w-0 flex-[1_1_440px] flex-col gap-7">
          <div>
            <p class="eyebrow reveal mb-3 text-hub-400">{{ t('IndexPage.vipEyebrow') }}</p>
            <h2 class="reveal text-[clamp(40px,5vw,64px)] leading-none font-bold">{{ t('IndexPage.vipTitle') }}</h2>
          </div>
          <div class="grid gap-x-7 gap-y-6 sm:grid-cols-2">
            <div v-for="p in perks" :key="p.key" class="reveal group flex gap-4">
              <BrandIcon :name="p.icon" :size="36" class="shrink-0 text-white" />
              <div>
                <h3 class="mb-1.5 text-xl font-semibold">{{ t(`IndexPage.perks.${p.key}.title`) }}</h3>
                <p class="text-[15px] leading-relaxed text-[#b9b5bd]">{{ t(`IndexPage.perks.${p.key}.body`) }}</p>
              </div>
            </div>
          </div>
          <div class="reveal rounded-[10px] border border-[#2c2930] bg-night-raised p-6">
            <h3 class="mb-3.5 font-display text-base tracking-[0.14em]">{{ t('IndexPage.vipRulesTitle') }}</h3>
            <ul class="list-disc space-y-1 pl-5 text-[15px] text-[#c4c0c8]">
              <li v-for="rule in vipRules" :key="rule">{{ rule }}</li>
            </ul>
          </div>
          <div class="reveal flex flex-wrap gap-3.5">
            <NuxtLink :to="vipForm" class="btn-pill btn-pink">{{ t('IndexPage.vipCta') }}</NuxtLink>
            <a :href="BOTTLE_MENU_URL" target="_blank" rel="noopener" class="btn-pill btn-ghost !border-[#4a4650]">
              {{ t('IndexPage.bottleMenu') }}
              <UIcon name="i-lucide-file-text" class="size-5" />
            </a>
          </div>
        </div>
      </div>
    </section>

    <!-- ========== BIRTHDAY (polaroid CTAs) ========== -->
    <section class="relative overflow-hidden border-t border-[#222025] bg-night-raised pb-[calc(6rem+3.5vw)]">
      <BubbleField :density="2" :pink="0.6" />
      <div class="relative mx-auto flex max-w-7xl flex-wrap items-center gap-12 px-4 pt-24 sm:px-8 lg:px-12">
        <div class="min-w-0 flex-[1_1_360px]">
          <p class="eyebrow reveal mb-3 text-hub-400">{{ t('NightPages.birthdayEyebrow') }}</p>
          <h2 class="reveal mb-5 text-[clamp(40px,5vw,64px)] leading-none font-bold">{{ t('Brand.birthdayTitle') }}</h2>
          <p class="reveal mb-8 max-w-lg text-lg leading-relaxed text-[#c4c0c8]">{{ t('Brand.birthdayBody') }}</p>
          <NuxtLink :to="textList" class="btn-pill btn-pink reveal">{{ t('Brand.birthdayCta') }}</NuxtLink>
        </div>
        <div class="relative flex min-w-0 flex-[1_1_360px] justify-center gap-4 sm:gap-8">
          <PolaroidCard :photo="photo('07')" :caption="t('Brand.polaroid.birthday')" :to="textList" :tilt="-7" :speed="0.25" class="w-[46%] max-w-[280px]" sizes="(min-width: 768px) 280px, 46vw" />
          <PolaroidCard :photo="photo('08')" :caption="t('Brand.polaroid.balloons')" :to="vipForm" :tilt="6" :speed="-0.15" class="mt-12 w-[46%] max-w-[280px]" sizes="(min-width: 768px) 280px, 46vw" />
        </div>
      </div>
    </section>

    <!-- ========== PRIVATE EVENTS (light section, slanted lip casts a shadow) ========== -->
    <div class="edge-shadow">
    <section id="private" class="edge-slant-top scroll-mt-24 bg-cream text-[#141215]">
      <div class="mx-auto max-w-7xl px-4 py-24 sm:px-8 md:py-32 lg:px-12">
        <div class="mb-14 flex flex-wrap items-end justify-between gap-8">
          <div class="max-w-3xl">
            <p class="eyebrow reveal mb-3 text-hub-600">{{ t('IndexPage.privateEyebrow') }}</p>
            <h2 class="reveal mb-5 text-[clamp(40px,5vw,64px)] leading-none font-bold">{{ t('IndexPage.privateTitle') }}</h2>
            <p class="reveal text-lg leading-relaxed text-[#4a454d]">{{ t('IndexPage.privateBody') }}</p>
          </div>
          <NuxtLink :to="localePath('private-events')" class="btn-pill btn-dark reveal">{{ t('IndexPage.privateCta') }}</NuxtLink>
        </div>
        <div class="grid border-t-2 border-[#141215] md:grid-cols-3">
          <div v-for="(p, i) in privatePoints" :key="p" class="reveal pt-7 pr-7 pb-2">
            <div class="font-display text-5xl leading-none font-bold text-hub-600">0{{ i + 1 }}</div>
            <h3 class="mt-4 mb-2.5 text-2xl font-semibold">{{ t(`IndexPage.${p}.title`) }}</h3>
            <p class="leading-relaxed text-[#4a454d]">{{ t(`IndexPage.${p}.body`) }}</p>
          </div>
        </div>
      </div>
    </section>
    </div>

    <!-- ========== GALLERY ========== -->
    <section id="gallery" class="scroll-mt-24 pt-24 md:pt-28">
      <div class="mx-auto mb-10 flex max-w-7xl flex-wrap items-end justify-between gap-6 px-4 sm:px-8 lg:px-12">
        <h2 class="reveal text-[clamp(36px,5vw,64px)] leading-none font-bold">{{ t('IndexPage.galleryTitle') }}</h2>
        <NuxtLink :to="localePath('gallery')" class="link-underline font-display tracking-[0.1em] uppercase">{{ t('IndexPage.galleryMore') }}</NuxtLink>
      </div>
      <div class="grid grid-cols-3 gap-1 overflow-hidden sm:gap-1.5 lg:grid-cols-6">
        <img
          v-for="g in gallery"
          :key="g.src"
          :src="g.src"
          :srcset="g.srcset"
          sizes="(min-width: 1024px) 17vw, 34vw"
          :alt="g.alt"
          :width="g.width"
          :height="g.height"
          loading="lazy"
          class="reveal-img aspect-square w-full object-cover"
        >
      </div>
    </section>

  </div>
</template>
