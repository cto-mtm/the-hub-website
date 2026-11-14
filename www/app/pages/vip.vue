<script setup lang="ts">
const { t, tm, rt } = useI18n()
const route = useRoute()
useSeoMeta({ title: () => t('VipPage.metaTitle'), description: () => t('VipPage.metaDescription'), ogImage: ogImg('vip') })
useReveal()

const hero = photo('01')
const strip = ['14', '22', '23'].map(id => photo(id))
const perks = [
  { key: 'p1', icon: 'ticket' as const },
  { key: 'p2', icon: 'bell' as const },
  { key: 'p3', icon: 'bottle' as const },
  { key: 'p4', icon: 'balloon' as const }
]
const facts = computed(() => (tm('VipPage.facts') as { label: unknown, value: unknown }[])
  .map(f => ({ label: rt(f.label as Parameters<typeof rt>[0]), value: rt(f.value as Parameters<typeof rt>[0]) })))
// ?night=fri|sat from the night pages pre-fills the next matching date.
const presetNight = computed(() => (typeof route.query.night === 'string' ? route.query.night : undefined))
</script>

<template>
  <div class="bg-night text-[#f4f2f3]">
    <!-- HERO -->
    <section class="relative flex min-h-[78svh] items-end overflow-hidden">
      <img
:src="hero.src" :srcset="hero.srcset" sizes="100vw" :alt="hero.alt" :width="hero.width" :height="hero.height"
        fetchpriority="high" class="absolute inset-0 h-full w-full object-cover object-[50%_30%]">
      <div class="absolute inset-0 bg-[linear-gradient(180deg,rgb(10_10_11/0.35)_0%,rgb(10_10_11/0.2)_40%,#0a0a0b_100%)]" aria-hidden="true" />
      <BubbleField :density="2.4" :pink="0.5" />
      <div class="relative mx-auto w-full max-w-7xl px-4 pt-40 pb-16 sm:px-8 lg:px-12">
        <p class="eyebrow mb-3 text-hub-400">{{ t('IndexPage.vipEyebrow') }}</p>
        <h1 class="max-w-3xl text-[clamp(56px,9vw,128px)] leading-[0.88] font-bold">{{ t('IndexPage.vipTitle') }}</h1>
        <p class="mt-6 max-w-xl text-lg leading-relaxed text-[#e6e3e8]">{{ t('VipPage.body') }}</p>
        <div class="mt-8 flex flex-wrap gap-3.5">
          <a href="#request" class="btn-pill btn-pink">{{ t('IndexPage.vipCta') }}</a>
          <a :href="BOTTLE_MENU_URL" target="_blank" rel="noopener" class="btn-pill btn-ghost">
            {{ t('IndexPage.bottleMenu') }}
            <UIcon name="i-lucide-file-text" class="size-5" />
          </a>
        </div>
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

    <!-- PERKS -->
    <section class="mx-auto max-w-7xl px-4 py-24 sm:px-8 lg:px-12">
      <h2 class="reveal mb-12 text-[clamp(40px,5vw,64px)] leading-none font-bold">{{ t('VipPage.perksTitle') }}</h2>
      <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div v-for="(p, i) in perks" :key="p.key" class="reveal group rounded-xl bg-night-card p-7 transition hover:-translate-y-1">
          <div class="flex items-center justify-between">
            <div class="font-display text-sm tracking-[0.2em] text-hub-400">0{{ i + 1 }}</div>
            <BrandIcon :name="p.icon" :size="40" class="text-white" />
          </div>
          <h3 class="mt-3 mb-2 text-2xl leading-tight font-semibold">{{ t(`IndexPage.perks.${p.key}.title`) }}</h3>
          <p class="leading-relaxed text-[#b9b5bd]">{{ t(`IndexPage.perks.${p.key}.body`) }}</p>
        </div>
      </div>
    </section>

    <!-- PHOTO STRIP -->
    <section :aria-label="t('VipPage.photosLabel')" class="grid grid-cols-3 gap-1 sm:gap-1.5">
      <img
v-for="s in strip" :key="s.src" :src="s.src" :srcset="s.srcset" sizes="34vw" :alt="s.alt" :width="s.width" :height="s.height"
        loading="lazy" class="aspect-[4/5] w-full object-cover sm:aspect-[4/3]">
    </section>

    <!-- REQUEST FORM -->
    <section id="request" class="mx-auto max-w-7xl scroll-mt-24 px-4 py-24 sm:px-8 lg:px-12">
      <div class="flex flex-wrap gap-14">
        <div class="min-w-0 flex-[1_1_320px] lg:max-w-sm">
          <p class="eyebrow mb-3 text-hub-400">{{ t('VipPage.formEyebrow') }}</p>
          <h2 class="mb-5 text-[clamp(40px,5vw,64px)] leading-none font-bold">{{ t('VipPage.formTitle') }}</h2>
          <p class="mb-6 leading-relaxed text-[#c4c0c8]">{{ t('VipPage.formIntro') }}</p>
          <a :href="BOTTLE_MENU_URL" target="_blank" rel="noopener" class="link-underline inline-flex items-center gap-2 font-display tracking-[0.1em] uppercase">
            {{ t('VipPage.bottleMenu') }}
            <UIcon name="i-lucide-file-text" class="size-4" />
          </a>
          <p class="mt-8 text-[#c4c0c8]">
            {{ t('VipPage.lastMinute') }}
            <a :href="SITE.smsHref" class="font-semibold whitespace-nowrap text-white hover:text-hub-300">{{ SITE.phone }}</a>
          </p>
        </div>
        <div class="min-w-0 flex-[999_1_480px]">
          <InquiryForm form-type="vip" tool-name="request_vip_table" :tool-description="t('VipPage.toolDescription')" :preset-night="presetNight" />
        </div>
      </div>
    </section>
  </div>
</template>
