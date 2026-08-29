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
const SCORE_KEY = 'wattlah.scores'

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
  if (typeof window === 'undefined') return false
  try {
    return !!window.localStorage
  } catch {
    return false
  }
}

export function readRawSession(): StoredSession | null {
  if (!isBrowser()) return null
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed: unknown = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return null
    const candidate = parsed as StoredSession
    if (candidate.username !== undefined && typeof candidate.username !== 'string') return null
    if (candidate.roomNumber !== undefined && typeof candidate.roomNumber !== 'string') return null
    if (candidate.loggedIn !== undefined && typeof candidate.loggedIn !== 'boolean') return null
    return candidate
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
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
    window.dispatchEvent(new Event('wattlah:session'))
  } catch {
    /* The demo remains renderable when storage is unavailable. */
  }
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
  try {
    window.localStorage.removeItem(STORAGE_KEY)
    window.dispatchEvent(new Event('wattlah:session'))
  } catch {
    /* Storage may be disabled by the browser. */
  }
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
  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ roomNumber, loggedIn: true }),
    )
    window.dispatchEvent(new Event('wattlah:session'))
  } catch {
    /* Storage may be disabled by the browser. */
  }
}

/* ── Score persistence for apartment → leaderboard sync ────────────── */

type StoredScore = {
  current: number
  previous: number
  /** True when `current` previews a resident's uncompleted savings plan. */
  isProjected?: boolean
}

type StoredScores = Record<string, StoredScore>

function readScores(): StoredScores {
  if (!isBrowser()) return {}
  try {
    const raw = window.localStorage.getItem(SCORE_KEY)
    if (!raw) return {}
    const parsed: unknown = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {}

    const scores: StoredScores = {}
    for (const [userId, value] of Object.entries(parsed)) {
      if (!value || typeof value !== 'object' || Array.isArray(value)) continue
      const candidate = value as Partial<StoredScore>
      if (!Number.isFinite(candidate.current) || !Number.isFinite(candidate.previous)) continue
      scores[userId] = {
        current: Math.max(0, Math.min(100, Math.round(candidate.current!))),
        previous: Math.max(0, Math.min(100, Math.round(candidate.previous!))),
        isProjected: typeof candidate.isProjected === 'boolean'
          ? candidate.isProjected
          : undefined,
      }
    }
    return scores
  } catch {
    return {}
  }
}

function writeScores(scores: StoredScores): void {
  if (!isBrowser()) return
  try {
    window.localStorage.setItem(SCORE_KEY, JSON.stringify(scores))
    window.dispatchEvent(new Event('wattlah:scores'))
  } catch {
    /* Score persistence is optional when storage is blocked. */
  }
}

/** Save the current user's apartment score so the leaderboard can read it. */
export function saveScore(
  userId: string,
  score: number,
  options: { isProjected?: boolean } = {},
): void {
  const scores = readScores()
  const existing = scores[userId]

  /*
   * `previous` is the prior comparison period, and it does not move while the
   * resident previews changes in the current period.
   *
   * It used to track the last score you held, which was wrong twice over:
   * re-saving on mount collapsed it into the current score, so the arrow read
   * 0; and undoing a what-if read as a real decline — resetting 85 back to 74
   * showed "▼ -11" when the comparison period had not changed.
   *
   * Seeded once from the first score seen, then left alone. Today moves; the
   * comparison point does not.
   */
  scores[userId] = {
    current: score,
    previous: existing?.previous ?? score,
    isProjected: options.isProjected ?? false,
  }
  writeScores(scores)
}


/** Get a saved score for a user, or null if none exists. */
export function getSavedScore(
  userId: string,
): StoredScore | null {
  const scores = readScores()
  return scores[userId] ?? null
}
