'use client'

/**
 * Original pixel-art mascot rendered as crisp SVG rects from the color matrix
 * in data/spriteMap.ts. Cycles a front/left/right idle sequence on the client
 * (reduced motion holds the front frame). Sprites scale by integer multiples
 * only and use shape-rendering: crispEdges.
 */

import { useEffect, useRef, useState } from 'react'
import {
  IDLE_SEQUENCE,
  MASCOTS,
  matrixForFacing,
  paletteColor,
  type Facing,
  type MascotName,
} from '@/data/mascotSprites'

type Props = {
  name: MascotName
  /** Integer scale applied to the 11x14 grid. */
  scale?: number
  /** Enable the idle facing cycle + subtle hop. */
  animated?: boolean
  className?: string
  ariaHidden?: boolean
}

const GRID_W = 11
const GRID_H = 14

export function Mascot({
  name,
  scale = 3,
  animated = true,
  className,
  ariaHidden = true,
}: Props) {
  const def = MASCOTS[name]
  const [facing, setFacing] = useState<Facing>('front')
  const stepRef = useRef(0)

  useEffect(() => {
    if (!animated) return
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (media.matches) return
    const id = window.setInterval(() => {
      stepRef.current = (stepRef.current + 1) % IDLE_SEQUENCE.length
      setFacing(IDLE_SEQUENCE[stepRef.current])
    }, 650)
    return () => window.clearInterval(id)
  }, [animated])

  const matrix = matrixForFacing(facing)
  const s = Math.max(1, Math.round(scale))

  const rects: React.ReactNode[] = []
  matrix.forEach((row, y) => {
    row.split('').forEach((ch, x) => {
      const color = paletteColor(def.palette, ch)
      if (!color) return
      rects.push(
        <rect
          key={`${x}-${y}`}
          x={x}
          y={y}
          width={1}
          height={1}
          fill={color}
        />,
      )
    })
  })

  return (
    <svg
      className={`pixelated ${animated ? 'anim-hop' : ''} ${className ?? ''}`}
      width={GRID_W * s}
      height={GRID_H * s}
      viewBox={`0 0 ${GRID_W} ${GRID_H}`}
      shapeRendering="crispEdges"
      role={ariaHidden ? undefined : 'img'}
      aria-hidden={ariaHidden ? true : undefined}
      aria-label={ariaHidden ? undefined : `${name} mascot`}
    >
      {rects}
    </svg>
  )
}

export default Mascot
