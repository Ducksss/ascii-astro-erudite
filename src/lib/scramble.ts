const GLYPHS = '.:-=+*#%@01'
const running = new WeakMap<HTMLElement, number>()

/**
 * Decodes `text` into `element`: characters cycle through ASCII glyphs and
 * settle left to right. Meant for decorative readouts; set `aria-hidden` on
 * the element or keep the real text elsewhere.
 */
export function scramble(element: HTMLElement, text: string, duration = 520) {
  cancelAnimationFrame(running.get(element) ?? 0)
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
    element.textContent = text
    return
  }
  const started = performance.now()
  const frame = (now: number) => {
    const progress = Math.min((now - started) / duration, 1)
    const settled = Math.floor(progress * text.length)
    let output = ''
    for (let index = 0; index < text.length; index++) {
      const character = text[index]
      output +=
        index < settled || character === ' '
          ? character
          : GLYPHS[Math.floor(Math.random() * GLYPHS.length)]
    }
    element.textContent = output
    if (progress < 1) running.set(element, requestAnimationFrame(frame))
  }
  running.set(element, requestAnimationFrame(frame))
}
