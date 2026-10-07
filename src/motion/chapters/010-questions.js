// questions (010) - every company runs on questions.
//
// The dot arrives alone at the centre (S1) and hops to where a sentence will
// end; "Every company runs on questions" rises out of its masks up to it, and
// the dot is its full stop. Then the camera dives into that full stop: the
// headline rushes past, the dot - growing as we near it - drifts back to the
// centre and is the vanishing point of a deep field of questions streaming
// toward us in Tajawal, at every size and depth, with a murmur of small ones
// far behind. The dot glances at each question as it passes (and at the one
// under your pointer, which brightens). Late on, the dot moves to an empty spot
// and waits: one question comes forward along the axis and settles round it -
// "How many orders arrived late?", drawn with no dot under its question mark,
// so the hero dot is that dot - and over it, who asked it (Reem, Head of
// Operations, Monday 09:12). "The answers are already in your data." Then the
// words go, and the dot - carrying the question - returns to the centre (S2).
// Reduced motion: nothing flies; the same beats cross-fade in place.
import { gsap } from 'gsap'
import { chapter, seg, clamp, lerp, E, COLORS, mix, rng, ring } from '../core.js'

const F = 1000 // focal length: something at depth F is drawn at scale 1
const V = 9 * F // how far the camera travels through the field
const { lime: LIME } = COLORS
const DIM = '#4c4f47'
const INK2 = '#c9ccc2'
const INK = '#f2f4ee'

// beats (chapter progress)
const HOP = [0.008, 0.062] // the dot hops to where the sentence will end
const H_IN = 0.05 // ... and the sentence rises in to it (set by ~0.13)
const H_STAG = 0.008 // per word
const H_LEN = 0.05 // each word's entrance
const CAM = [0.26, 0.79] // the camera flies (after a long, still read of the line)
const RAMP = 0.1 // ... easing in and out over this much progress
const BACK = [0.265, 0.39] // the dot leaves the full stop for the centre
const GATE = [CAM[0] + 0.05, CAM[0] + 0.1] // no question shows until the line has rushed past ~1.4x
const STREAM = [0.34, 0.66] // when each field question passes closest
const BIG = [0.585, 0.795] // the question comes forward and stops
const DOCK = [0.595, 0.66] // the dot goes to where the question mark's dot will be, and waits
const WHO = 0.745 // who asked it appears over the question as it comes to rest
const LEAD = 0.78 // the lead rises
const OUT = [0.9, 0.955] // the words leave
const HOME = [0.905, 0.975] // the dot returns to the centre

const easeHop = gsap.parseEase('power1.inOut')
const easeArrive = gsap.parseEase('power3.out')

const quad = (a, b, c, t) => (1 - t) * (1 - t) * a + 2 * t * (1 - t) * b + t * t * c
const smooth = (v, a, b) => {
  const t = clamp((v - a) / (b - a))
  return t * t * (3 - 2 * t)
}

/** How much of the idle drift (tick) is on at p. */
const driftK = (p) => smooth(p, CAM[0], CAM[0] + 0.06) * (1 - smooth(p, 0.7, 0.8))

/** Camera distance 0..1 for progress p: accelerate, cruise, decelerate. */
function travel(p) {
  const [a, b] = CAM
  const L = b - a - RAMP
  const t = clamp(p, a, b) - a
  let d
  if (t < RAMP) d = (t * t) / (2 * RAMP)
  else if (t < b - a - RAMP) d = RAMP / 2 + (t - RAMP)
  else {
    const u = b - a - t
    d = L - (u * u) / (2 * RAMP)
  }
  return d / L
}

/* Where a glyph's dot sits (Tajawal, measured off a canvas): em units, cx from
   the glyph origin, cy above the baseline, r its radius, clip the middle of the
   gap between a question mark's hook and its dot (above the baseline). */
