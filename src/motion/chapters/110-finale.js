/**
 * 110 finale - home again.
 *
 * The dot has been a full stop, a status light, a radio button, a switch knob.
 * Its last role is the pen: it writes its own name, then does what you do last
 * when you sign - it dots the i. Then the end card assembles around it.
 *
 * Beats (p):
 *   0.00  S11: the dot alone at the centre, r 10, lime
 *   0.03  it rises in an arc and comes down to the foot of the P; two ruled
 *         hairlines (cap height, baseline) draw out, and a faint ghost of the
 *         wordmark shows where the letters will go
 *   0.10  the pen writes P, hops to R, writes R, hops to the i and rides the
 *         top of its stem up as it grows, hops to S, writes S, hops to M,
 *         writes M - each stroke trails a short lime "wet ink" tail that
 *         cools to ink behind the pen. On a phone the word is written large
 *         and the camera tracks the pen (P R, then the i, then S M).
 *   0.52  pen up: it lifts off the end of the M, arcs over the word and drops
 *         straight down onto the i (the phone camera pulls back to the whole
 *         word on the way) - it lands with a flat squash, a flare and a ring,
 *         and the stem (then its neighbours) give under it
 *   0.62  the camera pulls back: the lockup glides up and settles while the
 *         tagline rises out of its masks, then the line, the CTAs, the byline
 *   0.87  hold the final frame; the dot can be grabbed and flung (it springs
 *         home and the stem gives again), it hops toward the playground when
 *         you reach for it. Past p = 1 core scrolls the frame away and the dot
 *         becomes the corner companion.
 */
import { chapter, seg, clamp, lerp, E, COLORS, ring, impulse, on, go } from '../core.js'
import { WORDMARK as W, wordmarkSVG, tittleAt } from '../brand.js'


const FOOT = { x: W.stem.x + W.stem.w / 2, y: W.stem.y + W.stem.h }
const TOP = { x: FOOT.x, y: W.stem.y }
const TIT = { x: W.dot.cx, y: W.dot.cy }
const MID = { x: W.width / 2, y: W.stem.y + W.stem.h / 2 } // optical middle of the letters

const B = {
  rise: [0.03, 0.1],
  P: [0.1, 0.17],
  PR: [0.17, 0.19],
  R: [0.19, 0.27],
  RI: [0.27, 0.293],
  I: [0.293, 0.325],
  IS: [0.325, 0.35],
  S: [0.35, 0.42],
  SM: [0.42, 0.445],
  M: [0.445, 0.522],
  fly: [0.522, 0.6],
  ghost: [0.035, 0.1],
  guides: [0.035, 0.115],
  clear: [0.56, 0.64],
  morph: [0.622, 0.735],
  tag: 0.672,
  lead: [0.722, 0.8],
  ctas: [0.745, 0.83],
  by: [0.79, 0.87],
  // the phone camera: pans while the pen hops between letter groups
  pan1: [0.258, 0.3],
  pan2: [0.41, 0.452],
}
const LAND = B.fly[1]
const FLY = { arc: 0.6, hang: 0.72 } // inside B.fly: the arc to the apex, the hang, then the drop
const LETTERS = ['P', 'R', 'S', 'M']
const TAIL = 0.24 // length of the lime wet-ink tail, as a fraction of the letter
const COOL = 0.045 // how long (in p) a finished letter takes to cool
// the landing: one damped squash the dot and the stem share (first zero ~130 ms)
const SQ_RATE = 4.5
const SQ_FREQ = 12

// the pen's route between letters: [from, to] are either [letter, 'start'|'end'] or a point
const HOPS = [
  { at: B.PR, from: ['P', 1], to: ['R', 0] },
  { at: B.RI, from: ['R', 1], to: FOOT },
  { at: B.IS, from: TOP, to: ['S', 0] },
  { at: B.SM, from: ['S', 1], to: ['M', 0] },
]

/* --------------------------------------------------------------- helpers */

