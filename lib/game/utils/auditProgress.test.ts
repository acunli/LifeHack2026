import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  connectAuditTarget,
  disconnectAuditTarget,
  readAuditProgress,
  setAuditTargetPower,
} from "./auditProgress";

// A fresh room now defaults to a realistic starting state (fridge, TV,
// monitor, and washer already on - see auditProgress.ts's DEFAULT_PROGRESS)
// rather than empty, so tests that care about isolation/connect/disconnect
// behavior use the one fixed socket deliberately left out of that default
// (the microwave), to avoid every assertion having to account for it.
const UNSEEDED_TARGET = "kitchen_microwave";

function installStorage() {
  const store = new Map<string, string>();
  vi.stubGlobal("window", {
    localStorage: {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => void store.set(key, value),
    },
    dispatchEvent: vi.fn(),
  });
}

beforeEach(() => {
  vi.unstubAllGlobals();
  installStorage();
});

describe("energy audit progress", () => {
  it("defaults a fresh room to a realistic starting state, not empty", () => {
    const progress = readAuditProgress("04-12");
    expect(progress.connectedTargetIds.sort()).toEqual(
      ["bathroom_washer", "kitchen_fridge", "living_tv", "study_desk"].sort(),
    );
    expect(progress.connectedTargetIds).not.toContain(UNSEEDED_TARGET);
    expect(Object.values(progress.powerByTargetId).every((on) => on === true)).toBe(true);
  });

  it("keeps progress isolated by room", () => {
    connectAuditTarget("04-12", UNSEEDED_TARGET);
    expect(readAuditProgress("04-12").connectedTargetIds).toContain(UNSEEDED_TARGET);
    expect(readAuditProgress("08-14").connectedTargetIds).not.toContain(UNSEEDED_TARGET);
  });

  it("does not count the same meter twice", () => {
    connectAuditTarget("04-12", UNSEEDED_TARGET);
    connectAuditTarget("04-12", UNSEEDED_TARGET);
    expect(
      readAuditProgress("04-12").connectedTargetIds.filter((id) => id === UNSEEDED_TARGET),
    ).toHaveLength(1);
  });

  it("removes a disconnected meter", () => {
    connectAuditTarget("04-12", UNSEEDED_TARGET);
    setAuditTargetPower("04-12", UNSEEDED_TARGET, false);
    disconnectAuditTarget("04-12", UNSEEDED_TARGET);
    expect(readAuditProgress("04-12").connectedTargetIds).not.toContain(UNSEEDED_TARGET);
    expect(readAuditProgress("04-12").powerByTargetId[UNSEEDED_TARGET]).toBeUndefined();
  });

  it("persists power state for a connected meter", () => {
    connectAuditTarget("04-12", UNSEEDED_TARGET);
    setAuditTargetPower("04-12", UNSEEDED_TARGET, false);
    expect(readAuditProgress("04-12").powerByTargetId[UNSEEDED_TARGET]).toBe(false);
  });

  it("falls back safely when stored data is malformed", () => {
    window.localStorage.setItem("wattlah.audit.v1:04-12", "not-json");
    expect(readAuditProgress("04-12")).toEqual({ connectedTargetIds: [], powerByTargetId: {} });
  });
});