const glyphs = new Map()
function glyph(ch, weight = 700) {
  const loaded = !!document.fonts?.check?.(`${weight} 100px Tajawal`)
  const key = `${ch}|${weight}|${loaded}`
  if (glyphs.has(key)) return glyphs.get(key)
  const S = 400
  const W = Math.round(S * 0.9)
  const H = Math.round(S * 1.4)
  const cv = document.createElement('canvas')
  cv.width = W
  cv.height = H
  const g = cv.getContext('2d', { willReadFrequently: true })
  g.font = `${weight} ${S}px Tajawal`
  g.fillStyle = '#fff'
  g.textBaseline = 'alphabetic'
  const ox = Math.round(S * 0.15)
  const base = Math.round(S * 1.1)
  g.fillText(ch, ox, base)
  const d = g.getImageData(0, 0, W, H).data
  const ink = (y) => {
    let a = -1
    let b = -1
    for (let x = 0; x < W; x++) {
      if (d[(y * W + x) * 4 + 3] > 127) {
        if (a < 0) a = x
        b = x
      }
    }
    return [a, b]
  }
  let y = H - 1
  while (y >= 0 && ink(y)[0] < 0) y--
  const bottom = y
  let minX = W
  let maxX = -1
  while (y >= 0) {
    const [a, b] = ink(y)
    if (a < 0) break
    minX = Math.min(minX, a)
    maxX = Math.max(maxX, b)
    y--
  }
  const top = y + 1
  let gy = y
  while (gy >= 0 && ink(gy)[0] < 0) gy--
  const res = {
    cx: ((minX + maxX + 1) / 2 - ox) / S,
    cy: (base - (top + bottom + 1) / 2) / S,
    r: (maxX - minX + 1 + (bottom - top + 1)) / 4 / S,
    clip: gy >= 0 ? (base - (gy + 1 + y + 1) / 2) / S : 0,
  }
  if (maxX >= 0) glyphs.set(key, res)
  return res
}

