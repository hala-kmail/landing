/**
 * PRISM landing - the runtime every chapter plugs into.
 *
 * The page is a film you scroll. Each chapter owns a fixed, full-viewport
 * `.stage`; its `<section>` in the document is only a spacer whose height is
 * the chapter's length in viewport heights. Scroll position becomes progress
 * `p` (0..1) through the chapter that owns the current position, and that
 * chapter alone is visible and drawn. Chapters are pure functions of `p`:
 * `render(p)` sets every property it animates, every call, so any scroll jump
 * in any direction lands on the right frame.
 *
 * Nothing is wiped between scenes. A chapter that declares `release: { hold }`
 * plays only up to `hold` - its finished frame, before its own exit - and then
 * that frame scrolls up and away with the page while the next chapter's stage
 * comes up behind it, the way sections of an ordinary page do. Chapters without
 * `release` hand over in place, as one continuous shot.
 *
 * Above every stage floats one dot - the tittle of the `i` in PRISM - and it is
 * the page's character. The owning chapter says where it should be (`dot(p)`);
 * this file gives it a life on top of that: it breathes, blinks, stretches when
 * it moves fast, glances at the pointer, and can be grabbed and flung when the
 * chapter allows it.
 */

import { gsap } from 'gsap'
import Lenis from 'lenis'

/* ------------------------------------------------------------------ utils */

export const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
export const clamp = (v, a = 0, b = 1) => (v < a ? a : v > b ? b : v)
export const lerp = (a, b, t) => a + (b - a) * t
/** Local progress of `p` inside [a, b], clamped to 0..1. */
export const seg = (p, a, b) => clamp((p - a) / (b - a))
/** 1 inside [a, b], ramping in over `din` after a and out over `dout` before b. */
export const win = (p, a, b, din = 0.05, dout = din) =>
  Math.min(seg(p, a, a + din), 1 - seg(p, b - dout, b))
export const ease = (name) => gsap.parseEase(name)
export const E = {
  linear: (t) => t,
  out: ease('power3.out'),
  in: ease('power3.in'),
  inOut: ease('power3.inOut'),
  soft: ease('power2.out'),
  swift: ease('expo.out'),
  glide: ease('sine.inOut'),
  back: ease('back.out(1.7)'),
}

/**
 * The theme's colours, as #rrggbb. They follow <html data-theme> - the light theme by
 * default, the dark film when the visitor chose it - and are read from base.css's tokens
 * by readTheme(), so read them when you draw (COLORS.lime), never copy them at load.
 */
export const COLORS = {
  lime: '#c9f144', // Prism, the truth: lime in the dark film, the brand's colour in light. Nothing else wears it.
  ink: '#f2f4ee',
  ink2: '#c9ccc2',
  grey: '#8a8d84', // the old way, a dimmed dot
  amber: '#f2b84e', // waiting (queue status) only
  rose: '#f2607e', // a guess, a wrong number - sparingly
  cold: '#a9c1ff',
}
const THEMED = { lime: '--lime', ink: '--ink', ink2: '--ink-2', grey: '--grey', amber: '--amber', rose: '--rose', cold: '--cold' }

let probe = null
let paint = null
const tones = new Map()
/**
 * A colour token's value in the current theme, as #rrggbb, whatever it is written in
 * (oklch, color-mix...): the browser resolves it on a probe, a 1px canvas turns it into sRGB.
 */
export function tone(name) {
  let v = tones.get(name)
  if (v) return v
  if (!probe) {
    probe = document.createElement('i')
    probe.setAttribute('aria-hidden', 'true')
    probe.style.display = 'none'
    document.body.appendChild(probe)
    paint = document.createElement('canvas').getContext('2d', { willReadFrequently: true })
    paint.canvas.width = paint.canvas.height = 1
  }
  probe.style.color = `var(${name})`
  paint.clearRect(0, 0, 1, 1)
  paint.fillStyle = '#000'
  paint.fillStyle = getComputedStyle(probe).color
  paint.fillRect(0, 0, 1, 1)
  const [r, g, b] = paint.getImageData(0, 0, 1, 1).data
  v = `#${[r, g, b].map((x) => x.toString(16).padStart(2, '0')).join('')}`
  tones.set(name, v)
  return v
}

