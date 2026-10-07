/**
 * 080 · language — "It learns your business language before it answers."
 *
 * Beat 1: business words on one side, columns on the other, a faint web of every
 * possible pairing between them. The dot hops to each word and draws the one
 * true link to its column in lime.
 * The switch: the map goes and a Prism thread comes up, in English, under
 * "Ask in English or Arabic." The dot hops onto its EN | ع switch as the knob
 * and flips it; a line sweeps the card right to left and, as it passes, the
 * whole thread turns into Arabic - title, question, the agents' line, the
 * answer - laid out right to left. The dot leaves the switch (which keeps its
 * own knob) for the Arabic answer, as its verified light.
 * Beat 2: "It works on your data, right where it lives." The dot stands at a
 * hub and visits every database in turn on a hairline tether, leaving a ray to
 * each; it comes home to the hub, which is the centre of the screen (seam S9).
 */
import { chapter, seg, clamp, lerp, E, COLORS, ring, go } from '../core.js'

/* ----------------------------------------------------------------- timing */

// for each link: [the hop to its word starts, the link starts, the link ends]
const LINKS = [
  [0.012, 0.1, 0.17],
  [0.176, 0.2, 0.24],
  [0.246, 0.266, 0.3],
  [0.306, 0.326, 0.36],
]
// the switch to Arabic
const SW = {
  out: [0.366, 0.41], // headline 1 and the map leave; the dot lifts off its column as they go ...
  toKnob: [0.396, 0.456], // ... for the switch, at EN, landing as the card settles
  title: [0.398, 0.448], // "Ask in English or Arabic." (once headline 1's first line is out)
  card: [0.402, 0.452], // the thread comes up, in English
  flip: [0.476, 0.502], // the dot slides the switch to ع
  sweep: [0.502, 0.566], // the card turns into Arabic, right to left, as the line passes
  lead: [0.552, 0.596], // "... and the answer comes back in Arabic."
  toCheck: [0.572, 0.6], // the dot leaves the switch for the answer's verified light
}
const CLEAR1 = [0.636, 0.672] // the thread clears
const TOHUB = [0.64, 0.7]
const IN2 = [0.664, 0.75]
const VISIT = [0.752, 0.898]
const BACK = [0.9, 0.93]
const OUT = [0.932, 0.985]
const VISITS = 5
const vStep = (VISIT[1] - VISIT[0]) / VISITS
const visitAt = (k) => [VISIT[0] + k * vStep, VISIT[0] + k * vStep + vStep * 0.62]

/* ---------------------------------------------------------------- helpers */

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
const centreOf = (r) => [r.left + r.width / 2, r.top + r.height / 2]
const curve = ([x1, y1], [x2, y2]) => {
  const m = (x1 + x2) / 2
  return `M ${x1.toFixed(1)} ${y1.toFixed(1)} C ${m.toFixed(1)} ${y1.toFixed(1)}, ${m.toFixed(1)} ${y2.toFixed(1)}, ${x2.toFixed(1)} ${y2.toFixed(1)}`
}

/* --------------------------------------------------------- the dot's path */

/** The dot's state at p, from the moves built in layout. */
function where(p, S) {
  const M = S.moves
  let m = M[0]
  for (const x of M) if (p >= x.p0) m = x
  const u = m.ease(seg(p, m.p0, m.p1))
  let x
  let y
  if (m.kind === 'path') {
    ;[x, y] = pointAt(m.s, u)
  } else if (m.kind === 'orbit') {
    const a = lerp(m.a0, m.a1, u)
    const rad = lerp(m.r0, m.r1, u) + Math.sin(Math.PI * u) * m.bulge
    x = S.hub[0] + Math.cos(a) * rad
    y = S.hub[1] + Math.sin(a) * rad
  } else {
    x = lerp(m.from[0], m.to[0], u)
    y = lerp(m.from[1], m.to[1], u) + (m.lift || 0) * Math.sin(Math.PI * u)
  }
  // a small squash when it lands on something
  const land = m.squash ? Math.max(0, 1 - seg(p, m.p1, m.p1 + 0.014)) * (p >= m.p1 ? 1 : 0) : 0
  return {
    x,
    y,
    r: lerp(m.rA, m.rB, u),
    glow: lerp(m.gA ?? 1, m.gB ?? 1, u),
    moving: u > 0 && u < 1,
    sx: 1 + 0.32 * land,
    sy: 1 - 0.3 * land,
    m,
    u,
  }
}

