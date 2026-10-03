import {
  capsule,
  ellipsoid,
  extrude,
  length2,
  link,
  polygon,
  rotate2,
  roundBox,
  roundCylinder,
  smoothSubtract,
  smoothUnion,
  sphere,
} from './sdf'

export interface Pose {
  yaw: number
  pitch: number
  roll: number
}

type Field = (x: number, y: number, z: number, state: number) => number

export interface AsciiObject {
  /** Radius of a sphere around `center` that contains the whole object. */
  bound: number
  /** Visual centre the object rotates around and is framed by. */
  center?: [number, number, number]
  /** Signed distance to the surface, in object space. `state` runs 0–1. */
  sdf: Field
  /** Surface brightness from 0 to 1 at a point on (or near) the surface. */
  albedo?: Field
  /** Light the surface gives off regardless of the lamp. */
  glow?: Field
  pose: Pose
}

const scratch = [0, 0]
const toRadians = (degrees: number) => (degrees * Math.PI) / 180

// Rubber duck: the debugging partner that turns complex systems into plain language.
const duckBody = (x: number, y: number, z: number) => {
  let d = ellipsoid(x, y, z, 1.02, 0.6, 0.78)
  d = smoothSubtract(d, y + 0.36, 0.22)
  rotate2(scratch, x + 0.86, y - 0.16, -0.75)
  d = smoothUnion(
    d,
    ellipsoid(scratch[0], scratch[1], z, 0.34, 0.17, 0.3),
    0.32,
  )
  const wing = ellipsoid(
    x + 0.08,
    y - 0.06,
    Math.abs(z) - 0.66,
    0.52,
    0.26,
    0.14,
  )
  d = smoothUnion(d, wing, 0.08)
  return d
}

const duckHead = (x: number, y: number, z: number) =>
  sphere(x - 0.46, y - 0.9, z, 0.52)

const duckBeak = (x: number, y: number, z: number) => {
  rotate2(scratch, x - 0.99, y - 0.78, 0.16)
  return ellipsoid(scratch[0], scratch[1], z, 0.33, 0.1, 0.25)
}

const duck: AsciiObject = {
  bound: 1.42,
  center: [0.05, 0.47, 0],
  pose: { yaw: toRadians(-20), pitch: toRadians(14), roll: 0 },
  sdf(x, y, z) {
    const body = smoothUnion(duckBody(x, y, z), duckHead(x, y, z), 0.26)
    return smoothUnion(body, duckBeak(x, y, z), 0.05)
  },
  albedo(x, y, z) {
    const eye = length2(length2(x - 0.826, y - 1.077), Math.abs(z) - 0.325)
    if (eye < 0.1) return 0
    if (duckBeak(x, y, z) < 0.03) return 0.9
    return 1
  },
}

// Coin carrying the site's bracket-C mark on both faces.
const coinMark = (x: number, y: number) => {
  const box = (cx: number, cy: number, hx: number, hy: number) =>
    Math.max(Math.abs(x - cx) - hx, Math.abs(y - cy) - hy)
  let d = box(-0.04, 0.33, 0.33, 0.075)
  d = Math.min(d, box(-0.04, -0.33, 0.33, 0.075))
  d = Math.min(d, box(-0.3, 0, 0.075, 0.4))
  d = Math.min(d, box(-0.36, 0, 0.05, 0.3))
  d = Math.min(d, box(0, 0.56, 0.4, 0.022))
  d = Math.min(d, box(0, -0.56, 0.4, 0.022))
  return d
}

const coin: AsciiObject = {
  bound: 1.08,
  pose: { yaw: toRadians(-58), pitch: toRadians(12), roll: toRadians(-18) },
  sdf(x, y, z) {
    const radial = length2(x, y)
    const reeding = radial > 0.9 ? Math.sin(Math.atan2(y, x) * 72) * 0.012 : 0
    let d = roundCylinder(x, z, y, 1, 0.1, 0.05) - reeding
    const face = Math.abs(z) - 0.1
    const rim = Math.max(Math.abs(radial - 0.86) - 0.045, face - 0.035)
    const mark = Math.max(coinMark(x, y), face - 0.045)
    d = Math.min(d, rim, mark)
    return d
  },
  albedo(x, y, z) {
    const onFace = Math.abs(z) > 0.095
    if (!onFace) return 0.78
    const radial = length2(x, y)
    if (coinMark(x, y) < 0.01 || Math.abs(radial - 0.86) < 0.05) return 1
    return 0.55
  },
}

// Three interlocking links: integrations and handoffs that hold together.
const chainLink = (x: number, y: number, z: number) =>
  link(x, y, z, 0.36, 0.42, 0.18)

const chain: AsciiObject = {
  bound: 1.9,
  center: [0, 0.62, 0],
  pose: { yaw: toRadians(36), pitch: toRadians(-1), roll: toRadians(-27) },
  sdf(x, y, z) {
    const lower = chainLink(x, y, z)
    const upper = chainLink(z, y - 1.24, -x)
    return Math.min(lower, upper)
  },
}

