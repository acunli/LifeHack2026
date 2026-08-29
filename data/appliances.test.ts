import { describe, expect, it } from "vitest";
import {
  APPLIANCES,
  applianceScore,
  applianceLoad,
  totalApplianceKwh,
  worstAppliance,
} from "./appliances";
import { MOCK_APARTMENT } from "./mockApartment";

describe("appliance data consistency", () => {
  it("sums to the apartment total", () => {
    // If this fails, the dashboard and the headline number disagree — the
    // first thing a judge would notice.
    expect(totalApplianceKwh()).toBe(MOCK_APARTMENT.totalConsumptionKwh);
  });

  it("has unique ids", () => {
    const ids = APPLIANCES.map((a) => a.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("places every appliance inside the room", () => {
    for (const a of APPLIANCES) {
      expect(a.col).toBeGreaterThanOrEqual(0);
      expect(a.col).toBeLessThan(13); // ROOM_COLS
      expect(a.row).toBeGreaterThanOrEqual(0);
      expect(a.row).toBeLessThan(9); // ROOM_ROWS
    }
  });
});

describe("applianceScore", () => {
  it("scores at or under reference near the top", () => {
    const fridge = APPLIANCES.find((a) => a.id === "fridge")!;
    expect(applianceScore(fridge)).toBeGreaterThanOrEqual(100);
  });

  it("penalises the worst offender", () => {
    const aircon = APPLIANCES.find((a) => a.id === "aircon")!;
    expect(applianceScore(aircon)).toBeLessThan(60);
  });

  it("stays inside 0-100", () => {
    for (const a of APPLIANCES) {
      expect(applianceScore(a)).toBeGreaterThanOrEqual(0);
      expect(applianceScore(a)).toBeLessThanOrEqual(100);
    }
  });
});

describe("worstAppliance", () => {
  it("is the aircon, which the demo script points at", () => {
    expect(worstAppliance().id).toBe("aircon");
  });
});

describe("applianceLoad", () => {
  it("normalises the hottest to 1", () => {
    expect(applianceLoad(worstAppliance())).toBe(1);
  });

  it("stays inside 0-1", () => {
    for (const a of APPLIANCES) {
      expect(applianceLoad(a)).toBeGreaterThan(0);
      expect(applianceLoad(a)).toBeLessThanOrEqual(1);
    }
  });
});
