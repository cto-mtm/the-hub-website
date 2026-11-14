<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()
useSeoMeta({ title: () => t('ContactPage.title'), description: () => t('ContactPage.metaDescription') })

const side = photo('39')
const shortcuts = computed(() => [
  { label: t('ContactPage.forVip'), to: { path: localePath('vip'), hash: '#request' } },
  { label: t('ContactPage.forEvents'), to: { path: localePath('private-events'), hash: '#request' } },
  { label: t('ContactPage.forBirthday'), to: localePath('text') }
])
</script>

<template>
  <div class="bg-night text-[#f4f2f3]">
    <section class="mx-auto max-w-7xl px-4 pt-36 pb-24 sm:px-8 lg:px-12">
      <p class="eyebrow mb-3 text-hub-400">{{ t('ContactPage.eyebrow') }}</p>
      <h1 class="mb-6 text-[clamp(56px,9vw,128px)] leading-[0.88] font-bold">{{ t('ContactPage.title') }}</h1>
      <p class="mb-12 max-w-xl text-lg leading-relaxed text-[#c4c0c8]">{{ t('ContactPage.intro') }}</p>

      <div class="flex flex-wrap gap-14">
        <div class="min-w-0 flex-[999_1_480px]">
          <InquiryForm form-type="contact" tool-name="contact_the_hub" :tool-description="t('ContactPage.toolDescription')" />
        </div>

        <aside class="flex min-w-0 flex-[1_1_300px] flex-col gap-6 lg:max-w-sm">
          <img
:src="side.src" :srcset="side.srcset" sizes="(min-width: 1024px) 384px, 100vw" :alt="side.alt" :width="side.width" :height="side.height"
            loading="lazy" class="aspect-[4/3] w-full rounded-xl object-cover">
          <div class="rounded-xl bg-night-card p-6">
            <h2 class="mb-4 font-display text-base tracking-[0.14em] uppercase">{{ t('ContactPage.quicker') }}</h2>
            <ul class="flex flex-col divide-y divide-[#2c2930]">
              <li v-for="s in shortcuts" :key="s.label">
                <NuxtLink :to="s.to" class="group flex min-h-12 items-center justify-between gap-3 py-2 hover:text-hub-300">
                  {{ s.label }}
                  <UIcon name="i-lucide-arrow-right" class="size-4 transition-transform group-hover:translate-x-1" />
                </NuxtLink>
              </li>
            </ul>
          </div>
          <div class="rounded-xl bg-night-card p-6 text-[#c4c0c8]">
            <address class="mb-3 not-italic">1133 Bardstown Road<br>Louisville, KY 40204</address>
            <a :href="SITE.phoneHref" class="mb-2 flex items-center gap-2 font-semibold text-white hover:text-hub-300">
              <UIcon name="i-lucide-phone" class="size-4 text-hub-400" />{{ SITE.phone }}
            </a>
            <p class="mb-3">{{ t('AppFooter.hours') }}</p>
            <a :href="`mailto:${SITE.email}`" class="font-semibold text-white hover:text-hub-300">{{ SITE.email }}</a>
          </div>
        </aside>
      </div>
    </section>
  </div>
</template>
