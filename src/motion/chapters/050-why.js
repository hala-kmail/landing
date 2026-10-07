// why (050) - the turn.
//
// Darkness and the dim grey dot (S5). "That's why we built" rises in the dark,
// then "Prism." assembles underneath the dot with its i left dotless - the
// lockup is placed so the missing tittle is exactly where the dot has been
// waiting. The stem rises (a crisp bar, its flat top climbing) to meet it and
// the dot ignites: grey -> white-hot -> lime, r 6 -> 14 -> the tittle, glow
// surging past 2, two rings, and for a moment the story's only spectrum: soft
// prism light fanning down from it across the word. The light sweeps the
// letters out of the dark. Then the word sinks away (each letter fading as it
// goes) and leaves the lit dot alone, and the bridge - "Same Monday · Same
// question." - uses it as its middle dot, and holds. Ends on the dot alone at
// the centre, r 10, lime (into asks).
import { chapter, seg, clamp, lerp, E, COLORS, mix, rng, ring, tone } from '../core.js'


// geometry of Tajawal 700's "i", measured from the glyph (em units)
const TIT_X = 0.1275 // tittle centre from the glyph origin (over the dotless stem)
const TIT_Y = 0.575 // tittle centre above the baseline
const TIT_R = 0.075 // tittle radius

// beats (chapter progress)
const IGN = 0.365 // the stem touches the dot: ignition
const OUT = 0.58 // the word starts to leave
const B1 = [0.7, 0.77] // "Same Monday" comes out of the dot
const B2 = [0.725, 0.795] // "Same question."
const B1X = [0.935, 0.975] // ...and they go back into it
const B2X = [0.94, 0.98]

const st = (el, o, y, x = 0, unit = '%', extra = '') => {
  el.style.opacity = o.toFixed(3)
  el.style.transform = `translate3d(${x.toFixed(2)}${unit}, ${y.toFixed(2)}${unit}, 0)${extra}`
}

