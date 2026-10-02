import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { fileURLToPath } from 'node:url'
import { preview } from 'astro'
import { chromium } from 'playwright'

test('editorial design stays readable, responsive and navigable across the site', async () => {
  const server = await preview({
    configFile: false,
    root: fileURLToPath(new URL('../', import.meta.url)),
    server: { host: '127.0.0.1', port: 0 },
    logLevel: 'silent',
  })
  let browser

  try {
    browser = await chromium.launch()
    const page = await browser.newPage({ reducedMotion: 'reduce' })
    page.setDefaultTimeout(5000)
    const base = `http://127.0.0.1:${server.port}`
    const errors = []
    page.on('pageerror', (error) => errors.push(error.message))
    const routes = [
      ['/', /Chai Pin Zheng/],
      ['/about', /About/],
      ['/blog', /Blog/],
      ['/blog/metalearner', /MetaLearner/],
      ['/blog/metalearner/onboarding', /onboarding/i],
      ['/tags', /Tags/],
      ['/tags/product-engineering', /product-engineering/],
      ['/authors', /Authors/],
      ['/authors/chai-pin-zheng', /Chai Pin Zheng/],
      ['/signal-room/ascii-signal', /ASCII Art Playground/],
      ['/404.html', /404/],
    ]

    for (const width of [1440, 768, 390, 320]) {
      await page.setViewportSize({ width, height: 900 })
      for (const [path, title] of routes) {
        await page.goto(`${base}${path}`)
        await page.evaluate(() => document.fonts.ready)
        const context = `${path} at ${width}px`
        assert.match(await page.title(), title, context)
        assert.equal(await page.locator('main h1').count(), 1, context)
        assert.ok(await page.locator('main h1').isVisible(), context)
        assert.ok((await page.locator('main h1').innerText()).trim(), context)
        if (await page.getByRole('navigation', { name: 'breadcrumb' }).count())
          assert.ok(
            await page
              .getByRole('link', { name: 'Home', exact: true })
              .isVisible(),
            `${context}: unnamed breadcrumb home link`,
          )
        for (const region of ['header', 'header nav', 'footer'])
          assert.ok(await page.locator(region).first().isVisible(), context)
        for (const path of ['/about', '/blog'])
          assert.ok(
            await page.locator(`header nav a[href="${path}"]`).isVisible(),
            `${context}: navigation to ${path}`,
          )

        const presentation = await page.evaluate(() => {
          const visible = (element) => {
            const style = getComputedStyle(element)
            return (
              element.getClientRects().length && style.visibility !== 'hidden'
            )
          }
          const paragraph = [...document.querySelectorAll('main p')].find(
            (element) =>
              visible(element) &&
              !element.closest('[aria-hidden="true"]') &&
              element.textContent.trim().length >= 50 &&
              !getComputedStyle(element).fontFamily.includes('monospace') &&
              parseFloat(getComputedStyle(element).fontSize) <= 20,
          )
          const style = paragraph && getComputedStyle(paragraph)
          const canvas = document.createElement('canvas').getContext('2d')
          const rgba = (color) => {
            canvas.clearRect(0, 0, 1, 1)
            canvas.fillStyle = color
            canvas.fillRect(0, 0, 1, 1)
            return [...canvas.getImageData(0, 0, 1, 1).data]
          }
          const composite = (front, back) =>
            back.map(
              (channel, index) =>
                channel * (1 - front[3] / 255) +
                (front[index] * front[3]) / 255,
            )
          const ancestors = []
          for (
            let element = paragraph;
            element;
            element = element.parentElement
          )
            ancestors.unshift(element)
          const background = ancestors.reduce(
            (back, element) =>
              composite(rgba(getComputedStyle(element).backgroundColor), back),
            [255, 255, 255],
          )
          const luminance = (color) =>
            color
              .map((channel) => channel / 255)
              .map((channel) =>
                channel <= 0.04045
                  ? channel / 12.92
                  : ((channel + 0.055) / 1.055) ** 2.4,
              )
              .reduce(
                (sum, channel, index) =>
                  sum + channel * [0.2126, 0.7152, 0.0722][index],
                0,
              )
          const brightness = style && [
            luminance(background),
            luminance(composite(rgba(style.color), background)),
          ]
          const headingBounds = document
            .querySelector('main h1')
            .getBoundingClientRect()
          const headingText = document.createTreeWalker(
            document.querySelector('main h1'),
            NodeFilter.SHOW_TEXT,
          )
          let headingClipped = false
          while (headingText.nextNode()) {
            if (!headingText.currentNode.textContent.trim()) continue
            const range = document.createRange()
            range.selectNodeContents(headingText.currentNode)
            for (const bounds of range.getClientRects())
              if (
                bounds.left < headingBounds.left - 1 ||
                bounds.right > headingBounds.right + 1
              )
                headingClipped = true
          }
          return {
            overflow: document.documentElement.scrollWidth > innerWidth + 1,
            headingClipped,
            paragraph: style && {
              fontSize: parseFloat(style.fontSize),
              lineHeight: parseFloat(style.lineHeight),
              color: style.color,
              opacity: style.opacity,
              contrast:
                (Math.max(...brightness) + 0.05) /
                (Math.min(...brightness) + 0.05),
            },
            missingTargets: [
              ...document.querySelectorAll('header a, main a, footer a'),
            ]
              .filter(visible)
              .filter((link) => link.getAttribute('aria-disabled') !== 'true')
              .filter(
                (link) =>
                  !link.getAttribute('href') ||
                  link.getAttribute('href') === '#',
              )
              .map((link) => link.textContent.trim()),
          }
        })
        assert.equal(
          presentation.overflow,
          false,
          `${context}: horizontal overflow`,
        )
        assert.equal(
          presentation.headingClipped,
          false,
          `${context}: clipped heading`,
        )
        assert.ok(presentation.paragraph, `${context}: missing body copy`)
        assert.ok(
          presentation.paragraph.fontSize >= 14,
          `${context}: undersized body copy`,
        )
        assert.ok(
          presentation.paragraph.lineHeight >=
            presentation.paragraph.fontSize * 1.4,
          `${context}: cramped body copy`,
        )
        assert.notEqual(
          presentation.paragraph.color,
          'rgba(0, 0, 0, 0)',
          context,
        )
        assert.notEqual(presentation.paragraph.opacity, '0', context)
        assert.ok(
          presentation.paragraph.contrast >= 4.5,
          `${context}: low-contrast body copy`,
        )
        assert.deepEqual(
          presentation.missingTargets,
          [],
          `${context}: empty link destinations`,
        )

        if (path === '/') {
          const colors = await page
            .locator('main > section')
            .evaluateAll((sections) =>
              sections.map((section) =>
                getComputedStyle(section)
                  .backgroundColor.match(/[\d.]+/g)
                  .map(Number),
              ),
            )
          assert.ok(
            colors[0][0] < 65 && colors[0][1] < 65 && colors[0][2] > 180,
            `${context}: missing electric-blue hero`,
          )
          assert.ok(
            colors.some(
              ([r, g, b, alpha = 1]) => Math.min(r, g, b) > 230 && alpha === 1,
            ),
            `${context}: missing paper section`,
          )
          assert.ok(
            colors.some(
              ([r, g, b, alpha = 1]) =>
                r < 30 && g < 30 && b < 50 && b > r && alpha === 1,
            ),
            `${context}: missing navy section`,
          )
        }
      }
    }

    await page.goto(base)
    await page.keyboard.press('Tab')
    const skip = page.getByRole('link', { name: 'Skip to main content' })
    assert.ok(await skip.isVisible(), 'Keyboard skip link is hidden')
    assert.equal(
      await skip.evaluate((link) => link === document.activeElement),
      true,
    )
    await page.keyboard.press('Enter')
    assert.equal(
      await page
        .locator('main')
        .evaluate((main) => main === document.activeElement),
      true,
    )

    await page.evaluate(() => {
      window.__designNavigation = true
    })
    for (const path of ['/about', '/blog', '/signal-room/ascii-signal']) {
      const region = path.startsWith('/signal-room') ? 'footer' : 'header nav'
      await page.locator(`${region} a[href="${path}"]`).click()
      await page.waitForURL(`${base}${path}`)
      assert.equal(
        await page.evaluate(() => window.__designNavigation),
        true,
        'Navigation reloaded the document',
      )
      assert.equal(await page.locator('header').count(), 1)
      assert.equal(await page.locator('footer').count(), 1)
      assert.ok(await page.locator('main h1').isVisible())
    }
    assert.deepEqual(errors, [])
  } finally {
    await browser?.close()
    await server.stop()
  }
})

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
