<script setup lang="ts">
// Phone-only action bar on every page. On Private Events it books a consultation; everywhere else, VIP.
const { t } = useI18n()
const localePath = useLocalePath()
const route = useRoute()
const getRouteBaseName = useRouteBaseName()

const isPrivate = computed(() => getRouteBaseName(route) === 'private-events')
const primary = computed(() => isPrivate.value
  ? { to: { path: localePath('private-events'), hash: '#request' }, label: t('IndexPage.privateCta') }
  : { to: { path: localePath('vip'), hash: '#request' }, label: t('AppHeader.bookVip') })
</script>

<template>
  <div class="fixed inset-x-0 bottom-0 z-40 flex gap-2.5 border-t border-[#222025] bg-night/95 px-4 pt-3 pb-[max(1.25rem,env(safe-area-inset-bottom))] backdrop-blur md:hidden">
    <NuxtLink :to="primary.to" class="btn-pill btn-pink !min-h-[52px] flex-1 !px-4 !text-base">{{ primary.label }}</NuxtLink>
    <a :href="SITE.phoneHref" class="flex size-[52px] shrink-0 items-center justify-center rounded-full border border-[#4a4650] text-white" :aria-label="`${t('AppFooter.callText')} ${SITE.phone}`">
      <UIcon name="i-lucide-phone" class="size-5 text-hub-400" />
    </a>
    <a :href="SITE.mapsUrl" target="_blank" rel="noopener" class="btn-pill !min-h-[52px] border border-[#4a4650] !px-4 !text-base text-white">{{ t('IndexPage.directionsShort') }}</a>
  </div>
</template>
