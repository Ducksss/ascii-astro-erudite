import * as React from 'react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  CHARSET_OPTIONS,
  DEFAULT_RENDER_OPTIONS,
  DEFAULT_TRANSPARENT_PADDING,
  DEFAULT_WIDTH,
  GRADIENT_OPTIONS,
  clamp,
  getPaddedCanvasSize,
  renderAsciiFromRgba,
} from './ascii-generator-utils'
import type {
  CharsetPreset,
  GradientPreset,
} from './ascii-generator-utils'

type RenderedAscii = {
  lines: string[]
  text: string
  sourceWidth: number
  sourceHeight: number
  outputWidth: number
  outputHeight: number
}

type ExportLayout = {
  barHeight: number
  paddingX: number
  paddingY: number
  fontSize: number
  lineHeight: number
  frameWidth: number
  frameHeight: number
}

type DotMassOptions = {
  centerX: number
  centerY: number
  radius: number
  step: number
  seed: number
  opacity: number
}

const ART_FRAME_THEME = {
  background: '#050505',
  surfaceHighlightTop: 'rgba(255,255,255,0.05)',
  surfaceHighlightBottom: 'rgba(255,255,255,0.015)',
  border: 'rgba(255,255,255,0.12)',
  innerBorder: 'rgba(255,255,255,0.04)',
  barBorder: 'rgba(255,255,255,0.08)',
  barText: 'rgba(255,255,255,0.46)',
  barBackground: 'rgba(0,0,0,0.78)',
  text: 'rgba(255,255,255,0.92)',
  mutedText: 'rgba(255,255,255,0.58)',
  labelText: 'rgba(255,255,255,0.42)',
  scanline: 'rgba(255,255,255,0.05)',
  pageGrid: 'rgba(255,255,255,0.045)',
  shadow: 'rgba(0,0,0,0.42)',
  exportScale: 2,
  scanlineStep: 14,
  minFrameWidth: 680,
} as const

const TERMINAL_SURFACE_STYLE: React.CSSProperties = {
  borderColor: ART_FRAME_THEME.border,
  background: `linear-gradient(180deg, ${ART_FRAME_THEME.surfaceHighlightTop}, ${ART_FRAME_THEME.surfaceHighlightBottom}), ${ART_FRAME_THEME.background}`,
  boxShadow: `inset 0 0 0 1px ${ART_FRAME_THEME.innerBorder}, 0 24px 90px ${ART_FRAME_THEME.shadow}`,
}

const FRAME_SCANLINE_STYLE: React.CSSProperties = {
  backgroundImage: `linear-gradient(to bottom, transparent 0, transparent 13px, ${ART_FRAME_THEME.scanline} 14px)`,
  backgroundSize: '100% 14px',
}

function createSeededRandom(seed: number) {
  let currentSeed = seed

  return () => {
    currentSeed += 0x6d2b79f5
    let value = Math.imul(currentSeed ^ (currentSeed >>> 15), currentSeed | 1)
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61)

    return ((value ^ (value >>> 14)) >>> 0) / 4294967296
  }
}

function buildDownloadStem(fileName: string) {
  return fileName.replace(/\.[^.]+$/, '') || 'ascii-output'
}

function getDisplayFontSize(outputWidth: number) {
  return clamp(0.78 - outputWidth * 0.0024, 0.39, 0.68)
}

function getExportFontSize(outputWidth: number) {
  return clamp(18 - Math.max(outputWidth - 72, 0) * 0.05, 12.5, 16.5)
}

async function loadImage(url: string) {
  return await new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image()

    image.onload = () => resolve(image)
    image.onerror = () =>
      reject(new Error('Could not decode the uploaded image.'))
    image.src = url
  })
}

async function ensureGeistMonoReady() {
  if (typeof document === 'undefined' || !('fonts' in document)) return

  await Promise.allSettled([
    document.fonts.load('500 16px "Geist Mono"'),
    document.fonts.ready,
  ])
}

