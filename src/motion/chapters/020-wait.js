/**
 * 020 wait - "But getting to them takes a ticket, a queue, and nine days."
 *
 * The question becomes a request ticket and the dot drops into it as its amber
 * status light. The ticket files itself at the back of a queue of other
 * people's requests; days flip by, the queue crawls forward, and the dot rides
 * its row the whole way - restless on weekdays, drooping at the weekend. On day
 * nine the ticket reaches the front and resolves: the light goes neutral grey.
 * The last frame (the resolved row alone) is the first frame of 030-number.
 */
import { chapter, seg, win, clamp, lerp, E, COLORS, mix, ring, impulse, tone } from '../core.js'
import { splitWords, playWords, css, bump, KIT } from './030-number.kit.js'


/* nine days: day k (1..9) begins at D(k) */
const D0 = 0.448
const DSTEP = 0.0455
const D = (k) => D0 + (k - 1) * DSTEP
/* tickets resolved ahead of ours, per day (nothing moves at the weekend) */
const PER_DAY = [1, 2, 1, 2, 1, 0, 0, 3, 2]
const RES = []
PER_DAY.forEach((n, d) => {
  for (let i = 0; i < n; i++) RES.push(D(d + 1) + (DSTEP * (i + 0.8)) / (n + 0.6))
})
const EXIT = 0.014
const P_PROG = RES[RES.length - 1] + EXIT * 0.7 // ours reaches the front
const P_DONE = 0.884 // and resolves
const HOPS = [2, 3, 4, 5, 8, 9] // weekdays: the dot hops, impatient

/* phrases of the headline: [in start, in end] */
const PH = [
  [0.05, 0.13],
  [0.285, 0.345],
  [0.405, 0.465],
]
const OUT = [0.89, 0.94]
/* once resolved, our row rises to where the report will open (030-number) -
   it is still arriving when the chapter hands over, so the seam never sits still */
const RISE = [0.888, 1]
/* the weekday nearest p (the dot's impatient hop squashes it on take-off) */
const hopSquash = (p) => {
  let q = 0
  for (const k of HOPS) q = Math.max(q, bump(seg(p, D(k), D(k) + 0.008)))
  return q
}

const exitAt = (j, p) => E.inOut(seg(p, RES[j], RES[j] + EXIT))

function reset(el) {
  el.style.transform = 'none'
  el._transform = 'none'
}

