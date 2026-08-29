import PixelBolt from "@/components/PixelBolt";

interface WattLahLogoProps {
  className?: string;
}

/**
 * Single-line arcade wordmark. The pixel lightning mark trails the word as the
 * stroke of an exclamation, its dot carried in the same sprite.
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
        className="wattlah-bolt relative ml-[0.3em] h-[2.15em] w-[1.08em] shrink-0"
      >
        <PixelBolt />
      </span>
    </span>
  );
}
