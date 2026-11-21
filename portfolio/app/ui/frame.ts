/**
 * A pixel-art border: four box-shadows leave the corners notched.
 * Spread it into a css(...) object. `drop` adds a hard offset shadow.
 */
export function pixelFrame(color: string, width = 4, drop?: string) {
  let w = `${width}px`
  let shadows = [
    `0 -${w} 0 0 ${color}`,
    `0 ${w} 0 0 ${color}`,
    `-${w} 0 0 0 ${color}`,
    `${w} 0 0 0 ${color}`,
  ]
  if (drop) shadows.push(`${width * 2}px ${width * 2}px 0 0 ${drop}`)
  return { boxShadow: shadows.join(', ') }
}
