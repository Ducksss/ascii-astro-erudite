import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { fileURLToPath } from 'node:url'
import { preview } from 'astro'
import { chromium } from 'playwright'

test('TOC survives navigation and the ASCII playground renders and exports', async () => {
  const server = await preview({
    configFile: false,
    root: fileURLToPath(new URL('../', import.meta.url)),
    server: { host: '127.0.0.1', port: 0 },
    logLevel: 'silent',
  })
  let browser

  try {
    browser = await chromium.launch()
    const page = await browser.newPage()
    page.setDefaultTimeout(5000)
    const errors = []
    page.on('pageerror', (error) => errors.push(error.message))
    const base = `http://127.0.0.1:${server.port}`
    await page.goto(`${base}/blog/metalearner`)
    const headingId = await page.locator('.prose h2').first().getAttribute('id')

    for (const width of [1440, 390]) {
      await page.setViewportSize({ width, height: 900 })
      await page.evaluate(() => {
        const heading = document.querySelector('.prose h2')
        window.scrollTo({
          top: heading.getBoundingClientRect().top + scrollY - 170,
          behavior: 'instant',
        })
      })
      const selector =
        width === 1440
          ? `#toc-sidebar-container [data-heading-link="${headingId}"]`
          : `#mobile-table-of-contents [data-heading-id="${headingId}"]`
      await page.waitForFunction(
        (selector) =>
          document
            .querySelector(selector)
            ?.classList.contains('text-foreground'),
        selector,
      )
    }

    await page.setViewportSize({ width: 1440, height: 900 })
    await page.evaluate(() => {
      window.__tocDocument = true
      const add = EventTarget.prototype.addEventListener
      EventTarget.prototype.addEventListener = function (
        type,
        listener,
        options,
      ) {
        if (
          this instanceof Element &&
          this.matches('.mobile-toc-item') &&
          type === 'click'
        ) {
          this.dataset.tocRegistrations = String(
            Number(this.dataset.tocRegistrations || 0) + 1,
          )
        }
        return add.call(this, type, listener, options)
      }
    })
    for (const path of [
      '/blog/metalearner/onboarding',
      '/blog/metalearner',
      '/blog/metalearner/onboarding',
      '/blog/metalearner',
    ]) {
      await page.locator(`main a[href="${path}"]`).first().click()
      await page.waitForURL(`${base}${path}`)
      assert.equal(await page.evaluate(() => window.__tocDocument), true)
      const registrations = await page.waitForFunction(() => {
        const counts = [...document.querySelectorAll('.mobile-toc-item')].map(
          (link) => Number(link.dataset.tocRegistrations),
        )
        return counts.length && counts.every((count) => count > 0)
          ? counts
          : false
      })
      assert.equal(
        Math.max(...(await registrations.jsonValue())),
        1,
        'TOC click handlers were duplicated',
      )
    }

    await page.goto(`${base}/signal-room/ascii-signal`)
    await page
      .locator('astro-island[component-url*="ascii-generator"]:not([ssr])')
      .waitFor()
    await page
      .locator('input[type="file"]')
      .setInputFiles(
        fileURLToPath(
          new URL('../public/static/1200x630.png', import.meta.url),
        ),
      )
    const output = page.locator('.landing-terminal pre')
    await output.waitFor()
    const original = await output.textContent()
    assert.ok(original.trim())
    await page.getByLabel('Character set').selectOption('cp437')
    await page.waitForFunction((original) => {
      const text = document.querySelector('.landing-terminal pre')?.textContent
      return text && text !== original
    }, original)
    const [text] = await Promise.all([
      page.waitForEvent('download'),
      page.getByRole('button', { name: 'Download .txt', exact: true }).click(),
    ])
    assert.match(text.suggestedFilename(), /\.txt$/)
    assert.equal(
      readFileSync(await text.path(), 'utf8'),
      await output.textContent(),
    )
    const [png] = await Promise.all([
      page.waitForEvent('download', { timeout: 15000 }),
      page.getByRole('button', { name: 'Download PNG', exact: true }).click(),
    ])
    assert.match(png.suggestedFilename(), /\.png$/)
    assert.deepEqual(
      readFileSync(await png.path()).subarray(0, 8),
      Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    )
    assert.deepEqual(errors, [])
  } finally {
    await browser?.close()
    await server.stop()
  }
})
