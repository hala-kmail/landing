/**
 * Autoplay - "Watch how it thinks" plays the story by itself.
 *
 * The page glides from beat to beat on its own and holds wherever there is
 * something to read, through to the end card. The visitor can take over at any
 * moment: a wheel, a touch, a key, a click anywhere, or a drag of the scrollbar
 * stops it on the spot, and the story simply carries on by hand from there.
 *
 * Any link marked `data-autoplay` starts it. Without scripts it stays an
 * ordinary link to its href.
 */
import { E, lerp, scrollTo, storyY } from './core.js'

// [chapter, p, seconds to get there, seconds to hold] - the beats worth stopping on, in story order
const BEATS = [
  ['questions', 0.18, 2.4, 1.6], // every company runs on questions
  ['questions', 0.86, 5.5, 3], // the question, who asked it; the answers are already in the data
  ['wait', 0.2, 2.8, 1.2], // ... but it takes a ticket,
  ['wait', 0.47, 2, 1], // a queue, and nine days
  ['wait', 0.9, 4, 0.8], // the days go by
  ['number', 0.16, 1.6, 1.6], // the report comes back
  ['number', 0.32, 1.4, 1.4], // 1,180.
  ['number', 0.56, 2.2, 1.6], // the year's plan is built on it
  ['number', 0.86, 2.6, 1.8], // revenue down 20%
  ['truth', 0.24, 2, 1.6], // the real number
  ['truth', 0.5, 1.5, 3], // nobody asked what 'late' meant
  ['truth', 0.72, 1.6, 1.8], // one wrong number
  ['why', 0.5, 3, 2.4], // that's why we built Prism
  ['why', 0.86, 1.6, 1.4], // same Monday, same question
  ['asks', 0.27, 3.2, 0.8], // asked again
  ['asks', 0.6, 3, 2.2], // it asks what 'late' means
  ['asks', 0.84, 2, 2.6], // the answer
  ['steps', 0.8, 6.5, 1.8], // every step, down to the number
  ['steps', 0.935, 1.6, 1.2], // a query you can read
  ['language', 0.362, 4.4, 1.2], // your words, your columns
  ['language', 0.468, 2.2, 0.9], // a thread in English, the dot on its switch
  ['language', 0.62, 3, 2], // flipped: the same thread, in Arabic
  ['language', 0.93, 3, 1.4], // where the data lives
  ['hands', 0.3, 3, 1.2], // as an analyst sees it
  ['hands', 0.5, 1.4, 1], // as a sales manager does
  ['hands', 0.78, 1.6, 1.2], // as the owner does
  ['minutes', 0.24, 3.6, 1.8], // a dashboard
  ['minutes', 0.46, 1.8, 1.6], // a report
  ['minutes', 0.74, 2.4, 1.6], // days, minutes
  ['minutes', 0.93, 2, 2], // the year goes to plan
  ['finale', 0.6, 4.5, 0.8], // the dot signs its name
  ['finale', 1, 2.5, 0], // the end card
]
const TAKEOVER = ['wheel', 'touchstart', 'pointerdown', 'keydown']
const NOTE_FOR = 4200 // ms the "how to take over" note stays up

let run = null
let note = null
let noteTimer = 0

export function play() {
  stop()
  const from = scrollY
  const steps = []
  for (const [id, p, travel, hold] of BEATS) {
    const y = storyY(id, p)
    if (y != null && y > from + 2) steps.push({ y, travel, hold })
  }
  if (!steps.length) return
  run = { steps, i: 0, from, phase: 'travel', t: 0, last: performance.now(), y: from }
  for (const t of TAKEOVER) addEventListener(t, stop, { capture: true, passive: true })
  document.documentElement.classList.add('is-autoplay')
  showNote()
  requestAnimationFrame(step)
}

export function stop() {
  if (!run) return
  run = null
  for (const t of TAKEOVER) removeEventListener(t, stop, { capture: true })
  document.documentElement.classList.remove('is-autoplay')
  clearTimeout(noteTimer)
  note?.classList.remove('is-on')
}

function step(now) {
  const r = run
  if (!r) return
  // the page moved without us (the scrollbar was dragged): the visitor has it now
  if (Math.abs(scrollY - r.y) > 4) return stop()
  // time from frame deltas, capped, so a hidden tab picks up where it left off
  r.t += Math.min(0.1, (now - r.last) / 1000)
  r.last = now
  const s = r.steps[r.i]
  if (r.phase === 'travel') {
    const u = Math.min(1, r.t / s.travel)
    r.y = lerp(r.from, s.y, E.glide(u))
    if (u >= 1) {
      r.phase = 'hold'
      r.t = 0
    }
  } else if (r.t >= s.hold) {
    r.i++
    if (r.i >= r.steps.length) return stop()
    r.from = s.y
    r.phase = 'travel'
    r.t = 0
  }
  scrollTo(r.y, { immediate: true })
  requestAnimationFrame(step)
}

/** Once, as it starts: what is happening, and how to take it over. */
function showNote() {
  if (!note) {
    note = document.createElement('p')
    note.className = 'autoplay-note label'
    note.setAttribute('role', 'status')
    note.innerHTML = '<i aria-hidden="true"></i>Playing · scroll or tap to take over'
    document.body.appendChild(note)
  }
  // a frame later, so the note rises in even the first time
  requestAnimationFrame(() => note.classList.add('is-on'))
  clearTimeout(noteTimer)
  noteTimer = setTimeout(() => note.classList.remove('is-on'), NOTE_FOR)
}

// capture: this runs before the core's own handling of in-page links
document.addEventListener(
  'click',
  (e) => {
    if (!e.target.closest?.('[data-autoplay]')) return
    e.preventDefault()
    e.stopPropagation()
    play()
  },
  true,
)
