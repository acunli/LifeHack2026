"use client";

/**
 * The WattLah! mascot.
 *
 * Sheet layout, measured: 64×32 px = FOUR frames of 16×32, one per facing
 * direction — left, back, right, front. They are NOT idle-animation frames.
 * Cycling them makes the character spin on the spot, which is what the first
 * version did. Frame 3 (x=48) is the front-facing pose; that is the mascot.
 *
 * With only one frame per direction there is no sprite animation available, so
 * the life comes from a stepped vertical bob and a shadow that tightens as the
 * character rises. Stepped, not eased — a smooth transform on pixel art reads
 * as CSS, not as a game.
 */

const CHARACTERS = {
  Amelia: "/assets/characters/Amelia_idle_16x16.png",
  Adam: "/assets/characters/Adam_idle_16x16.png",
  Alex: "/assets/characters/Alex_idle_16x16.png",
  Bob: "/assets/characters/Bob_idle_16x16.png",
} as const;

export type CharacterName = keyof typeof CHARACTERS;

/** Source frame geometry, in pixels. */
const FRAME_W = 16;
const FRAME_H = 32;
const SHEET_W = 64;
const SHEET_H = 32;
const FRONT_FRAME = 3;

interface Props {
  /** Integer only — a fractional scale reintroduces blur (AGENTS.md). */
  scale?: number;
  character?: CharacterName;
  /** Amber halo behind the character. On for the login lockup, off inline. */
  glow?: boolean;
  className?: string;
}

export default function Mascot({
  scale = 4,
  character = "Amelia",
  glow = false,
  className = "",
}: Props) {
  const w = FRAME_W * scale;
  const h = FRAME_H * scale;

  return (
    <div
      className={`relative shrink-0 ${className}`}
      style={{ width: w, height: h }}
      aria-hidden
    >
      {glow && (
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            width: w * 1.9,
            height: w * 1.9,
            background:
              "radial-gradient(circle, rgba(255,200,102,0.22) 0%, transparent 68%)",
          }}
        />
      )}

      {/* Ground shadow. Sits under the feet and tightens as the mascot rises,
          which is what sells the bob as weight rather than drift. */}
      <div
        className="mascot-shadow absolute left-1/2 -translate-x-1/2 rounded-[50%]"
        style={{
          bottom: -scale,
          width: w * 0.55,
          height: scale * 2,
          background: "rgba(0,0,0,0.38)",
        }}
      />

      <div
        className="mascot-bob pixelated absolute inset-0"
        style={{
          backgroundImage: `url("${CHARACTERS[character]}")`,
          backgroundSize: `${SHEET_W * scale}px ${SHEET_H * scale}px`,
          backgroundPosition: `${-FRONT_FRAME * FRAME_W * scale}px 0`,
          backgroundRepeat: "no-repeat",
        }}
      />
    </div>
  );
}
