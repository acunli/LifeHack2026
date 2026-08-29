import { makeRng, between } from "@/lib/rng";
import type { LeaderboardEntry } from "@/lib/types";

const COMPLEX_SIZE = 48;

/**
 * Seeded neighbours. Stable across renders and reloads so the resident's
 * rank doesn't jitter mid-demo.
 */
function seedNeighbours(): Omit<LeaderboardEntry, "isCurrentResident">[] {
  const rng = makeRng("econest-complex-v1");
  const entries: Omit<LeaderboardEntry, "isCurrentResident">[] = [];

  for (let i = 0; i < COMPLEX_SIZE; i++) {
    const floor = String(2 + Math.floor(i / 4)).padStart(2, "0");
    const unit = String(1 + (i % 4) * 5 + Math.floor(between(rng, 0, 4)))
      .padStart(2, "0");
    entries.push({
      roomNumber: `${floor}-${unit}`,
      score: Math.round(between(rng, 52, 96)),
      weeklyDelta: Math.round(between(rng, -6, 8)),
    });
  }
  return entries;
}

/**
 * Full complex ranking with the resident's live score spliced in, so the
 * leaderboard reacts to what they actually did in their apartment.
 */
export function buildLeaderboard(
  residentRoom: string,
  residentScore: number | null,
): { entries: LeaderboardEntry[]; rank: number; total: number } {
  const others = seedNeighbours().filter((e) => e.roomNumber !== residentRoom);

  const all: LeaderboardEntry[] = others.map((e) => ({
    ...e,
    isCurrentResident: false,
  }));

  if (residentScore !== null) {
    all.push({
      roomNumber: residentRoom,
      score: residentScore,
      weeklyDelta: 3,
      isCurrentResident: true,
    });
  }

  all.sort((a, b) => b.score - a.score || a.roomNumber.localeCompare(b.roomNumber));

  const rank = all.findIndex((e) => e.isCurrentResident) + 1;
  return { entries: all, rank: rank || 0, total: all.length };
}
