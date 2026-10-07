/**
 * 070 · steps — "Every number traces back to a query you can read."
 *
 * A Prism run graph (Plan → Explore schema ×2 → Write SQL → Run → Review →
 * Answer). The dot is the run's attention: it rides each edge, traces the
 * lower half of every card it works on (the card's progress bar) and leaves a
 * lime thread behind it. A camera frames each beat; the query types itself in
 * a panel hung under "Write SQL". At the end the camera pulls back to the whole
 * thread and the dot makes the headline literal: it rides the thread backwards
 * from the answer to Write SQL, drops into the query and reads it line by line.
 */
import { chapter, seg, win, clamp, lerp, E, COLORS, ring, go } from '../core.js'

/* ----------------------------------------------------------------- timing */

// the dot's thread, segment by segment: [start, end] in chapter progress
const SEG = [
  [0.075, 0.095], //  0 into Plan
  [0.095, 0.15], //   1 Plan
  [0.15, 0.19], //    2 Plan → orders (deliveries in parallel)
  [0.19, 0.245], //   3 orders / deliveries
  [0.245, 0.285], //  4 → Write SQL
  [0.285, 0.49], //   5 Write SQL (the query types)
  [0.49, 0.53], //    6 → Run
  [0.53, 0.585], //   7 Run
  [0.585, 0.625], //  8 → Review
  [0.625, 0.685], //  9 Review
  [0.685, 0.725], // 10 → Answer
  [0.725, 0.775], // 11 Answer
]
const TRACE = new Set([1, 3, 5, 7, 9, 11])
const RUNS = { plan: 1, orders: 3, deliveries: 3, sql: 5, run: 7, review: 9, answer: 11 }
const TYPE = [0.3, 0.455]
const PULL = [0.805, 0.86] // camera keys: the run's frame → the whole thread
const BACK = [0.792, 0.866] // the dot rides the thread back to Write SQL and drops into the query
const HOPV = 0.852 // phone: the ride back ends here, then a hop down into the sheet
const SHEET2 = [0.79, 0.835] // phone: the query sheet comes back, compact
const READ = [0.869, 0.904] // the dot reads the query, line by line
const UNDER = [0.902, 0.932] // "can read." underlines
const OUT = [0.94, 0.99]
const ANSWER = 4630

const segEase = (k, u) => (TRACE.has(k) ? E.glide(u) : E.inOut(u))

/* --------------------------------------------------------------- the query */

const KW = new Set(['SELECT', 'DISTINCT', 'FROM', 'JOIN', 'ON', 'WHERE', 'AND', 'AS', 'DATE'])
const FN = new Set(['COUNT'])
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
function tint(line) {
  return line.replace(/('[^']*')|(\b\d+\b)|([A-Za-z_][A-Za-z_0-9]*)|([^\sA-Za-z_0-9']+)/g, (m, s, n, w, o) => {
    if (s) return `<span class="steps-tk-s">${esc(s)}</span>`
    if (n) return `<span class="steps-tk-n">${n}</span>`
    if (w) {
      if (KW.has(w)) return `<span class="steps-tk-k">${w}</span>`
      if (FN.has(w)) return `<span class="steps-tk-f">${w}</span>`
      if (w === 'late_orders') return `<span class="steps-tk-a">${w}</span>`
      return w
    }
    return `<span class="steps-tk-o">${esc(o)}</span>`
  })
}

/* --------------------------------------------------------------- geometry */

function rr(r) {
  return { ...r, cx: r.x + r.w / 2, cy: r.y + r.h / 2, R: r.x + r.w, B: r.y + r.h }
}