function parseColor(c) {
  if (Array.isArray(c)) return c
  if (c[0] === '#') {
    const h = c.length === 4 ? c.slice(1).replace(/./g, (x) => x + x) : c.slice(1)
    return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16))
  }
  const m = c.match(/[\d.]+/g)
  return m ? m.slice(0, 3).map(Number) : [255, 255, 255]
}
/** Mix two colours (hex or rgb()) - returns `rgb(r, g, b)`. */
export function mix(a, b, t) {
  const A = parseColor(a)
  const B = parseColor(b)
  t = clamp(t)
  return `rgb(${A.map((v, i) => Math.round(lerp(v, B[i], t))).join(', ')})`
}

/** Deterministic PRNG - chapters must not use Math.random in render paths. */
export function rng(seed = 1) {
  let s = seed >>> 0 || 1
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296)
}

/* --------------------------------------------------------------- registry */

const chapters = []
const byId = new Map()
const view = { vw: innerWidth, vh: innerHeight, mobile: innerWidth < 760 }
const pointer = { x: innerWidth / 2, y: innerHeight / 2, active: false, t: 0 }
let lenis = null
let started = false
let clock = 0

/**
 * Register a chapter. `def`:
 *   id       - matches `<section data-chapter="id">`
 *   title    - label in the chapter rail (omit to keep it off the rail)
 *   anchorP  - where the rail / nav links land inside the chapter (default 0.12)
 *   build(ctx)          - once: query elements, split text, build paused timelines
 *   layout(ctx)         - on every resize (and after build): cache measurements
 *   render(p, ctx)      - pure: set everything from p (0..1)
 *   dot(p, ctx)         - pure: the dot's target state (see DOT_DEFAULT)
 *   tick(time, p, ctx)  - optional per-frame idle motion while the chapter is live
 *   intro(ctx)          - optional, hero only: returns a gsap timeline played once on load
 *   release  - optional { hold, standin }: stop at p = hold and let that frame scroll
 *              away (see above); `standin` leaves a still mark where the dot was, for
 *              frames in which the dot is part of what is drawn (a full stop, a radio)
 */
/** Call a chapter hook; a chapter that throws is reported once and skipped, never the page. */
function safe(c, hook, ...a) {
  const fn = c.def[hook]
  if (!fn) return undefined
  try {
    return fn.apply(c.def, a)
  } catch (e) {
    c.errors = (c.errors || 0) + 1
    if (c.errors < 4) console.error(`[prism] ${c.def.id}.${hook}:`, e)
    return undefined
  }
}

export function chapter(def) {
  const el = document.querySelector(`[data-chapter="${def.id}"]`)
  if (!el) {
    console.warn('[prism] no <section data-chapter> for', def.id)
    return null
  }
  const stage = el.querySelector(':scope > .stage')
  const ctx = {
    id: def.id,
    el,
    stage,
    $: (s) => stage.querySelector(s),
    $$: (s) => Array.from(stage.querySelectorAll(s)),
    state: {},
    p: 0,
    get vw() { return view.vw },
    get vh() { return view.vh },
    get mobile() { return view.mobile },
    get time() { return clock },
    reduced,
    pointer,
    dot: null, // filled with the rendered dot each frame
  }
  const rel = def.release || null
  const c = {
    def, el, stage, ctx,
    len: Number(el.dataset.len) || def.len || 2,
    hold: rel ? clamp(rel.hold ?? 1) : 1,
    release: !!rel,
    standin: null,
    top: 0, range: 1, pin: 1, span: 1, shift: 0,
    p: -1, live: false,
  }
  if (rel?.standin) {
    c.standin = document.createElement('i')
    c.standin.className = 'dot-standin'
    c.standin.setAttribute('aria-hidden', 'true')
    stage.appendChild(c.standin)
  }
  chapters.push(c)
  byId.set(def.id, c)
  return c
}

export const chapterById = (id) => byId.get(id)?.ctx ?? null

/* -------------------------------------------------------------------- dot */

/**
 * The dot's target state. Chapters return a partial object from `dot(p)`.
 *   x, y    viewport px of the centre (null = viewport centre)
 *   r       core radius px            color  hex or rgb()
 *   glow    halo + light strength      halo   halo radius as a multiple of r
 *   alpha   overall opacity            lean   0..1 glance toward the pointer
 *   grab    can be dragged and flung   blink  blinks now and then when still
 *   lag     seconds of smoothing toward the target (0 = glued to it)
 *   stretch velocity squash/stretch amount (0 = rigid)
 *   sx, sy  explicit squash (landing on something)   rot  degrees for sx/sy
 */
export const DOT_DEFAULT = {
  x: null, y: null, r: 10, color: COLORS.lime, glow: 1, halo: 3, alpha: 1,
  lean: 1, grab: false, blink: true, lag: 0.07, stretch: 1, sx: 1, sy: 1, rot: 0,
}

