/**
 * The shared contract (README §10) and the scoring formula (README §11).
 *
 * Lanes B, C and D all code against the two interfaces below. Do not change
 * their shape without telling the other lanes — see AGENTS.md.
 */

export interface ApartmentEnergyData {
  roomNumber: string;
  /** Energy used by this apartment over the period, kWh. */
  totalConsumptionKwh: number;
  /** The complex-wide benchmark for a comparable apartment, kWh. */
  referenceConsumptionKwh: number;
  /** Local tariff, SGD per kWh. */
  costPerKwh: number;
}

export type ApartmentStatus =
  | "Energy Saver"
  | "Good"
  | "Average"
  | "Needs Improvement";

export interface ApartmentScoreResult {
  /** 0–100. */
  score: number;
  /** Signed % difference from the reference. Positive means overconsuming. */
  comparisonPercent: number;
  /** SGD for the period. */
  estimatedCost: number;
  status: ApartmentStatus;
}

/** Singapore regulated tariff, SGD per kWh. */
export const TARIFF_SGD_PER_KWH = 0.2994;

const clamp = (n: number, min: number, max: number) =>
  Math.min(max, Math.max(min, n));

export function statusFor(score: number): ApartmentStatus {
  if (score >= 90) return "Energy Saver";
  if (score >= 75) return "Good";
  if (score >= 50) return "Average";
  return "Needs Improvement";
}

/**
 * Pure. No side effects, no randomness, no I/O — the same input always yields
 * the same output, which is what keeps server and client renders identical.
 *
 * Note the deliberate shape of this scale: an apartment at exactly the reference
 * scores 100, and using less also clamps to 100. That is intentional (README §11)
 * — it is a linear normalisation chosen for being explainable in one sentence,
 * not a model of a real distribution. Raise it before changing it; the demo
 * script depends on the numbers it produces.
 */
export function computeScore(
  data: ApartmentEnergyData,
): ApartmentScoreResult {
  const { totalConsumptionKwh, referenceConsumptionKwh, costPerKwh } = data;

  // A zero or negative reference has no meaningful comparison. Treat the
  // apartment as exactly at benchmark rather than dividing by zero.
  const comparisonPercent =
    referenceConsumptionKwh > 0
      ? ((totalConsumptionKwh - referenceConsumptionKwh) /
          referenceConsumptionKwh) *
        100
      : 0;

  const score = clamp(Math.round(100 - comparisonPercent), 0, 100);

  return {
    score,
    comparisonPercent: Math.round(comparisonPercent * 10) / 10,
    estimatedCost: Math.round(totalConsumptionKwh * costPerKwh * 100) / 100,
    status: statusFor(score),
  };
}