/** The graph in world px. 'h' = desktop (left → right), 'v' = phone (top → bottom). */
function geometry(mode, vw) {
  const g = { mode, n: {} }
  if (mode === 'h') {
    const W = 200
    const H = 112
    const P = W + 78
    const D = 66
    const at = (i, dy = 0) => rr({ x: i * P, y: dy - H / 2, w: W, h: H })
    g.n = { plan: at(0), orders: at(1, -D), deliveries: at(1, D), sql: at(2), run: at(3), review: at(4), answer: rr({ x: 5 * P, y: -66, w: 232, h: 132 }) }
    g.panel = { x: 2 * P, y: H / 2 + 34, w: 560 }
  } else {
    const W = Math.min(vw < 760 ? 344 : 440, vw - 40)
    const H = vw < 760 ? 98 : 104
    const P = H + 50
    const half = (W - 12) / 2
    const at = (i) => rr({ x: 0, y: i * P, w: W, h: H })
    g.n = {
      plan: at(0),
      orders: rr({ x: 0, y: P, w: half, h: H }),
      deliveries: rr({ x: W - half, y: P, w: half, h: H }),
      sql: at(2),
      run: at(3),
      review: at(4),
      answer: at(5),
    }
    g.panel = null
  }
  const h = mode === 'h'
  const R = 12
  g.R = R
  const inP = (r) => (h ? [r.x, r.cy] : [r.cx, r.y])
  const outP = (r) => (h ? [r.R, r.cy] : [r.cx, r.B])
  const edge = (a, b) => {
    const [x1, y1] = outP(a)
    const [x2, y2] = inP(b)
    if (h) {
      const m = (x1 + x2) / 2
      return `M ${x1} ${y1} C ${m} ${y1}, ${m} ${y2}, ${x2} ${y2}`
    }
    const m = (y1 + y2) / 2
    return `M ${x1} ${y1} C ${x1} ${m}, ${x2} ${m}, ${x2} ${y2}`
  }
  const trace = (r) =>
    h
      ? `M ${r.x} ${r.cy} L ${r.x} ${r.B - R} A ${R} ${R} 0 0 0 ${r.x + R} ${r.B} L ${r.R - R} ${r.B} A ${R} ${R} 0 0 0 ${r.R} ${r.B - R} L ${r.R} ${r.cy}`
      : `M ${r.cx} ${r.y} L ${r.R - R} ${r.y} A ${R} ${R} 0 0 1 ${r.R} ${r.y + R} L ${r.R} ${r.B - R} A ${R} ${R} 0 0 1 ${r.R - R} ${r.B} L ${r.cx} ${r.B}`
  const N = g.n
  const [sx, sy] = inP(N.plan)
  g.start = h ? [sx - 64, sy] : [sx, sy - 50]
  const stub = `M ${g.start[0]} ${g.start[1]} L ${sx} ${sy}`
  g.main = [
    stub, trace(N.plan), edge(N.plan, N.orders), trace(N.orders), edge(N.orders, N.sql), trace(N.sql),
    edge(N.sql, N.run), trace(N.run), edge(N.run, N.review), trace(N.review), edge(N.review, N.answer), trace(N.answer),
  ]
  g.par = [edge(N.plan, N.deliveries), trace(N.deliveries), edge(N.deliveries, N.sql)]
  g.edges = [stub, g.main[2], g.par[0], g.main[4], g.par[2], g.main[6], g.main[8], g.main[10]]
  g.ports = [N.plan, N.orders, N.deliveries, N.sql, N.run, N.review].map(outP)
  g.arrows = [N.plan, N.orders, N.deliveries, N.sql, N.run, N.review, N.answer].map((r) => [...inP(r), h])
  return g
}

/** Sample a path into evenly spaced points so render never touches the DOM for geometry. */
function sample(probe, d) {
  probe.setAttribute('d', d)
  const L = probe.getTotalLength()
  const n = Math.max(8, Math.ceil(L / 3))
  const pts = new Float32Array((n + 1) * 2)
  for (let i = 0; i <= n; i++) {
    const q = probe.getPointAtLength((L * i) / n)
    pts[i * 2] = q.x
    pts[i * 2 + 1] = q.y
  }
  return { d, L, n, pts }
}
function pointAt(s, u) {
  const f = clamp(u) * s.n
  const i = Math.min(s.n - 1, Math.floor(f))
  const t = f - i
  return [lerp(s.pts[i * 2], s.pts[i * 2 + 2], t), lerp(s.pts[i * 2 + 1], s.pts[i * 2 + 3], t)]
}
/** A point on the main thread by arc length. */
function mainAt(S, len) {
  const M = S.main
  let k = M.length - 1
  for (let i = 0; i < M.length; i++) {
    if (len < S.mainCum[i] + M[i].L) {
      k = i
      break
    }
  }
  return pointAt(M[k], (len - S.mainCum[k]) / M[k].L)
}
const join = (ds) => ds.map((d, i) => (i ? d.replace(/^M\s*[-\d.e]+\s+[-\d.e]+\s*/, ' ') : d)).join('')

/* ------------------------------------------------------------------ camera */

function camAt(p, S) {
  const K = S.keys
  if (p <= K[0].p) return K[0]
  for (let i = 0; i < K.length - 1; i++) {
    const a = K[i]
    const b = K[i + 1]
    if (p <= b.p) {
      const t = (p - a.p) / (b.p - a.p || 1)
      return { s: lerp(a.s, b.s, t), fx: lerp(a.fx, b.fx, t), fy: lerp(a.fy, b.fy, t) }
    }
  }
  return K[K.length - 1]
}
/** Piecewise-linear keys, box-filtered over p: holds ease in and out on their own. */
function camera(p, S) {
  let s = 0
  let fx = 0
  let fy = 0
  const taps = 9
  for (let i = 0; i < taps; i++) {
    const k = camAt(p + (i / (taps - 1) - 0.5) * 0.06, S)
    s += k.s
    fx += k.fx
    fy += k.fy
  }
  s /= taps
  fx /= taps
  fy /= taps
  return { s, tx: S.area.cx - fx * s, ty: S.area.cy - fy * s }
}

/* ------------------------------------------------------- the ride back */

/** Where the dot is on its way back: `pos` on the main thread, then `tail` (0..1) down into the query. */
function backAt(p, S) {
  if (S.g.mode === 'h') {
    const d = E.glide(seg(p, BACK[0], BACK[1])) * S.backTotal
    return d <= S.backMainL ? { pos: S.mainL - d, tail: 0 } : { pos: S.backStop, tail: (d - S.backMainL) / S.drop.L }
  }
  const d = E.glide(seg(p, BACK[0], HOPV)) * S.backMainL
  return { pos: S.mainL - d, tail: E.inOut(seg(p, HOPV + 0.003, BACK[1])) }
}
/** The line the dot is reading (fractional, 0 = first line). */
const readK = (p, S) => E.glide(seg(p, READ[0], READ[1])) * (S.codeLines.length - 1)

