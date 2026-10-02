import { hash } from './ascii/render'

// Decorative textures that thin out by dropping marks, never by a smooth
// gradient. Each field is an SVG used as a CSS mask, so the page decides its
// colour. Opacity groups give the marks three brightness steps.

const clamp01 = (value: number) => Math.min(Math.max(value, 0), 1)
const LEVELS = [0.32, 0.62, 1]

type Mark = (x: number, y: number) => string

const crossMark =
  (arm: number, gap: number): Mark =>
  (x, y) =>
    `M${x} ${y - gap - arm}v${arm}M${x} ${y + gap}v${arm}M${x - gap - arm} ${y}h${arm}M${x + gap} ${y}h${arm}`

function svg(width: number, height: number, body: string, attributes = '') {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"${attributes}>${body}</svg>`
}

function crossGrid(
  width: number,
  height: number,
  pitch: number,
  density: (x: number, y: number) => number,
  seed: number,
) {
  const mark = crossMark(3, 2)
  const paths = LEVELS.map(() => [] as string[])
  for (let row = 0; row * pitch < height; row++)
    for (let col = 0; col * pitch < width; col++) {
      const x = col * pitch + pitch / 2 + 0.5
      const y = row * pitch + pitch / 2 + 0.5
      const amount = clamp01(density(x, y))
      if (hash(col, row, seed) >= amount) continue
      const level = Math.min(
        LEVELS.length - 1,
        Math.floor(
          (amount * 0.7 + hash(row, col, seed + 1) * 0.5) * LEVELS.length,
        ),
      )
      paths[level].push(mark(x, y))
    }
  return svg(
    width,
    height,
    paths
      .map((d, index) =>
        d.length
          ? `<path d="${d.join('')}" stroke="#000" stroke-opacity="${LEVELS[index]}" fill="none" shape-rendering="crispEdges"/>`
          : '',
      )
      .join(''),
  )
}

// Square pixels in two sizes, thinning towards one side.
function pixelField(
  columns: number,
  rows: number,
  cell: number,
  density: (u: number, v: number) => number,
  seed: number,
  attributes = '',
) {
  const big: string[] = []
  const small: string[] = []
  for (let row = 0; row < rows; row += 2)
    for (let col = 0; col < columns; col += 2) {
      const amount = clamp01(density((col + 1) / columns, (row + 1) / rows))
      if (hash(col, row, seed) < (amount - 0.25) / 0.75) {
        big.push(
          `M${col * cell} ${row * cell}h${cell * 2}v${cell * 2}h-${cell * 2}z`,
        )
        continue
      }
      for (let dy = 0; dy < 2; dy++)
        for (let dx = 0; dx < 2; dx++)
          if (hash(col + dx, row + dy, seed + 5) < amount * 0.6)
            small.push(
              `M${(col + dx) * cell} ${(row + dy) * cell}h${cell}v${cell}h-${cell}z`,
            )
    }
  return svg(
    columns * cell,
    rows * cell,
    `<path d="${big.join('')}${small.join('')}"/>`,
    attributes,
  )
}

export const FIELDS = {
  // Dense in the top-right corner, scattering out towards the bottom left.
  'cross-corner': () =>
    crossGrid(
      1500,
      720,
      20,
      (x, y) =>
        1.3 -
        Math.hypot((1500 - x) / 1250, y / 600) * 1.15 +
        (hash(x, y, 4) - 0.5) * 0.24,
      11,
    ),
  // An even band of crosses that frays along its top edge; tiles across.
  'cross-band': () =>
    crossGrid(
      864,
      270,
      18,
      (x, y) => 0.92 * clamp01(y / 130) + (hash(x, y, 9) - 0.5) * 0.18,
      23,
    ),
  // Stepped blocks of crosses rising from the bottom edge.
  'cross-skyline': () =>
    crossGrid(
      1344,
      240,
      16,
      (x, y) => {
        const block = Math.floor(x / 112)
        const top = 240 - (0.25 + hash(block, 3, 31) * 0.75) * 220
        const steps = hash(block, 7, 31) < 0.28 ? 0 : 1
        return steps && y > top ? 0.96 : y > top - 16 ? 0.25 : 0
      },
      37,
    ),
  // A cluster of blue pixels bleeding off the right edge.
  pixels: () =>
    pixelField(
      28,
      36,
      14,
      (u, v) =>
        (u - 0.18) * 1.5 -
        Math.abs(v - 0.46) * 1.1 +
        (hash(Math.round(u * 28), Math.round(v * 36), 51) - 0.5) * 0.4,
      53,
    ),
  // Wordmark mask: solid letters that break apart towards the right.
  dissolve: () =>
    pixelField(
      120,
      24,
      1,
      (u) => (u < 0.7 ? 1.6 : 1.6 - (u - 0.7) * 5.4),
      61,
      ' preserveAspectRatio="none"',
    ),
  // Loose pixels trailing past the end of the wordmark.
  scatter: () =>
    pixelField(
      48,
      24,
      1,
      (u) => 0.95 - u * 1.25,
      67,
      ' preserveAspectRatio="none"',
    ),
} as const

export type FieldName = keyof typeof FIELDS
