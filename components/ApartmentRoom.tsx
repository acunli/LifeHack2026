"use client";

import {
  FLOORS,
  FURNITURE,
  TILE,
  spriteStyle,
  toPx,
  type Sprite,
} from "@/data/spriteMap";

/** Room size in tiles. */
export const ROOM_COLS = 13;
export const ROOM_ROWS = 9;

interface Placed {
  sprite: Sprite;
  col: number;
  row: number;
  /** Draw order. Higher sits in front. */
  z?: number;
}

/**
 * One apartment, laid out by hand. Coordinates are in tiles.
 * Verify or retune any sprite at /dev/sheets.
 */
const LAYOUT: Placed[] = [
  { sprite: FURNITURE.rugGreen, col: 4, row: 4 },
  { sprite: FURNITURE.wardrobe, col: 0, row: 1, z: 2 },
  { sprite: FURNITURE.bed, col: 2, row: 1, z: 2 },
  { sprite: FURNITURE.sofa, col: 6, row: 2, z: 2 },
  { sprite: FURNITURE.armchair, col: 9, row: 2, z: 2 },
  { sprite: FURNITURE.table, col: 5, row: 6, z: 3 },
  { sprite: FURNITURE.cabinet, col: 10, row: 5, z: 2 },
  { sprite: FURNITURE.plantTall, col: 11, row: 1, z: 2 },
  { sprite: FURNITURE.plantSmall, col: 1, row: 6, z: 2 },
];

/** A zone of the flat with an energy load, drawn as a heat blob. */
export interface HeatZone {
  id: string;
  label: string;
  /** Centre, in tiles. */
  col: number;
  row: number;
  /** Radius in tiles. */
  radius: number;
  /** 0–1. Drives colour and intensity. */
  load: number;
}

/** Cool green → amber → hot red. */
function heatColour(load: number): string {
  const t = Math.max(0, Math.min(1, load));
  if (t < 0.5) {
    // green → amber
    const k = t / 0.5;
    return `rgb(${Math.round(110 + k * 145)}, ${Math.round(231 - k * 31)}, ${Math.round(168 - k * 66)})`;
  }
  // amber → red
  const k = (t - 0.5) / 0.5;
  return `rgb(255, ${Math.round(200 - k * 90)}, ${Math.round(102 - k * 12)})`;
}

interface Props {
  heat?: HeatZone[];
  showHeat?: boolean;
  onZoneHover?: (zone: HeatZone | null) => void;
}

export default function ApartmentRoom({
  heat = [],
  showHeat = true,
  onZoneHover,
}: Props) {
  const width = toPx(ROOM_COLS);
  const height = toPx(ROOM_ROWS);

  return (
    <div
      className="relative shrink-0 overflow-hidden"
      style={{ width, height }}
      aria-label="Your apartment"
    >
      {/* Floor. One div per cell: the sheet holds many tiles, so a repeating
          background would tile the whole sheet rather than the single cell. */}
      <div className="absolute inset-0">
        {Array.from({ length: ROOM_COLS * ROOM_ROWS }, (_, i) => {
          const col = i % ROOM_COLS;
          const row = Math.floor(i / ROOM_COLS);
          return (
            <div
              key={i}
              className="pixelated absolute"
              style={{
                ...spriteStyle(FLOORS.cream),
                left: toPx(col),
                top: toPx(row),
              }}
            />
          );
        })}
      </div>

      {/* Furniture */}
      {LAYOUT.map((p, i) => (
        <div
          key={i}
          className="pixelated absolute"
          style={{
            ...spriteStyle(p.sprite),
            left: toPx(p.col),
            top: toPx(p.row),
            zIndex: p.z ?? 1,
          }}
        />
      ))}

      {/* Heat overlay — the reason the room is a dashboard and not a picture. */}
      {showHeat && (
        <div className="absolute inset-0" style={{ zIndex: 5 }}>
          {heat.map((z) => {
            const colour = heatColour(z.load);
            const d = toPx(z.radius * 2);
            return (
              <div
                key={z.id}
                onMouseEnter={() => onZoneHover?.(z)}
                onMouseLeave={() => onZoneHover?.(null)}
                className="absolute rounded-full transition-opacity"
                style={{
                  left: toPx(z.col) - d / 2 + TILE / 2,
                  top: toPx(z.row) - d / 2 + TILE / 2,
                  width: d,
                  height: d,
                  background: `radial-gradient(circle, ${colour} 0%, transparent 70%)`,
                  opacity: 0.28 + z.load * 0.42,
                  mixBlendMode: "screen",
                }}
                title={`${z.label} — ${Math.round(z.load * 100)}% load`}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
