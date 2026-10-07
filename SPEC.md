# PRISM landing page — the story of the dot

This file is the contract for everyone building the page. Read all of it before you write anything.

## The idea

PRISM's wordmark is five thin letters with a lit dot floating over the `i`. **That dot is the brand's personality**, and on
this page it is the main character. It is the part of Prism that pays attention: curious, precise, honest, a little
playful. It never speaks. Everything it says, it says by moving.

The page is a film you scroll. The dot leaves home (the `i`), walks the visitor through a story, and comes home at the
end. On the way it plays every role a dot can play in a sentence, a chart or an interface: a full stop, the dot of a
question mark, a status light on a ticket, a data point riding a falling line, a radio button, a switch knob, the light
that tells you a number is verified. That one recurring object is what makes the page unforgettable — **give the dot a
role in every beat**, not just a position.

The story is the one marketing approved in the films (pain → agitation → "That's why we built Prism" → how → proof):

1. Every company runs on questions. The answers are already in your data.
2. But reaching them takes a ticket, a queue, and nine days.
3. Nine days later the report came back: 1,180 late orders. The year's plan was built on it.
4. By spring revenue was down 20%. The board doubted every number. Investors pulled back. Forecasts became guesses.
5. The real number was 4,630. Nobody had asked what "late" meant. One wrong number; a whole year built on it.
6. **That's why we built Prism.** (The dot ignites lime — the first time lime appears since the hero.)
7. Same Monday, same question: Prism asks what "late" means, with the figures side by side. It doesn't guess.
8. It shows every step; every number traces back to a query you can read.
9. It learns your business language and works on your data where it lives (English or Arabic).
10. Every number stays in the right hands.
11. Your question comes back as a dashboard, a report, a decision — in minutes, not weeks. This time the year goes to plan.
12. Prism. Your all-in-one Enterprise AI Assistant. Bring your own question, and watch how it thinks.

Never present AI as the source of the wrong number: the old way is a ticket to a reporting team and a BI report.

## Product facts you may use (and nothing beyond them)

- Ask questions about your company's data in plain language, in **English or Arabic**.
- A team of AI agents (data analyst, dashboard, report, diagnostics, data-quality, drill-down, knowledge-base agents)
  explores the schema, writes SQL, runs it on your database, and a reviewer checks the work.
- When a question could mean two things, Prism computes every reading and **asks once, with the figures as the options**.
- It learns your business language (a semantic layer you can train; plus a knowledge base of your documents).
- It connects to **Oracle, SQL Server, PostgreSQL, MySQL, MongoDB** and reads the data where it lives, through a
  **read-only** database user: it never changes your data.
- Every step is visible (a run graph; readable SQL for every number).
- Data policies mask sensitive fields by role; roles and an audit trail.
- Answers become dashboards and reports (English and Arabic reports); you can also talk to it by voice.
- Click any chart point to see the records behind it, and read the exact SQL. Insights say why a figure changed, with
  the evidence. Caveats are spoken: an open period, a balance that doesn't match the ledger, missing data. Data reviews
  ("Can I trust this data?"). It can ask across your document library as well as your databases. A usage page prices
  every model call; you can set a budget.
- A public playground with sample databases: `https://demo.orapex.com/playground`. No sign-up: an email is all it takes,
  and sessions are kept between visits.
- Tagline (client-approved, use verbatim): **"Your all-in-one Enterprise AI Assistant."** Byline: **"An ORAPEX Product"**.
- Never invent certifications, customer logos, numbers of customers, prices, or benchmarks.

## Look

- Ground: near-black `--bg #050505`. Cinematic: generous negative space, one clear subject per moment, soft light.
- **Lime `#c9f144` (`--lime`) means Prism / the truth.** Use it only for Prism: the dot when it is Prism, a verified check,
  a true answer, a Prism highlight, the primary CTA. Never for the old way.
- The old way (tickets, the queue, the BI report): desaturated greys; **amber `--amber`** only for "waiting".
- A guess / the wrong number: **rose `--rose`**, sparingly.
- Ink `--ink #f2f4ee` for display text, `--ink-2` for leads, `--mfg` for labels, `--dim` for the faintest.
- Type (classes in `src/styles/base.css`): `.display` (hero), `.h2` (chapter headline), `.h3`, `.lead`, `.eyebrow`/`.label`
  (JetBrains Mono uppercase), `.mono`, `.tnum`. Brand font is **Tajawal** (`--sans`); mono is JetBrains Mono (`--mono`);
  Inter (`--ui`) only if you need a neutral third-party UI look. Display text: weight 700, letter-spacing -0.035em.
