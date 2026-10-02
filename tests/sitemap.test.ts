import assert from 'node:assert/strict'
import test from 'node:test'

import { sitemapFilter } from '../astro.config'

test('sitemap excludes noindex detail pages at every nesting depth', () => {
  for (const path of [
    '/blog/parent/child',
    '/blog/parent/child/grandchild/',
    '/blog/parent/child/grandchild?ref=test',
    '/authors/chai/',
    '/authors/group/chai/',
    '/tags/astro/',
    '/tags/web/astro/',
  ]) {
    assert.equal(sitemapFilter(`https://example.com${path}`), false, path)
  }

  for (const path of [
    '/',
    '/blog/',
    '/blog/parent/',
    '/blog/2/',
    '/authors/',
    '/tags/',
    '/about?next=/blog/parent/child',
    '/archive/blog/parent/child',
  ]) {
    assert.equal(sitemapFilter(`https://example.com${path}`), true, path)
  }
})
