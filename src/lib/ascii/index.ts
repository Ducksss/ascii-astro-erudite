import {
  frameToHtml,
  renderAsciiFrame,
  type AsciiFrame,
  type AsciiRenderOptions,
} from './render'

export { ASCII_OBJECTS, type AsciiObjectName } from './objects'
export * from './render'

const cache = new Map<string, { frame: AsciiFrame; html: string }>()

/** Renders once per build for each distinct set of options (the footer coin appears on every page). */
export function renderCached(options: AsciiRenderOptions) {
  const key = JSON.stringify(options)
  let entry = cache.get(key)
  if (!entry) {
    const frame = renderAsciiFrame(options)
    entry = { frame, html: frameToHtml(frame) }
    cache.set(key, entry)
  }
  return entry
}
