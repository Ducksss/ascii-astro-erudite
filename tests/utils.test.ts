import assert from 'node:assert/strict'
import test from 'node:test'

import { formatDate } from '../src/lib/utils'

test('publication dates keep their UTC calendar day across time zones', () => {
  const originalTimezone = process.env.TZ

  try {
    for (const timezone of ['America/Los_Angeles', 'Asia/Singapore']) {
      process.env.TZ = timezone
      assert.equal(formatDate(new Date('2026-01-01')), 'January 1, 2026')
    }
  } finally {
    if (originalTimezone === undefined) delete process.env.TZ
    else process.env.TZ = originalTimezone
  }
})
