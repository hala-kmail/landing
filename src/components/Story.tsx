'use client'

import { useEffect } from 'react'

/**
 * The scroll story's runtime is plain DOM code (src/motion): each chapter module
 * registers itself against the markup when it is imported, then core starts the
 * frame loop, the dot and the smooth scroll. It needs the browser and the whole
 * page, so it loads here, once, after hydration. It renders nothing itself.
 */
export default function Story() {
  useEffect(() => {
    let live = true
    ;(async () => {
      const core = await import('@/motion/core.js')
      await Promise.all([
        import('@/motion/autoplay.js'),
        import('@/motion/chapters/000-hero.js'),
        import('@/motion/chapters/010-questions.js'),
        import('@/motion/chapters/020-wait.js'),
        import('@/motion/chapters/030-number.js'),
        import('@/motion/chapters/040-truth.js'),
        import('@/motion/chapters/050-why.js'),
        import('@/motion/chapters/060-asks.js'),
        import('@/motion/chapters/070-steps.js'),
        import('@/motion/chapters/080-language.js'),
        import('@/motion/chapters/090-hands.js'),
        import('@/motion/chapters/100-minutes.js'),
        import('@/motion/chapters/110-finale.js'),
        import('@/motion/chapters/900-after.js'),
      ])
      // start() runs once per page load; a development re-mount reaches it here only once
      if (live) core.start()
    })()
    return () => {
      live = false
    }
  }, [])

  return null
}
