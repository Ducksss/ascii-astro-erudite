// Regenerates the social card and README previews from the current design.
// Run after a production build: npm run build && npx tsx scripts/capture-previews.ts
import { copyFileSync, mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { preview } from 'astro'
import { chromium } from 'playwright'
import { LANDING } from '../src/consts'
import { renderCached } from '../src/lib/ascii'

const root = fileURLToPath(new URL('../', import.meta.url))
const file = (path: string) => `file://${join(root, path)}`
const output = (name: string) => join(root, 'public/static', name)

const duck = renderCached({
  object: 'duck',
  cols: 112,
  rows: 58,
  zoom: 0.92,
  offsetX: 0.04,
  samples: [2, 3],
  trails: { density: 0.4, length: 46, side: 'left' },
}).html

const card = `<!doctype html>
<meta charset="utf-8" />
<style>
  @font-face { font-family: 'Space Grotesk'; src: url('${file('node_modules/@fontsource-variable/space-grotesk/files/space-grotesk-latin-wght-normal.woff2')}'); font-weight: 300 700; }
  @font-face { font-family: 'Geist Mono'; src: url('${file('public/fonts/GeistMonoVF.woff2')}'); font-weight: 100 900; }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { width: 1200px; height: 630px; overflow: hidden; background: #202ce3; color: #fff; font-family: 'Space Grotesk'; position: relative; }
  .label { position: absolute; top: 46px; left: 56px; right: 56px; display: flex; justify-content: space-between; font: 13px/1 'Geist Mono'; letter-spacing: .05em; text-transform: uppercase; }
  .rule { position: absolute; top: 78px; left: 56px; right: 56px; height: 1px; background: radial-gradient(circle, rgb(255 255 255 / .6) .6px, transparent .9px) 0 50% / 6px 3px repeat-x; }
  h1 { position: absolute; top: 104px; left: 50px; right: 56px; font-weight: 300; font-size: 116px; line-height: .92; letter-spacing: -.05em; }
  h1 span { display: block; } h1 span + span { text-align: right; }
  pre { position: absolute; left: -10px; bottom: -36px; font: 500 6.1px/1 'Geist Mono'; letter-spacing: 0; font-variant-ligatures: none; }
  pre i { font-style: normal; } .a1 { color: rgb(255 255 255 / .3); } .a2 { color: rgb(255 255 255 / .54); } .a3 { color: rgb(255 255 255 / .8); }
  .frame { position: absolute; left: 42px; bottom: 34px; width: 14px; height: 210px; border: 1px solid rgb(255 255 255 / .62); border-right: 0; }
  .frame--right { left: 404px; bottom: 58px; height: 120px; border: 1px solid rgb(255 255 255 / .62); border-left: 0; }
  .lede { position: absolute; left: 640px; top: 400px; width: 470px; font-weight: 300; font-size: 30px; line-height: 1.12; letter-spacing: -.03em; }
  .tree { position: absolute; left: 640px; top: 506px; font: 12px/1.75 'Geist Mono'; letter-spacing: .05em; text-transform: uppercase; color: rgb(255 255 255 / .8); }
  .tree p { color: #fff; } .tree li { list-style: none; display: flex; gap: 8px; } .tree li::before { content: ''; width: 11px; height: 7px; margin-top: 3px; border-left: 1px solid; border-bottom: 1px solid; }
  .tag { position: absolute; left: 70px; top: 352px; background: #fff; color: #101010; padding: 6px 8px 5px; font: 11px/1 'Geist Mono'; letter-spacing: .05em; text-transform: uppercase; }
</style>
<div class="label"><span>Chai Pin Zheng / Product engineer</span><span>chai-pin-zheng.xyz</span></div>
<div class="rule"></div>
<h1><span>Complex systems,</span><span>made human.</span></h1>
<pre aria-hidden="true">${duck}</pre>
<span class="frame"></span><span class="frame frame--right"></span>
<span class="tag">Rubber duck debugging</span>
<p class="lede">${LANDING.manifesto}</p>
<div class="tree"><p>Singapore / NUS Computer Science</p><ul><li>Product Engineer at Reactor School</li><li>Payload Components maintainer</li><li>Community and client projects</li></ul></div>`

const browser = await chromium.launch()
try {
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 } })
  const html = join(mkdtempSync(join(tmpdir(), 'social-card-')), 'card.html')
  writeFileSync(html, card)
  await page.goto(`file://${html}`)
  await page.evaluate(() => document.fonts.ready)
  await page.screenshot({ path: output('1200x630.png') })
  copyFileSync(output('1200x630.png'), output('twitter-card.png'))

  const server = await preview({
    configFile: false,
    root,
    server: { host: '127.0.0.1', port: 0 },
    logLevel: 'silent',
  })
  try {
    const site = await browser.newPage({
      viewport: { width: 1440, height: 1000 },
      reducedMotion: 'reduce',
    })
    for (const [path, name] of [
      ['/', 'readme-home.png'],
      ['/about', 'readme-about.png'],
      ['/blog', 'readme-blog.png'],
    ]) {
      await site.goto(`http://127.0.0.1:${server.port}${path}`, {
        waitUntil: 'networkidle',
      })
      await site.evaluate(() => document.fonts.ready)
      await site.screenshot({ path: output(name) })
    }
  } finally {
    await server.stop()
  }
} finally {
  await browser.close()
}
