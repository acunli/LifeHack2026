interface WattLahLogoProps {
  className?: string;
}

/**
 * WattLah! logo rendered from the pixel-art PNG.
 */
export default function WattLahLogo({
  className = "",
}: WattLahLogoProps) {
  return (
    <span
      role="img"
      aria-label="WattLah!"
      className={`inline-flex items-center ${className}`}
    >
      {/*
        eslint-disable-next-line @next/next/no-img-element --
        Deliberate: next/image re-encodes, and re-encoding pixel art softens
        the hard edges the whole design depends on (see AGENTS.md). The file
        is 87KB and already sized for its slot, so there is nothing for the
        optimiser to win here.
      */}
      <img
        src="/wattlah-logo.png"
        alt="WattLah!"
        className="h-[48px] w-auto object-contain pixelated"
        style={{ imageRendering: "pixelated" }}
      />
    </span>
  );
}
