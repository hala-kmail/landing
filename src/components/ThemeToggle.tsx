'use client'

import { useEffect, useSyncExternalStore } from 'react'
import { BAR, THEME_KEY } from '@/components/theme'

function subscribe(onChange: () => void) {
  const mo = new MutationObserver(onChange)
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
  return () => mo.disconnect()
}
const isDark = () => document.documentElement.dataset.theme === 'dark'

/**
 * Light is the default. This switches to the dark film and back, and saves the choice;
 * core.js sees data-theme change and redraws the story in the new colours. Both icons are
 * in the markup and CSS shows the right one, so nothing depends on hydration to look right.
 */
export default function ThemeToggle() {
  const dark = useSyncExternalStore(subscribe, isDark, () => false)

  // the browser bar follows the theme
  useEffect(() => {
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', dark ? BAR.dark : BAR.light)
  }, [dark])

  const toggle = () => {
    const root = document.documentElement
    if (dark) delete root.dataset.theme
    else root.dataset.theme = 'dark'
    try {
      localStorage.setItem(THEME_KEY, dark ? 'light' : 'dark')
    } catch {}
  }

  return (
    <button
      type="button"
      className="theme-toggle"
      aria-label="Dark theme"
      aria-pressed={dark}
      title={dark ? 'Switch to the light theme' : 'Switch to the dark theme'}
      onClick={toggle}
    >
      <svg className="theme-ico theme-ico-moon" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z" />
      </svg>
      <svg className="theme-ico theme-ico-sun" viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M5.3 18.7l1.6-1.6M17.1 6.9l1.6-1.6" />
      </svg>
    </button>
  )
}