- On-screen words support the story, they do not narrate it: few words, large or small, never a paragraph.
  One headline per beat, optionally one short lead line.
- Product surfaces (Prism UI vignettes): `.card` (dark, hairline border, radius 16, inner highlight, big soft shadow),
  `.chip`, `.chip.lime`, `.btn`, `.btn.primary`. Make them look like the real app — it lives in
  `../frontend/frontend/src/features/workspace/components/` (e.g. `clarification-form.tsx`, `thread-panel.tsx`,
  `canvas-runs.tsx`, `dashboard-grid.tsx`) and `../frontend/frontend/src/styles/global.css`. Simplify; never screenshot.
- No images of UI, no stock photos, no icons fonts. Inline SVG for icons (lucide-style 1.5px strokes).

## Motion

- Everything breathes a little; nothing pops in linearly. Use `E.out`, `E.inOut`, `E.swift`, `E.glide`, `E.back`
  (or any `gsap.parseEase`). Entrances 4–10 % of a chapter's progress. Text that must be read holds still long enough.
- Prefer transforms and opacity. A small `filter: blur()` on entering text is fine; never blur or shadow-animate big
  layers. No layout reads inside `render` (measure in `layout`). Keep the DOM of a chapter modest.
- Mask reveals (`overflow: hidden` line wrappers with the text rising in), SplitText chars/words/lines, clip-path wipes,
  counters that roll (`tnum`), SVG stroke draw-ons (`pathLength="1"` + `stroke-dashoffset`), 3D (`perspective` on a
  parent, `transform-style: preserve-3d`) are all welcome. Make each chapter feel crafted, not templated.

## Architecture (read `src/motion/core.js` — it is short)

- The site is a Next.js (App Router) app: `npm run dev` serves it on http://localhost:3000 and reloads on save.
  `src/app/page.tsx` is the page, `src/app/layout.tsx` the document (metadata, fonts, every stylesheet in story order),
  and `src/components/Story.tsx` loads the motion in the browser after hydration (the chapters, and
  `src/motion/autoplay.js` for "Watch how it thinks").
- Each chapter is three files that share its name: its markup `src/components/chapters/<Name>Chapter.tsx`, its styles
  `src/styles/chapters/<prefix>-<id>.css` and its motion `src/motion/chapters/<prefix>-<id>.js`. A new chapter is wired
  in three places, each in story order: its component in `page.tsx`, its stylesheet in `layout.tsx`, its motion module
  in `Story.tsx`.
- A chapter is `<section className="chapter" id="ch-<id>" data-chapter="<id>" data-len="<screens>"><div className="stage">…</div></section>`.
  Its markup is static (no React state): React never re-renders what the motion animates.
  `data-len` is how many viewport heights of scrolling p = 0 → 1 takes. With JS every `.stage` is a fixed, full-viewport
  layer; only the chapter that owns the scroll position is visible (`.is-live`) - two during a hand-off (below). Without
  JS the stages are ordinary stacked blocks: write markup whose natural (un-animated) state is readable, and set initial
  animation states from JS.
- **Nothing is wiped between scenes.** A chapter that declares `release: { hold, standin }` plays only up to `p = hold`
  (its finished frame, before its own exit), then that frame scrolls up and away with the page over one screen while
  the next chapter's stage comes up behind it, waiting on its p = 0 frame. Over the hand-off the dot rides up with the
  old frame for a moment, then lets go and settles on the next chapter's p = 0 pose; with `standin: true` a still mark
  stays where it was (the full stop, the checked radio, the switch knob), so the finished frame stays whole. Chapters
  without `release` hand over in place, as one continuous shot (wait → number → truth → why → asks).
