/**
 * Scoring logic for WattLah.
 *
 * The leaderboard uses a single 0–100 "energy score". A score is derived from
 * how a resident's energy usage compares to their apartment baseline:
 *   - Using exactly the baseline  -> 50 (Average)
 *   - Using less than baseline    -> higher score (up to 100)
 *   - Using more than baseline    -> lower score (down to 0)
 *
 * All scores are clamped to [0, 100] so the leaderboard never shows a
 * cumulative value above 100.
 */

export const SCORE_MIN = 0
export const SCORE_MAX = 100

export type EnergyReading = {
  /** Actual energy used in the period (kWh). */
  usageKwh: number
  /** Expected/baseline usage for the apartment (kWh). */
  baselineKwh: number
}

export type RankTier = 'Energy Saver' | 'Good' | 'Average' | 'Needs Improvement'

/** Clamp a number into the valid score range. */
export function clampScore(value: number): number {
  if (Number.isNaN(value)) return SCORE_MIN
  return Math.min(SCORE_MAX, Math.max(SCORE_MIN, value))
}

/**
 * Compute a 0–100 energy score from a reading. Deterministic and pure.
 */
export function computeScore(reading: EnergyReading): number {
  const { usageKwh, baselineKwh } = reading
  if (!baselineKwh || baselineKwh <= 0) return SCORE_MIN
  // Fraction of baseline saved: >0 means used less than baseline.
  const saved = (baselineKwh - usageKwh) / baselineKwh
  // Center on-baseline at 50; a full baseline saved/overshot spans +-50.
  const raw = 50 + saved * 100
  return clampScore(Math.round(raw))
}

/**
 * Map a 0–100 score to its qualitative tier. Thresholds preserved from spec.
 */
export function rankTier(score: number): RankTier {
  const s = clampScore(score)
  if (s >= 90) return 'Energy Saver'
  if (s >= 75) return 'Good'
  if (s >= 50) return 'Average'
  return 'Needs Improvement'
}

export type DailyChange = {
  value: number
  direction: 'up' | 'down' | 'flat'
}

/**
 * Difference between today's score and the previous day's score.
 * Bounded to [-100, 100] because both inputs are already clamped to [0, 100].
 */
export function dailyChange(today: number, previous: number): DailyChange {
  const value = clampScore(today) - clampScore(previous)
  return {
    value,
    direction: value > 0 ? 'up' : value < 0 ? 'down' : 'flat',
  }
}
