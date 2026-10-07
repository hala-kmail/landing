/**
 * 090 hands - "Every number stays in the right hands."
 *
 * The dot is the knob of a three-position role switch (Analyst, Sales manager,
 * Owner) that sits right above the customer table it controls. Scroll walks the
 * knob along the track; a visitor can also click a role. The table re-masks
 * itself for whoever is looking - hashed names, email masks, redacted / last-four
 * phones - and the audit trail writes one line per person who asked (and one for
 * the visitor, when they pick a role themselves).
 *
 * Everything reads one number, `pos` (0..2): where the knob is. Scroll gives
 * `pos` as a pure function of p; a click overrides it (blended over 0.6 s) until
 * the scroll moves into another role's stretch, then scroll takes over again.
 *
 * Exit: the table, the audit and the copy clear first (0.80-0.85), the switch is
 * left alone with its knob for a beat, the knob gathers itself (0.835) and pops
 * out to the centre (0.86-0.93); only then does the empty switch fade.
 */
import { chapter, seg, clamp, lerp, E, ring, go } from '../core.js'

/* ------------------------------------------------------------------ data */

const DATA = [
  { name: 'Nora Al-Harbi', hash: 'cus_7f3a91', email: 'n.alharbi@example.com', phone: '+966 55 214 4821' },
  { name: 'Omar Haddad', hash: 'cus_c20e4b', email: 'o.haddad@example.com', phone: '+966 50 377 9036' },
  { name: 'Lina Saleh', hash: 'cus_9b17d2', email: 'l.saleh@example.com', phone: '+971 52 610 2274' },
  { name: 'Faisal Qureshi', hash: 'cus_4ea6f0', email: 'f.qureshi@example.com', phone: '+966 54 902 1158' },
  { name: 'Sara Mansour', hash: 'cus_e5d382', email: 's.mansour@example.com', phone: '+971 56 433 7710' },
]
const COLS = ['name', 'email', 'phone']
const emailMask = (e) => e[0] + '•••' + e.slice(e.indexOf('@'))
const last4 = (ph) => '•••• ' + ph.slice(-4)

/** What a column shows to each role: 0 analyst, 1 sales manager, 2 owner. */
const VIEW = {
  name: (r, l) => (l >= 1 ? r.name : r.hash),
  email: (r, l) => (l >= 2 ? r.email : emailMask(r.email)),
  phone: (r, l) => (l >= 2 ? r.phone : l >= 1 ? last4(r.phone) : '••••••••'),
}
const MASKED = { name: [1, 0, 0], email: [1, 1, 0], phone: [1, 1, 0] }
const TAGS = { name: ['hashed', '', ''], email: ['email mask', 'email mask', ''], phone: ['redacted', 'last 4', ''] }
const COUNT = ['3 fields masked', '2 fields masked', 'Nothing masked']
const ROLES = ['Analyst', 'Sales manager', 'Owner']
const NMASKED = [3, 2, 0]

/* -------------------------------------------------------------- timeline */

const LAND = 0.12 // the dot settles on the knob
const S1 = [0.31, 0.39] // analyst -> sales manager
const S2 = [0.58, 0.66] // sales manager -> owner
const OUT = 0.8 // table, audit and copy clear by 0.85; the switch stays
const LEAVE = [0.86, 0.93] // knob -> centre
const SW_OUT = [0.87, 0.9] // the empty switch fades after the dot has left it

const scrollPos = (p) => E.inOut(seg(p, S1[0], S1[1])) + E.inOut(seg(p, S2[0], S2[1]))
const scrollRole = (p) => (p < (S1[0] + S1[1]) / 2 ? 0 : p < (S2[0] + S2[1]) / 2 ? 1 : 2)
/** A line rising out of its mask fades in early and out late, so no stray tittle peeks over the edge. */
const maskFade = (a, b) => clamp((a - 0.3) / 0.5) * (1 - clamp((b - 0.3) / 0.45))
const bump = (p, a, len) => (p >= a && p <= a + len ? Math.sin((Math.PI * (p - a)) / len) : 0)

/* -------------------------------------------------------------- scramble */

