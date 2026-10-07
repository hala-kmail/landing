/**
 * 900 after - the page after the story (ordinary flow, not a chapter).
 *
 *  - Reveals: headings and the pill rise in as they scroll into view.
 *  - Capabilities: each card rises, then its marker dot lights lime and leaves
 *    a short trace along the card's top edge, staggered in reading order.
 *  - FAQ: native <details>, so it needs no script here; the items only rise in.
 *  - "Ask your first question": the pill's placeholder types the playground's
 *    example questions out in turn (one of them in Arabic, right to left). It is
 *    only a placeholder - the whole pill is one link that opens the playground;
 *    nothing is sent.
 *  - Footer: the wordmark is the vector one with its tittle as a separate mark,
 *    tagged `data-dot-home` - the place the companion dot can come home to at
 *    the very end (core toggles `.is-dot-home` and the static tittle steps aside).
 */
import { reduced } from '../core.js'
import { WORDMARK, wordmarkSVG } from '../brand.js'

const QUESTIONS = [
  'How did revenue compare to budget this year?',
  'Which clients have overdue invoices?',
  'أي الموردين لديهم أعلى نسبة فوز بالمناقصات؟',
  'Can I trust this data?',
]
const RTL = /[؀-ۿ]/

const root = document.getElementById('after')

if (root) {
  const hasIO = 'IntersectionObserver' in window

  /* ------------------------------------------- the footer wordmark (home) */
  const home = root.querySelector('.after-foot-wm')
  if (home) {
    const svg = wordmarkSVG({ className: 'after-foot-svg' })
    const { cx, cy, r } = WORDMARK.dot
    const tit = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
    tit.setAttribute('class', 'after-foot-tittle')
    tit.setAttribute('cx', cx)
    tit.setAttribute('cy', cy)
    tit.setAttribute('r', r)
    svg.appendChild(tit)
    home.appendChild(svg)
    home.classList.add('is-vector')
  }

  /* ---------------------------------------------------------- reveals */
  const rises = Array.from(root.querySelectorAll('.after-rise, .after-head'))
  const cards = Array.from(root.querySelectorAll('.after-card'))
  if (!hasIO) {
    rises.forEach((el) => el.classList.add('is-in'))
    cards.forEach((el) => el.classList.add('is-in', 'is-lit'))
  } else {
    const io = new IntersectionObserver(
      (entries) => {
        // stagger whatever arrives together, in reading order
        const inn = entries.filter((e) => e.isIntersecting).map((e) => e.target)
        const batch = cards.filter((c) => inn.includes(c))
        batch.forEach((el, k) => {
          el.style.setProperty('--d', `${reduced ? 0 : k * 110}ms`)
          el.classList.add('is-in', 'is-lit')
          io.unobserve(el)
        })
        inn
          .filter((el) => !cards.includes(el))
          .forEach((el) => {
            el.classList.add('is-in')
            io.unobserve(el)
          })
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0.2 },
    )
    rises.forEach((el) => io.observe(el))
    cards.forEach((el) => io.observe(el))
  }

  /* -------------------------------------------------- the typing pill */
  const pill = root.querySelector('.after-pill')
  const typed = root.querySelector('.after-typed')
  if (pill && typed && !reduced) {
    let qi = 0
    let ci = QUESTIONS[0].length // the first question starts out fully typed
    let phase = 'hold'
    let next = performance.now() + 1600
    let raf = 0
    let visible = false

    const setQ = (i) => {
      const rtl = RTL.test(QUESTIONS[i])
      pill.classList.toggle('is-rtl', rtl)
      typed.dir = rtl ? 'rtl' : 'ltr'
      typed.lang = rtl ? 'ar' : 'en'
    }
    const step = (now) => {
      raf = 0
      if (!visible || document.hidden) return
      if (now >= next) {
        const q = QUESTIONS[qi]
        if (phase === 'type') {
          ci = Math.min(q.length, ci + 1)
          typed.textContent = q.slice(0, ci)
          if (ci >= q.length) {
            phase = 'hold'
            pill.classList.remove('is-typing')
            next = now + 2100
          } else {
            const ch = q[ci - 1]
            next = now + (ch === ' ' ? 70 : 32 + Math.random() * 58) + (/[?,]/.test(ch) ? 120 : 0)
          }
        } else if (phase === 'hold') {
          phase = 'erase'
          pill.classList.add('is-typing')
          next = now
        } else {
          ci = Math.max(0, ci - 2)
          typed.textContent = q.slice(0, ci)
          if (ci === 0) {
            qi = (qi + 1) % QUESTIONS.length
            setQ(qi)
            phase = 'type'
            next = now + 420
          } else next = now + 15
        }
      }
      raf = requestAnimationFrame(step)
    }
    const run = () => {
      if (!raf && visible && !document.hidden) {
        // never resume mid-word after a long pause: hold what is there a moment
        next = Math.max(next, performance.now() + 300)
        raf = requestAnimationFrame(step)
      }
    }
    if (hasIO) {
      new IntersectionObserver(
        (entries) => {
          visible = entries.some((e) => e.isIntersecting)
          run()
        },
        { threshold: 0.1 },
      ).observe(pill)
    } else {
      visible = true
      run()
    }
    document.addEventListener('visibilitychange', run)
  }
}
