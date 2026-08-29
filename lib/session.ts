/**
 * Fake session, held in localStorage (README §13).
 *
 * Every access is wrapped: localStorage throws in private mode and in some
 * embedded browsers, and a thrown error here would blank the whole page.
 */

const KEY = "wattwise.session";

export interface Session {
  roomNumber: string;
  loggedIn: boolean;
}

/** Returns null on the server, and whenever storage is unavailable or corrupt. */
export function getSession(): Session | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<Session>;
    if (typeof parsed?.roomNumber !== "string" || !parsed.loggedIn) return null;
    return { roomNumber: parsed.roomNumber, loggedIn: true };
  } catch {
    return null;
  }
}

export function setSession(roomNumber: string): void {
  try {
    const session: Session = { roomNumber, loggedIn: true };
    window.localStorage.setItem(KEY, JSON.stringify(session));
  } catch {
    // Persistence is a convenience, never load-bearing for the demo.
  }
}

export function clearSession(): void {
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}