- Register it from `src/motion/chapters/<file>.js`:
  ```js
  import { chapter, seg, win, clamp, lerp, E, COLORS, mix, rng, ring, impulse, on } from '../core.js'
  chapter({
    id: 'asks', title: 'It asks', anchorP: 0.15,
    build(ctx) {},            // once: query elements (ctx.$ / ctx.$$ are scoped to the stage), split text, build timelines
    layout(ctx) {},           // every resize: measure rects into ctx.state (the stage is fixed, so rects are viewport px)
    render(p, ctx) {},        // PURE: set every animated property from p in 0..1
    dot(p, ctx) { return { x, y, r, color, glow, ... } },   // PURE: the dot's target for this p
    tick(time, p, ctx) {},    // optional idle motion while live (skip when ctx.reduced)
    release: { hold: 0.85, standin: true }, // optional: stop at hold and scroll the finished frame away
  })
  ```
- `render` must be a pure function of `p`: any p, in any order, after any jump, gives the same frame. A paused GSAP
  timeline driven by `tl.progress(p)` is the easiest way (build it in `build`, use `fromTo`/`set`, `ease: 'none'` on the
  timeline and eases on tweens). Don't use `Math.random()` in render; use `rng(seed)` in build.
- `ctx`: `vw`, `vh`, `mobile` (vw < 760), `reduced`, `time`, `pointer {x, y, active}`, `dot` (the rendered dot),
  `state` (your scratch), `stage`, `el`.
- Interactive moments are allowed to hold state (e.g. the option a visitor clicked) — keep it in `ctx.state` and let
  `render` read it; scroll alone must still produce a complete, good-looking story for someone who never clicks.
- Focusable controls inside a stage get `data-p="<progress>"`: tabbing to one scrolls the story there.

### The dot API

`dot(p)` returns a partial state merged over these defaults:

| key | default | meaning |
|---|---|---|
| `x`, `y` | centre | viewport px of the dot's centre |
| `r` | 10 | core radius px |
| `color` | lime | any hex / `rgb()`; `mix(a, b, t)` blends |
| `glow` | 1 | halo + ground light strength (0 = no light at all, 2 = flare) |
| `halo` | 3 | halo radius as a multiple of r |
| `alpha` | 1 | opacity |
| `lean` | 1 | how much it glances at the pointer (0 when it must sit exactly on something) |
| `grab` | false | can be dragged and flung (springs back to its target) |
| `blink` | true | blinks (a quick squash) now and then when still |
| `lag` | 0.07 | seconds of smoothing toward the target; 0 = glued (use 0 when it rides a line or sits in a slot) |
| `stretch` | 1 | velocity squash-and-stretch |
| `sx`, `sy`, `rot` | 1, 1, 0 | explicit squash (landing, anticipation) |

The core adds breathing, blinking, pointer glances, drag/fling, a hop + ring on click, velocity stretch, a pool of light
on the ground, and dust. `ring(color)` sends one decorative ring out; `impulse(vx, vy)` kicks it (spring returns it).
Fire one-shots only when `p` crosses a threshold forward (remember the last p in `ctx.state`).
**Never draw a second copy of the dot.** If a beat needs more dots (a chart's other points, a queue's other status
lights), those are ordinary small elements, visibly *not* the hero dot (smaller, no halo, never lime).

## Chapters, owners, seams

| file prefix | id | len | release (hold) | rail title | owner |
|---|---|---|---|---|---|
| `000-hero` | hero | 0.9 | 0 (stays whole, scrolls away like the top of a page) | Prism | A |
| `010-questions` | questions | 2.25 | 0.9 | Questions | A |
| `020-wait` | wait | 1.65 | — | The wait | B |
| `030-number` | number | 2.7 | — | The number | B |
| `040-truth` | truth | 1.65 | — | The truth | B |
| `050-why` | why | 1.2 | — | Why Prism | C |
| `060-asks` | asks | 2.25 | 0.85 | It asks | C |
| `070-steps` | steps | 2.45 | 0.94 | Every step | D |
| `080-language` | language | 2.45 | 0.932 | Your language | D |
| `090-hands` | hands | 1.65 | 0.8 | Right hands | E |
| `100-minutes` | minutes | 2.65 | 0.945 | Minutes | E |
| `110-finale` | finale | 1.65 | (last: scrolls into the page after it) | Begin | F |
| `900-after` | (not a chapter: `<div class="after" id="after">`) | — | — | — | F |

These lengths are already 25 % under the chapters' original ones, the most the beats allow: don't shorten further.

