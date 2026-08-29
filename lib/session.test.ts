import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  getSession,
  getSavedScore,
  isLoggedIn,
  login,
  logout,
  needsUsername,
  seedLegacySession,
  setUsername,
  saveScore,
  userIdFromRoom,
} from "./session";

/**
 * Stubs localStorage rather than pulling in jsdom — AGENTS.md forbids adding
 * dependencies without asking, and four functions do not justify one.
 */
function installStorage(impl?: Partial<Storage>) {
  const store = new Map<string, string>();
  vi.stubGlobal("window", {
    localStorage: {
      getItem: (k: string) => store.get(k) ?? null,
      setItem: (k: string, v: string) => void store.set(k, v),
      removeItem: (k: string) => void store.delete(k),
      ...impl,
    },
    dispatchEvent: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  });
  return store;
}

beforeEach(() => {
  vi.unstubAllGlobals();
});

describe("login / logout", () => {
  it("round-trips a session", () => {
    installStorage();
    login("WattWarden", "04-12");
    expect(getSession()).toMatchObject({
      username: "WattWarden",
      roomNumber: "04-12",
    });
  });

  it("logout clears it", () => {
    installStorage();
    login("WattWarden", "04-12");
    logout();
    expect(getSession()).toBeNull();
  });

  it("reports logged-in state", () => {
    installStorage();
    expect(isLoggedIn()).toBe(false);
    login("WattWarden", "04-12");
    expect(isLoggedIn()).toBe(true);
  });
});

describe("legacy sessions", () => {
  it("a seeded session is logged in but wants a username", () => {
    // Someone who signed in before handles existed must be prompted, not
    // signed out.
    installStorage();
    seedLegacySession("04-12");
    expect(isLoggedIn()).toBe(true);
    expect(needsUsername()).toBe(true);
  });

  it("setUsername satisfies it without touching the room number", () => {
    installStorage();
    seedLegacySession("04-12");
    setUsername("VoltViper");
    expect(needsUsername()).toBe(false);
    expect(getSession()).toMatchObject({
      username: "VoltViper",
      roomNumber: "04-12",
    });
  });
});

describe("hostile environments", () => {
  it("returns null rather than throwing when storage is blocked", () => {
    installStorage({
      getItem: () => {
        throw new Error("SecurityError");
      },
    });
    expect(() => getSession()).not.toThrow();
    expect(getSession()).toBeNull();
  });

  it("returns null during SSR, where window does not exist", () => {
    vi.stubGlobal("window", undefined);
    expect(getSession()).toBeNull();
  });

  it("does not crash when storage writes are blocked", () => {
    installStorage({
      setItem: () => { throw new Error("SecurityError"); },
      removeItem: () => { throw new Error("SecurityError"); },
    });
    expect(() => login("WattWarden", "04-12")).not.toThrow();
    expect(() => seedLegacySession("04-12")).not.toThrow();
    expect(() => saveScore("room-04-12", 74)).not.toThrow();
    expect(() => logout()).not.toThrow();
  });

  it("does not crash when the localStorage getter is blocked", () => {
    const blockedWindow = { dispatchEvent: vi.fn() };
    Object.defineProperty(blockedWindow, "localStorage", {
      get: () => { throw new Error("SecurityError"); },
    });
    vi.stubGlobal("window", blockedWindow);
    expect(() => isLoggedIn()).not.toThrow();
    expect(isLoggedIn()).toBe(false);
  });

  it("rejects valid JSON with an invalid session shape", () => {
    const store = installStorage();
    store.set("wattlah.session", JSON.stringify({
      username: "Tester",
      roomNumber: {},
      loggedIn: true,
    }));
    expect(getSession()).toBeNull();
    expect(isLoggedIn()).toBe(false);
  });

  it("recovers from null and malformed score entries", () => {
    const store = installStorage();
    store.set("wattlah.scores", "null");
    expect(() => saveScore("room-04-12", 74)).not.toThrow();
    expect(getSavedScore("room-04-12")?.current).toBe(74);

    store.set("wattlah.scores", JSON.stringify({
      broken: { current: "high", previous: null },
      valid: { current: 120.4, previous: -4, isProjected: true },
    }));
    expect(getSavedScore("broken")).toBeNull();
    expect(getSavedScore("valid")).toEqual({
      current: 100,
      previous: 0,
      isProjected: true,
    });
  });
});

describe("userIdFromRoom", () => {
  it("is stable for the same room", () => {
    expect(userIdFromRoom("04-12")).toBe(userIdFromRoom("04-12"));
  });

  it("differs between rooms", () => {
    expect(userIdFromRoom("04-12")).not.toBe(userIdFromRoom("08-14"));
  });
});
