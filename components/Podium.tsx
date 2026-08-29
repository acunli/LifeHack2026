"use client";

import Mascot from "@/components/Mascot";
import PixelMedal, { type Place } from "@/components/PixelMedal";
import type { LeaderboardRow } from "@/data/leaderboard";

/**
 * Top-three podium, ordered 2nd / 1st / 3rd with the champion raised highest.
 * Purely presentational — the ranked list below remains the accessible source
 * of truth.
 *
 * Ported from the leaderboard mock onto our tokens and row shape.
 */

const HEIGHTS: Record<Place, string> = { 1: "h-20", 2: "h-14", 3: "h-10" };
const ORDER: Place[] = [2, 1, 3];

export default function Podium({ rows }: { rows: LeaderboardRow[] }) {
  if (rows.length < 3) return null;
  const top = ORDER.map((place) => ({ place, row: rows[place - 1] }));

  return (
    <section aria-label="Top three" className="pixel-panel p-5">
      <div className="flex items-end justify-center gap-3">
        {top.map(({ place, row }) => {
          const champion = place === 1;
          return (
            <div key={row.handle} className="flex w-24 flex-col items-center">
              {champion && (
                <div className="anim-medal mb-1">
                  <PixelMedal place={1} size={20} animated={false} />
                </div>
              )}

              <Mascot
                scale={champion ? 3 : 2}
                character={row.mascot}
                animate={false}
                props_={false}
              />

              <div className="mt-1 flex items-center gap-1">
                <PixelMedal place={place} size={16} animated={false} />
                <span
                  className={`pixel max-w-16 truncate text-[9px] ${
                    row.isYou ? "text-amber" : "text-ink"
                  }`}
                >
                  {row.handle}
                </span>
              </div>

              <span
                className="pixel mt-0.5 text-[11px] tabular-nums"
                style={{ color: "var(--amber)" }}
              >
                {row.score}
              </span>

              <div
                className={`pixel-panel mt-2 flex w-full ${HEIGHTS[place]} ${
                  champion ? "anim-energy" : ""
                } items-start justify-center pt-1`}
                style={champion ? { borderColor: "var(--amber-deep)" } : undefined}
              >
                <span className="pixel text-[10px] text-ink-dim">{place}</span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
