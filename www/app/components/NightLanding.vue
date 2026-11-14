<script setup lang="ts">
const props = defineProps<{ nightKey: NightKey }>()

const { t, tm, rt } = useI18n()
const localePath = useLocalePath()
const night = NIGHTS[props.nightKey]
const k = (path: string) => `NightPages.${props.nightKey}.${path}`

useSeoMeta({
  title: () => t(k('metaTitle')),
  description: () => t(k('metaDescription')),
  ogImage: night.og
})
useReveal()
useParallax()

type Msg = Parameters<typeof rt>[0]
const list = <T extends Record<string, Msg>>(path: string) =>
  (tm(k(path)) as T[]).map(item => Object.fromEntries(Object.entries(item).map(([key, v]) => [key, rt(v)])) as Record<keyof T, string>)

const facts = computed(() => list<{ label: Msg, value: Msg }>('facts'))
const expect = computed(() => list<{ title: Msg, body: Msg }>('expect'))
const faq = computed(() => list<{ q: Msg, a: Msg }>('faq'))

// Photo strip per night + the VIP CTA pre-fills that night on the request form.
const strip = (props.nightKey === 'latin' ? ['31', '25', '05', '30'] : ['32', '28', '29', '26']).map(id => photo(id))
const birthdayPhoto = photo('07')
const vipForm = computed(() => ({ path: localePath('vip'), query: { night: night.weekday === 5 ? 'fri' : 'sat' }, hash: '#request' }))

// Dates are computed once on the server and reused on the client (no hydration drift).
const dates = useState(`night-dates-${props.nightKey}`, () => upcomingDates(night, 4))

const address = {
  '@type': 'PostalAddress',
  'streetAddress': '1133 Bardstown Rd',
  'addressLocality': 'Louisville',
  'addressRegion': 'KY',
  'postalCode': '40204',
  'addressCountry': 'US'
}

useSchemaOrg([
  defineWebPage({ '@type': ['WebPage', 'FAQPage'] }),
  ...dates.value.map(d => defineEvent({
    // Unique id per date, otherwise schema-org dedupes them into a single Event.
    '@id': `#event-${props.nightKey}-${d.start.slice(0, 10)}`,
    'name': t(k('eventName')),
    description: t(k('metaDescription')),
    image: night.image,
    startDate: d.start,
    endDate: d.end,
    eventStatus: 'EventScheduled',
    eventAttendanceMode: 'OfflineEventAttendanceMode',
    location: { '@type': 'NightClub', 'name': SITE.name, address },
    organizer: { '@type': 'Organization', 'name': SITE.name, 'url': 'https://hublouisville.com' },
    eventSchedule: {
      '@type': 'Schedule',
      'byDay': `https://schema.org/${night.day}`,
      'repeatFrequency': 'P1W',
      'startTime': night.doors,
      'endTime': night.close,
      'scheduleTimezone': 'America/Kentucky/Louisville'
    },
    // Stable @id per DJ so the 4 dated events share one Person node each.
    'performer': night.djs.map(name => ({ '@type': 'Person', '@id': `https://hublouisville.com/#dj-${name.toLowerCase().replace(/^dj\s+/, '').replace(/[^a-z0-9]+/g, '-')}`, name }))
  })),
  ...faq.value.map(item => defineQuestion({ name: item.q, acceptedAnswer: item.a }))
])
</script>

<template>
  <div class="bg-night text-[#f4f2f3]">
    <!-- HERO -->
    <section class="relative overflow-hidden">
      <BubbleField :density="2.2" :pink="0.5" />
      <div class="relative mx-auto flex max-w-7xl flex-wrap items-center gap-12 px-4 pt-36 pb-20 sm:px-8 lg:px-12">
      <div class="flex min-w-0 flex-[1_1_480px] flex-col gap-6">
        <p class="eyebrow reveal is-visible text-hub-400">{{ t(k('eyebrow')) }}</p>
        <h1 class="reveal is-visible text-[clamp(56px,9vw,128px)] leading-[0.88] font-bold">{{ t(k('title')) }}</h1>
        <p class="reveal is-visible max-w-xl text-lg leading-relaxed text-[#c4c0c8]">{{ t(k('lead')) }}</p>
        <div class="reveal is-visible flex flex-wrap gap-3.5">
          <NuxtLink :to="vipForm" class="btn-pill btn-pink">{{ t('IndexPage.ctaVip') }}</NuxtLink>
          <a :href="SITE.mapsUrl" target="_blank" rel="noopener" class="btn-pill btn-ghost">{{ t('AppFooter.directions') }}</a>
        </div>
      </div>
      <img
