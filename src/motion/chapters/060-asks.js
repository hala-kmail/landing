// asks (060) - the first product moment.
//
// The lit dot opens a Prism thread around itself (a circle reveal from the dot).
// It drops to just above the composer and follows the caret as the question
// types itself, nodding at each word; then it hops onto the send button and
// its landing is what presses it. It bounces off, rides the sent message up the
// thread and settles beside THINKING as Prism's thinking light, pulsing while
// the agents work. The run stops to ask: the clarification form docks where the
// composer was, every reading computes its figure, and the dot drops to the
// form's status pip (leaving a paused ring in the slot) and waits, glancing at
// the visitor. It is the radio button: it hops into the reading that is chosen
// - by a click on a real button, or by the scroll at ~60 % - and the answer
// follows the choice. At the end the content fades, the thread shrinks around
// the chosen radio and closes into the dot, and the dot returns to the centre
// (S7: r 10, lime).
import { chapter, seg, clamp, lerp, E, COLORS, ring, go } from '../core.js'

const LIME = COLORS.lime
const KEYS = ['requested', 'promised', 'transit']
const ANS = {
  requested: { n: 4630, rest: 'orders arrived after the date the customer asked for.', read: 'after the requested date' },
  promised: { n: 1180, rest: 'orders arrived after the date we promised.', read: 'after the promised date' },
  transit: { n: 2215, rest: 'orders spent more than 48 hours in transit.', read: 'over 48 hours in transit' },
}

// beats (chapter progress)
const P = {
  open: [0.012, 0.085],
  toListen: [0.03, 0.1],
  type: [0.1, 0.232],
  toSend: [0.234, 0.25], // the dot hops onto the send button...
  press: [0.246, 0.264], // ...and its landing presses it
  bubble: [0.256, 0.306],
  ride: [0.262, 0.28], // it bounces off and catches the message as it rises
  agents: [0.29, 0.316], // once the message has landed
  thinkH: [0.296, 0.32], // in place as the light arrives
  toSlot: [0.3, 0.326],
  slide: [0.3, 0.4],
  h1: [0.34, 0.415],
  t1: [0.342, 0.382],
  t2: [0.388, 0.43],
  dock: [0.432, 0.49],
  toPip: [0.47, 0.522],
  legend: [0.468, 0.508],
  opts: 0.482, // + k * 0.026, each over 0.06; figures count over 0.075
  h2: [0.502, 0.567],
  lead: [0.545, 0.61],
  left: [0.548, 0.578],
  auto: [0.585, 0.625],
  answer: [0.636, 0.7],
  copyOut: [0.85, 0.905],
  close: [0.862, 0.926],
  home: [0.914, 0.978],
}
const HOP = 0.44 // s, a clicked hop between options
const CLICK_FROM = P.dock[1] - 0.01 // clicks count from here...
const CLICK_TO = P.close[0] // ...to here

