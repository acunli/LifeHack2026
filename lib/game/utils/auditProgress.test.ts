import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  connectAuditTarget,
  disconnectAuditTarget,
  readAuditProgress,
  setAuditTargetPower,
} from "./auditProgress";

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
  it("keeps progress isolated by room", () => {
    connectAuditTarget("04-12", "living_tv");
    expect(readAuditProgress("04-12").connectedTargetIds).toEqual(["living_tv"]);
    expect(readAuditProgress("08-14").connectedTargetIds).toEqual([]);
  });

  it("does not count the same meter twice", () => {
    connectAuditTarget("04-12", "living_tv");
    connectAuditTarget("04-12", "living_tv");
    expect(readAuditProgress("04-12").connectedTargetIds).toHaveLength(1);
  });

  it("removes a disconnected meter", () => {
    connectAuditTarget("04-12", "living_tv");
    setAuditTargetPower("04-12", "living_tv", false);
    disconnectAuditTarget("04-12", "living_tv");
    expect(readAuditProgress("04-12").connectedTargetIds).toEqual([]);
    expect(readAuditProgress("04-12").powerByTargetId).toEqual({});
  });

  it("persists power state for a connected meter", () => {
    connectAuditTarget("04-12", "living_tv");
    setAuditTargetPower("04-12", "living_tv", false);
    expect(readAuditProgress("04-12").powerByTargetId).toEqual({ living_tv: false });
  });

  it("falls back safely when stored data is malformed", () => {
    window.localStorage.setItem("wattlah.audit.v1:04-12", "not-json");
    expect(readAuditProgress("04-12")).toEqual({ connectedTargetIds: [], powerByTargetId: {} });
  });
});
