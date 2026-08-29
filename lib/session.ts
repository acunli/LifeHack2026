/**
 * Client-side session handling backed by localStorage.
 *
 * This is a demo/session-only store. It intentionally holds NO passwords,
 * tokens, or private account data — only a display username and the room
 * number needed to look up mock apartment/energy data.
 *
 * The current session shape is:
 *   { username: string; roomNumber: string; loggedIn: true }
 *
 * Legacy sessions may only contain a `roomNumber`. Those are detected so the
 * UI can prompt the user to choose a username (see `needsUsername`).
 */

const STORAGE_KEY = 'wattlah.session'

export type Session = {
  username: string
  roomNumber: string
  loggedIn: true
}

/** Raw persisted shape — username may be missing for legacy sessions. */
type StoredSession = {
  username?: string
  roomNumber?: string
  loggedIn?: boolean
}

function isBrowser(): boolean {
  return typeof window !== 'undefined' && !!window.localStorage
}

export function readRawSession(): StoredSession | null {
  if (!isBrowser()) return null
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as StoredSession
    if (!parsed || typeof parsed !== 'object') return null
    return parsed
  } catch {
    return null
  }
}

/** A fully-valid session (has a username), or null. */
export function getSession(): Session | null {
  const raw = readRawSession()
  if (!raw || !raw.loggedIn || !raw.roomNumber) return null
  if (!raw.username) return null
  return {
    username: raw.username,
    roomNumber: raw.roomNumber,
    loggedIn: true,
  }
}

/**
 * True when a user is logged in via a legacy session that predates usernames.
 * The UI should show a username setup state in this case.
 */
export function needsUsername(): boolean {
  const raw = readRawSession()
  return !!(raw && raw.loggedIn && raw.roomNumber && !raw.username)
}

export function isLoggedIn(): boolean {
  const raw = readRawSession()
  return !!(raw && raw.loggedIn && raw.roomNumber)
}

export function saveSession(session: Session): void {
  if (!isBrowser()) return
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
  window.dispatchEvent(new Event('wattlah:session'))
}

/** Attach a username to an existing (legacy) session. */
export function setUsername(username: string): void {
  const raw = readRawSession()
  const roomNumber = raw?.roomNumber || ''
  saveSession({ username: username.trim(), roomNumber, loggedIn: true })
}

export function login(username: string, roomNumber: string): void {
  saveSession({
    username: username.trim(),
    roomNumber: roomNumber.trim(),
    loggedIn: true,
  })
}

export function logout(): void {
  if (!isBrowser()) return
  window.localStorage.removeItem(STORAGE_KEY)
  window.dispatchEvent(new Event('wattlah:session'))
}

/**
 * Stable internal user id derived from the room number. Used to key
 * deterministic mock data and to match the logged-in user in the leaderboard
 * without exposing the room number in the UI.
 */
export function userIdFromRoom(roomNumber: string): string {
  return `room-${roomNumber.trim().toLowerCase()}`
}

/** Seed a legacy (username-less) session — used for demos/tests. */
export function seedLegacySession(roomNumber: string): void {
  if (!isBrowser()) return
  window.localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ roomNumber, loggedIn: true }),
  )
  window.dispatchEvent(new Event('wattlah:session'))
}
