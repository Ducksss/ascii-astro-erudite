import { ASCII_OBJECTS, type AsciiObjectName } from './objects'
import { clamp01 } from './sdf'

export interface TrailOptions {
  /** Share of object rows that emit an interference trail. */
  density: number
  /** Longest trail, in character cells. */
  length: number
  side: 'left' | 'right' | 'both'
}

export interface AsciiRenderOptions {
  object: AsciiObjectName
  cols: number
  rows: number
  /** Character advance divided by line height. */
  cellAspect?: number
  /** Share of the frame height the object's bounding sphere fills. */
  zoom?: number
  /** Horizontal framing offset, as a share of the frame width. */
  offsetX?: number
  /** Extra rotation, in radians, on top of the object's resting pose. */
  yaw?: number
  pitch?: number
  roll?: number
  /** Glyphs from darkest to brightest. Empty cells stay as spaces. */
  ramp?: string
  /** Number of brightness classes written to the markup. */
  levels?: number
  /** Ordered-dither strength, in glyph steps. */
  dither?: number
  /** Luminance window mapped onto the ramp. Computed from the frame when omitted. */
  range?: [number, number]
  gamma?: number
  /** Dark-on-light output: dense glyphs mark shadow instead of light. */
  invert?: boolean
  trails?: TrailOptions | false
  /** Changes which rows carry trails, so animation can flicker them. */
  seed?: number
  /** Sub-samples per cell, across and down. */
  samples?: [number, number]
  shadows?: boolean
}

export interface AsciiFrame {
  cols: number
  rows: number
  glyphs: string[]
  /** Brightness class per cell: 0 is empty, 1 is the dimmest. */
  levels: Uint8Array
  /** Luminance window used, so animation frames can share it. */
  range: [number, number]
}

export const DEFAULT_RAMP = '.:-=+*#%@'
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map(
  (value) => (value + 0.5) / 16 - 0.5,
)
const TRAIL_GLYPHS = '--=-.-=:'

export const hash = (a: number, b: number, c: number) => {
  let h =
    Math.imul(a ^ 0x9e3779b9, 0x85ebca6b) ^
    Math.imul(b + 0x632be5ab, 0xc2b2ae35)
  h =
    Math.imul(h ^ (h >>> 15), 0x2c1b3c6d) ^
    Math.imul(c + 0x7f4a7c15, 0x297a2d39)
  h ^= h >>> 13
  h = Math.imul(h, 0x5bd1e995)
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296
}

// World = Rx(pitch) · Ry(yaw) · Rz(roll) · object, stored row-major.
function rotationMatrix(yaw: number, pitch: number, roll: number) {
  const [cy, sy] = [Math.cos(yaw), Math.sin(yaw)]
  const [cp, sp] = [Math.cos(pitch), Math.sin(pitch)]
  const [cr, sr] = [Math.cos(roll), Math.sin(roll)]
  const multiply = (a: number[], b: number[]) =>
    Array.from({ length: 9 }, (_, index) => {
      const row = Math.floor(index / 3)
      const col = index % 3
      return (
        a[row * 3] * b[col] +
        a[row * 3 + 1] * b[3 + col] +
        a[row * 3 + 2] * b[6 + col]
      )
    })
  return multiply(
    [1, 0, 0, 0, cp, -sp, 0, sp, cp],
    multiply(
      [cy, 0, sy, 0, 1, 0, -sy, 0, cy],
      [cr, -sr, 0, sr, cr, 0, 0, 0, 1],
    ),
  )
}