chapter({
  id: 'why',
  title: 'Why Prism',
  anchorP: 0.5,

  build(ctx) {
    const s = ctx.state
    s.lock = ctx.$('.why-lock')
    s.h = ctx.$('.why-h')
    s.glow = ctx.$('.why-glow')
    s.l1 = ctx.$('.why-l1')
    s.l2 = ctx.$('.why-l2')
    s.words = ctx.$$('.why-l1 .why-w')
    s.chars = ctx.$$('.why-l2 .why-c')
    s.i = ctx.$('.why-i')
    s.base = ctx.$('.why-base')
    s.rays = ctx.$('.why-rays')
    s.floor = ctx.$('.why-floor')
    s.bridge = ctx.$('.why-bridge')
    s.b1 = ctx.$('.why-b1')
    s.b2 = ctx.$('.why-b2')
    s.base2 = ctx.$('.why-base2')
    s.last = 0

    // order the letters rise in: the outside first, the stem of the i last
    // (it is the one that meets the dot); the light sweeps them from the i out.
    // The full stop travels with the m, so it never stands apart as a second dot.
    const iAt = s.chars.indexOf(s.i)
    s.charInfo = s.chars.map((el, k) => ({
      el,
      d: el.classList.contains('why-stop') ? 2 : Math.min(Math.abs(k - iAt), 2),
      isI: el === s.i,
    }))

    // the spectrum: soft, overlapping bands of light fanning downward,
    // red on the left to violet on the right, over one faint continuous wash
    const R = rng(50)
    const rays = []
    const N = 17
    const from = 150
    const to = 210
    for (let k = 0; k < N; k++) {
      const a = lerp(from, to, k / (N - 1)) + (R() - 0.5) * 1.6
      const hue = lerp(272, 0, k / (N - 1))
      const al = (0.14 + R() * 0.16).toFixed(3)
      const w = 2.2 + R() * 2.4
      rays.push(`hsla(${hue},100%,64%,0) ${(a - w).toFixed(2)}deg, hsla(${hue},100%,66%,${al}) ${a.toFixed(2)}deg, hsla(${hue},100%,64%,0) ${(a + w).toFixed(2)}deg`)
    }
    const wash = []
    for (let k = 0; k <= 8; k++) {
      const a = lerp(from - 6, to + 6, k / 8)
      const hue = lerp(272, 0, k / 8)
      const al = k === 0 || k === 8 ? 0 : 0.1
      wash.push(`hsla(${hue},100%,62%,${al}) ${a.toFixed(1)}deg`)
    }
    s.rays.innerHTML = '<i></i>'
    s.rays.firstChild.style.background =
      `conic-gradient(from 0deg at 50% 0%, transparent 0deg, ${rays.join(', ')}, transparent 360deg), ` +
      `conic-gradient(from 0deg at 50% 0%, transparent 0deg, transparent ${from - 6}deg, ${wash.join(', ')}, transparent ${to + 6}deg, transparent 360deg)`
  },

  layout(ctx) {
    const s = ctx.state
    // measure with every transform and clip cleared; the next frame re-renders
    s.lock.style.transform = 'none'
    s.h.style.transform = 'none'
    for (const c of s.chars) {
      c.style.transform = 'none'
      c.style.clipPath = 'none'
    }
    s.bridge.style.transform = 'none'
    s.b1.style.transform = 'none'
    s.b2.style.transform = 'none'

    const fs = parseFloat(getComputedStyle(s.i).fontSize) || 120
    const ir = s.i.getBoundingClientRect()
    const br = s.base.getBoundingClientRect()
    const hr = s.h.getBoundingClientRect()
    const cx = ir.left + TIT_X * fs
    const cy = br.top - TIT_Y * fs
    s.rT = TIT_R * fs
    s.dx = ctx.vw / 2 - cx
    s.dy = ctx.vh / 2 - cy
    s.h.style.transformOrigin = `${(cx - hr.left).toFixed(1)}px ${(cy - hr.top).toFixed(1)}px`
    // the stem is revealed from the baseline up: its clip top runs baseline -> box top
    s.iBase = br.top - ir.top
    // the word's glow sits on the letters (x-height centre), not on the line box
    s.glow.style.top = `${(br.top - hr.top - 0.33 * fs - 0.8 * fs).toFixed(1)}px`
    s.rays.style.setProperty('--why-R', `${Math.round(Math.min(Math.hypot(ctx.vw, ctx.vh) * 0.62, 1300))}px`)

    // the bridge: put the x-height centre of the words on the dot's line
    if (!ctx.mobile) {
      const fs2 = parseFloat(getComputedStyle(s.bridge).fontSize) || 48
      const b = s.base2.getBoundingClientRect()
      s.bdy = ctx.vh / 2 + 0.235 * fs2 - b.top
    } else s.bdy = 0
  },

  render(p, ctx) {
    const s = ctx.state

    // ignition one-shots, forward only
    if (s.last < IGN && p >= IGN && p < IGN + 0.08) ring(COLORS.lime)
    if (s.last < IGN + 0.025 && p >= IGN + 0.025 && p < IGN + 0.1) ring(tone('--why-spark'))
    s.last = p

    // a slow push-in, around the dot
    const push = 1 + 0.035 * E.glide(seg(p, 0.04, 0.64))
    s.lock.style.transform = `translate3d(${s.dx.toFixed(2)}px, ${s.dy.toFixed(2)}px, 0)`
    s.h.style.transform = `scale(${push.toFixed(4)})`

    // line 1: "That's why we built" rises out of its mask, word by word
    const lit = E.out(seg(p, IGN, IGN + 0.08))
    s.l1.style.color = mix(tone('--why-l1-dark'), COLORS.ink2, lit)
    s.words.forEach((w, k) => {
      const a = 0.06 + k * 0.036
      const u = E.out(seg(p, a, a + 0.11))
      const o = E.inOut(seg(p, OUT - 0.005 + k * 0.014, OUT + 0.065 + k * 0.014))
      const y = (1 - u) * 112 - o * 60
      w.style.opacity = (u * (1 - o)).toFixed(3)
      w.style.transform = `translate3d(0, ${y.toFixed(2)}%, 0)`
      w.style.filter = u < 0.999 || o > 0 ? `blur(${((1 - u) * 6 + o * 4).toFixed(2)}px)` : ''
    })

    // line 2: "Prism." assembles in the dark around the waiting dot
    for (const c of s.charInfo) {
      if (c.isI) {
        // the stem: a crisp bar whose flat top rises from the baseline to meet
        // the dot - quickly through its short (full-stop-like) heights, dim
        // while it is short, then slowing as it reaches for the dot - and at
        // the end it sinks back into the baseline the same way
        const u = E.soft(seg(p, 0.245, IGN))
        const sink = seg(p, OUT + 0.04, OUT + 0.11)
        const k = u * (1 - E.inOut(sink))
        c.el.style.clipPath = k >= 0.999 ? 'none' : `inset(${((1 - k) * s.iBase).toFixed(2)}px 0 0 0)`
        const so = E.soft(clamp(u / 0.5)) * (1 - E.soft(seg(sink, 0.08, 0.62)))
        c.el.style.opacity = k < 0.01 ? '0' : so.toFixed(3)
        c.el.style.transform = 'none'
      } else {
        const a = 0.17 + (2 - c.d) * 0.024
        const u = E.out(seg(p, a, a + 0.1))
        // the exit: the edges sink first, and every letter fades as it sinks,
        // gone before it reaches the mask (the dot is left floating alone)
        const ea = OUT + (2 - c.d) * 0.016
        const ou = seg(p, ea, ea + 0.075)
        const out = E.in(ou)
        const y = (1 - u) * 104 + out * 104
        c.el.style.transform = `translate3d(0, ${y.toFixed(2)}%, 0)`
        c.el.style.opacity = ou >= 1 ? '0' : (1 - E.soft(clamp(ou / 0.72))).toFixed(3)
      }
      // the light reaches the i first, then spreads
      const L = E.out(seg(p, IGN + c.d * 0.016, IGN + 0.06 + c.d * 0.016))
      c.el.style.color = mix(tone('--why-dark'), COLORS.ink, L)
    }

    // the word keeps a little of the light that found it (a static layer; only its opacity moves)
    const wl = E.out(seg(p, IGN, IGN + 0.05)) * lerp(1, 0.45, seg(p, IGN + 0.06, OUT - 0.02)) * (1 - seg(p, OUT, OUT + 0.08))
    s.glow.style.opacity = wl.toFixed(3)

    // the spectrum: brief, soft, gone before the hold is over
    const rIn = seg(p, IGN, IGN + 0.03)
    const rOut = seg(p, IGN + 0.06, IGN + 0.19)
    const ro = E.out(rIn) * (1 - E.inOut(rOut))
    s.rays.style.opacity = (ro * 0.55).toFixed(3)
    const rs = lerp(0.18, 1, E.swift(seg(p, IGN, IGN + 0.12)))
    const rr = lerp(-7, 4, E.out(seg(p, IGN, IGN + 0.22)))
    s.rays.style.transform = `rotate(${rr.toFixed(2)}deg) scale(${rs.toFixed(4)})`
    s.rays.style.visibility = ro > 0.001 ? 'visible' : 'hidden'

    // the ground light comes up, and stays (dimmer) under the bridge
    const fl = E.out(seg(p, IGN, IGN + 0.1)) * lerp(1, 0.55, seg(p, IGN + 0.1, 0.6)) * (1 - E.inOut(seg(p, 0.93, 0.99)))
    s.floor.style.opacity = fl.toFixed(3)

    // the bridge: the words come out of the dot, hold, and go back into it
    s.bridge.style.transform = `translate3d(0, ${(s.bdy || 0).toFixed(2)}px, 0)`
    const b1 = E.out(seg(p, B1[0], B1[1])) * (1 - E.in(seg(p, B1X[0], B1X[1])))
    const b2 = E.out(seg(p, B2[0], B2[1])) * (1 - E.in(seg(p, B2X[0], B2X[1])))
    // the text lights only once it is mostly through the mask, so no sliver
    // of clipped glyph tops is ever left on the mask's edge by the dot
    const o1 = E.soft(clamp((b1 - 0.35) / 0.45))
    const o2 = E.soft(clamp((b2 - 0.35) / 0.45))
    if (ctx.mobile) {
      st(s.b1, o1, (1 - b1) * 105)
      st(s.b2, o2, -(1 - b2) * 105)
    } else {
      st(s.b1, o1, 0, (1 - b1) * 104)
      st(s.b2, o2, 0, -(1 - b2) * 104)
    }
  },

  dot(p, ctx) {
    const s = ctx.state
    const rT = s.rT || 10
    const x = ctx.vw / 2
    const y = ctx.vh / 2

    // the held breath: the dim dot contracts a little and dims further
    const hold = E.inOut(seg(p, 0.06, IGN - 0.02))
    // the stem arrives: a tiny squash under it
    const touch = E.in(seg(p, IGN - 0.03, IGN))
    const ign = seg(p, IGN, IGN + 0.022) // the flare
    const settle = seg(p, IGN + 0.022, IGN + 0.11)
    const grow = E.inOut(seg(p, OUT, OUT + 0.1)) // tittle size -> r 10 as the word leaves

    let r
    let color
    let glow
    let halo = 3
    if (p < IGN) {
      r = lerp(6, 5.2, hold)
      color = COLORS.grey
      glow = lerp(0.25, 0.12, hold)
    } else {
      const flare = E.swift(ign)
      const back = E.out(settle)
      r = lerp(lerp(5.2, Math.max(rT * 1.4, 9), flare), rT, back)
      r = lerp(r, 10, grow)
      color = ign < 1 ? mix(mix(COLORS.grey, tone('--why-flash'), clamp(ign * 2.2)), COLORS.lime, clamp((ign - 0.35) / 0.65)) : COLORS.lime
      if (settle > 0) color = COLORS.lime
      glow = lerp(lerp(0.12, 2.25, flare), 1.15, E.inOut(settle))
      glow = lerp(glow, 1, seg(p, 0.5, OUT + 0.1))
      halo = lerp(lerp(3, ctx.mobile ? 3.8 : 4.6, flare), 3, E.out(settle))
    }

    // squash: pressed by the rising stem, then released into a small stretch
    let sx = 1 + 0.16 * touch
    let sy = 1 - 0.2 * touch
    if (p >= IGN) {
      const rel = seg(p, IGN, IGN + 0.06)
      const k = Math.sin(rel * Math.PI) * (1 - rel)
      sx = lerp(1.16, 1, E.out(rel)) - 0.1 * k
      sy = lerp(0.8, 1, E.out(rel)) + 0.18 * k
    }
    // two small nods as the bridge's words come out of it
    const nod = Math.sin(Math.PI * seg(p, B1[0], B1[0] + 0.04)) * 0.5 + Math.sin(Math.PI * seg(p, B2[0], B2[0] + 0.04)) * 0.5
    sx += 0.12 * nod
    sy -= 0.16 * nod

    return {
      x,
      y,
      r,
      color,
      glow,
      halo,
      lean: 0,
      lag: 0.07,
      blink: p < IGN - 0.08 || p > 0.55,
      stretch: 0.6,
      sx,
      sy,
    }
  },
})