const BASE = 200 // px - the drawn size the dot's layers are scaled from

const dot = {
  el: null, core: null, halo: null, bloom: null, hit: null, ringBox: null,
  base: { x: innerWidth / 2, y: innerHeight / 2 },
  off: { x: 0, y: 0, vx: 0, vy: 0 }, // spring offset (drag / fling / hop)
  lean: { x: 0, y: 0 },
  vel: { x: 0, y: 0 },
  last: { x: innerWidth / 2, y: innerHeight / 2 },
  drag: null,
  hover: 0,
  blinkAt: 2.5,
  blinkU: -1,
  squash: 0, // click squash, decays
  color: '',
  rendered: { ...DOT_DEFAULT },
  target: { ...DOT_DEFAULT },
  grabbable: false,
}

function buildDot() {
  const el = document.createElement('div')
  el.id = 'dot'
  el.setAttribute('aria-hidden', 'true')
  el.innerHTML =
    '<i class="dot-bloom"></i><i class="dot-halo"></i><i class="dot-rings"></i><i class="dot-core"></i><i class="dot-hit"></i>'
  document.body.appendChild(el)
  Object.assign(dot, {
    el,
    bloom: el.querySelector('.dot-bloom'),
    halo: el.querySelector('.dot-halo'),
    core: el.querySelector('.dot-core'),
    hit: el.querySelector('.dot-hit'),
    ringBox: el.querySelector('.dot-rings'),
  })

  const hit = dot.hit
  hit.addEventListener('pointerenter', () => (dot.hoverOn = true))
  hit.addEventListener('pointerleave', () => (dot.hoverOn = false))
  hit.addEventListener('pointerdown', (e) => {
    if (!dot.grabbable) return
    e.preventDefault()
    hit.setPointerCapture(e.pointerId)
    dot.drag = { id: e.pointerId, sx: e.clientX, sy: e.clientY, moved: 0, hist: [] }
    document.documentElement.classList.add('is-dragging-dot')
    if (lenis) lenis.stop()
  })
  hit.addEventListener('pointermove', (e) => {
    const d = dot.drag
    if (!d || d.id !== e.pointerId) return
    d.moved = Math.max(d.moved, Math.hypot(e.clientX - d.sx, e.clientY - d.sy))
    d.hist.push({ x: e.clientX, y: e.clientY, t: performance.now() })
    if (d.hist.length > 6) d.hist.shift()
  })
  const release = (e) => {
    const d = dot.drag
    if (!d || d.id !== e.pointerId) return
    dot.drag = null
    document.documentElement.classList.remove('is-dragging-dot')
    if (lenis) lenis.start()
    if (d.moved < 5) {
      poke()
      return
    }
    // fling: hand the spring the release velocity
    const h = d.hist
    if (h.length > 1) {
      const a = h[0]
      const b = h[h.length - 1]
      const dt = Math.max(16, b.t - a.t) / 1000
      dot.off.vx = clamp((b.x - a.x) / dt, -4000, 4000)
      dot.off.vy = clamp((b.y - a.y) / dt, -4000, 4000)
    }
    emit('dot:fling')
  }
  hit.addEventListener('pointerup', release)
  hit.addEventListener('pointercancel', release)
  // keyboard: the dot is decorative for assistive tech; Enter on the page does nothing to it.
}

/** A click on the dot: it hops and sends a ring out. */
function poke() {
  dot.off.vy -= 520
  dot.squash = 1
  ring()
  emit('dot:poke')
}

/** Send one ring out from the dot (decorative). */
export function ring(color) {
  if (!dot.ringBox || reduced) return
  const r = document.createElement('i')
  r.className = 'dot-ring'
  if (color) r.style.color = color
  dot.ringBox.appendChild(r)
  const s = (dot.rendered.r * 2) / BASE
  gsap.fromTo(
    r,
    { scale: s, opacity: 0.7 },
    { scale: s * 6.5, opacity: 0, duration: 1.1, ease: 'expo.out', onComplete: () => r.remove() },
  )
}

/** Kick the dot (px/s). Decorative; the spring brings it back to its target. */
export function impulse(vx = 0, vy = 0) {
  if (reduced) return
  dot.off.vx += vx
  dot.off.vy += vy
}