const fmt = (n) => Math.round(n).toLocaleString('en-US')
const arc = (a, b, u, lift = 0, bulge = 0) => {
  const e = E.inOut(u)
  const k = Math.sin(Math.PI * u)
  return { x: lerp(a.x, b.x, e) + k * bulge, y: lerp(a.y, b.y, e) - k * lift }
}
const tf = (el, x, y, extra = '') => {
  el.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0)${extra}`
}
const op = (el, o) => {
  el.style.opacity = o.toFixed(3)
}
const setText = (el, t) => {
  if (el.textContent !== t) el.textContent = t
}
/** The send button's press: driven by the dot landing on it. */
const pressK = (p) => Math.sin(Math.PI * seg(p, P.press[0], P.press[1]))

function choiceOf(p, s) {
  return s.clicked || (p >= P.auto[0] ? 'requested' : null)
}
/** The reading that is chosen (checked) at p: a click, or the scroll once the dot has landed. */
function chosenOf(p, s) {
  return s.clicked || (p >= P.auto[1] - 0.004 ? 'requested' : null)
}
/** 0..1 after a visitor's click (delay in s), so anything still entering completes. */
function clickU(ctx, delay = 0, dur = 0.3) {
  const t = ctx.state.clickT
  return t == null ? 0 : E.out(clamp((ctx.time - t - delay) / dur))
}

function answerReveal(p, ctx) {
  const s = ctx.state
  if (!choiceOf(p, s)) return 0
  return Math.max(E.out(seg(p, P.answer[0], P.answer[1])), clickU(ctx, 0.3, 0.5))
}

/** The card's transform and the transcript's scroll at p. */
function geom(p, ctx) {
  const s = ctx.state
  const open = E.out(seg(p, P.open[0], P.open[1]))
  const slide = E.inOut(seg(p, P.slide[0], P.slide[1]))
  const closeU = seg(p, P.close[0], P.close[1])
  // the close shrinks the card about the chosen radio (where the dot is)
  const closeS = lerp(1, 0.9, E.inOut(closeU))
  const sc = lerp(0.94, 1, open) * closeS
  const dock = E.inOut(seg(p, P.dock[0], P.dock[1]))
  const formY = (1 - dock) * (s.formH + 12)
  const rp = s.radios[KEYS.indexOf(choiceOf(p, s) || 'requested')]
  const rpY = rp.y + formY
  const tx = s.cOff.x * (1 - slide) + (rp.x - s.W / 2) * (1 - closeS)
  const ty = s.cOff.y * (1 - slide) + (1 - open) * 16 + (rpY - s.H / 2) * (1 - closeS)
  const vis = s.scrollH - lerp(s.compH, s.formH, dock)
  const b = E.inOut(seg(p, P.bubble[0], P.bubble[1]))
  const a = E.out(seg(p, P.agents[0], P.agents[1]))
  const t1 = E.out(seg(p, P.t1[0], P.t1[1]))
  const t2 = E.out(seg(p, P.t2[0], P.t2[1]))
  const ans = answerReveal(p, ctx)
  // like the app, the work folds away once the answer is in - when the thread is short of room
  const fold = s.foldOn ? E.inOut(clamp(ans * 1.5)) : 0
  const rb = s.youB * b + (s.headB - s.youB) * a + (s.t1B - s.headB) * t1 + (s.t2B - s.t1B) * t2 + (s.ansB - s.t2B) * ans - fold * s.workH
  const scroll = Math.max(0, rb + 18 - vis)
  return { open, slide, closeU, sc, tx, ty, dock, scroll, formY, ans, fold, b, rp, rpY }
}

/** Card-local point (untransformed) -> viewport px under the card's transform. */
function view(s, g, x, y) {
  return {
    x: s.L + s.W / 2 + (x - s.W / 2) * g.sc + g.tx,
    y: s.T + s.H / 2 + (y - s.H / 2) * g.sc + g.ty,
  }
}

chapter({
  id: 'asks',
  title: 'It asks',
  anchorP: 0.1,
  // the thread stays answered, the chosen reading still checked, and scrolls away
  release: { hold: P.copyOut[0], standin: true },

  build(ctx) {
    const s = ctx.state
    const $ = ctx.$
    Object.assign(s, {
      card: $('.asks-card'),
      body: $('.asks-body'),
      shadow: $('.asks-shadow'),
      head: $('.asks-head'),
      hls: ctx.$$('.asks-hl'),
      lead: $('.asks-lead'),
      empty: $('.asks-empty'),
      label: $('.asks-label'),
      idle: $('.asks-idle'),
      spin: $('.asks-spin'),
      scrollEl: $('.asks-scroll'),
      tx: $('.asks-tx'),
      you: $('.asks-you'),
      bubble: $('.asks-bubble'),
      agents: $('.asks-agents'),
      work: $('.asks-work'),
      thinkH: $('.asks-think-h'),
      slotEl: $('.asks-slot'),
      slotPip: $('.asks-slot-pip'),
      t1: $('.asks-t1'),
      t2: $('.asks-t2'),
      answer: $('.asks-answer'),
      ansN: $('.asks-ans-n'),
      ansRest: $('.asks-ans-rest'),
      ansRead: $('.asks-ans-read'),
      checkC: $('.asks-check-c'),
      checkT: $('.asks-check-t'),
      composer: $('.asks-composer'),
      input: $('.asks-input'),
      typed: $('.asks-typed'),
      ph: $('.asks-ph'),
      caret: $('.asks-caret'),
      send: $('.asks-send'),
      form: $('.asks-form'),
      pipEl: $('.asks-pip'),
      pipRing: $('.asks-pip-ring'),
      leftEl: $('.asks-left'),
      legend: $('.asks-legend'),
      optsWrap: $('.asks-opts'),
      opts: ctx.$$('.asks-opt'),
      clicked: null,
      clickT: null,
      hop: null,
      litK: null,
      shownK: 'requested',
      swapT: -9,
      numFrom: 0,
      last: 0,
      typedN: -1,
      cOff: { x: 0, y: 0 },
      ready: false,
    })
    s.radioEls = s.opts.map((o) => o.querySelector('.asks-radio'))
    s.figs = s.opts.map((o) => o.querySelector('.asks-opt-n'))
    s.figN = s.figs.map((f) => Number(f.dataset.n))
    // the form never leaves the tab order: hidden by opacity and pointer-events only
    s.form.style.visibility = 'visible'

    // the answer is a live region: the counting figure is hidden from assistive
    // tech, which gets the final figure instead (updated with the choice)
    s.ansN.setAttribute('aria-hidden', 'true')
    s.ansSr = document.createElement('span')
    s.ansSr.className = 'sr-only'
    s.ansSr.textContent = fmt(ANS.requested.n)
    s.ansN.before(s.ansSr)

    // the question, one span per character (words kept whole so it wraps by word)
    const text = s.typed.textContent
    s.typed.textContent = ''
    s.chars = []
    s.wordEnds = []
    const words = text.split(' ')
    words.forEach((w, wi) => {
      const ws = document.createElement('span')
      ws.style.whiteSpace = 'nowrap'
      for (const ch of w) {
        const c = document.createElement('span')
        c.textContent = ch
        ws.appendChild(c)
        s.chars.push(c)
      }
      s.typed.appendChild(ws)
      s.wordEnds.push(s.chars.length)
      if (wi < words.length - 1) {
        const sp = document.createElement('span')
        sp.textContent = ' '
        s.typed.appendChild(sp)
        s.chars.push(sp)
      }
    })

    // everything whose transform we drive (cleared before measuring)
    s.moved = [s.card, s.tx, s.work, s.bubble, s.agents, s.thinkH, s.t1, s.t2, s.answer, s.composer, s.form, s.legend, ...s.opts, ...s.hls, s.lead, s.send]

    // the options are real buttons (a radio group): a choice makes the dot hop there
    const choose = (k) => {
      const p = ctx.p
      if (p < CLICK_FROM || p > CLICK_TO) return
      s.opts.forEach((o) => o.setAttribute('aria-checked', o.dataset.k === k ? 'true' : 'false'))
      if (s.clicked === k || (!s.clicked && choiceOf(p, s) === k && p >= P.auto[1])) {
        s.clicked = k
        ring(LIME)
        return
      }
      const d = ctx.dot
      s.hop = { from: { x: d ? d.x : ctx.vw / 2, y: d ? d.y : ctx.vh / 2 }, k, t0: ctx.time, landed: false, prev: s.litK }
      if (answerReveal(p, ctx) > 0.05) {
        s.swapT = ctx.time
        s.numFrom = ANS[s.shownK]?.n ?? 0
      }
      s.clicked = k
      s.clickT = ctx.time
    }
    s.opts.forEach((b) => b.addEventListener('click', () => choose(b.dataset.k)))
    // arrow keys move through the readings and choose, like any radio group
    s.optsWrap.addEventListener('keydown', (e) => {
      const i = s.opts.indexOf(document.activeElement)
      if (i < 0) return
      const n = s.opts.length
      const j =
        e.key === 'ArrowDown' || e.key === 'ArrowRight' ? (i + 1) % n
        : e.key === 'ArrowUp' || e.key === 'ArrowLeft' ? (i + n - 1) % n
        : e.key === 'Home' ? 0
        : e.key === 'End' ? n - 1
        : -1
      if (j < 0) return
      e.preventDefault()
      s.opts[j].focus({ preventScroll: true })
      choose(s.opts[j].dataset.k)
    })
    // keyboard: tabbing into the options while they are still hidden takes you to the question
    s.form.addEventListener('focusin', () => {
      if (ctx.p < 0.5) go('asks', 0.6, { immediate: true })
    })
  },

  layout(ctx) {
    const s = ctx.state
    for (const el of s.moved) el.style.transform = 'none'
    s.body.style.clipPath = 'none'

    const cr = s.card.getBoundingClientRect()
    Object.assign(s, { L: cr.left, T: cr.top, W: cr.width, H: cr.height })
    const local = (el) => {
      const r = el.getBoundingClientRect()
      return { x: r.left - cr.left + r.width / 2, y: r.top - cr.top + r.height / 2, top: r.top - cr.top, left: r.left - cr.left, r }
    }
    s.slot = local(s.slotEl)
    s.pip = local(s.pipEl)
    s.radios = s.radioEls.map(local)
    s.sendPt = local(s.send)
    s.bub = local(s.bubble)
    const comp = s.composer.getBoundingClientRect()
    s.compTop = comp.top - cr.top
    s.compH = comp.height
    s.formH = s.form.getBoundingClientRect().height
    s.scrollH = s.scrollEl.clientHeight
    // the empty thread's centre: the app's empty-state line sits there
    s.emptyY = (s.scrollEl.offsetTop + s.compTop) / 2
    s.body.style.setProperty('--asks-empty-y', `${Math.round(s.emptyY + (ctx.mobile ? 10 : 14))}px`)

    // the caret: where it sits after each typed character (input-local)
    const ir = s.input.getBoundingClientRect()
    s.inputX = ir.left - cr.left
    s.caretAt = [{ x: 0, y: 0 }]
    for (const c of s.chars) {
      const r = c.getBoundingClientRect()
      s.caretAt.push({ x: r.right - ir.left, y: r.top - ir.top })
    }
    if (s.chars[0]) {
      const r0 = s.chars[0].getBoundingClientRect()
      s.caretAt[0] = { x: r0.left - ir.left, y: r0.top - ir.top }
    }

    // transcript blocks: bottoms in transcript coordinates
    const txr = s.tx.getBoundingClientRect()
    const bottom = (el) => el.getBoundingClientRect().bottom - txr.top
    s.youB = bottom(s.you)
    s.headB = bottom(s.thinkH)
    s.t1B = bottom(s.t1)
    s.t2B = bottom(s.t2)
    s.ansB = bottom(s.answer)
    s.workH = s.work.getBoundingClientRect().height + 8
    s.foldOn = s.ansB + 18 > s.scrollH - s.formH
    // the sent message rises out of the composer
    const yb = s.bubble.getBoundingClientRect()
    s.bubbleDy = comp.top - 8 - yb.bottom + yb.height * 0.6

    // before the copy arrives the card is the only subject: centred
    // (just under the centre: the nav bar takes the top of the screen)
    s.cOff = {
      x: ctx.vw / 2 - (cr.left + cr.width / 2),
      y: ctx.vh / 2 + (ctx.mobile ? 30 : 18) - (cr.top + cr.height / 2),
    }
    s.maxR = Math.hypot(cr.width, cr.height)
    s.ready = true
    s.typedN = -1
  },

  render(p, ctx) {
    this.apply(p, ctx)
  },

  apply(p, ctx) {
    const s = ctx.state
    if (!s.ready) return
    if (p < 0.47) {
      s.clickT = null
      s.hop = null
    }
    const g = geom(p, ctx)
    const k = choiceOf(p, s)
    const chosen = chosenOf(p, s)

    // one-shots, forward only
    if (!s.clicked && s.last < P.auto[1] && p >= P.auto[1] && p < P.auto[1] + 0.05) ring(LIME)
    s.last = p

    // ---- the card: opens out of the dot, closes back into it
    tf(s.card, g.tx, g.ty, ` scale(${g.sc.toFixed(4)})`)
    let clip = 'none'
    if (g.open < 1) {
      // circle centred on the viewport centre (where the dot is), in card-local px
      const cx = (ctx.vw / 2 - s.L - s.W / 2 - g.tx) / g.sc + s.W / 2
      const cy = (ctx.vh / 2 - s.T - s.H / 2 - g.ty) / g.sc + s.H / 2
      clip = `circle(${(s.maxR * E.inOut(seg(p, P.open[0], P.open[1]))).toFixed(1)}px at ${cx.toFixed(1)}px ${cy.toFixed(1)}px)`
    } else if (g.closeU > 0) {
      // the card itself collapses into the dot: its edges close in on the chosen
      // radio and the corners round until it is a disc centred on the dot (as
      // wide as the radio's distance to the nearest edge, so the dot is always
      // inside), then the disc shrinks into the dot
      const eA = E.inOut(seg(g.closeU, 0.12, 0.78))
      const eB = E.in(seg(g.closeU, 0.7, 1))
      const R0 = Math.max(4, Math.min(g.rp.x, s.W - g.rp.x, g.rpY, s.H - g.rpY))
      const rho = R0 * (1 - eB)
      const t = lerp(0, g.rpY - rho, eA)
      const l = lerp(0, g.rp.x - rho, eA)
      const b = lerp(0, s.H - g.rpY - rho, eA)
      const rr = lerp(0, s.W - g.rp.x - rho, eA)
      const rad = Math.min(lerp(16, rho, E.inOut(eA)), (s.W - l - rr) / 2, (s.H - t - b) / 2)
      clip = `inset(${t.toFixed(1)}px ${rr.toFixed(1)}px ${b.toFixed(1)}px ${l.toFixed(1)}px round ${Math.max(0, rad).toFixed(1)}px)`
    }
    s.body.style.clipPath = clip
    op(s.empty, 1 - seg(p, P.press[0] - 0.004, P.bubble[0] + 0.008))
    const vis = p > P.open[0] && p < P.close[1]
    s.card.style.visibility = vis ? 'visible' : 'hidden'
    op(s.shadow, Math.min(g.open, 1 - E.out(g.closeU)) * (vis ? 1 : 0))
    // on the close the content goes first, so the iris only ever crosses empty ground
    const keep = 1 - E.inOut(seg(g.closeU, 0, 0.45))
    op(s.head, keep)

    // ---- header: the spinner while the agents work
    const busyClick = s.clickT != null ? clamp((ctx.time - s.clickT) / 0.05) * (1 - clamp((ctx.time - s.clickT - 0.75) / 0.2)) : 0
    const busy = Math.max(
      seg(p, P.press[1], P.press[1] + 0.01) * (1 - seg(p, P.dock[0] + 0.03, P.dock[0] + 0.045)),
      k && !s.clicked ? seg(p, P.auto[1], P.auto[1] + 0.01) * (1 - seg(p, P.answer[0] + 0.02, P.answer[0] + 0.03)) : 0,
      busyClick,
    )
    op(s.spin, busy)
    op(s.idle, 1 - busy)

    // ---- composer: the question types itself
    const n = Math.round(s.chars.length * seg(p, P.type[0], P.type[1]))
    const sent = seg(p, P.bubble[0], P.bubble[0] + 0.012)
    if (n !== s.typedN) {
      s.chars.forEach((c, i) => (c.style.opacity = i < n ? '1' : '0'))
      s.typedN = n
    }
    s.typed.style.opacity = (1 - sent).toFixed(3)
    op(s.ph, n === 0 || sent >= 1 ? (sent >= 1 ? seg(p, P.bubble[0] + 0.02, P.bubble[0] + 0.05) : 1) : 0)
    const cpos = s.caretAt[Math.min(n, s.caretAt.length - 1)] || { x: 0, y: 0 }
    const caretOn = p > P.type[0] - 0.012 && sent < 1
    s.caret.style.opacity = caretOn ? '1' : '0'
    s.caret.style.transform = `translate3d(${(cpos.x + 1).toFixed(1)}px, ${cpos.y.toFixed(1)}px, 0)`
    // the button goes down under the dot's landing
    const press = pressK(p)
    s.send.style.transform = `translate3d(0, ${(1.5 * press).toFixed(2)}px, 0) scale(${(1 - 0.14 * press).toFixed(3)})`
    s.send.style.filter = press > 0.01 ? `brightness(${(1 + 0.25 * press).toFixed(2)})` : ''
    tf(s.composer, 0, g.dock * (s.compH + 10))
    op(s.composer, 1 - seg(p, P.dock[0], P.dock[0] + 0.035))

    // ---- transcript
    tf(s.tx, 0, -g.scroll)
    op(s.tx, keep)
    const bu = seg(p, P.bubble[0], P.bubble[1])
    tf(s.bubble, 0, (1 - g.b) * s.bubbleDy, ` scale(${lerp(0.97, 1, g.b).toFixed(4)})`)
    op(s.bubble, clamp(bu * 5))
    const ag = E.out(seg(p, P.agents[0], P.agents[1]))
    tf(s.agents, 0, (1 - ag) * 8)
    op(s.agents, ag)
    const th = E.out(seg(p, P.thinkH[0], P.thinkH[1]))
    tf(s.thinkH, 0, (1 - th) * 8)
    op(s.thinkH, th)
    // the light has gone to the form: the slot keeps a paused ring
    op(s.slotPip, 0.6 * E.out(seg(p, P.toPip[0] + 0.012, P.toPip[1])))
    const t1 = E.out(seg(p, P.t1[0], P.t1[1]))
    const t2 = E.out(seg(p, P.t2[0], P.t2[1]))
    tf(s.t1, 0, (1 - t1) * 10)
    op(s.t1, t1)
    tf(s.t2, 0, (1 - t2) * 10)
    op(s.t2, t2)

    // ---- the answer follows the choice
    if (k && k !== s.shownK) {
      s.ansRest.textContent = ANS[k].rest
      s.ansRead.textContent = ANS[k].read
      s.ansSr.textContent = fmt(ANS[k].n)
      s.shownK = k
    }
    const rv = g.ans
    tf(s.answer, 0, (1 - rv) * 14 - g.fold * s.workH)
    op(s.work, 1 - E.out(clamp(g.fold * 1.6)))
    s.work.style.transform = g.fold > 0 ? `scale(${lerp(1, 0.97, g.fold).toFixed(4)})` : ''
    op(s.answer, rv)
    s.checkC.style.strokeDashoffset = (1 - E.out(clamp(rv * 1.4))).toFixed(3)
    s.checkT.style.strokeDashoffset = (1 - E.out(clamp((rv - 0.35) / 0.65))).toFixed(3)
    const kk = s.shownK || 'requested'
    const sw = clamp((ctx.time - s.swapT) / 0.7)
    let num = ANS[kk].n * E.out(clamp(rv * 1.15))
    if (sw < 1) num = lerp(s.numFrom, ANS[kk].n, E.swift(sw))
    setText(s.ansN, fmt(num))
    const swT = clamp((ctx.time - s.swapT - 0.08) / 0.4)
    s.ansRest.style.opacity = sw < 1 ? E.out(swT).toFixed(3) : ''
    s.ansRead.style.opacity = sw < 1 ? E.out(swT).toFixed(3) : ''

    // ---- the form docks where the composer was
    tf(s.form, 0, g.formY)
    op(s.form, seg(p, P.dock[0] + 0.01, P.dock[0] + 0.04) * keep)
    const lg = Math.max(E.out(seg(p, P.legend[0], P.legend[1])), clickU(ctx))
    tf(s.legend, 0, (1 - lg) * 8)
    op(s.legend, lg)

    // which row is lit: during a clicked hop the old row stays lit until the dot lands
    let litK = null
    if (k) {
      if (s.clicked && s.hop && s.clickT != null) litK = ctx.time - s.hop.t0 >= HOP * 0.8 ? s.clicked : s.hop.prev
      else if (s.clicked) litK = p >= P.toPip[1] - 0.004 ? s.clicked : null
      else litK = p >= P.auto[1] - 0.004 ? k : null
    }
    s.litK = litK
    const tabK = chosen || KEYS[0]
    s.opts.forEach((o, i) => {
      const a = P.opts + i * 0.026
      // a choice made before the options have all arrived completes them
      const u = Math.max(E.out(seg(p, a, a + 0.06)), clickU(ctx, i * 0.05))
      tf(o, 0, (1 - u) * 14)
      op(o, u)
      // every reading computes its figure; a choice made before they finish completes them
      let f = E.out(seg(p, a + 0.006, a + 0.052))
      if (s.clicked) f = s.clickT != null ? Math.max(f, E.out(clamp((ctx.time - s.clickT) / 0.35))) : 1
      setText(s.figs[i], fmt(s.figN[i] * f))
      const on = litK === KEYS[i]
      if (on !== o.classList.contains('is-on')) o.classList.toggle('is-on', on)
      const ch = chosen === KEYS[i] ? 'true' : 'false'
      if (o.getAttribute('aria-checked') !== ch) o.setAttribute('aria-checked', ch)
      const ti = KEYS[i] === tabK ? 0 : -1
      if (o.tabIndex !== ti) o.tabIndex = ti
    })
    // the form's status pip keeps a paused ring once the light has gone into a radio
    const pipLeft = s.clicked
      ? (s.clickT != null ? clickU(ctx, 0.05) : 1) * seg(p, P.dock[0] + 0.02, P.dock[1])
      : seg(p, P.auto[0] + 0.008, P.auto[0] + 0.03)
    op(s.pipRing, 0.6 * pipLeft)
    const live = p > CLICK_FROM && p < CLICK_TO
    s.form.style.pointerEvents = live ? 'auto' : 'none'
    // the counter goes as soon as anything is chosen, and never comes back during a re-choice
    const answered = Math.max(s.clicked ? (s.clickT != null ? clickU(ctx, 0, 0.2) : 1) : 0, seg(p, P.auto[1] - 0.012, P.auto[1]))
    op(s.leftEl, E.out(seg(p, P.left[0], P.left[1])) * (1 - answered))

    // ---- the copy (a choice made early completes it, so it is all there with the answer)
    const out = E.inOut(seg(p, P.copyOut[0], P.copyOut[1]))
    const h1 = E.out(seg(p, P.h1[0], P.h1[1]))
    const h2 = Math.max(E.out(seg(p, P.h2[0], P.h2[1])), clickU(ctx, 0.1, 0.45))
    const ld = Math.max(E.out(seg(p, P.lead[0], P.lead[1])), clickU(ctx, 0.2, 0.5))
    ;[h1, h2].forEach((u, i) => {
      const el = s.hls[i]
      el.style.transform = `translate3d(0, ${((1 - u) * 108 - out * 30).toFixed(2)}%, 0)`
      el.style.opacity = (u * (1 - out)).toFixed(3)
    })
    tf(s.lead, 0, (1 - ld) * 18 - out * 14)
    op(s.lead, ld * (1 - out))
    s.lead.style.filter = ld < 1 && ld > 0 ? `blur(${((1 - ld) * 5).toFixed(2)}px)` : ''
    op(s.label, E.out(seg(p, 0.07, 0.13)) * (1 - seg(p, P.copyOut[0], P.copyOut[0] + 0.04)))
  },

  dot(p, ctx) {
    const s = ctx.state
    const C = { x: ctx.vw / 2, y: ctx.vh / 2 }
    if (!s.ready) return { x: C.x, y: C.y, r: 10, lean: 0 }
    const m = ctx.mobile
    const g = geom(p, ctx)
    const V = (x, y) => view(s, g, x, y)
    const rL = m ? 5.4 : 6.4 // listening
    const rS = m ? 4.2 : 4.6 // in a slot
    const rR = m ? 4.6 : 5 // in a radio
    const k = choiceOf(p, s)

    // listening: just above the composer, following the caret along the question,
    // with a small nod at the end of each word
    const n = s.chars.length * seg(p, P.type[0], P.type[1])
    let bob = 0
    for (const e of s.wordEnds) {
      const d = n - e
      if (d >= 0 && d < 2.5) bob += Math.sin((Math.PI * d) / 2.5)
    }
    const last = s.caretAt.length - 1
    const i0 = Math.min(Math.floor(n), last)
    const i1 = Math.min(i0 + 1, last)
    const cx = lerp(s.caretAt[i0].x, s.caretAt[i1].x, clamp(n - i0))
    const listenY = s.compTop - (m ? 22 : 26)
    const listen = V(clamp(s.inputX + cx, 36, s.W - 36), listenY + bob * 3)
    // on the send button: sitting on its top edge, pressed into it at the landing
    const pk = pressK(p)
    const seat = V(s.sendPt.x, s.sendPt.top - rL + pk * (3.6 + rL * 0.34))
    // riding the sent message: just off its left edge, rising with it
    const ride = V(s.bub.left - (m ? 13 : 16), s.bub.y + (1 - g.b) * s.bubbleDy - g.scroll)
    const slot = V(s.slot.x, s.slot.y - g.scroll)
    const pip = V(s.pip.x, s.pip.y + g.formY)
    const radio = (key) => {
      const rp = s.radios[KEYS.indexOf(key)]
      return V(rp.x, rp.y + g.formY)
    }

    let pos
    let r
    let glow = 0.9
    let halo = 3
    let lean = 0
    let lag = 0.06
    let blink = false
    let sx = 1
    let sy = 1

    if (p < P.toListen[0]) {
      pos = C
      r = 10
      glow = 1
    } else if (p < P.toListen[1]) {
      const u = seg(p, P.toListen[0], P.toListen[1])
      pos = arc(C, listen, u, 30)
      r = lerp(10, rL, E.inOut(u))
      glow = lerp(1, 0.9, u)
    } else if (p < P.toSend[0]) {
      pos = listen
      r = rL
      lean = 0.15
      blink = true
      lag = 0.08
      sx = 1 + 0.1 * bob
      sy = 1 - 0.14 * bob
    } else if (p < P.ride[0]) {
      // a hop onto the send button; the landing presses it
      const u = seg(p, P.toSend[0], P.toSend[1])
      pos = u < 1 ? arc(listen, seat, u, 22) : seat
      r = rL
      lag = 0.03
      sx = 1 + 0.32 * pk
      sy = 1 - 0.36 * pk
      glow = 0.9 + 0.5 * pk
    } else if (p < P.toSlot[0]) {
      // it bounces off and catches the message as it rises
      const u = seg(p, P.ride[0], P.ride[1])
      pos = u < 1 ? arc(seat, ride, u, 26) : ride
      r = lerp(rL, rS + 0.5, E.inOut(u))
      lag = 0.03
      sx = 1 + 0.32 * pk
      sy = 1 - 0.36 * pk
    } else if (p < P.toSlot[1]) {
      const u = seg(p, P.toSlot[0], P.toSlot[1])
      pos = arc(ride, slot, u, 0, -6)
      r = lerp(rS + 0.5, rS, E.inOut(u))
      glow = lerp(0.9, 0.85, u)
      lag = 0.03
    } else if (p < P.toPip[0]) {
      // thinking: the light pulses while the agents work - on the clock, so it
      // stays alive while the visitor stops to read (on scroll when reduced)
      pos = slot
      lag = 0
      const w = ctx.reduced
        ? 0.5 + 0.5 * Math.sin(((p - P.toSlot[1]) / 0.028) * Math.PI * 2 - Math.PI / 2)
        : 0.5 + 0.5 * Math.sin((ctx.time * Math.PI * 2) / 1.15)
      const amp = seg(p, P.toSlot[1], P.toSlot[1] + 0.01) * (1 - seg(p, P.toPip[0] - 0.01, P.toPip[0]))
      r = rS * (1 + 0.1 * w * amp)
      glow = lerp(0.85, 0.6 + 0.55 * w, amp)
      halo = lerp(3, 2.6 + 0.8 * w, amp)
    } else {
      const wait = s.clicked ? radio(s.clicked) : pip
      if (p < P.toPip[1]) {
        const u = seg(p, P.toPip[0], P.toPip[1])
        pos = arc(slot, wait, u, 0, m ? -4 : -7)
        r = lerp(rS, s.clicked ? rR : rS, u)
        glow = lerp(0.85, 0.7, u)
      } else if (!s.clicked && p < P.auto[0]) {
        // waiting on you: it looks at the pointer
        pos = pip
        r = rS
        glow = 0.7
        lean = 0.75
        blink = true
        lag = 0.05
      } else if (!s.clicked && p < P.auto[1]) {
        const u = seg(p, P.auto[0], P.auto[1])
        pos = arc(pip, radio('requested'), u, 26)
        r = lerp(rS, rR, u)
        glow = lerp(0.7, 1.1, u)
        lag = 0.03
      } else {
        pos = radio(k)
        r = rR
        glow = 0.95
        lag = 0
        if (!s.clicked) {
          const l = Math.sin(Math.PI * seg(p, P.auto[1], P.auto[1] + 0.016))
          sx = 1 + 0.32 * l
          sy = 1 - 0.3 * l
          glow = lerp(0.95, 1.6, l)
        }
      }
      // a visitor's choice: it hops there from wherever it was, and stays
      if (s.clicked && s.hop && s.clickT != null) {
        const t = ctx.time - s.hop.t0
        pos = radio(s.clicked)
        r = rR
        glow = 0.95
        lag = 0
        lean = 0
        blink = false
        sx = 1
        sy = 1
        if (t < HOP) pos = arc(s.hop.from, radio(s.hop.k), clamp(t / HOP), 30)
        else if (t < HOP + 0.24) {
          const l = Math.sin(Math.PI * ((t - HOP) / 0.24))
          sx = 1 + 0.3 * l
          sy = 1 - 0.28 * l
          glow = lerp(0.95, 1.6, l)
        }
      }
      // the thread closes into it; it goes back to the centre
      if (p >= P.home[0]) {
        const u = seg(p, P.home[0], P.home[1])
        pos = arc(pos, C, u, 46)
        r = lerp(r, 10, E.inOut(u))
        glow = lerp(glow, 1, u)
        halo = 3
        lean = 0
        lag = 0.05
        sx = 1
        sy = 1
      }
    }

    return { x: pos.x, y: pos.y, r, color: LIME, glow, halo, lean, lag, blink, sx, sy, stretch: 0.8 }
  },

  tick(time, p, ctx) {
    const s = ctx.state
    // a click animates for a moment after it: keep drawing until it settles
    const hopT = s.hop ? time - s.hop.t0 : 99
    if (s.hop && !s.hop.landed && hopT >= HOP) {
      s.hop.landed = true
      if (p >= P.toPip[1]) ring(LIME)
    }
    const busy = hopT < HOP + 0.3 || (s.clickT != null && time - s.clickT < 1.4) || time - s.swapT < 0.8
    if (busy) this.apply(p, ctx)
  },
})