function measureTrackedText(
  context: CanvasRenderingContext2D,
  text: string,
  tracking: number,
) {
  let width = 0

  for (const [index, character] of [...text].entries()) {
    width += context.measureText(character).width
    if (index < text.length - 1) {
      width += tracking
    }
  }

  return width
}

function drawTrackedText(
  context: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  tracking: number,
  align: 'left' | 'right' = 'left',
) {
  let cursor = x

  if (align === 'right') {
    cursor -= measureTrackedText(context, text, tracking)
  }

  for (const [index, character] of [...text].entries()) {
    context.fillText(character, cursor, y)
    cursor += context.measureText(character).width

    if (index < text.length - 1) {
      cursor += tracking
    }
  }
}

function drawAtmosphereCloud(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  opacity: number,
  scaleY = 1,
) {
  context.save()
  context.translate(x, y)
  context.scale(1, scaleY)

  const gradient = context.createRadialGradient(0, 0, 0, 0, 0, radius)
  gradient.addColorStop(0, `rgba(255,255,255,${opacity})`)
  gradient.addColorStop(1, 'rgba(255,255,255,0)')

  context.fillStyle = gradient
  context.fillRect(-radius, -radius, radius * 2, radius * 2)
  context.restore()
}

function drawDotMass(
  context: CanvasRenderingContext2D,
  { centerX, centerY, radius, step, seed, opacity }: DotMassOptions,
) {
  const random = createSeededRandom(seed)

  context.save()

  for (let y = centerY - radius; y <= centerY + radius; y += step) {
    for (let x = centerX - radius; x <= centerX + radius; x += step) {
      const dx = (x - centerX) / (radius * 1.02)
      const dy = (y - centerY) / (radius * 0.96)
      const distance = Math.hypot(dx, dy)

      if (distance > 1) continue

      const mask = Math.max(0, 1 - distance * 1.35)
      if (mask <= 0) continue

      const jitterX = (random() - 0.5) * step * 0.48
      const jitterY = (random() - 0.5) * step * 0.48
      const dotRadius = 0.7 + random() * 0.9
      const alpha = opacity * mask * (0.55 + random() * 0.55)

      context.fillStyle = `rgba(255,255,255,${alpha})`
      context.beginPath()
      context.arc(x + jitterX, y + jitterY, dotRadius, 0, Math.PI * 2)
      context.fill()
    }
  }

  context.restore()
}

function drawFineGrain(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
) {
  const random = createSeededRandom(978341)
  const count = Math.round((width * height) / 5800)

  context.save()

  for (let index = 0; index < count; index += 1) {
    const x = random() * width
    const y = random() * height
    const size = 0.35 + random() * 1.15
    const alpha = 0.015 + random() * 0.045

    context.fillStyle = `rgba(255,255,255,${alpha})`
    context.fillRect(x, y, size, size)
  }

  context.restore()
}

function drawScanlines(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
) {
  context.save()
  context.fillStyle = ART_FRAME_THEME.scanline

  for (
    let y = ART_FRAME_THEME.scanlineStep - 1;
    y < height;
    y += ART_FRAME_THEME.scanlineStep
  ) {
    context.fillRect(0, y, width, 1)
  }

  context.restore()
}

