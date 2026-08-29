"use client";

import { useSyncExternalStore } from "react";
import {
  SESSION_EVENT,
  getSession,
  readRaw,
  type Session,
} from "./session";

/**
 * `undefined` means "not resolved yet" — the server render and the first client
 * pass. `null` means "definitely signed out". The distinction matters: a guard
 * that treats the pre-hydration frame as signed-out would bounce a logged-in
 * resident back to the login screen on every refresh.
 */
export type SessionState = Session | null | undefined;

// useSyncExternalStore compares snapshots by reference, so a fresh object on
// every call would loop forever. Cache against the raw string instead.
let cachedRaw: string | null = null;
let cached: Session | null = null;
let primed = false;

function getClientSnapshot(): SessionState {
  const raw = readRaw();
  if (!primed || raw !== cachedRaw) {
    primed = true;
    cachedRaw = raw;
    cached = getSession();
  }
  return cached;
}

function getServerSnapshot(): SessionState {
  return undefined;
}

function subscribe(onChange: () => void): () => void {
  window.addEventListener(SESSION_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(SESSION_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

export function useSession(): SessionState {
  return useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot);
}