function updateDot(t, dt) {
  const T = dot.target
  const tx = T.x ?? view.vw / 2
  const ty = T.y ?? view.vh / 2

  // 1. follow the target (lag = time constant in seconds)
  const k = T.lag > 0 ? 1 - Math.exp(-dt / T.lag) : 1
  dot.base.x = lerp(dot.base.x, tx, k)
  dot.base.y = lerp(dot.base.y, ty, k)

  // 2. glance at the pointer
  let lx = 0
  let ly = 0
  if (!reduced && pointer.active && T.lean > 0 && !dot.drag) {
    const dx = pointer.x - dot.base.x
    const dy = pointer.y - dot.base.y
    const d = Math.hypot(dx, dy) || 1
    const pull = Math.min(d * 0.03, 9) * T.lean * (d < 520 ? 1 : 520 / d)
    lx = (dx / d) * pull
    ly = (dy / d) * pull
  }
  const lk = 1 - Math.exp(-dt / 0.25)
  dot.lean.x = lerp(dot.lean.x, lx, lk)
  dot.lean.y = lerp(dot.lean.y, ly, lk)

  // 3. drag / fling / hop spring
  const o = dot.off
  if (dot.drag) {
    const want = { x: pointer.x - dot.base.x, y: pointer.y - dot.base.y }
    const dk = 1 - Math.exp(-dt / 0.05)
    const nx = lerp(o.x, want.x, dk)
    const ny = lerp(o.y, want.y, dk)
    o.vx = (nx - o.x) / Math.max(dt, 1e-3)
    o.vy = (ny - o.y) / Math.max(dt, 1e-3)
    o.x = nx
    o.y = ny
  } else {
    const w = 15 // stiffness (rad/s)
    const z = 0.42 // damping ratio - underdamped, so it overshoots once like a ball on a string
    const steps = 4
    const h = dt / steps
    for (let i = 0; i < steps; i++) {
      const ax = -w * w * o.x - 2 * z * w * o.vx
      const ay = -w * w * o.y - 2 * z * w * o.vy
      o.vx += ax * h
      o.vy += ay * h
      o.x += o.vx * h
      o.y += o.vy * h
    }
  }

  const x = dot.base.x + dot.lean.x + o.x
  const y = dot.base.y + dot.lean.y + o.y

  // velocity for squash and stretch
  const vk = 1 - Math.exp(-dt / 0.06)
  dot.vel.x = lerp(dot.vel.x, (x - dot.last.x) / Math.max(dt, 1e-3), vk)
  dot.vel.y = lerp(dot.vel.y, (y - dot.last.y) / Math.max(dt, 1e-3), vk)
  dot.last.x = x
  dot.last.y = y
  const speed = Math.hypot(dot.vel.x, dot.vel.y)

  // breathing
  const breathe = reduced ? 0 : Math.sin((t * Math.PI * 2) / 3.4)
  const r = T.r * (1 + 0.035 * breathe)

  // blink: a quick vertical squash, only when still
  let blink = 1
  if (!reduced && T.blink && !dot.drag) {
    if (dot.blinkU < 0 && t > dot.blinkAt && speed < 40) dot.blinkU = 0
    if (dot.blinkU >= 0) {
      dot.blinkU += dt / 0.17
      blink = 1 - 0.82 * Math.sin(Math.PI * Math.min(dot.blinkU, 1))
      if (dot.blinkU >= 1) {
        dot.blinkU = -1
        // sometimes a double blink
        dot.blinkAt = t + (Math.sin(t * 12.9898) > 0.55 ? 0.22 : 3.2 + 3.6 * (0.5 + 0.5 * Math.sin(t * 78.233)))
      }
    }
  }

  // click squash
  dot.squash = Math.max(0, dot.squash - dt * 3.2)
  const sq = reduced ? 0 : Math.sin(dot.squash * Math.PI) * 0.28

  const st = reduced ? 0 : Math.min(0.34, speed / 3600) * T.stretch
  const ang = Math.atan2(dot.vel.y, dot.vel.x)

  // hover: the dot leans in a little when you are over it
  dot.hover = lerp(dot.hover, dot.hoverOn && T.grab ? 1 : 0, 1 - Math.exp(-dt / 0.12))
  const hoverK = 1 + 0.18 * dot.hover

  const s = ((r * 2) / BASE) * hoverK
  const csx = T.sx * (1 + st) * (1 + sq)
  const csy = T.sy * (1 - st * 0.55) * blink * (1 - sq * 0.8)

  dot.el.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0)`
  dot.el.style.opacity = T.alpha.toFixed(3)
  dot.core.style.transform =
    `rotate(${(st > 0.004 ? ang : (T.rot * Math.PI) / 180).toFixed(4)}rad) scale(${(s * csx).toFixed(4)}, ${(s * csy).toFixed(4)})`
  const g = T.glow * (1 + (reduced ? 0 : 0.07 * breathe)) * (1 + 0.35 * dot.hover)
  dot.halo.style.transform = `scale(${((r * 2 * T.halo) / BASE) * (1 + st * 0.4)})`
  dot.halo.style.opacity = clamp(g, 0, 1.6).toFixed(3)
  dot.bloom.style.transform = `scale(${((r * 2 * 13) / BASE).toFixed(4)})`
  dot.bloom.style.opacity = clamp(g * 0.16, 0, 0.4).toFixed(3)
  if (dot.color !== T.color) {
    dot.el.style.color = T.color
    dot.color = T.color
  }
  const grabbable = !!T.grab && !reduced
  if (grabbable !== dot.grabbable) {
    dot.grabbable = grabbable
    dot.el.classList.toggle('is-grabbable', grabbable)
    if (!grabbable && dot.drag) {
      dot.drag = null
      document.documentElement.classList.remove('is-dragging-dot')
      if (lenis) lenis.start()
    }
  }
  dot.hit.style.transform = `scale(${Math.max(1, (r * 2 + 28) / 40)})`

  Object.assign(dot.rendered, T, { x, y, r, speed })
}

/* -------------------------------------------------------- ambient canvas */

// pool and dust strength, and the dust's colour, come from the theme (readTheme)
const fx = { cv: null, g: null, motes: [], w: 0, h: 0, lastY: 0, drift: 0, pool: 1, dustA: 1, dust: [230, 232, 226] }

function buildFx() {
  const cv = document.createElement('canvas')
  cv.id = 'fx'
  cv.setAttribute('aria-hidden', 'true')
  document.body.prepend(cv)
  fx.cv = cv
  fx.g = cv.getContext('2d')
  const R = rng(7)
  fx.motes = Array.from({ length: 70 }, () => ({
    x: R(),
    y: R(),
    z: 0.25 + R() * 0.75, // depth: nearer motes are bigger, brighter, faster
    a: 0.25 + R() * 0.75,
    ph: R() * Math.PI * 2,
  }))
  sizeFx()
}

function sizeFx() {
  const dpr = Math.min(1.5, devicePixelRatio || 1)
  fx.w = view.vw
  fx.h = view.vh
  fx.cv.width = Math.round(fx.w * dpr)
  fx.cv.height = Math.round(fx.h * dpr)
  fx.g.setTransform(dpr, 0, 0, dpr, 0, 0)
}

function drawFx(t, y) {
  const g = fx.g
  const { w, h } = fx
  g.clearRect(0, 0, w, h)
  const d = dot.rendered
  const col = parseColor(d.color.startsWith('rgb') || d.color.startsWith('#') ? d.color : COLORS.lime)

  // a pool of light on the ground around the dot
  const R = Math.max(w, h) * 0.55
  const a = clamp(0.085 * d.glow * d.alpha, 0, 0.16) * fx.pool
  if (a > 0.002) {
    const grd = g.createRadialGradient(d.x, d.y, 0, d.x, d.y, R)
    grd.addColorStop(0, `rgba(${col[0]},${col[1]},${col[2]},${a})`)
    grd.addColorStop(0.35, `rgba(${col[0]},${col[1]},${col[2]},${a * 0.35})`)
    grd.addColorStop(1, `rgba(${col[0]},${col[1]},${col[2]},0)`)
    g.fillStyle = grd
    g.fillRect(0, 0, w, h)
  }

  // dust: drifts, and parallaxes with the scroll
  const dy = y - fx.lastY
  fx.lastY = y
  if (!reduced) fx.drift += dy
  for (const m of fx.motes) {
    const px = ((m.x * w + (reduced ? 0 : Math.sin(t * 0.13 * m.z + m.ph) * 30 * m.z)) % w + w) % w
    const py = ((m.y * h - fx.drift * m.z * 0.35 - (reduced ? 0 : t * 6 * m.z)) % h + h) % h
    const near = Math.hypot(px - d.x, py - d.y)
    const lit = clamp(1 - near / (R * 0.8)) * d.glow * d.alpha
    const alpha = ((0.05 + 0.13 * m.a) * m.z + lit * 0.35) * fx.dustA
    const rr = 0.5 + m.z * 1.1
    const du = fx.dust
    g.fillStyle = lit > 0.05
      ? `rgba(${Math.round(lerp(du[0], col[0], lit))},${Math.round(lerp(du[1], col[1], lit))},${Math.round(lerp(du[2], col[2], lit))},${alpha.toFixed(3)})`
      : `rgba(${du[0]},${du[1]},${du[2]},${alpha.toFixed(3)})`
    g.beginPath()
    g.arc(px, py, rr, 0, Math.PI * 2)
    g.fill()
  }
}

/* -------------------------------------------------------------- the rail */

let rail = null
function buildRail() {
  const items = chapters.filter((c) => c.def.title)
  if (!items.length) return
  rail = document.createElement('nav')
  rail.className = 'rail'
  rail.setAttribute('aria-label', 'Story chapters')
  rail.innerHTML = items
    .map(
      (c) =>
        `<button type="button" data-go="${c.def.id}"><span class="rail-label">${c.def.title}</span><i></i></button>`,
    )
    .join('')
  document.body.appendChild(rail)
  rail.addEventListener('click', (e) => {
    const b = e.target.closest('[data-go]')
    if (b) go(b.dataset.go)
  })
}

/* ---------------------------------------------------------------- layout */

function measure() {
  view.vw = innerWidth
  view.vh = innerHeight
  view.mobile = view.vw < 760
  document.documentElement.style.setProperty('--vh', `${view.vh}px`)
  const last = chapters[chapters.length - 1]
  for (const c of chapters) {
    c.range = c.len * view.vh // p runs 0..1 over this much scroll ...
    c.pin = c.hold * c.range // ... and the stage stays put while it runs to `hold`
    // a releasing chapter (and the last one) keeps one more screen, over which its
    // final frame scrolls away with the page
    c.span = c.pin + (c.release || c === last ? view.vh : 0)
    c.el.style.height = `${c.span}px`
    // measure stages where they rest
    c.stage.style.transform = ''
    c.shift = 0
  }
  for (const c of chapters) c.top = c.el.getBoundingClientRect().top + scrollY
  for (const c of chapters) {
    safe(c, 'layout', c.ctx)
    c.p = -1 // force a re-render
  }
  if (fx.cv) sizeFx()
  lenis?.resize()
}

let resizeTimer = 0
let lastW = innerWidth
let lastH = innerHeight
function onResize() {
  clearTimeout(resizeTimer)
  resizeTimer = setTimeout(() => {
    // phones resize the viewport when the URL bar slides; ignore small height-only changes
    if (innerWidth === lastW && Math.abs(innerHeight - lastH) < 140 && innerWidth < 760) return
    lastW = innerWidth
    lastH = innerHeight
    measure()
  }, 120)
}

/* ------------------------------------------------------------ navigation */

/** Scroll to chapter `id` at progress `p`. */
export function go(id, p, opts = {}) {
  const y = storyY(id, p ?? byId.get(id)?.def.anchorP ?? 0.12)
  if (y == null) return
  if (lenis) lenis.scrollTo(y, { immediate: !!opts.immediate, duration: opts.duration ?? 1.8, force: true })
  else window.scrollTo({ top: y, behavior: opts.immediate || reduced ? 'auto' : 'smooth' })
}

/** The scroll position that shows chapter `id` at progress `p` (a releasing chapter stops at its hold). */
export function storyY(id, p) {
  const c = byId.get(id)
  return c ? Math.round(c.top + Math.min(p, c.hold) * c.range) : null
}

export function scrollTo(y, opts = {}) {
  if (lenis) lenis.scrollTo(y, { immediate: !!opts.immediate, duration: opts.duration ?? 1.8, force: true })
  else window.scrollTo({ top: y, behavior: opts.immediate || reduced ? 'auto' : 'smooth' })
}

/* ----------------------------------------------------------------- events */

const listeners = new Map()
export function on(name, fn) {
  if (!listeners.has(name)) listeners.set(name, new Set())
  listeners.get(name).add(fn)
  return () => listeners.get(name).delete(fn)
}
export function emit(name, data) {
  listeners.get(name)?.forEach((fn) => fn(data))
}

/* ------------------------------------------------------------------ frame */

let owner = null
let lastOwner = null

function frame(time, deltaMs) {
  clock = time
  if (!chapters.length) return
  const dt = Math.min(0.05, Math.max(0.001, deltaMs / 1000))
  const y = scrollY

  // who owns this scroll position
  let own = chapters[0]
  for (const c of chapters) if (y >= c.top - 0.5) own = c
  owner = own

  // past its pinned stretch a releasing chapter scrolls away with the page and the
  // next chapter's stage comes up behind it (u: 0..1 over one screen)
  const u = own.release ? clamp((y - own.top - own.pin) / view.vh) : 0
  const next = u > 0 ? chapters[chapters.indexOf(own) + 1] ?? null : null

  for (const c of chapters) {
    const live = c === own || c === next
    if (live !== c.live) {
      c.live = live
      c.stage.classList.toggle('is-live', live)
      c.el.classList.toggle('is-live', live)
    }
    if (!live) {
      setShift(c, 0)
      continue
    }
    // the incoming chapter waits on its first frame until it has arrived
    const p = c === next ? 0 : Math.min(c.hold, clamp((y - c.top) / c.range))
    c.ctx.dot = dot.rendered
    if (p !== c.p) {
      c.p = p
      c.ctx.p = p
      safe(c, 'render', p, c.ctx)
    }
    if (!u) safe(c, 'tick', time, p, c.ctx)
  }

  // past the end of the story the last stage scrolls away with the page as well
  const last = chapters[chapters.length - 1]
  const over = Math.max(0, y - (last.top + last.pin))
  setShift(own, own === last ? -over : -u * view.vh)
  if (next) setShift(next, (1 - u) * view.vh)

  // the dot
  let want = Object.assign({}, DOT_DEFAULT, safe(own, 'dot', own.p, own.ctx))
  if (next) want = handOff(want, Object.assign({}, DOT_DEFAULT, safe(next, 'dot', 0, next.ctx)), u, own)
  else if (own.standin) own.standin.style.opacity = '0'
  if (own === last && over > 0) companion(want, over)
  dot.target = want
  updateDot(time, dt)

  drawFx(time, y)

  // the rail follows whichever chapter fills more of the screen
  const lead = next && u >= 0.5 ? next : own
  if (lead !== lastOwner) {
    lastOwner = lead
    document.documentElement.dataset.chapter = lead.def.id
    rail?.querySelectorAll('[data-go]').forEach((b) => b.classList.toggle('is-on', b.dataset.go === lead.def.id))
    emit('chapter', lead.def.id)
  }
  const navOn = y > view.vh * 0.35
  if (navOn !== frame.navOn) {
    frame.navOn = navOn
    document.documentElement.classList.toggle('is-scrolled', navOn)
  }
}

function setShift(c, px) {
  if (c.shift === px) return
  c.shift = px
  c.stage.style.transform = px ? `translate3d(0, ${px.toFixed(1)}px, 0)` : ''
}

/**
 * Between a releasing chapter and the next one: the dot rides up with the
 * outgoing frame for a moment, then lets go and settles where the next chapter
 * starts - it arrives exactly on its mark as that stage arrives.
 */
function handOff(a, b, u, from) {
  const ax = a.x ?? view.vw / 2
  const ay = a.y ?? view.vh / 2
  const s = E.inOut(seg(u, 0.12, 1))
  if (from.standin) {
    // whatever the dot was in the outgoing frame stays drawn: a still mark takes its place
    const st = from.standin
    const d = `${(a.r * 2).toFixed(1)}px`
    st.style.width = d
    st.style.height = d
    st.style.transform = `translate3d(${(ax - a.r).toFixed(1)}px, ${(ay - a.r).toFixed(1)}px, 0)`
    st.style.color = a.color
    st.style.opacity = (seg(u, 0.14, 0.3) * a.alpha).toFixed(3)
  }
  return Object.assign({}, DOT_DEFAULT, {
    x: lerp(ax, b.x ?? view.vw / 2, s),
    y: lerp(ay - u * view.vh, b.y ?? view.vh / 2, s),
    r: lerp(a.r, b.r, s),
    color: s > 0 ? mix(a.color, b.color, s) : a.color,
    glow: lerp(a.glow, b.glow, s),
    halo: lerp(a.halo, b.halo, s),
    alpha: lerp(a.alpha, b.alpha, s),
    lean: 0,
    grab: false,
    blink: false,
    lag: 0.02,
    stretch: 0.6,
  })
}

/**
 * After the story: the dot leaves the wordmark, drifts down to the corner and
 * keeps you company. Clicking it there takes you back to the start.
 */
function companion(want, over) {
  const u = E.inOut(seg(over, view.vh * 0.08, view.vh * 0.75))
  const fromY = (want.y ?? view.vh / 2) - over
  const cx = view.vw - (view.mobile ? 34 : 46)
  const cy = view.vh - (view.mobile ? 34 : 46)
  // an arc, not a straight line
  want.x = lerp(want.x ?? view.vw / 2, cx, u) + Math.sin(u * Math.PI) * -60
  want.y = lerp(fromY, cy, u)
  want.r = lerp(want.r, 7, u)
  want.glow = lerp(want.glow, 0.9, u)
  want.color = u > 0 ? mix(want.color, COLORS.lime, u) : want.color
  want.lag = u > 0 && u < 1 ? 0.12 : want.lag
  want.lean = 1
  want.grab = false
  want.alpha = 1
  document.documentElement.classList.toggle('is-companion', u >= 0.98)
}

/* ----------------------------------------------------------------- theme */

/** Take the theme's colours from the stylesheet: on start, and whenever data-theme changes. */
function readTheme() {
  tones.clear()
  for (const k in THEMED) COLORS[k] = tone(THEMED[k])
  DOT_DEFAULT.color = COLORS.lime
  const cs = getComputedStyle(document.documentElement)
  fx.pool = parseFloat(cs.getPropertyValue('--fx-pool')) || 1
  fx.dustA = parseFloat(cs.getPropertyValue('--fx-dust')) || 1
  fx.dust = parseColor(tone('--dust'))
}

/* ----------------------------------------------------------------- start */

export async function start() {
  if (started) return
  started = true
  history.scrollRestoration = 'manual'
  document.documentElement.classList.add('js')
  if (reduced) document.documentElement.classList.add('reduced')

  chapters.sort((a, b) => (a.el.compareDocumentPosition(b.el) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1))

  buildFx()
  buildDot()
  buildRail()
  readTheme()
  // the theme switch (ThemeToggle.tsx) flips data-theme: every chapter re-measures and redraws in the new colours
  new MutationObserver(() => {
    readTheme()
    measure()
    emit('theme', document.documentElement.dataset.theme || 'light')
  }).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })

  addEventListener('pointermove', (e) => {
    pointer.x = e.clientX
    pointer.y = e.clientY
    pointer.active = e.pointerType === 'mouse' || e.pointerType === 'pen' || !!dot.drag
  }, { passive: true })
  document.documentElement.addEventListener('pointerleave', () => (pointer.active = false))
  addEventListener('resize', onResize)

  // keyboard users: focusing something inside a stage scrolls the story to it
  document.addEventListener('focusin', (e) => {
    const sec = e.target.closest?.('section.chapter')
    if (!sec || e.target.closest('.is-live')) return
    const c = chapters.find((x) => x.el === sec)
    if (c) go(c.def.id, Number(e.target.dataset.p ?? c.def.anchorP ?? 0.5), { immediate: true })
  })

  // in-page links: #ch-<id> or #<id> go to that chapter
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]')
    if (!a) return
    const id = a.getAttribute('href').slice(1).replace(/^ch-/, '')
    if (byId.has(id)) {
      e.preventDefault()
      go(id)
    } else if (id === 'top') {
      e.preventDefault()
      scrollTo(0)
    }
  })

  // the companion dot in the corner takes you home
  document.addEventListener('click', (e) => {
    if (!document.documentElement.classList.contains('is-companion')) return
    const d = dot.rendered
    if (Math.hypot(e.clientX - d.x, e.clientY - d.y) < 26) {
      scrollTo(0, { duration: 2.6 })
      ring()
    }
  })

  for (const c of chapters) safe(c, 'build', c.ctx)
  measure()

  if (!reduced) {
    lenis = new Lenis({ lerp: 0.085, wheelMultiplier: 0.95, touchMultiplier: 1.4, smoothWheel: true })
    gsap.ticker.add((t) => lenis.raf(t * 1000))
  }
  gsap.ticker.lagSmoothing(0)
  scrollTo(0, { immediate: true })

  // the dot waits at the centre of the loader while the fonts arrive
  dot.base.x = view.vw / 2
  dot.base.y = view.vh / 2
  gsap.ticker.add((t, d) => frame(t, d))

  await Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 2500))])
  await new Promise((r) => setTimeout(r, reduced ? 0 : 450))
  measure()
  document.documentElement.classList.add('is-ready')
  emit('ready')

  const hash = location.hash.slice(1).replace(/^ch-/, '')
  if (hash && byId.has(hash)) {
    go(hash, undefined, { immediate: true })
    return
  }
  const first = chapters[0]
  const intro = first ? safe(first, 'intro', first.ctx) : null
  if (intro && reduced) intro.progress(1)
}

/* ------------------------------------------------ test hooks (tools/shot) */

window.PRISM = {
  go,
  scrollTo,
  ring,
  impulse,
  chapters: () =>
    chapters.map((c) => ({ id: c.def.id, top: c.top, range: c.range, len: c.len, hold: c.hold, pin: c.pin, span: c.span, title: c.def.title })),
  get dot() { return { ...dot.rendered } },
  get owner() { return owner?.def.id },
  get lenis() { return lenis },
}
