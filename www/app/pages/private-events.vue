<script setup lang="ts">
const { t } = useI18n()
useSeoMeta({ title: () => t('PrivateEventsPage.metaTitle'), description: () => t('PrivateEventsPage.metaDescription'), ogImage: ogImg('events') })
useReveal()

const hero = photo('40')
const points = [
  { key: 'pe1', photo: photo('17') },
  { key: 'pe2', photo: photo('35') },
  { key: 'pe3', photo: photo('21') }
]
const moments = ['12', '07', '16', '08'].map(id => photo(id))
</script>

<template>
  <div class="bg-night text-[#f4f2f3]">
    <!-- HERO -->
    <section class="relative flex min-h-[78svh] items-end overflow-hidden">
      <img
:src="hero.src" :srcset="hero.srcset" sizes="100vw" :alt="hero.alt" :width="hero.width" :height="hero.height"
        fetchpriority="high" class="absolute inset-0 h-full w-full object-cover">
      <div class="absolute inset-0 bg-[linear-gradient(180deg,rgb(10_10_11/0.3)_0%,rgb(10_10_11/0.15)_40%,#0a0a0b_100%)]" aria-hidden="true" />
      <div class="relative mx-auto w-full max-w-7xl px-4 pt-40 pb-16 sm:px-8 lg:px-12">
        <p class="eyebrow mb-3 text-hub-400">{{ t('IndexPage.privateEyebrow') }}</p>
        <h1 class="max-w-4xl text-[clamp(52px,8vw,112px)] leading-[0.9] font-bold">{{ t('IndexPage.privateTitle') }}</h1>
        <p class="mt-6 max-w-xl text-lg leading-relaxed text-[#e6e3e8]">{{ t('PrivateEventsPage.body') }}</p>
        <a href="#request" class="btn-pill btn-pink mt-8">{{ t('IndexPage.privateCta') }}</a>
      </div>
    </section>

    <!-- AVAILABILITY -->
    <section class="bg-hub-400 text-night">
      <p class="mx-auto flex max-w-7xl items-center gap-3 px-4 py-5 font-display text-lg tracking-[0.06em] uppercase sm:px-8 sm:text-xl lg:px-12">
        <UIcon name="i-lucide-calendar-check" class="size-6 shrink-0" />
        {{ t('PrivateEventsPage.availability') }}
      </p>
    </section>

    <!-- WHY HERE (light) -->
    <section class="bg-cream text-[#141215]">
      <div class="mx-auto max-w-7xl px-4 py-24 sm:px-8 lg:px-12">
        <h2 class="reveal mb-12 max-w-3xl text-[clamp(40px,5vw,64px)] leading-none font-bold">{{ t('PrivateEventsPage.whyTitle') }}</h2>
        <div class="grid gap-8 md:grid-cols-3">
          <div v-for="(p, i) in points" :key="p.key" class="reveal">
            <img
:src="p.photo.src" :srcset="p.photo.srcset" sizes="(min-width: 768px) 33vw, 100vw" :alt="p.photo.alt"
              :width="p.photo.width" :height="p.photo.height" loading="lazy" class="mb-6 aspect-[4/3] w-full rounded-xl object-cover">
            <div class="font-display text-5xl leading-none font-bold text-hub-600">0{{ i + 1 }}</div>
            <h3 class="mt-4 mb-2.5 text-2xl font-semibold">{{ t(`IndexPage.${p.key}.title`) }}</h3>
            <p class="leading-relaxed text-[#4a454d]">{{ t(`IndexPage.${p.key}.body`) }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- MOMENTS -->
    <section :aria-label="t('PrivateEventsPage.momentsLabel')" class="grid grid-cols-2 gap-1 sm:gap-1.5 lg:grid-cols-4">
      <img
v-for="m in moments" :key="m.src" :src="m.src" :srcset="m.srcset" sizes="(min-width: 1024px) 25vw, 50vw" :alt="m.alt"
        :width="m.width" :height="m.height" loading="lazy" class="aspect-square w-full object-cover">
    </section>

    <!-- REQUEST FORM -->
    <section id="request" class="mx-auto max-w-7xl scroll-mt-24 px-4 py-24 sm:px-8 lg:px-12">
      <div class="flex flex-wrap gap-14">
        <div class="min-w-0 flex-[1_1_320px] lg:max-w-sm">
          <p class="eyebrow mb-3 text-hub-400">{{ t('PrivateEventsPage.formEyebrow') }}</p>
          <h2 class="mb-5 text-[clamp(40px,5vw,64px)] leading-none font-bold">{{ t('PrivateEventsPage.formTitle') }}</h2>
          <p class="leading-relaxed text-[#c4c0c8]">{{ t('PrivateEventsPage.formIntro') }}</p>
        </div>
        <div class="min-w-0 flex-[999_1_480px]">
          <InquiryForm form-type="private-event" tool-name="inquire_private_event" :tool-description="t('PrivateEventsPage.toolDescription')" />
        </div>
      </div>
    </section>
  </div>
</template>
