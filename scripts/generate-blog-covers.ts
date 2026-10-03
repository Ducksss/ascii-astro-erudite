// Regenerate the blog's text-rendered artwork: npx tsx scripts/generate-blog-covers.ts
import assert from 'node:assert/strict'
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { chromium } from 'playwright'
import { renderCached, type AsciiRenderOptions } from '../src/lib/ascii'

const root = fileURLToPath(new URL('../', import.meta.url))
const temp = mkdtempSync(join(tmpdir(), 'blog-covers-'))
const file = (path: string) => pathToFileURL(join(root, path)).href
const escape = (text: string) =>
  text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
const art = (text: string, style: string, className = '') =>
  `<pre data-art class="${className}" style="${style}">${escape(text)}</pre>`
const sculpture = (options: AsciiRenderOptions, style: string) => {
  const { frame, html } = renderCached(options)
  assert.equal(frame.glyphs.length, options.rows)
  assert(frame.glyphs.every((row) => row.length === options.cols))
  assert(
    frame.levels.filter(Boolean).length > options.cols * options.rows * 0.08,
  )
  return `<pre data-art class="sculpture" style="${style}">${html}</pre>`
}

// These are glyph fields, not raster filters; every mark is a real text cell.
const sun = Array.from({ length: 30 }, (_, row) =>
  Array.from({ length: 62 }, (_, col) => {
    const x = (col - 30.5) * 0.6
    const y = row - 14
    const distance = Math.hypot(x, y)
    if (row === 22) return '-'
    if (row > 22) return (col + row * 3) % 19 < 7 && row % 3 === 1 ? '~' : ' '
    if (distance > 13) return ' '
    const shade = Math.max(
      0,
      Math.min(4, Math.floor((13 - distance + x / 3) / 3)),
    )
    return '.:+#@'[shade]
  }).join(''),
).join('\n')

const leaf = Array.from({ length: 23 }, (_, row) =>
  Array.from({ length: 54 }, (_, col) => {
    const x = (col - 27) * 0.6
    const y = row - 11
    const along = x * 0.82 - y * 0.57
    const across = x * 0.57 + y * 0.82
    const edge = (along / 13) ** 2 + (across / 4.8) ** 2
    if (edge > 1) return ' '
    if (Math.abs(across) < 0.35) return '/'
    return '.:+#@'[Math.min(4, Math.floor((1 - edge) * 5))]
  }).join(''),
).join('\n')

const route = Array.from({ length: 25 }, (_, row) =>
  Array.from({ length: 48 }, (_, col) => {
    const path = 24 + Math.sin(row * 0.24) * 14
    if (col === Math.round(path))
      return row < 3 ? '^' : [4, 10, 17, 23].includes(row) ? 'O' : '+'
    const contour = Math.hypot((col - 7) * 0.6, (row - 16) * 1.1)
    return Math.abs((contour % 5) - 2.5) < 0.28 ? '.' : ' '
  }).join(''),
).join('\n')

