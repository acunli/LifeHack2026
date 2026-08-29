import { APPLIANCE_PROFILES, TARIFF_SGD_PER_KWH } from "@/data/appliances";
import { between, makeRng, round } from "@/lib/rng";
import type { Appliance, ApplianceType, Rank, Socket } from "@/lib/types";

export const RANKS: Rank[] = [
  { label: "Eco Champion", emoji: "🌱", min: 90 },
  { label: "Energy Saver", emoji: "🌿", min: 80 },
  { label: "Good Steward", emoji: "🌤️", min: 70 },
  { label: "Getting There", emoji: "⚡", min: 60 },
  { label: "Energy Hungry", emoji: "🔥", min: 0 },
];

export function rankFor(score: number): Rank {
  return RANKS.find((r) => score >= r.min) ?? RANKS[RANKS.length - 1];
}

/**
 * Map consumption-vs-average onto 0-100.
 * Exactly average scores 75. Using half the average tops out near 100;
 * using double bottoms out near 25. Deliberately generous so the demo
 * never shows a depressing wall of red.
 */
export function scoreFromUsage(currentKwh: number, averageKwh: number): number {
  if (averageKwh <= 0) return 75;
  const ratio = currentKwh / averageKwh;
  const raw = 75 - (ratio - 1) * 50;
  return Math.max(5, Math.min(100, Math.round(raw)));
}

/**
 * Build an appliance with plausible, stable telemetry.
 * Seeded by socket + type, so the same choice always yields the same numbers.
 */
export function makeAppliance(
  type: ApplianceType,
  socket: Socket,
  seedSalt = "",
): Appliance {
  const profile = APPLIANCE_PROFILES[type];
  const rng = makeRng(`${socket.id}:${type}:${seedSalt}`);

  // Household variation around the class baseline.
  const averageKwh = round(profile.baselineKwh * between(rng, 0.92, 1.08), 2);
  // Today's draw, which is what the resident can actually change.
  const currentKwh = round(averageKwh * between(rng, 0.72, 1.45), 2);

  const energyScore = scoreFromUsage(currentKwh, averageKwh);
  const deltaPct = Math.round(((currentKwh - averageKwh) / averageKwh) * 100);

  return {
    id: `${socket.id}-${type}`,
    type,
    name: profile.name,
    glyph: profile.glyph,
    socketId: socket.id,
    room: socket.room,
    tx: socket.tx,
    ty: socket.ty,
    currentKwh,
    averageKwh,
    monthlyCost: round(currentKwh * 30 * TARIFF_SGD_PER_KWH, 2),
    energyScore,
    deltaPct,
    weight: profile.weight,
    tip: profile.tip,
  };
}

/**
 * Weighted mean of appliance scores. An empty apartment has no score yet —
 * returns null so the UI can show an onboarding state instead of a hard zero.
 */
export function apartmentScore(appliances: Appliance[]): number | null {
  if (appliances.length === 0) return null;
  const totalWeight = appliances.reduce((sum, a) => sum + a.weight, 0);
  if (totalWeight <= 0) return null;
  const weighted = appliances.reduce(
    (sum, a) => sum + a.energyScore * a.weight,
    0,
  );
  return Math.round(weighted / totalWeight);
}

/** Daily kWh the resident could realistically recover on this appliance. */
export function potentialSaving(a: Appliance): { kwh: number; sgd: number } {
  const excess = Math.max(0, a.currentKwh - a.averageKwh);
  return {
    kwh: round(excess, 2),
    sgd: round(excess * 30 * TARIFF_SGD_PER_KWH, 2),
  };
}
