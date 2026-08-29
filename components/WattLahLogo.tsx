/**
 * WattLah wordmark with an amber-green pixel lightning bolt.
 * Rendered as crisp SVG (shape-rendering: crispEdges). The bolt gives a short
 * stepped spark animation unless reduced motion is preferred.
 */

type Props = {
  /** Height of the bolt icon in px; wordmark scales relative to this. */
  size?: number
  showWordmark?: boolean
  animated?: boolean
  className?: string
}

export function WattLahLogo({
  size = 28,
  showWordmark = true,
  animated = true,
  className,
}: Props) {
  return (
    <div className={`flex items-center gap-3 ${className ?? ''}`}>
      <svg
        className={`pixelated ${animated ? 'anim-spark' : ''}`}
        width={size}
        height={size}
        viewBox="0 0 8 8"
        role="img"
        aria-label="WattLah lightning bolt"
        fill="none"
      >
        {/* Pixel lightning bolt: gold body with a green edge */}
        <g shapeRendering="crispEdges">
          {/* green outline */}
          <rect x="4" y="0" width="2" height="1" fill="#5fa072" />
          <rect x="3" y="1" width="2" height="1" fill="#5fa072" />
          <rect x="2" y="2" width="2" height="1" fill="#5fa072" />
          <rect x="2" y="3" width="4" height="1" fill="#9be564" />
          {/* gold core */}
          <rect x="4" y="1" width="1" height="1" fill="#ffc866" />
          <rect x="3" y="2" width="2" height="1" fill="#ffc866" />
          <rect x="3" y="4" width="2" height="1" fill="#ffc866" />
          <rect x="2" y="4" width="3" height="1" fill="#d99a2b" />
          <rect x="3" y="5" width="2" height="1" fill="#ffc866" />
          <rect x="2" y="6" width="2" height="1" fill="#d99a2b" />
          <rect x="2" y="5" width="1" height="1" fill="#9be564" />
          <rect x="3" y="7" width="1" height="1" fill="#ffc866" />
        </g>
      </svg>
      {showWordmark && (
        <span
          className="pixel text-foreground"
          style={{ fontSize: Math.round(size * 0.62), lineHeight: 1 }}
        >
          <span>Watt</span>
          <span style={{ color: 'var(--gold)' }}>Lah</span>
        </span>
      )}
    </div>
  )
}

export default WattLahLogo