**Seam contract.** At p = 0 every chapter shows **only the dot** on the dark ground, at the seam pose below, and builds
its content in from there. A releasing chapter stops at its `hold` with everything still on screen and lets the page
carry it away (its exit after `hold` never plays); any other chapter clears to the seam pose by p = 1, or hands its
last frame straight to the next chapter it shares an owner with — make that seam continuous.

| seam | between | pose |
|---|---|---|
| S1 | hero → questions | centre, r 10, lime, glow 1 |
| S2 | questions → wait | centre, r 10, lime, glow 1 |
| S5 | truth → why | centre, **r 6, grey `#8a8d84`, glow 0.25** (the dim dot: the moment is gone) |
| S7 | asks → steps | centre, r 10, lime, glow 1 |
| S9 | language → hands | centre, r 10, lime, glow 1 |
| S11 | minutes → finale | centre, r 10, lime, glow 1 |

"Centre" is `x: ctx.vw / 2, y: ctx.vh / 2`. Return exactly that at the seam p (no lean offsets: set `lean: 0` near seams).

## Direction per chapter

Copy in quotes is the line to use (tighten wording if you must, keep the meaning). Each chapter also gets a small
**chapter label** where noted: `<div class="chapter-label label"><b>01</b> Asks when it matters</div>`.

### A · hero (000) — home

At rest (p = 0, after the intro): centred composition. Eyebrow `ENTERPRISE AI ASSISTANT`. The PRISM wordmark, large
(`min(78vw, 880px)` wide on desktop), drawn from `src/motion/brand.js` (vector letters, each its own element; see "Brand"),
in `--ink`; **the hero dot sits on the `i`** — exactly at the wordmark's tittle, its radius scaled with the wordmark.
`<h1>`: "Answers you can check, not just answers." Lead (one sentence per line on desktop): "Ask your company data
anything in plain language. / A team of AI agents queries it live and traces every number to its source." CTAs: primary
"Open the playground →" (`https://demo.orapex.com/playground`), ghost "Watch how it thinks" (`#ch-questions`); under
them a small mono note: "No sign-up. All you need is your email."
"Watch how it thinks" plays the story by itself (`data-autoplay`, `src/motion/autoplay.js`): the page glides from beat
to beat and holds where there is something to read, through to the finale's end card (about 2 minutes untouched). A
note under the nav says so for a few seconds — "Playing · scroll or tap to take over" — and a wheel, a touch, a key, a
click anywhere or a drag of the scrollbar hands it straight back. The beats and their timings are one table at the top
of `autoplay.js`: when a chapter's beats move, move its stops there too.
A scroll cue at the bottom: mono `FOLLOW THE DOT` with a thin vertical line and a tiny (non-hero) dot sliding down it.

Intro (`intro(ctx)` returns a GSAP timeline, ~2.4 s, played once on load): the dot waits at the viewport centre (it is
already there during the loader); the letters draw on (stroke draw, staggered outward from the `i`); the `i` stem grows
up from the baseline; the dot dips (anticipation), arcs up and **lands on the tittle with a squash** (sx 1.3, sy 0.7)
and settles with a flare of glow (1.8 → 1). Then the eyebrow, h1 (lines rising out of masks), lead, CTAs, scroll cue.

Personality at rest: `grab: true` — visitors can pull the dot off the `i` and fling it; it springs home with a bounce
and the stem gives a tiny squash when it lands back (`on('dot:fling')`). `lean: 0.5`. After ~5 s idle on desktop, a
small mono hint fades in beside it: `psst — you can grab me` (once; gone on first scroll, drag or click).
A very subtle 3D tilt of the wordmark toward the pointer (±3°) is welcome.

Scroll: the hero now stays whole and scrolls away like the top of a page (`release: { hold: 0 }`); the dot lets go of
its `i` during the hand-off and settles at the centre. The original scroll-driven exit below only plays if the release
is taken out. Scroll 0 → 1: text and CTAs rise and fade; the letters drift apart and fade; the stem sinks; the dot gives an
anticipation squash, **lifts off the `i`** and travels (slight arc) to the centre, r growing to 10 → S1 pose.

### A · questions (010)