/** Ray-marches the object into a luminance grid: -1 marks an empty cell. */
function shadeGrid(options: AsciiRenderOptions) {
  const {
    cols,
    rows,
    cellAspect = 0.6,
    zoom = 0.92,
    offsetX = 0,
    samples = [1, 2],
    shadows = true,
  } = options
  const object = ASCII_OBJECTS[options.object]
  const { bound } = object
  const [cx, cy, cz] = object.center ?? [0, 0, 0]
  const sdf = (x: number, y: number, z: number) =>
    object.sdf(x + cx, y + cy, z + cz)
  const surfaceAlbedo = object.albedo
  const albedo = surfaceAlbedo
    ? (x: number, y: number, z: number) => surfaceAlbedo(x + cx, y + cy, z + cz)
    : () => 1
  const world = rotationMatrix(
    object.pose.yaw + (options.yaw ?? 0),
    object.pose.pitch + (options.pitch ?? 0),
    object.pose.roll + (options.roll ?? 0),
  )
  // Object space = transpose(world) · world space.
  const toObject = (x: number, y: number, z: number, out: number[]) => {
    out[0] = world[0] * x + world[3] * y + world[6] * z
    out[1] = world[1] * x + world[4] * y + world[7] * z
    out[2] = world[2] * x + world[5] * y + world[8] * z
  }

  const distance = 7
  const tanY = bound / zoom / distance
  const tanX = tanY * ((cols * cellAspect) / rows)
  const origin = [0, 0, 0]
  toObject(0, 0, distance, origin)
  const lamp = [0, 0, 0]
  toObject(-2.8, 3.4, 3.8, lamp)
  const fill = [0, 0, 0]
  toObject(0.62, -0.18, 0.52, fill)
  const fillLength = Math.hypot(fill[0], fill[1], fill[2])
  for (let index = 0; index < 3; index++) fill[index] /= fillLength

  const oc = origin[0] ** 2 + origin[1] ** 2 + origin[2] ** 2
  const shade = (dx: number, dy: number, dz: number) => {
    // Ray against the bounding sphere first; most cells miss the object.
    const b = origin[0] * dx + origin[1] * dy + origin[2] * dz
    const discriminant = b * b - (oc - bound * bound)
    if (discriminant <= 0) return -1
    const root = Math.sqrt(discriminant)
    let t = Math.max(-b - root, 0)
    const end = -b + root
    let px = 0
    let py = 0
    let pz = 0
    let hit = false
    for (let step = 0; step < 110 && t < end; step++) {
      px = origin[0] + dx * t
      py = origin[1] + dy * t
      pz = origin[2] + dz * t
      const d = sdf(px, py, pz)
      if (d < 0.0012 * t) {
        hit = true
        break
      }
      t += d * 0.82
    }
    if (!hit) return -1

    const e = 0.0025
    const a = sdf(px + e, py - e, pz - e)
    const bb = sdf(px - e, py - e, pz + e)
    const c = sdf(px - e, py + e, pz - e)
    const dd = sdf(px + e, py + e, pz + e)
    let nx = a - bb - c + dd
    let ny = -a - bb + c + dd
    let nz = -a + bb - c + dd
    const nl = Math.hypot(nx, ny, nz) || 1
    nx /= nl
    ny /= nl
    nz /= nl

    let lx = lamp[0] - px
    let ly = lamp[1] - py
    let lz = lamp[2] - pz
    const lampDistance = Math.hypot(lx, ly, lz)
    lx /= lampDistance
    ly /= lampDistance
    lz /= lampDistance

    let occlusion = 0
    let weight = 1
    for (let index = 1; index <= 5; index++) {
      const h = 0.02 + 0.14 * (index / 5)
      occlusion += (h - sdf(px + nx * h, py + ny * h, pz + nz * h)) * weight
      weight *= 0.7
    }
    const ao = clamp01(1 - 2.2 * occlusion)

    let light = 1
    if (shadows) {
      let s = 0.04
      for (let step = 0; step < 32 && s < lampDistance; step++) {
        const h = sdf(px + lx * s, py + ly * s, pz + lz * s)
        light = Math.min(light, (9 * h) / s)
        if (light < 0.02) break
        s += Math.max(h, 0.025)
      }
      light = clamp01(light)
    }

    const lambert = nx * lx + ny * ly + nz * lz
    const diffuse = clamp01((lambert + 0.18) / 1.18) * (0.45 + 0.55 * light)
    const falloff = 1 / (1 + 0.012 * lampDistance * lampDistance)
    const bounce = Math.max(nx * fill[0] + ny * fill[1] + nz * fill[2], 0) * 0.4
    const facing = Math.max(-(nx * dx + ny * dy + nz * dz), 0)
    const rim = (1 - facing) ** 3 * 0.3
    const along = nx * dx + ny * dy + nz * dz
    const specular =
      Math.max(
        (dx - 2 * along * nx) * lx +
          (dy - 2 * along * ny) * ly +
          (dz - 2 * along * nz) * lz,
        0,
      ) **
        28 *
      0.6 *
      light
    const surface = albedo(px, py, pz)
    return Math.max(
      surface * (0.08 + 0.9 * diffuse * falloff * 1.35 + bounce) * ao +
        specular +
        rim * ao,
      0,
    )
  }

  const [samplesX, samplesY] = samples
  const sampleCount = samplesX * samplesY
  const values = new Float32Array(cols * rows).fill(-1)
  const direction = [0, 0, 0]
  for (let row = 0; row < rows; row++)
    for (let col = 0; col < cols; col++) {
      let total = 0
      let hits = 0
      for (let sy = 0; sy < samplesY; sy++)
        for (let sx = 0; sx < samplesX; sx++) {
          const u = ((col + (sx + 0.5) / samplesX) / cols) * 2 - 1 - offsetX * 2
          const v = 1 - ((row + (sy + 0.5) / samplesY) / rows) * 2
          toObject(u * tanX, v * tanY, -1, direction)
          const length = Math.hypot(direction[0], direction[1], direction[2])
          const value = shade(
            direction[0] / length,
            direction[1] / length,
            direction[2] / length,
          )
          if (value >= 0) {
            total += value
            hits++
          }
        }
      const coverage = hits / sampleCount
      if (coverage >= 0.34)
        values[row * cols + col] = (total / hits) * (0.6 + 0.4 * coverage)
    }
  return values
}