// Padlock: readiness, incident response and the systems that keep things safe.
const padlock: AsciiObject = {
  bound: 1.32,
  center: [0, 0.12, 0],
  pose: { yaw: toRadians(-28), pitch: toRadians(10), roll: toRadians(6) },
  sdf(x, y, z) {
    let body = roundBox(x, y + 0.36, z, 0.78, 0.6, 0.34, 0.14)
    const keyhole = Math.min(
      length2(x, y + 0.26) - 0.12,
      Math.max(Math.abs(x) - 0.05, Math.abs(y + 0.5) - 0.16),
    )
    body = smoothSubtract(body, Math.max(keyhole, -(z - 0.18)), 0.02)
    const legs = Math.max(
      length2(Math.abs(x) - 0.47, z) - 0.115,
      Math.abs(y - 0.38) - 0.38,
    )
    const arc =
      y > 0.76 ? length2(length2(x, y - 0.76) - 0.47, z) - 0.115 : legs
    return Math.min(body, Math.min(legs, arc))
  },
  albedo: (_x, y) => (y > 0.25 ? 0.82 : 1),
}

// Ascending bars: forecasting, charts and the product signal getting clearer.
const barHeights = [0.46, 0.74, 0.6, 1.02, 1.42]
const barCenter = (index: number) => -1.04 + index * 0.52

const bars: AsciiObject = {
  bound: 1.55,
  center: [0, -0.14, 0],
  pose: { yaw: toRadians(-24), pitch: toRadians(17), roll: 0 },
  sdf(x, y, z) {
    let d = roundBox(x, y + 0.82, z, 1.42, 0.06, 0.5, 0.03)
    for (let index = 0; index < barHeights.length; index++) {
      const height = barHeights[index]
      d = Math.min(
        d,
        roundBox(
          x - barCenter(index),
          y + 0.76 - height / 2,
          z,
          0.19,
          height / 2,
          0.19,
          0.03,
        ),
      )
    }
    return d
  },
  albedo(x, y) {
    // Bright caps make each value easy to read against the faces.
    const index = Math.round((x + 1.04) / 0.52)
    const top = barHeights[index] === undefined ? -1 : -0.76 + barHeights[index]
    return Math.abs(y - top) < 0.04 ? 1 : y < -0.74 ? 0.55 : 0.82
  },
}

// Pointer arrow: the person on the other side of the interface.
const ARROW = [
  -0.55, 0.9, -0.55, -0.7, -0.17, -0.32, 0.13, -0.92, 0.36, -0.81, 0.07, -0.22,
  0.55, -0.22,
]

const cursor: AsciiObject = {
  bound: 1.12,
  center: [0, 0.02, 0],
  pose: { yaw: toRadians(-28), pitch: toRadians(16), roll: toRadians(14) },
  sdf: (x, y, z) => extrude(polygon(x, y, ARROW), z, 0.13, 0.035),
  albedo: (_x, _y, z) => (Math.abs(z) > 0.12 ? 1 : 0.7),
}

// Stacked database discs with status lights: workflow software and its data.
const DISCS = [-0.7, 0, 0.7]

const database: AsciiObject = {
  bound: 1.3,
  pose: { yaw: toRadians(-16), pitch: toRadians(14), roll: toRadians(-4) },
  sdf(x, y, z) {
    let d = Infinity
    for (const disc of DISCS)
      d = Math.min(d, roundCylinder(x, y - disc, z, 0.86, 0.19, 0.07))
    return d
  },
  albedo: (_x, y) => (DISCS.some((disc) => y > disc + 0.16) ? 1 : 0.72),
  glow(x, y, z) {
    if (z < 0.6) return 0
    for (const disc of DISCS)
      if (Math.abs(y - disc) < 0.04 && x > 0.3 && x < 0.46) return 0.3
    return 0
  },
}

// A door in its frame with light behind it; `state` swings it open.
const OPENING = { width: 0.6, height: 1.1 }

const doorPanel = (x: number, y: number, z: number, state: number) => {
  const angle = state * 1.75
  const qx = x + OPENING.width
  const qz = z - 0.08
  const lx = Math.cos(angle) * qx + Math.sin(angle) * qz - OPENING.width
  const lz = -Math.sin(angle) * qx + Math.cos(angle) * qz
  let panel = roundBox(lx, y, lz, 0.592, 1.092, 0.045, 0.012)
  for (const inset of [0.48, -0.46])
    panel = smoothSubtract(
      panel,
      roundBox(lx, y - inset, lz - 0.05, 0.44, 0.36, 0.014, 0.01),
      0.01,
    )
  const knob = sphere(lx - 0.47, y + 0.04, lz - 0.07, 0.05)
  return Math.min(panel, knob)
}

