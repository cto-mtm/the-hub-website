<script setup lang="ts">
/**
 * Champagne bubbles: the floating, scroll-reactive element.
 * Bubbles rise on their own; scrolling kicks them faster and drags them with the page,
 * then they settle back. Canvas, paused when off-screen or tab hidden, skipped for reduced motion.
 */
const props = withDefaults(defineProps<{
  /** Bubbles per 100,000 px² of area (density, so phones get fewer). */
  density?: number
  /** Share of bubbles tinted Hub pink (0–1). */
  pink?: number
  maxSize?: number
}>(), { density: 3.2, pink: 0.35, maxSize: 9 })

const canvas = ref<HTMLCanvasElement | null>(null)

interface Bubble { x: number, y: number, r: number, v: number, phase: number, wobble: number, pink: boolean, alpha: number }

onMounted(() => {
  const el = canvas.value
  if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  const ctx = el.getContext('2d')
  if (!ctx) return

  let w = 0
  let h = 0
  let bubbles: Bubble[] = []
  let raf = 0
  let visible = false
  let boost = 0
  let drag = 0
  let lastY = window.scrollY
  const dpr = Math.min(window.devicePixelRatio || 1, 2)

  const make = (anywhere: boolean): Bubble => {
    const r = 1.5 + Math.random() ** 2 * props.maxSize
    return {
      x: Math.random() * w,
      y: anywhere ? Math.random() * h : h + r + Math.random() * 40,
      r,
      v: 0.25 + Math.random() * 0.6 + r * 0.04,
      phase: Math.random() * Math.PI * 2,
      wobble: 0.3 + Math.random() * 0.9,
      pink: Math.random() < props.pink,
      alpha: 0.35 + Math.random() * 0.45
    }
  }

  function resize() {
    const rect = el!.getBoundingClientRect()
    w = rect.width
    h = rect.height
    el!.width = Math.round(w * dpr)
    el!.height = Math.round(h * dpr)
    ctx!.setTransform(dpr, 0, 0, dpr, 0, 0)
    const count = Math.round((w * h) / 100000 * props.density)
    bubbles = Array.from({ length: Math.min(count, 120) }, () => make(true))
  }

  function draw(t: number) {
    ctx!.clearRect(0, 0, w, h)
    for (const b of bubbles) {
      b.y -= b.v * (1 + boost) + drag * (0.15 + b.r * 0.03)
      b.x += Math.sin(t / 900 * b.wobble + b.phase) * 0.25
      if (b.y < -b.r * 2) Object.assign(b, make(false))
      if (b.y > h + 60) b.y = -b.r

      const grad = ctx!.createRadialGradient(b.x - b.r * 0.35, b.y - b.r * 0.35, b.r * 0.1, b.x, b.y, b.r)
      grad.addColorStop(0, `rgba(255,255,255,${b.alpha * 0.9})`)
      grad.addColorStop(0.55, b.pink ? `rgba(232,51,122,${b.alpha * 0.25})` : `rgba(255,255,255,${b.alpha * 0.08})`)
      grad.addColorStop(1, b.pink ? `rgba(232,51,122,${b.alpha * 0.55})` : `rgba(255,255,255,${b.alpha * 0.4})`)
      ctx!.beginPath()
      ctx!.arc(b.x, b.y, b.r, 0, Math.PI * 2)
      ctx!.fillStyle = grad
      ctx!.fill()
    }
    // Scroll energy decays back to a calm fizz.
    boost *= 0.94
    drag *= 0.88
  }

  function loop(t: number) {
    draw(t)
    raf = visible && !document.hidden ? requestAnimationFrame(loop) : 0
  }
  function start() {
    if (!raf && visible && !document.hidden) raf = requestAnimationFrame(loop)
  }

  function onScroll() {
    const y = window.scrollY
    const dy = y - lastY
    lastY = y
    boost = Math.min(boost + Math.abs(dy) * 0.04, 6)
    drag = Math.max(-25, Math.min(25, drag + dy * 0.08))
  }

  const io = new IntersectionObserver(([e]) => {
    visible = !!e?.isIntersecting
    start()
  })
  const ro = new ResizeObserver(resize)
  resize()
  io.observe(el)
  ro.observe(el)
  window.addEventListener('scroll', onScroll, { passive: true })
  document.addEventListener('visibilitychange', start)

  onBeforeUnmount(() => {
    cancelAnimationFrame(raf)
    io.disconnect()
    ro.disconnect()
    window.removeEventListener('scroll', onScroll)
    document.removeEventListener('visibilitychange', start)
  })
})
</script>

<template>
  <canvas ref="canvas" class="pointer-events-none absolute inset-0 h-full w-full" aria-hidden="true" />
</template>