chapter({
  id: 'wait',
  title: 'The wait',
  anchorP: 0.2,

  build(ctx) {
    const s = ctx.state
    s.eyebrow = ctx.$('.wait-eyebrow')
    s.ph = ctx.$$('.wait-ph')
    s.words = s.ph.map((el) => splitWords(el))
    s.clock = ctx.$('.wait-clock')
    s.reel = ctx.$('.wait-reel')
    s.dayOf = ctx.$('.wait-day-of')
    s.cells = ctx.$$('.wait-cell')
    s.fronts = ctx.$$('.wait-front')
    s.board = ctx.$('.wait-board')
    s.chrome = [ctx.$('.wait-bbg'), ctx.$('.wait-qhead')]
    s.slots = ctx.$$('.wait-slots li')
    s.open = ctx.$('.wait-open')
    s.rows = ctx.$$('.wait-row')
    s.ours = ctx.$('.wait-row.is-ours')
    s.others = s.rows.filter((r) => r !== s.ours)
    s.oursSock = s.ours.querySelector('.wait-sock')
    s.oursStt = s.ours.querySelector('.wait-stt')
    s.rowStt = s.others.map((r) => r.querySelector('.wait-stt'))
    s.card = ctx.$('.wait-ticket')
    s.cardLines = ctx.$$('.wait-tl')
    s.cardSockEl = ctx.$('.wait-tsock')
    s.cardState = ctx.$('.wait-tstate')
    s.lastP = -1
    s.rowState = []

    // the visitor can try to hurry it along. The dot jumps; the queue does not move.
    s.nudgeBox = ctx.$('.wait-nudgebox')
    s.nudge = ctx.$('.wait-nudge')
    s.reply = ctx.$('.wait-reply')
    s.nudgeN = ctx.$('.wait-nudgen')
    s.asks = 0
    const REPLIES = [
      'Auto-reply: your request is in the queue.',
      'Auto-reply: we’ll get back to you shortly.',
      'Auto-reply: thank you for your patience.',
    ]
    s.nudge.addEventListener('click', () => {
      s.asks += 1
      impulse((s.asks % 2 ? -1 : 1) * 60, -320)
      ring(COLORS.amber)
      s.reply.textContent = REPLIES[(s.asks - 1) % REPLIES.length]
      s.nudgeN.textContent = s.asks > 1 ? `×${s.asks}` : ''
      s.reply.classList.remove('is-on')
      void s.reply.offsetWidth
      s.reply.classList.add('is-on')
      clearTimeout(s.replyT)
      s.replyT = setTimeout(() => s.reply.classList.remove('is-on'), 2800)
    })
  },

  layout(ctx) {
    const s = ctx.state
    // measure at rest: nothing that holds a socket may carry a transform
    for (const el of [s.card, s.ours, s.board, ...s.cardLines]) reset(el)
    const cr = s.card.getBoundingClientRect()
    const ks = s.cardSockEl.getBoundingClientRect()
    const ox = ks.left + ks.width / 2 - cr.left
    const oy = ks.top + ks.height / 2 - cr.top
    // the card scales and tilts around its status socket, so the dot can sit still in it
    s.card.style.transformOrigin = `${ox.toFixed(1)}px ${oy.toFixed(1)}px`
    s.cardSock = { x: ks.left + ks.width / 2, y: ks.top + ks.height / 2 }
    const rs = s.oursSock.getBoundingClientRect()
    s.rowSock = { x: rs.left + rs.width / 2, y: rs.top + rs.height / 2 }
    s.rowH = s.ours.getBoundingClientRect().height
    s.sockR = ks.width / 2
  },

  /* everything that moves, as a function of p */
  geo(p, ctx) {
    const s = ctx.state
    let gone = 0
    for (let j = 0; j < RES.length; j++) gone += exitAt(j, p)
    const cin = E.out(seg(p, 0.045, 0.14))
    const m = E.inOut(seg(p, 0.305, 0.4))
    const target = { x: s.rowSock.x, y: s.rowSock.y + 12 * s.rowH }
    const card = {
      ty: (1 - cin) * 46 + m * (target.y - s.cardSock.y),
      tx: m * (target.x - s.cardSock.x),
      rx: (1 - cin) * 16,
      sc: 1 - 0.5 * m,
    }
    const oursSlot = 12 - gone
    // the board stays centred as the queue shortens; once resolved, our ticket
    // rises to the top, where its report will open (030-number)
    const boardY = (gone / 2) * s.rowH * (1 - E.inOut(seg(p, RISE[0], RISE[1])))
    return {
      gone,
      card,
      m,
      oursSlot,
      boardY,
      cardSock: { x: s.cardSock.x + card.tx, y: s.cardSock.y + card.ty },
      rowSock: { x: s.rowSock.x, y: s.rowSock.y + oursSlot * s.rowH + boardY },
    }
  },

  render(p, ctx) {
    const s = ctx.state
    const g = this.geo(p, ctx)
    const tout = seg(p, OUT[0], OUT[1])

    /* one-shots, forward only, never on a jump */
    const lp = s.lastP
    if (lp >= 0 && p > lp && p - lp < 0.05) {
      const crossed = (x) => lp < x && p >= x
      if (crossed(0.162)) ring(COLORS.amber)
      for (const k of HOPS) if (crossed(D(k))) impulse(0, k === 8 ? -230 : -170)
      if (crossed(P_DONE)) ring(KIT.believed)
    }
    s.lastP = p

    /* copy */
    css(s.eyebrow, 'opacity', (E.out(seg(p, 0.03, 0.09)) * (1 - tout)).toFixed(3))
    for (let i = 0; i < 3; i++) {
      playWords(s.words[i], seg(p, PH[i][0], PH[i][1]), tout, 0.45)
      // the newest phrase is the bright one
      const next = PH[i + 1]
      const dimT = next ? E.inOut(seg(p, next[0], next[0] + 0.04)) : 0
      css(s.ph[i], 'color', dimT > 0 ? mix(COLORS.ink, tone('--wait-fade'), dimT * 0.85) : '')
    }

    /* the ticket card */
    const c = g.card
    const cOp = seg(p, 0.045, 0.11) * (1 - seg(p, 0.35, 0.395))
    css(s.card, 'opacity', cOp.toFixed(3))
    css(s.card, 'visibility', cOp <= 0.001 ? 'hidden' : 'visible')
    css(
      s.card,
      'transform',
      `translate3d(${c.tx.toFixed(2)}px, ${c.ty.toFixed(2)}px, 0) rotateX(${c.rx.toFixed(2)}deg) scale(${c.sc.toFixed(4)})`,
    )
    s.cardLines.forEach((el, i) => {
      const a = E.out(seg(p, 0.08 + i * 0.017, 0.13 + i * 0.017))
      css(el, 'opacity', a.toFixed(3))
      css(el, 'transform', `translate3d(0, ${((1 - a) * 12).toFixed(2)}px, 0)`)
    })
    css(s.cardState, 'opacity', E.out(seg(p, 0.165, 0.2)).toFixed(3))

    /* the board */
    css(s.board, 'transform', `translate3d(0, ${g.boardY.toFixed(2)}px, 0)`)
    const chrome = E.out(seg(p, 0.29, 0.36)) * (1 - seg(p, 0.885, 0.935))
    for (const el of s.chrome) css(el, 'opacity', chrome.toFixed(3))
    const remaining = 13 - g.gone
    // the panel collapses with the queue (its rounded bottom edge and shadow ride up with it)
    css(s.chrome[0], 'bottom', `${((13 - remaining) * s.rowH).toFixed(1)}px`)
    s.slots.forEach((el, k) => css(el, 'opacity', (chrome * clamp(remaining - k)).toFixed(3)))
    const open = String(Math.round(remaining))
    if (s.open.textContent !== open) s.open.textContent = open

    let shift = 0
    s.others.forEach((row, j) => {
      // rows under the shrinking ticket wait until it has passed them
      const a0 = (j >= 4 ? 0.37 : 0.3) + j * 0.0065
      const a = E.out(seg(p, a0, a0 + (j >= 4 ? 0.04 : 0.05)))
      const e = exitAt(j, p)
      const y = (j - shift) * s.rowH - (1 - a) * 18
      shift += e
      css(row, 'transform', `translate3d(${(-E.in(e) * 34).toFixed(2)}px, ${y.toFixed(2)}px, 0)`)
      const op = a * (1 - e)
      css(row, 'opacity', op.toFixed(3))
      css(row, 'visibility', op <= 0.001 ? 'hidden' : 'visible')
      const st = p >= RES[j] - 0.006 ? 'done' : j === 0 || p >= RES[j - 1] ? 'prog' : 'queue'
      if (s.rowState[j] !== st) {
        s.rowState[j] = st
        row.dataset.s = st
        s.rowStt[j].textContent = st === 'done' ? 'Done' : st === 'prog' ? 'In progress' : 'In queue'
      }
    })
    const oursOp = E.out(seg(p, 0.37, 0.4))
    css(s.ours, 'opacity', oursOp.toFixed(3))
    css(s.ours, 'transform', `translate3d(0, ${(g.oursSlot * s.rowH).toFixed(2)}px, 0)`)
    // "Ask for an update" travels under our row while we wait
    const nA = E.out(seg(p, 0.47, 0.5)) * (1 - seg(p, P_PROG - 0.03, P_PROG))
    css(s.nudgeBox, 'opacity', nA.toFixed(3))
    // (never visibility:hidden - a keyboard user tabbing to it is scrolled here by data-p)
    css(s.nudge, 'pointerEvents', nA < 0.5 ? 'none' : 'auto')
    css(s.nudgeBox, 'transform', `translate3d(0, ${((g.oursSlot + 1) * s.rowH + 24 + (1 - nA) * 8).toFixed(2)}px, 0)`)

    const ost = p >= P_DONE ? 'done' : p >= P_PROG ? 'prog' : 'queue'
    if (s.oursState !== ost) {
      s.oursState = ost
      s.ours.dataset.s = ost
      s.oursStt.textContent = ost === 'done' ? 'Resolved' : ost === 'prog' ? 'In progress' : 'In queue'
    }

    /* the clock: DAY n, and the calendar strip flipping */
    const cin = E.out(seg(p, 0.42, 0.475))
    css(s.clock, 'opacity', (cin * (1 - tout)).toFixed(3))
    css(s.clock, 'transform', `translate3d(0, ${((1 - cin) * 18 - tout * 10).toFixed(2)}px, 0)`)
    let day = 1
    for (let k = 2; k <= 9; k++) day += E.inOut(seg(p, D(k) - 0.007, D(k) + 0.007))
    css(s.reel, 'transform', `translate3d(0, ${(-((day - 1) / 9) * 100).toFixed(3)}%, 0)`)
    const now = Math.round(day)
    const of = now === 6 || now === 7 ? 'weekend · nothing moves' : 'of waiting'
    if (s.dayOf.textContent !== of) s.dayOf.textContent = of
    s.cells.forEach((cell, i) => {
      const k = i + 1
      const a = E.out(seg(p, 0.43 + i * 0.005, 0.47 + i * 0.005))
      const f = k < 9 ? E.inOut(seg(p, D(k + 1) - 0.009, D(k + 1) + 0.009)) : 0
      css(cell, 'opacity', a.toFixed(3))
      css(cell, 'transform', `translate3d(0, ${((1 - a) * 10).toFixed(2)}px, 0) rotateX(${(-180 * f).toFixed(2)}deg)`)
      const isNow = k === now && cin > 0
      if (s.fronts[i]._now !== isNow) {
        s.fronts[i]._now = isNow
        s.fronts[i].classList.toggle('is-now', isNow)
      }
    })
  },

  dot(p, ctx) {
    const { vw, vh } = ctx
    const cx = vw / 2
    const cy = vh / 2
    const g = this.geo(p, ctx)

    // S2: centre, lime; the borrowed dot turns amber at once
    let color = mix(COLORS.lime, COLORS.amber, E.out(seg(p, 0.0, 0.07)))
    if (p < 0.035) {
      return { x: cx, y: cy, r: 10, color, glow: lerp(1, 0.85, seg(p, 0, 0.035)), lean: 0, lag: 0.05 }
    }

    // crouch, then a hop down into the ticket's socket
    if (p < 0.16) {
      const k = E.inOut(seg(p, 0.035, 0.075))
      const u = seg(p, 0.075, 0.16)
      const sock = g.cardSock
      if (u <= 0) {
        return {
          x: cx, y: cy + 5 * k, r: 10, color, glow: 0.85, lean: 0, lag: 0.04,
          sx: 1 + 0.16 * k, sy: 1 - 0.2 * k, blink: false,
        }
      }
      const ue = E.inOut(u)
      const x = lerp(cx, sock.x, ue)
      const y = lerp(cy, sock.y, E.in(u) * 0.35 + ue * 0.65) - 4 * u * (1 - u) * Math.min(150, vh * 0.17)
      return {
        x, y, r: lerp(10, 5, ue), color, glow: lerp(0.85, 0.6, u), lean: 0, lag: 0.03,
        sx: 1 - 0.1 * Math.sin(Math.PI * u), sy: 1 + 0.12 * Math.sin(Math.PI * u), blink: false, stretch: 0.7,
      }
    }

    // the status light: in the card, then in our row as the queue crawls
    // (the core breathes its glow; everything here is a pure function of p)
    const sock = p < 0.4 ? g.cardSock : g.rowSock
    const land = bump(seg(p, 0.16, 0.205))
    const hop = hopSquash(p)
    let glow = 0.55
    let y = sock.y
    let r = 5
    // the weekend: nothing moves, the light sags and dims
    const wk = win(p, D(6) + 0.004, D(8) - 0.002, 0.012, 0.006)
    glow = lerp(glow, 0.25, wk)
    y += 4 * wk
    r -= 0.8 * wk
    if (p >= P_PROG) {
      // in progress at last: it brightens, pulsing as the work goes on
      const u = seg(p, P_PROG, P_DONE)
      const busy = 0.66 + 0.2 * Math.sin(u * Math.PI * 5) * (1 - u * 0.4)
      glow = lerp(0.42, busy, 1 - seg(p, P_DONE, P_DONE + 0.02))
    }
    color = mix(COLORS.amber, KIT.believed, E.inOut(seg(p, P_DONE - 0.004, P_DONE + 0.028)))
    return {
      x: sock.x, y, r, color, glow, halo: 2.8, lean: 0, lag: 0, blink: false, stretch: 0.3,
      sx: 1 + 0.42 * land + 0.18 * hop, sy: 1 - 0.36 * land - 0.3 * hop,
    }
  },
})
