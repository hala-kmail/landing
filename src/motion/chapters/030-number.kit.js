/**
 * Owner B's kit - shared by wait (020), number (030) and truth (040).
 *
 *  - splitWords / playWords: masked word reveals, pure functions of a local 0..1
 *  - the "stack": the big figure (1,180) with the dot as its full stop, and the
 *    tower of decisions built on it. number and truth draw the same stack, so the
 *    seam between them is one continuous frame.
 *
 * No side effects on import: 030-number and 040-truth both build on it.
 */
import { clamp, lerp, E, COLORS, tone } from '../core.js'

/** Tajawal 700 '.' in em: ink centre x from the glyph origin, centre height above the baseline, radius, advance. */
export const STOP = { cx: 0.164, cy: 0.064, r: 0.079, adv: 0.328 }
/** Tajawal 700 digit cap height in em. */
export const CAP = 0.656

/** The kit's colours in the current theme (tokens in 030-number.css): read them when drawing. */
export const KIT = {
  get believed() { return tone('--num-believed') }, // the number everybody believed: neutral ink-grey
  get trueInk() { return tone('--num-true-ink') },
  get dim() { return COLORS.grey },
}

/** sin bump that peaks early and dies out over t in 0..1 (a landing, a jolt). */
export const bump = (t) => (t <= 0 || t >= 1 ? 0 : Math.sin(Math.PI * t) * (1 - t) * 1.55)

/* ------------------------------------------------------------ words */

/** Wrap every word of `root` (recursively) in a mask; returns the inner spans in reading order. */
export function splitWords(root) {
  const words = []
  const walk = (node) => {
    for (const n of Array.from(node.childNodes)) {
      if (n.nodeType === 3) {
        // split on ordinary whitespace only: words joined by a no-break space stay
        // one masked unit (Chrome still breaks between two inline-block masks on
        // either side of a lone no-break space, so that could not hold a widow)
        const parts = n.textContent.split(/([ \t\n\r\f]+)/)
        const frag = document.createDocumentFragment()
        for (const part of parts) {
          if (!part) continue
          if (/^[ \t\n\r\f]+$/.test(part)) {
            frag.appendChild(document.createTextNode(' '))
            continue
          }
          const o = document.createElement('span')
          o.className = 'number-kw'
          const i = document.createElement('span')
          i.className = 'number-kwi'
          i.textContent = part
          o.appendChild(i)
          frag.appendChild(o)
          words.push(i)
        }
        n.replaceWith(frag)
      } else if (n.nodeType === 1 && !n.classList.contains('sr-only') && !n.hasAttribute('data-nosplit')) walk(n)
    }
  }
  walk(root)
  return words
}

/**
 * Words rise out of their masks with `tin` (0..1) and leave upward with `tout` (0..1).
 * `spread` is the share of the entrance used for the stagger.
 */
export function playWords(ws, tin, tout = 0, spread = 0.5) {
  const n = ws.length
  const o = E.inOut(clamp(tout))
  for (let i = 0; i < n; i++) {
    const d = n > 1 ? (spread * i) / (n - 1) : 0
    const a = E.out(clamp((tin - d) / (1 - spread)))
    const y = (1 - a) * 112 - o * 70
    const op = a * (1 - o)
    const w = ws[i]
    const tf = op <= 0.001 ? 'translate3d(0, 112%, 0)' : `translate3d(0, ${y.toFixed(2)}%, 0)`
    if (w._tf !== tf) {
      w.style.transform = tf
      w._tf = tf
    }
    const os = op.toFixed(3)
    if (w._op !== os) {
      w.style.opacity = os
      w._op = os
    }
  }
}

/** Set a style property only when it changes (render runs often). */
export function css(el, prop, v) {
  const k = '_' + prop
  if (el[k] === v) return
  el[k] = v
  el.style[prop] = v
}

/* ------------------------------------------------------------ the stack */

/**
 * Decision blocks of the year's plan, bottom first. `w` is the share of the
 * widest block, `dx` a sideways offset and `rot` a resting tilt (deg) - an
 * imperfect, precarious tower.
 */
export const BLOCKS = [
  { w: 0.92, dx: 0.0, rot: 0 },
  { w: 0.8, dx: -0.035, rot: -0.6 },
  { w: 1.0, dx: 0.03, rot: 0.5 },
  { w: 0.78, dx: -0.02, rot: -0.9 },
  { w: 0.6, dx: 0.045, rot: 1.3 },
]

/** Query the stack's elements inside a stage. */
export function buildStack(ctx) {
  const blocks = ctx.$$('.number-block')
  return {
    stack: ctx.$('.number-stack'),
    fig: ctx.$('.number-fig'),
    digits: ctx.$('.number-digits'),
    stop: ctx.$('.number-stop'),
    cap: ctx.$('.number-cap'),
    blocks,
    labels: blocks.map((b) => Array.from(b.querySelectorAll('span, em'))),
    m: null,
    poses: null,
  }
}

/**
 * On a phone, a tower scaled below ~0.6 would print its labels at 5-7px: below
 * that scale they fade out and the blocks read as plain slabs.
 */
