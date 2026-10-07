// Screenshot the landing page at chosen story positions, headless, from a running
// server (`npm run dev`, or `npm run build && npm start`).
//
//   node tools/shot.mjs --at hero:0,0.5,1 questions:0.3 [--size 1440x900] [--size 390x844]
//                       [--url http://localhost:3000/]   the page to load (default shown)
//                       [--out .shots/mine] [--wait 900] [--pointer 700,420] [--dpr 1]
//                       [--sheet NAME]   also write NAME.png: every shot in one contact sheet
//                       [--all 0,0.25,0.5,0.75,1]   every chapter at these progresses
//                       [--reduced]      emulate prefers-reduced-motion
//                       [--eval "js"]    run JS in the page before each shot (after scrolling)
//
// Prints one line per PNG, then any console errors / page errors, so a run
// that throws is never mistaken for a clean one. Files: <out>/<size>/<id>-<p>.png
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const require_ = (await import('node:module')).createRequire(import.meta.url)
let chromium
for (const p of [path.join(root, 'node_modules/playwright-core'), 'playwright-core']) {
  try {
    ;({ chromium } = require_(p))
    break
  } catch {}
}
if (!chromium) {
  console.error('playwright-core not found: run `npm install` first')
  process.exit(2)
}

const args = process.argv.slice(2)
const opt = { url: 'http://localhost:3000/', at: [], sizes: [], out: '.shots/default', wait: 900, pointer: null, dpr: 1, sheet: null, all: null, reduced: false, eval: null }
for (let i = 0; i < args.length; i++) {
  const a = args[i]
  if (a === '--at') while (args[i + 1] && !args[i + 1].startsWith('--')) opt.at.push(args[++i])
  else if (a === '--url') opt.url = args[++i]
  else if (a === '--size') opt.sizes.push(args[++i])
  else if (a === '--out') opt.out = args[++i]
  else if (a === '--wait') opt.wait = Number(args[++i])
  else if (a === '--pointer') opt.pointer = args[++i].split(',').map(Number)
  else if (a === '--dpr') opt.dpr = Number(args[++i])
  else if (a === '--sheet') opt.sheet = args[++i]
  else if (a === '--all') opt.all = args[++i].split(',').map(Number)
  else if (a === '--reduced') opt.reduced = true
  else if (a === '--eval') opt.eval = args[++i]
}
if (!opt.sizes.length) opt.sizes.push('1440x900')

const CHROME = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
].find((p) => fs.existsSync(p))

const browser = await chromium.launch({
  executablePath: CHROME,
  headless: true,
  args: ['--hide-scrollbars', '--force-color-profile=srgb', '--enable-gpu-rasterization', '--ignore-gpu-blocklist'],
})
const errors = []
const shots = []
try {
  for (const size of opt.sizes) {
    const [w, h] = size.split('x').map(Number)
    const mobile = w < 760
    const context = await browser.newContext({
      viewport: { width: w, height: h },
      deviceScaleFactor: opt.dpr,
      isMobile: mobile,
      hasTouch: mobile,
      reducedMotion: opt.reduced ? 'reduce' : 'no-preference',
    })
    const page = await context.newPage()
    page.on('console', (m) => {
      if (m.type() === 'error' || m.type() === 'warning') errors.push(`[${size}] console.${m.type()}: ${m.text()}`)
    })
    page.on('pageerror', (e) => errors.push(`[${size}] pageerror: ${e.message}`))
    page.on('requestfailed', (r) => errors.push(`[${size}] requestfailed: ${r.url()} ${r.failure()?.errorText}`))
    await page.goto(opt.url, { waitUntil: 'load' })
    await page.waitForFunction(() => document.documentElement.classList.contains('is-ready'), null, { timeout: 15000 })
    await page.waitForTimeout(opt.reduced ? 300 : 2600) // let the hero intro play

    let targets = opt.at.flatMap((spec) => {
      const [id, ps] = spec.split(':')
      return (ps ?? '0').split(',').map((p) => ({ id, p: Number(p) }))
    })
    if (opt.all) {
      const chs = await page.evaluate(() => window.PRISM.chapters())
      targets = targets.concat(chs.flatMap((c) => opt.all.map((p) => ({ id: c.id, p }))))
    }
    if (opt.pointer) await page.mouse.move(opt.pointer[0], opt.pointer[1])

    const dir = path.join(root, opt.out, size)
    fs.mkdirSync(dir, { recursive: true })
    for (const t of targets) {
      const ok = await page.evaluate(({ id, p }) => {
        const c = window.PRISM.chapters().find((x) => x.id === id)
        if (!c) return false
        // approach from a little before, so anything velocity-based settles naturally
        window.PRISM.go(id, Math.max(0, p - 0.004), { immediate: true })
        return true
      }, t)
      if (!ok) {
        errors.push(`[${size}] no chapter "${t.id}"`)
        continue
      }
      await page.waitForTimeout(60)
      await page.evaluate(({ id, p }) => window.PRISM.go(id, p, { immediate: true }), t)
      if (opt.eval) await page.evaluate(opt.eval)
      if (opt.pointer) await page.mouse.move(opt.pointer[0] + 1, opt.pointer[1])
      await page.waitForTimeout(opt.wait)
      const file = path.join(dir, `${t.id}-${t.p.toFixed(3)}.png`)
      await page.screenshot({ path: file })
      shots.push({ file, label: `${t.id} @ ${t.p} · ${size}`, w, h })
      console.log(path.relative(root, file).replaceAll('\\', '/'))
    }
    await context.close()
  }

  if (opt.sheet && shots.length) {
    const cols = shots[0].w < 760 ? 6 : 4
    const cellW = shots[0].w < 760 ? 260 : 480
    const page = await browser.newPage({ viewport: { width: cols * (cellW + 12) + 12, height: 400 } })
    const cells = shots
      .map((s) => `<figure><img src="data:image/png;base64,${fs.readFileSync(s.file).toString('base64')}"><figcaption>${s.label}</figcaption></figure>`)
      .join('')
    await page.setContent(`<style>body{margin:0;background:#222;padding:12px;display:grid;grid-template-columns:repeat(${cols},${cellW}px);gap:12px;font:12px monospace;color:#ddd}figure{margin:0}img{width:100%;display:block;border:1px solid #444}figcaption{padding:4px 0}</style>${cells}`)
    await page.waitForTimeout(200)
    const file = path.join(root, opt.out, `${opt.sheet}.png`)
    await page.screenshot({ path: file, fullPage: true })
    console.log(path.relative(root, file).replaceAll('\\', '/'))
  }
} finally {
  await browser.close()
}
if (errors.length) {
  console.log(`\n${errors.length} problem(s):`)
  for (const e of [...new Set(errors)]) console.log('  ' + e)
} else console.log('\nno console errors')
