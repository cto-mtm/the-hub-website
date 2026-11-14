<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()
useSeoMeta({ title: () => t('GalleryPage.metaTitle'), description: () => t('GalleryPage.body') })
useReveal()

const photos = PHOTOS.map(p => photo(p.id))

// Lightbox on a native <dialog>: focus trap + Esc for free.
const box = ref<HTMLDialogElement | null>(null)
const current = ref(0)
const active = computed(() => photos[current.value]!)

function openAt(i: number) {
  current.value = i
  box.value?.showModal()
}
function step(d: number) {
  current.value = (current.value + d + photos.length) % photos.length
}
function onKey(e: KeyboardEvent) {
  if (e.key === 'ArrowRight') step(1)
  else if (e.key === 'ArrowLeft') step(-1)
  else if (e.key === 'Escape') box.value?.close()
}
const touchX = 0
function onTouchEnd(e: TouchEvent) {
  const dx = (e.changedTouches[0]?.clientX ?? touchX) - touchX
  if (Math.abs(dx) > 50) step(dx < 0 ? 1 : -1)
}
</script>

<template>
  <div class="bg-night text-[#f4f2f3]">
    <section class="mx-auto max-w-7xl px-4 pt-36 pb-12 sm:px-8 lg:px-12">
      <p class="eyebrow reveal is-visible mb-3 text-hub-400">{{ t('GalleryPage.eyebrow') }}</p>
      <h1 class="reveal is-visible text-[clamp(56px,9vw,128px)] leading-[0.9] font-bold">{{ t('GalleryPage.title') }}</h1>
      <p class="reveal is-visible mt-6 max-w-2xl text-lg leading-relaxed text-[#c4c0c8]">{{ t('GalleryPage.body') }}</p>
    </section>

    <!-- Masonry via CSS columns: every photo keeps its own shape. -->
    <section :aria-label="t('GalleryPage.title')" class="px-1 pb-24 sm:px-1.5">
      <ul class="columns-2 gap-1 sm:gap-1.5 md:columns-3 xl:columns-4">
        <li v-for="(p, i) in photos" :key="p.src" class="mb-1 break-inside-avoid sm:mb-1.5">
          <button type="button" class="group block w-full overflow-hidden" :aria-label="`${t('GalleryPage.open')}: ${p.alt}`" @click="openAt(i)">
            <img
:src="p.src" :srcset="p.srcset" sizes="(min-width: 1280px) 25vw, (min-width: 768px) 33vw, 50vw" :alt="p.alt"
              :width="p.width" :height="p.height" loading="lazy"
              class="h-auto w-full transition duration-500 group-hover:scale-[1.03] group-hover:brightness-110">
          </button>
        </li>
      </ul>
    </section>

    <section class="border-t border-[#222025] bg-night-raised">
      <div class="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-8 px-4 py-20 sm:px-8 lg:px-12">
        <h2 class="max-w-2xl text-[clamp(36px,5vw,56px)] leading-none font-bold">{{ t('GalleryPage.ctaTitle') }}</h2>
        <div class="flex flex-wrap gap-3.5">
          <NuxtLink :to="{ path: localePath('vip'), hash: '#request' }" class="btn-pill btn-pink">{{ t('IndexPage.ctaVip') }}</NuxtLink>
          <a :href="SITE.instagram" target="_blank" rel="noopener" class="btn-pill btn-ghost">{{ SITE.instagramHandle }}</a>
        </div>
      </div>
    </section>

    <dialog
      ref="box"
      class="lightbox m-0 h-dvh max-h-none w-screen max-w-none bg-black/95 p-0 text-white backdrop:bg-black/80"
      :aria-label="t('GalleryPage.title')"
      @keydown="onKey"
      @click.self="box?.close()"
    >
      <div class="relative flex h-full items-center justify-center p-4 sm:p-16" @touchstart.passive="touchX = $event.touches[0]?.clientX ?? 0" @touchend="onTouchEnd">
        <img :key="active.src" :src="active.src" :alt="active.alt" :width="active.width" :height="active.height" class="lightbox-img max-h-full max-w-full object-contain">
        <p class="absolute inset-x-0 bottom-4 flex justify-center px-4">
          <span class="rounded-full bg-black/75 px-4 py-2 text-center text-sm text-[#e6e3e8] backdrop-blur">{{ active.alt }} · {{ current + 1 }}/{{ photos.length }}</span>
        </p>
        <button type="button" class="absolute top-4 right-4 flex size-12 items-center justify-center rounded-full bg-hub-400 text-night" :aria-label="t('GalleryPage.close')" @click="box?.close()">
          <UIcon name="i-lucide-x" class="size-6" />
        </button>
        <button type="button" class="absolute left-2 flex size-12 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 sm:left-4" :aria-label="t('GalleryPage.prev')" @click="step(-1)">
          <UIcon name="i-lucide-chevron-left" class="size-7" />
        </button>
        <button type="button" class="absolute right-2 flex size-12 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 sm:right-4" :aria-label="t('GalleryPage.next')" @click="step(1)">
          <UIcon name="i-lucide-chevron-right" class="size-7" />
        </button>
      </div>
    </dialog>
  </div>
</template>

<style scoped>
.lightbox[open] { animation: lb-in 0.25s ease; }
.lightbox-img { animation: lb-img 0.3s ease; }
@keyframes lb-in { from { opacity: 0; } }
@keyframes lb-img { from { opacity: 0; transform: scale(0.97); } }
@media (prefers-reduced-motion: reduce) { .lightbox[open], .lightbox-img { animation: none; } }
</style>
