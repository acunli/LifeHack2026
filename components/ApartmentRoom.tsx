"use client";

import { APPLIANCES, applianceLoad, type Appliance } from "@/data/appliances";

/**
 * The apartment.
 *
 * Renders a pre-assembled room image with heat blobs positioned over it by
 * percentage. This replaced a tile-by-tile assembly from the LimeZu sheets:
 * the objects on those sheets do not sit flush to the grid, so every furniture
 * coordinate was an unverified estimate. A finished render removes that whole
 * class of risk, and looks considerably better.
 *
 * Percentages rather than pixels so the room scales to its container without
 * the blobs drifting off the appliances they belong to.
 */

/** Cool green → amber → hot red. */
export function heatColour(load: number): string {
  const t = Math.max(0, Math.min(1, load));
  if (t < 0.5) {
    const k = t / 0.5;
    return `rgb(${Math.round(155 + k * 100)}, ${Math.round(229 - k * 29)}, ${Math.round(100 + k * 2)})`;
  }
  const k = (t - 0.5) / 0.5;
  return `rgb(255, ${Math.round(200 - k * 90)}, ${Math.round(102 - k * 12)})`;
}

interface Props {
  showHeat?: boolean;
  onHover?: (a: Appliance | null) => void;
  selectedId?: string | null;
}

export default function ApartmentRoom({
  showHeat = true,
  onHover,
  selectedId = null,
}: Props) {
  return (
    <div className="relative w-full" style={{ maxWidth: 526 }}>
      {/* next/image re-encodes and blurs pixel art — AGENTS.md forbids it. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/room.png"
        alt="Top-down pixel-art view of your apartment"
        className="pixelated block w-full"
      />

      {showHeat && (
        <div className="absolute inset-0">
          {APPLIANCES.map((a) => {
            const load = applianceLoad(a);
            const colour = heatColour(load);
            const active = selectedId === a.id;
            return (
              <button
                key={a.id}
                onMouseEnter={() => onHover?.(a)}
                onMouseLeave={() => onHover?.(null)}
                onFocus={() => onHover?.(a)}
                onBlur={() => onHover?.(null)}
                aria-label={`${a.name}, ${a.kwh} kilowatt hours`}
                className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full transition-opacity"
                style={{
                  left: `${a.x}%`,
                  top: `${a.y}%`,
                  width: `${a.r * 2}%`,
                  paddingBottom: `${a.r * 2}%`,
                  height: 0,
                  background: `radial-gradient(circle, ${colour} 0%, transparent 70%)`,
                  opacity: active ? 0.85 : 0.3 + load * 0.4,
                  mixBlendMode: "screen",
                }}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