/** Polygons from an absolute M/L/H/V/Z path (the brand's clip shapes). */
function polys(d) {
  const out = []
  let cur = null
  let x = 0
  let y = 0
  const tok = d.match(/[MLHVZ]|-?[\d.]+/gi) || []
  for (let i = 0; i < tok.length; ) {
    const c = tok[i++]
    if (c === 'M' || c === 'L') {
      x = +tok[i++]
      y = +tok[i++]
      if (c === 'M') out.push((cur = []))
      cur.push([x, y])
    } else if (c === 'H') cur.push([(x = +tok[i++]), y])
    else if (c === 'V') cur.push([x, (y = +tok[i++])])
  }
  return out
}
function inside(pt, poly) {
  let c = false
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i]
    const [xj, yj] = poly[j]
    if (yi > pt[1] !== yj > pt[1] && pt[0] < ((xj - xi) * (pt[1] - yi)) / (yj - yi) + xi) c = !c
  }
  return c
}

/**
 * The writing camera: scale S and the translation that puts viewBox x `fx`
 * at screen x `X` (and the letters' middle at the writing line s.Y).
 */
function frameAt(s, S, fx, X) {
  return {
    S,
    Tx: X - s.cx - (s.ox + fx * s.k - s.cx) * S,
    Ty: s.Y - s.cy - (s.oy + MID.y * s.k - s.cy) * S,
  }
}

/** The camera while the word is written (pure in p). Desktop holds one framing. */
function cam(s, p) {
  if (!s.mobile) return s.fit
  const K = s.keys
  if (p >= B.fly[0]) {
    // pull back to the whole word while the dot arcs over it (still by the time it hangs)
    const t = E.inOut(seg(seg(p, ...B.fly), 0, FLY.hang))
    return frameAt(s, lerp(s.Sbig, s.Sfit, t), lerp(K.R.fx, K.fit.fx, t), lerp(K.R.X, K.fit.X, t))
  }
  let a = K.L
  let b = K.I
  let t = E.inOut(seg(p, ...B.pan1))
  if (p >= B.pan1[1]) {
    a = K.I
    b = K.R
    t = E.inOut(seg(p, ...B.pan2))
  }
  return frameAt(s, s.Sbig, lerp(a.fx, b.fx, t), lerp(a.X, b.X, t))
}

/** Map a viewBox point to viewport px under camera c at morph m (0 = writing, 1 = at rest). */
function view(s, vx, vy, m, c) {
  const sc = lerp(c.S, 1, m)
  const rx = s.ox + vx * s.k
  const ry = s.oy + vy * s.k
  return { x: s.cx + (rx - s.cx) * sc + c.Tx * (1 - m), y: s.cy + (ry - s.cy) * sc + c.Ty * (1 - m) }
}

const quad = (a, c, b, t) => ({
  x: (1 - t) * (1 - t) * a.x + 2 * t * (1 - t) * c.x + t * t * b.x,
  y: (1 - t) * (1 - t) * a.y + 2 * t * (1 - t) * c.y + t * t * b.y,
})
const cubic = (a, b, c, d, t) => {
  const u = 1 - t
  const w0 = u * u * u
  const w1 = 3 * u * u * t
  const w2 = 3 * u * t * t
  const w3 = t * t * t
  return { x: w0 * a.x + w1 * b.x + w2 * c.x + w3 * d.x, y: w0 * a.y + w1 * b.y + w2 * c.y + w3 * d.y }
}

/** Damped spring response for one-shots: 1 at impact, rings out. */
const ringOut = (dt, rate = SQ_RATE, freq = SQ_FREQ) =>
  dt < 0 || dt > 1.8 ? 0 : Math.exp(-dt * rate) * Math.cos(dt * freq)

/* --------------------------------------------------------------- chapter */

