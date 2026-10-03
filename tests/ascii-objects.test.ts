import assert from 'node:assert/strict'
import test from 'node:test'

import {
  ASCII_OBJECTS,
  DEFAULT_RAMP,
  frameToHtml,
  renderAsciiFrame,
  type AsciiObjectName,
} from '../src/lib/ascii'
import { FIELDS, type FieldName } from '../src/lib/fields'

const objects = Object.keys(ASCII_OBJECTS) as AsciiObjectName[]
const cols = 64
const rows = 34

test('every ASCII object fills its frame without being clipped', () => {
  for (const object of objects) {
    const frame = renderAsciiFrame({ object, cols, rows })
    const lit = frame.levels.filter(Boolean).length
    assert.ok(lit > cols * rows * 0.08, `${object} is too small to read`)
    assert.ok(lit < cols * rows * 0.8, `${object} overflows its frame`)

    const edge = (row: number, col: number) => frame.levels[row * cols + col]
    for (let col = 0; col < cols; col++)
      assert.ok(
        !edge(0, col) && !edge(rows - 1, col),
        `${object} touches the top or bottom edge`,
      )
    for (let row = 0; row < rows; row++)
      assert.ok(
        !edge(row, 0) && !edge(row, cols - 1),
        `${object} touches a side edge`,
      )

    for (const line of frame.glyphs)
      for (const glyph of line)
        assert.ok(
          glyph === ' ' || DEFAULT_RAMP.includes(glyph),
          `${object} used ${glyph}`,
        )
  }
})

test('frames are deterministic and trails only fill empty cells', () => {
  const options = { object: 'duck' as const, cols, rows, seed: 4 }
  const plain = renderAsciiFrame(options)
  assert.deepEqual(renderAsciiFrame(options), plain)

  const trailed = renderAsciiFrame({
    ...options,
    trails: { density: 1, length: 30, side: 'left' },
  })
  let added = 0
  for (let index = 0; index < cols * rows; index++) {
    if (plain.levels[index]) {
      assert.equal(trailed.levels[index], plain.levels[index])
      continue
    }
    if (trailed.levels[index]) added++
  }
  assert.ok(added > 0, 'trails were not drawn')
  assert.equal(trailed.glyphs.length, rows)
  assert.ok(trailed.glyphs.every((line) => line.length === cols))
})

test('markup escapes glyphs and wraps runs in brightness classes', () => {
  const frame = renderAsciiFrame({
    object: 'coin',
    cols: 32,
    rows: 18,
    ramp: '<&>',
  })
  const html = frameToHtml(frame)
  assert.doesNotMatch(html.replace(/<\/?i( class="a\d")?>/g, ''), /[<>]/)
  assert.match(html, /&amp;|&lt;|&gt;/)
  assert.match(html, /<i class="a[1-4]">/)
  assert.equal(html.split('\n').length, 18)
})

test('texture fields are valid, compact SVG masks', () => {
  for (const name of Object.keys(FIELDS) as FieldName[]) {
    const svg = FIELDS[name]()
    assert.match(svg, /^<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg"/, name)
    assert.match(svg, /<path d="M/, `${name} has no marks`)
    assert.ok(svg.endsWith('</svg>'), name)
    assert.ok(svg.length < 60_000, `${name} is ${svg.length} bytes`)
  }
})

test('morphs start and end on each object and blend in between', () => {
  const base = { cols, rows, seed: 2 }
  const chain = renderAsciiFrame({ ...base, object: 'chain' })
  const padlock = renderAsciiFrame({ ...base, object: 'padlock' })
  const morph = (t: number) =>
    renderAsciiFrame({ ...base, object: 'chain', morph: { to: 'padlock', t } })
  assert.deepEqual(morph(0).glyphs, chain.glyphs)
  assert.deepEqual(morph(1).glyphs, padlock.glyphs)
  const halfway = morph(0.5).glyphs.join('\n')
  assert.notEqual(halfway, chain.glyphs.join('\n'))
  assert.notEqual(halfway, padlock.glyphs.join('\n'))
})

test('noise corrupts the frame deterministically', () => {
  const options = { object: 'bars' as const, cols, rows, seed: 5 }
  const clean = renderAsciiFrame(options)
  const noisy = renderAsciiFrame({ ...options, noise: 0.8 })
  assert.deepEqual(renderAsciiFrame({ ...options, noise: 0.8 }), noisy)
  assert.notDeepEqual(noisy.glyphs, clean.glyphs)
  assert.ok(noisy.glyphs.every((line) => line.length === cols))
})

test('the door opens without leaving its frame and lets light out', () => {
  const range: [number, number] = [0.03, 1.05]
  const door = (state: number) =>
    renderAsciiFrame({ object: 'door', cols, rows, state, range })
  const closed = door(0)
  const open = door(1)
  assert.notDeepEqual(open.glyphs, closed.glyphs)
  const brightest = (frame: typeof open) =>
    frame.levels.filter((level) => level === 4).length
  assert.ok(brightest(open) > brightest(closed), 'opening should add light')
  for (let col = 0; col < cols; col++)
    assert.ok(
      !open.levels[col] && !open.levels[(rows - 1) * cols + col],
      'the open door touches the frame edge',
    )
})