const def = {
  id: 'questions',
  title: 'Questions',
  anchorP: 0.18,
  // the question stays, its full stop kept, and scrolls away with the page
  release: { hold: OUT[0], standin: true },

  build(ctx) {
    const s = ctx.state
    s.last = 0
    s.hot = -1
    s.look = null
    s.boxes = [] // the visible questions' boxes this frame, flat: l, t, r, b
    s.drift = { sc: 1, rot: 0, org: '' }
    s.h = ctx.$('.questions-h')
    s.words = ctx.$$('.questions-w')
    s.stop = ctx.$('.questions-stop')
    s.stopBase = ctx.$('.questions-stop .questions-base')
    s.big = ctx.$('.questions-big')
    s.qm = ctx.$('.questions-qm')
    s.qmBase = ctx.$('.questions-qm .questions-base')
    s.lead = ctx.$('.questions-lead')
    s.who = ctx.$('.questions-who')
    s.leadW = ctx.$('.questions-lw')
    s.layers = [ctx.$('.questions-field'), ctx.$('.questions-dust')]

    // the field: each question gets a direction, a distance from the axis and a moment
    const R = rng(1013)
    const qs = ctx.$$('.questions-q')
    s.qs = qs.map((el, i) => {
      const n = qs.length
      return {
        el,
        i,
        th: i * 2.39996 + 0.6 + (R() - 0.5) * 0.35,
        f: 0.7 + R() * 0.3,
        tau: lerp(STREAM[0], STREAM[1], i / (n - 1)),
        roll: (R() - 0.5) * 5,
        w: 0,
        h: 0,
        k: 0,
        on: false,
      }
    })
    for (const q of s.qs) q.T = travel(q.tau)
    // the murmur: small questions far behind, scattered through the whole depth
    const R2 = rng(77)
    s.dust = ctx.$$('.questions-dust span').map((el, i, all) => ({
      el,
      th: R2() * Math.PI * 2,
      f: 0.25 + Math.sqrt(R2()) * 0.95,
      Z: F * 1.6 + (i / all.length) * (V + F * 4) + R2() * F * 0.6,
      a: 0.35 + R2() * 0.45,
    }))
  },

  layout(ctx) {
    const s = ctx.state
    const m = ctx.mobile
    const vw = ctx.vw
    const vh = ctx.vh

    // measure with everything at rest
    s.h.style.transform = 'none'
    for (const w of s.words) w.style.transform = 'none'
    s.big.style.transform = 'none'
    s.leadW.style.transform = 'none'

    // the headline: its full stop sits on the dot's line, at the centre's height
    const gp = glyph('.')
    const hfs = parseFloat(getComputedStyle(s.h).fontSize) || 80
    const hr = s.h.getBoundingClientRect()
    const st = s.stop.getBoundingClientRect()
    const sb = s.stopBase.getBoundingClientRect()
    s.hSlot = { x: st.left + gp.cx * hfs - hr.left, y: sb.top - gp.cy * hfs - hr.top } // in the headline's own box
    s.rStop = Math.max(4.5, gp.r * hfs)
    s.slot = { x: hr.left + s.hSlot.x, y: vh / 2 + (m ? 0 : vh * 0.02) }
    s.hTop = s.slot.y - s.hSlot.y

    // the question that matters: its box, and the empty slot under its question mark
    const gq = glyph('?')
    const bfs = parseFloat(getComputedStyle(s.big).fontSize) || 100
    const br = s.big.getBoundingClientRect()
    const qr = s.qm.getBoundingClientRect()
    const qb = s.qmBase.getBoundingClientRect()
    s.bw = br.width
    s.bh = br.height
    s.qSlot = { x: qr.left + gq.cx * bfs - br.left, y: qb.top - gq.cy * bfs - br.top }
    s.rQ = Math.max(4, gq.r * bfs)
    const cut = qr.bottom - (qb.top - gq.clip * bfs)
    s.qm.style.clipPath = `inset(-40% -40% ${Math.max(0, cut).toFixed(1)}px -40%)`
    // where it stops: centred, a little high so the lead fits under it
    s.bc = { x: vw / 2, y: vh / 2 - (m ? vh * 0.05 : vh * 0.045) }
    s.qF = { x: s.bc.x - s.bw / 2 + s.qSlot.x, y: s.bc.y - s.bh / 2 + s.qSlot.y } // the slot, once it has stopped
    s.lead.style.top = `${(s.bc.y + s.bh / 2 + (m ? 22 : 30)).toFixed(1)}px`
    s.who.style.top = `${(s.bc.y - s.bh / 2 - (m ? 18 : 26) - s.who.offsetHeight).toFixed(1)}px`

    // the field
    const RX = m ? vw * 0.13 : vw * 0.3
    const RY = m ? vh * 0.3 : vh * 0.31
    for (const q of s.qs) {
      q.w = q.el.offsetWidth
      q.h = q.el.offsetHeight
      q.fs = parseFloat(getComputedStyle(q.el).fontSize) || 30
      if (m) {
        // portrait: one above the dot, the next below, each a full line wide
        q.X = Math.cos(q.th) * 0.35 * RX
        q.Y = (q.i % 2 ? 1 : -1) * (0.42 + 0.58 * q.f) * RY
      } else {
        q.X = Math.cos(q.th) * q.f * RX
        q.Y = Math.sin(q.th) * q.f * RY
      }
      // anchor on the side nearest the axis, so a question never crosses the centre
      q.ax = m ? q.w / 2 : q.w * clamp(0.5 - (q.X / RX) * 0.75, 0, 1)
    }
    const DX = m ? vw * 0.42 : vw * 0.5
    const DY = m ? vh * 0.42 : vh * 0.44
    const dfs = s.dust.length ? parseFloat(getComputedStyle(s.dust[0].el).fontSize) || 16 : 16
    for (const d of s.dust) {
      d.X = Math.cos(d.th) * d.f * DX
      d.Y = Math.sin(d.th) * d.f * DY
      d.fs = dfs
      d.w = d.el.offsetWidth || d.el.textContent.length * dfs * 0.5
      d.h = d.el.offsetHeight || dfs
    }
    s.ready = true
  },

  render(p, ctx) {
    const s = ctx.state
    if (!s.ready) return
    const m = ctx.mobile
    const cx = ctx.vw / 2
    const cy = ctx.vh / 2

    // one-shots, forward only: the dot lands in the full stop; it clicks into the question mark
    if (s.last < HOP[1] && p >= HOP[1] && p < HOP[1] + 0.05) ring(LIME)
    if (s.last < BIG[1] - 0.012 && p >= BIG[1] - 0.012 && p < BIG[1] + 0.04) ring(LIME)
    s.last = p

    // the camera
    const T = travel(p)
    const cam = V * T
    const back = E.inOut(seg(p, BACK[0], BACK[1]))
    const vp = { x: lerp(s.slot.x, cx, back), y: lerp(s.slot.y, cy, back) }
    s.vp = vp
    const roll = ((lerp(-2.5, 4, T) * Math.PI) / 180) * (ctx.reduced ? 0 : 1)
    const cs = Math.cos(roll)
    const sn = Math.sin(roll)

    // ---- the headline: rises, holds still for a long read, then we fly into its full stop
    s.words.forEach((w, i) => {
      const a = H_IN + i * H_STAG
      const u = E.out(seg(p, a, a + H_LEN))
      w.style.transform = `translate3d(0, ${((1 - u) * 110).toFixed(2)}%, 0)`
      w.style.opacity = u.toFixed(3)
    })
    // reduced motion: nothing flies - the same beats cross-fade in place
    const R = ctx.reduced
    const kh = R ? 1 : F / Math.max(1, F - cam)
    // no blur on this one: it is a full-width layer, and the opacity takes it out fast enough
    const ho = R ? 1 - smooth(p, 0.27, 0.33) : 1 - smooth(kh, 1.25, 2.4)
    s.h.style.opacity = ho.toFixed(3)
    s.h.style.visibility = ho > 0.002 ? '' : 'hidden'
    s.h.style.transform =
      `translate3d(${(vp.x - s.hSlot.x * kh).toFixed(2)}px, ${(vp.y - s.hSlot.y * kh).toFixed(2)}px, 0) scale(${kh.toFixed(4)})`

    // ---- the field
    const gate = smooth(p, GATE[0], GATE[1])
    const vw = ctx.vw
    const vh = ctx.vh
    // the frame a question must stay inside while it is sharp: clear of the edges, the rail, the
    // nav. It starts to fade 40px before a margin and is gone 24px past it, which is still
    // inside the screen (or short of the rail / under the nav's edge)
    const eL = 16
    const eR = vw - (m ? 16 : 64)
    const eT = m ? 84 : 96
    const eB = vh - 24
    // tick's idle drift scales both layers about the vanishing point by up to this much
    const dz = R ? 1 : 1 + 0.026 * driftK(p)
    // (on a phone a question is capped to the screen's width, so sideways it only fades once
    // it actually crosses the margin)
    const hIn = m ? 0 : -40
    const edge = (l, t, r, b) => {
      l = vp.x + (l - vp.x) * dz
      r = vp.x + (r - vp.x) * dz
      t = vp.y + (t - vp.y) * dz
      b = vp.y + (b - vp.y) * dz
      return 1 - Math.max(smooth(Math.max(eL - l, r - eR), hIn, 24), smooth(Math.max(eT - t, b - eB), -40, 24))
    }
    const boxes = s.boxes
    boxes.length = 0
    let best = null
    for (const q of s.qs) {
      const d = F + V * (q.T - T)
      const k = d > 40 ? F / d : 99
      q.k = k
      // fade in once the type is big enough to read
      let a = R
        ? smooth(k, 0.45, 0.62) * (1 - smooth(k, 1.25, 1.6)) * smooth(p, 0.32, 0.36)
        : smooth(k * q.fs, 6.5, 12.5) * (1 - smooth(k, 1.55, 2.7)) * gate
      // the scale it is drawn at (on a phone never wider than the screen) and the one it
      // travels at (so a capped question still flies on out of the frame)
      const kd = R ? 0.64 : m ? Math.min(k, (vw - 40) / q.w) : k
      const kp = R ? 0.64 : k
      const wx = q.X * cs - q.Y * sn
      const wy = q.X * sn + q.Y * cs
      let sx = vp.x + wx * kp
      const sy = vp.y + wy * kp
      // a phone's questions fly up and down out of the frame: sideways they stay on screen
      if (m && !R) sx = clamp(sx - q.ax * kd, 20, Math.max(20, vw - 20 - q.w * kd)) + q.ax * kd
      // its box on screen: as it nears the frame's edge it fades, so it reads as something
      // flying past the camera rather than text running off the page
      const L = sx - q.ax * kd
      const Rr = L + q.w * kd
      const Tp = sy - (q.h / 2) * kd
      const B = sy + (q.h / 2) * kd
      a *= edge(L, Tp, Rr, B)
      if (a < 0.003) {
        if (q.on) {
          q.el.style.visibility = 'hidden'
          q.el.style.opacity = '0'
          q.el.style.filter = ''
          q.on = false
        }
        continue
      }
      q.on = true
      q.sx = sx
      q.sy = sy
      q.kd = kd
      q.box = [L, Tp, Rr, B]
      q.a = a
      if (a > 0.08) boxes.push(L, Tp, Rr, B)
      q.el.style.visibility = 'visible'
      q.el.style.opacity = a.toFixed(3)
      q.el.style.color = q.i === s.hot ? INK : mix(DIM, INK2, smooth(k, 0.22, 0.85))
      q.el.style.transform =
        `translate3d(${sx.toFixed(2)}px, ${sy.toFixed(2)}px, 0) rotate(${(R ? 0 : q.roll * (1 - smooth(k, 0.2, 1.4)) + (roll * 180) / Math.PI).toFixed(2)}deg) scale(${kd.toFixed(4)}) translate(${(-q.ax).toFixed(1)}px, ${(-q.h / 2).toFixed(1)}px)`
      // a little motion blur as it rushes past - small, and only once it is already going
      const bl = !R && k > 1.6 ? Math.min(2.5, (k - 1.6) * 2.2) * (1 - smooth(a, 0.4, 0.65)) : 0
      q.el.style.filter = bl > 0.05 ? `blur(${bl.toFixed(2)}px)` : ''
      // what the dot looks at: the question passing closest, in its readable moment
      const wgt = smooth(k, 0.42, 0.8) * (1 - smooth(k, 1.45, 2.3)) * a
      if (!best || wgt > best.w) best = { w: wgt, x: sx + (q.w / 2 - q.ax) * kd, y: sy, i: q.i }
    }
    s.look = best && best.w > 0.02 ? best : null

    // ---- the question that matters: along the axis, decelerating, to display size
    const bu = easeArrive(seg(p, BIG[0], BIG[1]))
    const kb = R ? 1 : 1 / lerp(10, 1, bu)
    s.kb = kb
    const bx = cx + (s.bc.x - cx) * kb
    const by = cy + (s.bc.y - cy) * kb
    const btx = bx - (s.bw / 2) * kb
    const bty = by - (s.bh / 2) * kb
    const out = E.inOut(seg(p, OUT[0], OUT[1]))
    const bo = (R ? smooth(p, 0.67, 0.73) : smooth(p, BIG[0] + 0.005, BIG[0] + 0.06)) * (1 - out)
    s.big.style.opacity = bo.toFixed(3)
    s.big.style.visibility = bo > 0.002 ? '' : 'hidden'
    s.big.style.color = mix(DIM, INK, smooth(kb, 0.18, 0.75))
    s.big.style.transform =
      `translate3d(${btx.toFixed(2)}px, ${(bty - out * 26).toFixed(2)}px, 0) scale(${kb.toFixed(4)})`
    s.big.style.filter = out > 0.01 ? `blur(${(out * 6).toFixed(2)}px)` : ''
    s.qx = btx + s.qSlot.x * kb
    s.qy = bty + s.qSlot.y * kb
    if (bo > 0.08) boxes.push(btx, bty, btx + s.bw * kb, bty + s.bh * kb)

    // ---- the murmur behind: dim texture, never on top of a question
    const dg = (R ? smooth(p, 0.32, 0.36) : gate) * (1 - smooth(p, 0.7, 0.78))
    for (const d of s.dust) {
      const dd = d.Z - cam
      const k = dd > 40 ? F / dd : 99
      let a = Math.min(0.45, smooth(k * 1.6 * d.fs, 6.5, 12) * (1 - smooth(k, 0.9, 1.6)) * dg * d.a)
      let px = 0
      let py = 0
      let kd = 0
      if (a >= 0.003) {
        const wx = d.X * cs - d.Y * sn
        const wy = d.X * sn + d.Y * cs
        kd = R ? 0.55 : k
        px = vp.x + wx * kd
        py = vp.y + wy * kd
        const hw = d.w * kd * 0.8 // drawn at scale kd * 1.6, centred
        const hh = d.h * kd * 0.8
        a *= edge(px - hw, py - hh, px + hw, py + hh)
        // where it would cross a question, it all but goes (softly, by how deep it overlaps)
        let clear = 1
        for (let j = 0; j < boxes.length; j += 4) {
          const ox = Math.min(px + hw, boxes[j + 2] + 10) - Math.max(px - hw, boxes[j] - 10)
          const oy = Math.min(py + hh, boxes[j + 3] + 10) - Math.max(py - hh, boxes[j + 1] - 10)
          if (ox > 0 && oy > 0) clear = Math.min(clear, 1 - 0.85 * smooth(Math.min(ox, oy), 0, 14))
        }
        a *= clear
      }
      if (a < 0.003) {
        if (d.on) {
          d.el.style.visibility = 'hidden'
          d.on = false
        }
        continue
      }
      d.on = true
      d.el.style.visibility = 'visible'
      d.el.style.opacity = a.toFixed(3)
      d.el.style.transform =
        `translate3d(${px.toFixed(2)}px, ${py.toFixed(2)}px, 0) scale(${(kd * 1.6).toFixed(4)}) translate(-50%, -50%)`
    }

    // ---- the lead, out of its mask
    const lu = E.out(seg(p, LEAD, LEAD + 0.07))
    const lo = E.inOut(seg(p, OUT[0] + 0.005, OUT[1]))
    s.leadW.style.transform = `translate3d(0, ${((1 - lu) * 110 - lo * 40).toFixed(2)}%, 0)`
    s.leadW.style.opacity = (lu * (1 - lo)).toFixed(3)
    s.lead.style.visibility = lu * (1 - lo) > 0.002 ? '' : 'hidden'

    // ---- who asked it, over the question as it comes to rest
    const wu = E.out(seg(p, WHO, WHO + 0.06))
    s.who.style.opacity = (wu * (1 - lo)).toFixed(3)
    s.who.style.transform = `translate3d(0, ${((1 - wu) * 10 - lo * 18).toFixed(2)}px, 0)`
    s.who.style.visibility = wu * (1 - lo) > 0.002 ? '' : 'hidden'
  },

  dot(p, ctx) {
    const s = ctx.state
    if (!s.ready || !s.vp) return { lean: 0 }
    const m = ctx.mobile
    const cx = ctx.vw / 2
    const cy = ctx.vh / 2

    // 1. the hop into the full stop, and the landing
    const h = easeHop(seg(p, HOP[0], HOP[1]))
    const hx1 = lerp(cx, s.slot.x, 0.55)
    const hy1 = Math.min(cy, s.slot.y) - (m ? 70 : 96)
    let x = quad(cx, hx1, s.slot.x, h)
    let y = quad(cy, hy1, s.slot.y, h)
    let r = lerp(10, s.rStop, h)
    let glow = lerp(1, 0.85, h)
    let sx = 1
    let sy = 1
    const land = seg(p, HOP[1], HOP[1] + 0.04)
    if (land > 0 && land < 1) {
      const q = Math.exp(-land * 4) * Math.cos(land * 10) * (1 - land)
      sx = 1 + 0.32 * q
      sy = 1 - 0.32 * q
      y += r * (1 - sy) * 0.8
    }

    // 2. the camera dives into it; it grows as we near it and becomes the vanishing point
    const back = seg(p, BACK[0], BACK[1])
    if (back > 0) {
      x = s.vp.x
      y = s.vp.y
      r = lerp(s.rStop, 10, E.inOut(back))
      glow = lerp(0.85, 1, back)
    }

    // 3. it glances at each question as it passes (and at the one under the pointer)
    const glance = smooth(p, BACK[1] - 0.02, BACK[1] + 0.04) * (1 - smooth(p, DOCK[0], DOCK[0] + 0.05))
    let lag = 0.07
    if (glance > 0) {
      let tgt = s.look
      const hot = s.hot >= 0 ? s.qs[s.hot] : null
      if (hot && hot.on) {
        tgt = { x: hot.sx + (hot.w / 2 - hot.ax) * hot.kd, y: hot.sy, w: 1 }
        glow += 0.25 * glance // it lights up a little at what you point at
      }
      if (tgt) {
        const dx = tgt.x - x
        const dy = tgt.y - y
        const dl = Math.hypot(dx, dy) || 1
        const reach = (m ? 13 : 24) * Math.min(1, tgt.w * 1.4) * glance
        x += (dx / dl) * reach
        y += (dy / dl) * reach
      }
      lag = lerp(0.07, 0.2, glance)
    }

    // 4. it goes to where the question mark's dot will be and waits; the question
    //    comes forward along the axis and settles round it
    const dk = E.inOut(seg(p, DOCK[0], DOCK[1]))
    if (dk > 0) {
      const a = Math.sin(Math.PI * dk) * (m ? 26 : 44)
      x = lerp(x, s.qF.x, dk)
      y = lerp(y, s.qF.y, dk) + a
      r = lerp(10, s.rQ, dk)
      glow = lerp(1, 0.9, dk)
      lag = lerp(lag, 0.05, dk)
    }

    // 5. ... and carries it home to the centre
    const hm = E.inOut(seg(p, HOME[0], HOME[1]))
    if (hm > 0) {
      x = lerp(x, cx, hm)
      y = lerp(y, cy, hm) - Math.sin(Math.PI * hm) * (m ? 20 : 34)
      r = lerp(r, 10, hm)
      glow = lerp(glow, 1, hm)
      lag = lerp(lag, 0.07, hm)
    }

    const still = (p > HOP[1] && p < BACK[0]) || (p > DOCK[0] && p < HOME[0])
    return {
      x,
      y,
      r,
      color: LIME,
      glow,
      sx,
      sy,
      lag,
      lean: still ? 0 : 0.3 * glance,
      stretch: dk > 0 && dk < 1 ? 0.6 : 1,
    }
  },

  tick(time, p, ctx) {
    const s = ctx.state
    if (!s.ready || ctx.reduced) return

    // the field never quite stops: held still, it keeps drifting toward you, barely
    // (both layers are promoted in CSS; the transform is only written when it visibly changes)
    const on = p > CAM[0] && p < 0.8
    if (s.vp && (on || s.drifting)) {
      const k = on ? driftK(p) : 0
      const sc = 1 + k * (0.014 + 0.012 * Math.sin(time * 0.55))
      const rot = k * 0.45 * Math.sin(time * 0.31)
      const org = `${s.vp.x.toFixed(1)}px ${s.vp.y.toFixed(1)}px`
      const D = s.drift
      const idle = k <= 0.0005
      if (org !== D.org || Math.abs(sc - D.sc) > 0.0002 || Math.abs(rot - D.rot) > 0.002 || (idle && D.sc !== 1)) {
        const tf = idle ? '' : `scale(${sc.toFixed(5)}) rotate(${rot.toFixed(4)}deg)`
        for (const el of s.layers) {
          if (org !== D.org) el.style.transformOrigin = org
          el.style.transform = tf
        }
        D.org = org
        D.sc = idle ? 1 : sc
        D.rot = idle ? 0 : rot
      }
      s.drifting = on
    }

    if (ctx.mobile) return
    // the question under the pointer brightens, and the dot looks at it
    const P = ctx.pointer
    let hot = -1
    if (P.active && p > CAM[0] && p < BIG[1]) {
      // (in the field layer's own space: undo its drift around the vanishing point)
      const D = s.drift
      const ux = s.vp.x + (P.x - s.vp.x) / D.sc
      const uy = s.vp.y + (P.y - s.vp.y) / D.sc
      for (const q of s.qs) {
        if (!q.on || !q.box || q.a < 0.15 || q.k < 0.3 || q.k > 2.2) continue
        const [l, t, r, b] = q.box
        if (ux > l - 8 && ux < r + 8 && uy > t - 6 && uy < b + 6) hot = q.i
      }
    }
    if (hot !== s.hot) {
      if (s.hot >= 0) s.qs[s.hot].el.classList.remove('is-hot')
      if (hot >= 0) s.qs[hot].el.classList.add('is-hot')
      s.hot = hot
      def.render(p, ctx)
    }
  },
}

chapter(def)
