// Signed distance primitives used by the ASCII object renderer.
// Every function takes plain numbers so the ray marcher stays allocation-free.

export const clamp01 = (value: number) => Math.min(Math.max(value, 0), 1)

export const length2 = (x: number, y: number) => Math.sqrt(x * x + y * y)

export const length3 = (x: number, y: number, z: number) =>
  Math.sqrt(x * x + y * y + z * z)

export function sphere(x: number, y: number, z: number, radius: number) {
  return length3(x, y, z) - radius
}

// Bound-preserving ellipsoid approximation (Quilez).
export function ellipsoid(
  x: number,
  y: number,
  z: number,
  rx: number,
  ry: number,
  rz: number,
) {
  const k0 = length3(x / rx, y / ry, z / rz)
  const k1 = length3(x / (rx * rx), y / (ry * ry), z / (rz * rz))
  return k1 === 0 ? -Math.min(rx, ry, rz) : (k0 * (k0 - 1)) / k1
}

export function roundBox(
  x: number,
  y: number,
  z: number,
  bx: number,
  by: number,
  bz: number,
  radius: number,
) {
  const qx = Math.abs(x) - bx + radius
  const qy = Math.abs(y) - by + radius
  const qz = Math.abs(z) - bz + radius
  return (
    length3(Math.max(qx, 0), Math.max(qy, 0), Math.max(qz, 0)) +
    Math.min(Math.max(qx, qy, qz), 0) -
    radius
  )
}

// Torus lying in the xz plane.
export function torus(
  x: number,
  y: number,
  z: number,
  major: number,
  minor: number,
) {
  return length2(length2(x, z) - major, y) - minor
}

// Elongated chain link in the xy plane, stretched along y.
export function link(
  x: number,
  y: number,
  z: number,
  stretch: number,
  major: number,
  minor: number,
) {
  const qy = Math.max(Math.abs(y) - stretch, 0)
  return length2(length2(x, qy) - major, z) - minor
}

// Cylinder around the y axis with rounded rims.
export function roundCylinder(
  x: number,
  y: number,
  z: number,
  radius: number,
  halfHeight: number,
  rounding: number,
) {
  const dx = length2(x, z) - radius + rounding
  const dy = Math.abs(y) - halfHeight + rounding
  return (
    Math.min(Math.max(dx, dy), 0) +
    length2(Math.max(dx, 0), Math.max(dy, 0)) -
    rounding
  )
}

export function smoothUnion(a: number, b: number, k: number) {
  const h = Math.max(k - Math.abs(a - b), 0) / k
  return Math.min(a, b) - h * h * k * 0.25
}

export function smoothSubtract(from: number, cut: number, k: number) {
  return -smoothUnion(-from, cut, k)
}

// Rotates (a, b) by angle and writes the result into out[0], out[1].
export function rotate2(out: number[], a: number, b: number, angle: number) {
  const c = Math.cos(angle)
  const s = Math.sin(angle)
  out[0] = c * a - s * b
  out[1] = s * a + c * b
}

// Signed distance to a closed 2D polygon given as [x0, y0, x1, y1, …] (Quilez).
export function polygon(x: number, y: number, points: readonly number[]) {
  const count = points.length / 2
  let distance = (x - points[0]) ** 2 + (y - points[1]) ** 2
  let sign = 1
  for (let i = 0, j = count - 1; i < count; j = i, i++) {
    const xi = points[i * 2]
    const yi = points[i * 2 + 1]
    const ex = points[j * 2] - xi
    const ey = points[j * 2 + 1] - yi
    const wx = x - xi
    const wy = y - yi
    const t = Math.min(
      Math.max((wx * ex + wy * ey) / (ex * ex + ey * ey), 0),
      1,
    )
    distance = Math.min(distance, (wx - ex * t) ** 2 + (wy - ey * t) ** 2)
    const above = y >= yi
    const below = y < points[j * 2 + 1]
    const left = ex * wy > ey * wx
    if ((above && below && left) || (!above && !below && !left)) sign = -sign
  }
  return sign * Math.sqrt(distance)
}

// Extrudes a 2D distance along z with rounded edges.
export function extrude(
  distance2d: number,
  z: number,
  depth: number,
  rounding: number,
) {
  const wx = distance2d + rounding
  const wy = Math.abs(z) - depth + rounding
  return (
    Math.min(Math.max(wx, wy), 0) +
    length2(Math.max(wx, 0), Math.max(wy, 0)) -
    rounding
  )
}

// Capsule between points a and b.
export function capsule(
  x: number,
  y: number,
  z: number,
  ax: number,
  ay: number,
  az: number,
  bx: number,
  by: number,
  bz: number,
  radius: number,
) {
  const px = x - ax
  const py = y - ay
  const pz = z - az
  const ex = bx - ax
  const ey = by - ay
  const ez = bz - az
  const t = Math.min(
    Math.max((px * ex + py * ey + pz * ez) / (ex * ex + ey * ey + ez * ez), 0),
    1,
  )
  return length3(px - ex * t, py - ey * t, pz - ez * t) - radius
}
