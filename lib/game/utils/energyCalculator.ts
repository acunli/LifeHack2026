/**
 * Turns the installed appliances' daily kWh figures into a score, reusing
 * the app's shared scoring contract (lib/scoring.ts) rather than inventing
 * a second formula for this game. Works the same for fixed and custom
 * appliances - both already carry their own dailyKwh.
 */

import { computeScore, TARIFF_SGD_PER_KWH, type ApartmentScoreResult } from '@/lib/scoring';

// A modest household baseline so installing a couple of efficient
// appliances reads as "Good" and installing several power-hungry ones
// pushes toward "Needs Improvement" - illustrative, not a measured
// benchmark, and unbounded since custom appliances can be added freely.
const REFERENCE_DAILY_KWH = 2.5;

export function calculateEnergyScore(installedDailyKwh: number[]): ApartmentScoreResult & { totalDailyKwh: number } {
  const totalDailyKwh = installedDailyKwh.reduce((sum, kwh) => sum + kwh, 0);

  const result = computeScore({
    roomNumber: 'demo',
    totalConsumptionKwh: totalDailyKwh,
    referenceConsumptionKwh: REFERENCE_DAILY_KWH,
    costPerKwh: TARIFF_SGD_PER_KWH,
  });

  return { ...result, totalDailyKwh: Math.round(totalDailyKwh * 100) / 100 };
}
