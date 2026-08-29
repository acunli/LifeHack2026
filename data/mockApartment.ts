import type { ApartmentEnergyData } from "@/lib/scoring";
import { TARIFF_SGD_PER_KWH } from "@/lib/scoring";

/**
 * ⚠️ PLACEHOLDER — THIS FILE BELONGS TO LANE D.
 *
 * Lane A created it only to unblock the build; the values below are plausible
 * but UNSOURCED. Lane D owns this file (AGENTS.md) and replaces these numbers
 * with sourced ones at the 16:00 handoff, with a citation beside each.
 *
 * Current values are tuned to land the demo apartment on a score of 74, inside
 * the 72–78 band README §11 asks for — visibly imperfect, with room to improve.
 * Reference figure is in the range of a Singapore 4-room HDB flat.
 *
 * Do not build a component that depends on these exact numbers.
 */
export const MOCK_APARTMENT: ApartmentEnergyData = {
  roomNumber: "04-12",
  totalConsumptionKwh: 403, // ~26% above reference → score 74
  referenceConsumptionKwh: 320,
  costPerKwh: TARIFF_SGD_PER_KWH,
};
