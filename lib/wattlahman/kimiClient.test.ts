import { describe, expect, it } from "vitest";
import { decideNextAction, type WattlahmanApplianceState } from "./kimiClient";

// No apiKey exercises the offline heuristic path deterministically - the
// AI path is network-dependent and covered by manual/browser verification
// instead (see PR description).

function appliance(overrides: Partial<WattlahmanApplianceState>): WattlahmanApplianceState {
  return {
    installTargetId: "x",
    name: "Appliance",
    dailyKwh: 1,
    tip: "Some tip.",
    inconvenience: 1,
    ...overrides,
  };
}

describe("decideNextAction (offline heuristic)", () => {
  it("skips when there are no candidates", async () => {
    const decision = await decideNextAction([], 50, null);
    expect(decision.action).toBe("skip");
  });

  it("picks the candidate with the best savings-per-inconvenience tradeoff, not just the biggest draw", async () => {
    const candidates = [
      // Biggest raw draw, but disruptive - a worse tradeoff than the monitor.
      appliance({ installTargetId: "washer", dailyKwh: 0.6, inconvenience: 4 }), // value 0.15
      appliance({ installTargetId: "monitor", dailyKwh: 1.0, inconvenience: 3 }), // value 0.33
      appliance({ installTargetId: "microwave", dailyKwh: 0.3, inconvenience: 1 }), // value 0.3
    ];

    const decision = await decideNextAction(candidates, 50, null);

    expect(decision.action).toBe("act");
    if (decision.action === "act") {
      expect(decision.installTargetId).toBe("monitor");
    }
  });

  it("skips rather than acting when nothing clears the worth-it threshold", async () => {
    const candidates = [
      // Low value (0.1) and (0.15) - both real appliances but not worth the hassle.
      appliance({ installTargetId: "console", dailyKwh: 0.3, inconvenience: 3 }),
      appliance({ installTargetId: "washer", dailyKwh: 0.6, inconvenience: 4 }),
    ];

    const decision = await decideNextAction(candidates, 50, null);

    expect(decision.action).toBe("skip");
  });

  it("grounds the message in the chosen appliance's own tip", async () => {
    const candidates = [appliance({ installTargetId: "tv", name: "Television", tip: "Turn it off at the wall." })];

    const decision = await decideNextAction(candidates, 50, null);

    expect(decision.action).toBe("act");
    if (decision.action === "act") {
      expect(decision.message).toContain("Turn it off at the wall.");
    }
  });
});
