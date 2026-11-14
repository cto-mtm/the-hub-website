/**
 * Layered depth: every element with `data-speed` drifts relative to its position
 * in the viewport (positive = slower than the page, negative = faster).
 * One rAF loop for the page; off for reduced motion and small screens.
 */
export function useParallax() {
  onMounted(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    if (!window.matchMedia('(min-width: 768px)').matches) return

    const els = [...document.querySelectorAll<HTMLElement>('[data-speed]')]
    if (!els.length) return
    let raf = 0

    function update() {
      raf = 0
      const vh = window.innerHeight
      for (const el of els) {
        const r = el.getBoundingClientRect()
        if (r.bottom < -200 || r.top > vh + 200) continue
        const fromCenter = r.top + r.height / 2 - vh / 2
        const speed = Number(el.dataset.speed) || 0
        el.style.transform = `translate3d(0, ${(fromCenter * speed * -0.25).toFixed(1)}px, 0)`
      }
    }
    const onScroll = () => { raf ||= requestAnimationFrame(update) }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })
    onBeforeUnmount(() => {
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    })
  })
}
