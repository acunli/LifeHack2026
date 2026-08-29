/**
 * Scoring logic for WattLah.
 *
 * Compatibility adapter for the leaderboard's original `EnergyReading`
 * shape. The actual formula and status thresholds live in `lib/scoring.ts`,
 * so every surface now gives the same usage the same score.
 */

import {
  computeScore as computeApartmentScore,
  dailyChange,
  rankTier,
  TARIFF_SGD_PER_KWH,
  type DailyChange,
} from '@/lib/scoring'

export const SCORE_MIN = 0
export const SCORE_MAX = 100

export type EnergyReading = {
  /** Actual energy used in the period (kWh). */
  usageKwh: number
  /** Expected/baseline usage for the apartment (kWh). */
  baselineKwh: number
}

export type RankTier = ReturnType<typeof rankTier>

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
  return computeApartmentScore({
    roomNumber: 'league',
    totalConsumptionKwh: usageKwh,
    referenceConsumptionKwh: baselineKwh,
    costPerKwh: TARIFF_SGD_PER_KWH,
  }).score
}

/**
 * Map a 0–100 score to its qualitative tier. Thresholds preserved from spec.
 */
export { dailyChange, rankTier }
export type { DailyChange }