export function labelAlpha(ctx, pose) {
  return ctx.mobile ? clamp((pose.s - 0.5) / 0.2) : 1
}
export function setLabels(S, a) {
  const v = a.toFixed(3)
  for (const ls of S.labels) for (const el of ls) css(el, 'opacity', v)
}

/**
 * Measure the figure and size the tower (in the stack's local px: the stack is
 * scaled by each pose). Local origin = the baseline centre of "1,180." (digits + stop).
 */
export function layoutStack(ctx, S) {
  const { vw, vh, mobile } = ctx
  S.stack.style.transform = 'none'
  S.stack._transform = 'none' // keep css()'s cache honest, so the next render re-applies the pose
  S.fig.style.left = '0px'
  S.fig.style.top = '0px'
  const F = parseFloat(getComputedStyle(S.fig).fontSize)
  const fr = S.fig.getBoundingClientRect()
  const sr = S.stop.getBoundingClientRect()
  const dr = S.digits.getBoundingClientRect()
  const base = sr.top - fr.top
  const W = sr.left - fr.left + STOP.adv * F
  S.fig.style.left = `${(-W / 2).toFixed(2)}px`
  S.fig.style.top = `${(-base).toFixed(2)}px`
  const m = {
    F,
    W,
    base,
    lineH: fr.height,
    digitsW: dr.width,
    stopX: sr.left - fr.left - W / 2 + STOP.cx * F,
    stopY: -STOP.cy * F,
    stopR: STOP.r * F,
    capH: CAP * F,
  }
  S.m = m

  // poses: where the stack's origin sits and how big it is
  const poses = mobile
    ? {
        display: { x: vw / 2, y: vh * 0.53, s: 1 },
        found: { x: vw / 2, y: vh * 0.87, s: 0.92 },
        left: { x: vw * 0.26, y: vh * 0.655, s: 0.46 },
      }
    : {
        display: { x: vw / 2, y: vh * 0.6, s: 1 },
        found: { x: vw * 0.69, y: vh * 0.86, s: 0.55 },
        left: { x: vw * 0.26, y: vh * 0.7, s: 0.43 },
      }
  S.poses = poses

  // the tower, sized for the foundation pose, in local px
  const sf = poses.found.s
  const maxW = mobile ? Math.min(vw - 40, 330) : Math.min(vw * 0.32, 440)
  const bh = (mobile ? 38 : Math.max(44, Math.min(58, vh * 0.064))) / sf
  const gap = (mobile ? 5 : 6) / sf
  const fs = (mobile ? 10.5 : 12.5) / sf
  m.bh = bh
  m.bgap = gap
  m.towerBase = -(m.capH + (mobile ? 10 : 14) / sf)
  m.blocks = BLOCKS.map((b, i) => {
    const w = (maxW * b.w) / sf
    const el = S.blocks[i]
    if (el) {
      el.style.width = `${w.toFixed(1)}px`
      el.style.height = `${bh.toFixed(1)}px`
      el.style.left = `${(-w / 2).toFixed(1)}px`
      el.style.top = `${(-bh).toFixed(1)}px`
      el.style.fontSize = `${fs.toFixed(2)}px`
      el.style.borderRadius = `${(8 / sf).toFixed(1)}px`
      el.style.padding = `0 ${(16 / sf).toFixed(1)}px`
    }
    return { w, x: (b.dx * maxW) / sf, y: m.towerBase - i * (bh + gap), rot: b.rot }
  })
  if (S.cap) {
    S.cap.style.fontSize = `${(mobile ? 11 : 12) / poses.display.s}px`
    S.cap.style.left = '0px'
    S.cap.style.width = `${m.digitsW.toFixed(1)}px`
  }
  return m
}

export function lerpPose(a, b, t) {
  return {
    x: lerp(a.x, b.x, t),
    y: lerp(a.y, b.y, t),
    s: Math.exp(lerp(Math.log(a.s), Math.log(b.s), t)),
  }
}

export function placeStack(S, pose) {
  css(S.stack, 'transform', `translate3d(${pose.x.toFixed(2)}px, ${pose.y.toFixed(2)}px, 0) scale(${pose.s.toFixed(4)})`)
}

/** The full stop of the figure in viewport px for a pose. */
export function stopAt(S, pose) {
  const m = S.m
  return { x: pose.x + pose.s * m.stopX, y: pose.y + pose.s * m.stopY, r: pose.s * m.stopR }
}

/** Smooth path through points (Catmull-Rom as cubic Beziers). */
export function smoothPath(pts, k = 0.18) {
  let d = `M ${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)]
    const p1 = pts[i]
    const p2 = pts[i + 1]
    const p3 = pts[Math.min(pts.length - 1, i + 2)]
    const c1 = [p1[0] + (p2[0] - p0[0]) * k, p1[1] + (p2[1] - p0[1]) * k]
    const c2 = [p2[0] - (p3[0] - p1[0]) * k, p2[1] - (p3[1] - p1[1]) * k]
    d += ` C ${c1[0].toFixed(1)} ${c1[1].toFixed(1)}, ${c2[0].toFixed(1)} ${c2[1].toFixed(1)}, ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`
  }
  return d
}
