/**
 * Fake session, held in localStorage (README §13).
 *
 * Every access is wrapped: localStorage throws in private mode and in some
 * embedded browsers, and an uncaught error here would blank the whole page.
 *
 * Framework-free on purpose — React binding lives in useSession.ts.
 */

export const SESSION_KEY = "wattwise.session";

/** Fired on same-tab writes. The native `storage` event only fires cross-tab. */
export const SESSION_EVENT = "wattwise:session";

export interface Session {
  roomNumber: string;
  loggedIn: boolean;
}

/** The raw stored string, or null. Never throws. */
export function readRaw(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(SESSION_KEY);
  } catch {
    return null;
  }
}

/** Parse a stored value. Returns null for absent, malformed, or logged-out. */
export function parseSession(raw: string | null): Session | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<Session>;
    if (typeof parsed?.roomNumber !== "string") return null;
    if (!parsed.roomNumber.trim()) return null;
    if (parsed.loggedIn !== true) return null;
    return { roomNumber: parsed.roomNumber, loggedIn: true };
  } catch {
    return null;
  }
}

export function getSession(): Session | null {
  return parseSession(readRaw());
}

function announce() {
  try {
    window.dispatchEvent(new Event(SESSION_EVENT));
  } catch {
    /* ignore */
  }
}

export function setSession(roomNumber: string): void {
  try {
    const session: Session = { roomNumber, loggedIn: true };
    window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch {
    // Persistence is a convenience, never load-bearing for the demo.
  }
  announce();
}

export function clearSession(): void {
  try {
    window.localStorage.removeItem(SESSION_KEY);
  } catch {
    /* ignore */
  }
  announce();
}
