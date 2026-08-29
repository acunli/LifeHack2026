import { between, makeRng } from "@/lib/rng";
import { dailyChange, rankTier, type ApartmentStatus, type DailyChange } from "@/lib/scoring";
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
  /** Yesterday's score, so movement is derived rather than invented. */
  previousScore: number;
  change: DailyChange;
  tier: ApartmentStatus;
  /** Change since yesterday, in points. Kept for existing consumers. */
  delta: number;
  isYou: boolean;
  rank: number;
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
    const score = Math.round(between(rng, 48, 97));
    const previousScore = Math.max(
      0,
      Math.min(100, score - Math.round(between(rng, -7, 9))),
    );
    rows.push({
      handle,
      mascot: mascotFor(handle),
      score,
      previousScore,
      change: dailyChange(score, previousScore),
      tier: rankTier(score),
      delta: score - previousScore,
      rank: 0,
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

  const previousScore = Math.max(0, Math.min(100, score - dailyDelta));
  rows.push({
    handle: handle?.trim() || "You",
    mascot: mascotFor(roomNumber),
    score,
    previousScore,
    change: dailyChange(score, previousScore),
    tier: rankTier(score),
    delta: dailyDelta,
    isYou: true,
    rank: 0,
  });

  rows.sort((a, b) => b.score - a.score || a.handle.localeCompare(b.handle));
  rows.forEach((r, i) => {
    r.rank = i + 1;
  });

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

/**
 * Async data-access shim.
 *
 * Ported from the leaderboard mock, and worth keeping: the leaderboard is the
 * one surface that will eventually need a real backend, and shaping the call
 * as a promise now means the components already handle loading, empty and
 * error states. Swapping this for a fetch() later touches no UI.
 */
export function fetchStanding(
  roomNumber: string,
  score: number,
  dailyDelta = 3,
  handle?: string,
): Promise<Standing> {
  return Promise.resolve(buildStanding(roomNumber, score, dailyDelta, handle));
}
