/**
 * The bolt from the wordmark, drawn as crisp SVG rects from BOLT_MATRIX.
 *
 * Rects rather than a PNG: it stays sharp at every size, costs no request, and
 * takes its colours from the theme tokens. `crispEdges` plus a viewBox in whole
 * grid units keeps the pixels square; the viewBox is one unit larger than the
 * grid in each direction to leave room for the offset shadow, and the default
 * preserveAspectRatio is left alone so the mark can never be stretched the way
 * the histogram once was.
 */

import { BOLT_COLORS, BOLT_H, BOLT_MATRIX, BOLT_W } from '@/data/boltSprite'

type Props = {
  className?: string
  /** Decorative by default — the wordmark beside it already says "WattLah!". */
  title?: string
}

/** Cell runs, so a row of body pixels is one rect instead of eight. */
function rowRects(row: string, y: number, color: (ch: string) => string) {
  const rects: React.ReactNode[] = []
  let x = 0
  while (x < row.length) {
    const ch = row[x]
    if (ch === '.') {
      x++
      continue
    }
    let run = 1
    while (x + run < row.length && row[x + run] === ch) run++
    rects.push(
      <rect key={`${y}-${x}`} x={x} y={y} width={run} height={1} fill={color(ch)} />,
    )
    x += run
  }
  return rects
}

export default function PixelBolt({ className = '', title }: Props) {
  const front = BOLT_MATRIX.flatMap((row, y) => rowRects(row, y, (ch) => BOLT_COLORS[ch]))
  // A hard one-pixel drop, matching the wordmark's own offset shadow. Drawn as
  // a flat silhouette so it reads as depth rather than as a second bolt.
  const shadow = BOLT_MATRIX.flatMap((row, y) => rowRects(row, y, () => 'var(--bg-deep)'))

  return (
    <svg
      viewBox={`0 0 ${BOLT_W + 1} ${BOLT_H + 1}`}
      className={`h-full w-full ${className}`}
      shapeRendering="crispEdges"
      role={title ? 'img' : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      <g transform="translate(1 1)">{shadow}</g>
      <g>{front}</g>
    </svg>
  )
}
