'use client'

import { useCallback, useSyncExternalStore } from 'react'
import {
  getSession,
  needsUsername,
  readRawSession,
  type Session,
} from '@/lib/session'

export type SessionState = {
  /** Fully valid session (has username), or null. */
  session: Session | null
  /** Logged in but missing a username (legacy session). */
  needsUsername: boolean
  /** Logged in at all (valid or legacy). */
  isAuthenticated: boolean
}

function subscribe(callback: () => void): () => void {
  if (typeof window === 'undefined') return () => {}
  window.addEventListener('wattlah:session', callback)
  window.addEventListener('storage', callback)
  return () => {
    window.removeEventListener('wattlah:session', callback)
    window.removeEventListener('storage', callback)
  }
}

function getSnapshot(): string {
  // Serialize a stable snapshot string so useSyncExternalStore can compare.
  const raw = readRawSession()
  return raw ? JSON.stringify(raw) : ''
}

function getServerSnapshot(): string {
  return ''
}

/**
 * Reactive view of the localStorage session. Safe for SSR: it returns the
 * empty/unauthenticated state on the server and hydrates on the client.
 */
export function useSession(): SessionState {
  const snapshot = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  )

  const derive = useCallback((): SessionState => {
    if (!snapshot) {
      return { session: null, needsUsername: false, isAuthenticated: false }
    }
    return {
      session: getSession(),
      needsUsername: needsUsername(),
      isAuthenticated: true,
    }
  }, [snapshot])

  return derive()
}
