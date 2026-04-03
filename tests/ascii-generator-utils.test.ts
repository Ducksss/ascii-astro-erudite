import assert from 'node:assert/strict'
import test from 'node:test'

import {
  CHARSETS,
  CHARSET_OPTIONS,
  DEFAULT_RENDER_OPTIONS,
  GRADIENT_OPTIONS,
  getPaddedCanvasSize,
  getSampledLuminance,
  remapGradient,
  renderAsciiFromRgba,
} from '../src/components/dev/ascii-generator-utils'

test('exposes expanded character sets and ascii gradients', () => {
  const charsetValues = new Set(CHARSET_OPTIONS.map((option) => option.value))
  const gradientValues = new Set(GRADIENT_OPTIONS.map((option) => option.value))

  assert.ok(CHARSET_OPTIONS.length >= 8)
  assert.ok(charsetValues.has('blocks'))
  assert.ok(charsetValues.has('braille'))
  assert.ok(charsetValues.has('technical'))
  assert.ok(charsetValues.has('arrows'))
  assert.ok(charsetValues.has('cp437'))

  assert.ok(GRADIENT_OPTIONS.length >= 8)
  assert.ok(gradientValues.has('contrast-punch'))
  assert.ok(gradientValues.has('posterized'))
  assert.ok(gradientValues.has('midtone-boost'))
})

test('gradient remapping stays within bounds and offers distinct curves', () => {
  const input = 0.63
  const outputs = GRADIENT_OPTIONS.map((option) =>
    remapGradient(input, option.value),
  )

  for (const output of outputs) {
    assert.ok(output >= 0)
    assert.ok(output <= 1)
  }

  assert.notEqual(remapGradient(input, 'linear'), remapGradient(input, 'smooth'))
  assert.notEqual(
    remapGradient(input, 'linear'),
    remapGradient(input, 'contrast-punch'),
  )
  assert.notEqual(
    remapGradient(input, 'linear'),
    remapGradient(input, 'midtone-boost'),
  )
})

test('cp437 rendering maps dark pixels to heavy block characters', () => {
  const rgba = new Uint8ClampedArray([
    0, 0, 0, 255,
    255, 255, 255, 255,
  ])

  const result = renderAsciiFromRgba(rgba, 2, 1, {
    ...DEFAULT_RENDER_OPTIONS,
    charset: 'cp437',
    contrast: 100,
    brightness: 100,
    gradient: 'linear',
    spaceDensity: 28,
  })

  assert.equal(result.lines.length, 1)
  assert.equal(result.text, '■ ')
})

test('space density shifts the same tone toward lighter characters', () => {
  const rgba = new Uint8ClampedArray([140, 140, 140, 255])

  const sparseResult = renderAsciiFromRgba(rgba, 1, 1, {
    ...DEFAULT_RENDER_OPTIONS,
    charset: 'dense',
    spaceDensity: 0,
  }).text
  const airyResult = renderAsciiFromRgba(rgba, 1, 1, {
    ...DEFAULT_RENDER_OPTIONS,
    charset: 'dense',
    spaceDensity: 100,
  }).text

  assert.equal(sparseResult.length, 1)
  assert.equal(airyResult.length, 1)
  assert.ok(
    CHARSETS.dense.indexOf(airyResult) < CHARSETS.dense.indexOf(sparseResult),
  )
})

test('saturation and grayscale preprocessing change luminance sampling', () => {
  const fullySaturated = getSampledLuminance(255, 0, 0, 1, 200, 0)
  const desaturated = getSampledLuminance(255, 0, 0, 1, 0, 0)
  const grayscale = getSampledLuminance(255, 0, 0, 1, 100, 100)

  assert.ok(fullySaturated < desaturated)
  assert.ok(grayscale > fullySaturated)
})

test('transparent frame padding expands exported canvas dimensions', () => {
  const size = getPaddedCanvasSize(100, 80, 24, 2)

  assert.deepEqual(size, {
    width: 296,
    height: 256,
  })
})