chapter({
  id: 'finale',
  title: 'Begin',
  anchorP: 0.04,

  build(ctx) {
    const s = ctx.state
    s.wm = ctx.$('.finale-wm')
    s.svg = wordmarkSVG({ className: 'finale-svg' })
    s.ghostSvg = wordmarkSVG({ className: 'finale-wm-ghost' })
    s.wm.prepend(s.ghostSvg)
    s.wm.appendChild(s.svg)
    s.cap = ctx.$('.finale-guide-cap')
    s.base = ctx.$('.finale-guide-base')
    s.lines = ctx.$$('.finale-line')
    s.lead = ctx.$('.finale-lead')
    s.ctas = ctx.$$('.finale-cta')
    s.goBtn = ctx.$('.finale-go')
    s.by = ctx.$('.finale-by')
    s.g = {}
    for (const L of ['P', 'R', 'I', 'S', 'M']) s.g[L] = s.svg.querySelector(`.wm-${L}`)

    // every stroke gets a lime twin on top - the wet ink right behind the pen
    s.L = {}
    for (const L of LETTERS) {
      const path = s.g[L].querySelector('.wm-stroke')
      path.setAttribute('stroke-dasharray', '1 1')
      path.setAttribute('stroke-dashoffset', '1')
      const hot = path.cloneNode(false)
      hot.setAttribute('class', 'finale-hot')
      hot.setAttribute('stroke-dasharray', '0 2')
      path.after(hot)

      // sample the centre line in viewBox units (the S is drawn in its pen's space)
      let M = new DOMMatrix()
      for (let n = path.parentNode; n && n !== s.svg; n = n.parentNode) {
        const tr = n.transform && n.transform.baseVal.consolidate()
        if (tr) M = new DOMMatrix([tr.matrix.a, tr.matrix.b, tr.matrix.c, tr.matrix.d, tr.matrix.e, tr.matrix.f]).multiply(M)
      }
      const len = path.getTotalLength()
      const N = 240
      const pts = []
      for (let i = 0; i <= N; i++) {
        const q = path.getPointAtLength((len * i) / N)
        const v = new DOMPoint(q.x, q.y).matrixTransform(M)
        pts.push([v.x, v.y, q.x, q.y])
      }
      // where the ink is visible (the R's leg and the S's terminals run on under a clip)
      let u0 = 0
      let u1 = 1
      const clipRef = (path.getAttribute('clip-path') || path.parentNode.getAttribute('clip-path') || '').match(/#([^)]+)/)
      const clipEl = clipRef && s.svg.querySelector(`[id="${clipRef[1]}"] path`)
      if (clipEl) {
        const P = polys(clipEl.getAttribute('d'))
        const vis = pts.map((q) => P.filter((poly) => inside([q[2], q[3]], poly)).length % 2 === 1)
        const a = vis.indexOf(true)
        const b = vis.lastIndexOf(true)
        if (a >= 0) {
          u0 = a / N
          u1 = b / N
        }
      }
      s.L[L] = { path, hot, pts, N, u0, u1 }
    }

    // the stem grows; a lime cap rides its top while it does
    s.stem = s.g.I.querySelector('.wm-stem')
    s.stemHot = s.stem.cloneNode(false)
    s.stemHot.setAttribute('class', 'finale-stemhot')
    s.stemHot.setAttribute('height', '0')
    s.stem.after(s.stemHot)

    s.pt = (L, u) => {
      const { pts, N } = s.L[L]
      const f = clamp(u) * N
      const i = Math.min(N - 1, Math.floor(f))
      const t = f - i
      return { x: lerp(pts[i][0], pts[i + 1][0], t), y: lerp(pts[i][1], pts[i + 1][1], t) }
    }
    s.end = (ref) => (Array.isArray(ref) ? s.pt(ref[0], ref[1] ? s.L[ref[0]].u1 : s.L[ref[0]].u0) : ref)

    // decorative state (never needed for a complete frame)
    s.lastP = 0
    s.landT = -9
    s.bumpT = -9
    s.flungAt = 0
    s.cta = 0
    s.ctaWant = 0
    s.hopAt = -9
    s.lastT = 0

    const live = () => ctx.stage.classList.contains('is-live')
    const landed = () => live() && ctx.p >= LAND + 0.01
    on('dot:fling', () => {
      if (landed()) s.flungAt = ctx.time
    })
    on('dot:poke', () => {
      // core hops it up; it comes back down onto the stem about a quarter second later
      if (landed()) s.bumpT = ctx.time + 0.23
    })
    s.goBtn.addEventListener('pointerenter', () => {
      s.ctaWant = 1
      if (!ctx.reduced && landed() && ctx.p > 0.84 && ctx.time - s.hopAt > 1.4 && s.goC && ctx.dot) {
        // it leans and pops toward the playground: that one
        s.hopAt = ctx.time
        impulse(clamp((s.goC.x - ctx.dot.x) * 2.4, -560, 560), -620)
        ring(COLORS.lime)
        s.bumpT = ctx.time + 0.24
      }
    })
    s.goBtn.addEventListener('pointerleave', () => (s.ctaWant = 0))
    s.goBtn.addEventListener('focus', () => (s.ctaWant = 1))
    s.goBtn.addEventListener('blur', () => (s.ctaWant = 0))
    // keyboard: the CTAs only exist at the end of the chapter - take the visitor there,
    // from before it (p < 0.9) and from after it (the frame has scrolled away; p is
    // clamped to 1 then, so read the unclamped position off the section itself)
    for (const a of s.ctas) {
      a.addEventListener('focus', () => {
        const r = ctx.el.getBoundingClientRect()
        const range = (Number(ctx.el.dataset.len) || 2.2) * ctx.vh
        const local = -r.top / range
        if (local < 0.9 || local > 1.001) go('finale', Number(a.dataset.p), { immediate: true })
      })
    }
  },

  layout(ctx) {
    const s = ctx.state
    s.wm.style.transform = 'none'
    const t = tittleAt(s.svg)
    const b = s.wm.getBoundingClientRect()
    if (!b.width) return
    s.k = t.scale
    s.ox = t.x - W.dot.cx * s.k
    s.oy = t.y - W.dot.cy * s.k
    s.cx = b.left + b.width / 2
    s.cy = b.top + b.height / 2
    s.mobile = ctx.mobile
    s.Y = ctx.vh * (ctx.mobile ? 0.47 : 0.5)
    // the whole word, big and centred: where the landing happens
    const ww = ctx.mobile ? ctx.vw * 0.9 : Math.min(ctx.vw * 0.74, 1060, ctx.vh * 1.3)
    s.Sfit = Math.max(1, ww / (W.width * s.k))
    s.fit = frameAt(s, s.Sfit, MID.x, ctx.vw / 2)
    // the apex of the toss: 150 units over the tittle, but never up under the nav on a short screen
    const vyAt = (Y) => ((Y - s.fit.Ty - s.cy) / s.Sfit + s.cy - s.oy) / s.k
    s.apexY = Math.max(TIT.y - 150, vyAt(ctx.vh * 0.19))
    // a phone writes the word much bigger than the screen and tracks the pen
    s.Sbig = Math.max(s.Sfit, (ctx.vw * 1.7) / (W.width * s.k))
    const edge = 24
    s.keys = {
      L: { fx: 0, X: edge }, // P and R
      I: { fx: FOOT.x, X: ctx.vw / 2 }, // the i (and the S beside it)
      R: { fx: W.width, X: ctx.vw - edge }, // S and M
      fit: { fx: MID.x, X: ctx.vw / 2 },
    }
    // where the playground CTA sits at rest (the dot hops toward it)
    for (const el of s.ctas) el.style.transform = 'none'
    const g = s.goBtn.getBoundingClientRect()
    s.goC = { x: g.left + g.width / 2, y: g.top + g.height / 2 }
  },

  render(p, ctx) {
    const s = ctx.state
    if (!s.k) return

    // the lockup: big while the pen works (tracked on a phone), then it settles at rest
    const c = cam(s, p)
    const m = E.inOut(seg(p, ...B.morph))
    const sc = lerp(c.S, 1, m)
    s.wm.style.transform =
      `translate3d(${(c.Tx * (1 - m)).toFixed(2)}px, ${(c.Ty * (1 - m)).toFixed(2)}px, 0) scale(${sc.toFixed(4)})`

    // the ghost of the word, and the ruled lines it is written on (a hairline at any scale)
    const clear = 1 - E.inOut(seg(p, ...B.clear))
    s.ghostSvg.style.opacity = (0.075 * E.out(seg(p, ...B.ghost)) * clear).toFixed(3)
    const gc = E.out(seg(p, B.guides[0], B.guides[1]))
    const gb = E.out(seg(p, B.guides[0] + 0.012, B.guides[1] + 0.012))
    const hair = (1 / sc).toFixed(4)
    s.cap.style.opacity = (gc > 0 ? clear * 0.8 : 0).toFixed(3)
    s.cap.style.transform = `scale(${gc.toFixed(4)}, ${hair})`
    s.base.style.opacity = (gb > 0 ? clear : 0).toFixed(3)
    s.base.style.transform = `scale(${gb.toFixed(4)}, ${hair})`

    // the letters: ink behind the pen, a lime tail at its tip that cools
    for (const L of LETTERS) {
      const o = s.L[L]
      const [a, b] = B[L]
      const t = E.glide(seg(p, a, b))
      const u = p <= a ? 0 : lerp(o.u0, o.u1, t)
      const drawn = p >= b ? 1 : u
      o.path.style.strokeDashoffset = (1 - drawn).toFixed(4)
      const heat = p <= a ? 0 : p < b ? 1 : 1 - seg(p, b, b + COOL)
      const from = Math.max(0, u - TAIL * (o.u1 - o.u0) * heat)
      const len = Math.max(0, u - from)
      if (heat > 0.001 && len > 0.002) {
        o.hot.style.opacity = Math.min(1, heat * 1.4).toFixed(3)
        o.hot.style.strokeDasharray = `${len.toFixed(4)} 2`
        o.hot.style.strokeDashoffset = (-from).toFixed(4)
      } else o.hot.style.opacity = '0'
    }

    // the i: its stem grows under the pen
    const gi = E.inOut(seg(p, ...B.I))
    s.stem.style.transform = `scaleY(${gi.toFixed(4)})`
    const iheat = p <= B.I[0] ? 0 : p < B.I[1] ? 1 : 1 - seg(p, B.I[1], B.I[1] + COOL)
    const grown = W.stem.h * gi
    const hh = Math.min(grown, 16) * iheat
    s.stemHot.setAttribute('y', (FOOT.y - grown).toFixed(2))
    s.stemHot.setAttribute('height', Math.max(0, hh).toFixed(2))

    // the end card: the tagline rises while the lockup is still settling
    s.lines.forEach((el, i) => {
      const t = E.out(seg(p, B.tag + i * 0.03, B.tag + i * 0.03 + 0.085))
      el.style.opacity = t > 0 ? '1' : '0'
      el.style.transform = `translate3d(0, ${((1 - t) * 108).toFixed(2)}%, 0)`
    })
    const tl = E.out(seg(p, ...B.lead))
    s.lead.style.opacity = tl.toFixed(3)
    s.lead.style.transform = `translate3d(0, ${((1 - tl) * 16).toFixed(2)}px, 0)`
    s.lead.style.filter = tl < 1 ? `blur(${((1 - tl) * 6).toFixed(2)}px)` : ''
    s.ctas.forEach((el, i) => {
      // nearly together, so the row never reads as one lopsided button
      const t = E.out(seg(p, B.ctas[0] + i * 0.01, B.ctas[1] + i * 0.01))
      el.style.opacity = t.toFixed(3)
      el.style.transform = `translate3d(0, ${((1 - t) * 22).toFixed(2)}px, 0) scale(${(0.96 + 0.04 * t).toFixed(4)})`
      el.style.pointerEvents = t > 0.6 ? '' : 'none'
    })
    const tb = E.out(seg(p, ...B.by))
    s.by.style.opacity = tb.toFixed(3)
    s.by.style.transform = `translate3d(0, ${((1 - tb) * 12).toFixed(2)}px, 0)`
  },

  dot(p, ctx) {
    const s = ctx.state
    const C = { x: ctx.vw / 2, y: ctx.vh / 2 }
    if (!s.k || p <= B.rise[0]) {
      // the seam: alone at the centre, drawing a breath before it starts
      const g = Math.sin(Math.PI * seg(p, 0.004, B.rise[0]))
      return { x: C.x, y: C.y, r: 10 + 0.8 * g, color: COLORS.lime, glow: 1 + 0.25 * g, lean: 0, lag: 0 }
    }

    const c = cam(s, p)
    const m = E.inOut(seg(p, ...B.morph))
    const kp = s.k * lerp(c.S, 1, m)
    const penR = Math.max(ctx.mobile ? 4.5 : 3.4, W.stroke * kp * 0.6)
    const titR = W.dot.r * kp
    const V = (q) => view(s, q.x, q.y, m, c)
    const pen = { color: COLORS.lime, r: penR, glow: 1.3, halo: 2.5, lean: 0, lag: 0, blink: false, stretch: 0.45 }

    // 1. it rises, arcs over and comes down on the foot of the P
    if (p < B.rise[1]) {
      const t = seg(p, ...B.rise)
      const P0 = V(s.end(['P', 0]))
      const ctrl = { x: lerp(C.x, P0.x, 0.55), y: Math.min(C.y, P0.y) - ctx.vh * (ctx.mobile ? 0.12 : 0.17) }
      const q = quad(C, ctrl, P0, E.inOut(t))
      const a = Math.sin(Math.PI * seg(t, 0, 0.2)) // anticipation
      const d = Math.sin(Math.PI * seg(t, 0.84, 1)) // touch down
      return {
        ...pen,
        x: q.x,
        y: q.y,
        r: lerp(10, penR, E.out(t)),
        glow: lerp(1, 1.3, t),
        halo: lerp(3, 2.5, t),
        sx: 1 + 0.16 * a + 0.24 * d,
        sy: 1 - 0.2 * a - 0.22 * d,
        stretch: 1,
      }
    }

    // 2. writing: the pen sits exactly on the end of the ink
    for (const L of LETTERS) {
      const [a, b] = B[L]
      if (p >= a && p < b) {
        const o = s.L[L]
        const q = V(s.pt(L, lerp(o.u0, o.u1, E.glide(seg(p, a, b)))))
        return { ...pen, x: q.x, y: q.y }
      }
    }
    if (p >= B.I[0] && p < B.I[1]) {
      const gi = E.inOut(seg(p, ...B.I))
      const q = V({ x: FOOT.x, y: FOOT.y - W.stem.h * gi })
      return { ...pen, x: q.x, y: q.y - penR * 0.35 * Math.sin(Math.PI * gi) }
    }
    for (const h of HOPS) {
      const [a, b] = h.at
      if (p >= a && p < b) {
        const t = E.inOut(seg(p, a, b))
        const A = s.end(h.from)
        const Z = s.end(h.to)
        const lift = 24 + 0.12 * Math.hypot(Z.x - A.x, Z.y - A.y)
        const q = V({ x: lerp(A.x, Z.x, t), y: lerp(A.y, Z.y, t) - lift * Math.sin(Math.PI * t) })
        const up = Math.sin(Math.PI * t)
        return { ...pen, x: q.x, y: q.y, r: penR * (1 + 0.2 * up), glow: 1.3 + 0.2 * up, stretch: 0.8 }
      }
    }

    // 3. pen up: it bounces off the baseline at the end of the M - up and out to
    //    the right, never back across the letter - arcs over the word and coasts
    //    to a stop right above the i; hangs there a beat, finding its spot; then
    //    drops straight down (vertical at impact, so the squash lands flat)
    if (p < LAND) {
      const t = seg(p, ...B.fly)
      const A = s.end(['M', 1])
      const AP = { x: TIT.x, y: s.apexY } // the apex, right above home
      let q
      let sx = 1
      let sy = 1
      if (t < FLY.arc) {
        const a = seg(t, 0, FLY.arc)
        const u = 1 - (1 - a) * (1 - a) // launched, coasting into the apex
        q = cubic(A, { x: A.x + 110, y: A.y - 170 }, { x: AP.x + 170, y: AP.y }, AP, u)
        const kick = Math.sin(Math.PI * seg(a, 0, 0.2)) // the bounce off the baseline
        sx = 1 + 0.18 * kick
        sy = 1 - 0.16 * kick
      } else if (t < FLY.hang) {
        const h = Math.sin(Math.PI * seg(t, FLY.arc, FLY.hang))
        q = { x: AP.x, y: AP.y - 7 * h } // a small rise: the breath before the drop
        sx = 1 - 0.1 * h
        sy = 1 + 0.12 * h
      } else {
        const d = seg(t, FLY.hang, 1)
        q = { x: AP.x, y: lerp(AP.y, TIT.y, d * d) } // falls into it
      }
      const P = V(q)
      return {
        color: COLORS.lime,
        x: P.x,
        y: P.y,
        sx,
        sy,
        r: lerp(penR, titR, E.inOut(seg(t, 0, FLY.hang))),
        glow: 1.3 + 0.5 * Math.sin(Math.PI * clamp(t / 0.96)),
        halo: lerp(2.5, 3.08, t),
        lean: 0,
        lag: 0,
        blink: false,
        stretch: 1,
      }
    }

    // 4. home: on the i, the end card around it. The landing squash is flat onto
    //    the stem (rot 0, no velocity stretch while it plays) and has some weight.
    const T = V(TIT)
    const dtL = ctx.reduced ? 9 : ctx.time - s.landT
    const w = dtL >= 0 && dtL < 1.4 ? Math.exp(-dtL * SQ_RATE) * Math.cos(dtL * SQ_FREQ) : 0
    const flare = dtL >= 0 && dtL < 3 ? Math.exp(-dtL * 2.2) : 0
    const bump = ctx.reduced ? 0 : ringOut(ctx.time - s.bumpT)
    const sink = Math.max(0, bump) * 0.09 * W.stem.h * kp // rides the stem down as it gives
    return {
      color: COLORS.lime,
      x: T.x,
      y: T.y + sink,
      r: titR,
      glow: 1 + 0.85 * flare + 0.45 * s.cta,
      halo: 3.08,
      lean: 0.5 * seg(p, LAND + 0.02, LAND + 0.1),
      lag: 0,
      grab: true,
      blink: p > LAND + 0.03 && !(dtL >= 0 && dtL < 1.5), // never mid-settle
      stretch: dtL >= 0 && dtL < 0.45 ? 0 : 1,
      rot: 0,
      sx: 1 + 0.3 * w,
      sy: 1 - 0.3 * w,
    }
  },

  tick(time, p, ctx) {
    const s = ctx.state
    const dt = Math.min(0.05, Math.max(0, time - s.lastT))
    s.lastT = time
    // the landing: a one-shot, only when the scroll carries the dot onto the i
    if (s.lastP < LAND && p >= LAND && p - s.lastP < 0.15) {
      s.landT = time
      s.bumpT = time
      ring(COLORS.lime)
    }
    s.lastP = p
    s.cta = lerp(s.cta, s.ctaWant, 1 - Math.exp(-dt / 0.14))
    if (ctx.reduced) return

    // flung: when it springs back onto the i, the stem gives
    if (s.flungAt) {
      const d = ctx.dot
      const T = s.home
      if (time - s.flungAt > 3) s.flungAt = 0
      else if (d && T && time - s.flungAt > 0.1 && Math.hypot(d.x - T.x, d.y - T.y) < Math.max(5, d.r)) {
        s.flungAt = 0
        s.bumpT = time
        ring(COLORS.lime)
      }
    }
    if (p >= LAND && s.k) s.home = view(s, TIT.x, TIT.y, E.inOut(seg(p, ...B.morph)), cam(s, p))

    // the word gives under the dot: the stem squashes with it, its neighbours dip after
    const bt = time - s.bumpT
    if (bt > -0.01 && bt < 1.9) {
      const c0 = ringOut(bt)
      const c1 = ringOut(bt - 0.07, 5, 11)
      const c2 = ringOut(bt - 0.14, 5.5, 10)
      s.g.I.style.transform = `scale(1, ${(1 - 0.09 * c0).toFixed(4)})`
      s.g.R.style.transform = s.g.S.style.transform = `translate(0px, ${(2.6 * c1).toFixed(3)}px)`
      s.g.P.style.transform = s.g.M.style.transform = `translate(0px, ${(1.5 * c2).toFixed(3)}px)`
      s.bumping = true
    } else if (s.bumping) {
      s.bumping = false
      for (const L in s.g) s.g[L].style.transform = ''
    }
  },
})
