/**
 * Original pixel medals/crown for the top three ranks, rendered as crisp SVG.
 * Rank is also conveyed by the accompanying text ("1st"/"2nd"/"3rd") so we
 * never rely on color alone. Decorative here — the row provides the label.
 */

type Place = 1 | 2 | 3

const THEMES: Record<
  Place,
  { ring: string; ringHi: string; face: string; ribbon: string }
> = {
  1: { ring: '#d99a2b', ringHi: '#ffc866', face: '#ffe1a3', ribbon: '#5fa072' },
  2: { ring: '#8a97a0', ringHi: '#d7e0e6', face: '#eef3f6', ribbon: '#5fa072' },
  3: { ring: '#a8672f', ringHi: '#d98b4a', face: '#f0b483', ribbon: '#5fa072' },
}

type Props = {
  place: Place
  size?: number
  /** First place gets a subtle pixel bounce. */
  animated?: boolean
}

export function PixelMedal({ place, size = 24, animated = true }: Props) {
  const t = THEMES[place]
  return (
    <svg
      className={`pixelated ${place === 1 && animated ? 'anim-medal' : ''}`}
      width={size}
      height={size}
      viewBox="0 0 10 10"
      shapeRendering="crispEdges"
      aria-hidden="true"
      focusable="false"
    >
      {/* Ribbon */}
      <rect x="3" y="0" width="1" height="3" fill={t.ribbon} />
      <rect x="6" y="0" width="1" height="3" fill={t.ribbon} />
      {/* Medal outer ring */}
      <rect x="3" y="3" width="4" height="1" fill={t.ring} />
      <rect x="2" y="4" width="6" height="4" fill={t.ring} />
      <rect x="3" y="8" width="4" height="1" fill={t.ring} />
      {/* Highlight */}
      <rect x="3" y="4" width="1" height="4" fill={t.ringHi} />
      {/* Face */}
      <rect x="4" y="5" width="2" height="2" fill={t.face} />
      {place === 1 && (
        // Tiny crown notch on the gold medal.
        <>
          <rect x="4" y="4" width="1" height="1" fill={t.ring} />
          <rect x="5" y="4" width="1" height="1" fill={t.ringHi} />
        </>
      )}
    </svg>
  )
}

export default PixelMedal