"Every company runs on questions." — then a fly-through: a 3D field of questions in Tajawal (sizes and depths vary)
streams toward the camera as you scroll; the dot, at the centre, **glances at each one as it passes** (bias its x/y a
little toward the nearest question). Use these: "How many orders arrived late?", "Which region is slowing down?",
"What should we do next?", "Why did returns spike in March?", "How did revenue compare to budget?", "Who are our best
customers?", "Which products drive margin?", "Which clients have overdue invoices?", "Where are we losing deals?",
"Which suppliers have the highest win rate?", "What did the promotion actually earn?", "Is churn getting worse?",
"Can I trust this data?" (four of them are the playground's example questions). Desktop pointer hover brightens a passing question and the dot looks at it.
Late in the chapter one question comes forward and stops at display size in the centre: "How many orders
arrived late?" — and **the dot becomes the dot of its question mark** (render the `?` with its own dot clipped off and park the
hero dot exactly where that dot was; calibrate against a screenshot). Over it, as it comes to rest, who asked it — a
sender line like a message header: initials in a small neutral circle, "Reem Al-Otaibi", "Head of Operations · asked
Monday, 09:12" (the same Monday 09:12 the ticket is filed in 020-wait). Then a lead line beneath: "The answers are
already in your data." Clear everything; dot back to the centre (S2).

### B · wait (020), number (030), truth (040) — the old way

Colours: greys; amber only for waiting; rose only for the wrong number. The dot is **not Prism** here — it is a
borrowed dot, so it is never lime (blend from lime to amber right after S2).

wait: The question becomes a request ticket — a desaturated old-school form/ticket card: `REQ-3127 · Q4 Delivery Report`,
"Late orders last quarter", "Assigned to: Data & Reporting", status `● In queue` — **the dot drops into the ticket as
its amber status light** (r ≈ 5, small glow, slow pulse). Around it, a queue of other people's tickets. Days pass as you
scroll: a mono counter `DAY 1 → DAY 9` and/or a calendar strip flipping. Headline beats: "But getting to them takes a
ticket," "a queue," "and nine days." (each phrase lands on its own beat).

number: "Nine days later, the report came back." A grey BI report page (`Q4 Delivery Report`, a small table, a footnote
`Definition: delivered_at > promised_date`). The figure **1,180** lifts out of the report to display size, with the dot
as its **full stop**: "1,180." (dot neutral ink-grey, not lime, not yet rose — it is believed). "So the year's plan was built on
it." — decision blocks stack onto the number like a tower (2027 budget · Carrier contracts: renewed · Delivery fixes: 1,180 orders ·
Revenue forecast · Board deck). Then the consequences: a revenue line runs across the screen and **the dot rides its
leading point** (`lag: 0`) as it falls, turning rose: "By spring, revenue was down 20%." "The board started doubting every
number." "Investors pulled back." "Every forecast became a guess." The tower trembles. (Cut for length: only "By spring,
revenue was down 20%." remains, and it lands on the tower as a single blow.)

truth: "The real number was 4,630." The 1,180 cracks and breaks apart (rose), 4,630 stands (ink). A short line:
"The report used 'the date we promised' as the deadline. Nobody asked what 'late' meant." Then: "One wrong number." / "A whole year
built on it." Everything falls away into darkness; the dot shrinks and dims to the S5 pose (r 6, grey, glow 0.25).

### C · why (050), asks (060) — the turn

why: Darkness, the dim grey dot, a held breath. "That's why we built Prism." As "Prism" lands, **the dot ignites**:
grey → lime, r 6 → 14 → 10, glow surges to ~2.2 and settles, a ring (`ring()`) or two, and the only spectrum in the
story: thin rays of prism light (red → violet, very soft) fanning from the dot for a moment. The ground light comes up.
This is the emotional peak — make it beautiful and brief. Then "Same Monday. Same question." as the bridge.

