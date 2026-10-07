/**
 * 030 number - "Nine days later, the report came back."
 *
 * The resolved ticket opens into a grey BI report. The dot hops from the
 * ticket's status socket to the end of the report's KPI and becomes its full
 * stop; the figure lifts out of the report to display size: "1,180." The plan
 * for the year lands on it, block by block - and the dot, the full stop at the
 * bottom of everything, dips under each block's weight. Then the tower steps
 * aside and the dot leaves the number to ride revenue's leading point as it
 * falls, turning rose. It ends back on the number, rose now: the frame 040-truth
 * starts from.
 */
import { chapter, seg, win, clamp, lerp, E, COLORS, mix, impulse } from '../core.js'
import {
  splitWords, playWords, css, bump, BELIEVED,
  buildStack, layoutStack, lerpPose, placeStack, stopAt, smoothPath, labelAlpha, setLabels,
} from './030-number.kit.js'

const ROSE = COLORS.rose

/* beats */
const H1 = { in: [0.0, 0.065], out: [0.19, 0.235] }
const UNFOLD = [0.0, 0.085]
const TO_KPI = [0.085, 0.15]
const LIFT = [0.17, 0.29]
const RECEDE = [0.17, 0.27]
const TO_FOUND = [0.35, 0.43]
const H2 = { in: [0.37, 0.43], out: [0.565, 0.6] }
const LAND = [0.445, 0.475, 0.505, 0.535, 0.565]
const DROP = 0.034
const TO_LEFT = [0.575, 0.625]
const CHART_IN = [0.6, 0.65]
const RIDE = [0.638, 0.83]
const FH = { in: [0.675, 0.725] }
const TAG = [0.79, 0.825]
const OUT = [0.905, 0.95]
const BACK = [0.905, 0.972]
/* the blow the headline deals the tower as it lands: [block, p, kind] */
const HITS = [[4, 0.72, 'rot']]

/* revenue, indexed to January = 100 */
const REV = [100, 103.5, 97.5, 88.5, 80]

function reset(el) {
  el.style.transform = 'none'
  el._transform = 'none'
}

/** How hard the tower trembles. */
function trembleAmp(p) {
  let a = 0.35 * E.inOut(seg(p, 0.66, 0.84)) * (1 - seg(p, 0.9, 0.97))
  for (const [, hp] of HITS) a += 0.9 * bump(seg(p, hp, hp + 0.035))
  return a
}

