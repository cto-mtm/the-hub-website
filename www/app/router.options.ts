import type { RouterConfig } from '@nuxt/schema'

/**
 * Scrolling with page transitions:
 * - New page: jump to the top instantly once the new page is ready, so it never
 *   appears mid-page and glides up during the enter animation.
 * - Hash links (#request, #events): smooth-scroll to the target, under the fixed header.
 * - Back/forward: restore the saved position.
 */
export default <RouterConfig>{
  scrollBehavior(to, from, savedPosition) {
    const nuxtApp = useNuxtApp()
    const samePage = to.path === from.path
    const afterPageSwap = <T>(value: T) => samePage
      ? Promise.resolve(value)
      : new Promise<T>(resolve => nuxtApp.hooks.hookOnce('page:finish', () => resolve(value)))

    if (savedPosition) return afterPageSwap({ ...savedPosition, behavior: 'instant' as ScrollBehavior })
    if (to.hash) return afterPageSwap({ el: to.hash, top: 96, behavior: (samePage ? 'smooth' : 'instant') as ScrollBehavior })
    if (!samePage) return afterPageSwap({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior })
    return false
  }
}
