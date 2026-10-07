/**
 * 100 minutes - the payoff.
 *
 * Beats (p):
 *   0.00  the dot alone at the centre (seam with hands), gathering itself
 *   0.04  the answer blooms out of it - a dashboard revealed by a circle that
 *         grows from the dot; the dot flies into the KPI tile and becomes its
 *         verified light (lands 0.19)
 *   0.31  "a report," - the dashboard steps back, an Arabic report comes forward;
 *         the dot hops into the report's "reviewed" chip
 *   0.50  "a decision." - the cards leave; "Days" arrives and the dot strikes
 *         it out, then drops into "Minutes" as its full stop (lands 0.70)
 *   0.765 the words dissolve; the full stop holds alone for a beat (like "1,180.")
 *   0.80  "And this time, the year goes to plan." - the revenue line from the
 *         old way, now holding and rising in lime; the dot rides its end point
 *   0.895 the payoff holds: the dot on the end of the line, "On plan"
 *   0.945 everything clears; the dot glides home to the centre (S11)
 */
import { chapter, seg, clamp, lerp, E, ring, go } from '../core.js'

/* -------------------------------------------------------------- timeline */

const T = {
  bloom: [0.04, 0.13],
  toKpi: [0.12, 0.19],
  count: [0.1, 0.175], // every figure has settled before the verified light lands (0.19)
  report: [0.31, 0.4],
  toRep: [0.315, 0.4],
  decide: [0.495, 0.545],
  toStrike: [0.5, 0.584],
  strike: [0.59, 0.645],
  toStop: [0.65, 0.71],
  vsOut: [0.765, 0.795], // the words dissolve, the full stop stays
  toLine: [0.795, 0.83], // ... and leaves from the empty spot
  ride: [0.83, 0.895],
  hold: [0.895, 0.945], // the payoff, held: the dot on the end of the line, on plan
  yearOut: [0.945, 0.975],
  home: [0.95, 0.99],
}
// slot words: in a..b, out c..d
const WORDS = [
  [0.05, 0.12, 0.312, 0.348],
  [0.345, 0.4, 0.5, 0.536],
  [0.533, 0.59, 0.755, 0.79],
]

/* ----------------------------------------------------------- the year line */

const ACT = [100, 99.3, 100.7, 101.9, 101.3, 103.1, 104.7, 104.2, 106.3, 108.1, 109.8, 112.6]
// last year: the old way's line (down 20% by spring), then flat
const GHOST = [100, 103.5, 97.5, 88.5, 80, 79.4, 80.2, 79.3, 80.1, 79.5, 79.8, 80]
const PLAN = Array.from({ length: 12 }, (_, i) => 100 + (i * 9) / 11)
const VMIN = 75
const VMAX = 116

/** Catmull-Rom tangents, as a cubic Hermite in x: x(t) is linear, so y(x) is exact. */
function curve(xs, ys) {
  const n = xs.length
  const m = ys.map((_, i) => {
    const a = Math.max(0, i - 1)
    const b = Math.min(n - 1, i + 1)
    return (ys[b] - ys[a]) / (xs[b] - xs[a])
  })
  let d = `M${xs[0].toFixed(2)} ${ys[0].toFixed(2)}`
  for (let i = 0; i < n - 1; i++) {
    const dx = xs[i + 1] - xs[i]
    d += ` C${(xs[i] + dx / 3).toFixed(2)} ${(ys[i] + (m[i] * dx) / 3).toFixed(2)} ${(xs[i + 1] - dx / 3).toFixed(2)} ${(ys[i + 1] - (m[i + 1] * dx) / 3).toFixed(2)} ${xs[i + 1].toFixed(2)} ${ys[i + 1].toFixed(2)}`
  }
  const at = (x) => {
    if (x <= xs[0]) return ys[0]
    if (x >= xs[n - 1]) return ys[n - 1]
    let i = 0
    while (i < n - 2 && x > xs[i + 1]) i++
    const dx = xs[i + 1] - xs[i]
    const t = (x - xs[i]) / dx
    const t2 = t * t
    const t3 = t2 * t
    return (2 * t3 - 3 * t2 + 1) * ys[i] + (t3 - 2 * t2 + t) * dx * m[i] + (-2 * t3 + 3 * t2) * ys[i + 1] + (t3 - t2) * dx * m[i + 1]
  }
  return { d, at }
}

