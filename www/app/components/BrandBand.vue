<script setup lang="ts">
/**
 * Tilted pink "Best Night Ever" band that overlaps the sections around it (depth + brand).
 * Decorative: the slogan is repeated, so it's hidden from screen readers.
 */
const { t } = useI18n()
withDefaults(defineProps<{ tilt?: number }>(), { tilt: -2.5 })
</script>

<template>
  <div class="relative z-20 -my-10 overflow-hidden py-10" aria-hidden="true">
    <div
      class="bg-hub-400 py-3 text-night shadow-[0_18px_40px_rgb(0_0_0/0.45)]"
      :style="{ transform: `rotate(${tilt}deg) scale(1.06)` }"
    >
      <div class="marquee-track items-center">
        <template v-for="n in 6" :key="n">
          <span class="px-6 font-script text-[clamp(32px,4vw,48px)] leading-none whitespace-nowrap">{{ t('Brand.slogan') }}</span>
          <BrandIcon :name="(['bottle', 'disco', 'balloon'] as const)[n % 3]!" :size="34" class="shrink-0 text-night" />
          <span class="px-6 font-display text-lg font-semibold tracking-[0.2em] whitespace-nowrap uppercase">{{ t('Brand.bandLine') }}</span>
          <BrandIcon name="cocktail" :size="30" class="shrink-0 text-night" />
        </template>
      </div>
    </div>
  </div>
</template>
