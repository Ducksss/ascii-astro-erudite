import assert from 'node:assert/strict'
import { readdirSync, readFileSync, statSync } from 'node:fs'
import test from 'node:test'

const dist = new URL('../dist/', import.meta.url)
const content = new URL('../src/content/blog/', import.meta.url)
const read = (file) => readFileSync(new URL(file, dist), 'utf8')
const decode = (value) =>
  value.replace(/&(amp|quot|apos|lt|gt|#x[\da-f]+|#\d+);/gi, (_, entity) =>
    entity.startsWith('#')
      ? String.fromCodePoint(
          entity[1].toLowerCase() === 'x'
            ? parseInt(entity.slice(2), 16)
            : Number(entity.slice(1)),
        )
      : { amp: '&', quot: '"', apos: "'", lt: '<', gt: '>' }[
          entity.toLowerCase()
        ],
  )
// ponytail: scans generated HTML; use a parser if raw HTML fixtures are needed.
const tags = (html) =>
  [
    ...html
      .replace(/<!--[\s\S]*?-->/g, '')
      .replace(
        /(<script\b[^>]*>)[\s\S]*?<\/script>|<style\b[^>]*>[\s\S]*?<\/style>/gi,
        (_, script) => script ?? '',
      )
      .matchAll(/<([\w-]+)\b([^<>]*)>/g),
  ].map(([, name, attributes]) => [
    name,
    Object.fromEntries(
      [
        ...attributes.matchAll(
          /([\w:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+))/g,
        ),
      ].map(([, key, double, single, bare]) => [
        key,
        decode(double ?? single ?? bare),
      ]),
    ),
  ])
const xmlValues = (xml, name) =>
  [...xml.matchAll(new RegExp(`<${name}>([\\s\\S]*?)</${name}>`, 'g'))].map(
    ([, value]) => decode(value),
  )

test('portfolio publishes the current career and source-qualified record', () => {
  const text = (file) =>
    decode(read(file).replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ')
  const home = text('index.html')
  const about = text('about/index.html')
  const author = text('authors/chai-pin-zheng/index.html')
  const payload = text('blog/why-i-built-payload-kits/index.html')

  assert.match(home, /Product Engineer at Reactor School/)
  assert.match(home, /Payload Components/)
  assert.match(home, /17 Devpost projects/)
  assert.match(
    home,
    /Built ReactorOS participant imports, a tenant-safe data layer and a pathfinder ranking up to five warm-introduction routes/,
  )
  assert.match(
    home,
    /Shipped contextual onboarding, a four-category User Guide and nine interactive chart demos/,
  )
  for (const id of [
    'reactor-school',
    'metalearner',
    'taskade',
    'saf',
    'govtech',
    'associates-consulting',
  ])
    assert.match(read('about/index.html'), new RegExp(`id="${id}"`))
  assert.match(about, /May 2026 - Present.*Reactor School.*Product Engineer/)
  assert.match(about, /May 2025 - Aug 2025.*Taskade.*Software Engineer Intern/)
  assert.match(
    about,
    /Apr 2022 - Jul 2023.*GovTech Singapore.*Software Engineer Intern/,
  )
  assert.match(about, /4\.50\/5\.00/)
  assert.match(about, /2028 \(expected\)/)
  assert.match(about, /The LaunchPad Challenge/)
  assert.match(about, /The Collective/)
  assert.match(about, /Resumify.*Co-founder \/ Fullstack Lead Engineer/)
  assert.match(about, /14 September 2026/)
  assert.match(about, /registrations/)
  assert.doesNotMatch(
    about,
    /25%|15%|20 minutes per merge|Eliminated onboarding drop-offs/,
  )
  assert.match(author, /Product Engineer at Reactor School/)
  assert.match(payload, /npx payload-components add hero-basic/)
  assert.match(payload, /MIT/)
  for (const page of [home, about, author, payload])
    assert.doesNotMatch(
      page,
      /Payload Kits|npx payload-kit(?:\s|$)|4\.60\/5\.00/,
    )
})

test('writing publishes the curated archive with ASCII covers and revision dates', () => {
  const parents = [
    'beacon',
    'daybreak',
    'ecocart',
    'metalearner',
    'saf-journey',
    'safesteps-agewell',
    'why-i-built-payload-kits',
  ]
  const rss = read('rss.xml')
  assert.equal([...rss.matchAll(/<item>/g)].length, parents.length)
  for (const id of parents) {
    const cover = readFileSync(new URL(`${id}/cover.png`, content))
    assert.deepEqual(
      cover.subarray(0, 8),
      Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    )
    assert.equal(cover.readUInt32BE(16), 1200, `${id}: cover width`)
    assert.equal(cover.readUInt32BE(20), 630, `${id}: cover height`)
    const html = read(`blog/${id}/index.html`)
    const attributes = tags(html)
    const metadata = JSON.parse(
      html.match(
        /<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/,
      )[1],
    )
    assert.equal(metadata.dateModified, '2026-10-03T00:00:00.000Z')
    assert.ok(metadata.datePublished < metadata.dateModified)
    assert.ok(
      attributes.some(
        ([name, attrs]) =>
          name === 'meta' &&
          attrs.property === 'article:modified_time' &&
          attrs.content === metadata.dateModified,
      ),
    )
    const social = attributes.find(
      ([name, attrs]) => name === 'meta' && attrs.property === 'og:image',
    )[1].content
    assert.doesNotMatch(social, /\/static\/1200x630\.png$/)
    assert.match(social, /cover/)
    assert.ok(
      attributes.some(
        ([name, attrs]) =>
          name === 'img' && attrs.class?.includes('post-figure__image'),
      ),
    )
    assert.match(rss, new RegExp(`/blog/${id}(?:/|<)`))
  }
  const retired = [
    'how-i-write-product-and-engineering-case-studies',
    'how-this-astro-portfolio-is-structured',
    'callouts-component',
    'mobile-nav-and-subposts',
    'rehype-patch',
    'the-state-of-static-blogs',
    'saf-journey/bmt',
    'saf-journey/enlistment',
    'saf-journey/ocs',
    'saf-journey/leading-men',
  ]
  const files = readdirSync(dist, { recursive: true })
  for (const id of retired) {
    assert.ok(
      !files.includes(`blog/${id}/index.html`),
      `${id}: retired post published`,
    )
    assert.ok(!rss.includes(`/blog/${id}`), `${id}: retired post in feed`)
  }
})

test('production build preserves routes, content, local links and SEO metadata', () => {
  const files = new Set(
    readdirSync(dist, { recursive: true }).filter((file) =>
      statSync(new URL(file, dist)).isFile(),
    ),
  )
  const pages = new Map(
    [...files]
      .filter((file) => file.endsWith('.html'))
      .map((file) => {
        const html = read(file)
        return [file, { html, tags: tags(html) }]
      }),
  )
  for (const file of [
    'index.html',
    'about/index.html',
    'blog/index.html',
    'tags/index.html',
    'authors/index.html',
    '404.html',
    'signal-room/ascii-signal/index.html',
  ]) {
    assert.ok(pages.has(file), `Missing custom page: ${file}`)
  }

  const canonicalFor = (page) =>
    page.tags.find(
      ([name, attributes]) => name === 'link' && attributes.rel === 'canonical',
    )?.[1].href
  const site = new URL(canonicalFor(pages.get('index.html')))
  assert.equal(site.protocol, 'https:', 'Production canonicals must use HTTPS')
  assert.doesNotMatch(
    site.hostname,
    /^(localhost|127\.|0\.0\.0\.0$)|(^|\.)example\./,
  )
  const targetFor = (url) => {
    const path = decodeURIComponent(url.pathname).replace(/^\/|\/$/g, '')
    return [
      path,
      path ? `${path}/index.html` : 'index.html',
      `${path}.html`,
    ].find((file) => files.has(file))
  }
  const checkReference = (value, base) => {
    const url = new URL(value, base)
    if (!/^https?:$/.test(url.protocol) || url.origin !== site.origin) return
    const file = targetFor(url)
    assert.ok(file, `${base.pathname} links to missing local resource ${value}`)
    if (url.hash && !url.hash.startsWith('#:~:text=') && pages.has(file)) {
      const anchor = decodeURIComponent(url.hash.slice(1))
      assert.ok(
        pages
          .get(file)
          .tags.some(
            ([name, attributes]) =>
              attributes.id === anchor ||
              (name === 'a' && attributes.name === anchor),
          ),
        `${base.pathname} links to missing anchor ${value}`,
      )
    }
  }

  const sitemap = new Set()
  for (const location of xmlValues(read('sitemap-index.xml'), 'loc')) {
    const url = new URL(location)
    assert.equal(
      url.origin,
      site.origin,
      'Sitemap index host differs from canonical host',
    )
    checkReference(location, site)
    for (const pageUrl of xmlValues(read(targetFor(url)), 'loc')) {
      assert.equal(
        new URL(pageUrl).origin,
        site.origin,
        'Sitemap host differs from canonical host',
      )
      checkReference(pageUrl, site)
      sitemap.add(pageUrl)
    }
  }
  assert.match(
    read('robots.txt'),
    new RegExp(
      `Sitemap: ${site.origin.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}/sitemap-index\\.xml`,
    ),
  )

  for (const [file, page] of pages) {
    const canonical = canonicalFor(page)
    const base = new URL(canonical)
    assert.equal(base.origin, site.origin, `${file}: canonical host differs`)
    assert.equal(
      targetFor(base),
      file,
      `${file}: canonical points to another page`,
    )
    const noindex = page.tags.some(
      ([name, attributes]) =>
        name === 'meta' &&
        attributes.name === 'robots' &&
        /\bnoindex\b/.test(attributes.content),
    )
    assert.equal(
      sitemap.has(canonical),
      !noindex,
      `${file}: sitemap conflicts with robots metadata`,
    )
    for (const [name, attributes] of page.tags) {
      for (const key of ['href', 'src', 'component-url', 'renderer-url']) {
        if (attributes[key]) checkReference(attributes[key], base)
      }
      for (const candidate of attributes.srcset?.split(',') ?? []) {
        checkReference(candidate.trim().split(/\s+/)[0], base)
      }
      if (name === 'meta' && attributes.property === 'og:url') {
        assert.equal(
          attributes.content,
          canonical,
          `${file}: Open Graph URL differs`,
        )
      }
      if (
        name === 'meta' &&
        /^(og:image|twitter:image)$/.test(
          attributes.property ?? attributes.name,
        )
      ) {
        checkReference(attributes.content, base)
      }
    }
    for (const [, json] of page.html.matchAll(
      /<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g,
    )) {
      assert.equal(
        JSON.parse(json).url,
        canonical,
        `${file}: structured data URL differs`,
      )
    }
  }
  for (const file of files) {
    if (!file.endsWith('.css')) continue
    for (const [, resource] of read(file).matchAll(
      /url\(\s*["']?([^"')\s]+)["']?\s*\)/g,
    )) {
      checkReference(resource, new URL(file, site))
    }
  }
  for (const icon of JSON.parse(read('site.webmanifest')).icons)
    checkReference(icon.src, site)

  const generator = pages
    .get('signal-room/ascii-signal/index.html')
    .tags.find(
      ([name, attributes]) =>
        name === 'astro-island' &&
        attributes['component-url']?.includes('ascii-generator'),
    )?.[1]
  assert.ok(generator, 'ASCII playground has lost its React client island')
  assert.equal(
    generator.client,
    'load',
    'ASCII playground must hydrate on load',
  )

  const publishedParents = new Set()
  for (const file of readdirSync(content, { recursive: true }).filter((file) =>
    /\.mdx?$/.test(file),
  )) {
    const source = readFileSync(new URL(file, content), 'utf8')
    const [, frontmatter, body] = source.split(/^---\s*$/m)
    const id = file.replace(/\/index(?=\.mdx?$)/, '').replace(/\.mdx?$/, '')
    const url = new URL(`blog/${id}/`, site)
    if (/^draft:\s*true\s*$/m.test(frontmatter)) {
      assert.equal(targetFor(url), undefined, `Draft published: ${id}`)
      assert.ok(!sitemap.has(url.href), `Draft in sitemap: ${id}`)
      continue
    }
    const page = pages.get(targetFor(url))
    assert.ok(page, `Published post missing: ${id}`)
    const article = page.html.match(
      /<article\b[^>]*class="[^"]*\bprose\b[^"]*"[^>]*>([\s\S]*?)<\/article>/,
    )?.[1]
    assert.ok(
      article && /<p\b/.test(article) && /<h[2-6]\b/.test(article),
      `${id}: MDX content was not rendered`,
    )
    if (/^\s*```/m.test(body)) {
      assert.match(
        article,
        /class="expressive-code"/,
        `${id}: code rendering lost`,
      )
      assert.match(
        article,
        /<pre\b[^>]*>[\s\S]*?<code>/,
        `${id}: code block missing`,
      )
      assert.match(
        article,
        /data-theme="light"/,
        `${id}: light code theme missing`,
      )
      assert.match(
        article,
        /data-theme="dark"/,
        `${id}: dark code theme missing`,
      )
    }
    if (
      /\$\$[\s\S]+?\$\$|(?<!\\)\$[^$\n]+\$/.test(
        body.replace(/```[\s\S]*?```/g, ''),
      )
    ) {
      assert.match(
        article,
        /class="katex(?:\s|"|-)/,
        `${id}: math rendering missing`,
      )
    }
    if (id.includes('/')) {
      const parent = pages.get(
        targetFor(new URL(`blog/${id.split('/')[0]}/`, site)),
      )
      assert.ok(
        parent?.tags.some(
          ([name, attributes]) =>
            name === 'a' &&
            attributes.href &&
            new URL(attributes.href, site).pathname.replace(/\/$/, '') ===
              url.pathname.replace(/\/$/, ''),
        ),
        `${id}: parent has lost its dedicated subpost link`,
      )
    } else {
      publishedParents.add(url.href)
    }
  }
  const rss = read('rss.xml')
  assert.equal(
    xmlValues(rss, 'link')[0],
    site.href,
    'RSS host differs from canonical host',
  )
  const feedLinks = new Set(
    [...rss.matchAll(/<item>([\s\S]*?)<\/item>/g)].map(
      ([, item]) => xmlValues(item, 'link')[0],
    ),
  )
  assert.deepEqual(
    feedLinks,
    publishedParents,
    'RSS must contain published parent posts only',
  )
})
