// hero (000) - home.
//
// The page opens on the dot alone, waiting at the centre of the loader. The
// PRISM letters write themselves outward from the i, the stem grows up from
// the baseline, and the dot crouches, jumps and lands on its i - a squash, a
// flare, a ring - and the stem and letters give a little under it. The promise
// rises in beneath. At rest the dot is a character: it glances at the pointer,
// can be pulled off its i and flung (the stem leans after it, and gives when
// it lands back), and its light falls on its own letters and follows it
// wherever it is dragged. After a few idle seconds it says so: "psst - you can
// grab me". Scrolling: the words rise away and the logo settles to the middle
// of the frame on its own; the dot crouches into its i (the stem takes the
// weight), springs off it, glances back at the empty i from the top of its
// leap with a blink, and swoops round to the centre (S1: centre, r 10, lime,
// glow 1) while the letters drift apart, fade and un-write behind it.
import { gsap } from 'gsap'
import { chapter, seg, clamp, lerp, E, COLORS, mix, ring, on, go } from '../core.js'
import { WORDMARK, wordmarkSVG, tittleAt } from '../brand.js'

const INTRO = 2.6 // seconds
const LAND = 1.62 // the dot touches down on its i
const HALO = WORDMARK.halo / WORDMARK.dot.r
const SIDE = { P: -2, R: -1, S: 1, M: 2 }
const easeDraw = gsap.parseEase('power2.inOut')
const easeStem = gsap.parseEase('back.out(1.25)')
const easeFly = gsap.parseEase('power2.inOut')

// scroll beats (chapter progress)
const SETTLE = [0.1, 0.25] // the logo, alone now (the h1 has gone by ~0.15), settles toward the middle of the frame
const CROUCH = [0.08, 0.18] // the dot sits down into its i
const FLIGHT = [0.18, 0.72] // ... lifts off and arcs to the centre
const LIFT = 0.3 // the top of the lift-off, where it looks back at its i
const FADE = [0.17, 0.36] // the letters fade ... (before their shapes become ambiguous)
const UNWRITE = [0.23, 0.5] // ... while the pen rewinds
const MARK_CY = (WORDMARK.dot.cy - WORDMARK.dot.r + WORDMARK.height) / 2 // the logo's optical centre, viewBox units

const quad = (a, b, c, t) => (1 - t) * (1 - t) * a + 2 * t * (1 - t) * b + t * t * c
const bell = (p, a, b) => Math.sin(Math.PI * seg(p, a, b))

/** How far the logo has moved down toward the middle of the frame at p (px). */
const markDy = (p, s) => s.settleDy * E.inOut(seg(p, SETTLE[0], SETTLE[1]))
/** How deep the dot is crouched into its i at p (0..1); the stem takes the same weight. */
const crouch = (p) => E.inOut(seg(p, CROUCH[0], CROUCH[1])) * (1 - E.out(seg(p, FLIGHT[0], FLIGHT[0] + 0.05)))

/** Rise in out of nothing (u: 0..1), rise away (o: 0..1). Links stay focusable (hide = false). */
function rise(el, u, o, dist, hide = true) {
  const ui = E.out(u)
  const oi = E.inOut(o)
  const y = (1 - ui) * dist - oi * dist * 1.5
  el.style.opacity = (ui * (1 - oi)).toFixed(3)
  el.style.transform = `translate3d(0, ${y.toFixed(2)}px, 0)`
  const b = (1 - ui) * 7 + oi * 5
  el.style.filter = b > 0.05 ? `blur(${b.toFixed(2)}px)` : ''
  if (hide) el.style.visibility = ui * (1 - oi) > 0.001 ? '' : 'hidden'
}

