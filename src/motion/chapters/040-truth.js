/**
 * 040 truth - "The real number was 4,630."
 *
 * Starts on 030-number's last frame: the tower standing on "1,180", the dot its
 * rose full stop. The dot leaves the old number and becomes the full stop of
 * the real one; behind it a crack runs from where it sat, through 1,180. "One
 * wrong number." - 1,180 shatters. "A whole year built on it." - the tower,
 * standing on nothing, falls into the dark. Everything goes; the dot drifts to
 * the centre, small and grey (S5): the moment is gone.
 */
import { chapter, seg, win, clamp, lerp, E, COLORS, mix, impulse } from '../core.js'
import {
  splitWords, playWords, css, bump, STOP, TRUE_INK, DIM,
  buildStack, layoutStack, placeStack, stopAt, lerpPose, labelAlpha, setLabels,
} from './030-number.kit.js'

const ROSE = COLORS.rose

const PRE = [0.04, 0.11]
const RISE = [0.085, 0.19]
const HOP = [0.1, 0.215]
const CRACK = [0.135, 0.225]
const BRANCH = [0.185, 0.27]
const TINT = [0.13, 0.24]
const L1 = [0.27, 0.33]
const L2 = [0.33, 0.39]
const LEAD_OUT = [0.53, 0.57]
const E1 = [0.56, 0.61]
const SHATTER = [0.585, 0.75]
const E2 = [0.64, 0.69]
const COLLAPSE = 0.665
const FADE = [0.79, 0.87]
const HOME = [0.8, 0.955]
/* the shards: how hard they fall and how far they spin */
const GRAVITY = 4.2
const SPIN = 1.6

/* shards: drift (F units), lift, spin (deg), delay; and how each opens along the
   crack - direction, and when the crack front (running right to left) reaches it */
const SHARDS = [
  { vx: -0.42, vy: -0.22, rot: -24, d: 0.0, ox: -0.35, oy: -1, at: 0.62 },
  { vx: -0.06, vy: -0.3, rot: 9, d: 0.06, ox: 0, oy: -1, at: 0.28 },
  { vx: 0.36, vy: -0.16, rot: 28, d: 0.02, ox: 0.45, oy: -1, at: 0.0 },
  { vx: -0.3, vy: 0.02, rot: -14, d: 0.1, ox: -0.35, oy: 1, at: 0.7 },
  { vx: 0.04, vy: -0.04, rot: 15, d: 0.04, ox: 0, oy: 1, at: 0.36 },
  { vx: 0.26, vy: 0.0, rot: -20, d: 0.08, ox: 0.45, oy: 1, at: 0.06 },
]

function reset(el) {
  el.style.transform = 'none'
  el._transform = 'none'
}

function trembleAmp(p) {
  return 0.75 * bump(seg(p, CRACK[0], CRACK[0] + 0.07)) + 0.22 * win(p, 0.16, COLLAPSE + 0.015, 0.05, 0.02) + 0.6 * bump(seg(p, SHATTER[0], SHATTER[0] + 0.06))
}

