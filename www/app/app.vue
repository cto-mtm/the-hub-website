<script setup lang="ts">
// hreflang alternates (en / es / x-default) and og:locale on every page,
// so search engines pair each English page with its Spanish version.
const i18nHead = useLocaleHead({ seo: true })
useHead({
  link: () => (i18nHead.value.link ?? []).filter(l => l.rel === 'alternate'),
  meta: () => i18nHead.value.meta ?? []
})

// The loader fades itself out with CSS after 0.5s; this removes it once the app is
// interactive as a safety net (e.g. if styles arrive late), so it can never stick.
const loaderDone = ref(false)
onMounted(() => setTimeout(() => { loaderDone.value = true }, 900))

// Default share card; pages override ogImage with their own.
useSeoMeta({ ogImage: ogImg('home'), twitterCard: 'summary_large_image' })

// The business as structured data on every page: what AI assistants and search
// engines use to answer "where's a club / Latin night in Louisville tonight?".
useSchemaOrg([
  defineLocalBusiness({
    '@type': 'NightClub',
    'name': SITE.name,
    'alternateName': 'The Hub',
    'description': 'Nightclub on Bardstown Road in the Highlands, Louisville, KY. Latin Night every Friday, club night every Saturday, local DJs, multiple dance floors, a patio, VIP bottle service and private events.',
    'url': 'https://hublouisville.com',
    'logo': 'https://hublouisville.com/images/logo-512.png',
    'image': 'https://hublouisville.com/images/og/home.jpg',
    'email': SITE.email,
    'telephone': '+1-502-777-1505',
    'address': {
      streetAddress: '1133 Bardstown Rd',
      addressLocality: 'Louisville',
      addressRegion: 'KY',
      postalCode: '40204',
      addressCountry: 'US'
    },
    'hasMap': SITE.mapsUrl,
    'areaServed': ['Louisville, KY', 'The Highlands, Louisville'],
    'knowsLanguage': ['en', 'es'],
    'openingHoursSpecification': [
      { dayOfWeek: ['Friday', 'Saturday'], opens: '22:00', closes: '04:00' }
    ],
    'sameAs': [SITE.instagram, SITE.facebook, SITE.yelp]
  })
])
</script>

<template>
  <UApp>
    <!-- 0.5s brand loader on the first load (pure CSS, fades itself out) -->
    <div v-if="!loaderDone" class="site-loader" aria-hidden="true">
      <div class="site-loader__ring">
        <img src="/images/logo.webp" alt="" width="72" height="72">
      </div>
    </div>
    <NuxtLoadingIndicator color="#e8337a" :height="3" />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>