function drawLandingBackdrop(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
) {
  context.fillStyle = ART_FRAME_THEME.background
  context.fillRect(0, 0, width, height)

  const surfaceGradient = context.createLinearGradient(0, 0, 0, height)
  surfaceGradient.addColorStop(0, ART_FRAME_THEME.surfaceHighlightTop)
  surfaceGradient.addColorStop(1, ART_FRAME_THEME.surfaceHighlightBottom)

  context.fillStyle = surfaceGradient
  context.fillRect(0, 0, width, height)

  const topFade = context.createLinearGradient(0, 0, 0, Math.min(height * 0.22, 180))
  topFade.addColorStop(0, 'rgba(0,0,0,0.92)')
  topFade.addColorStop(0.56, 'rgba(0,0,0,0.55)')
  topFade.addColorStop(1, 'rgba(0,0,0,0)')

  context.fillStyle = topFade
  context.fillRect(0, 0, width, Math.min(height * 0.22, 180))

  drawAtmosphereCloud(context, width * 0.2, height * 0.2, width * 0.42, 0.11, 0.8)
  drawAtmosphereCloud(context, width * 0.82, height * 0.04, width * 0.3, 0.06, 0.76)
  drawAtmosphereCloud(context, width * 0.42, height * 0.74, width * 0.28, 0.06, 0.8)

  drawDotMass(context, {
    centerX: width * 0.15,
    centerY: height * 0.18,
    radius: width * 0.22,
    step: 18,
    seed: 103,
    opacity: 0.24,
  })
  drawDotMass(context, {
    centerX: width * 0.9,
    centerY: height * 0.88,
    radius: width * 0.24,
    step: 20,
    seed: 947,
    opacity: 0.2,
  })

  drawFineGrain(context, width, height)
}

function getExportLayout(
  context: CanvasRenderingContext2D,
  rendered: RenderedAscii,
): ExportLayout {
  const fontSize = getExportFontSize(rendered.outputWidth)
  const lineHeight = Math.round(fontSize * 1.1)
  const paddingX = Math.round(fontSize * 2.8)
  const paddingY = Math.round(fontSize * 2.2)
  const barHeight = 54

  context.font = `500 ${fontSize}px "Geist Mono", monospace`

  const maxLineWidth = rendered.lines.reduce((maximumWidth, line) => {
    return Math.max(maximumWidth, context.measureText(line).width)
  }, 0)

  const frameWidth = Math.ceil(
    Math.max(ART_FRAME_THEME.minFrameWidth, maxLineWidth + paddingX * 2),
  )
  const frameHeight = Math.ceil(
    barHeight + paddingY * 2 + lineHeight * rendered.lines.length,
  )

  return {
    barHeight,
    paddingX,
    paddingY,
    fontSize,
    lineHeight,
    frameWidth,
    frameHeight,
  }
}

function drawLandingFrame(
  context: CanvasRenderingContext2D,
  rendered: RenderedAscii,
  layout: ExportLayout,
) {
  drawLandingBackdrop(context, layout.frameWidth, layout.frameHeight)

  context.fillStyle = ART_FRAME_THEME.barBackground
  context.fillRect(0, 0, layout.frameWidth, layout.barHeight)

  context.save()
  context.strokeStyle = ART_FRAME_THEME.barBorder
  context.beginPath()
  context.moveTo(0, layout.barHeight + 0.5)
  context.lineTo(layout.frameWidth, layout.barHeight + 0.5)
  context.stroke()
  context.restore()

  context.font = '500 11px "Geist Mono", monospace'
  context.textBaseline = 'middle'
  context.fillStyle = ART_FRAME_THEME.barText
  drawTrackedText(
    context,
    'ASCII SIGNAL LAB',
    18,
    layout.barHeight / 2,
    3.8,
  )
  drawTrackedText(
    context,
    'LANDING FRAME',
    layout.frameWidth - 18,
    layout.barHeight / 2,
    3.8,
    'right',
  )

  context.save()
  context.beginPath()
  context.rect(
    0,
    layout.barHeight,
    layout.frameWidth,
    layout.frameHeight - layout.barHeight,
  )
  context.clip()

  context.font = `500 ${layout.fontSize}px "Geist Mono", monospace`
  context.textBaseline = 'top'
  context.fillStyle = ART_FRAME_THEME.text

  let y = layout.barHeight + layout.paddingY

  for (const line of rendered.lines) {
    context.fillText(line, layout.paddingX, y)
    y += layout.lineHeight
  }

  context.restore()
  drawScanlines(context, layout.frameWidth, layout.frameHeight)

  context.save()
  context.strokeStyle = ART_FRAME_THEME.border
  context.lineWidth = 1
  context.strokeRect(0.5, 0.5, layout.frameWidth - 1, layout.frameHeight - 1)
  context.strokeStyle = ART_FRAME_THEME.innerBorder
  context.strokeRect(1.5, 1.5, layout.frameWidth - 3, layout.frameHeight - 3)
  context.restore()
}

