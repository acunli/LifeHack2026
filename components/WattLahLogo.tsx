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
      <img
        src="/wattlah-logo.png"
        alt="WattLah!"
        className="h-[48px] w-auto object-contain pixelated"
        style={{ imageRendering: "pixelated" }}
      />
    </span>
  );
}
