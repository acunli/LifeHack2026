import { between, makeRng } from "@/lib/rng";

/**
 * The complex leaderboard. Static and seeded — §5 rules out a real-time or
 * persisted leaderboard, not a mocked one.
 *
 * Seeded rather than random so the resident's rank does not jitter mid-demo.
 */

export const COMPLEX_SIZE = 48;

export interface LeaderboardRow {
  roomNumber: string;
  score: number;
  /** Change since last week, in points. */
  delta: number;
  isYou: boolean;
}

function neighbours(): Omit<LeaderboardRow, "isYou">[] {
  const rng = makeRng("wattwise-complex-v1");
  const rows: Omit<LeaderboardRow, "isYou">[] = [];

  for (let i = 0; i < COMPLEX_SIZE; i++) {
    const floor = String(2 + Math.floor(i / 4)).padStart(2, "0");
    const unit = String(1 + (i % 4) * 5 + Math.floor(between(rng, 0, 4))).padStart(2, "0");
    rows.push({
      roomNumber: `${floor}-${unit}`,
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
  weeklyDelta = 3,
): Standing {
  const rows: LeaderboardRow[] = neighbours()
    .filter((r) => r.roomNumber !== roomNumber)
    .map((r) => ({ ...r, isYou: false }));

  rows.push({ roomNumber, score, delta: weeklyDelta, isYou: true });

  rows.sort(
    (a, b) => b.score - a.score || a.roomNumber.localeCompare(b.roomNumber),
  );

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