chapter({
  id: 'number',
  title: 'The number',
  anchorP: 0.13,

  build(ctx) {
    const s = ctx.state
    s.h1 = splitWords(ctx.$('.number-h1'))
    s.h2 = splitWords(ctx.$('.number-h2'))
    s.fh = splitWords(ctx.$('.number-fh'))
    s.row = ctx.$('.wait-row.is-ours')
    s.sock = ctx.$('.wait-sock')
    s.report = ctx.$('.number-report')
    s.rlines = ctx.$$('.number-rl')
    s.kslot = ctx.$('.number-kslot')
    s.S = buildStack(ctx)
    s.svg = ctx.$('.number-svg')
    s.axis = ctx.$('.number-axis')
    s.plan = ctx.$('.number-plan')
    s.line = ctx.$('.number-line')
    s.area = ctx.$('.number-area')
    s.clip = ctx.$('.number-cliprect')
    s.grad = ctx.$('#number-grad')
    s.months = ctx.$$('.number-month')
    s.tagPlan = ctx.$('.number-tag-plan')
    s.tagRev = ctx.$('.number-tag-rev')
    s.lastP = -1
  },

  layout(ctx) {
    const s = ctx.state
    const { vw, vh, mobile } = ctx
    for (const el of [s.row, s.report, ...s.rlines]) reset(el)
    s.report.style.clipPath = 'none'
    s.report._clipPath = 'none'

    // the resolved ticket's socket - the seam with 020-wait
    const sr = s.sock.getBoundingClientRect()
    s.sockAt = { x: sr.left + sr.width / 2, y: sr.top + sr.height / 2 }

    // the stack (figure + tower) and its poses
    const S = s.S
    const m = layoutStack(ctx, S)
    // the KPI pose: the figure sits in the report's KPI tile at report scale
    const kfs = mobile ? 34 : vh < 760 ? 44 : 52
    const sk = kfs / m.F
    s.kslot.style.width = `${(m.W * sk).toFixed(1)}px`
    s.kslot.style.height = `${(m.lineH * sk * 0.86).toFixed(1)}px`
    const kr = s.kslot.getBoundingClientRect()
    S.poses.kpi = { x: kr.left + (m.W * sk) / 2, y: kr.top + m.base * sk, s: sk }

    // how far each block falls (local px). On a phone it never starts above the
    // headline's last line: rest top - drop >= copy bottom + 24.
    const sF = S.poses.found.s
    const dropH = (vh * (mobile ? 0.42 : 1.1)) / sF
    const copyBottom = ctx.$('.number-h2').getBoundingClientRect().bottom
    s.drop = m.blocks.map((b) => {
      if (!mobile) return dropH
      const restTop = S.poses.found.y + sF * (b.y - m.bh)
      return clamp(dropH, 40 / sF, (restTop - copyBottom - 24) / sF)
    })

    // the chart: revenue grows out of the full stop at the left pose
    const st = stopAt(S, S.poses.left)
    const x0 = st.x
    const y0 = st.y
    const x1 = vw - (mobile ? 22 : Math.max(56, vw * 0.07))
    const yLow = Math.min(y0 + vh * (mobile ? 0.12 : 0.2), vh - (mobile ? 96 : 120))
    const k = (yLow - y0) / 20
    const pts = REV.map((v, i) => [lerp(x0, x1, i / (REV.length - 1)), y0 + (100 - v) * k])
    s.svg.setAttribute('viewBox', `0 0 ${vw} ${vh}`)
    const d = smoothPath(pts, mobile ? 0.13 : 0.18)
    s.line.setAttribute('d', d)
    s.area.setAttribute('d', `${d} L ${x1.toFixed(1)} ${(yLow + 40).toFixed(1)} L ${x0.toFixed(1)} ${(yLow + 40).toFixed(1)} Z`)
    s.plan.setAttribute('d', `M ${x0.toFixed(1)} ${y0.toFixed(1)} L ${x1.toFixed(1)} ${(y0 - 6 * k).toFixed(1)}`)
    const axisY = yLow + (mobile ? 22 : 30)
    s.axis.setAttribute('x1', x0.toFixed(1))
    s.axis.setAttribute('x2', x1.toFixed(1))
    s.axis.setAttribute('y1', axisY.toFixed(1))
    s.axis.setAttribute('y2', axisY.toFixed(1))
    s.grad.setAttribute('x1', x0.toFixed(1))
    s.grad.setAttribute('x2', x1.toFixed(1))
    s.clip.setAttribute('x', x0.toFixed(1))
    s.clip.setAttribute('y', '0')
    s.clip.setAttribute('height', String(vh))
    s.months.forEach((el, i) => {
      el.style.left = `${pts[i][0].toFixed(1)}px`
      el.style.top = `${(axisY + 12).toFixed(1)}px`
      el.style.transform = i === 0 ? 'none' : i === pts.length - 1 ? 'translateX(-100%)' : 'translateX(-50%)'
    })
    s.tagPlan.style.left = `${x1.toFixed(1)}px`
    s.tagPlan.style.top = `${(y0 - 6 * k - 22).toFixed(1)}px`
    s.tagPlan.style.transform = 'translateX(-100%)'
    const end = pts[pts.length - 1]
    s.tagRev.style.left = `${end[0].toFixed(1)}px`
    s.tagRev.style.top = `${(end[1] - (mobile ? 40 : 52)).toFixed(1)}px`
    s.tagRev.style.transform = 'translateX(-100%)'
    // arc-length samples so the dot can ride the drawn tip exactly
    const L = s.line.getTotalLength()
    const N = 240
    s.samples = Array.from({ length: N + 1 }, (_, i) => {
      const q = s.line.getPointAtLength((L * i) / N)
      return [q.x, q.y]
    })
    s.chart = { x0, y0, x1, yLow, k, pts }
  },

  /** The stack's pose at p. */
  pose(p, ctx) {
    const P = ctx.state.S.poses
    if (p < LIFT[0]) return P.kpi
    if (p < TO_FOUND[0]) {
      const t = E.inOut(seg(p, LIFT[0], LIFT[1]))
      const q = lerpPose(P.kpi, P.display, t)
      q.y -= Math.sin(Math.PI * t) * ctx.vh * 0.05
      return q
    }
    if (p < TO_LEFT[0]) return lerpPose(P.display, P.found, E.inOut(seg(p, TO_FOUND[0], TO_FOUND[1])))
    return lerpPose(P.found, P.left, E.inOut(seg(p, TO_LEFT[0], TO_LEFT[1])))
  },

  /** The line's leading point at fraction u of its length. */
  lineAt(u, ctx) {
    const sm = ctx.state.samples
    const f = clamp(u) * (sm.length - 1)
    const i = Math.min(sm.length - 2, Math.floor(f))
    const t = f - i
    return { x: lerp(sm[i][0], sm[i + 1][0], t), y: lerp(sm[i][1], sm[i + 1][1], t) }
  },

  rideU(p) {
    return E.glide(seg(p, RIDE[0], RIDE[1]))
  },

  /** 0..1: how close the pointer is to the tower. It is precarious - it notices. */
  towerNear(p, ctx) {
    const S = ctx.state.S
    const m = S.m
    if (!ctx.pointer.active || p < LAND[0] || p > 0.97) return 0
    const pose = this.pose(p, ctx)
    const halfW = (pose.s * Math.max(...m.blocks.map((b) => b.w))) / 2
    const top = pose.y + pose.s * (m.towerBase - 5 * (m.bh + m.bgap))
    const dx = Math.max(0, Math.abs(ctx.pointer.x - pose.x) - halfW)
    const dy = Math.max(0, top - ctx.pointer.y, ctx.pointer.y - pose.y)
    return clamp(1 - Math.hypot(dx, dy) / 160)
  },

  towerFrame(p, ctx, time, pose) {
    const s = ctx.state
    const S = s.S
    const m = S.m
    // reduced motion keeps the story (landings, the blows, the lean) and drops the shake
    const amp = ctx.reduced ? 0 : trembleAmp(p) + 0.45 * (s.near || 0)
    setLabels(S, labelAlpha(ctx, pose))
    S.blocks.forEach((el, i) => {
      const b = m.blocks[i]
      const L = LAND[i]
      const fall = seg(p, L - DROP, L)
      // on a phone the headline sits above the tower: each block falls only from
      // under it (s.drop), and shows up only for the last stretch of its fall
      const y = b.y - (1 - E.in(fall)) * s.drop[i]
      const op = ctx.mobile ? seg(p, L - DROP * 0.3, L - DROP * 0.08) : seg(p, L - DROP, L - DROP * 0.55)
      const sq = bump(seg(p, L, L + 0.03))
      // weight: every later landing presses the blocks below
      let press = 0
      for (let j = i + 1; j < LAND.length; j++) press += bump(seg(p, LAND[j], LAND[j] + 0.03))
      let rot = b.rot
      let x = b.x
      const ph = i * 1.7
      if (amp > 0) {
        const tt = time || 0
        rot += amp * (0.9 + i * 0.35) * Math.sin(tt * 21 + ph + p * 420)
        x += (amp * (2.5 + i * 1.2) * Math.sin(tt * 17 + ph * 1.3 + p * 380)) / S.poses.found.s
      }
      for (const [bi, hp, kind] of HITS) {
        const hb = bump(seg(p, hp, hp + 0.05))
        if (bi === i && kind === 'rot') rot += (i === 4 ? -5 : 3.5) * hb
        if (kind === 'x' && i >= bi) x -= (10 / S.poses.found.s) * hb * (1 + i * 0.15)
      }
      // a slow lean of the whole tower once the doubt sets in
      const lean = 0.6 * E.inOut(seg(p, 0.7, 0.86)) * (1 - seg(p, 0.92, 0.985))
      rot += lean * (i - 1) * 0.5
      x += (lean * i * 5) / S.poses.found.s
      const sy = 1 - 0.12 * sq - 0.035 * press
      const sx = 1 + 0.05 * sq
      css(el, 'transform', `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0) rotate(${rot.toFixed(3)}deg) scale(${sx.toFixed(4)}, ${sy.toFixed(4)})`)
      css(el, 'opacity', op.toFixed(3))
      css(el, 'visibility', op <= 0.001 ? 'hidden' : 'visible')
    })
  },

  render(p, ctx) {
    const s = ctx.state
    const S = s.S
    const { reduced } = ctx

    /* one-shots: each landing presses the dot down */
    const lp = s.lastP
    if (lp >= 0 && p > lp && p - lp < 0.05) {
      for (const L of LAND) if (lp < L && p >= L) impulse(0, 120)
    }
    s.lastP = p

    /* copy */
    playWords(s.h1, seg(p, H1.in[0], H1.in[1]), seg(p, H1.out[0], H1.out[1]), 0.5)
    playWords(s.h2, seg(p, H2.in[0], H2.in[1]), seg(p, H2.out[0], H2.out[1]), 0.5)
    const fout = seg(p, OUT[0], OUT[1])
    playWords(s.fh, seg(p, FH.in[0], FH.in[1]), fout, 0.5)

    /* the ticket row and the report it opens into */
    const rec = E.inOut(seg(p, RECEDE[0], RECEDE[1]))
    css(s.row, 'opacity', (1 - rec).toFixed(3))
    css(s.row, 'transform', `translate3d(0, ${(-rec * 14).toFixed(2)}px, 0)`)
    const u = E.inOut(seg(p, UNFOLD[0], UNFOLD[1]))
    css(s.report, 'clipPath', u >= 1 ? 'none' : `inset(0 0 ${((1 - u) * 100).toFixed(2)}% 0 round 10px)`)
    css(s.report, 'opacity', (seg(p, UNFOLD[0], UNFOLD[0] + 0.01) * (1 - rec)).toFixed(3))
    css(s.report, 'transform', `translate3d(0, ${(rec * 26).toFixed(2)}px, 0) scale(${(1 - rec * 0.04).toFixed(4)})`)
    css(s.report, 'visibility', rec >= 1 || p < UNFOLD[0] ? 'hidden' : 'visible')
    s.rlines.forEach((el, i) => {
      const a = E.out(seg(p, 0.02 + i * 0.012, 0.065 + i * 0.012))
      css(el, 'opacity', a.toFixed(3))
      css(el, 'transform', `translate3d(0, ${((1 - a) * 10).toFixed(2)}px, 0)`)
    })

    /* the figure: in the report, lifted, the foundation, aside */
    const pose = this.pose(p, ctx)
    placeStack(S, pose)
    const figIn = seg(p, 0.075, 0.105)
    css(S.fig, 'opacity', figIn.toFixed(3))
    const lift = E.inOut(seg(p, LIFT[0], LIFT[1]))
    css(S.fig, 'color', lift >= 1 ? '' : mix('#cfd2c8', '#f2f4ee', lift))
    const capA = E.out(seg(p, 0.275, 0.31)) * (1 - seg(p, 0.35, 0.38))
    css(S.cap, 'opacity', capA.toFixed(3))
    css(S.cap, 'transform', `translate3d(0, ${(-S.m.F * 0.08 - (1 - capA) * 8).toFixed(2)}px, 0)`)
    this.towerFrame(p, ctx, reduced ? 0 : ctx.time, pose)

    /* the chart */
    const cin = E.out(seg(p, CHART_IN[0], CHART_IN[1])) * (1 - fout)
    css(s.axis, 'opacity', cin.toFixed(3))
    for (const el of s.months) css(el, 'opacity', cin.toFixed(3))
    css(s.plan, 'strokeDashoffset', (1 - E.inOut(seg(p, 0.6, 0.67))).toFixed(4))
    css(s.plan, 'opacity', cin.toFixed(3))
    css(s.tagPlan, 'opacity', (E.out(seg(p, 0.64, 0.68)) * (1 - fout)).toFixed(3))
    const ru = this.rideU(p)
    css(s.line, 'strokeDashoffset', (1 - ru).toFixed(4))
    css(s.line, 'opacity', (ru > 0 ? 1 - fout : 0).toFixed(3))
    const tip = this.lineAt(ru, ctx)
    s.clip.setAttribute('width', Math.max(0, tip.x - s.chart.x0).toFixed(1))
    css(s.area, 'opacity', (1 - fout).toFixed(3))
    css(s.tagRev, 'opacity', (E.out(seg(p, TAG[0], TAG[1])) * (1 - fout)).toFixed(3))
    css(s.tagRev, 'transform', `translate3d(-100%, ${((1 - E.out(seg(p, TAG[0], TAG[1]))) * 8).toFixed(2)}px, 0)`)
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

    // the seam: the resolved ticket's status light
    if (p < TO_KPI[0]) {
      return { x: s.sockAt.x, y: s.sockAt.y, r: 5, color: BELIEVED, glow: 0.42, halo: 2.8, lean: 0, lag: 0, blink: false, stretch: 0.3 }
    }
    const pose = this.pose(p, ctx)
    const st = stopAt(S, pose)

    // a hop from the ticket to the end of the KPI: it becomes the full stop
    if (p < TO_KPI[1]) {
      const u = seg(p, TO_KPI[0], TO_KPI[1])
      const ue = E.inOut(u)
      return {
        x: lerp(s.sockAt.x, st.x, ue),
        y: lerp(s.sockAt.y, st.y, ue) - Math.sin(Math.PI * u) * ctx.vh * 0.06,
        r: lerp(5, st.r, ue), color: BELIEVED, glow: 0.45, halo: lerp(2.8, 2.2, ue), lean: 0, lag: 0.03, blink: false,
      }
    }

    // the full stop of 1,180 - it carries the whole tower
    if (p < RIDE[0]) {
      let press = 0
      for (const L of LAND) press += bump(seg(p, L, L + 0.03))
      const disp = win(p, LIFT[1] - 0.02, TO_FOUND[1], 0.03, 0.06)
      return {
        x: st.x, y: st.y, r: st.r, color: BELIEVED,
        glow: 0.45 + 0.2 * disp, halo: 2.1, lean: 0, lag: 0, blink: false, stretch: 0.2,
        sx: 1 + 0.2 * press, sy: 1 - 0.22 * press,
      }
    }

    // riding revenue's leading point down, turning rose
    const end = stopAt(S, S.poses.left)
    const c = s.chart
    if (p < BACK[0]) {
      const tip = this.lineAt(this.rideU(p), ctx)
      const fall = clamp((tip.y - c.y0) / (c.yLow - c.y0))
      const r0 = lerp(end.r, 7, E.out(seg(p, RIDE[0], RIDE[0] + 0.03)))
      return {
        x: tip.x, y: tip.y, r: r0, color: mix(BELIEVED, ROSE, E.out(fall)),
        glow: 0.55 + 0.35 * fall, halo: 2.6, lean: 0, lag: 0, blink: false, stretch: 0.5,
      }
    }

    // back to the number it came from - rose now
    const u = seg(p, BACK[0], BACK[1])
    const ue = E.inOut(u)
    const from = this.lineAt(1, ctx)
    return {
      x: lerp(from.x, end.x, ue),
      y: lerp(from.y, end.y, ue) - Math.sin(Math.PI * u) * ctx.vh * 0.16,
      r: lerp(7, end.r, ue), color: ROSE, glow: lerp(0.9, 0.6, ue), halo: lerp(2.6, 2.1, ue),
      lean: 0, lag: u < 1 ? 0.035 : 0, blink: false, stretch: 0.6,
    }
  },
})
