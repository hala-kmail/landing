# PRISM landing page (Next.js)

The PRISM scroll story — a film you scroll, told by the dot over the `i` — as a Next.js
(App Router) app. It began as a static HTML/CSS/JS site; the port kept the same markup,
styles and motion, checked element by element and frame by frame.

The design contract (the story, the colour rules, the dot's API and roles, how scenes hand
over to each other) is `SPEC.md`. Read it before changing a chapter.

## Run it

```bash
npm install
npm run dev          # http://localhost:3000
```

```bash
npm run build && npm start     # the production build
npm run lint
```

## How it is put together

- `src/app/layout.tsx` - the document: metadata, the font preloads, every stylesheet in story
  order, and a tiny inline script that marks `<html>` as `.js` before the first paint (the
  story's stylesheets lay scenes out as fixed layers only under `.js`; without scripts the
  page reads top to bottom).
- `src/app/page.tsx` - the page: nav, the chapters in order, and `<Story />`.
- Each chapter is three files that share its name:
  - `src/components/chapters/<Name>Chapter.tsx` - its markup (server-rendered, static),
  - `src/styles/chapters/NNN-id.css` - its styles,
  - `src/motion/chapters/NNN-id.js` - its motion.

  The class names and `data-*` attributes in the markup are what the styles and the motion
  look for: change them together.
- `src/motion/core.js` - the runtime: scroll progress per chapter, the fixed stages and the
  hand-off between them, the dot (breathing, blinking, glancing at the pointer, drag and
  fling), the ambient light and dust, the chapter rail, the corner companion. Plain DOM code.
- `src/components/Story.tsx` - the one client component. After hydration it imports the
  motion modules (each registers itself against the markup) and starts the core, once.
- `src/motion/autoplay.js` - "Watch how it thinks": the story plays itself from beat to beat
  until the visitor scrolls, taps or presses a key. Its beats and timings are one table.
- `src/motion/brand.js` - the PRISM wordmark as vector letters, and where the tittle sits.
- Themes: light is the default, the original dark film is the alternative. `src/styles/base.css` holds both
  (`:root` and `:root[data-theme='dark']`); `src/components/ThemeToggle.tsx` is the switch in the nav and saves the
  choice (`prism-theme` in localStorage), and the head script in `layout.tsx` applies a saved dark theme before the
  first paint. The system's dark-mode setting is deliberately ignored. See "Look" in `SPEC.md`.
- `public/assets/` - fonts and brand files, served from `/assets/...`.

GSAP and Lenis come from npm (`gsap`, `lenis`). The page renders nothing on the client
through React state, so React never re-renders the markup the motion code animates.

## Screenshots

`tools/shot.mjs` takes headless screenshots at any story position from a running server
(needs a local Chrome or Edge):

```bash
npm run shot -- --at asks:0,0.5,1 --size 1440x900 --size 390x844 --sheet asks
npm run shot -- --url http://localhost:3001/ --all 0.3,0.6 --out .shots/prod
npm run shot -- --theme dark --at why:0.5 --size 1440x900   # the dark theme
```

## Deploy

- **Vercel or any Node host:** `npm run build`, then `npm start`.
- **A static host (nginx, S3, Netlify...):** add `output: "export"` to `next.config.ts`;
  `npm run build` then writes the whole site to `out/` as plain files. Serve it from the
  site root, or set `basePath` in `next.config.ts` to serve it from a sub-path.
