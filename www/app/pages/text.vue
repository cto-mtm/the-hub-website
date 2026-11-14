<script setup lang="ts">
const { t } = useI18n()
useSeoMeta({ title: () => t('TextPage.title'), description: () => t('TextPage.body') })

// Same Klaviyo account + signup form as the old /text/ page, so subscribers keep
// landing in the existing list. Loaded on this page only.
const KLAVIYO_COMPANY_ID = 'W6ESv4'
const KLAVIYO_FORM_ID = 'VTSG6G'
useHead({
  script: [{ src: `https://static.klaviyo.com/onsite/js/klaviyo.js?company_id=${KLAVIYO_COMPANY_ID}`, async: true }]
})
</script>

<template>
  <div class="bg-night text-[#f4f2f3]">
    <section class="mx-auto max-w-3xl px-4 pt-40 pb-24 text-center sm:px-8">
      <!-- The Klaviyo form carries its own headline + offer copy (edited in Klaviyo). -->
      <h1 class="text-[clamp(44px,7vw,88px)] leading-[0.95] font-bold">{{ t('TextPage.title') }}</h1>

      <div class="mx-auto mt-10 min-h-[420px] max-w-xl rounded-xl bg-cream p-2 text-left text-[#141215]">
        <div :class="`klaviyo-form-${KLAVIYO_FORM_ID}`" />
        <noscript>
          <p class="p-6">{{ t('TextPage.noscript') }}</p>
        </noscript>
      </div>
    </section>
  </div>
</template>