const covers = [
  {
    slug: 'beacon',
    title: 'Beacon',
    theme: 'paper',
    label: 'COMMUNICATION / TELEGRAM',
    html: `<h1 style="left:64px;top:90px">Beacon</h1>
      <p class="note" style="left:746px;top:101px">One message.<br>Several house chats.</p>
      ${art(
        `                            +----------------+
                    +------>|   HOUSE / 01   |
                    |       +----------------+
   +------------+   |
   |            |   |       +----------------+
   |  COMPOSE   |---+------>|   HOUSE / 02   |
   |            |   |       +----------------+
   +------------+   |
                    |       +----------------+
                    +------>|   HOUSE / 03   |
                            +----------------+`,
        'left:76px;top:239px;font-size:23px;line-height:1.22',
        'blue',
      )}
      <p class="caption" style="left:80px;top:555px">01 MESSAGE &nbsp; / &nbsp; 03 DESTINATIONS</p>`,
  },
  {
    slug: 'metalearner',
    title: 'MetaLearner',
    theme: 'ink',
    label: 'FORECASTING / INTERACTION',
    html: `<h1 style="left:64px;top:87px;font-size:83px">MetaLearner</h1>
      <p class="note" style="left:743px;top:98px">A shape to see.<br>A point to inspect.</p>
      <p class="caption" style="left:83px;top:225px">OVERVIEW</p>
      ${sculpture({ object: 'bars', cols: 68, rows: 34, zoom: 0.96, samples: [2, 3], ramp: '.:+*#@', trails: false }, 'left:53px;top:271px;font-size:9px;line-height:1')}
      <p class="caption" style="left:571px;top:225px">INSPECT</p>
      ${art(
        `   |
   |                    . :
   |                 . :   :
   |              . :       : .
   |         .---[+]          :
   |      .-'     |
   |   .-'        |
   |.-'           |
   +--------------+---------------->
                  |
             THIS POINT`,
        'left:562px;top:282px;font-size:23px;line-height:1.12',
      )}
      <p class="caption" style="left:80px;top:563px">MAKE THE CHART ANSWER BACK.</p>`,
  },
  {
    slug: 'daybreak',
    title: 'Daybreak',
    theme: 'blue',
    label: 'ANDROID / FOCUS',
    html: `<p class="caption" style="left:70px;top:147px">A MOMENT TO YOURSELF</p>
      <p style="position:absolute;left:65px;top:208px;font:300 94px/1 'Geist Mono';letter-spacing:-.07em">00:00</p>
      <p class="note" style="left:72px;top:321px">Start. Pause. Finish.</p>
      ${art(sun, 'left:518px;top:79px;font-size:15px;line-height:1', 'sun')}
      <h1 style="left:65px;top:456px;font-size:85px">Daybreak</h1>
      <p class="caption" style="left:729px;top:553px">MAKE ROOM FOR CALM.</p>`,
  },
  {
    slug: 'ecocart',
    title: 'EcoCart',
    theme: 'paper',
    label: 'BROWSER / SHOPPING',
    html: `<h1 style="left:64px;top:92px">EcoCart</h1>
      ${art(leaf, 'left:218px;top:178px;font-size:14px;line-height:1', 'blue')}
      ${art(
        `  ____
      \\
       \\  +-----------------------+
        \\ |                       |
         \\|                       |
          \\                       |
           +-----------------------+
            \\____________________/
             \\
              +-------------------+
                 (O)         (O)`,
        'left:80px;top:286px;font-size:23px;line-height:1.05',
      )}
      <p class="note" style="left:777px;top:252px;font-size:42px;line-height:1.14">What does<br>this choice<br>cost?</p>
      <p class="caption" style="left:80px;top:563px">INFORMATION AT THE MOMENT OF CHOICE.</p>`,
  },
  {
    slug: 'safesteps-agewell',
    title: 'SafeStep',
    theme: 'paper',
    label: 'CARE / COMPUTER VISION',
    html: `<h1 style="left:64px;top:92px">SafeStep</h1>
      <p class="note" style="left:725px;top:105px">What was seen?<br>What do we know?</p>
      ${art(
        `+------------------+       +------------------+
|                  |       |                  |
|     DETECTED     |---?-->|     VERIFIED     |
|                  |       |                  |
+------------------+       +------------------+
         |                          |
         v                          v
      [event]                 [care record]`,
        'left:92px;top:260px;font-size:26px;line-height:1.16',
        'blue',
      )}
      <p class="note" style="left:91px;top:546px;font-size:30px">A detection is not a fact.</p>`,
  },
  {
    slug: 'saf-journey',
    title: 'National service',
    theme: 'ink',
    label: 'PERSONAL / NATIONAL SERVICE',
    html: `<h1 style="left:64px;top:120px;font-size:87px;line-height:.99">National<br>service</h1>
      <p class="note" style="left:72px;top:358px;font-size:29px">Learning to live with<br>other people's trust.</p>
      <pre data-art style="left:615px;top:115px;font-size:18px;line-height:1">${escape(route).replaceAll('.', '<i class="a1">.</i>')}</pre>
      <p class="caption" style="left:983px;top:80px">N / ^</p>
      <p style="position:absolute;left:72px;top:532px;font:500 28px/1.3 'Geist Mono'">ENLIST &gt; BMT &gt; OCS &gt; LEAD</p>
      <p class="caption" style="left:782px;top:586px;font-size:18px">04 JUL 2023 / 05 MAY 2025</p>`,
  },
  {
    slug: 'why-i-built-payload-kits',
    title: 'Payload Components',
    theme: 'blue',
    label: 'OPEN SOURCE / PAYLOAD CMS',
    html: `<h1 style="left:63px;top:100px;font-size:76px;line-height:.98">Payload<br>Components</h1>
      ${art(
        `config
  |
  +--- types
  |
  +--- renderer`,
        'left:78px;top:321px;font-size:28px;line-height:1.28',
      )}
      ${sculpture({ object: 'chain', cols: 91, rows: 44, zoom: 1.03, samples: [2, 3], ramp: '.:+*#@', trails: false }, 'left:531px;top:111px;font-size:11px;line-height:1')}
      <p class="caption" style="left:77px;top:563px">THE BLOCK IS ONLY HALF THE JOB.</p>`,
  },
]

