/**
 * Deterministic mock leaderboard data + data-access layer.
 *
 * There is no production backend yet. All data here is generated from a fixed
 * seed so renders are stable (no Math.random during rendering) and tests are
 * reproducible. The public functions (`fetchLeaderboard`) are shaped like an
 * async API so this module can later be swapped for a real database/API call
 * without changing the consuming components.
 */

import { computeScore, dailyChange, rankTier, type DailyChange } from '@/lib/leagueScoring'
import { userIdFromRoom, getSavedScore } from '@/lib/session'
import { mascotForId, type MascotName } from '@/data/mascotSprites'

export type LeaderboardEntry = {
  id: string
  username: string
  /** Kept internally for apartment/energy mock data; never rendered. */
  roomNumber: string
  mascot: MascotName
  /** Today's 0–100 energy score. */
  score: number
  /** Previous day's 0–100 energy score. */
  previousScore: number
  change: DailyChange
  tier: ReturnType<typeof rankTier>
  rank: number
  isCurrentUser: boolean
  /** The resident is previewing a plan; this is not a measured result. */
  isProjected: boolean
}

/** Raw resident records (usernames only — no legal names/emails). */
type Resident = {
  username: string
  roomNumber: string
  baselineKwh: number
}

const RESIDENTS: Resident[] = [
  { username: 'PixelPanda', roomNumber: '0102', baselineKwh: 12 },
  { username: 'WattWarden', roomNumber: '0207', baselineKwh: 10 },
  { username: 'SolarSprout', roomNumber: '0311', baselineKwh: 14 },
  { username: 'VoltViper', roomNumber: '0405', baselineKwh: 11 },
  { username: 'EcoEmber', roomNumber: '0512', baselineKwh: 13 },
  { username: 'GridGoblin', roomNumber: '0608', baselineKwh: 9 },
  { username: 'LumenLotus', roomNumber: '0701', baselineKwh: 15 },
  { username: 'AmpAcorn', roomNumber: '0803', baselineKwh: 10 },
  { username: 'JouleJelly', roomNumber: '0909', baselineKwh: 12 },
  { username: 'KiloKoala', roomNumber: '1004', baselineKwh: 11 },
  { username: 'FluxFerret', roomNumber: '1106', baselineKwh: 13 },
  { username: 'NovaNewt', roomNumber: '1210', baselineKwh: 10 },
]

/** Deterministic hash → float in [0, 1) from an arbitrary string seed. */
function seededUnit(seed: string): number {
  let h = 2166136261 >>> 0
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i)
    h = Math.imul(h, 16777619) >>> 0
  }
  // Spread bits into a fraction.
  return ((h >>> 8) % 100000) / 100000
}

/**
 * Deterministic usage factor for a resident/period. Maps to roughly [1, 2]
 * of baseline, which the shared score contract maps across the full 100–0
 * range without inventing a second leaderboard-only formula.
 */
function usageFactor(roomNumber: string, day: string): number {
  const u = seededUnit(`${roomNumber}:${day}`)
  return 1 + u // [1, 2)
}

/**
 * Yesterday's score, as today's plus a bounded drift.
 *
 * Previously this was a second independent draw for the previous day, which
 * made "yesterday" unrelated to today — the board showed daily changes of 40
 * and 50 points, and nobody's electricity habits move that far overnight.
 * Deriving it from today bounds the change to single digits by construction
 * rather than hoping the hash cooperates.
 */
function previousScoreFor(roomNumber: string, score: number): number {
  const drift = Math.round((seededUnit(`${roomNumber}:drift`) - 0.5) * 13);
  return Math.max(0, Math.min(100, score - drift));
}

function scoreFor(resident: Resident, day: string): number {
  const factor = usageFactor(resident.roomNumber, day)
  return computeScore({
    usageKwh: resident.baselineKwh * factor,
    baselineKwh: resident.baselineKwh,
  })
}

/** Build an unranked entry for a resident for the given (today, prev) days. */
function toEntry(
  resident: Resident,
  today: string,
  prev: string,
  currentUserId: string | null,
): Omit<LeaderboardEntry, 'rank'> {
  const id = userIdFromRoom(resident.roomNumber)
  const isCurrentUser = currentUserId === id

  // If this is the current user and they have a saved score from apartment
  // recommendations, use that instead of the mock data.
  const saved = isCurrentUser ? getSavedScore(id) : null
  const score = saved?.current ?? scoreFor(resident, today)
  const previousScore = saved?.previous ?? previousScoreFor(resident.roomNumber, score)

  return {
    id,
    username: resident.username,
    roomNumber: resident.roomNumber,
    mascot: mascotForId(id),
    score,
    previousScore,
    change: dailyChange(score, previousScore),
    tier: rankTier(score),
    isCurrentUser,
    isProjected: saved?.isProjected ?? false,
  }
}

export type CurrentUser = {
  username: string
  roomNumber: string
}

/**
 * Core (synchronous, pure) builder. Exposed for tests. Ranks by score desc,
 * with username as a stable tiebreaker so ordering is deterministic.
 */
export function buildLeaderboard(
  current: CurrentUser | null,
  today = 'day-30',
  prev = 'day-29',
): LeaderboardEntry[] {
  const currentUserId = current ? userIdFromRoom(current.roomNumber) : null

  const residents = [...RESIDENTS]
  // If the logged-in user isn't one of the seeded residents, add them so their
  // rank can be shown even when outside the visible range.
  if (current && !residents.some((r) => r.roomNumber === current.roomNumber)) {
    residents.push({
      username: current.username,
      roomNumber: current.roomNumber,
      baselineKwh: 12,
    })
  }

  const entries = residents.map((r) => toEntry(r, today, prev, currentUserId))
  // If the current user matched a seeded resident, override the display name
  // with their chosen username.
  if (current) {
    for (const e of entries) {
      if (e.id === currentUserId) e.username = current.username
    }
  }

  entries.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score
    return a.username.localeCompare(b.username)
  })

  return entries.map((e, i) => ({ ...e, rank: i + 1 }))
}

/** "Last updated" instant used for the demo (stable per session load). */
export function lastUpdated(): Date {
  return new Date()
}

/**
 * Async API-shaped accessor. Simulates a network fetch so the UI can exercise
 * loading/error states. `failRate`/`emptyRate` are test hooks only.
 */
export async function fetchLeaderboard(
  current: CurrentUser | null,
  opts: { simulate?: 'ok' | 'error' | 'empty'; delayMs?: number } = {},
): Promise<LeaderboardEntry[]> {
  const { simulate = 'ok', delayMs = 450 } = opts
  await new Promise((r) => setTimeout(r, delayMs))
  if (simulate === 'error') {
    throw new Error('Unable to load the leaderboard right now.')
  }
  if (simulate === 'empty') {
    return []
  }
  return buildLeaderboard(current)
}