:src="night.image" :alt="t(k('imageAlt'))" width="1080" height="1080" fetchpriority="high"
        class="reveal is-visible aspect-square w-full min-w-0 flex-[1_1_360px] rounded-xl object-cover lg:max-w-[520px]">
      </div>
    </section>

    <!-- FACTS -->
    <section :aria-label="t('IndexPage.factsLabel')" class="bg-hub-400 text-night">
      <dl class="mx-auto grid max-w-7xl grid-cols-2 gap-4 px-4 py-5 font-display tracking-[0.06em] uppercase sm:px-8 lg:grid-cols-[repeat(4,auto)] lg:justify-between lg:gap-8 lg:px-12">
        <div v-for="f in facts" :key="f.label">
          <dt class="text-[11px] opacity-75 sm:text-[13px]">{{ f.label }}</dt>
          <dd class="text-[17px] font-semibold sm:text-[20px] xl:text-[22px]">{{ f.value }}</dd>
        </div>
      </dl>
    </section>

    <!-- PHOTO STRIP -->
    <section :aria-label="t(k('eventName'))" class="grid grid-cols-2 gap-1 sm:gap-1.5 lg:grid-cols-4">
      <img
        v-for="p in strip"
        :key="p.src"
        :src="p.src"
        :srcset="p.srcset"
        sizes="(min-width: 1024px) 25vw, 50vw"
        :alt="p.alt"
        :width="p.width"
        :height="p.height"
        loading="lazy"
        class="aspect-square w-full object-cover"
      >
    </section>

    <!-- WHAT TO EXPECT -->
    <section class="mx-auto max-w-7xl px-4 py-24 sm:px-8 lg:px-12">
      <h2 class="reveal mb-12 text-[clamp(40px,5vw,64px)] leading-none font-bold">{{ t(k('expectTitle')) }}</h2>
      <div class="grid gap-6 md:grid-cols-3">
        <div v-for="(e, i) in expect" :key="e.title" class="reveal rounded-xl bg-night-card p-7">
          <div class="font-display text-sm tracking-[0.2em] text-hub-400">0{{ i + 1 }}</div>
          <h3 class="mt-3 mb-2 text-[28px] leading-[1.05] font-semibold">{{ e.title }}</h3>
          <p class="leading-relaxed text-[#b9b5bd]">{{ e.body }}</p>
        </div>
      </div>
    </section>

    <!-- BIRTHDAY OFFER -->
    <section class="bg-cream text-[#141215]">
      <div class="mx-auto flex max-w-7xl flex-wrap items-center gap-10 px-4 py-16 sm:px-8 lg:px-12">
        <div class="flex min-w-0 flex-[1_1_300px] justify-center gap-4 md:max-w-md">
          <PolaroidCard :photo="birthdayPhoto" :caption="t('Brand.polaroid.birthday')" :to="localePath('text')" :tilt="-6" :speed="0.2" class="w-[48%]" sizes="(min-width: 768px) 220px, 48vw" />
          <PolaroidCard :photo="photo('16')" :caption="t('Brand.polaroid.crew')" :to="vipForm" :tilt="5" :speed="-0.15" class="mt-10 w-[48%]" sizes="(min-width: 768px) 220px, 48vw" />
        </div>
        <div class="flex min-w-0 flex-[999_1_360px] flex-col items-start gap-6">
          <div>
            <p class="eyebrow mb-3 text-hub-600">{{ t('NightPages.birthdayEyebrow') }}</p>
            <h2 class="text-[clamp(32px,4vw,48px)] leading-none font-bold">{{ t('NightPages.birthdayTitle') }}</h2>
          </div>
          <NuxtLink :to="localePath('text')" class="btn-pill btn-dark">{{ t('NightPages.birthdayCta') }}</NuxtLink>
        </div>
      </div>
    </section>

    <!-- FAQ (visible copy mirrors the FAQPage structured data) -->
    <section class="mx-auto max-w-4xl px-4 py-24 sm:px-8">
      <h2 class="reveal mb-10 text-[clamp(40px,5vw,64px)] leading-none font-bold">{{ t('NightPages.faqTitle') }}</h2>
      <div class="divide-y divide-[#2c2930] border-y border-[#2c2930]">
        <details v-for="item in faq" :key="item.q" class="group py-5">
          <summary class="flex cursor-pointer list-none items-center justify-between gap-6 font-display text-xl tracking-[0.04em] uppercase">
            {{ item.q }}
            <UIcon name="i-lucide-plus" class="size-5 shrink-0 text-hub-400 transition-transform group-open:rotate-45" />
          </summary>
          <p class="mt-3 max-w-3xl leading-relaxed text-[#c4c0c8]">{{ item.a }}</p>
        </details>
      </div>
    </section>
  </div>
</template>