/* ------------------------------------------------------------------ chapter */

chapter({
  id: 'language',
  title: 'Your language',
  anchorP: 0.08,
  // the databases stay lit round the hub and scroll away
  release: { hold: OUT[0], standin: true },

  build(ctx) {
    const S = ctx.state
    S.svg = ctx.$('.lang-svg')
    S.t1 = ctx.$$('.lang-t1 .lang-ln > span')
    S.t2 = ctx.$$('.lang-t2 .lang-ln > span')
    S.t2Box = ctx.$('.lang-t2')
    S.t3 = ctx.$$('.lang-t3 .lang-ln > span')
    S.t3Box = ctx.$('.lang-t3')
    S.lead2 = ctx.$('.lang-lead2')
    S.map = ctx.$('.lang-map')
    S.eyebrows = ctx.$$('.lang-eyebrow')
    S.terms = ctx.$$('.lang-term')
    S.cols = []
    for (const el of ctx.$$('.lang-colm')) S.cols[Number(el.dataset.i)] = el
    S.colEls = ctx.$$('.lang-colm')
    S.defs = ctx.$$('.lang-def')
    S.card = ctx.$('.lang-card')
    S.track = ctx.$('.lang-sw-track')
    S.knob = ctx.$('.lang-sw-knob')
    S.faces = ctx.$('.lang-faces')
    S.faceEN = ctx.$('.lang-face-en')
    S.faceAR = ctx.$('.lang-face-ar')
    S.checkAR = ctx.$('.lang-face-ar .lang-check')
    S.sweep = ctx.$('.lang-sweep')
    S.lead = ctx.$('.lang-lead')
    S.hubEl = ctx.$('.lang-hub')
    S.dbs = ctx.$$('.lang-db')
    S.label = ctx.$('.lang-label')
    S.cache = {}
    S.lastP = 0

    // a word lights its link and its column; a click scrolls to the moment it was drawn
    const hot = (i) => {
      S.hot = i
      S.terms.forEach((t, k) => t.classList.toggle('is-hot', k === i))
      S.cols.forEach((c, k) => c.classList.toggle('is-hot', k === i))
      S.defs.forEach((d) => d.classList.toggle('is-hot', Number(d.dataset.i) === i))
      S.linkEls?.forEach((l, k) => l.classList.toggle('is-hot', k === i))
    }
    S.terms.forEach((t, i) => {
      t.addEventListener('pointerenter', () => hot(i))
      t.addEventListener('pointerleave', () => hot(-1))
      t.addEventListener('focus', () => hot(i))
      t.addEventListener('blur', () => hot(-1))
      t.addEventListener('click', () => go('language', Number(t.dataset.p)))
    })
    S.hotFn = hot
    // the Arabic glyphs load on demand and set the thread's height; measure again once they are in
    // (where the stage rests, as measure() does)
    const fonts = document.fonts
    Promise.all(fonts ? [fonts.load('400 16px Tajawal', 'كم طلباً'), fonts.load('700 16px Tajawal', 'محادثة')] : []).then(() => {
      if (!S.ready) return
      const st = ctx.stage.style.transform
      ctx.stage.style.transform = ''
      try {
        this.layout(ctx)
        this.render(ctx.p, ctx)
      } catch (e) {
        console.warn('[language] relayout', e)
      }
      ctx.stage.style.transform = st
    })
  },

  layout(ctx) {
    const S = ctx.state
    const vw = ctx.vw
    const vh = ctx.vh
    const mob = ctx.mobile
    // a phone stands the hub in the middle of the free space and rings the databases around it
    S.hub = mob ? [vw / 2, vh * 0.59] : [vw / 2, vh / 2]

    // reset what render moves, then measure
    for (const el of [...S.terms, ...S.colEls, S.card, ...S.defs]) el.style.transform = ''
    const mapR = S.map.getBoundingClientRect()
    const termPip = S.terms.map((t) => centreOf(t.querySelector('.lang-pip').getBoundingClientRect()))
    const colPip = S.cols.map((c) => centreOf(c.querySelector('.lang-pip').getBoundingClientRect()))
    S.termPip = termPip
    S.colPip = colPip

    // the thread: under its headline, with its lead below it, the pair a touch under the middle
    const cw = S.card.offsetWidth
    const ch = S.card.offsetHeight
    const gap = mob ? 14 : 22
    const group = ch + gap + S.lead.offsetHeight
    const cardTop = Math.max(S.t3Box.getBoundingClientRect().bottom + (mob ? 24 : 36), vh * 0.53 - group / 2)
    S.card.style.left = `${((vw - cw) / 2).toFixed(1)}px`
    S.card.style.top = `${cardTop.toFixed(1)}px`
    S.lead.style.top = `${(cardTop + ch + gap).toFixed(1)}px`
    // the switch's knob at EN and at ع (the dot is the knob while it flips), and the Arabic answer's light
    const wasAr = S.card.classList.contains('is-ar')
    S.card.classList.remove('is-ar')
    S.knobEN = centreOf(S.knob.getBoundingClientRect())
    S.card.classList.add('is-ar')
    S.knobAR = centreOf(S.knob.getBoundingClientRect())
    S.card.classList.toggle('is-ar', wasAr)
    S.rKnob = S.knob.offsetWidth / 2
    S.checkAt = centreOf(S.checkAR.getBoundingClientRect())
    S.rCheck = Math.max(3, S.checkAR.offsetWidth / 2 - 4)
    // the sweep runs across the card's inside, from its right edge to its left; the faces sit inset in it
    S.cardIn = S.card.clientWidth
    S.facesL = S.faces.offsetLeft
    S.facesW = S.faces.offsetWidth

    // svg: a faint web of every pairing, the true links, the rays
    const svg = S.svg
    let html = '<path class="lang-probe" style="display:none"/>'
    for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) html += `<path class="lang-ghost" d="${curve(termPip[i], colPip[j])}"/>`
    const linkD = termPip.map((tp, i) => curve(tp, colPip[i]))
    html += linkD.map((d) => `<path class="lang-link-g" d="${d}"/>`).join('')
    html += linkD.map((d) => `<path class="lang-link" d="${d}"/>`).join('')

    // the databases: an arc under the hub on a desktop, a ring around it on a phone (clockwise, in visiting order)
    const angles = mob ? [196, 270, 344, 48, 132] : [166, 128, 90, 52, 14]
    const rx = mob ? vw / 2 - 16 - 64 : Math.min(520, vw * 0.36)
    const ry = mob ? Math.min(250, vh * 0.29) : Math.min(262, vh * 0.29)
    S.ports = []
    S.dbs.forEach((el, i) => {
      const w = el.offsetWidth
      const h = el.offsetHeight
      const a = (angles[i] * Math.PI) / 180
      const cx = S.hub[0] + Math.cos(a) * rx
      const cy = S.hub[1] + Math.sin(a) * ry
      el.style.left = `${(cx - w / 2).toFixed(1)}px`
      el.style.top = `${(cy - h / 2).toFixed(1)}px`
      // the port: where the line from the hub meets the badge's edge
      const dx = S.hub[0] - cx
      const dy = S.hub[1] - cy
      const t = Math.min(w / 2 / Math.max(1e-3, Math.abs(dx)), h / 2 / Math.max(1e-3, Math.abs(dy)))
      S.ports.push([cx + dx * t, cy + dy * t])
    })
    html += S.ports.map(([x, y]) => `<path class="lang-ray" d="M ${S.hub[0]} ${S.hub[1]} L ${x.toFixed(1)} ${y.toFixed(1)}"/>`).join('')
    html += S.ports.map(([x, y]) => `<path class="lang-ray-flow" d="M ${S.hub[0]} ${S.hub[1]} L ${x.toFixed(1)} ${y.toFixed(1)}"/>`).join('')
    html += `<line class="lang-tether" x1="${S.hub[0]}" y1="${S.hub[1]}" x2="${S.hub[0]}" y2="${S.hub[1]}"/>`
    svg.innerHTML = html
    const probe = svg.querySelector('.lang-probe')
    S.ghostEls = Array.from(svg.querySelectorAll('.lang-ghost'))
    S.linkEls = Array.from(svg.querySelectorAll('.lang-link'))
    S.linkGEls = Array.from(svg.querySelectorAll('.lang-link-g'))
    S.links = linkD.map((d) => sample(probe, d))
    S.linkL = S.linkEls.map((el) => el.getTotalLength())
    S.linkEls.forEach((el, i) => (el.style.strokeDasharray = `${S.linkL[i]} ${S.linkL[i] + 4}`))
    S.linkGEls.forEach((el, i) => (el.style.strokeDasharray = `${S.linkL[i]} ${S.linkL[i] + 4}`))
    S.rayEls = Array.from(svg.querySelectorAll('.lang-ray'))
    S.rayL = S.ports.map(([x, y]) => Math.hypot(x - S.hub[0], y - S.hub[1]))
    S.rayEls.forEach((el, i) => (el.style.strokeDasharray = `${S.rayL[i]} ${S.rayL[i] + 4}`))
    S.flowEls = Array.from(svg.querySelectorAll('.lang-ray-flow'))
    S.tether = svg.querySelector('.lang-tether')
    if (S.hot >= 0) S.hotFn(S.hot)

    // definitions: centred on their link's midpoint and lifted clear of it, above a descending link and
    // below a rising one, so neither it nor the link that crosses it runs through the text; on a phone,
    // one line under the map
    const PART = [1, 0, 3, 2]
    S.defs.forEach((d) => {
      const i = Number(d.dataset.i)
      const w = d.offsetWidth
      const h = d.offsetHeight
      let x = mapR.left + mapR.width / 2
      let y = mapR.bottom + 22
      if (!mob) {
        const [mx, my] = pointAt(S.links[i], 0.5)
        const above = pointAt(S.links[i], 0.55)[1] > pointAt(S.links[i], 0.45)[1]
        let lim = my
        for (const s of [S.links[i], S.links[PART[i]]]) {
          for (let k = 0; k <= s.n; k++) {
            if (Math.abs(s.pts[k * 2] - mx) > w / 2 + 6) continue
            const py = s.pts[k * 2 + 1]
            lim = above ? Math.min(lim, py) : Math.max(lim, py)
          }
        }
        x = mx
        y = above ? lim - 7 - h / 2 : lim + 7 + h / 2
      }
      d.style.left = `${(x - w / 2 - mapR.left).toFixed(1)}px`
      d.style.top = `${(y - h / 2 - mapR.top).toFixed(1)}px`
    })

    // "Read-only": just under headline 2
    S.lead2.style.top = `${(S.t2Box.getBoundingClientRect().bottom + (mob ? 8 : 14)).toFixed(1)}px`

    // hub
    S.hubEl.style.left = `${S.hub[0]}px`
    S.hubEl.style.top = `${S.hub[1]}px`

    // the dot's moves, in order
    const rP = mob ? 5.5 : 6.5
    const rHub = mob ? 7 : 8
    const rK = S.rKnob
    const io = E.inOut
    const M = []
    const C = [vw / 2, vh / 2]
    M.push({ kind: 'line', p0: 0, p1: 0.005, from: C, to: C, rA: 10, rB: 10, ease: io })
    M.push({ kind: 'line', p0: LINKS[0][0], p1: LINKS[0][1] - 0.012, from: C, to: termPip[0], lift: -80, rA: 10, rB: rP, ease: io, squash: true })
    for (let i = 0; i < 4; i++) {
      if (i > 0) M.push({ kind: 'line', p0: LINKS[i][0], p1: LINKS[i][1] - 0.004, from: colPip[i - 1], to: termPip[i], lift: -54, rA: rP, rB: rP, ease: io, squash: true })
      M.push({ kind: 'path', p0: LINKS[i][1], p1: LINKS[i][2], s: S.links[i], rA: rP, rB: rP, ease: io })
    }
    M.push({ kind: 'line', p0: SW.toKnob[0], p1: SW.toKnob[1], from: colPip[3], to: S.knobEN, lift: mob ? -60 : -90, rA: rP, rB: rK, gA: 1, gB: 0.8, ease: io, squash: true })
    M.push({ kind: 'line', p0: SW.flip[0], p1: SW.flip[1], from: S.knobEN, to: S.knobAR, rA: rK, rB: rK, gA: 0.8, gB: 1, ease: io, squash: true })
    M.push({ kind: 'line', p0: SW.toCheck[0], p1: SW.toCheck[1], from: S.knobAR, to: S.checkAt, lift: mob ? -28 : -40, rA: rK, rB: S.rCheck, gA: 1, gB: 1.1, ease: io, squash: true })
    M.push({ kind: 'line', p0: TOHUB[0], p1: TOHUB[1], from: S.checkAt, to: S.hub, lift: mob ? -60 : -90, rA: S.rCheck, rB: rHub, gA: 1.1, gB: 1.1, ease: io, squash: true })
    const polar = ([x, y]) => [Math.atan2(y - S.hub[1], x - S.hub[0]), Math.hypot(x - S.hub[0], y - S.hub[1])]
    for (let k = 0; k < VISITS; k++) {
      const [p0, p1] = visitAt(k)
      const [a1, r1] = polar(S.ports[k])
      if (k === 0) M.push({ kind: 'orbit', p0, p1, a0: a1, a1, r0: 0, r1, bulge: 0, rA: rHub, rB: rP, ease: io })
      else {
        const [a0, r0] = polar(S.ports[k - 1])
        M.push({ kind: 'orbit', p0, p1, a0, a1, r0, r1, bulge: mob ? -34 : 40, rA: rP, rB: rP, ease: io })
      }
    }
    M.push({ kind: 'line', p0: BACK[0], p1: BACK[1], from: S.ports[VISITS - 1], to: S.hub, rA: rP, rB: rHub, gA: 1, gB: 1.25, ease: io, squash: true })
    M.push({ kind: 'line', p0: OUT[0], p1: OUT[1], from: S.hub, to: C, rA: rHub, rB: 10, gA: 1.25, gB: 1, ease: io })
    S.moves = M
    S.ready = true
    S.cache = {}
  },

  render(p, ctx) {
    const S = ctx.state
    if (!S.ready) return
    const C = S.cache
    const io = E.inOut
    const mapOut = 1 - io(seg(p, SW.out[0], SW.out[1]))
    const out2 = 1 - io(seg(p, OUT[0], OUT[1] - 0.012))
    const dot = where(p, S)

    // headline 1 rises in, then up and out as the thread comes up
    S.t1.forEach((el, i) => {
      const a = E.out(seg(p, 0.012 + i * 0.02, 0.07 + i * 0.02))
      const b = E.in(seg(p, SW.out[0] + i * 0.01, SW.out[0] + 0.028 + i * 0.01))
      el.style.transform = `translate3d(0, ${((1 - a) * 115 - b * 115).toFixed(2)}%, 0)`
    })

    // the map: words, columns, the web and the links; it leaves with headline 1
    S.eyebrows.forEach((el) => (el.style.opacity = (E.out(seg(p, 0.05, 0.1)) * mapOut).toFixed(3)))
    S.terms.forEach((el, i) => {
      const a = E.out(seg(p, 0.03 + i * 0.012, 0.1 + i * 0.012))
      el.style.opacity = (a * mapOut).toFixed(3)
      el.style.transform = `translate3d(${((1 - a) * -22 + (1 - mapOut) * -18).toFixed(2)}px, 0, 0)`
      // faded words stay in the tab order (focusing one scrolls the story to it); they just can't be hit
      el.style.pointerEvents = a * mapOut < 0.05 ? 'none' : ''
      const on = p >= LINKS[i][1] + 0.002
      if (C['t' + i] !== on) {
        C['t' + i] = on
        el.classList.toggle('is-linked', on)
      }
    })
    S.cols.forEach((el, i) => {
      const a = E.out(seg(p, 0.045 + i * 0.012, 0.115 + i * 0.012))
      el.style.opacity = (a * mapOut).toFixed(3)
      el.style.transform = `translate3d(${((1 - a) * 22 + (1 - mapOut) * 18).toFixed(2)}px, 0, 0)`
      const on = p >= LINKS[i][2] - 0.002
      if (C['c' + i] !== on) {
        C['c' + i] = on
        el.classList.toggle('is-linked', on)
      }
      // the column takes the link with a brief flash
      const hit = p >= LINKS[i][2] - 0.002 && p < LINKS[i][2] + 0.03
      if (C['h' + i] !== hit) {
        C['h' + i] = hit
        el.classList.toggle('is-hit', hit)
      }
    })
    const ga = (E.out(seg(p, 0.06, 0.13)) * mapOut).toFixed(3)
    if (C.ga !== ga) {
      C.ga = ga
      for (const el of S.ghostEls) el.style.opacity = ga
    }
    S.linkEls.forEach((el, i) => {
      const u = io(seg(p, LINKS[i][1], LINKS[i][2]))
      const off = ((1 - u) * S.linkL[i]).toFixed(1)
      el.style.strokeDashoffset = off
      S.linkGEls[i].style.strokeDashoffset = off
      el.style.opacity = mapOut.toFixed(3)
      S.linkGEls[i].style.opacity = (0.12 * mapOut).toFixed(3)
    })
    S.defs.forEach((d) => {
      const i = Number(d.dataset.i)
      const v = i === 0 ? E.out(seg(p, LINKS[0][2] - 0.02, LINKS[0][2] + 0.02)) * mapOut : 0
      d.style.setProperty('--o', v.toFixed(3))
      // a hovered word shows its definition, as bright as the map is
      d.style.setProperty('--vis', mapOut.toFixed(3))
    })

    // the switch: the headline, the thread and its lead come up, and clear together
    const clr = E.in(seg(p, CLEAR1[0], CLEAR1[1]))
    S.t3.forEach((el, i) => {
      const a = E.out(seg(p, SW.title[0] + i * 0.02, SW.title[1] + i * 0.02))
      const b = E.in(seg(p, CLEAR1[0] + i * 0.008, CLEAR1[0] + 0.028 + i * 0.008))
      el.style.transform = `translate3d(0, ${((1 - a) * 115 - b * 115).toFixed(2)}%, 0)`
    })
    {
      const a = E.out(seg(p, SW.card[0], SW.card[1]))
      const o = a * (1 - clr)
      S.card.style.opacity = o.toFixed(3)
      S.card.style.visibility = o < 0.01 ? 'hidden' : ''
      S.card.style.transform = `translate3d(0, ${((1 - a) * 24 - clr * 16).toFixed(2)}px, 0) scale(${(0.97 + 0.03 * a).toFixed(4)})`
      const l = E.out(seg(p, SW.lead[0], SW.lead[1]))
      S.lead.style.opacity = (l * (1 - clr)).toFixed(3)
      S.lead.style.transform = `translate3d(0, ${((1 - l) * 12 - clr * 10).toFixed(2)}px, 0)`
    }
    // the switch turns as the dot passes its middle; the knob shows whenever the dot is not being it
    const ar = p >= (SW.flip[0] + SW.flip[1]) / 2
    if (C.ar !== ar) {
      C.ar = ar
      S.card.classList.toggle('is-ar', ar)
    }
    const knob = p >= SW.toKnob[1] - 0.002 && p < SW.toCheck[0] ? '0' : '1'
    if (C.knob !== knob) {
      C.knob = knob
      S.knob.style.opacity = knob
    }
    // once the dot has gone on, the Arabic answer keeps a light of its own, like the English one
    const lit = p >= TOHUB[0]
    if (C.lit !== lit) {
      C.lit = lit
      S.card.classList.toggle('is-lit', lit)
    }
    // the sweep: right to left across the card, Arabic behind the line, English still ahead of it
    const s = io(seg(p, SW.sweep[0], SW.sweep[1]))
    if (C.s !== s) {
      C.s = s
      const x = (1 - s) * S.cardIn
      const xf = x - S.facesL
      S.faceEN.style.clipPath = s > 0 ? `inset(0 ${clamp(S.facesW - xf, 0, S.facesW).toFixed(1)}px 0 0)` : ''
      S.faceAR.style.clipPath = s < 1 ? `inset(0 0 0 ${clamp(xf, 0, S.facesW).toFixed(1)}px)` : ''
      S.sweep.style.opacity = Math.sin(Math.PI * s).toFixed(3)
      S.sweep.style.transform = `translate3d(${(x - 1).toFixed(1)}px, 0, 0)`
    }

    // beat 2: the headline, the hub, the databases
    S.t2.forEach((el, i) => {
      const a = E.out(seg(p, IN2[0] + i * 0.02, IN2[0] + 0.06 + i * 0.02))
      const b = E.in(seg(p, OUT[0] + i * 0.008, OUT[0] + 0.035 + i * 0.008))
      el.style.transform = `translate3d(0, ${((1 - a) * 115 - b * 115).toFixed(2)}%, 0)`
    })
    {
      const a = E.out(seg(p, IN2[0] + 0.05, IN2[0] + 0.11))
      const b = E.in(seg(p, OUT[0], OUT[0] + 0.035))
      S.lead2.style.opacity = (a * (1 - b)).toFixed(3)
      S.lead2.style.transform = `translate3d(0, ${((1 - a) * 12 - b * 10).toFixed(2)}px, 0)`
    }
    const hubA = E.out(seg(p, TOHUB[1] - 0.02, TOHUB[1] + 0.03)) * out2
    S.hubEl.style.opacity = (hubA * 0.9).toFixed(3)
    S.hubEl.style.transform = `scale(${(0.5 + 0.5 * hubA).toFixed(3)})`
    S.dbs.forEach((el, k) => {
      const a = E.out(seg(p, IN2[0] + 0.02 + k * 0.011, IN2[0] + 0.07 + k * 0.011))
      const z = E.in(seg(p, OUT[0] + (VISITS - 1 - k) * 0.005, OUT[0] + 0.03 + (VISITS - 1 - k) * 0.005))
      el.style.opacity = (a * (1 - z)).toFixed(3)
      el.style.transform = `translate3d(0, ${((1 - a) * 18 + z * 10).toFixed(2)}px, 0) scale(${(0.94 + 0.06 * a - 0.04 * z).toFixed(4)})`
      el.style.visibility = a * (1 - z) < 0.01 ? 'hidden' : ''
      const on = p >= visitAt(k)[1] - 0.002
      if (C['d' + k] !== on) {
        C['d' + k] = on
        el.classList.toggle('is-on', on)
      }
    })
    S.rayEls.forEach((el, k) => {
      const on = p >= visitAt(k)[1] - 0.001 ? 1 : 0
      const back = io(seg(p, OUT[0], OUT[1] - 0.02))
      el.style.opacity = on.toFixed(0)
      el.style.strokeDashoffset = (back * S.rayL[k]).toFixed(1)
    })
    const flowing = p >= BACK[0] && p < OUT[0] + 0.02 && !ctx.reduced
    if (C.flow !== flowing) {
      C.flow = flowing
      ctx.stage.classList.toggle('lang-flowing', flowing)
      S.flowEls.forEach((el) => (el.style.opacity = flowing ? '0.7' : '0'))
    }
    // the tether: the hairline from the hub to the dot while it visits
    const tetherOn = p >= VISIT[0] && p < BACK[1]
    S.tether.style.opacity = tetherOn ? '1' : '0'
    if (tetherOn) {
      S.tether.setAttribute('x2', dot.x.toFixed(1))
      S.tether.setAttribute('y2', dot.y.toFixed(1))
    }

    const la = E.out(seg(p, 0.06, 0.12)) * out2
    S.label.style.opacity = la.toFixed(3)

    // one-shots, forward only
    const crossed = (t) => S.lastP < t && p >= t && p < t + 0.04
    if (crossed(SW.flip[1])) ring(COLORS.lime)
    if (crossed(BACK[1])) ring(COLORS.lime)
    S.lastP = p
  },

  dot(p, ctx) {
    const S = ctx.state
    if (!S.ready) return { x: ctx.vw / 2, y: ctx.vh / 2, r: 10, lean: 0 }
    const d = where(p, S)
    const sitting = !d.moving
    // the knob of the switch, then the Arabic answer's verified light
    const onKnob = p >= SW.toKnob[1] && p < SW.toCheck[0]
    const onCheck = p >= SW.toCheck[1] && p < TOHUB[0]
    const atHub = (p >= TOHUB[1] && p < VISIT[0]) || (p >= BACK[1] && p < OUT[0])
    return {
      x: d.x,
      y: d.y,
      r: d.r,
      glow: d.glow,
      sx: d.sx,
      sy: d.sy,
      // at the hub the ring frames it, so a real glance at the pointer reads as curiosity, not drift
      lean: atHub ? 0.8 : 0,
      lag: d.moving ? 0 : 0.04,
      blink: sitting && (onKnob || onCheck || atHub),
      stretch: 0.7,
      halo: onKnob ? 2.2 : onCheck ? 2.6 : 3,
    }
  },
})
