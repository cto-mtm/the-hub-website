<script setup lang="ts">
const { t, locale } = useI18n()
const localePath = useLocalePath()
const switchLocalePath = useSwitchLocalePath()

// Desktop menu. The weekly nights lead: they're what people search for.
const navItems = computed(() => [
  { key: 'latinNightShort', to: localePath('latin-night') },
  { key: 'saturdaysShort', to: localePath('saturday-night') },
  { key: 'vip', to: localePath('vip') },
  { key: 'privateEvents', to: localePath('private-events') },
  { key: 'gallery', to: localePath('gallery') }
])

const menuOpen = ref(false)

const otherLocale = computed(() => (locale.value === 'en' ? 'es' : 'en'))

// Smart navbar: hide on scroll down, show on scroll up; solid once past the hero top.
const hidden = ref(false)
const solid = ref(false)
let lastY = 0

function onScroll() {
  const y = window.scrollY
  hidden.value = y > lastY && y > 120
  solid.value = y > 40
  lastY = y
}

onMounted(() => {
  onScroll()
  window.addEventListener('scroll', onScroll, { passive: true })
})
onBeforeUnmount(() => window.removeEventListener('scroll', onScroll))
</script>

<template>
  <header
    class="fixed inset-x-0 top-0 z-50 transition-[transform,background-color] duration-300"
    :class="[hidden ? '-translate-y-full' : 'translate-y-0', solid ? 'bg-black/80 backdrop-blur depth-sm' : 'bg-transparent']"
  >
    <a href="#main" class="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:bg-default focus:p-2">{{ t('AppHeader.skip') }}</a>
    <nav class="mx-auto flex max-w-[1440px] items-center justify-between gap-6 px-4 py-3 sm:px-8 lg:px-12" aria-label="Main">
      <NuxtLink :to="localePath('index')" class="group shrink-0" aria-label="The Hub Louisville">
        <img src="/images/logo.webp" alt="" width="72" height="72" class="size-14 invert transition-transform group-hover:rotate-45 sm:size-[72px]">
      </NuxtLink>

      <ul class="hidden items-center gap-6 lg:flex xl:gap-8">
        <li v-for="item in navItems" :key="item.key">
          <NuxtLink
            :to="item.to"
            class="font-display text-[17px] tracking-[0.08em] uppercase text-white transition hover:text-hub-300"
          >
            {{ t(`AppHeader.${item.key}`) }}
          </NuxtLink>
        </li>
      </ul>

      <div class="flex items-center gap-3 sm:gap-4">
        <NuxtLink
          :to="switchLocalePath(otherLocale)"
          :hreflang="otherLocale"
          class="hidden font-display text-[15px] tracking-[0.08em] text-white/80 transition hover:text-white sm:inline"
          :aria-label="t('AppHeader.switchLang')"
        >
          {{ otherLocale.toUpperCase() }}
        </NuxtLink>

        <NuxtLink :to="localePath('vip')" class="btn-pill btn-pink hidden !min-h-14 !pr-2 !pl-6 sm:inline-flex">
          {{ t('AppHeader.bookVip') }}
          <span class="flex size-9 items-center justify-center rounded-full bg-night">
            <UIcon name="i-lucide-arrow-right" class="size-[18px] text-white" />
          </span>
        </NuxtLink>

        <button
          type="button"
          class="flex size-14 items-center justify-center rounded-full bg-hub-400 text-night transition hover:bg-[#ff4f93] lg:hidden"
          :aria-label="t('AppHeader.menu')"
          aria-haspopup="dialog"
          aria-controls="mobile-menu"
          :aria-expanded="menuOpen"
          @click="menuOpen = true"
        >
          <UIcon name="i-lucide-menu" class="size-6" />
        </button>
      </div>
    </nav>
    <MobileMenu v-model:open="menuOpen" />
  </header>
</template>
