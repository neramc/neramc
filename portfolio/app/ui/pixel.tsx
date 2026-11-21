import type { Handle } from 'remix/component'

import { FONT, ICONS, type IconName } from './pixel-art.ts'

const GLYPH_HEIGHT = 7

function runs(rows: readonly string[], x0: number, match: (cell: string) => boolean) {
  let d = ''
  rows.forEach((row, y) => {
    let x = 0
    while (x < row.length) {
      if (!match(row[x])) {
        x++
        continue
      }
      let start = x
      while (x < row.length && match(row[x])) x++
      d += `M${x0 + start} ${y}h${x - start}v1h${start - x}z`
    }
  })
  return d
}

export function layoutText(text: string) {
  let d = ''
  let x = 0
  for (let char of text.toUpperCase()) {
    let glyph = FONT[char] ?? FONT[' ']
    d += runs(glyph, x, (cell) => cell === '#')
    x += glyph[0].length + 1
  }
  return { d, width: Math.max(x - 1, 1) }
}

/**
 * Text drawn in the pixel font. Decorative: pair it with real text for
 * assistive tech (the `label` prop, or visually hidden text next to it).
 */
export function PixelText(handle: Handle<{ text: string; size?: number; label?: string }>) {
  return () => {
    let { text, size = 4, label } = handle.props
    let { d, width } = layoutText(text)
    return (
      <svg
        class="pixel-text"
        viewBox={`0 0 ${width} ${GLYPH_HEIGHT}`}
        width={width * size}
        height={GLYPH_HEIGHT * size}
        fill="currentColor"
        shape-rendering="crispEdges"
        role={label ? 'img' : undefined}
        aria-label={label}
        aria-hidden={label ? undefined : true}
      >
        <path d={d} />
      </svg>
    )
  }
}

export function PixelIcon(handle: Handle<{ name: IconName; size?: number }>) {
  return () => {
    let { name, size = 4 } = handle.props
    let { rows, palette } = ICONS[name]
    return (
      <svg
        class="pixel-icon"
        viewBox="0 0 16 16"
        width={16 * size}
        height={16 * size}
        shape-rendering="crispEdges"
        aria-hidden="true"
      >
        {Object.entries(palette).map(([key, color]) => (
          <path key={key} fill={color} d={runs(rows, 0, (cell) => cell === key)} />
        ))}
      </svg>
    )
  }
}