/* ---------------------------------------------------------------- helpers */

const tf = (el, v) => {
  if (el && el._tf !== v) el.style.transform = el._tf = v
}
const op = (el, v) => {
  if (!el) return
  const s = v >= 0.999 ? '1' : v <= 0.001 ? '0' : v.toFixed(3)
  if (el._op !== s) el.style.opacity = el._op = s
}
const txt = (el, v) => {
  if (el && el._tx !== v) el.textContent = el._tx = v
}
const clip = (el, v) => {
  if (el && el._cp !== v) el.style.clipPath = el._cp = v
}
/** setAttribute, only when the value changes (one cache slot per attribute). */
const attr = (el, name, v) => {
  const key = `_a_${name}`
  if (el && el[key] !== v) el.setAttribute(name, (el[key] = v))
}
const fmt = (n) => Math.round(n).toLocaleString('en-US')
/** A line rising out of its mask fades in early and out late, so no stray tittle peeks over the edge. */
const maskFade = (a, b) => clamp((a - 0.3) / 0.5) * (1 - clamp((b - 0.3) / 0.45))
const bump = (p, a, len) => (p >= a && p <= a + len ? Math.sin((Math.PI * (p - a)) / len) : 0)
const centre = (el) => {
  const r = el.getBoundingClientRect()
  return { x: r.left + r.width / 2, y: r.top + r.height / 2, w: r.width, h: r.height, l: r.left, t: r.top, r: r.right, b: r.bottom }
}
/** Measure with these elements' animated transforms / clips taken off. */
function atRest(els, fn) {
  const saved = els.map((e) => [e, e.style.transform, e.style.clipPath])
  els.forEach((e) => {
    e.style.transform = 'none'
    e.style.clipPath = 'none'
  })
  try {
    return fn()
  } finally {
    saved.forEach(([e, t, c]) => {
      e.style.transform = t
      e.style.clipPath = c
    })
  }
}
/** A point on an arc from a to b; `lift` px at the top of the arc (negative = up). */
const fly = (a, b, u, lift) => ({ x: lerp(a.x, b.x, u), y: lerp(a.y, b.y, u) + Math.sin(Math.PI * u) * lift })
/** A point on the cubic Bezier a -> b with control points c1, c2. */
const bez = (a, c1, c2, b, t) => {
  const s = 1 - t
  const k0 = s * s * s
  const k1 = 3 * s * s * t
  const k2 = 3 * s * t * t
  const k3 = t * t * t
  return { x: k0 * a.x + k1 * c1.x + k2 * c2.x + k3 * b.x, y: k0 * a.y + k1 * c1.y + k2 * c2.y + k3 * b.y }
}

/* ------------------------------------------------------------ the chapter */