const door: AsciiObject = {
  bound: 1.82,
  center: [0, -0.2, 0.35],
  pose: { yaw: toRadians(-26), pitch: toRadians(9), roll: 0 },
  sdf(x, y, z, state) {
    const outer = roundBox(x, y - 0.06, z, 0.73, 1.16, 0.14, 0.02)
    const opening = roundBox(x, y + 0.3, z, 0.6, 1.4, 0.3, 0.005)
    const frame = Math.max(outer, -opening)
    const floor = roundBox(x, y + 1.14, z - 0.4, 1.1, 0.04, 0.9, 0.01)
    const back = roundBox(x, y, z + 0.38, 0.6, 1.1, 0.02, 0.005)
    return Math.min(frame, floor, back, doorPanel(x, y, z, state))
  },
  albedo(x, y, z, state) {
    if (doorPanel(x, y, z, state) < 0.01) return 0.6
    if (y < -1.08) return 0.42
    return z < -0.3 ? 0.12 : 0.86
  },
  glow(x, y, z, state) {
    const light = state ** 0.7
    if (!light) return 0
    // The room beyond, and the wedge of light it throws across the floor.
    if (z < -0.33 && Math.abs(x) < 0.6) return 1.5 * light
    if (y > -1.08 || z < -0.4) return 0
    const reach = Math.max(1 - Math.max(z, 0) / 1.3, 0)
    const spread = Math.max(1 - Math.abs(x) / (0.6 + Math.max(z, 0) * 0.5), 0)
    return 1.1 * light * reach * spread
  },
}

// A terminal window with a prompt: command-line and developer tooling.
const CHEVRON = [
  -0.78, 0.26, -0.62, 0.4, -0.18, -0.02, -0.62, -0.44, -0.78, -0.3, -0.48,
  -0.02,
]

const terminalPrompt = (x: number, y: number, z: number) => {
  const raised = Math.abs(z - 0.13) - 0.05
  const chevron = extrude(polygon(x, y, CHEVRON), z - 0.13, 0.05, 0.015)
  const cursor = roundBox(x - 0.16, y + 0.36, z - 0.13, 0.22, 0.06, 0.05, 0.015)
  return Math.min(chevron, Math.max(cursor, raised))
}

const terminal: AsciiObject = {
  bound: 1.42,
  pose: { yaw: toRadians(-24), pitch: toRadians(12), roll: toRadians(-3) },
  sdf(x, y, z) {
    let window = roundBox(x, y, z, 1.24, 0.86, 0.09, 0.08)
    window = smoothSubtract(
      window,
      roundBox(x, y - 0.56, z - 0.09, 1.3, 0.012, 0.03, 0.005),
      0.01,
    )
    for (const dot of [-1.02, -0.86, -0.7])
      window = Math.min(
        window,
        roundCylinder(x - dot, z - 0.09, y - 0.71, 0.05, 0.03, 0.01),
      )
    return Math.min(window, terminalPrompt(x, y, z))
  },
  albedo: (x, y, z) => (terminalPrompt(x, y, z) < 0.01 ? 1 : 0.62),
  glow: (x, y, z) => (terminalPrompt(x, y, z) < 0.01 && z > 0.16 ? 0.25 : 0),
}

// A graph of people and ventures with one warm-introduction route lit up.
const NODES = [
  [0, 0, 0, 0.27],
  [0.92, 0.46, 0.1, 0.2],
  [-0.86, 0.5, -0.22, 0.2],
  [0.38, -0.82, 0.36, 0.19],
  [-0.58, -0.68, 0.32, 0.17],
  [0.12, 0.94, -0.46, 0.17],
  [0.9, -0.3, -0.6, 0.16],
] as const
const EDGES = [
  [0, 1],
  [0, 2],
  [0, 3],
  [0, 4],
  [1, 5],
  [2, 5],
  [3, 6],
  [1, 6],
  [4, 3],
] as const
const ROUTE = new Set(['2-0', '0-1', '1-6'])

const nearestPart = (x: number, y: number, z: number) => {
  let best = Infinity
  let route = false
  for (const [nx, ny, nz, radius] of NODES) {
    const d = sphere(x - nx, y - ny, z - nz, radius)
    if (d < best) [best, route] = [d, false]
  }
  for (const [from, to] of EDGES) {
    const [ax, ay, az] = NODES[from]
    const [bx, by, bz] = NODES[to]
    const d = capsule(x, y, z, ax, ay, az, bx, by, bz, 0.055)
    if (d < best) [best, route] = [d, ROUTE.has(`${from}-${to}`)]
  }
  return { distance: best, route }
}

const network: AsciiObject = {
  bound: 1.4,
  pose: { yaw: toRadians(18), pitch: toRadians(10), roll: toRadians(-6) },
  sdf: (x, y, z) => nearestPart(x, y, z).distance,
  albedo: (x, y, z) => (nearestPart(x, y, z).route ? 1 : 0.82),
  glow: (x, y, z) => (nearestPart(x, y, z).route ? 0.14 : 0),
}

export const ASCII_OBJECTS = {
  duck,
  coin,
  chain,
  padlock,
  bars,
  cursor,
  database,
  door,
  terminal,
  network,
}

export type AsciiObjectName = keyof typeof ASCII_OBJECTS
