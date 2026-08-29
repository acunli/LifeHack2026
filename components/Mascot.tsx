"use client";

import { useEffect, useState } from "react";

/**
 * The WattLah! mascot.
 *
 * Sheet layout, verified by cropping: 64×32 px = FOUR frames of 16×32, one per
 * facing — 0 left, 1 back, 2 right, 3 front. They are not idle-animation
 * frames, so cycling them fast spins the character on the spot.
 *
 * Used properly they give a real idle: hold front, glance left, hold, glance
 * right, hold. That reads as a character noticing things, which a vertical bob
 * does not — a bob reads as floating, because nothing in the art moves.
 */

const CHARACTERS = {
  Alex: "/assets/characters/Alex_idle_16x16.png",
  Adam: "/assets/characters/Adam_idle_16x16.png",
  Amelia: "/assets/characters/Amelia_idle_16x16.png",
  Bob: "/assets/characters/Bob_idle_16x16.png",
} as const;

export type CharacterName = keyof typeof CHARACTERS;

const FRAME_W = 16;
const FRAME_H = 32;
const SHEET_W = 64;
const SHEET_H = 32;

/** Column index of each facing on the sheet. */
const FACING = { left: 0, back: 1, right: 2, front: 3 } as const;

/**
 * The idle, as a script rather than CSS keyframes.
 *
 * The CSS version used var() inside @keyframes to carry the per-scale pixel
 * offsets. Custom properties do not resolve reliably in keyframe substitution,
 * so the animation ran but the frame never changed — it looked frozen.
 *
 * Driving it here also allows uneven holds, which is what stops the idle
 * reading as a metronome. The back facing is deliberately unused: a mascot
 * turning its back on you is odd.
 */
const IDLE: { facing: keyof typeof FACING; hold: number }[] = [
  { facing: "front", hold: 2800 },
  { facing: "left", hold: 850 },
  { facing: "front", hold: 4200 },
  { facing: "right", hold: 950 },
  { facing: "front", hold: 3400 },
  { facing: "left", hold: 700 },
];

interface Props {
  /** Integer only — a fractional scale reintroduces blur (AGENTS.md). */
  scale?: number;
  character?: CharacterName;
  /** Amber halo behind the character. On for the login lockup, off inline. */
  glow?: boolean;
  /** Off for a static crop, e.g. in a dense header. */
  animate?: boolean;
  className?: string;
}

export default function Mascot({
  scale = 4,
  character = "Alex",
  glow = false,
  animate = true,
  className = "",
}: Props) {
  const w = FRAME_W * scale;
  const h = FRAME_H * scale;
  const offset = (col: number) => `${-col * FRAME_W * scale}px`;

  // Always starts at IDLE[0] (front), so the server render and the first
  // client render agree and nothing hydrate-mismatches.
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!animate) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setTimeout(
      () => setStep((s) => (s + 1) % IDLE.length),
      IDLE[step].hold,
    );
    return () => window.clearTimeout(id);
  }, [step, animate]);

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

      {/* Static shadow. The mascot stands still now, so the shadow does too —
          an animated shadow under a still character reads as a glitch. */}
      <div
        className="absolute left-1/2 -translate-x-1/2 rounded-[50%]"
        style={{
          bottom: -scale,
          width: w * 0.55,
          height: scale * 2,
          background: "rgba(0,0,0,0.38)",
        }}
      />

      <div
        className="pixelated absolute inset-0"
        style={{
          backgroundImage: `url("${CHARACTERS[character]}")`,
          backgroundSize: `${SHEET_W * scale}px ${SHEET_H * scale}px`,
          backgroundPosition: `${offset(FACING[IDLE[step].facing])} 0`,
          backgroundRepeat: "no-repeat",
        }}
      />
    </div>
  );
}