const browser = await chromium.launch()
try {
  const page = await browser.newPage({
    viewport: { width: 1200, height: 630 },
    deviceScaleFactor: 1,
  })
  for (const [index, cover] of covers.entries()) {
    const html = `<!doctype html><html><head><meta charset="utf-8"><title>${cover.title}</title>
      <style>
      @font-face { font-family: 'Space Grotesk'; src: url('${file('node_modules/@fontsource-variable/space-grotesk/files/space-grotesk-latin-wght-normal.woff2')}'); font-weight: 300 700; }
      @font-face { font-family: 'Geist Mono'; src: url('${file('public/fonts/GeistMonoVF.woff2')}'); font-weight: 100 900; }
      * { box-sizing: border-box; margin: 0; padding: 0; }
      body { width: 1200px; height: 630px; overflow: hidden; position: relative; font-family: 'Space Grotesk'; background: #f6f6f6; color: #101010; }
      body.ink { background: #101010; color: #f6f6f6; }
      body.blue { background: #202ce3; color: #f6f6f6; }
      header { position: absolute; left: 68px; top: 39px; right: 68px; display: flex; justify-content: space-between; font: 500 16px/1 'Geist Mono'; letter-spacing: .02em; }
      h1 { position: absolute; font-size: 91px; font-weight: 400; letter-spacing: -.055em; line-height: 1; }
      pre { position: absolute; font-family: 'Geist Mono'; font-weight: 500; font-variant-ligatures: none; letter-spacing: 0; white-space: pre; }
      pre.blue { color: #202ce3; }
      .note { position: absolute; font-size: 32px; line-height: 1.2; letter-spacing: -.025em; }
      .caption { position: absolute; font: 500 22px/1.2 'Geist Mono'; letter-spacing: 0; }
      i { font-style: normal; }
      .a1 { opacity: .48; } .a2 { opacity: .68; } .a3 { opacity: .86; }
      </style></head><body class="${cover.theme}">
      <header><span>${cover.label}</span><span>CHAI PIN ZHENG / ${String(index + 1).padStart(2, '0')}</span></header>
      ${cover.html}</body></html>`
    const htmlPath = join(temp, `${cover.slug}.html`)
    writeFileSync(htmlPath, html)
    await page.goto(pathToFileURL(htmlPath).href)
    await page.evaluate(() => document.fonts.ready)
    const rendered = await page.evaluate(() => ({
      width: document.body.offsetWidth,
      height: document.body.offsetHeight,
      fontLoaded:
        document.fonts.check('16px "Geist Mono"') &&
        document.fonts.check('16px "Space Grotesk"'),
      glyphs: [...document.querySelectorAll('pre')].reduce(
        (sum, node) => sum + (node.textContent ?? '').replace(/\s/g, '').length,
        0,
      ),
      overflow: [...document.querySelectorAll('h1, p, pre, header')]
        .filter((node) => {
          const box = node.getBoundingClientRect()
          return (
            box.left < 0 || box.top < 0 || box.right > 1201 || box.bottom > 631
          )
        })
        .map((node) => node.textContent?.trim().slice(0, 30)),
    }))
    assert.deepEqual([rendered.width, rendered.height], [1200, 630])
    assert(rendered.fontLoaded, `${cover.slug}: fonts did not load`)
    assert(rendered.glyphs > 80, `${cover.slug}: artwork is empty`)
    assert.deepEqual(rendered.overflow, [], `${cover.slug}: cropped content`)
    const output = join(root, 'src/content/blog', cover.slug, 'cover.png')
    await page.screenshot({ path: output })
    const png = readFileSync(output)
    assert.equal(png.readUInt32BE(16), 1200)
    assert.equal(png.readUInt32BE(20), 630)
    assert(png.byteLength > 10_000, `${cover.slug}: unexpectedly empty PNG`)
    console.log(`${cover.slug}/cover.png`)
  }
  // Untracked review contact sheet, including one cover at phone-sized width.
  const gallery = join(temp, 'gallery.html')
  writeFileSync(
    gallery,
    `<!doctype html><style>*{margin:0;box-sizing:border-box}body{background:#ddd;display:grid;grid-template-columns:600px 600px;gap:1px}img{display:block;width:600px;height:315px}</style>${covers.map((cover) => `<img src="${file(`src/content/blog/${cover.slug}/cover.png`)}">`).join('')}`,
  )
  await page.setViewportSize({ width: 1201, height: 1263 })
  await page.goto(pathToFileURL(gallery).href)
  await page.screenshot({ path: join(temp, 'montage.png') })
  await page.setViewportSize({ width: 390, height: 1436 })
  await page.addStyleTag({
    content:
      'body{grid-template-columns:390px;gap:0}img{width:390px;height:204.75px}',
  })
  await page.screenshot({ path: join(temp, 'mobile.png') })
  console.log(`Review: ${join(temp, 'montage.png')}`)
  console.log(`Phone: ${join(temp, 'mobile.png')}`)
} finally {
  await browser.close()
}
