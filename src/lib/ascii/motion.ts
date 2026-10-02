import type { AsciiRenderOptions } from './render'

type Motion = 'sway' | 'spin'

interface Instance {
  id: number
  element: HTMLElement
  motion: Motion
  options: AsciiRenderOptions
  visible: boolean
  pending: boolean
  lastFrameAt: number
  slowFrames: number
  yaw: number
  roll: number
}

const FRAME_INTERVAL = 1000 / 14
const instances = new Map<number, Instance>()
const pointer = { x: 0, y: 0, active: false }
const startedAt = performance.now()
let worker: Worker | undefined
let observer: IntersectionObserver | undefined
let nextId = 1
let frameHandle = 0
let watching = false

const clamp = (value: number) => Math.min(Math.max(value, -1), 1)

/** Animates `[data-ascii-motion]` objects off the main thread while they are on screen. */
export function watchAsciiMotion() {
  if (watching) return
  watching = true
  document.addEventListener('astro:page-load', scan)
  document.addEventListener('astro:before-swap', reset)
  document.addEventListener('visibilitychange', schedule)
  window.addEventListener(
    'pointermove',
    (event) => {
      pointer.x = event.clientX
      pointer.y = event.clientY
      pointer.active = event.pointerType === 'mouse'
    },
    { passive: true },
  )
  scan()
}

function scan() {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return
  const elements = document.querySelectorAll<HTMLElement>(
    '[data-ascii-motion]:not([data-ascii-live])',
  )
  if (!elements.length || typeof Worker === 'undefined') return
  worker ??= createWorker()
  observer ??= new IntersectionObserver(onIntersect, { rootMargin: '80px' })
  for (const element of elements) {
    const id = nextId++
    element.dataset.asciiLive = String(id)
    instances.set(id, {
      id,
      element,
      motion: element.dataset.asciiMotion as Motion,
      options: JSON.parse(element.dataset.asciiOptions ?? '{}'),
      visible: false,
      pending: false,
      lastFrameAt: 0,
      slowFrames: 0,
      yaw: 0,
      roll: 0,
    })
    observer.observe(element)
  }
}

function reset() {
  for (const instance of instances.values())
    delete instance.element.dataset.asciiLive
  instances.clear()
  observer?.disconnect()
  observer = undefined
  cancelAnimationFrame(frameHandle)
  frameHandle = 0
}

function createWorker() {
  const created = new Worker(new URL('./worker.ts', import.meta.url), {
    type: 'module',
  })
  created.onmessage = ({
    data,
  }: MessageEvent<{ id: number; html: string; ms: number }>) => {
    const instance = instances.get(data.id)
    if (!instance) return
    instance.pending = false
    instance.element.innerHTML = data.html
    // Back off on slow devices rather than hogging a core.
    instance.slowFrames =
      data.ms > 70
        ? instance.slowFrames + 1
        : Math.max(0, instance.slowFrames - 1)
  }
  return created
}

function onIntersect(entries: IntersectionObserverEntry[]) {
  for (const entry of entries) {
    const instance = instances.get(
      Number((entry.target as HTMLElement).dataset.asciiLive),
    )
    if (instance) instance.visible = entry.isIntersecting
  }
  schedule()
}

function schedule() {
  if (!frameHandle && !document.hidden)
    frameHandle = requestAnimationFrame(tick)
}

function tick(now: number) {
  frameHandle = 0
  let running = false
  for (const instance of instances.values()) {
    if (!instance.visible || instance.slowFrames > 8) continue
    running = true
    const interval = FRAME_INTERVAL * (1 + instance.slowFrames * 0.4)
    if (instance.pending || now - instance.lastFrameAt < interval) continue
    instance.lastFrameAt = now
    instance.pending = true
    worker?.postMessage({
      id: instance.id,
      options: frameOptions(instance, now),
    })
  }
  if (running) schedule()
}

function frameOptions(instance: Instance, now: number): AsciiRenderOptions {
  const seconds = (now - startedAt) / 1000
  const { options } = instance
  const base = { ...options, samples: [1, 2] as [number, number] }
  if (instance.motion === 'spin')
    return {
      ...base,
      yaw: (options.yaw ?? 0) + seconds * 0.8,
      seed: Math.floor(seconds * 3),
    }

  // Sway: drift slowly and turn toward a nearby mouse pointer.
  const bounds = instance.element.getBoundingClientRect()
  const targetYaw = pointer.active
    ? clamp((pointer.x - bounds.left - bounds.width / 2) / (innerWidth * 0.5)) *
      0.42
    : 0
  const targetRoll = pointer.active
    ? -clamp(
        (pointer.y - bounds.top - bounds.height / 2) / (innerHeight * 0.6),
      ) * 0.12
    : 0
  instance.yaw += (targetYaw - instance.yaw) * 0.14
  instance.roll += (targetRoll - instance.roll) * 0.14
  return {
    ...base,
    yaw: (options.yaw ?? 0) + instance.yaw + Math.sin(seconds * 0.55) * 0.16,
    roll: (options.roll ?? 0) + instance.roll,
    seed: Math.floor(seconds * 2.5),
  }
}