/** Where the dot is during the intro (s.it seconds in). Glued: the motion is authored. */
function introPose(s, ctx) {
  const it = s.it
  const H = s.home
  const cx = ctx.vw / 2
  const cy = ctx.vh / 2
  const o = { x: H.x, y: H.y, r: H.r, glow: 1, sx: 1, sy: 1, lag: 0.07, stretch: 1 }
  if (it >= INTRO) return o
  o.lag = 0
  // while its letters are written it steps back a little, below the word, to watch
  const ly = Math.max(cy, s.base + (ctx.mobile ? 46 : 72))
  const back = E.inOut(seg(it, 0.2, 0.9))
  if (it < 0.95) return Object.assign(o, { x: cx, y: lerp(cy, ly, back), r: 10 })
  if (it < 1.18) {
    // anticipation: it crouches
    const u = E.inOut(seg(it, 0.95, 1.18))
    return Object.assign(o, { x: cx, y: ly + 12 * u, r: 10, sx: 1 + 0.24 * u, sy: 1 - 0.26 * u })
  }
  if (it < LAND) {
    // the jump: a thrown ball's arc, over the i and down onto it
    const u = seg(it, 1.18, LAND)
    const x0 = cx
    const y0 = ly + 12
    const x1 = lerp(cx, H.x, 0.5) + ctx.vw * (ctx.mobile ? 0.06 : 0.035)
    // the apex stays clear of the eyebrow, which only rises in once the dot has landed
    const y1 = H.y - Math.max(36, (y0 - H.y) * 0.5) - (ctx.mobile ? 30 : 42)
    return Object.assign(o, {
      x: quad(x0, x1, H.x, u),
      y: quad(y0, y1, H.y, u),
      r: lerp(10, H.r, E.inOut(u)),
      glow: 1 + 0.3 * u,
      stretch: 1.1,
    })
  }
  // touch-down: squash, rebound, settle; the flare fades
  const e = it - LAND
  const k = Math.exp(-e * 7.2) * Math.cos(e * 20)
  o.sx = 1 + 0.3 * k
  o.sy = 1 - 0.3 * k
  o.y = H.y + H.r * (1 - o.sy) * 0.85
  o.stretch = 0
  o.glow = 1 + 0.8 * Math.exp(-e * 3.4)
  return o
}

/** Transforms that mix the scroll with the decorative bumps (tick) - one writer for each element. */
function paint(ctx) {
  const s = ctx.state
  const e = ctx.time - s.bumpT
  const A = ctx.reduced ? 0 : s.bumpA
  const bump = e >= 0 && e < 1.4 ? A * Math.exp(-e * 7) * Math.cos(e * 26) : 0
  const k = Math.max(0.0001, s.stemK * (1 - bump))
  s.stem.style.transform = `rotate(${(s.reach * s.stemK).toFixed(3)}deg) scaleY(${k.toFixed(4)})`
  s.stem.style.opacity = s.stemO.toFixed(3)
  for (const L of s.letters) {
    const el = e - L.d * 0.055
    const rip = el > 0 && el < 1.4 ? A * 46 * Math.exp(-el * 6) * Math.sin(el * 24) : 0
    L.g.style.transform = `translate(${L.x.toFixed(2)}px, ${(L.y + rip).toFixed(2)}px)`
    L.g.style.opacity = L.o.toFixed(3)
    L.path.style.strokeDashoffset = L.dash.toFixed(4)
  }
}