const GLY = '#%&*+=<>/?0123456789abcdefx•'
function hash(n) {
  n = (n ^ 61) ^ (n >>> 16)
  n = n + (n << 3)
  n = n ^ (n >>> 4)
  n = Math.imul(n, 0x27d4eb2d)
  n = n ^ (n >>> 15)
  return n >>> 0
}
/** From string a to string b as t goes 0..1, left to right, through glyph noise. Pure. */
function scramble(a, b, t, seed) {
  if (t <= 0) return a
  if (t >= 1) return b
  const n = Math.max(a.length, b.length)
  const f = Math.floor(t * 30)
  let s = ''
  for (let i = 0; i < n; i++) {
    const k = (t - (i / n) * 0.6) / 0.4
    const ca = a[i] ?? ''
    const cb = b[i] ?? ''
    if (k >= 1) s += cb
    else if (k <= 0) s += ca
    else if (ca === cb) s += ca
    else s += GLY[hash(seed * 997 + i * 131 + f * 17) % GLY.length]
  }
  return s
}

/* ------------------------------------------------------------- the chapter */

const tf = (el, v) => {
  if (el._tf !== v) el.style.transform = el._tf = v
}
const op = (el, v) => {
  const s = v >= 0.999 ? '1' : v <= 0.001 ? '0' : v.toFixed(3)
  if (el._op !== s) el.style.opacity = el._op = s
}
const txt = (el, v) => {
  if (el._tx !== v) el.textContent = el._tx = v
}
const clip = (el, v) => {
  if (el._cp !== v) el.style.clipPath = el._cp = v
}
/** The visitor's audit line: 0 (gone) .. 1 (in), eased over 0.45 s. */
const youAt = (S, time) => {
  const y = S.you
  if (!y) return 0
  return lerp(y.from, y.to, E.out(clamp((time - y.t0) / 0.45)))
}

