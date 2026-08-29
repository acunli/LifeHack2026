import { describe, expect, it } from "vitest";
import { computeScore as apartmentScore } from "./scoring";
import { computeScore as leagueScore } from "./leagueScoring";
import { MOCK_APARTMENT } from "@/data/mockApartment";

/**
 * Three surfaces compute a score: the dashboard, the league, and the shared
 * apartment model. They have drifted apart before — at one point the league
 * used `50 + saved * 100` while the dashboard used `100 - over`, so the same
 * flat read differently depending on which page you were on.
 *
 * These lock them to one definition:
 *
 *   comparison = (usage - reference) / reference * 100     (a percentage)
 *   score      = clamp(100 - comparison, 0, 100)
 */
describe("one scoring definition across every surface", () => {
  it("the league and the apartment agree for the same reading", () => {
    for (const [usage, reference] of [
      [403, 320],
      [320, 320],
      [160, 320],
      [640, 320],
    ]) {
      const a = apartmentScore({
        roomNumber: "t",
        totalConsumptionKwh: usage,
        referenceConsumptionKwh: reference,
        costPerKwh: 0.2994,
      }).score;
      const l = leagueScore({ usageKwh: usage, baselineKwh: reference });
      expect(l).toBe(a);
    }
  });

  it("compares as a percentage of the reference, not a raw difference", () => {
    // 10 over 100 and 100 over 1000 are both +10%, so both must score 90.
    const small = apartmentScore({
      roomNumber: "t",
      totalConsumptionKwh: 110,
      referenceConsumptionKwh: 100,
      costPerKwh: 0.3,
    });
    const large = apartmentScore({
      roomNumber: "t",
      totalConsumptionKwh: 1100,
      referenceConsumptionKwh: 1000,
      costPerKwh: 0.3,
    });
    expect(small.comparisonPercent).toBe(10);
    expect(large.comparisonPercent).toBe(10);
    expect(small.score).toBe(large.score);
    expect(small.score).toBe(90);
  });

  it("the demo apartment reads 74 at 26% over, as the panel claims", () => {
    const r = apartmentScore(MOCK_APARTMENT);
    expect(Math.round(r.comparisonPercent)).toBe(26);
    expect(r.score).toBe(74);
  });
});
