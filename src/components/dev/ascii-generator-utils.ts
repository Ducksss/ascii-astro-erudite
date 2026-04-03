export type CharsetPreset =
  | 'dense'
  | 'terminal'
  | 'minimal'
  | 'blocks'
  | 'braille'
  | 'technical'
  | 'arrows'
  | 'cp437'

export type GradientPreset =
  | 'linear'
  | 'smooth'
  | 'stepped'
  | 'shadow-bias'
  | 'highlight-bias'
  | 'contrast-punch'
  | 'posterized'
  | 'midtone-boost'

export type AsciiRenderOptions = {
  charset: CharsetPreset
  brightness: number
  contrast: number
  saturation: number
  grayscale: number
  invert: boolean
  gradient: GradientPreset
  spaceDensity: number
}

export const CHARSETS: Record<CharsetPreset, string> = {
  dense: ' .,:;irsXA253hMHGS#9B&@',
  terminal: ' .:-=+*#%@',
  minimal: ' .oO8#',
  blocks: ' ░▒▓█',
  braille: ' ⠂⠅⠇⡇⣇⣧⣷⣿',
  technical: ' .,:-=+*#%@MW',
  arrows: ' .,:;<>^v\\/|↔↕↑↓←→',
  cp437: ' .·░▒▓█▄▀■',
}

export const DEFAULT_WIDTH = 112
export const DEFAULT_TRANSPARENT_PADDING = 0

export const DEFAULT_RENDER_OPTIONS: AsciiRenderOptions = {
  charset: 'dense',
  brightness: 100,
  contrast: 115,
  saturation: 100,
  grayscale: 0,
  invert: false,
  gradient: 'linear',
  spaceDensity: 28,
}

export const CHARSET_OPTIONS: Array<{ value: CharsetPreset; label: string }> = [
  { value: 'dense', label: 'Dense' },
  { value: 'terminal', label: 'Terminal' },
  { value: 'minimal', label: 'Minimal' },
  { value: 'blocks', label: 'Blocks' },
  { value: 'braille', label: 'Braille' },
  { value: 'technical', label: 'Technical' },
  { value: 'arrows', label: 'Arrows' },
  { value: 'cp437', label: 'CP437' },
]

export const GRADIENT_OPTIONS: Array<{
  value: GradientPreset
  label: string
}> = [
  { value: 'linear', label: 'Linear' },
  { value: 'smooth', label: 'Smooth' },
  { value: 'stepped', label: 'Stepped' },
  { value: 'shadow-bias', label: 'Shadow bias' },
  { value: 'highlight-bias', label: 'Highlight bias' },
  { value: 'contrast-punch', label: 'Contrast punch' },
  { value: 'posterized', label: 'Posterized' },
  { value: 'midtone-boost', label: 'Midtone boost' },
]

export function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

export function mix(from: number, to: number, amount: number) {
  return from + (to - from) * amount
}

export function remapGradient(value: number, gradient: GradientPreset) {
  switch (gradient) {
    case 'smooth':
      return value * value * (3 - 2 * value)
    case 'stepped':
      return Math.round(value * 8) / 8
    case 'shadow-bias':
      return 1 - (1 - value) ** 1.35
    case 'highlight-bias':
      return value ** 1.35
    case 'contrast-punch':
      return clamp((value - 0.5) * 1.45 + 0.5, 0, 1)
    case 'posterized':
      return Math.round(value * 5) / 5
    case 'midtone-boost':
      return clamp(
        value + (0.25 - (value - 0.5) * (value - 0.5)) * 0.24,
        0,
        1,
      )
    default:
      return value
  }
}

export function remapSpaceDensity(value: number, spaceDensity: number) {
  const gamma = 0.72 + (spaceDensity / 100) * 1.68
  return clamp(value ** gamma, 0, 1)
}

export function getSampledLuminance(
  r: number,
  g: number,
  b: number,
  alpha: number,
  saturation: number,
  grayscale: number,
) {
  const perceptualLuminance = clamp(
    (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255,
    0,
    1,
  )
  const grayscaleTone = clamp((r + g + b) / (255 * 3), 0, 1)
  const monochromeBase = mix(
    perceptualLuminance,
    grayscaleTone,
    grayscale / 100,
  )
  const chroma = (Math.max(r, g, b) - Math.min(r, g, b)) / 255
  const chromaTone = clamp(monochromeBase - chroma * 0.18, 0, 1)
  const saturationBias = saturation / 100 - 1

  return clamp(
    (monochromeBase + (chromaTone - monochromeBase) * saturationBias) * alpha,
    0,
    1,
  )
}

export function mapLuminanceToCharacter(
  luminance: number,
  options: AsciiRenderOptions,
) {
  const characters = CHARSETS[options.charset]
  const contrastRatio = options.contrast / 100
  const brightnessRatio = options.brightness / 100
  const contrasted = clamp(
    ((luminance - 0.5) * contrastRatio + 0.5) * brightnessRatio,
    0,
    1,
  )
  const mappedLuminance = options.invert ? contrasted : 1 - contrasted
  const gradientMapped = remapGradient(mappedLuminance, options.gradient)
  const densityMapped = remapSpaceDensity(gradientMapped, options.spaceDensity)
  const characterIndex = clamp(
    Math.floor(densityMapped * (characters.length - 1)),
    0,
    characters.length - 1,
  )

  return characters[characterIndex] ?? ' '
}

export function renderAsciiFromRgba(
  rgba: ArrayLike<number>,
  outputWidth: number,
  outputHeight: number,
  options: AsciiRenderOptions,
) {
  const lines: string[] = []

  for (let y = 0; y < outputHeight; y += 1) {
    let row = ''

    for (let x = 0; x < outputWidth; x += 1) {
      const index = (y * outputWidth + x) * 4
      const luminance = getSampledLuminance(
        rgba[index] ?? 0,
        rgba[index + 1] ?? 0,
        rgba[index + 2] ?? 0,
        (rgba[index + 3] ?? 0) / 255,
        options.saturation,
        options.grayscale,
      )

      row += mapLuminanceToCharacter(luminance, options)
    }

    lines.push(row)
  }

  return {
    lines,
    text: lines.join('\n'),
  }
}

export function getPaddedCanvasSize(
  frameWidth: number,
  frameHeight: number,
  transparentPadding: number,
  scale: number,
) {
  const padding = Math.max(0, transparentPadding)

  return {
    width: Math.ceil((frameWidth + padding * 2) * scale),
    height: Math.ceil((frameHeight + padding * 2) * scale),
  }
}