chapter({
  id: 'hands',
  title: 'Right hands',
  anchorP: 0.2,
  // the table stays as the owner sees it, the knob on its stop, and scrolls away
  release: { hold: OUT, standin: true },

  build(ctx) {
    const S = ctx.state
    S.lines = ctx.$$('.hands-ln')
    S.lead = ctx.$('.hands-lead')
    S.sw = ctx.$('.hands-switch')
    S.track = ctx.$('.hands-track')
    S.fill = ctx.$('.hands-fill')
    S.stops = ctx.$$('.hands-stop')
    S.rolesBox = ctx.$('.hands-roles')
    S.roles = ctx.$$('.hands-role')
    S.count = ctx.$('.hands-count-txt')
    S.tiltEl = ctx.$('.hands-tilt')
    S.card = ctx.$('.hands-card')
    S.head = ctx.$('.hands-card-head')
    S.thead = ctx.$('.hands-thead')
    S.rows = ctx.$$('.hands-tr').map((row, i) => ({
      el: row,
      cells: COLS.map((c) => row.querySelector(`[data-col="${c}"]`)),
      data: DATA[i],
    }))
    S.tags = COLS.map((c) => ctx.$(`.hands-tag[data-col="${c}"]`))
    S.audit = ctx.$('.hands-audit')
    S.entries = ctx.$$('.hands-entry[data-role]')
    S.youEl = ctx.$('.hands-you')
    S.youN = ctx.$('.hands-you-n')
    S.log = ctx.$('.hands-log')
    S.label = ctx.$('.hands-label')
    S.pos = 0
    S.tilt = { x: 0, y: 0 }

    S.roles.forEach((b) =>
      b.addEventListener('click', () => {
        const role = Number(b.dataset.role)
        const p = ctx.p
        // before the knob has landed, or after it has left, a role takes you to its stretch of the story
        if (p < LAND || p > LEAVE[0]) {
          go('hands', Number(b.dataset.p))
          return
        }
        S.blend = { from: S.pos, t0: ctx.time }
        S.ov = { role, sr: scrollRole(p) }
        S.arrive = role
        // the visitor's own question goes into the audit trail
        txt(S.youN, `as ${ROLES[role]} · ${NMASKED[role]} masked`)
        S.you = { from: youAt(S, ctx.time), to: 1, t0: ctx.time }
        this.paint(ctx)
      }),
    )
  },

  layout(ctx) {
    const S = ctx.state
    const k = ctx.mobile
      ? clamp(Math.min(ctx.vw / 390, ctx.vh / 844), 0.78, 1.1)
      : clamp(Math.min(ctx.vw / 1440, ctx.vh / 900), 0.68, 1.14)
    S.k = k
    ctx.stage.style.setProperty('--k', k.toFixed(4))
    // measure the track with the switch at rest
    const prev = S.sw.style.transform
    S.sw.style.transform = 'none'
    const r = S.track.getBoundingClientRect()
    S.sw.style.transform = prev
    const pad = r.height / 2
    S.tr = { x: r.left, y: r.top, w: r.width, h: r.height, pad }
    S.knobR = (ctx.mobile ? 8.5 : 9.5) * k
    S.stops.forEach((s, i) => (s.style.left = `${pad + (i / 2) * (r.width - 2 * pad)}px`))
    S.rowH = S.entries[0]?.offsetHeight || 0
  },

  knob(S, pos) {
    const t = S.tr
    if (!t) return { x: 0, y: 0 }
    return { x: t.x + t.pad + (pos / 2) * (t.w - 2 * t.pad), y: t.y + t.h / 2 }
  },

  /** The knob's position: scroll's, or a clicked role's while scroll stays in the same stretch. */
  resolvePos(ctx) {
    const S = ctx.state
    const p = ctx.p
    let target = scrollPos(p)
    if (S.ov) {
      if (scrollRole(p) !== S.ov.sr || p < LAND || p > LEAVE[0]) {
        S.ov = null
        S.blend = { from: S.pos, t0: ctx.time }
        if (S.you && S.you.to !== 0) S.you = { from: youAt(S, ctx.time), to: 0, t0: ctx.time }
      } else target = S.ov.role
    }
    let pos = target
    if (S.blend) {
      const u = (ctx.time - S.blend.t0) / 0.6
      if (u >= 1 || ctx.reduced) S.blend = null
      else pos = lerp(S.blend.from, target, E.inOut(clamp(u)))
    }
    return pos
  },

  render(p, ctx) {
    const S = ctx.state
    // a ring when the knob lands on each stop (scrolling forward only)
    const last = S.lastP ?? p
    if (!S.ov && p > last) {
      for (const at of [LAND + 0.004, S1[1], S2[1]]) if (last < at && p >= at) ring()
    }
    S.lastP = p
    this.paint(ctx)
  },

  paint(ctx) {
    const S = ctx.state
    const p = ctx.p
    const pos = (S.pos = this.resolvePos(ctx))
    const mobile = ctx.mobile
    const flat = ctx.reduced // no 3D tilt-ins with reduced motion

    // ---- headline: lines rise out of their masks, then leave upward (gone by 0.85)
    S.lines.forEach((el, i) => {
      const a = E.out(seg(p, 0.02 + i * 0.03, 0.1 + i * 0.03))
      const b = E.in(seg(p, OUT + i * 0.012, OUT + 0.035 + i * 0.012))
      tf(el, `translate3d(0, ${((1 - a) * 108 - b * 108).toFixed(2)}%, 0)`)
      op(el, maskFade(a, b))
    })
    {
      const a = E.out(seg(p, 0.07, 0.15))
      const b = E.in(seg(p, OUT + 0.005, OUT + 0.045))
      op(S.lead, a * (1 - b))
      tf(S.lead, `translate3d(0, ${((1 - a) * 18 - b * 14).toFixed(2)}px, 0)`)
    }

    // ---- the switch: the last thing on screen, it fades only after the knob has left it
    {
      const a = E.out(seg(p, 0.04, 0.12))
      const b = E.inOut(seg(p, SW_OUT[0], SW_OUT[1]))
      op(S.sw, a * (1 - b))
      tf(S.sw, `translate3d(0, ${((1 - a) * 22 + b * 10).toFixed(2)}px, 0)`)
      clip(S.track, a < 1 ? `inset(-30% ${((1 - a) * 100).toFixed(2)}% -30% 0 round 999px)` : '')
      op(S.rolesBox, E.out(seg(p, 0.07, 0.12)))
      // lime fill behind the knob - how much this role is cleared to see
      const t = S.tr
      if (t) {
        const land = E.out(seg(p, LAND - 0.01, LAND + 0.05)) * (1 - E.in(seg(p, LEAVE[0], LEAVE[0] + 0.05)))
        const kx = t.pad + (pos / 2) * (t.w - 2 * t.pad)
        const fw = (kx + S.knobR + 6 - 3) * land
        const right = Math.max(0, t.w - 6 - fw)
        clip(S.fill, `inset(0 ${right.toFixed(1)}px 0 0 round 999px)`)
      }
      const on = Math.round(pos)
      S.roles.forEach((r, i) => {
        const is = i === on
        if (r._on !== is) {
          r._on = is
          r.classList.toggle('is-on', is)
          r.setAttribute('aria-pressed', String(is))
        }
      })
      txt(S.count, COUNT[on])
    }

    // ---- the table card: its rows, head and header arrive with it and leave with it
    {
      const a = E.out(seg(p, 0.035, 0.14))
      const b = E.in(seg(p, OUT, OUT + 0.05))
      op(S.card, a * (1 - b))
      const rx = flat ? 0 : (1 - a) * 14 - b * 6
      tf(S.card, `translate3d(0, ${((1 - a) * (flat ? 24 : 70) - b * 30).toFixed(2)}px, 0) rotateX(${rx.toFixed(2)}deg)`)
      S.rows.forEach((row, i) => {
        const ra = E.out(seg(p, 0.045 + i * 0.01, 0.11 + i * 0.01))
        op(row.el, ra)
        tf(row.el, `translate3d(0, ${((1 - ra) * 12 - b * 6).toFixed(2)}px, 0)`)
      })
      const ha = E.out(seg(p, 0.04, 0.09))
      op(S.thead, ha)
      op(S.head, ha)
    }

    // ---- cells: re-mask for the role the knob is on
    const L = Math.min(1, Math.floor(pos))
    const t = clamp(pos - L)
    const nRows = S.rows.length
    S.rows.forEach((row, ri) => {
      const st = 0.07
      const tr = clamp((t - ri * st) / (1 - (nRows - 1) * st))
      COLS.forEach((c, ci) => {
        const el = row.cells[ci]
        const A = VIEW[c](row.data, L)
        const B = VIEW[c](row.data, L + 1)
        let v
        let masked
        let hl = 0
        if (A === B || tr <= 0) {
          v = tr >= 1 ? B : A
          masked = MASKED[c][tr >= 1 ? L + 1 : L]
        } else if (tr >= 1) {
          v = B
          masked = MASKED[c][L + 1]
        } else {
          v = scramble(A, B, tr, ri * 7 + ci + 1)
          // the typeface changes inside the noise, never after it has settled
          masked = tr < 0.55 ? MASKED[c][L] : MASKED[c][L + 1]
          hl = Math.sin(Math.PI * tr)
        }
        txt(el, v)
        const m = !!masked
        if (el._m !== m) {
          el._m = m
          el.classList.toggle('is-masked', m)
        }
        const h = hl.toFixed(3)
        if (el._hl !== h) {
          el._hl = h
          el.style.setProperty('--hl', h)
        }
      })
    })

    // ---- column tags: what kind of mask is on
    COLS.forEach((c, ci) => {
      const el = S.tags[ci]
      if (!el) return
      const m = lerp(MASKED[c][L], MASKED[c][L + 1], E.inOut(t))
      const ta = TAGS[c][L]
      const tb = TAGS[c][L + 1]
      const label = t < 0.5 ? ta || tb : tb || ta
      let o = m
      if (ta && tb && ta !== tb) o *= 1 - 0.85 * Math.sin(Math.PI * t)
      txt(el, label)
      op(el, o)
    })

    // ---- audit trail
    {
      const a = E.out(seg(p, 0.1, 0.18))
      const b = E.in(seg(p, OUT, OUT + 0.045))
      op(S.audit, a * (1 - b))
      tf(S.audit, `translate3d(0, ${((1 - a) * 34 - b * 20).toFixed(2)}px, ${mobile || flat ? 0 : 30}px)`)
      // each person who asks pushes a new line in at the top of the log
      const arrive = [LAND + 0.005, S1[1] - 0.005, S2[1] - 0.005]
      const got = arrive.map((at) => E.inOut(seg(p, at, at + 0.045)))
      const n = got[0] + got[1] + got[2]
      // ... and so does the visitor, when they pick a role themselves
      const you = youAt(S, ctx.time)
      if (S.you && S.you.to === 0 && you <= 0.001) S.you = null
      const rh = S.rowH || 0
      tf(S.log, `translate3d(0, ${((-(3 - n) + you) * rh).toFixed(2)}px, 0)`)
      // the visitor's line rides just above the newest arrival, in the log's own coordinates
      tf(S.youEl, `translate3d(0, ${((2 - n) * rh).toFixed(2)}px, 0)`)
      op(S.youEl, you)
      const youOn = you > 0.5
      if (S.youEl._on !== youOn) {
        S.youEl._on = youOn
        S.youEl.classList.toggle('is-now', youOn)
        S.youEl.setAttribute('aria-hidden', String(!youOn))
      }
      S.entries.forEach((el) => {
        const i = Number(el.dataset.role)
        op(el, got[i])
        const now = got[i] * clamp(1 - Math.abs(pos - i) * 2) * (1 - you)
        const v = now.toFixed(3)
        if (el._now !== v) {
          el._now = v
          el.style.setProperty('--now', v)
          el.classList.toggle('is-now', now > 0.5)
        }
      })
    }

    {
      const a = E.out(seg(p, 0.08, 0.16))
      const b = E.in(seg(p, OUT, OUT + 0.04))
      op(S.label, a * (1 - b))
    }
  },

  dot(p, ctx) {
    const S = ctx.state
    const cx = ctx.vw / 2
    const cy = ctx.vh / 2
    const kn = this.knob(S, S.pos ?? 0)
    const kr = S.knobR ?? 9
    const a = E.inOut(seg(p, 0.025, LAND))
    const b = E.inOut(seg(p, LEAVE[0], LEAVE[1]))
    let x
    let y
    let r
    if (b > 0) {
      x = lerp(kn.x, cx, b)
      y = lerp(kn.y, cy, b) - Math.sin(Math.PI * b) * ctx.vh * 0.07
      r = lerp(kr, 10, b)
    } else {
      x = lerp(cx, kn.x, a)
      y = lerp(cy, kn.y, a) - Math.sin(Math.PI * a) * ctx.vh * 0.09
      r = lerp(10, kr, a)
    }
    const on = a >= 1 && b <= 0
    // landings: on the knob (vertical squash), then at each stop (it meets the stop sideways)
    const land = bump(p, LAND, 0.035)
    const hit = bump(p, S1[1], 0.03) + bump(p, S2[1], 0.03)
    // anticipation, alone on the empty switch, before it pops out
    const ant = bump(p, LEAVE[0] - 0.025, 0.03)
    const sx = 1 + 0.32 * land - 0.2 * hit + 0.12 * ant
    const sy = 1 - 0.28 * land + 0.16 * hit - 0.14 * ant
    const glow = on ? 0.9 + 0.5 * land + 0.35 * hit + 0.2 * ant : lerp(1, 0.9, a) + (b > 0 ? 0.1 * b : 0)
    return {
      x,
      y,
      r,
      glow,
      halo: on ? 2.5 : lerp(3, 2.5, b > 0 ? 1 - b : a),
      lean: 0,
      lag: on || S.blend ? 0 : 0.04,
      sx,
      sy,
    }
  },

  tick(time, p, ctx) {
    const S = ctx.state
    const youBusy = !!S.you && time - S.you.t0 < 0.5
    if (S.blend || S.wasBlend || youBusy || S.wasYou) {
      this.paint(ctx)
      S.wasBlend = !!S.blend
      S.wasYou = youBusy
      if (!S.blend && S.arrive != null) {
        S.arrive = null
        ring()
      }
    }
    // frame-rate independent smoothing for the tilt
    const dt = clamp(time - (S.lastT ?? time), 0, 0.1)
    S.lastT = time
    if (ctx.reduced || ctx.mobile) return
    // the table leans toward the pointer, a little (the switch stays flat, so the knob sits exactly on it)
    const pt = ctx.pointer
    const tx = pt.active ? clamp((pt.y / ctx.vh - 0.5) * 2, -1, 1) : 0
    const ty = pt.active ? clamp((pt.x / ctx.vw - 0.5) * 2, -1, 1) : 0
    const k = 1 - Math.exp(-dt / 0.25)
    S.tilt.x = lerp(S.tilt.x, tx, k)
    S.tilt.y = lerp(S.tilt.y, ty, k)
    tf(S.tiltEl, `rotateX(${(-S.tilt.x * 2.2).toFixed(3)}deg) rotateY(${(S.tilt.y * 3).toFixed(3)}deg)`)
  },
})