const def = {
  id: 'hero',
  title: 'Prism',
  anchorP: 0,
  // the hero stays whole and scrolls away like the top of a page; its scroll-driven
  // exit below only plays if this is taken out
  release: { hold: 0 },

  build(ctx) {
    const s = ctx.state
    s.it = 0 // intro clock, seconds (INTRO = finished)
    s.lastIt = 0
    s.introStarted = false
    s.introDone = false
    s.bumpT = -99
    s.bumpA = 0
    s.reach = 0
    s.tilt = { x: 0, y: 0 }
    s.idle = 0
    s.px = -1
    s.py = -1
    s.hintDone = false
    s.stemK = 1
    s.stemO = 1
    s.settleDy = 0
    s.dy = 0

    s.col = ctx.$('.hero-col')
    s.mark = ctx.$('.hero-mark')
    s.eyebrow = ctx.$('.hero-eyebrow')
    s.h1 = ctx.$('.hero-h1')
    s.lead = ctx.$('.hero-lead')
    s.ctas = ctx.$('.hero-ctas')
    s.note = ctx.$('.hero-note')
    s.cue = ctx.$('.hero-cue')
    s.hint = ctx.$('.hero-hint')
    s.words = ctx.$$('.hero-w').map((el) => ({ el, mask: el.parentElement, line: 0, k: 0 }))
    s.btns = ctx.$$('.hero-cta').map((el) => ({ el, x: 0, y: 0, cx: 0, cy: 0, w: 1, h: 1, set: false }))

    // the wordmark, as vector letters; the hero dot is its tittle
    const svg = wordmarkSVG({ className: 'hero-wm' })
    ctx.$('.hero-mark').appendChild(svg)
    s.svg = svg

    // the dot's light on its own letters: a radial gradient that follows it.
    // The S is stroked in its pen's space, so it gets a copy mapped back.
    const NS = 'http://www.w3.org/2000/svg'
    const defs = svg.querySelector('defs')
    const grad = (id, gt) => {
      const g = document.createElementNS(NS, 'radialGradient')
      g.setAttribute('id', id)
      g.setAttribute('gradientUnits', 'userSpaceOnUse')
      g.setAttribute('cx', WORDMARK.dot.cx)
      g.setAttribute('cy', WORDMARK.dot.cy)
      g.setAttribute('r', 300)
      if (gt) g.setAttribute('gradientTransform', gt)
      g.innerHTML =
        `<stop offset="0" stop-color="${mix(COLORS.ink, COLORS.lime, 0.5)}"/>` +
        `<stop offset="0.38" stop-color="${mix(COLORS.ink, COLORS.lime, 0.14)}"/>` +
        `<stop offset="1" stop-color="${COLORS.ink}"/>`
      defs.appendChild(g)
      return g
    }
    const penG = svg.querySelector('.wm-S g[transform]')
    let gt = ''
    try {
      const m = penG.transform.baseVal.consolidate().matrix.inverse()
      gt = `matrix(${[m.a, m.b, m.c, m.d, m.e, m.f].map((v) => v.toFixed(6)).join(' ')})`
    } catch {}
    s.grads = [grad('hero-light'), grad('hero-light-s', gt)]
    s.gStops = s.grads.map((g) => g.firstChild)
    s.light = { x: WORDMARK.dot.cx, y: WORDMARK.dot.cy, c: '' }

    s.letters = Object.keys(SIDE).map((L) => {
      const g = svg.querySelector(`.wm-${L}`)
      const path = g.querySelector('.wm-stroke')
      path.setAttribute('stroke', `url(#${L === 'S' ? 'hero-light-s' : 'hero-light'})`)
      return { L, g, path, side: SIDE[L], d: Math.abs(SIDE[L]), x: 0, y: 0, o: 1, dash: 0 }
    })
    s.stem = svg.querySelector('.wm-stem')
    s.stem.setAttribute('fill', 'url(#hero-light)')

    // a deep link skips the intro: the hero is simply finished
    on('ready', () =>
      setTimeout(() => {
        if (s.introStarted) return
        s.it = INTRO
        s.introDone = true
        def.render(ctx.p, ctx)
      }, 0),
    )
    s.dismissHint = () => {
      if (s.hintDone) return
      s.hintDone = true
      s.hint.classList.remove('is-on')
      s.hint.classList.add('is-gone')
    }
    const touched = () => {
      s.flung = true
      s.flungAt = ctx.time
      s.away = false
      s.prev = null
      s.dismissHint()
    }
    on('dot:fling', touched)
    on('dot:poke', touched)
    // the hint never outlives the first scroll (the hero holds still at p = 0 as it scrolls away)
    addEventListener('scroll', () => scrollY > 4 && s.dismissHint(), { passive: true })

    // keyboard: once the buttons have risen away they are invisible, so focusing
    // one brings the hero back (core only does this for chapters that are not live)
    s.ctas.addEventListener('focusin', (e) => {
      let kb = true
      try {
        kb = e.target.matches(':focus-visible') // not a mouse click on a half-faded button
      } catch {}
      if (ctx.p > 0.01 && kb) go('hero', 0, { immediate: true })
    })
  },

  intro(ctx) {
    const s = ctx.state
    s.introStarted = true
    s.it = 0
    s.lastIt = 0
    const tl = gsap.timeline({ onComplete: () => (s.introDone = true) })
    tl.to(s, { it: INTRO, duration: INTRO, ease: 'none', onUpdate: () => def.render(ctx.p, ctx) })
    return tl
  },

  layout(ctx) {
    const s = ctx.state
    // the light's outer stops are the theme's (layout runs again when it changes); render keeps the inner one
    for (const g of s.grads) {
      g.children[1].setAttribute('stop-color', mix(COLORS.ink, COLORS.lime, 0.14))
      g.children[2].setAttribute('stop-color', COLORS.ink)
    }
    s.light.c = null
    s.svg.style.transform = 'none'
    s.mark.style.transform = 'none'
    s.tilt.x = s.tilt.y = 0
    const H = tittleAt(s.svg)
    s.home = H
    // the svg's origin in viewport px, to map the dot back into viewBox units
    s.ox = H.x - WORDMARK.dot.cx * H.scale
    s.oy = H.y - WORDMARK.dot.cy * H.scale
    s.base = s.oy + (WORDMARK.stem.y + WORDMARK.stem.h) * H.scale // the baseline
    // once the words have gone, the logo moves most of the way to the middle of the frame
    s.settleDy = (ctx.vh / 2 - (s.oy + MARK_CY * H.scale)) * 0.6

    // which line each word of the h1 sits on (the words rise line by line)
    const tops = []
    for (const w of s.words) {
      const t = w.mask.offsetTop
      let li = tops.findIndex((v) => Math.abs(v - t) < 6)
      if (li < 0) li = tops.push(t) - 1
      w.line = li
    }
    const perLine = {}
    for (const w of s.words) w.k = perLine[w.line] = (perLine[w.line] ?? -1) + 1

    // the buttons' resting centres (for the magnetic lean)
    s.ctas.style.transform = 'none'
    for (const B of s.btns) {
      B.el.style.translate = ''
      const r = B.el.getBoundingClientRect()
      B.cx = r.left + r.width / 2
      B.cy = r.top + r.height / 2
      B.w = r.width
      B.h = r.height
    }

    // the hint points at the dot from its right
    const tipX = H.x + H.r * 1.7 + 6
    const tipY = H.y - 4
    s.hint.style.left = `${(tipX - 6.5).toFixed(1)}px`
    s.hint.style.top = `${(tipY - 20).toFixed(1)}px`
  },

  render(p, ctx) {
    const s = ctx.state
    if (!s.home) return
    const it = s.it
    const m = ctx.mobile

    // touch-down one-shots, forward only
    if (s.lastIt < LAND && it >= LAND && it < LAND + 0.5) {
      ring(COLORS.lime)
      s.bumpT = ctx.time
      s.bumpA = 0.075
    }
    s.lastIt = it

    // words: the eyebrow (once the dot has landed, so the leap has the sky to itself),
    // the h1 line by line out of its masks, the lead, the buttons, the cue
    rise(s.eyebrow, seg(it, LAND - 0.02, 2.22), seg(p, 0.05, 0.2), 12)
    for (const w of s.words) {
      const a = 1.44 + w.line * 0.1 + w.k * 0.035
      const u = E.out(seg(it, a, a + 0.72))
      const b = 0.02 + w.line * 0.018 + w.k * 0.005
      const o = E.inOut(seg(p, b, b + 0.1))
      w.el.style.transform = `translate3d(0, ${((1 - u) * 108 - o * 108).toFixed(2)}%, 0)`
      w.el.style.opacity = (u * (1 - o)).toFixed(3)
    }
    rise(s.lead, seg(it, 1.68, 2.36), seg(p, 0.015, 0.155), 16)
    rise(s.ctas, seg(it, 1.86, 2.5), seg(p, 0, 0.13), 18, false)
    rise(s.note, seg(it, 1.98, 2.56), seg(p, 0, 0.12), 14)
    rise(s.cue, seg(it, 2.05, 2.6), seg(p, 0, 0.055), 10)
    s.ctas.style.pointerEvents = p > 0.08 ? 'none' : ''

    // alone now, the logo settles toward the middle of the frame (the dot rides along: see dot())
    s.dy = markDy(p, s)
    const mt = Math.abs(s.dy) > 0.05 ? `translate3d(0, ${s.dy.toFixed(2)}px, 0)` : ''
    if (s.mark.style.transform !== mt) s.mark.style.transform = mt

    // the letters write themselves outward from the i, and on scroll drift apart (on phones
    // they sink rather than spread, so they never leave the screen while still bright),
    // fade, and un-write - faint before any of them can read as another letter
    const drift = (ctx.vw * (m ? 0.035 : 0.13)) / s.home.scale
    for (const L of s.letters) {
      const a = 0.26 + (L.d - 1) * 0.2
      const draw = easeDraw(seg(it, a, a + 1.0))
      const e = E.inOut(seg(p, 0.1 + (2 - L.d) * 0.03, 0.46))
      L.x = (L.side / 2) * e * drift
      L.y = e * (m ? 16 : 12)
      L.o = 1 - E.inOut(seg(p, FADE[0], FADE[1]))
      L.dash = 1 - draw + easeDraw(seg(p, UNWRITE[0], UNWRITE[1])) // the pen rewinds
    }

    // the stem grows from the baseline; takes the dot's weight in the crouch, springs
    // as it leaves, and sinks once it has gone
    const grow = easeStem(seg(it, 0.5, 1.12))
    const c = crouch(p)
    const spring = Math.sin(Math.PI * seg(p, FLIGHT[0], FLIGHT[0] + 0.07)) * 0.05
    const sink = E.in(seg(p, 0.23, 0.44))
    s.stemK = grow * (1 - 0.12 * c + spring) * (1 - sink)
    s.stemO = clamp(seg(it, 0.5, 0.6)) * (1 - E.in(seg(p, 0.35, 0.44)))

    // the hint never outlives the first scroll
    if (p > 0.004) s.dismissHint()
    paint(ctx)
  },

  dot(p, ctx) {
    const s = ctx.state
    if (!s.home) return { lean: 0 }
    const H = s.home
    const b = introPose(s, ctx)
    const dy = markDy(p, s) // it rides the logo as it settles
    b.y += dy
    const hy = H.y + dy
    const cx = ctx.vw / 2
    const cy = ctx.vh / 2

    const f = seg(p, FLIGHT[0], FLIGHT[1])
    const c = crouch(p)
    // the crouch: it sinks most of the way down to its (compressed) stem, squashed
    const gap = (WORDMARK.stem.y - WORDMARK.dot.cy) * H.scale + 0.12 * WORDMARK.stem.h * H.scale - H.r * 0.74
    const dip = c * Math.max(0, gap - Math.max(3, H.r * 0.3))

    // lift-off: it springs up off its i (fast, then slowing to an apex) ...
    const lu = E.out(seg(p, FLIGHT[0], LIFT))
    const ax = H.x + ctx.vw * (ctx.mobile ? 0.03 : 0.015)
    const ay = hy - ctx.vh * (ctx.mobile ? 0.075 : 0.095)
    // ... hangs there a moment, glancing back down at its empty i with a blink ...
    const look = bell(p, LIFT - 0.035, LIFT + 0.055)
    const lx = H.x - ax
    const ly = hy + (WORDMARK.stem.y - WORDMARK.dot.cy) * H.scale - ay
    const ll = Math.hypot(lx, ly) || 1
    const blink = bell(p, LIFT + 0.004, LIFT + 0.03)
    // ... then swoops down and round into the centre
    const g = easeFly(seg(p, LIFT - 0.02, FLIGHT[1]))
    const gx = ax + ctx.vw * (ctx.mobile ? 0.2 : 0.11)
    const gy = lerp(ay, cy, 0.35)
    const x = lerp(b.x, ax, lu) + (quad(ax, gx, cx, g) - ax) + (lx / ll) * 6 * look
    const y = lerp(b.y, ay, lu) + (quad(ay, gy, cy, g) - ay) + dip + (ly / ll) * 6 * look
    const r = lerp(b.r, 10, g)

    return {
      x,
      y,
      r,
      color: COLORS.lime,
      glow: lerp(b.glow, 1, f) * (1 + 0.35 * bell(p, FLIGHT[0], 0.56)),
      halo: lerp(HALO, 3, g),
      sx: b.sx * (1 + 0.22 * c) * (1 + 0.12 * blink),
      sy: b.sy * (1 - 0.26 * c) * (1 - 0.78 * blink),
      lean: 0.5 * (1 - seg(p, 0.05, 0.2)) * (s.introDone ? 1 : 0),
      grab: s.introDone && p < 0.012,
      blink: s.introDone,
      lag: f > 0 && f < 1 ? 0.08 : b.lag,
      stretch: b.stretch,
    }
  },

  tick(time, p, ctx) {
    const s = ctx.state
    const dt = s.lastT ? clamp(time - s.lastT, 0, 0.05) : 0.016
    s.lastT = time
    if (ctx.reduced || !s.home) return
    const D = ctx.dot
    const H = s.home
    if (!D) return

    // 1. its light on its letters follows it (the logo may have settled down by s.dy)
    const lx = (D.x - s.ox) / H.scale
    const ly = (D.y - s.oy - s.dy) / H.scale
    if (Math.abs(lx - s.light.x) > 0.3 || Math.abs(ly - s.light.y) > 0.3) {
      s.light.x = lx
      s.light.y = ly
      for (const g of s.grads) {
        g.setAttribute('cx', lx.toFixed(1))
        g.setAttribute('cy', ly.toFixed(1))
      }
    }
    const lc = mix(COLORS.ink, COLORS.lime, clamp(0.5 * D.glow * D.alpha, 0, 0.78))
    if (lc !== s.light.c) {
      s.light.c = lc
      for (const st of s.gStops) st.setAttribute('stop-color', lc)
    }

    if (p > 0.3) return

    // 2. the wordmark turns, very slightly, toward the pointer (round the dot)
    const P = ctx.pointer
    const on = P.active && !ctx.mobile && p < 0.2
    const tx = on ? clamp(-(P.y - H.y) / ctx.vh, -0.5, 0.5) * 6 : 0
    const ty = on ? clamp((P.x - H.x) / ctx.vw, -0.5, 0.5) * 6 : 0
    const k = 1 - Math.exp(-dt / 0.4)
    s.tilt.x += (tx - s.tilt.x) * k
    s.tilt.y += (ty - s.tilt.y) * k
    if (Math.abs(s.tilt.x) + Math.abs(s.tilt.y) > 0.005) {
      s.svg.style.transform = `rotateX(${s.tilt.x.toFixed(3)}deg) rotateY(${s.tilt.y.toFixed(3)}deg)`
    } else if (s.svg.style.transform !== 'none') s.svg.style.transform = 'none'

    // 3. pulled away, the stem leans after its dot; flung back, it gives when the dot lands
    const dx = D.x - H.x
    const dy = D.y - H.y
    const dist = Math.hypot(dx, dy)
    const reach = p < 0.02 && s.introDone ? clamp(dx / 260, -1, 1) * 7 * clamp((dist - H.r) / 140) : 0
    s.reach += (reach - s.reach) * (1 - Math.exp(-dt / 0.09))
    if (s.flung) {
      if (dist > Math.max(10, H.r * 1.2)) s.away = true
      const crossed = s.prev && (s.prev.x * dx + s.prev.y * dy) < 0
      if (s.away && (dist < H.r * 0.5 || crossed)) {
        s.bumpT = time
        s.bumpA = clamp(D.speed / 14000, 0.035, 0.1)
        s.flung = false
        s.away = false
      }
      s.prev = { x: dx, y: dy }
      if (time - s.flungAt > 4) s.flung = false
    }

    // 4. the buttons lean toward a pointer that comes close (measured from their resting centres)
    for (const B of s.btns) {
      let bx = 0
      let by = 0
      if (on && P.active && p < 0.05 && s.introDone) {
        const dx = P.x - B.cx
        const dy = P.y - B.cy
        const near = clamp(1 - Math.hypot(dx / (B.w * 0.5 + 60), dy / (B.h * 0.5 + 40)))
        bx = dx * 0.16 * near
        by = dy * 0.22 * near
      }
      const kk = 1 - Math.exp(-dt / 0.16)
      B.x += (bx - B.x) * kk
      B.y += (by - B.y) * kk
      if (Math.abs(B.x) + Math.abs(B.y) > 0.02 || B.set) {
        B.el.style.translate = Math.abs(B.x) + Math.abs(B.y) > 0.02 ? `${B.x.toFixed(2)}px ${B.y.toFixed(2)}px` : ''
        B.set = Math.abs(B.x) + Math.abs(B.y) > 0.02
      }
    }

    // 5. "psst - you can grab me", once, after a few idle seconds - idle meaning no
    //    pointer movement and no grab; a visitor already holding the dot never sees it
    if (!s.hintDone) {
      if (document.documentElement.classList.contains('is-dragging-dot')) s.dismissHint()
      else if (s.introDone && !ctx.mobile && p < 0.004) {
        if (Math.hypot(P.x - s.px, P.y - s.py) > 2) s.idle = 0
        else s.idle += dt
        if (s.idle > 5 && !s.hint.classList.contains('is-on')) s.hint.classList.add('is-on')
      }
    }
    s.px = P.x
    s.py = P.y

    paint(ctx)
  },
}

chapter(def)
