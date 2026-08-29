import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  SESSION_KEY,
  clearSession,
  getSession,
  parseSession,
  setSession,
} from "./session";

/**
 * Minimal localStorage stub. Avoids pulling in jsdom for four functions —
 * AGENTS.md says no new dependencies without asking.
 */
function installStorage(impl?: Partial<Storage>) {
  const store = new Map<string, string>();
  const storage = {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => void store.set(k, v),
    removeItem: (k: string) => void store.delete(k),
    ...impl,
  };
  vi.stubGlobal("window", {
    localStorage: storage,
    dispatchEvent: vi.fn(),
  });
  return store;
}

beforeEach(() => {
  vi.unstubAllGlobals();
});

describe("parseSession", () => {
  it.each([
    ["null input", null],
    ["empty string", ""],
    ["malformed JSON", "{not json"],
    ["missing roomNumber", JSON.stringify({ loggedIn: true })],
    ["blank roomNumber", JSON.stringify({ roomNumber: "  ", loggedIn: true })],
    ["not logged in", JSON.stringify({ roomNumber: "04-12", loggedIn: false })],
    ["roomNumber wrong type", JSON.stringify({ roomNumber: 412, loggedIn: true })],
  ])("returns null for %s", (_label, raw) => {
    expect(parseSession(raw as string | null)).toBeNull();
  });

  it("parses a valid session", () => {
    const raw = JSON.stringify({ roomNumber: "04-12", loggedIn: true });
    expect(parseSession(raw)).toEqual({ roomNumber: "04-12", loggedIn: true });
  });
});

describe("round trip", () => {
  it("stores and reads back a room number", () => {
    installStorage();
    setSession("04-12");
    expect(getSession()).toEqual({ roomNumber: "04-12", loggedIn: true });
  });

  it("clears", () => {
    installStorage();
    setSession("04-12");
    clearSession();
    expect(getSession()).toBeNull();
  });

  it("writes under the documented key", () => {
    const store = installStorage();
    setSession("08-14");
    expect(store.get(SESSION_KEY)).toContain("08-14");
  });
});

describe("hostile environments", () => {
  it("returns null rather than throwing when storage is blocked", () => {
    installStorage({
      getItem: () => {
        throw new Error("SecurityError: storage disabled");
      },
    });
    expect(() => getSession()).not.toThrow();
    expect(getSession()).toBeNull();
  });

  it("does not throw when a write is rejected", () => {
    installStorage({
      setItem: () => {
        throw new Error("QuotaExceededError");
      },
    });
    expect(() => setSession("04-12")).not.toThrow();
  });

  it("returns null during SSR, where window does not exist", () => {
    vi.stubGlobal("window", undefined);
    expect(getSession()).toBeNull();
  });
});