chapter({
  id: 'truth',
  title: 'The truth',
  anchorP: 0.22,

  build(ctx) {
    const s = ctx.state
    s.S = buildStack(ctx)
    s.crack = ctx.$('.truth-crack')
    s.paths = Array.from(s.crack.querySelectorAll('path'))
    s.shards = ctx.$$('.truth-shard')
    s.pre = splitWords(ctx.$('.truth-pre'))
    s.fig = ctx.$('.truth-fig')
    s.figin = ctx.$('.truth-figin')
    s.stop = ctx.$('.truth-stop')
    s.l1 = splitWords(ctx.$('.truth-l1'))
    s.l2 = splitWords(ctx.$('.truth-l2'))
    s.e1 = splitWords(ctx.$('.truth-e1'))
    s.e2 = splitWords(ctx.$('.truth-e2'))
    s.copy = ctx.$('.truth-copy')
    s.lastP = -1
  },

  layout(ctx) {
    const s = ctx.state
    const S = s.S
    for (const el of [s.figin, s.copy]) reset(el)
    const m = layoutStack(ctx, S)
    // the crack and the shards cover the digits box exactly
    s.crack.style.width = `${m.digitsW.toFixed(1)}px`
    s.crack.style.height = `${m.lineH.toFixed(1)}px`
    for (const pth of s.paths) pth.style.strokeWidth = `${(m.F * 0.034).toFixed(2)}px`
    // the real number's full stop
    const F3 = parseFloat(getComputedStyle(s.fig).fontSize)
    const r = s.stop.getBoundingClientRect()
    s.stop3 = { x: r.left + STOP.cx * F3, y: r.top - STOP.cy * F3, r: STOP.r * F3, F3 }
    s.figH = s.figin.getBoundingClientRect().height
  },

  /**
   * Where the stack stands: 030-number's left pose at the seam. On a phone (no
   * chart beside it now) it steps to the centre of the space under the copy.
   */
  pose(p, ctx) {
    const P = ctx.state.S.poses
    if (!ctx.mobile) return P.left
    const t = E.inOut(seg(p, 0.03, 0.14))
    // big enough that the block labels read (~9px), still clear of the copy
    return lerpPose(P.left, { x: ctx.vw / 2, y: ctx.vh * 0.84, s: 0.8 }, t)
  },

  /** 0..1: the pointer near the (still standing) tower. */
  towerNear(p, ctx) {
    const S = ctx.state.S
    const m = S.m
    if (!ctx.pointer.active || p > SHATTER[0]) return 0
    const pose = this.pose(p, ctx)
    const halfW = (pose.s * Math.max(...m.blocks.map((b) => b.w))) / 2
    const top = pose.y + pose.s * (m.towerBase - 5 * (m.bh + m.bgap))
    const dx = Math.max(0, Math.abs(ctx.pointer.x - pose.x) - halfW)
    const dy = Math.max(0, top - ctx.pointer.y, ctx.pointer.y - pose.y)
    return clamp(1 - Math.hypot(dx, dy) / 160)
  },

  towerFrame(p, ctx, time, pose) {
    const S = ctx.state.S
    const m = S.m
    const sF = S.poses.found.s
    // reduced motion keeps the sag and the fall (story) and drops the shake
    const amp = ctx.reduced ? 0 : trembleAmp(p) + 0.45 * (ctx.state.near || 0)
    setLabels(S, labelAlpha(ctx, pose))
    const fallH = (ctx.vh * 1.25) / S.poses.left.s
    S.blocks.forEach((el, i) => {
      const b = m.blocks[i]
      let x = b.x
      let y = b.y
      let rot = b.rot
      if (amp > 0) {
        const ph = i * 1.7
        rot += amp * (0.9 + i * 0.35) * Math.sin((time || 0) * 21 + ph + p * 420)
        x += (amp * (2.5 + i * 1.2) * Math.sin((time || 0) * 17 + ph * 1.3 + p * 380)) / sF
      }
      // the foundation breaks: the tower sags a hair, hangs - then goes
      const sag = E.out(seg(p, SHATTER[0], SHATTER[0] + 0.05))
      y += (sag * 6) / sF
      rot += sag * (i % 2 ? 1.2 : -0.8)
      const c = seg(p, COLLAPSE + i * 0.022, COLLAPSE + i * 0.022 + 0.17)
      const dir = i % 2 ? 1 : -1
      y += c * c * fallH
      x += (dir * c * (60 + i * 30)) / sF
      rot += dir * c * (22 + i * 9)
      const op = 1 - seg(c, 0.4, 0.95)
      css(el, 'transform', `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0) rotate(${rot.toFixed(3)}deg)`)
      css(el, 'opacity', op.toFixed(3))
      css(el, 'visibility', op <= 0.001 ? 'hidden' : 'visible')
    })
  },

  render(p, ctx) {
    const s = ctx.state
    const S = s.S
    const m = S.m

    const lp = s.lastP
    if (lp >= 0 && p > lp && p - lp < 0.05) {
      if (lp < SHATTER[0] && p >= SHATTER[0]) impulse(0, -70)
    }
    s.lastP = p

    /* the stack stays where 030-number left it */
    const pose = this.pose(p, ctx)
    placeStack(S, pose)
    this.towerFrame(p, ctx, ctx.reduced ? 0 : ctx.time, pose)

    /* 1,180: tinted, cracked from where the dot sat, then shattered */
    const tint = E.inOut(seg(p, TINT[0], TINT[1]))
    const shatter = seg(p, SHATTER[0], SHATTER[1])
    const col = tint > 0 ? mix('#f2f4ee', ROSE, tint) : ''
    css(S.fig, 'color', col)
    const cm = E.inOut(seg(p, CRACK[0], CRACK[1]))
    const cb = E.inOut(seg(p, BRANCH[0], BRANCH[1]))
    // once the crack starts, the shards stand in for the digits and open along it
    css(S.digits, 'opacity', cm > 0 ? '0' : '1')
    s.paths.forEach((pth, i) => css(pth, 'strokeDashoffset', (1 - (i === 0 ? cm : cb)).toFixed(4)))
    css(s.crack, 'opacity', shatter > 0 || cm <= 0 ? '0' : '1')
    s.shards.forEach((el, i) => {
      const k = SHARDS[i]
      const t = clamp((shatter - k.d) / (1 - k.d))
      const open = (0.6 * E.out(seg(cm, k.at, k.at + 0.3)) + 0.4 * E.out(cb)) * 0.016 * m.F
      const dx = k.vx * t * m.F + k.ox * open
      const dy = (k.vy * t + GRAVITY * t * t) * m.F + k.oy * open
      css(el, 'transform', `translate3d(${dx.toFixed(2)}px, ${dy.toFixed(2)}px, 0) rotate(${(k.rot * SPIN * t).toFixed(2)}deg)`)
      // opaque until the pieces have separated - overlapping translucent shards smudge
      css(el, 'opacity', cm > 0 ? (1 - seg(t, 0.65, 1)).toFixed(3) : '0')
    })

    /* the real number and the lines */
    const fade = E.inOut(seg(p, FADE[0], FADE[1]))
    playWords(s.pre, seg(p, PRE[0], PRE[1]), fade, 0.5)
    const rise = E.out(seg(p, RISE[0], RISE[1]))
    css(s.figin, 'transform', `translate3d(0, ${((1 - rise) * 110 + fade * 30).toFixed(2)}%, 0)`)
    css(s.fig, 'opacity', (seg(p, RISE[0], RISE[0] + 0.02) * (1 - fade)).toFixed(3))
    const lout = seg(p, LEAD_OUT[0], LEAD_OUT[1])
    playWords(s.l1, seg(p, L1[0], L1[1]), lout, 0.5)
    playWords(s.l2, seg(p, L2[0], L2[1]), lout, 0.5)
    playWords(s.e1, seg(p, E1[0], E1[1]), fade, 0.5)
    playWords(s.e2, seg(p, E2[0], E2[1]), fade, 0.5)
  },

  tick(time, p, ctx) {
    if (ctx.reduced) return
    const s = ctx.state
    s.near = lerp(s.near || 0, this.towerNear(p, ctx), 0.06)
    if (trembleAmp(p) + s.near > 0.002) this.towerFrame(p, ctx, time, this.pose(p, ctx))
  },

  dot(p, ctx) {
    const s = ctx.state
    const S = s.S
    const { vw, vh } = ctx
    const from = stopAt(S, this.pose(p, ctx))

    // the seam: still the rose full stop of 1,180
    if (p < HOP[0]) {
      return { x: from.x, y: from.y, r: from.r, color: ROSE, glow: 0.6, halo: 2.1, lean: 0, lag: 0, blink: false, stretch: 0.3 }
    }

    // where 4,630's full stop is right now (it rises out of its mask)
    const fade = E.inOut(seg(p, FADE[0], FADE[1]))
    const rise = E.out(seg(p, RISE[0], RISE[1]))
    const to = { x: s.stop3.x, y: s.stop3.y + (1 - rise) * 1.1 * s.figH, r: s.stop3.r }

    if (p < HOP[1]) {
      const u = seg(p, HOP[0], HOP[1])
      const ue = E.inOut(u)
      return {
        x: lerp(from.x, to.x, ue),
        y: lerp(from.y, to.y, ue) - Math.sin(Math.PI * u) * vh * 0.14,
        r: lerp(from.r, to.r, ue),
        color: mix(ROSE, TRUE_INK, E.inOut(seg(u, 0.2, 0.9))),
        glow: lerp(0.6, 0.55, ue), halo: 2.1, lean: 0, lag: 0.035, blink: false, stretch: 0.7,
      }
    }

    // the full stop of the real number - it stays while everything else goes
    if (p < HOME[0]) {
      return {
        x: to.x, y: to.y, r: to.r, color: TRUE_INK,
        glow: 0.55 - 0.15 * fade, halo: 2.1, lean: 0, lag: 0, blink: false, stretch: 0.2,
      }
    }

    // the moment is gone: small, grey, alone at the centre (S5)
    const u = seg(p, HOME[0], HOME[1])
    const ue = E.inOut(u)
    const uo = E.out(u) // it dims and shrinks first, then settles
    return {
      x: lerp(to.x, vw / 2, ue),
      y: lerp(to.y, vh / 2, ue) + Math.sin(Math.PI * u) * vh * 0.05,
      r: lerp(to.r, 6, uo),
      color: mix(TRUE_INK, DIM, uo),
      glow: lerp(0.4, 0.25, uo), halo: lerp(2.1, 3, uo),
      lean: 0, lag: u < 1 ? 0.04 : 0.05, blink: u >= 1, stretch: 0.5,
    }
  },
})