asks (label `01 — Asks when it matters`): a Prism thread (app-like card). The visitor's question types itself as you
scroll: "How many orders arrived late last quarter?". The dot becomes **Prism's thinking light** in the assistant's
slot, then a clarification card arrives: "Before I count — what does “late” mean for you?" with the readings and their
figures side by side: `After the requested date · 4,630`, `After the promised date · 1,180`,
`Over 48 hours in transit · 2,215`.
**The dot is the radio button**: it hops to the option that is chosen. Visitors can click an option (real `<button>`s);
if nobody has clicked by ~60 %, scroll selects "After the requested date". The answer follows the choice ("4,630 orders
arrived after the date the customer asked for." with a lime verified check / or the matching line for another choice). Beside it:
"It doesn't guess. It asks." and a lead: "When a question could mean two things, Prism works out every reading — then
asks, with the numbers side by side." Clear to S7.

### D · steps (070), language (080) — how it works

steps (label `02 — Shows every step`): "Every number traces back to a query you can read." A run graph: Plan →
Explore schema (orders, deliveries) → Write SQL → Run on your database → Review → Answer. **The dot travels the edges node
to node**, lighting each as it arrives (lime trail on edges). A side panel types the SQL (monospace, syntax-tinted, real
and correct):
```sql
SELECT COUNT(DISTINCT o.id) AS late_orders
FROM orders o
JOIN deliveries d ON d.order_id = o.id
WHERE d.delivered_at::date > o.requested_date
  AND d.delivered_at >= DATE '2026-10-01'
  AND d.delivered_at <  DATE '2027-01-01';
```
and the reviewer's note: "Matches validated values ✓". The nodes carry the agents' names: Lead analyst (Plan),
Explorer (the schema), Analyst (Write SQL), Reviewer (Review). Lead: "A team of AI agents explores,
analyzes and checks each other's work — and every step stays open to you." Hovering a node shows its detail.

language (label `03 — Learns your language`): two beats. (1) "It learns your business language before it answers."
Business terms on one side (late delivery · open order · net revenue · region) linked to columns on the other
(`deliveries.delivered_at`, `orders.status`, `invoices.amount`, `branches.region`) — **the dot draws each link**, travelling
from the term to its column. Then the Arabic beat, "Ask in English or Arabic.": a Prism thread in English (on
`ops_db · PostgreSQL`: "How many orders arrived late last quarter?", the agents reading `orders` and `deliveries`,
the answer "4,630 orders arrived after the date the customer asked for.") with an `EN | ع` switch on top — **the dot
is its knob** and flips it; a lime line sweeps the card right to left and, behind it, the same thread is in Arabic and
laid out right to left ("كم طلباً تأخّر الربع الماضي؟" … "4,630 طلباً وصلت بعد الموعد الذي حدده العميل."); the dot
leaves the switch its own knob and lands in the Arabic answer as its verified light. Lead: "The whole workspace turns
right to left, and the answer comes back in Arabic." (2) "It works on your data, right where it lives." with the lead
"Read-only. It never changes your data." under it. Database badges (Oracle,
SQL Server, PostgreSQL, MySQL, MongoDB — text badges with simple drawn glyphs, never trademarked logos) — **the dot visits
each**, a hairline connecting it. Clear to S9.

### E · hands (090), minutes (100) — trust and payoff

hands (label `04 — Right data, right hands`): "Every number stays in the right hands." A customer table (name, email,
phone, region, revenue). Role chips: `Analyst`, `Sales manager`, `Owner` — **the dot is the switch's knob**, sliding to
the selected role; masked cells (`•••• ••••`, or a soft scramble) change per role. Visitors can click a role; scroll
cycles roles otherwise. Lead: "Each role sees only what it should — decided field by field, before any answer is
written." (The audit trail card beside the table shows the record of every question.)

minutes (label `05 — Minutes, not weeks`): "Your question comes back as a dashboard, a report, a decision." The answer
expands into a dashboard: KPI tiles (`Late orders 4,630` with the dot landing in it as the **verified light**, revenue
at risk, routes to fix), a bar chart by region, a line — then a report page (show an Arabic report title as a
detail: "تقرير الطلبات المتأخرة"). Then the comparison: `Days` (grey, struck through) → `Minutes` (lime), no figures.
Finally: "And this time, the year goes to plan." — the revenue line from the old-way chapter, now holding and rising in
lime, **the dot riding its end point**. Clear to S11.

### F · finale (110) and after (900) — home again

finale: from the centre the dot rises; the PRISM wordmark draws in around it (the hero's landing, mirrored with a new
energy), the dot lands on the `i`. "Prism." / "Your all-in-one Enterprise AI Assistant." / "Bring your own question, and
watch how it thinks." CTAs: primary "Open the playground →", ghost "Visit orapex.com" (`https://orapex.com`). Byline:
the ORAPEX logo (`/assets/brand/orapex-logo-white.svg`, in `public/`) with "An ORAPEX Product". At p = 1 hold the final frame (it then
scrolls away with the page — core handles that, and the dot drifts down to a corner as the visitor's companion; clicking
it there scrolls home). `grab: true` once landed.

after (`src/components/chapters/After.tsx`, normal page flow, `<div class="after" id="after">`): (1) "Everything in one assistant"
("The parts the story didn't have time to show.") — 6 capability cards, only what the story does not already show:
click any number to see its rows, insights, documents, data reviews, cost and budgets, caveats (each card has a small
marker dot that lights lime when the card scrolls into view, staggered; IntersectionObserver, no core changes; the two
wide cards carry a small vignette), (2) a short FAQ of native `<details>` (SQL, databases, read-only, cost), (3) a
closing band "Ask your first question in under a minute." with a pill styled like an input whose placeholder types the
playground's example questions out in turn, and a lime "Try it in the playground" action that opens the playground (it
must not pretend to send the typed text anywhere), (4) the footer: small wordmark, "An ORAPEX Product", links
(Playground, orapex.com, back to top), KSA · UAE · USA · © 2026 ORAPEX.