/** The phone sheet: how far up it is, and whether it is the compact one. */
function sheet(p, fadeOut) {
  const compact = p >= 0.7
  const up = compact
    ? E.out(seg(p, SHEET2[0], SHEET2[1])) * fadeOut
    : E.out(seg(p, 0.275, 0.33)) * (1 - E.inOut(seg(p, 0.6, 0.65)))
  return { compact, up }
}

/** Put the detail box above the hovered card (below it when the header leaves no room). No layout reads. */
function placeTip(S) {
  const box = S.tipBox
  const k = S.tipFor
  const el = k && S.nodes[k]
  const on = !!(el && S.cam && S.ready && el.style.pointerEvents !== 'none')
  box.classList.toggle('is-on', on)
  if (!on) return
  const r = S.g.n[k]
  const cam = S.cam
  const x = cam.tx + r.x * cam.s
  const top = cam.ty + r.y * cam.s
  const bottom = cam.ty + r.B * cam.s
  const w = Math.max(240, r.w * cam.s)
  let y = top - 10 - S.tipH
  // above the card unless that would cover the headline or the lead; then below it
  const hits = (b) => b && x < b.right + 8 && x + w > b.left - 8 && y < b.bottom + 10
  if (y < 84 || hits(S.titleBox) || hits(S.leadBox)) y = bottom + 10
  box.style.width = `${w.toFixed(0)}px`
  box.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`
}

/* ------------------------------------------------------------------ chapter */

chapter({
  id: 'steps',
  title: 'Every step',
  anchorP: 0.1,
  // the whole run stays, the query read to its last line, and scrolls away
  release: { hold: OUT[0], standin: true },

  build(ctx) {
    const S = ctx.state
    S.head = ctx.$('.steps-head')
    S.title = ctx.$('.steps-title')
    S.lines = ctx.$$('.steps-ln > span')
    S.em = ctx.$('.steps-em')
    S.lead = ctx.$('.steps-lead')
    S.view = ctx.$('.steps-view')
    S.world = ctx.$('.steps-world')
    S.edgesSvg = ctx.$('.steps-edges')
    S.trailsSvg = ctx.$('.steps-trails')
    S.nodes = {}
    // hover / focus detail: one box above the masked canvas, so it is never faded by the header mask
    S.tipBox = document.createElement('div')
    S.tipBox.className = 'steps-tipbox'
    S.tipBox.setAttribute('aria-hidden', 'true')
    ctx.stage.appendChild(S.tipBox)
    const tip = (k) => {
      S.tipFor = k
      if (k && S.cam && S.ready) {
        S.tipBox.textContent = S.nodes[k].querySelector('.steps-tip').textContent
        S.tipBox.style.width = `${Math.max(240, S.g.n[k].w * S.cam.s).toFixed(0)}px`
        S.tipH = S.tipBox.offsetHeight // measured here, on the event, never in render
      }
      placeTip(S)
    }
    for (const b of ctx.$$('.steps-node')) {
      const k = b.dataset.node
      S.nodes[k] = b
      b.addEventListener('click', () => go('steps', Number(b.dataset.p)))
      b.addEventListener('pointerenter', (e) => e.pointerType !== 'touch' && tip(k))
      b.addEventListener('pointerleave', () => S.tipFor === k && tip(null))
      b.addEventListener('focus', () => tip(k))
      b.addEventListener('blur', () => S.tipFor === k && tip(null))
    }
    S.num = ctx.$('.steps-num')
    S.panel = ctx.$('.steps-sql')
    S.code = ctx.$('.steps-code code')
    S.spine = ctx.$('.steps-spine')
    S.src = S.code.textContent.replace(/\s+$/, '').split('\n')
    S.label = ctx.$('.steps-label')
    S.cache = {}
    S.lastP = 0
  },

  layout(ctx) {
    const S = ctx.state
    // phones, and tall portrait screens, read the run top to bottom
    const mode = ctx.mobile || ctx.vh > ctx.vw * 1.15 ? 'v' : 'h'
    const g = geometry(mode, ctx.vw)
    S.g = g
    const N = g.n
    const vw = ctx.vw
    const vh = ctx.vh

    // the query, split into lines (the long line wraps on a phone)
    if (S.codeMode !== mode) {
      S.codeMode = mode
      let src = S.src
      if (mode === 'v') {
        src = src.flatMap((l) => {
          const i = l.indexOf(' CURRENT_DATE')
          return i > 0 ? [l.slice(0, i), '      ' + l.slice(i + 1)] : [l]
        })
      }
      S.code.innerHTML = src
        .map(
          (l, i) =>
            `<span class="steps-cl"><span class="steps-cl-n" aria-hidden="true">${i + 1}</span><span class="steps-cl-t">${tint(l)}</span><i class="steps-caret" aria-hidden="true"></i></span>`,
        )
        .join('') + '<i class="steps-scan" aria-hidden="true"></i>'
      S.scan = S.code.querySelector('.steps-scan')
      S.codeLines = Array.from(S.code.querySelectorAll('.steps-cl'))
      S.codeText = S.codeLines.map((el) => el.querySelector('.steps-cl-t'))
      S.lens = src.map((l) => l.length)
      S.lead0 = src.map((l) => l.length - l.trimStart().length)
      S.typeTotal = src.reduce((a, l) => a + l.trim().length, 0)
    }

    // nodes
    for (const [k, el] of Object.entries(S.nodes)) {
      const r = N[k]
      el.style.left = `${r.x}px`
      el.style.top = `${r.y}px`
      el.style.width = `${r.w}px`
      el.style.height = `${r.h}px`
    }

    // edges (under the cards)
    const e = S.edgesSvg
    e.innerHTML =
      g.edges.map((d) => `<path class="steps-e" d="${d}"/>`).join('') +
      g.ports.map(([x, y]) => `<circle class="steps-port" cx="${x}" cy="${y}" r="3.6"/>`).join('') +
      g.arrows
        .map(([x, y, h]) =>
          h
            ? `<path class="steps-arrow" d="M ${x - 7} ${y - 3.6} L ${x - 0.5} ${y} L ${x - 7} ${y + 3.6} Z"/>`
            : `<path class="steps-arrow" d="M ${x - 3.6} ${y - 7} L ${x} ${y - 0.5} L ${x + 3.6} ${y - 7} Z"/>`,
        )
        .join('')
    S.edgeEls = Array.from(e.querySelectorAll('.steps-e'))
    S.edgeLen = S.edgeEls.map((p) => p.getTotalLength())
    for (let i = 0; i < S.edgeEls.length; i++) S.edgeEls[i].style.strokeDasharray = `${S.edgeLen[i]} ${S.edgeLen[i] + 2}`
    S.portEls = Array.from(e.querySelectorAll('.steps-port, .steps-arrow'))

    // the SQL panel: world-anchored on desktop, a bottom sheet on a phone
    const pn = S.panel
    pn.style.transform = ''
    pn.classList.remove('is-compact')
    if (mode === 'h') {
      if (pn.parentNode !== S.view) S.view.appendChild(pn)
      Object.assign(pn.style, { left: '0px', top: '0px', right: '', bottom: '', width: `${g.panel.w}px` })
    } else {
      if (pn.parentNode !== ctx.stage) ctx.stage.insertBefore(pn, S.label)
      const side = Math.max(12, (vw - 620) / 2)
      S.sheetLeft = side
      Object.assign(pn.style, { left: `${side}px`, right: `${side}px`, top: 'auto', bottom: '12px', width: 'auto' })
    }
    // where each line of the query sits inside the panel (the dot reads them)
    const linesAt = () => S.codeLines.map((el) => pn.clientTop + S.code.offsetTop + el.offsetTop + el.offsetHeight / 2)
    S.panelH = pn.offsetHeight
    S.lineY = linesAt()
    if (mode === 'v') {
      pn.classList.add('is-compact')
      S.sheetHc = pn.offsetHeight
      S.lineY = linesAt()
      pn.classList.remove('is-compact')
    }
    S.lh = S.lineY.length > 1 ? S.lineY[1] - S.lineY[0] : 20
    S.edgeX = pn.clientLeft + 0.5
    // the spine: lime along the panel's left edge, from where the thread enters to the line being read
    const spineTop = mode === 'h' ? 0 : S.lineY[0] - S.lh / 2
    const spineH = (mode === 'h' ? S.panelH : S.sheetHc) - spineTop
    S.spineTop = spineTop
    S.spineH = spineH
    Object.assign(S.spine.style, { top: `${spineTop.toFixed(1)}px`, height: `${spineH.toFixed(1)}px` })

    // the thread (over the cards' borders), the ride back, the comet
    const t = S.trailsSvg
    t.innerHTML =
      '<path class="steps-probe" d="" style="display:none"/>' +
      '<path class="steps-tg steps-main-g"/><path class="steps-tg steps-par-g"/><path class="steps-t steps-main"/><path class="steps-t steps-par"/>' +
      '<path class="steps-lit"/><path class="steps-drop-g"/><path class="steps-drop"/><path class="steps-comet-g"/><path class="steps-comet"/>'
    const probe = t.querySelector('.steps-probe')
    S.main = g.main.map((d) => sample(probe, d))
    S.par = g.par.map((d) => sample(probe, d))
    S.mainCum = []
    let acc = 0
    for (const s of S.main) {
      S.mainCum.push(acc)
      acc += s.L
    }
    S.mainL = acc
    S.parL = S.par.reduce((a, s) => a + s.L, 0)
    const md = join(g.main)
    const pd = join(g.par)
    S.tMain = [t.querySelector('.steps-main'), t.querySelector('.steps-main-g')]
    S.tPar = [t.querySelector('.steps-par'), t.querySelector('.steps-par-g')]
    S.tLit = t.querySelector('.steps-lit')
    S.tComet = [t.querySelector('.steps-comet'), t.querySelector('.steps-comet-g')]
    S.tDrop = [t.querySelector('.steps-drop'), t.querySelector('.steps-drop-g')]
    for (const el of S.tMain) el.setAttribute('d', md)
    for (const el of S.tPar) el.setAttribute('d', pd)
    for (const el of S.tComet) el.setAttribute('d', md)
    S.tLit.setAttribute('d', md)
    // the drawn length of the joined path can differ a hair from the sum of its parts
    S.mainLd = S.tMain[0].getTotalLength()
    S.parLd = S.tPar[0].getTotalLength()
    for (const el of S.tMain) el.style.strokeDasharray = `${S.mainLd} ${S.mainLd + 4}`
    for (const el of S.tPar) el.style.strokeDasharray = `${S.parLd} ${S.parLd + 4}`
    S.tLit.style.strokeDasharray = `${S.mainLd} ${S.mainLd + 10}`
    S.cometD = mode === 'h' ? [110, 220] : [70, 140]
    S.tComet.forEach((el, i) => (el.style.strokeDasharray = `${S.cometD[i]} ${S.mainLd + S.cometD[i] + 10}`))

    // the ride back ends on Write SQL: desktop rounds its lower-left corner and drops down
    // the panel's edge into the query; a phone stops at its out-port and hops into the sheet
    if (mode === 'h') {
      const R = g.R
      const x = N.sql.x
      const B = N.sql.B
      S.backStop = S.mainCum[5] + (N.sql.h / 2 - R) + (Math.PI * R) / 2
      const dropD = `M ${x + R} ${B} Q ${x} ${B} ${x} ${B + R} L ${x} ${(g.panel.y + S.lineY[0]).toFixed(1)}`
      S.drop = sample(probe, dropD)
      for (const el of S.tDrop) el.setAttribute('d', dropD)
      S.dropLd = S.tDrop[0].getTotalLength()
      for (const el of S.tDrop) el.style.strokeDasharray = `${S.dropLd} ${S.dropLd + 4}`
    } else {
      S.backStop = S.mainCum[6]
      S.drop = null
      for (const el of S.tDrop) el.removeAttribute('d')
    }
    S.backMainL = S.mainL - S.backStop
    S.backTotal = S.backMainL + (S.drop ? S.drop.L : 0)

    // the stage area the camera frames: under the headline, above the chapter label
    const hb = S.title.getBoundingClientRect()
    const lb = S.lead.getBoundingClientRect()
    S.titleBox = { left: hb.left, right: hb.right, bottom: hb.bottom }
    S.leadBox = mode === 'h' ? { left: lb.left, right: lb.right, bottom: lb.bottom } : null
    const top = hb.bottom + (mode === 'h' ? 26 : 18)
    const bottom = vh - (mode === 'h' ? Math.max(64, vh * 0.085) : 76)
    const area = { top, bottom, h: bottom - top, w: vw - 2 * (mode === 'h' ? Math.max(56, vw * 0.06) : 16), cx: vw / 2, cy: (top + bottom) / 2 }
    S.area = area
    S.view.style.setProperty('--steps-mt', `${Math.round(top)}px`)
    S.view.style.setProperty('--steps-mb', `${Math.round(bottom + 6)}px`)

    const keys = []
    if (mode === 'h') {
      const pnB = g.panel.y + S.panelH
      const rowH = N.deliveries.B - N.orders.y + 60
      const sRow = Math.min(1.3, area.h / rowH, area.w / 1000)
      const lead = (0.1 * vw) / sRow
      // a box in world px, framed inside the area and clear of the chapter rail on the right
      const L = area.cx - area.w / 2
      const R = Math.min(area.cx + area.w / 2, vw - 124)
      const T = area.top + 8
      const Bm = area.bottom - 8
      const fit = (x0, y0, x1, y1, sMax) => {
        const s = Math.min(sMax, (R - L) / (x1 - x0), (Bm - T) / (y1 - y0))
        return { s, fx: (x0 + x1) / 2 + (area.cx - (L + R) / 2) / s, fy: (y0 + y1) / 2 + (area.cy - (T + Bm) / 2) / s }
      }
      // writing: the explore row, Write SQL and the whole query
      const kSql = fit(N.orders.x - 16, N.orders.y - 14, g.panel.x + g.panel.w + 16, pnB + 14, 1.22)
      // run → answer: the query (footer included) and Write SQL → Answer, with a slow push in
      const runBox = [g.panel.x - 24, N.answer.y - 14, N.answer.R + 24, pnB + 14]
      const kRun = fit(...runBox, sRow)
      const kRun0 = fit(...runBox, kRun.s * 0.965)
      // the overview: everything, thread and query
      const kAll = fit(g.start[0] - 10, N.orders.y - 10, N.answer.R + 10, pnB + 10, 1.1)
      keys.push(
        { p: 0, s: sRow, fx: N.plan.cx + lead + 40, fy: 0 },
        { p: 0.135, s: sRow, fx: N.plan.cx + lead + 40, fy: 0 },
        { p: 0.2, s: sRow, fx: N.orders.cx + lead, fy: 0 },
        { p: 0.24, s: sRow, fx: N.orders.cx + lead, fy: 0 },
        { p: 0.31, ...kSql },
        { p: 0.475, ...kSql },
        { p: 0.56, ...kRun0 },
        { p: 0.775, ...kRun },
        { p: PULL[0], ...kRun },
        { p: PULL[1], ...kAll },
        { p: 1, ...kAll },
      )
    } else {
      const s1 = Math.min(1, (vw - 36) / N.plan.w)
      const fx = N.plan.cx
      // with the sheet up, Write SQL sits high in the frame
      const sheetTop = vh - 12 - S.panelH
      const sqlY = (top + sheetTop) / 2
      // the climax: Write SQL → Answer, framed above the compact sheet
      const T = area.top + 6
      const Bm = vh - 12 - S.sheetHc - 14
      const y0 = N.sql.y - 44
      const y1 = N.answer.B + 10
      const sFit = Math.min(1, (Bm - T) / (y1 - y0))
      const fyFit = (y0 + y1) / 2 + (area.cy - (T + Bm) / 2) / sFit
      keys.push(
        // held until the lead line under the headline has gone, so the thread never runs through it
        { p: 0, s: s1, fx, fy: N.orders.y - 10 },
        { p: 0.16, s: s1, fx, fy: N.orders.y - 10 },
        { p: 0.27, s: s1, fx, fy: N.sql.y - 30 },
        { p: 0.31, s: s1, fx, fy: N.sql.cy + (area.cy - sqlY) / s1 },
        { p: 0.5, s: s1, fx, fy: N.sql.cy + (area.cy - sqlY) / s1 },
        { p: 0.56, s: s1, fx, fy: N.run.cy + (area.cy - sqlY - 40) / s1 },
        { p: 0.64, s: s1, fx, fy: N.review.cy },
        { p: 0.775, s: s1, fx, fy: N.answer.y - 20 },
        { p: PULL[0] - 0.02, s: s1, fx, fy: N.answer.y - 20 },
        { p: PULL[1], s: sFit, fx, fy: fyFit },
        { p: 1, s: sFit, fx, fy: fyFit },
      )
    }
    S.keys = keys
    S.ready = true
    S.cache = { typed: -1 }
  },

  render(p, ctx) {
    const S = ctx.state
    if (!S.ready) return
    const C = S.cache
    const mode = S.g.mode
    const fadeOut = 1 - E.inOut(seg(p, OUT[0], OUT[1] - 0.01))

    // header: lines rise out of their masks, the lead follows
    S.lines.forEach((el, i) => {
      const u = E.out(seg(p, 0.012 + i * 0.022, 0.075 + i * 0.022))
      el.style.transform = `translate3d(0, ${((1 - u) * 112).toFixed(2)}%, 0)`
    })
    S.head.style.opacity = fadeOut.toFixed(3)
    const lu = E.out(seg(p, 0.05, 0.11))
    // a phone keeps the lead only until the camera pans down the run (the thread would run into it)
    const lo = mode === 'v' ? lu * (1 - E.inOut(seg(p, 0.2, 0.232))) : lu
    S.lead.style.opacity = lo.toFixed(3)
    S.lead.style.transform = `translate3d(0, ${((1 - lu) * 14).toFixed(2)}px, 0)`
    S.em.style.setProperty('--steps-u', E.inOut(seg(p, UNDER[0], UNDER[1])).toFixed(3))
    const la = E.out(seg(p, 0.06, 0.12)) * fadeOut
    S.label.style.opacity = (mode === 'v' ? la * (1 - Math.max(win(p, 0.27, 0.62, 0.03), win(p, SHEET2[0] - 0.01, 2, 0.03))) : la).toFixed(3)

    // camera
    const cam = camera(p, S)
    S.cam = cam
    S.world.style.transform = `translate3d(${cam.tx.toFixed(2)}px, ${cam.ty.toFixed(2)}px, 0) scale(${cam.s.toFixed(4)})`

    // nodes: arrive staggered, then queued → running → done as the dot reaches them
    const order = ['plan', 'orders', 'deliveries', 'sql', 'run', 'review', 'answer']
    order.forEach((k, i) => {
      const el = S.nodes[k]
      const a = E.out(seg(p, 0.03 + i * 0.012, 0.1 + i * 0.012))
      const op = a * fadeOut
      el.style.opacity = op.toFixed(3)
      el.style.transform = `translate3d(0, ${((1 - a) * 18).toFixed(2)}px, 0)`
      // faded cards stay in the tab order (focusing one scrolls the story to it); they just can't be hit
      el.style.pointerEvents = op < 0.05 ? 'none' : ''
      const r = SEG[RUNS[k]]
      const st = p < r[0] ? 'q' : p < r[1] ? 'r' : 'd'
      if (C['s' + k] !== st) {
        C['s' + k] = st
        el.dataset.s = st
      }
    })
    if (S.tipFor) placeTip(S)

    // the answer rolls up as the dot traces its card
    const nu = E.out(seg(p, SEG[11][0] + 0.004, SEG[11][1] + 0.02))
    const nv = p < SEG[11][0] ? '—' : Math.round(ANSWER * nu).toLocaleString('en-US')
    if (C.num !== nv) {
      C.num = nv
      S.num.textContent = nv
    }

    // idle edges draw on with the nodes
    const ea = E.inOut(seg(p, 0.04, 0.13))
    S.edgeEls.forEach((el, i) => {
      el.style.strokeDashoffset = ((1 - ea) * S.edgeLen[i]).toFixed(1)
    })
    const pa = (E.out(seg(p, 0.09, 0.14)) * fadeOut).toFixed(3)
    S.edgesSvg.style.opacity = fadeOut.toFixed(3)
    for (const el of S.portEls) el.style.opacity = pa

    // the thread
    let drawn = 0
    for (let k = 0; k < SEG.length; k++) drawn += segEase(k, seg(p, SEG[k][0], SEG[k][1])) * S.main[k].L
    const md = (drawn / S.mainL) * S.mainLd
    for (const el of S.tMain) el.style.strokeDashoffset = (S.mainLd - md).toFixed(1)
    let pd = 0
    for (let k = 0; k < 3; k++) pd += segEase(k + 2, seg(p, SEG[k + 2][0], SEG[k + 2][1])) * S.par[k].L
    const pdd = (pd / S.parL) * S.parLd
    for (const el of S.tPar) el.style.strokeDashoffset = (S.parLd - pdd).toFixed(1)
    S.trailsSvg.style.opacity = fadeOut.toFixed(3)

    // the ride back: what the dot has retraced burns brighter, a comet runs just behind it
    const back = backAt(p, S)
    const toD = S.mainLd / S.mainL
    const litFrom = p < BACK[0] ? S.mainLd : back.pos * toD
    S.tLit.style.strokeDashoffset = (-litFrom).toFixed(1)
    const leave = mode === 'h' ? clamp(back.tail * 2.5) : seg(p, HOPV - 0.004, HOPV + 0.008)
    const cv = p < BACK[0] ? 0 : E.out(seg(p, BACK[0], BACK[0] + 0.008)) * (1 - leave)
    S.tComet.forEach((el, i) => {
      el.style.strokeDashoffset = (-back.pos * toD).toFixed(1)
      el.style.opacity = (cv * (i ? 0.45 : 1)).toFixed(3)
    })
    if (S.drop) {
      const off = (S.dropLd * (1 - back.tail)).toFixed(1)
      for (const el of S.tDrop) el.style.strokeDashoffset = off
    }

    // the query types itself
    const tu = seg(p, TYPE[0], TYPE[1])
    const typed = Math.round(tu * S.typeTotal)
    if (C.typed !== typed) {
      C.typed = typed
      let left = typed
      let cur = -1
      S.codeText.forEach((el, i) => {
        const body = S.lens[i] - S.lead0[i]
        let n = 0
        if (left > 0 || (i === 0 && typed > 0)) {
          n = S.lead0[i] + Math.min(body, left)
          if (left > 0 && left <= body) cur = i
          left -= body
        }
        if (typed >= S.typeTotal) n = S.lens[i]
        el.parentNode.style.setProperty('--n', n)
        el.style.setProperty('--n', n)
        el.parentNode.classList.toggle('is-on', n > 0)
      })
      if (typed > 0 && typed < S.typeTotal && cur < 0) cur = 0
      if (typed === 0) cur = 0
      C.cur = cur
    }
    // the caret waits at the end of the query until it runs
    const caretOn = p >= TYPE[0] - 0.02 && p < SEG[7][0]
    const curLine = caretOn ? C.cur : -1
    if (C.curLine !== curLine) {
      C.curLine = curLine
      S.codeLines.forEach((el, i) => el.classList.toggle('is-cur', i === curLine))
    }
    // running: a light sweeps down the query; at the end the dot reads it with the same light
    const nL = S.codeLines.length - 1
    let sk
    let so
    if (p < READ[0] - 0.01) {
      const su = seg(p, SEG[7][0] - 0.004, SEG[7][1] - 0.006)
      sk = E.inOut(su) * nL
      so = Math.sin(Math.PI * su) ** 0.6
    } else {
      sk = readK(p, S)
      so = E.out(seg(p, READ[0] - 0.006, READ[0] + 0.004)) * (1 - E.inOut(seg(p, READ[1] + 0.004, READ[1] + 0.03)))
    }
    S.scan.style.transform = `translate3d(0, ${(sk * 100).toFixed(1)}%, 0)`
    S.scan.style.opacity = so.toFixed(3)
    const phase = p < TYPE[1] ? 0 : p < SEG[7][0] ? 1 : p < SEG[7][1] ? 2 : p < SEG[9][1] ? 3 : 4
    if (C.phase !== phase) {
      C.phase = phase
      S.panel.dataset.phase = phase
    }
    const read = p >= READ[0] && p < OUT[1]
    if (C.read !== read) {
      C.read = read
      S.panel.classList.toggle('is-read', read)
    }

    // the spine: lime down the panel's edge, as far as the dot has come
    let spineY = S.spineTop
    if (p >= READ[0]) spineY = S.lineY[0] + sk * S.lh
    else if (mode === 'h' && back.tail > 0) spineY = pointAt(S.drop, back.tail)[1] - S.g.panel.y
    S.spine.style.transform = `scaleY(${clamp((spineY - S.spineTop) / S.spineH).toFixed(4)})`

    // the panel: hung under Write SQL (desktop) or a sheet that rises (phone)
    const pn = S.panel
    if (mode === 'h') {
      const a = E.out(seg(p, 0.27, 0.32)) * fadeOut
      const x = cam.tx + S.g.panel.x * cam.s
      const y = cam.ty + S.g.panel.y * cam.s + (1 - a) * 22
      pn.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0) scale(${cam.s.toFixed(4)})`
      pn.style.opacity = a.toFixed(3)
    } else {
      const sh = sheet(p, fadeOut)
      if (C.compact !== sh.compact) {
        C.compact = sh.compact
        pn.classList.toggle('is-compact', sh.compact)
      }
      const H = sh.compact ? S.sheetHc : S.panelH
      pn.style.transform = `translate3d(0, ${((1 - sh.up) * (H + 40)).toFixed(1)}px, 0)`
      pn.style.opacity = sh.up > 0.001 ? '1' : '0'
    }

    // one-shots, forward only
    const crossed = (t) => S.lastP < t && p >= t && p < t + 0.05
    if (crossed(SEG[9][1])) ring(COLORS.lime)
    if (crossed(SEG[11][1])) ring(COLORS.lime)
    if (crossed(READ[1])) ring(COLORS.lime)
    S.lastP = p
  },

  dot(p, ctx) {
    const S = ctx.state
    const cx = ctx.vw / 2
    const cy = ctx.vh / 2
    if (!S.ready) return { x: cx, y: cy, r: 10, lean: 0 }
    const cam = camera(p, S)
    const toScreen = ([x, y]) => [cam.tx + x * cam.s, cam.ty + y * cam.s]
    const rT = clamp(5.6 * cam.s, 4.4, 7)

    // the seam in: from the centre down onto the start of the thread
    if (p < SEG[0][0]) {
      const u = E.inOut(seg(p, 0.01, SEG[0][0]))
      const [x, y] = toScreen(S.g.start)
      return {
        x: lerp(cx, x, u),
        y: lerp(cy, y, u) - Math.sin(Math.PI * u) * 46,
        r: lerp(10, rT, u),
        glow: 1,
        lean: 0,
        lag: 0.05,
        blink: u < 0.02,
      }
    }

    const mode = S.g.mode
    // where the panel's left edge meets line k (screen px)
    const lineAt = (k) => {
      const ly = S.lineY[0] + k * S.lh
      if (mode === 'h') return toScreen([S.g.panel.x + S.edgeX, S.g.panel.y + ly])
      const sh = sheet(p, 1 - E.inOut(seg(p, OUT[0], OUT[1] - 0.01)))
      return [S.sheetLeft + S.edgeX, ctx.vh - 12 - S.sheetHc + (1 - sh.up) * (S.sheetHc + 40) + ly]
    }

    let x
    let y
    if (p < BACK[0]) {
      // forward along the thread
      let k = 0
      for (let i = 0; i < SEG.length; i++) if (p >= SEG[i][0]) k = i
      const u = segEase(k, seg(p, SEG[k][0], SEG[k][1]))
      ;[x, y] = toScreen(pointAt(S.main[k], u))
    } else if (p < READ[0]) {
      // back along the thread to Write SQL, then down into the query
      const b = backAt(p, S)
      if (mode === 'h') {
        ;[x, y] = toScreen(b.tail > 0 ? pointAt(S.drop, b.tail) : mainAt(S, b.pos))
      } else if (b.tail <= 0) {
        ;[x, y] = toScreen(mainAt(S, b.pos))
      } else {
        // a hop out to the gutter, then down to the first line of the sheet
        const [x0, y0] = toScreen(mainAt(S, S.backStop))
        const [x1, y1] = lineAt(0)
        x = lerp(x0, x1, 1 - (1 - b.tail) ** 3)
        y = lerp(y0, y1, b.tail * b.tail) - Math.sin(Math.PI * b.tail) * 24
      }
    } else {
      // reading the query, line by line
      ;[x, y] = lineAt(readK(p, S))
    }

    const flare = Math.exp(-(((p - SEG[11][1]) / 0.018) ** 2)) + 0.8 * Math.exp(-(((p - READ[1]) / 0.012) ** 2))
    const lift = seg(p, BACK[0], BACK[0] + 0.012) * (1 - seg(p, READ[1], READ[1] + 0.02))
    const out = E.inOut(seg(p, OUT[0], OUT[1]))
    const still = (p > SEG[11][1] && p < BACK[0]) || (p > READ[1] + 0.004 && p < OUT[0])
    return {
      x: lerp(x, cx, out),
      y: lerp(y, cy, out) - Math.sin(Math.PI * out) * 40,
      r: lerp(rT * (1 + 0.25 * flare), 10, out),
      glow: lerp(0.95 + 0.9 * flare + 0.3 * lift, 1, out),
      lean: 0,
      lag: out > 0 && out < 1 ? 0.05 : 0,
      blink: still,
      stretch: 0.6,
    }
  },
})
