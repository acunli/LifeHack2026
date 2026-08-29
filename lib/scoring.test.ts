import { describe, expect, it } from "vitest";
import { computeScore, statusFor, type ApartmentEnergyData } from "./scoring";
import { MOCK_APARTMENT } from "@/data/mockApartment";

const base = (over: Partial<ApartmentEnergyData> = {}): ApartmentEnergyData => ({
  roomNumber: "04-12",
  totalConsumptionKwh: 100,
  referenceConsumptionKwh: 100,
  costPerKwh: 0.3,
  ...over,
});

describe("computeScore", () => {
  it("scores 100 at exactly the reference", () => {
    const r = computeScore(base());
    expect(r.comparisonPercent).toBe(0);
    expect(r.score).toBe(100);
  });

  it("subtracts a point per percent above reference", () => {
    const r = computeScore(base({ totalConsumptionKwh: 120 }));
    expect(r.comparisonPercent).toBe(20);
    expect(r.score).toBe(80);
  });

  it("clamps to 100 when below reference", () => {
    const r = computeScore(base({ totalConsumptionKwh: 50 }));
    expect(r.comparisonPercent).toBe(-50);
    expect(r.score).toBe(100);
  });

  it("clamps to 0 rather than going negative", () => {
    const r = computeScore(base({ totalConsumptionKwh: 500 }));
    expect(r.score).toBe(0);
  });

  it("does not divide by a zero reference", () => {
    const r = computeScore(base({ referenceConsumptionKwh: 0 }));
    expect(Number.isFinite(r.score)).toBe(true);
    expect(r.score).toBe(100);
  });

  it("estimates cost from consumption and tariff", () => {
    const r = computeScore(base({ totalConsumptionKwh: 400, costPerKwh: 0.2994 }));
    expect(r.estimatedCost).toBeCloseTo(119.76, 2);
  });
});

describe("statusFor boundaries", () => {
  it.each([
    [100, "Energy Saver"],
    [90, "Energy Saver"],
    [89, "Good"],
    [75, "Good"],
    [74, "Average"],
    [50, "Average"],
    [49, "Needs Improvement"],
    [0, "Needs Improvement"],
  ])("scores %i as %s", (score, expected) => {
    expect(statusFor(score)).toBe(expected);
  });
});

describe("the demo apartment", () => {
  it("lands in the 72-78 band README section 11 asks for", () => {
    const r = computeScore(MOCK_APARTMENT);
    expect(r.score).toBeGreaterThanOrEqual(72);
    expect(r.score).toBeLessThanOrEqual(78);
  });

  it("reports what it actually shows on stage", () => {
    const r = computeScore(MOCK_APARTMENT);
    console.log(`\n  demo apartment → score ${r.score}, status "${r.status}", ` +
      `${r.comparisonPercent}% vs reference, S$${r.estimatedCost}\n`);
    expect(r.score).toBe(74);
  });
});
