import { describe, expect, it } from "vitest";
import { APPLIANCES } from "@/data/appliances";
import { RECOMMENDATIONS } from "@/data/recommendations";
import { applyRecommendation, scoreFor, totalOf } from "./useEnergyState";
import { MOCK_APARTMENT } from "@/data/mockApartment";

const baseline = () =>
  Object.fromEntries(APPLIANCES.map((a) => [a.id, a.kwh]));

const rec = (id: string) => RECOMMENDATIONS.find((r) => r.id === id)!;

describe("recommendations data", () => {
  it("every recommendation targets a real appliance or the home", () => {
    const ids = new Set(APPLIANCES.map((a) => a.id));
    for (const r of RECOMMENDATIONS) {
      expect(ids.has(r.appliance) || r.appliance === "home").toBe(true);
    }
  });

  it("has unique ids", () => {
    const ids = RECOMMENDATIONS.map((r) => r.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("never claims a saving larger than the appliance uses", () => {
    // Otherwise applying everything drives an appliance below zero, and the
    // dashboard shows a negative kWh.
    for (const a of APPLIANCES) {
      const claimed = RECOMMENDATIONS.filter((r) => r.appliance === a.id).reduce(
        (s, r) => s + r.save,
        0,
      );
      expect(claimed).toBeLessThanOrEqual(a.kwh);
    }
  });
});

describe("applyRecommendation", () => {
  it("reduces the targeted appliance", () => {
    const next = applyRecommendation(baseline(), rec("ac-25"), false);
    expect(next.aircon).toBe(180 - 34);
  });

  it("leaves other appliances alone", () => {
    const next = applyRecommendation(baseline(), rec("ac-25"), false);
    expect(next.fridge).toBe(95);
  });

  it("undo restores the original figure", () => {
    const applied = applyRecommendation(baseline(), rec("ac-25"), false);
    const undone = applyRecommendation(applied, rec("ac-25"), true);
    expect(undone.aircon).toBe(180);
  });

  it("undo never pushes above the authored baseline", () => {
    const doubled = applyRecommendation(baseline(), rec("ac-25"), true);
    expect(doubled.aircon).toBe(180);
  });

  it("never drives consumption negative", () => {
    let kwh = baseline();
    for (const r of RECOMMENDATIONS) kwh = applyRecommendation(kwh, r, false);
    for (const a of APPLIANCES) expect(kwh[a.id]).toBeGreaterThanOrEqual(0);
  });

  it("ignores whole-home recommendations, which have no single appliance", () => {
    const next = applyRecommendation(baseline(), rec("h-fan"), false);
    expect(totalOf(next)).toBe(totalOf(baseline()));
  });
});

describe("scoreFor", () => {
  it("matches the authored apartment at baseline", () => {
    expect(totalOf(baseline())).toBe(MOCK_APARTMENT.totalConsumptionKwh);
    expect(scoreFor(baseline()).score).toBe(74);
  });

  it("improves when a saving is applied", () => {
    const before = scoreFor(baseline()).score;
    const after = scoreFor(
      applyRecommendation(baseline(), rec("ac-25"), false),
    ).score;
    expect(after).toBeGreaterThan(before);
  });

  it("applying everything does not exceed 100", () => {
    let kwh = baseline();
    for (const r of RECOMMENDATIONS) kwh = applyRecommendation(kwh, r, false);
    expect(scoreFor(kwh).score).toBeLessThanOrEqual(100);
  });
});