## Brand (`src/motion/brand.js`)

```js
import { WORDMARK, wordmarkSVG } from '../brand.js'
// WORDMARK.viewBox  - '0 0 898 251' (the artwork's own coordinates)
// WORDMARK.dot      - { cx, cy, r } of the tittle in viewBox units (the hero dot's home; scale r with the svg)
// WORDMARK.halo     - halo radius in viewBox units
// wordmarkSVG({ className }) -> an <svg> with one <g class="wm-letter wm-P|R|I|S|M"> per letter; P R S M are
//   stroked centre-line paths with pathLength="1" (draw-on via stroke-dashoffset), the I stem is a filled <rect class="wm-stem">;
//   colour = currentColor; no dot drawn (the hero dot is the dot).
// tittleAt(svg) -> { x, y, r } viewport px of the tittle for an svg on screen (call in layout(), after transforms reset)
```

## Rules

- Write only your own files: `src/components/chapters/<Name>Chapter.tsx`, `src/styles/chapters/<prefix>-<id>.css`,
  `src/motion/chapters/<prefix>-<id>.js` (plus small chapter-local helper modules named
  `src/motion/chapters/<prefix>-<id>.*.js` if needed). Never edit `src/motion/core.js`, `src/styles/base.css`,
  `src/app/*`, `src/components/Story.tsx`, `tools/*`, or another owner's files. If you need something from the core,
  say so in your final report.
- Prefix every class you define with your chapter id (`.asks-card`, `.asks-opt`) so styles never collide.
- No external requests (no CDNs, no web fonts beyond the local ones, no images from the web).
- Desktop **and** phone: every chapter must look intentional at 1440×900, 1280×720 and 390×844 (portrait: single
  column, smaller type, the dot's poses adapted). No text may overflow or overlap unintentionally.
- Reduced motion (`ctx.reduced`): still renders from `p`, but no idle `tick` loops, no big parallax, no auto-typing loops.
- Accessibility: real text in the DOM, a sensible heading order (hero `h1`, chapters `h2`), decorative layers
  `aria-hidden="true"`, interactive controls are `<button>`s with clear labels, visible focus.

## Verify your own work (required)

With `npm run dev` running, `npm run shot -- --at <id>:0,0.1,0.2,…,1 --size 1440x900 --out .shots/<you> --sheet <id>-desk`
prints PNG paths (Read them — you can see images) and any console errors (`--url` points it at another server). Repeat with `--size 390x844` (and `1280x720`). `--pointer x,y`
puts the mouse somewhere; `--eval "js"` runs code before each shot; `--wait ms` waits longer (default 900 — the dot's
smoothing needs ~400 ms to settle). Look at every frame like a director: composition, hierarchy, contrast, overlap,
the dot's role. Fix and re-shoot until each frame is something you would put on a showreel. The run must end with
`no console errors`. Other owners are building their chapters at the same time; ignore their chapters' problems.
