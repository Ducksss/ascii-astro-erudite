import {
  frameToHtml,
  renderAsciiFrame,
  type AsciiRenderOptions,
} from './render'

interface FrameRequest {
  id: number
  options: AsciiRenderOptions
}

const scope = globalThis as unknown as {
  onmessage: ((event: MessageEvent<FrameRequest>) => void) | null
  postMessage: (message: unknown) => void
}

scope.onmessage = ({ data }) => {
  const started = performance.now()
  const html = frameToHtml(renderAsciiFrame(data.options))
  scope.postMessage({ id: data.id, html, ms: performance.now() - started })
}
