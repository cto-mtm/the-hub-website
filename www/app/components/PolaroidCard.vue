<script setup lang="ts">
/**
 * A taped-up polaroid: photo in a white frame with a handwritten caption.
 * Pass `to` (internal) or `href` (external) and it becomes a CTA link.
 * `speed` hooks into useParallax() so stacked polaroids drift at different rates.
 */
const props = withDefaults(defineProps<{
  photo: { src: string, srcset: string, width: number, height: number, alt: string }
  caption: string
  to?: string | Record<string, unknown>
  href?: string
  tilt?: number
  tape?: boolean
  speed?: number
  sizes?: string
}>(), { tilt: -4, tape: true, speed: 0, sizes: '(min-width: 768px) 320px, 70vw' })

const tag = computed(() => (props.to ? resolveComponent('NuxtLink') : props.href ? 'a' : 'figure'))
const linkAttrs = computed(() => props.to ? { to: props.to } : props.href ? { href: props.href, target: '_blank', rel: 'noopener' } : {})
</script>

<template>
  <div class="polaroid-wrap" :data-speed="speed || undefined">
    <component
      :is="tag"
      v-bind="linkAttrs"
      class="polaroid group"
      :class="{ 'is-link': to || href }"
      :style="{ '--tilt': `${tilt}deg` }"
    >
      <span v-if="tape" class="polaroid-tape" aria-hidden="true" />
      <img
        :src="photo.src"
        :srcset="photo.srcset"
        :sizes="sizes"
        :alt="photo.alt"
        :width="photo.width"
        :height="photo.height"
        loading="lazy"
        class="aspect-square w-full object-cover"
      >
      <span class="polaroid-caption font-script">
        {{ caption }}
        <UIcon v-if="to || href" name="i-lucide-arrow-up-right" class="polaroid-arrow" aria-hidden="true" />
      </span>
    </component>
  </div>
</template>

<style scoped>
.polaroid-wrap { will-change: transform; }
.polaroid {
  position: relative;
  display: block;
  background: #fbfaf7;
  padding: 12px 12px 0;
  border-radius: 3px;
  color: #141215;
  transform: rotate(var(--tilt));
  box-shadow: 0 2px 4px rgb(0 0 0 / 0.25), 0 18px 40px rgb(0 0 0 / 0.45);
  transition: transform 0.45s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.45s ease;
}
.polaroid-caption {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  min-height: clamp(44px, 5vw, 64px);
  padding: 6px 4px 10px;
  font-size: clamp(16px, 2.3vw, 30px);
  line-height: 1.05;
  text-align: center;
}
.polaroid-arrow {
  width: 18px;
  height: 18px;
  color: var(--color-hub-600);
  transition: transform 0.3s ease;
}
.polaroid-tape {
  position: absolute;
  top: -12px;
  left: 50%;
  width: 92px;
  height: 26px;
  transform: translateX(-50%) rotate(calc(var(--tilt) * -1.4));
  background: rgb(232 51 122 / 0.55);
  backdrop-filter: blur(1px);
  box-shadow: 0 1px 2px rgb(0 0 0 / 0.2);
}
.polaroid.is-link:hover,
.polaroid.is-link:focus-visible {
  transform: rotate(0deg) translateY(-8px) scale(1.03);
  box-shadow: 0 4px 8px rgb(0 0 0 / 0.25), 0 30px 60px rgb(0 0 0 / 0.55), 0 0 0 3px var(--color-hub-400);
}
.polaroid.is-link:hover .polaroid-arrow { transform: translate(3px, -3px); }
.polaroid:focus-visible { outline: none; }
@media (prefers-reduced-motion: reduce) {
  .polaroid { transition: none; }
}
</style>
