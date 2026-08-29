/**
 * Pixel medals for the top three, drawn as crisp SVG rather than emoji so they
 * sit in the same visual language as the sprites.
 *
 * Ported from the leaderboard mock onto our tokens. Rank is always also given
 * as text beside these, so meaning never depends on colour alone.
 */

export type Place = 1 | 2 | 3;

const THEMES: Record<
  Place,
  { ring: string; ringHi: string; face: string; ribbon: string }
> = {
  1: { ring: "#d99a2b", ringHi: "#ffc866", face: "#ffe1a3", ribbon: "#5fa072" },
  2: { ring: "#8a97a0", ringHi: "#d7e0e6", face: "#eef3f6", ribbon: "#5fa072" },
  3: { ring: "#a8672f", ringHi: "#d98b4a", face: "#f0b483", ribbon: "#5fa072" },
};

export default function PixelMedal({
  place,
  size = 24,
  animated = true,
}: {
  place: Place;
  size?: number;
  animated?: boolean;
}) {
  const t = THEMES[place];
  return (
    <svg
      className={`pixelated ${place === 1 && animated ? "anim-medal" : ""}`}
      width={size}
      height={size}
      viewBox="0 0 10 10"
      shapeRendering="crispEdges"
      aria-hidden
      focusable="false"
    >
      <rect x="3" y="0" width="1" height="3" fill={t.ribbon} />
      <rect x="6" y="0" width="1" height="3" fill={t.ribbon} />
      <rect x="3" y="3" width="4" height="1" fill={t.ring} />
      <rect x="2" y="4" width="6" height="4" fill={t.ring} />
      <rect x="3" y="8" width="4" height="1" fill={t.ring} />
      <rect x="3" y="4" width="1" height="4" fill={t.ringHi} />
      <rect x="4" y="5" width="2" height="2" fill={t.face} />
      {place === 1 && (
        <>
          <rect x="4" y="4" width="1" height="1" fill={t.ring} />
          <rect x="5" y="4" width="1" height="1" fill={t.ringHi} />
        </>
      )}
    </svg>
  );
}
