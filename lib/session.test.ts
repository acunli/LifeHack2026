import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  getSession,
  isLoggedIn,
  login,
  logout,
  needsUsername,
  seedLegacySession,
  setUsername,
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
});

describe("userIdFromRoom", () => {
  it("is stable for the same room", () => {
    expect(userIdFromRoom("04-12")).toBe(userIdFromRoom("04-12"));
  });

  it("differs between rooms", () => {
    expect(userIdFromRoom("04-12")).not.toBe(userIdFromRoom("08-14"));
  });
});
