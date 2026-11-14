<script setup lang="ts">
const { t, locale } = useI18n()
const localePath = useLocalePath()
const switchLocalePath = useSwitchLocalePath()
const year = new Date().getFullYear()
const otherLocale = computed(() => (locale.value === 'en' ? 'es' : 'en'))

const explore = computed(() => [
  { key: 'latinNight', to: localePath('latin-night') },
  { key: 'saturdayNight', to: localePath('saturday-night') },
  { key: 'vip', to: localePath('vip') },
  { key: 'privateEvents', to: localePath('private-events') },
  { key: 'gallery', to: localePath('gallery') },
  { key: 'contact', to: localePath('contact') }
])
</script>

<template>
  <footer id="visit" class="border-t-[6px] border-hub-400 bg-[#050506]">
    <div class="mx-auto flex max-w-7xl flex-wrap gap-14 px-4 pt-24 pb-10 sm:px-8 lg:px-12">
      <div class="flex min-w-0 flex-[1_1_360px] flex-col gap-5">
        <h2 class="text-5xl leading-none font-bold md:text-6xl">{{ t('AppFooter.title1') }}<br>{{ t('AppFooter.title2') }}</h2>
        <address class="text-lg leading-relaxed text-[#c4c0c8] not-italic">
          1133 Bardstown Road<br>Louisville, KY 40204
        </address>
        <a :href="SITE.phoneHref" class="inline-flex w-fit items-center gap-2 text-lg font-semibold text-white hover:text-hub-300">
          <UIcon name="i-lucide-phone" class="size-5 text-hub-400" />
          {{ SITE.phone }}
          <span class="text-sm font-normal text-[#a39fa8]">· {{ t('AppFooter.callText') }}</span>
        </a>
        <div class="flex flex-wrap gap-3.5">
          <a :href="SITE.mapsUrl" target="_blank" rel="noopener" class="btn-pill btn-pink !min-h-[52px] !text-base">{{ t('AppFooter.directions') }}</a>
          <a :href="`mailto:${SITE.email}`" class="btn-pill btn-ghost !min-h-[52px] !border-[#4a4650] !text-base">{{ t('AppFooter.email') }}</a>
        </div>
      </div>

      <div class="min-w-0 flex-[1_1_200px]">
        <h3 class="mb-4 font-display text-[15px] tracking-[0.2em] text-[#a39fa8]">{{ t('AppFooter.hoursLabel') }}</h3>
        <p class="leading-loose text-[#e6e3e8]">
          {{ t('AppFooter.fri') }}<br>{{ t('AppFooter.sat') }}<br>{{ t('AppFooter.weekdays') }}
        </p>
      </div>

      <nav class="min-w-0 flex-[1_1_200px]" :aria-label="t('AppFooter.exploreLabel')">
        <h3 class="mb-4 font-display text-[15px] tracking-[0.2em] text-[#a39fa8]">{{ t('AppFooter.exploreLabel') }}</h3>
        <ul class="flex flex-col gap-2.5">
          <li v-for="item in explore" :key="item.key">
            <NuxtLink :to="item.to" class="transition hover:text-hub-300">{{ t(`AppHeader.${item.key}`) }}</NuxtLink>
          </li>
          <li>
            <NuxtLink :to="switchLocalePath(otherLocale)" :hreflang="otherLocale" class="transition hover:text-hub-300">{{ t('AppHeader.switchLang') }}</NuxtLink>
          </li>
        </ul>
      </nav>

      <div class="min-w-0 flex-[1_1_200px]">
        <h3 class="mb-4 font-display text-[15px] tracking-[0.2em] text-[#a39fa8]">{{ t('AppFooter.follow') }}</h3>
        <ul class="flex flex-col gap-2.5">
          <li><a :href="SITE.instagram" target="_blank" rel="noopener" class="inline-flex items-center gap-2 transition hover:text-hub-300"><UIcon name="i-simple-icons-instagram" />Instagram</a></li>
          <li><a :href="SITE.facebook" target="_blank" rel="noopener" class="inline-flex items-center gap-2 transition hover:text-hub-300"><UIcon name="i-simple-icons-facebook" />Facebook</a></li>
          <li><a :href="SITE.yelp" target="_blank" rel="noopener" class="inline-flex items-center gap-2 transition hover:text-hub-300"><UIcon name="i-simple-icons-yelp" />Yelp</a></li>
        </ul>
      </div>
    </div>
    <div class="mx-auto flex max-w-7xl flex-wrap justify-between gap-3 border-t border-[#1f1d22] px-4 pt-6 pb-24 text-[13px] text-[#8f8a94] sm:px-8 md:pb-10 lg:px-12">
      <span>© {{ year }} {{ t('AppFooter.company') }} · {{ t('AppFooter.drink') }}</span>
      <a :href="`mailto:${SITE.email}`" class="hover:text-white">{{ SITE.email }}</a>
    </div>
  </footer>
</template>
