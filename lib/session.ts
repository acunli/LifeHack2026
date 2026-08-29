/**
 * Fake session, held in localStorage (README §13).
 *
 * Every access is wrapped: localStorage throws in private mode and in some
 * embedded browsers, and an uncaught error here would blank the whole page.
 *
 * Framework-free on purpose — React binding lives in useSession.ts.
 */

export const SESSION_KEY = "wattlah.session";

/** Fired on same-tab writes. The native `storage` event only fires cross-tab. */
export const SESSION_EVENT = "wattlah:session";

export interface Session {
  roomNumber: string;
  /**
   * Public handle shown on the league. Optional because a session created
   * before handles existed is still valid — the app prompts for one rather
   * than signing the resident out.
   */
  username?: string;
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
    const username =
      typeof parsed.username === "string" && parsed.username.trim()
        ? parsed.username.trim()
        : undefined;
    return { roomNumber: parsed.roomNumber, username, loggedIn: true };
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

export function setSession(roomNumber: string, username?: string): void {
  try {
    const session: Session = { roomNumber, username, loggedIn: true };
    window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch {
    // Persistence is a convenience, never load-bearing for the demo.
  }
  announce();
}

/** Attaches a handle to an existing session, leaving the room number alone. */
export function setUsername(username: string): void {
  const current = getSession();
  if (!current) return;
  setSession(current.roomNumber, username.trim());
}

export function clearSession(): void {
  try {
    window.localStorage.removeItem(SESSION_KEY);
  } catch {
    /* ignore */
  }
  announce();
}
