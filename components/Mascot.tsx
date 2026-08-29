"use client";

import { useEffect, useState } from "react";

/**
 * The WattLah! mascot.
 *
 * Sheet layout, verified by cropping: 64×32 px = FOUR frames of 16×32, one per
 * facing — 0 left, 1 back, 2 right, 3 front. They are NOT idle-animation
 * frames, so cycling them spins the character on the spot.
 *
 * With one frame per facing there is no sprite animation available, so the
 * character acts instead: a light or a TV switches itself on beside him, he
 * turns to look, and he switches it off. That is the product's whole thesis in
 * four seconds, and it needs no art we do not have.
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

/** Column index of each facing. `back` is unused — a mascot facing away is odd. */
const FACING = { left: 0, back: 1, right: 2, front: 3 } as const;
type Facing = "front" | "left" | "right";
type PropKind = "lamp" | "tv" | "switch";
type Side = "left" | "right";

interface Appliance {
  kind: PropKind;
  side: Side;
  on: boolean;
}
interface Beat {
  facing: Facing;
  prop?: Appliance;
  hold: number;
}

/** Standing about, glancing around. Deterministic — this is the first render. */
function idleBeats(): Beat[] {
  return [
    { facing: "front", hold: 2600 },
    { facing: "left", hold: 800 },
    { facing: "front", hold: 3100 },
    { facing: "right", hold: 750 },
  ];
}

/** Something switches itself on; he notices, and turns it off. */
function vignette(kind: PropKind, side: Side): Beat[] {
  const look: Facing = side;
  return [
    { facing: "front", prop: { kind, side, on: true }, hold: 700 },
    { facing: look, prop: { kind, side, on: true }, hold: 800 },
    { facing: look, prop: { kind, side, on: false }, hold: 900 },
    { facing: "front", prop: { kind, side, on: false }, hold: 600 },
    { facing: "front", hold: 900 },
  ];
}

const KINDS: PropKind[] = ["lamp", "tv", "switch"];

/**
 * Runs only in a timer callback, never during render, so the randomness cannot
 * reach the server pass or cause a hydration mismatch.
 */
function nextScript(): Beat[] {
  const kind = KINDS[Math.floor(Math.random() * KINDS.length)];
  const side: Side = Math.random() < 0.5 ? "left" : "right";
  return [...idleBeats(), ...vignette(kind, side)];
}

/** Small pixel props, drawn rather than cropped — we have no verified sprite
 *  coordinates for a lamp or a TV, and squares at this size read fine. */
function PropSprite({ prop, scale }: { prop: Appliance; scale: number }) {
  const u = scale; // one source pixel
  const on = prop.on;

  const shell: React.CSSProperties = {
    position: "absolute",
    top: u * 9,
    [prop.side === "left" ? "right" : "left"]: "100%",
    [prop.side === "left" ? "marginRight" : "marginLeft"]: u * 2,
    imageRendering: "pixelated",
    transition: "opacity 160ms steps(2)",
  };

  if (prop.kind === "lamp") {
    return (
      <div style={{ ...shell, width: u * 5, height: u * 7 }}>
        {on && (
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: -u * 3,
              transform: "translateX(-50%)",
              width: u * 11,
              height: u * 11,
              background:
                "radial-gradient(circle, rgba(255,214,140,0.55) 0%, transparent 65%)",
            }}
          />
        )}
        {/* shade */}
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: u * 5,
            height: u * 3,
            background: on ? "#ffd68c" : "#5b6156",
          }}
        />
        {/* stem + base */}
        <div
          style={{
            position: "absolute",
            left: u * 2,
            top: u * 3,
            width: u,
            height: u * 3,
            background: "#3f4a41",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: u,
            top: u * 6,
            width: u * 3,
            height: u,
            background: "#3f4a41",
          }}
        />
      </div>
    );
  }

  if (prop.kind === "tv") {
    return (
      <div style={{ ...shell, width: u * 7, height: u * 6 }}>
        {on && (
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              transform: "translate(-50%,-50%)",
              width: u * 13,
              height: u * 11,
              background:
                "radial-gradient(circle, rgba(155,229,100,0.38) 0%, transparent 65%)",
            }}
          />
        )}
        <div
          style={{
            position: "absolute",
            inset: 0,
            width: u * 7,
            height: u * 5,
            background: "#2b3330",
            border: `${u}px solid #4a5a50`,
            boxSizing: "border-box",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: u,
            top: u,
            width: u * 5,
            height: u * 3,
            background: on ? "#9be564" : "#141a17",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: u * 2,
            top: u * 5,
            width: u * 3,
            height: u,
            background: "#4a5a50",
          }}
        />
      </div>
    );
  }

  // switch
  return (
    <div style={{ ...shell, width: u * 4, height: u * 6 }}>
      {on && (
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            transform: "translate(-50%,-50%)",
            width: u * 10,
            height: u * 10,
            background:
              "radial-gradient(circle, rgba(255,200,102,0.4) 0%, transparent 65%)",
          }}
        />
      )}
      <div
        style={{
          position: "absolute",
          inset: 0,
          width: u * 4,
          height: u * 6,
          background: "#e8e3d2",
          border: `${u}px solid #4a5a50`,
          boxSizing: "border-box",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: u,
          top: on ? u : u * 3,
          width: u * 2,
          height: u * 2,
          background: on ? "#ffc866" : "#7d857a",
        }}
      />
    </div>
  );
}

interface Props {
  /** Integer only — a fractional scale reintroduces blur (AGENTS.md). */
  scale?: number;
  character?: CharacterName;
  /** Warm halo behind the character. On for the login lockup, off inline. */
  glow?: boolean;
  /** Off for a static crop, e.g. in a dense header. */
  animate?: boolean;
  /** Appliance vignettes. Off in tight spaces where the prop would collide. */
  props_?: boolean;
  className?: string;
}

export default function Mascot({
  scale = 4,
  character = "Alex",
  glow = false,
  animate = true,
  props_ = true,
  className = "",
}: Props) {
  const w = FRAME_W * scale;
  const h = FRAME_H * scale;
  const offset = (col: number) => `${-col * FRAME_W * scale}px`;

  // Deterministic first script, so the server and first client render agree.
  const [beats, setBeats] = useState<Beat[]>(idleBeats);
  const [i, setI] = useState(0);

  useEffect(() => {
    if (!animate) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setTimeout(() => {
      if (i + 1 < beats.length) {
        setI(i + 1);
      } else {
        setBeats(props_ ? nextScript() : idleBeats());
        setI(0);
      }
    }, beats[i].hold);
    return () => window.clearTimeout(id);
  }, [i, beats, animate, props_]);

  const beat = beats[i];

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
            width: w * 1.25,
            height: w * 1.25,
            background:
              "radial-gradient(circle, rgba(255,214,140,0.20) 0%, rgba(255,200,102,0.07) 45%, transparent 68%)",
          }}
        />
      )}

      {beat.prop && <PropSprite prop={beat.prop} scale={scale} />}

      {/* Ground shadow. Static, because he stands still. */}
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
          backgroundPosition: `${offset(FACING[beat.facing])} 0`,
          backgroundRepeat: "no-repeat",
        }}
      />
    </div>
  );
}
