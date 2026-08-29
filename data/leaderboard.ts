import { between, makeRng } from "@/lib/rng";
import { hashSeed } from "@/lib/rng";
import type { CharacterName } from "@/components/Mascot";

/**
 * The complex leaderboard. Static and seeded — §5 rules out a real-time or
 * persisted leaderboard, not a mocked one.
 *
 * Seeded rather than random so the resident's rank does not jitter mid-demo.
 */

export const COMPLEX_SIZE = 48;

/**
 * Handles rather than room numbers. Merged from the leaderboard mock, which
 * made the point well: a public board of unit numbers identifies where people
 * live, and a wall of "Room 07-12" reads as a housing register rather than a
 * game.
 */
const HANDLES = [
  "PixelPanda", "WattWarden", "SolarSprout", "VoltViper", "EcoEmber",
  "GridGoblin", "LumenLotus", "AmpAcorn", "JouleJelly", "KiloKoala",
  "FluxFerret", "NovaNewt", "TeraTapir", "OhmOtter", "SparkSloth",
  "CircuitCrab", "BreezeBadger", "MeterMoth", "CoilCoyote", "PhotonPika",
  "DynamoDingo", "TurbineTern", "EmberEagle", "QuantaQuail",
];

const MASCOTS: CharacterName[] = ["Alex", "Adam", "Amelia", "Bob"];

/** Stable per-resident mascot, so a handle always shows the same character. */
export const mascotFor = (seed: string): CharacterName =>
  MASCOTS[hashSeed(seed) % MASCOTS.length];

export interface LeaderboardRow {
  /** Public handle. Room numbers are never rendered for neighbours. */
  handle: string;
  mascot: CharacterName;
  score: number;
  /** Change since yesterday, in points. */
  delta: number;
  isYou: boolean;
}

function neighbours(): Omit<LeaderboardRow, "isYou">[] {
  const rng = makeRng("wattwise-complex-v1");
  const rows: Omit<LeaderboardRow, "isYou">[] = [];

  for (let i = 0; i < COMPLEX_SIZE; i++) {
    // Handles repeat past the list length with a suffix, so 48 units all get
    // a distinct name without needing 48 hand-written ones.
    const base = HANDLES[i % HANDLES.length];
    const handle =
      i < HANDLES.length ? base : `${base}${Math.floor(i / HANDLES.length) + 1}`;
    rows.push({
      handle,
      mascot: mascotFor(handle),
      score: Math.round(between(rng, 48, 97)),
      delta: Math.round(between(rng, -7, 9)),
    });
  }
  return rows;
}

export interface Standing {
  rows: LeaderboardRow[];
  rank: number;
  total: number;
  /** Points to the next rank up. 0 when already first. */
  gapToNext: number;
  /** The row directly above, if any. */
  ahead: LeaderboardRow | null;
}

/** Splices the resident's live score into the complex and ranks the lot. */
export function buildStanding(
  roomNumber: string,
  score: number,
  dailyDelta = 3,
  handle?: string,
): Standing {
  const rows: LeaderboardRow[] = neighbours().map((r) => ({
    ...r,
    isYou: false,
  }));

  rows.push({
    handle: handle?.trim() || "You",
    mascot: mascotFor(roomNumber),
    score,
    delta: dailyDelta,
    isYou: true,
  });

  rows.sort((a, b) => b.score - a.score || a.handle.localeCompare(b.handle));

  const index = rows.findIndex((r) => r.isYou);
  const ahead = index > 0 ? rows[index - 1] : null;

  return {
    rows,
    rank: index + 1,
    total: rows.length,
    gapToNext: ahead ? ahead.score - score : 0,
    ahead,
  };
}