export default function AsciiGenerator() {
  const inputId = React.useId()
  const [imageUrl, setImageUrl] = React.useState<string | null>(null)
  const [fileName, setFileName] = React.useState('')
  const [rendered, setRendered] = React.useState<RenderedAscii | null>(null)
  const [error, setError] = React.useState<string | null>(null)
  const [isDragging, setIsDragging] = React.useState(false)
  const [isRendering, setIsRendering] = React.useState(false)
  const [isExportingPng, setIsExportingPng] = React.useState(false)
  const [copied, setCopied] = React.useState(false)

  const [width, setWidth] = React.useState(DEFAULT_WIDTH)
  const [brightness, setBrightness] = React.useState(
    DEFAULT_RENDER_OPTIONS.brightness,
  )
  const [contrast, setContrast] = React.useState(
    DEFAULT_RENDER_OPTIONS.contrast,
  )
  const [saturation, setSaturation] = React.useState(
    DEFAULT_RENDER_OPTIONS.saturation,
  )
  const [grayscale, setGrayscale] = React.useState(
    DEFAULT_RENDER_OPTIONS.grayscale,
  )
  const [spaceDensity, setSpaceDensity] = React.useState(
    DEFAULT_RENDER_OPTIONS.spaceDensity,
  )
  const [invert, setInvert] = React.useState(DEFAULT_RENDER_OPTIONS.invert)
  const [charset, setCharset] = React.useState<CharsetPreset>(
    DEFAULT_RENDER_OPTIONS.charset,
  )
  const [gradient, setGradient] = React.useState<GradientPreset>(
    DEFAULT_RENDER_OPTIONS.gradient,
  )
  const [transparentPadding, setTransparentPadding] = React.useState(
    DEFAULT_TRANSPARENT_PADDING,
  )

  React.useEffect(() => {
    return () => {
      if (imageUrl) {
        URL.revokeObjectURL(imageUrl)
      }
    }
  }, [imageUrl])

  React.useEffect(() => {
    if (!imageUrl) {
      setRendered(null)
      return
    }

    let cancelled = false

    const renderAscii = async () => {
      setIsRendering(true)
      setError(null)

      try {
        const image = await loadImage(imageUrl)
        if (cancelled) return

        const outputWidth = clamp(width, 48, 160)
        const outputHeight = clamp(
          Math.round(
            (image.naturalHeight / image.naturalWidth) * outputWidth * 0.55,
          ),
          18,
          160,
        )
        const canvas = document.createElement('canvas')
        const context = canvas.getContext('2d', { willReadFrequently: true })

        if (!context) {
          throw new Error('Canvas is unavailable in this browser.')
        }

        canvas.width = outputWidth
        canvas.height = outputHeight
        context.drawImage(image, 0, 0, outputWidth, outputHeight)

        const frame = context.getImageData(0, 0, outputWidth, outputHeight)
        const { lines, text } = renderAsciiFromRgba(
          frame.data,
          outputWidth,
          outputHeight,
          {
            charset,
            brightness,
            contrast,
            saturation,
            grayscale,
            invert,
            gradient,
            spaceDensity,
          },
        )
        if (cancelled) return

        React.startTransition(() => {
          setRendered({
            lines,
            text,
            sourceWidth: image.naturalWidth,
            sourceHeight: image.naturalHeight,
            outputWidth,
            outputHeight,
          })
        })
      } catch (renderError) {
        if (!cancelled) {
          setRendered(null)
          setError(
            renderError instanceof Error
              ? renderError.message
              : 'Something went wrong while generating ASCII.',
          )
        }
      } finally {
        if (!cancelled) {
          setIsRendering(false)
        }
      }
    }

    void renderAscii()

    return () => {
      cancelled = true
    }
  }, [
    brightness,
    charset,
    contrast,
    gradient,
    grayscale,
    imageUrl,
    invert,
    saturation,
    spaceDensity,
    width,
  ])

  function replaceImage(file: File | null) {
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setError(
        'Upload a PNG, JPG, WebP, GIF, or another standard image format.',
      )
      return
    }

    const nextUrl = URL.createObjectURL(file)

    setImageUrl((currentUrl) => {
      if (currentUrl) {
        URL.revokeObjectURL(currentUrl)
      }

      return nextUrl
    })
    setFileName(file.name)
    setCopied(false)
    setError(null)
  }

  async function handleCopy() {
    if (!rendered?.text || !navigator.clipboard) return

    await navigator.clipboard.writeText(rendered.text)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1500)
  }

  function handleDownloadText() {
    if (!rendered?.text) return

    const blob = new Blob([rendered.text], {
      type: 'text/plain;charset=utf-8',
    })
    const link = document.createElement('a')
    const downloadUrl = URL.createObjectURL(blob)

    link.href = downloadUrl
    link.download = `${buildDownloadStem(fileName)}.txt`
    document.body.append(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(downloadUrl)
  }

  async function handleDownloadPng() {
    if (!rendered) return

    setIsExportingPng(true)
    setError(null)

    try {
      await ensureGeistMonoReady()

      const measurementCanvas = document.createElement('canvas')
      const measurementContext = measurementCanvas.getContext('2d')

      if (!measurementContext) {
        throw new Error('Canvas is unavailable in this browser.')
      }

      const layout = getExportLayout(measurementContext, rendered)
      const canvas = document.createElement('canvas')
      const scale = ART_FRAME_THEME.exportScale

      const paddedCanvasSize = getPaddedCanvasSize(
        layout.frameWidth,
        layout.frameHeight,
        transparentPadding,
        scale,
      )

      canvas.width = paddedCanvasSize.width
      canvas.height = paddedCanvasSize.height

      const context = canvas.getContext('2d')

      if (!context) {
        throw new Error('Could not initialize the PNG export canvas.')
      }

      context.scale(scale, scale)
      context.translate(transparentPadding, transparentPadding)
      drawLandingFrame(context, rendered, layout)

      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((value) => {
          if (value) {
            resolve(value)
            return
          }

          reject(new Error('Could not generate the PNG export.'))
        }, 'image/png')
      })

      const link = document.createElement('a')
      const downloadUrl = URL.createObjectURL(blob)

      link.href = downloadUrl
      link.download = `${buildDownloadStem(fileName)}-ascii.png`
      document.body.append(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(downloadUrl)
    } catch (exportError) {
      setError(
        exportError instanceof Error
          ? exportError.message
          : 'Something went wrong while exporting the PNG.',
      )
    } finally {
      setIsExportingPng(false)
    }
  }

  const displayFontSize = rendered
    ? getDisplayFontSize(rendered.outputWidth)
    : getDisplayFontSize(DEFAULT_WIDTH)

  return (
    <div className="grid gap-6 lg:items-start lg:grid-cols-[minmax(320px,0.44fr)_minmax(0,1fr)] xl:gap-8">
      <section
        className="landing-terminal relative overflow-hidden"
        style={TERMINAL_SURFACE_STYLE}
      >
        <div className="landing-terminal-bar">
          <span>Playground</span>
          <span>ASCII art playground</span>
        </div>
        <div className="relative space-y-6 p-5 sm:p-6">
          <div className="space-y-4">
            <div>
              <p className="landing-kicker">Public tool</p>
              <h1 className="mt-4 max-w-md text-[clamp(2.4rem,6vw,4.8rem)] leading-[0.9] font-semibold tracking-[-0.08em] text-white">
                Upload an image and export it as a landing-page ASCII frame.
              </h1>
            </div>
            <p className="max-w-lg text-sm leading-7 text-white/58 sm:text-base">
              This lives as a small footer-linked playground and locks the
              final render to the same black, terminal treatment as the landing
              hero.
            </p>
          </div>

          <label
            htmlFor={inputId}
            onDragEnter={() => setIsDragging(true)}
            onDragLeave={() => setIsDragging(false)}
            onDragOver={(event) => {
              event.preventDefault()
              if (!isDragging) {
                setIsDragging(true)
              }
            }}
            onDrop={(event) => {
              event.preventDefault()
              setIsDragging(false)
              replaceImage(event.dataTransfer.files?.[0] ?? null)
            }}
            className={cn(
              'group flex cursor-pointer flex-col gap-3 border px-4 py-5 transition-all duration-300',
              isDragging
                ? 'border-white/40 bg-white/8'
                : 'border-white/12 bg-white/[0.035] hover:border-white/24 hover:bg-white/[0.055]',
            )}
          >
            <span className="font-mono text-[0.68rem] tracking-[0.28em] text-white/42 uppercase">
              Upload surface
            </span>
            <div className="space-y-2">
              <p className="text-base font-medium text-white">
                {fileName || 'Drop an image here or browse from disk.'}
              </p>
              <p className="text-sm leading-6 text-white/48">
                PNG, JPG, WebP, GIF, and any browser-decodable image format
                should work.
              </p>
            </div>
            <div className="pt-1">
              <span className="inline-flex items-center gap-2 border border-white/14 px-3 py-2 text-sm text-white/76 transition-colors group-hover:border-white/30 group-hover:text-white">
                Choose image
              </span>
            </div>
            <input
              id={inputId}
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={(event) =>
                replaceImage(event.target.files?.[0] ?? null)
              }
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <label className="space-y-2">
              <span className="font-mono text-[0.66rem] tracking-[0.24em] text-white/36 uppercase">
                Character width
              </span>
              <input
                type="range"
                min={48}
                max={160}
                step={4}
                value={width}
                onChange={(event) => setWidth(Number(event.target.value))}
                className="w-full accent-white"
              />
              <span className="text-sm text-white/62">{width} columns</span>
            </label>

            <label className="space-y-2">
              <span className="font-mono text-[0.66rem] tracking-[0.24em] text-white/36 uppercase">
                Character set
              </span>
              <select
                value={charset}
                onChange={(event) =>
                  setCharset(event.target.value as CharsetPreset)
                }
                className="h-11 w-full border border-white/12 bg-black/40 px-3 text-sm text-white transition-colors outline-none focus:border-white/28"
              >
                {CHARSET_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-2">
              <span className="font-mono text-[0.66rem] tracking-[0.24em] text-white/36 uppercase">
                ASCII gradient
              </span>
              <select
                value={gradient}
                onChange={(event) =>
                  setGradient(event.target.value as GradientPreset)
                }
                className="h-11 w-full border border-white/12 bg-black/40 px-3 text-sm text-white transition-colors outline-none focus:border-white/28"
              >
                {GRADIENT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-2">
              <span className="font-mono text-[0.66rem] tracking-[0.24em] text-white/36 uppercase">
                Brightness
              </span>
              <input
                type="range"
                min={60}
                max={145}
                step={5}
                value={brightness}
                onChange={(event) => setBrightness(Number(event.target.value))}
                className="w-full accent-white"
              />
              <span className="text-sm text-white/62">{brightness}%</span>
            </label>

            <label className="space-y-2">
              <span className="font-mono text-[0.66rem] tracking-[0.24em] text-white/36 uppercase">
                Contrast
              </span>
              <input
                type="range"
                min={70}
                max={180}
                step={5}
                value={contrast}
                onChange={(event) => setContrast(Number(event.target.value))}
                className="w-full accent-white"
              />
              <span className="text-sm text-white/62">{contrast}%</span>
            </label>

            <label className="space-y-2">
              <span className="font-mono text-[0.66rem] tracking-[0.24em] text-white/36 uppercase">
                Saturation
              </span>
              <input
                type="range"
                min={0}
                max={200}
                step={5}
                value={saturation}
                onChange={(event) => setSaturation(Number(event.target.value))}
                className="w-full accent-white"
              />
              <span className="text-sm text-white/62">{saturation}%</span>
            </label>

            <label className="space-y-2">
              <span className="font-mono text-[0.66rem] tracking-[0.24em] text-white/36 uppercase">
                Grayscale
              </span>
              <input
                type="range"
                min={0}
                max={100}
                step={5}
                value={grayscale}
                onChange={(event) => setGrayscale(Number(event.target.value))}
                className="w-full accent-white"
              />
              <span className="text-sm text-white/62">{grayscale}%</span>
            </label>

            <label className="space-y-2">
              <span className="font-mono text-[0.66rem] tracking-[0.24em] text-white/36 uppercase">
                Space density
              </span>
              <input
                type="range"
                min={0}
                max={100}
                step={2}
                value={spaceDensity}
                onChange={(event) =>
                  setSpaceDensity(Number(event.target.value))
                }
                className="w-full accent-white"
              />
              <span className="text-sm text-white/62">{spaceDensity}%</span>
            </label>

            <label className="space-y-2">
              <span className="font-mono text-[0.66rem] tracking-[0.24em] text-white/36 uppercase">
                Transparent frame
              </span>
              <input
                type="range"
                min={0}
                max={128}
                step={4}
                value={transparentPadding}
                onChange={(event) =>
                  setTransparentPadding(Number(event.target.value))
                }
                className="w-full accent-white"
              />
              <span className="text-sm text-white/62">
                {transparentPadding}px PNG padding
              </span>
            </label>
          </div>

          <label className="flex items-center gap-3 border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white/72">
            <input
              type="checkbox"
              checked={invert}
              onChange={(event) => setInvert(event.target.checked)}
              className="size-4 accent-white"
            />
            Invert density mapping for bright-on-dark source images.
          </label>

          <div className="grid gap-px border border-white/10 bg-white/6 sm:grid-cols-3">
            <div className="bg-black/25 px-4 py-4">
              <p className="font-mono text-[0.64rem] tracking-[0.26em] text-white/34 uppercase">
                Source
              </p>
              <p className="mt-2 text-xl font-medium text-white">
                {rendered
                  ? `${rendered.sourceWidth} x ${rendered.sourceHeight}`
                  : '--'}
              </p>
            </div>
            <div className="bg-black/25 px-4 py-4">
              <p className="font-mono text-[0.64rem] tracking-[0.26em] text-white/34 uppercase">
                Output
              </p>
              <p className="mt-2 text-xl font-medium text-white">
                {rendered
                  ? `${rendered.outputWidth} x ${rendered.outputHeight}`
                  : '--'}
              </p>
            </div>
            <div className="bg-black/25 px-4 py-4">
              <p className="font-mono text-[0.64rem] tracking-[0.26em] text-white/34 uppercase">
                Text payload
              </p>
              <p className="mt-2 text-xl font-medium text-white">
                {rendered ? rendered.text.length.toLocaleString() : '--'}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section
        className="landing-terminal relative overflow-hidden lg:sticky lg:top-24"
        style={TERMINAL_SURFACE_STYLE}
      >
        <div className="landing-terminal-bar">
          <span>Rendered output</span>
          <div className="flex flex-wrap items-center justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={!rendered?.text}
              onClick={() => void handleCopy()}
              className="border border-white/12 bg-white/[0.03] text-white/72 hover:bg-white/[0.08] hover:text-white"
            >
              {copied ? 'Copied' : 'Copy ASCII'}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={!rendered?.text}
              onClick={handleDownloadText}
              className="border border-white/12 bg-white/[0.03] text-white/72 hover:bg-white/[0.08] hover:text-white"
            >
              Download .txt
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={!rendered?.text || isExportingPng}
              onClick={() => void handleDownloadPng()}
              className="border border-white/12 bg-white/[0.03] text-white/72 hover:bg-white/[0.08] hover:text-white"
            >
              {isExportingPng ? 'Exporting PNG' : 'Download PNG'}
            </Button>
          </div>
        </div>

        <div className="grid gap-5 p-5 sm:p-6 lg:max-h-[calc(100svh-8.5rem)] lg:overflow-y-auto xl:grid-cols-[240px_minmax(0,1fr)]">
          <div className="space-y-4">
            <div className="space-y-2">
              <p className="font-mono text-[0.68rem] tracking-[0.28em] text-white/42 uppercase">
                Input preview
              </p>
              <div className="relative aspect-[4/5] overflow-hidden border border-white/10 bg-[#050505]">
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center px-6 text-center text-sm leading-7 text-white/42">
                    Upload an image to generate a live ASCII preview.
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <p className="font-mono text-[0.68rem] tracking-[0.28em] text-white/42 uppercase">
                Export treatment
              </p>
              <p className="text-sm leading-7 text-white/58">
                The PNG locks to the landing palette: pure black base,
                monochrome terminal chrome, grain, scanlines, and dot-mass
                atmosphere. Transparent frame padding only affects the exported
                PNG.
              </p>
              <div className="inline-flex items-center gap-2 border border-white/12 px-3 py-2 text-xs tracking-[0.2em] text-white/72 uppercase">
                Exact landing treatment
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div
              className="relative min-h-[30rem] overflow-hidden border"
              style={TERMINAL_SURFACE_STYLE}
            >
              <div
                className="pointer-events-none absolute inset-0 opacity-35"
                style={FRAME_SCANLINE_STYLE}
              />
              <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black via-black/70 to-transparent" />
              <div className="landing-dot-mass absolute -top-12 -left-[4.5rem] h-52 w-52 opacity-[0.34] sm:h-64 sm:w-64" />
              <div className="landing-dot-mass landing-dot-mass--reverse absolute -right-10 -bottom-[4.5rem] h-56 w-56 opacity-[0.28] sm:h-72 sm:w-72" />
              <div className="landing-grain pointer-events-none absolute inset-0" />

              <div className="relative flex items-center justify-between border-b border-white/10 px-4 py-3 font-mono text-[0.68rem] tracking-[0.28em] text-white/46 uppercase">
                <span>ASCII art playground</span>
                <span>Landing frame</span>
              </div>

              <div className="relative overflow-auto p-4 sm:p-6">
                {error ? (
                  <div className="border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm leading-7 text-red-50">
                    {error}
                  </div>
                ) : isRendering ? (
                  <div className="flex min-h-[22rem] items-center justify-center text-sm tracking-[0.26em] text-white/42 uppercase">
                    Rendering...
                  </div>
                ) : rendered ? (
                  <pre
                    className="min-h-[22rem] whitespace-pre font-mono text-white/92"
                    style={{
                      fontSize: `${displayFontSize.toFixed(3)}rem`,
                      lineHeight: 0.92,
                    }}
                  >
                    {rendered.text}
                  </pre>
                ) : (
                  <div className="flex min-h-[22rem] items-center justify-center px-8 text-center text-sm leading-7 text-white/42">
                    The ASCII output will appear here once an image is selected.
                  </div>
                )}
              </div>
            </div>

            <div className="border border-white/10 bg-black/30 px-4 py-4">
              <p className="font-mono text-[0.66rem] tracking-[0.26em] text-white/34 uppercase">
                Export frame
              </p>
              <p className="mt-3 text-sm leading-7 text-white/56">
                PNG output captures this art frame only, not the upload controls
                or surrounding page layout.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
