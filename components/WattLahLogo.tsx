interface WattLahLogoProps {
  className?: string;
}

/**
 * Single-line arcade wordmark. The blocky 8-bit lightning mark trails the
 * word as the stroke of an exclamation, with a pixel dot beneath it.
 */
export default function WattLahLogo({
  className = "",
}: WattLahLogoProps) {
  return (
    <span
      role="img"
      aria-label="WattLah!"
      className={`relative inline-flex -rotate-1 items-center pb-1 ${className}`}
      style={{ fontFamily: "var(--font-pixel)" }}
    >
      <span
        aria-hidden
        className="relative z-10 whitespace-nowrap tracking-[0.045em] text-amber"
        style={{
          WebkitTextStroke: "1px var(--bg-deep)",
          textShadow:
            "3px 3px 0 var(--amber-deep), 5px 5px 0 var(--bg-deep)",
        }}
      >
        WATTLAH
      </span>

      <span
        aria-hidden
        className="wattlah-bolt relative ml-[0.35em] h-[1.89em] w-[1.05em] shrink-0"
      >
        <svg
          viewBox="0 0 43 78"
          className="h-full w-full overflow-visible"
          shapeRendering="crispEdges"
        >
          <path
            d="M24 2H40L29 24H41L10 58L17 34H2Z"
            fill="var(--green)"
            stroke="var(--bg-deep)"
            strokeWidth="3"
            strokeLinejoin="miter"
            transform="translate(3 3)"
          />
          <path
            d="M24 2H40L29 24H41L10 58L17 34H2Z"
            fill="var(--amber)"
            stroke="var(--bg-deep)"
            strokeWidth="3"
            strokeLinejoin="miter"
          />
          <rect
            x="16"
            y="64"
            width="11"
            height="11"
            fill="var(--green)"
            stroke="var(--bg-deep)"
            strokeWidth="3"
            transform="translate(3 3)"
          />
          <rect
            x="16"
            y="64"
            width="11"
            height="11"
            fill="var(--amber)"
            stroke="var(--bg-deep)"
            strokeWidth="3"
          />
        </svg>
      </span>
    </span>
  );
}
