// Read the colours of a few pixels in a screenshot - for placing the dot exactly on a glyph.
//   node tools/px.mjs .shots/default/1440x900/questions-0.820.png "[[930,480],[940,486]]"
// Prints [[x, y, [r, g, b]], ...]. Needs a local Chrome.
import fs from 'node:fs'
import { createRequire } from 'node:module'
const { chromium } = createRequire(process.cwd() + '/')('playwright-core')
const b = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' })
const p = await b.newPage()
const img = fs.readFileSync(process.argv[2]).toString('base64')
const pts = JSON.parse(process.argv[3])
const out = await p.evaluate(async ({ img, pts }) => {
  const i = new Image(); i.src = 'data:image/png;base64,' + img; await i.decode()
  const c = document.createElement('canvas'); c.width = i.width; c.height = i.height
  const g = c.getContext('2d'); g.drawImage(i, 0, 0)
  return pts.map(([x, y]) => [x, y, Array.from(g.getImageData(x, y, 1, 1).data.slice(0, 3))])
}, { img, pts })
console.log(JSON.stringify(out)); await b.close()
