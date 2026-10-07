/**
 * PRISM: the wordmark as vector letters, and the place its dot calls home.
 *
 * The artwork is one drawing - PRISM set in a thin geometric face with a lit
 * dot floating over the `i`. On this page the dot is the main character, so it
 * is never part of the wordmark: the hero dot (core.js) *is* the tittle, and
 * this file only says where it sits. Everything else is drawn here, in
 * `currentColor`, one element per letter, so a chapter can draw the letters on,
 * pull them apart or tilt them without a bitmap anywhere.
 *
 * HOW THE LETTERS WERE MADE
 * -------------------------
 * Every number below is measured off the artwork (assets/brand/wm-letters.png,
 * 898x251, the same registration as prism-wordmark.png), not invented: the
 * viewBox *is* the PNG's pixel grid. P R S M are centre lines fitted to the
 * artwork's alpha and stroked, so `pathLength="1"` plus `stroke-dashoffset`
 * draws each one the way a pen would - P and R up the stem and round the bowl
 * (the R's pen then runs back along the bar and down the leg: SVG restarts a
 * dash on every subpath, so each letter is one subpath), S from its top
 * terminal down the spine, M up, down to the vertex, up and down again. The
 * `I` is a filled rect, because it is a stem, not a stroke - it grows; it is
 * not written.
 *
 * Three things in the drawing are not a plain round pen, and are kept rather
 * than smoothed away:
 *   - the S has contrast (verticals ~11.8, horizontals ~8.4, spine between),
 *     so it is stroked in a space stretched by PEN - an elliptical nib;
 *   - the M is a touch heavier (10.4) than P R S (9.95);
 *   - the R's leg ends flat on the baseline and the S's terminals are cut at
 *     the artwork's angles, which a butt cap cannot do: those strokes run on a
 *     little and a clip cuts them (so the first and last few % of their
 *     dashoffset draw nothing visible).
 * Rasterised by Chrome at 898x251 and compared with the artwork's alpha at 0.5,
 * the letters score IoU 0.979 overall (P 0.970, R 0.989, I 1.000, S 0.972,
 * M 0.970); nothing is drawn where the artwork has no ink.
 *
 * THE DOT
 * -------
 * WORDMARK.dot is the solid core of the artwork's tittle (the difference of the
 * two PNGs), WORDMARK.halo the radius at which its glow falls to nothing on the
 * app's own gradient (prism.tsx: halo = 3 x core there; 3.08 x here). The
 * artwork sets the dot 1.3 units left of the stem's centre; that is kept.
 *
 * Usage:
 *   const svg = wordmarkSVG({ className: 'hero-wm' })   // size it by width in CSS
 *   svg.querySelectorAll('.wm-stroke')                   // pathLength=1: dasharray 1, dashoffset 1 -> 0
 *   svg.querySelector('.wm-stem')                        // transform-box: fill-box; transform-origin: 50% 100%
 *   tittleAt(svg)                                         // { x, y, r } viewport px - in layout()
 * Animate a letter by transforming its `<g class="wm-letter">`, never the
 * elements inside it (the S's inner group carries its pen).
 */

const NS = 'http://www.w3.org/2000/svg'

export const WORDMARK = {
  viewBox: '0 0 898 251',
  width: 898,
  height: 251,
  /** The pen of P R S (viewBox units). M is drawn at letters.M.stroke. */
  stroke: 9.95,
  /** The tittle: where the hero dot lives, in viewBox units. */
  dot: { cx: 443.08, cy: 82.14, r: 18.85 },
  /** Halo radius, viewBox units (the glow is gone by ~74). */
  halo: 58.1,
  /** The I: a filled rect. Its foot is the baseline the dot lands above. */
  stem: { x: 432.75, y: 138.66, w: 23.25, h: 111.94 },
  /** Each letter's ink box in viewBox units, left to right. */
  letters: {
    P: { box: { x: 0.06, y: 138.38, w: 91.35, h: 112.44 }, stroke: 9.95 },
    R: { box: { x: 198.75, y: 138.23, w: 91.28, h: 112.4 }, stroke: 9.95 },
    I: { box: { x: 432.73, y: 138.66, w: 23.27, h: 111.95 } },
    S: { box: { x: 592.89, y: 139.25, w: 97.86, h: 109.75 }, stroke: 9.95 },
    M: { box: { x: 783.06, y: 138.18, w: 114.76, h: 108.94 }, stroke: 10.4 },
  },
}

/** The S's elliptical nib: it is stroked in this space (pivoted on the letter's centre). */
const PEN = 'matrix(1.15418 -0.03209 -0.03209 0.85185 -92.97337 49.46369)'

