/**
 * Turns the installed appliances into a score, reusing the app's shared
 * scoring contract (lib/scoring.ts) rather than inventing a second formula
 * for this game. Works the same for fixed and custom appliances - both
 * carry their own dailyKwh and referenceDailyKwh.
 *
 * The reference is built from the appliances the resident has actually
 * scanned, not from a flat household constant. The constant it replaces
 * (2.5 kWh/day for a whole household) produced two visible lies:
 *
 *  - A fully audited flat drawing 3.9 kWh/day across five appliances was
 *    compared against a number that never moved, so a flat whose every
 *    appliance sat above its own typical figure could still read 100/100
 *    while the "Every appliance" list showed +53% on the aircon.
 *  - A resident who had scanned one meter was compared against a whole
 *    household's worth of consumption, so the first scan always scored 100
 *    and the score fell as they audited more - exactly backwards.
 *
 * Reference counts every *installed* appliance, while consumption counts
 * only the ones currently *on*. That asymmetry is deliberate: it means
 * switching something off always improves the score (the numerator drops,
 * the denominator doesn't), which is the whole promise the game makes to
 * the resident and what WattLahMan's loop assumes when it stops at 100.
 */

import { computeScore, TARIFF_SGD_PER_KWH, type ApartmentScoreResult } from '@/lib/scoring';

export interface ScoredAppliance {
  dailyKwh: number;
  referenceDailyKwh: number;
  isOn: boolean;
}

export function calculateEnergyScore(
  installed: ScoredAppliance[],
): ApartmentScoreResult & { totalDailyKwh: number; referenceDailyKwh: number } {
  const totalDailyKwh = installed
    .filter(appliance => appliance.isOn)
    .reduce((sum, appliance) => sum + appliance.dailyKwh, 0);

  // Every installed appliance, on or off - see the note above.
  const referenceDailyKwh = installed.reduce(
    (sum, appliance) => sum + appliance.referenceDailyKwh,
    0,
  );

  // Nothing scanned yet: computeScore treats a zero reference as "exactly at
  // benchmark" and returns 100. That is the honest reading of an unaudited
  // flat - there is no evidence of overconsumption - and WattLahMan sends the
  // resident to scan a meter rather than claiming there is nothing to do.
  const result = computeScore({
    roomNumber: 'demo',
    totalConsumptionKwh: totalDailyKwh,
    referenceConsumptionKwh: referenceDailyKwh,
    costPerKwh: TARIFF_SGD_PER_KWH,
  });

  return {
    ...result,
    totalDailyKwh: Math.round(totalDailyKwh * 100) / 100,
    referenceDailyKwh: Math.round(referenceDailyKwh * 100) / 100,
  };
}