function luminanceRange(values: Float32Array): [number, number] {
  const lit = values.filter((value) => value >= 0).sort()
  if (!lit.length) return [0, 1]
  const at = (share: number) =>
    lit[Math.min(lit.length - 1, Math.floor(share * lit.length))]
  const low = at(0.02)
  const high = at(0.985)
  return [low, Math.max(high, low + 0.05)]
}

export function renderAsciiFrame(options: AsciiRenderOptions): AsciiFrame {
  const {
    cols,
    rows,
    ramp = DEFAULT_RAMP,
    levels: levelCount = 4,
    dither = 0.45,
    gamma = 0.9,
    invert = false,
    trails = false,
    seed = 1,
  } = options
  const values = shadeGrid(options)
  const range = options.range ?? luminanceRange(values)
  const [low, high] = range
  const glyphRows: string[][] = []
  const levelGrid = new Uint8Array(cols * rows)

  for (let row = 0; row < rows; row++) {
    const line: string[] = []
    for (let col = 0; col < cols; col++) {
      const raw = values[row * cols + col]
      if (raw < 0) {
        line.push(' ')
        continue
      }
      const lit = clamp01((raw - low) / (high - low)) ** gamma
      const value = invert ? 1 - lit * 0.88 : lit
      const threshold = BAYER[(row % 4) * 4 + (col % 4)] * dither
      const index = Math.min(
        ramp.length - 1,
        Math.max(0, Math.floor(value * ramp.length + threshold)),
      )
      line.push(ramp[index])
      levelGrid[row * cols + col] =
        1 +
        Math.min(
          levelCount - 1,
          Math.max(0, Math.floor(value * levelCount + threshold * 0.6)),
        )
    }
    glyphRows.push(line)
  }

  if (trails) addTrails(glyphRows, levelGrid, cols, rows, trails, seed)

  return {
    cols,
    rows,
    glyphs: glyphRows.map((line) => line.join('')),
    levels: levelGrid,
    range,
  }
}

// Scanline interference: dashed runs leaving the silhouette, thinning as they go.
function addTrails(
  glyphRows: string[][],
  levelGrid: Uint8Array,
  cols: number,
  rows: number,
  options: TrailOptions,
  seed: number,
) {
  for (let row = 0; row < rows; row++) {
    if (hash(row, seed, 3) > options.density) continue
    let first = -1
    let last = -1
    for (let col = 0; col < cols; col++)
      if (levelGrid[row * cols + col]) {
        if (first < 0) first = col
        last = col
      }
    if (first < 0) continue
    const side =
      options.side === 'both'
        ? hash(row, seed, 7) < 0.5
          ? -1
          : 1
        : options.side === 'left'
          ? -1
          : 1
    const length = Math.floor(options.length * (0.2 + 0.8 * hash(row, seed, 5)))
    let col =
      side < 0 ? first - 1 - Math.floor(hash(row, seed, 9) * 3) : last + 1
    let travelled = 0
    let segment = 0
    while (travelled < length && col >= 0 && col < cols) {
      const fade = travelled / length
      if (segment <= 0) {
        // Start a new dash after a gap that widens with distance.
        const gap = Math.floor(hash(row, travelled, seed + 13) * (1 + fade * 6))
        col += side * gap
        travelled += gap
        segment =
          2 + Math.floor(hash(row, travelled, seed + 17) * (10 - fade * 7))
        continue
      }
      if (col >= 0 && col < cols && !levelGrid[row * cols + col]) {
        glyphRows[row][col] =
          TRAIL_GLYPHS[
            Math.floor(hash(col, row, seed + 11) * TRAIL_GLYPHS.length)
          ]
        levelGrid[row * cols + col] = fade < 0.35 ? 2 : 1
      }
      col += side
      travelled++
      segment--
    }
  }
}

const escapeGlyph = (glyph: string) =>
  glyph === '&'
    ? '&amp;'
    : glyph === '<'
      ? '&lt;'
      : glyph === '>'
        ? '&gt;'
        : glyph

/** Serialises a frame as lines of runs wrapped in brightness classes (.a1 … .aN). */
export function frameToHtml(frame: AsciiFrame) {
  const lines: string[] = []
  for (let row = 0; row < frame.rows; row++) {
    let html = ''
    let runLevel = -1
    let run = ''
    const flush = () => {
      if (!run) return
      html += runLevel > 0 ? `<i class="a${runLevel}">${run}</i>` : run
      run = ''
    }
    const glyphs = frame.glyphs[row]
    for (let col = 0; col < frame.cols; col++) {
      const level = frame.levels[row * frame.cols + col]
      if (level !== runLevel) {
        flush()
        runLevel = level
      }
      run += level ? escapeGlyph(glyphs[col]) : ' '
    }
    flush()
    lines.push(html.replace(/\s+$/, ''))
  }
  return lines.join('\n')
}