/* Centre lines, viewBox units (the S in PEN space). `clip` keeps what the artwork keeps. */
const STROKES = {
  P: {
    d: 'M5.24 250.82V143.12H60.45C76.92 143.12 86.81 154.22 86.81 171.65C86.81 189.9 78.42 201.37 57.8 201.37H5.24',
  },
  R: {
    // one subpath - SVG restarts a dash on every subpath - so the pen runs back along the bar to the leg
    d: 'M203.87 250.79V143.13H260.49C275 143.13 285.57 154.51 285.57 170.96C285.57 192.89 274.36 201.14 256.04 201.14H203.87' +
      'H252.48L290.8 260.83',
    clip: 'M190 120H300V250.79H190Z',
  },
  S: {
    d: 'M687.6 162.97L677 150.05C669.68 141.15 656.46 135.22 641.87 134.7C622.23 133.99 608.31 144.6 608.84 161' +
      'C609.35 176.64 622.54 184.24 644.18 193.39C664.97 202.19 679.98 208.43 680.34 226.6' +
      'C680.69 243.41 667.96 254.66 646.16 253.84C623.33 252.99 613.39 243.81 603.96 234.96L592.26 224',
    clip: 'M550.64 80.07L724.11 86.6L729.99 298.13L556.53 291.59Z' +
      'M667.68 159.64L686.31 140.46L703.38 169.86L684.74 189.04Z' +
      'M613.16 225.18L594.76 244.75L577.39 215.67L595.8 196.1Z',
    pen: PEN,
  },
  M: {
    d: 'M788.27 247.22V143.52H790.11L840.38 219.93L890.49 143.52H892.6V247.22',
  },
}

let uid = 0

const el = (name, attrs, parent) => {
  const n = document.createElementNS(NS, name)
  for (const k in attrs) n.setAttribute(k, attrs[k])
  if (parent) parent.appendChild(n)
  return n
}

/**
 * The wordmark as an `<svg>`: one `<g class="wm-letter wm-X">` per letter, in
 * reading order. P R S M hold a `path.wm-stroke` (pathLength 1); the I holds
 * `rect.wm-stem`. No dot - the hero dot is the dot. Decorative (aria-hidden):
 * say "PRISM" in the text around it.
 */
export function wordmarkSVG({ className = '' } = {}) {
  const id = `wm${++uid}`
  const svg = el('svg', {
    viewBox: WORDMARK.viewBox,
    class: `wm ${className}`.trim(),
    fill: 'none',
    'stroke-linecap': 'butt',
    'stroke-linejoin': 'miter',
    'stroke-miterlimit': '8',
    // P and M touch the viewBox edges; letters that drift apart must not be cut off.
    // Nothing at rest reaches past the viewBox (run-ons are clipped), so this is safe.
    overflow: 'visible',
    'aria-hidden': 'true',
    focusable: 'false',
  })
  const defs = el('defs', {}, svg)

  for (const L of Object.keys(WORDMARK.letters)) {
    const g = el('g', { class: `wm-letter wm-${L}` }, svg)
    if (L === 'I') {
      const s = WORDMARK.stem
      el('rect', { class: 'wm-stem', x: s.x, y: s.y, width: s.w, height: s.h, fill: 'currentColor' }, g)
      continue
    }
    const S = STROKES[L]
    let host = g
    let clip = null
    if (S.clip) {
      clip = `${id}-${L}`
      el('path', { d: S.clip, 'clip-rule': 'evenodd' }, el('clipPath', { id: clip, clipPathUnits: 'userSpaceOnUse' }, defs))
    }
    if (S.pen) host = el('g', { transform: S.pen, 'clip-path': `url(#${clip})` }, g)
    const path = el('path', {
      class: 'wm-stroke',
      d: S.d,
      stroke: 'currentColor',
      'stroke-width': WORDMARK.letters[L].stroke,
      pathLength: '1',
    }, host)
    if (clip && !S.pen) path.setAttribute('clip-path', `url(#${clip})`)
  }
  return svg
}

/**
 * Where the tittle is on screen: viewport px of its centre and its core radius
 * (plus `halo` and `scale`, px per viewBox unit), for an svg from wordmarkSVG().
 * Reads getBoundingClientRect, so call it in layout() with the svg's own
 * transforms at rest. Honours the default preserveAspectRatio (xMidYMid meet).
 */
export function tittleAt(svg) {
  const b = svg.getBoundingClientRect()
  const vb = svg.viewBox && svg.viewBox.baseVal
  const [vx, vy, vw, vh] = vb && vb.width ? [vb.x, vb.y, vb.width, vb.height] : [0, 0, WORDMARK.width, WORDMARK.height]
  const scale = Math.min(b.width / vw, b.height / vh) || 0
  const ox = b.left + (b.width - vw * scale) / 2
  const oy = b.top + (b.height - vh * scale) / 2
  const { cx, cy, r } = WORDMARK.dot
  return { x: ox + (cx - vx) * scale, y: oy + (cy - vy) * scale, r: r * scale, halo: WORDMARK.halo * scale, scale }
}