chapter({
  id: 'minutes',
  title: 'Minutes',
  anchorP: 0.22,
  // the year stays on plan, the dot on the end of its line, and scrolls away
  release: { hold: T.yearOut[0], standin: true },

  build(ctx) {
    const S = ctx.state
    const $ = ctx.$
    const $$ = ctx.$$
    S.lines = $$('.minutes-ln')
    S.words = $$('.minutes-word')
    S.lead = $('.minutes-lead')
    S.wave = $('.minutes-wave')
    S.dash = $('.minutes-dash')
    S.tabs = $$('.minutes-tab')
    S.tabline = $('.minutes-tabline')
    S.dq = $('.minutes-dq')
    S.kpis = $$('.minutes-kpi')
    S.kv = $$('.minutes-kv')
    S.verA = $('.minutes-ver-a')
    S.verB = $('.minutes-ver-b')
    S.light = $('.minutes-light')
    S.sparks = $$('.minutes-spark path')
    S.cards = $$('.minutes-card')
    S.hb = $$('.minutes-hb b')
    S.tline = $('.minutes-tline')
    S.tarea = $('.minutes-tarea')
    S.report = $('.minutes-report')
    S.rmeta = $('.minutes-rmeta')
    S.rlight = $('.minutes-rlight')
    S.rtitle = $('.minutes-rtitle')
    S.rsub = $('.minutes-rsub')
    S.rsecs = $$('.minutes-rsec')
    S.rl = $$('.minutes-rl')
    S.rb = $$('.minutes-rb b')
    S.then = $('.minutes-then')
    S.now = $('.minutes-now')
    S.dtxt = $('.minutes-dtxt')
    S.strike = $('.minutes-strike')
    S.stop = $('.minutes-stop')
    S.mins = $('.minutes-mins')
    S.plan = $$('.minutes-pl')
    S.chart = $('.minutes-chart')
    S.svg = $('.minutes-ysvg')
    S.ygrid = $('.minutes-ygrid')
    S.ghost = $('.minutes-ghost')
    S.planline = $('.minutes-planline')
    S.yarea = $('.minutes-yarea')
    S.yglow = $('.minutes-yglow')
    S.yline = $('.minutes-yline')
    S.clip = $('.minutes-cliprect')
    S.feather = $('.minutes-feather')
    S.ghostGrad = $('.minutes-ghost-grad')
    S.months = $$('.minutes-months span')
    S.tagGhost = $('.minutes-tag-ghost')
    S.tagPlan = $('.minutes-tag-plan')
    S.tagOn = $('.minutes-tag-on')
    S.label = $('.minutes-label')
    // make the ygrid a path holder
    S.ygridPath = document.createElementNS('http://www.w3.org/2000/svg', 'path')
    S.ygrid.appendChild(S.ygridPath)
    // the tabs are real: they take the story to that view
    S.tabs.forEach((t) => {
      if (t.dataset.go) t.addEventListener('click', () => go('minutes', Number(t.dataset.go), { duration: 1.4 }))
    })
  },

  layout(ctx) {
    const S = ctx.state
    const k = ctx.mobile
      ? clamp(Math.min(ctx.vw / 390, ctx.vh / 844), 0.78, 1.1)
      : clamp(Math.min(ctx.vw / 1440, ctx.vh / 900), 0.66, 1.14)
    S.k = k
    ctx.stage.style.setProperty('--k', k.toFixed(4))

    // every element whose transform or clip is animated, including the strike (it renders at scaleX(0)
    // until 0.59: measured scaled, both ends of the line would be the same point after a resize)
    const moving = [S.dash, S.report, S.then, S.now, ...S.kpis, S.rmeta, S.mins, S.chart, S.strike]
    atRest(moving, () => {
      const d = S.dash.getBoundingClientRect()
      S.dashRect = { l: d.left, t: d.top, w: d.width, h: d.height }
      const ox = ctx.vw / 2 - d.left
      const oy = ctx.vh / 2 - d.top
      S.dashO = { x: ox, y: oy }
      S.dashR = Math.hypot(Math.max(ox, d.width - ox), Math.max(oy, d.height - oy)) + 8
      S.dash.style.transformOrigin = `${ox.toFixed(1)}px ${oy.toFixed(1)}px`
      // the bloom ring is drawn at its full size and scaled down, so its stroke stays 1.5px at the edge
      const R = S.dashR
      S.wave.style.width = S.wave.style.height = `${(2 * R).toFixed(1)}px`
      S.wave.style.margin = `${(-R).toFixed(1)}px 0 0 ${(-R).toFixed(1)}px`

      S.kpiLight = centre(S.light)
      S.repLight = centre(S.rlight)
      // the tab pill
      S.tabPos = S.tabs.map((t) => ({ x: t.offsetLeft, w: t.offsetWidth }))
      // nine days: the strike runs across it
      const st = centre(S.strike)
      S.strikeA = { x: st.l, y: st.y }
      S.strikeB = { x: st.r, y: st.y }
      // how far below the strike the dot swoops so it passes under "Days", not through it
      S.dip = centre(S.dtxt).h * 0.62 + 34 * k
      const sp = centre(S.stop)
      const fs = parseFloat(getComputedStyle(S.mins).fontSize)
      // the period sits on the baseline: the slot box is 0.24em tall, on the baseline
      S.stopAt = { x: sp.x, y: sp.b - fs * 0.115 }
      S.stopR = fs * 0.105
      S.nowShift = 46 * k

      // the year chart
      const c = S.chart.getBoundingClientRect()
      const monthsH = 16 * k + (ctx.mobile ? 12 : 16)
      const w = c.width
      const h = Math.max(80, c.height - monthsH)
      S.svg.setAttribute('viewBox', `0 0 ${w.toFixed(1)} ${h.toFixed(1)}`)
      S.svg.style.height = `${h}px`
      const padL = 6
      const padR = 18 * k
      const padT = 8
      const padB = 8
      const X = (i) => padL + (i / 11) * (w - padL - padR)
      const Y = (v) => padT + ((VMAX - v) / (VMAX - VMIN)) * (h - padT - padB)
      const xs = ACT.map((_, i) => X(i))
      const act = curve(xs, ACT.map(Y))
      const gh = curve(xs, GHOST.map(Y))
      const pl = curve(xs, PLAN.map(Y))
      S.yline.setAttribute('d', act.d)
      S.yglow.setAttribute('d', act.d)
      S.yarea.setAttribute('d', `${act.d} L${xs[11].toFixed(2)} ${h} L${xs[0].toFixed(2)} ${h} Z`)
      S.ghost.setAttribute('d', gh.d)
      S.ghostGrad.setAttribute('x1', xs[0].toFixed(1))
      S.ghostGrad.setAttribute('x2', xs[4].toFixed(1))
      S.planline.setAttribute('d', pl.d)
      S.ygridPath.setAttribute('d', [80, 90, 100, 110].map((v) => `M0 ${Y(v).toFixed(1)} H${w.toFixed(1)}`).join(' '))
      S.months.forEach((m, i) => (m.style.left = `${X(i).toFixed(1)}px`))
      S.year = { left: c.left, top: c.top, x0: xs[0], x1: xs[11], at: act.at, h, w, xs }
      // tags (chart-local px)
      tf(S.tagGhost, `translate(${(xs[11] - 2).toFixed(1)}px, ${(Y(GHOST[11]) + 12).toFixed(1)}px) translateX(-100%)`)
      tf(S.tagPlan, `translate(${(xs[11] - 2).toFixed(1)}px, ${(Y(PLAN[11]) + 12).toFixed(1)}px) translateX(-100%)`)
      S.tagOnAt = { x: xs[11], y: Y(ACT[11]) }
    })
    // the chart tags' transforms above are layout, not animation: keep them out of tf's cache conflicts
  },

  render(p, ctx) {
    const S = ctx.state
    const k = S.k || 1
    const mobile = ctx.mobile

    // one-shots, forward only
    const last = S.lastP ?? p
    if (p > last) {
      // landings: the verified light, the reviewed chip, the full stop, and the end of the line (the hold)
      for (const at of [T.toKpi[1], T.toRep[1], T.toStop[1], T.hold[0]]) if (last < at && p >= at) ring()
    }
    S.lastP = p

    // ---- copy (all of it gone by 0.80, before "And this time," rises)
    S.lines.forEach((el, i) => {
      const a = E.out(seg(p, 0.02 + i * 0.025, 0.1 + i * 0.025))
      const b = E.in(seg(p, 0.755 + i * 0.01, 0.79 + i * 0.01))
      tf(el, `translate3d(0, ${((1 - a) * 110 - b * 110).toFixed(2)}%, 0)`)
      op(el, maskFade(a, b))
    })
    S.words.forEach((el, i) => {
      const [a0, a1, b0, b1] = WORDS[i]
      const a = E.out(seg(p, a0, a1))
      const b = E.in(seg(p, b0, b1))
      tf(el, `translate3d(0, ${((1 - a) * 110 - b * 110).toFixed(2)}%, 0)`)
      op(el, maskFade(a, b))
    })
    {
      const a = E.out(seg(p, 0.08, 0.15))
      const b = E.in(seg(p, 0.75, 0.78))
      op(S.lead, a * (1 - b))
      tf(S.lead, `translate3d(0, ${((1 - a) * 16 - b * 12).toFixed(2)}px, 0)`)
    }

    // ---- the bloom: a circle grows out of the dot and the dashboard is inside it
    const bl = seg(p, T.bloom[0], T.bloom[1])
    const blE = E.inOut(bl)
    {
      const R = (S.dashR || 600) * blE
      const o = S.dashO || { x: 0, y: 0 }
      clip(S.dash, bl <= 0 ? 'circle(0px at 50% 50%)' : bl < 1 ? `circle(${R.toFixed(1)}px at ${o.x.toFixed(1)}px ${o.y.toFixed(1)}px)` : 'none')
      // the ring at the bloom's edge: full size, scaled down; it fades fast, before it reaches the copy
      const w = S.wave
      op(w, !ctx.reduced && bl > 0 && bl < 1 ? 0.7 * (1 - bl) ** 2.5 : 0)
      tf(w, `scale(${blE.toFixed(4)})`)
    }

    // dashboard: blooms in, steps back for the report, leaves for the decision
    const rc = E.inOut(seg(p, T.report[0], T.report[1]))
    const dOut = E.in(seg(p, T.decide[0], T.decide[1]))
    {
      const s = (0.965 + 0.035 * E.out(bl)) * (1 - 0.075 * rc) * (1 - 0.04 * dOut)
      const tx = -rc * (mobile ? 2 : 6)
      const ty = -rc * (mobile ? 6 : 3)
      const ry = ctx.reduced ? 0 : rc * 7
      tf(
        S.dash,
        `translate3d(${tx.toFixed(2)}%, ${ty.toFixed(2)}%, 0) translateY(${(-dOut * 40).toFixed(1)}px) rotateY(${ry.toFixed(2)}deg) scale(${s.toFixed(4)})`,
      )
      op(S.dash, (bl > 0 ? 1 : 0) * (1 - 0.68 * rc) * (1 - dOut))
      // tabs: the pill slides from Dashboard to Report
      const tp = S.tabPos
      if (tp && tp.length > 1) {
        const x = lerp(tp[0].x, tp[1].x, rc)
        const ww = lerp(tp[0].w, tp[1].w, rc)
        tf(S.tabline, `translate3d(${x.toFixed(1)}px, 0, 0)`)
        const wv = `${ww.toFixed(1)}px`
        if (S.tabline._w !== wv) S.tabline.style.width = S.tabline._w = wv
        const on = rc > 0.5 ? 1 : 0
        if (S._tab !== on) {
          S._tab = on
          S.tabs.forEach((t, i) => {
            t.classList.toggle('is-on', i === on)
            if (t.tagName === 'BUTTON') t.setAttribute('aria-pressed', String(i === on))
          })
        }
      }
    }
    // dashboard insides
    {
      const q = E.out(seg(p, 0.08, 0.14))
      op(S.dq, q)
      tf(S.dq, `translate3d(0, ${((1 - q) * 8).toFixed(2)}px, 0)`)
      S.kpis.forEach((el, i) => {
        const a = E.out(seg(p, 0.075 + i * 0.015, 0.14 + i * 0.015))
        op(el, a)
        tf(el, `translate3d(0, ${((1 - a) * 18).toFixed(2)}px, 0)`)
      })
      S.cards.forEach((el, i) => {
        const a = E.out(seg(p, 0.1 + i * 0.015, 0.165 + i * 0.015))
        op(el, a)
        tf(el, `translate3d(0, ${((1 - a) * 22).toFixed(2)}px, 0)`)
      })
      const c = E.out(seg(p, T.count[0], T.count[1]))
      txt(S.kv[0], fmt(4630 * c))
      txt(S.kv[1], `SAR ${(3.1 * E.out(seg(p, T.count[0] + 0.006, T.count[1] + 0.006))).toFixed(1)}M`)
      txt(S.kv[2], fmt(6 * E.out(seg(p, T.count[0] + 0.012, T.count[1] + 0.012))))
      const v = seg(p, T.toKpi[1] - 0.006, T.toKpi[1] + 0.012)
      op(S.verA, 1 - v)
      op(S.verB, v)
      op(S.light, 1 - seg(p, T.toKpi[1] - 0.02, T.toKpi[1]))
      S.sparks.forEach((el, i) => {
        const a = E.out(seg(p, 0.13 + i * 0.012, 0.23 + i * 0.012))
        const s = (1 - a).toFixed(4)
        if (el._do !== s) el.style.strokeDashoffset = el._do = s
      })
      S.hb.forEach((el, i) => {
        const a = E.out(seg(p, 0.135 + i * 0.012, 0.215 + i * 0.012))
        tf(el, `scaleX(${a.toFixed(4)})`)
      })
      const tl = E.inOut(seg(p, 0.15, 0.26))
      const s = (1 - tl).toFixed(4)
      if (S.tline._do !== s) S.tline.style.strokeDashoffset = S.tline._do = s
      op(S.tarea, seg(p, 0.2, 0.27))
    }

    // ---- the report: wiped open right to left (the way it reads), built by 0.44, held complete until 0.495
    {
      const a = E.out(seg(p, T.report[0] + 0.005, T.report[1]))
      const wp = E.inOut(seg(p, T.report[0] + 0.005, T.report[0] + 0.06))
      const o = E.in(seg(p, T.decide[0], T.decide[1]))
      const ry = ctx.reduced ? 0 : -(1 - a) * 22
      tf(
        S.report,
        `translate3d(${((1 - a) * (mobile ? 10 : 16)).toFixed(2)}%, ${((1 - a) * 10).toFixed(2)}%, 0) translateY(${(-o * 40).toFixed(1)}px) rotateY(${ry.toFixed(2)}deg) scale(${(1 - o * 0.04).toFixed(4)})`,
      )
      clip(S.report, wp < 1 ? `inset(-2px -2px -2px ${((1 - wp) * 100).toFixed(2)}% round 16px)` : '')
      op(S.report, E.out(seg(p, T.report[0] + 0.005, T.report[0] + 0.035)) * (1 - o))
      // the chip and the title's first words sit at the right edge, so they come in with the wipe
      const m = E.out(seg(p, 0.322, 0.352))
      op(S.rmeta, m)
      const ti = E.out(seg(p, 0.33, 0.375))
      op(S.rtitle, ti)
      tf(S.rtitle, `translate3d(0, ${((1 - ti) * 14).toFixed(2)}px, 0)`)
      const su = E.out(seg(p, 0.345, 0.39))
      op(S.rsub, su)
      tf(S.rsub, `translate3d(0, ${((1 - su) * 10).toFixed(2)}px, 0)`)
      S.rsecs.forEach((el, i) => op(el, E.out(seg(p, 0.355 + i * 0.015, 0.395 + i * 0.015))))
      S.rl.forEach((el, i) => tf(el, `scaleX(${E.out(seg(p, 0.365 + i * 0.01, 0.405 + i * 0.01)).toFixed(4)})`))
      S.rb.forEach((el, i) => tf(el, `scaleX(${E.out(seg(p, 0.38 + i * 0.01, 0.425 + i * 0.01)).toFixed(4)})`))
      op(S.rlight, 1 - seg(p, T.toRep[1] - 0.02, T.toRep[1]))
    }

    // ---- nine days, four minutes
    {
      // the words dissolve and drift up; the dot (their full stop) stays sharp and holds alone
      const out = E.in(seg(p, T.vsOut[0], T.vsOut[1]))
      const fade = 1 - E.inOut(seg(p, T.vsOut[0], T.vsOut[1] - 0.004))
      const a = E.out(seg(p, 0.535, 0.59))
      const dim = E.inOut(seg(p, 0.64, 0.7))
      op(S.then, a * (1 - 0.5 * dim) * fade)
      tf(S.then, `translate3d(0, ${((1 - a) * 34 - out * 50).toFixed(2)}px, 0)`)
      const s = E.inOut(seg(p, T.strike[0], T.strike[1]))
      tf(S.strike, `scaleX(${s.toFixed(4)})`)
      const m = E.out(seg(p, 0.645, 0.71))
      op(S.now, m * fade)
      tf(S.now, `translate3d(0, ${((1 - m) * (S.nowShift || 40) - out * 50).toFixed(2)}px, 0)`)
      const blur = ctx.reduced ? 0 : (1 - m) * 10 + (1 - fade) * 7
      const f = blur > 0.05 ? `blur(${blur.toFixed(2)}px)` : 'none'
      if (S.mins._f !== f) S.mins.style.filter = S.mins._f = f
    }

    // ---- the year goes to plan
    {
      const out = E.in(seg(p, T.yearOut[0], T.yearOut[1]))
      S.plan.forEach((el, i) => {
        const a = E.out(seg(p, 0.8 + i * 0.025, 0.855 + i * 0.025))
        const b = E.in(seg(p, T.yearOut[0] + i * 0.008, T.yearOut[1] + i * 0.008))
        tf(el, `translate3d(0, ${((1 - a) * 110 - b * 110).toFixed(2)}%, 0)`)
        op(el, maskFade(a, b))
      })
      const g = E.out(seg(p, 0.8, 0.85))
      op(S.chart, g * (1 - out))
      const gd = (1 - E.inOut(seg(p, 0.805, 0.87))).toFixed(4)
      if (S.ghost._do !== gd) S.ghost.style.strokeDashoffset = S.ghost._do = gd
      op(S.planline, E.out(seg(p, 0.81, 0.86)))
      op(S.tagGhost, E.out(seg(p, 0.855, 0.885)))
      op(S.tagPlan, E.out(seg(p, 0.86, 0.89)))
      const Y = S.year
      if (Y) {
        const u = E.glide(seg(p, T.ride[0], T.ride[1]))
        const x = lerp(Y.x0, Y.x1, u)
        attr(S.clip, 'width', (x + 20).toFixed(1))
        attr(S.feather, 'x1', (x - 90 * k).toFixed(1))
        attr(S.feather, 'x2', (x + 0.5).toFixed(1))
        op(S.yline, seg(p, T.ride[0] - 0.004, T.ride[0] + 0.006))
        op(S.yglow, seg(p, T.ride[0] - 0.004, T.ride[0] + 0.006))
        S.months.forEach((el, i) => {
          // a month lights as the dot reaches it (December too: it lights on arrival, for the hold)
          const lit = clamp((x - Y.xs[i] + 22) / 22)
          op(el, (0.38 + 0.62 * lit) * g)
          const c = lit > 0.5
          if (el._lit !== c) {
            el._lit = c
            el.style.color = c ? 'var(--ink)' : ''
          }
        })
        // "On plan" pops as the dot reaches December, and is fully up for the whole hold
        const on = E.back(seg(p, 0.888, 0.915))
        op(S.tagOn, seg(p, 0.888, 0.9))
        const at = S.tagOnAt
        tf(
          S.tagOn,
          `translate(${at.x.toFixed(1)}px, ${(at.y - 26 * k - 22 * k * on).toFixed(1)}px) translate(-100%, -50%) scale(${(0.85 + 0.15 * on).toFixed(4)})`,
        )
      }
    }

    {
      const a = E.out(seg(p, 0.07, 0.13))
      const b = E.in(seg(p, T.yearOut[0], T.yearOut[1]))
      op(S.label, a * (1 - b))
    }
  },

  dot(p, ctx) {
    const S = ctx.state
    const k = S.k || 1
    const C = { x: ctx.vw / 2, y: ctx.vh / 2 }
    const kpi = S.kpiLight || C
    const rep = S.repLight || C
    const sA = S.strikeA || C
    const sB = S.strikeB || C
    const stop = S.stopAt || C
    const vh = ctx.vh
    const kr = (ctx.mobile ? 4.6 : 5.4) * k
    const rr = (ctx.mobile ? 4 : 4.6) * k
    const strikeR = 6.5 * k
    const stopR = S.stopR || 9
    const rideR = 8 * k

    let x = C.x
    let y = C.y
    let r = 10
    let glow = 1
    let halo = 3
    let lag = 0
    let sx = 1
    let sy = 1

    const Y = S.year
    const lineAt = (u) => {
      if (!Y) return C
      const lx = lerp(Y.x0, Y.x1, u)
      return { x: Y.left + lx, y: Y.top + Y.at(lx) }
    }

    if (p < T.toKpi[0]) {
      // gathering, then the answer opens out of it
      const g = seg(p, 0.0, T.bloom[0] + 0.02)
      const bl = seg(p, T.bloom[0], T.bloom[1])
      r = 10 + 1.6 * Math.sin(Math.PI * g) - 1.5 * E.out(bl)
      glow = 1 + 0.35 * Math.sin(Math.PI * g) + 0.9 * Math.sin(Math.PI * bl)
      halo = 3 + 0.8 * Math.sin(Math.PI * bl)
    } else if (p < T.toKpi[1]) {
      const u = E.inOut(seg(p, T.toKpi[0], T.toKpi[1]))
      // a low arc: it stays inside the KPI tile instead of crossing the question line
      ;({ x, y } = fly({ x: C.x, y: C.y }, kpi, u, -vh * 0.04))
      r = lerp(8.5, kr, u)
      glow = lerp(1.2, 1.1, u)
      halo = lerp(3, 2.6, u)
      lag = 0.03
    } else if (p < T.toRep[0]) {
      // the verified light
      const land = bump(p, T.toKpi[1], 0.03)
      x = kpi.x
      y = kpi.y
      r = kr
      glow = 1.05 + 0.8 * land
      halo = 2.6
      sx = 1 + 0.4 * land
      sy = 1 - 0.32 * land
    } else if (p < T.toRep[1]) {
      const u = E.inOut(seg(p, T.toRep[0], T.toRep[1]))
      ;({ x, y } = fly(kpi, rep, u, -vh * 0.1))
      r = lerp(kr, rr, u) + 1.5 * Math.sin(Math.PI * u)
      glow = 1.1
      halo = 2.6
      lag = 0.03
    } else if (p < T.toStrike[0]) {
      const land = bump(p, T.toRep[1], 0.03)
      x = rep.x
      y = rep.y
      r = rr
      glow = 1 + 0.7 * land
      halo = 2.4
      sx = 1 + 0.35 * land
      sy = 1 - 0.3 * land
    } else if (p < T.strike[0]) {
      const u = E.inOut(seg(p, T.toStrike[0], T.toStrike[1]))
      // it swoops down from the chip, passes under "Days" and rises into the start of the strike
      // from below-left - never through the word or the THEN label
      const dip = S.dip || vh * 0.12
      ;({ x, y } = bez(rep, { x: rep.x, y: sA.y + dip * 1.15 }, { x: sA.x - dip * 0.45, y: sA.y + dip }, sA, u))
      r = lerp(rr, strikeR, u)
      glow = 1.1
      halo = 2.8
      lag = 0.03
      // anticipation as it settles at the start of the line
      const ant = bump(p, T.toStrike[1], T.strike[0] - T.toStrike[1] + 0.004)
      sx = 1 - 0.18 * ant
      sy = 1 + 0.14 * ant
    } else if (p < T.toStop[0]) {
      // it crosses nine days out
      const u = E.inOut(seg(p, T.strike[0], T.strike[1]))
      x = lerp(sA.x, sB.x, u)
      y = lerp(sA.y, sB.y, u)
      r = strikeR
      glow = 1.25
      halo = 2.8
    } else if (p < T.toStop[1]) {
      const u = E.inOut(seg(p, T.toStop[0], T.toStop[1]))
      const m = E.out(seg(p, 0.645, 0.71))
      const target = { x: stop.x, y: stop.y + (1 - m) * (S.nowShift || 40) }
      ;({ x, y } = fly(sB, target, u, -vh * 0.16))
      r = lerp(strikeR, stopR, u)
      glow = 1.2
      halo = 3
      lag = 0.03
    } else if (p < T.toLine[0]) {
      // the full stop of "Minutes." - and, once the words have dissolved, a full stop on its own
      const land = bump(p, T.toStop[1], 0.035)
      const out = E.in(seg(p, T.vsOut[0], T.vsOut[1]))
      x = stop.x
      y = stop.y - out * 50
      r = stopR
      const flare = 1 - seg(p, T.toStop[1], T.toStop[1] + 0.05)
      // alone: it brightens a little, then gathers itself (anticipation) before it leaves
      const alone = bump(p, T.vsOut[0] + 0.012, 0.03)
      const ant = bump(p, T.toLine[0] - 0.012, 0.018)
      glow = 1 + 0.8 * flare + 0.25 * alone
      halo = 3
      sx = 1 + 0.42 * land + 0.14 * ant
      sy = 1 - 0.36 * land - 0.16 * ant
    } else if (p < T.ride[0]) {
      const u = E.inOut(seg(p, T.toLine[0], T.toLine[1]))
      ;({ x, y } = fly({ x: stop.x, y: stop.y - 50 }, lineAt(0), u, -vh * 0.06))
      r = lerp(stopR, rideR, u)
      glow = 1.1
      lag = 0.03
    } else if (p < T.home[0]) {
      // riding the line's leading point, then holding on its end: the year, on plan
      const u = E.glide(seg(p, T.ride[0], T.ride[1]))
      ;({ x, y } = lineAt(u))
      r = rideR
      const end = bump(p, T.ride[1], 0.03)
      const held = seg(p, T.ride[1], T.ride[1] + 0.012)
      glow = lerp(1.1, 1.15, held) + 0.6 * end
      halo = 2.8
      sx = 1 + 0.2 * end
      sy = 1 - 0.18 * end
    } else {
      const u = E.inOut(seg(p, T.home[0], T.home[1]))
      ;({ x, y } = fly(lineAt(1), C, u, -vh * 0.08))
      r = lerp(rideR, 10, u)
      glow = lerp(1.15, 1, u)
      halo = lerp(2.8, 3, u)
      lag = u < 1 ? 0.03 : 0
    }
    return { x, y, r, glow, halo, lean: 0, lag, sx, sy }
  },
})
