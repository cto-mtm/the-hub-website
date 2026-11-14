<script setup lang="ts">
/**
 * The Hub's own icon set: 32×32 line icons, white stroke + one Hub-pink accent.
 * The accent twinkles when a parent with the `group` class is hovered.
 */
const ICONS = {
  bottle: {
    main: 'M14 7h4v4l2 3v13a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2V14l2-3z M12 19h8 M12 23h8',
    accent: 'M16 1v3 M12.5 2.5l1.8 1.8 M19.5 2.5l-1.8 1.8 M10.5 6h2 M19.5 6h2'
  },
  disco: {
    main: 'M16 3v6 M25 18a9 9 0 1 1-18 0a9 9 0 1 1 18 0z M7 18h18 M16 9v18 M9.5 12.5c4 2 9 2 13 0 M9.5 23.5c4-2 9-2 13 0',
    accent: 'M26 3l1 2 2 1-2 1-1 2-1-2-2-1 2-1z'
  },
  balloon: {
    main: 'M16 3c-5 0-8 4-8 9 0 5 4 9 8 9s8-4 8-9c0-5-3-9-8-9z M15 21l1 2 1-2',
    accent: 'M16 23c-2 2 2 4 0 7 M11.5 9a5 5 0 0 1 3-3'
  },
  ticket: {
    main: 'M5 9h22v4a3 3 0 0 0 0 6v4H5v-4a3 3 0 0 0 0-6z M21 9v2 M21 14v4 M21 21v2',
    accent: 'M12 12.5l1.2 2.4 2.6.4-1.9 1.8.5 2.6-2.4-1.3-2.4 1.3.5-2.6-1.9-1.8 2.6-.4z'
  },
  cocktail: {
    main: 'M6 6h20l-10 11z M16 17v9 M11 27h10',
    accent: 'M17 3.5l5 7 M21.5 9.5a1.6 1.6 0 1 1-3.2 0a1.6 1.6 0 1 1 3.2 0z'
  },
  crown: {
    main: 'M5 24l-1-13 6 5 6-9 6 9 6-5-1 13z M6 27h20',
    accent: 'M16 20.5a1.3 1.3 0 1 1 0 .1z M10 21a1 1 0 1 1 0 .1z M22 21a1 1 0 1 1 0 .1z'
  },
  bell: {
    main: 'M4 24h24 M7 24a9 9 0 0 1 18 0 M16 15v-2 M13.5 13h5',
    accent: 'M11 21a5 5 0 0 1 3-4 M24 9l2-2 M27 13h2 M8 9 6 7'
  },
  booth: {
    main: 'M6 14v-3a3 3 0 0 1 3-3h14a3 3 0 0 1 3 3v3 M4 14h24v8H4z M7 22v3 M25 22v3',
    accent: 'M10 18h12'
  },
  turntable: {
    main: 'M4 8h24v16H4z M18 16a5 5 0 1 1-10 0a5 5 0 1 1 10 0z M24 11v7l-3 3',
    accent: 'M14 16a1 1 0 1 1-2 0a1 1 0 1 1 2 0z M24 11h0'
  }
} as const

export type BrandIconName = keyof typeof ICONS

const props = withDefaults(defineProps<{ name: BrandIconName, size?: number }>(), { size: 40 })
const icon = computed(() => ICONS[props.name])
</script>

<template>
  <svg :width="size" :height="size" viewBox="0 0 32 32" fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="brand-icon">
    <path :d="icon.main" stroke="currentColor" stroke-width="1.75" />
    <path :d="icon.accent" stroke="var(--color-hub-400)" stroke-width="1.75" class="brand-icon-accent" />
  </svg>
</template>

<!-- Unscoped on purpose: the hover trigger is an ancestor `.group`. (Scoped `:global(.group:hover) x`
     would compile to a bare `.group:hover` rule and animate every card.) -->
<style>
.brand-icon-accent { transform-box: fill-box; transform-origin: center; }
.group:hover .brand-icon-accent { animation: brand-twinkle 0.9s ease-in-out infinite alternate; }
@keyframes brand-twinkle { from { transform: scale(1) rotate(0); opacity: 1; } to { transform: scale(1.18) rotate(8deg); opacity: 0.7; } }
@media (prefers-reduced-motion: reduce) { .group:hover .brand-icon-accent { animation: none; } }
</style>
