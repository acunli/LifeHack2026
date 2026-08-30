/**
 * WattLahMan's Kimi K3 API key, stored client-side only — this project has
 * no backend, so there is nowhere else to put it. Never sent anywhere but
 * Fireworks' own API (see kimiClient.ts).
 *
 * Two sources, checked in order:
 *  1. localStorage - a key pasted into the in-app "Call WattLahMan" modal.
 *  2. NEXT_PUBLIC_KIMI_API_KEY - a key pre-set in `.env.local` (gitignored,
 *     never committed). Lets whoever's running the dev server skip the
 *     modal entirely; see .env.local.example for where to put it.
 * `NEXT_PUBLIC_` vars are inlined into the client bundle at build time, so
 * this is only appropriate for a locally-run dev build, not a public
 * deployment - the key would ship in the bundle for anyone to read.
 */

const STORAGE_KEY = 'wattlah.wattlahman.kimiKey';
const ENV_KEY = process.env.NEXT_PUBLIC_KIMI_API_KEY || null;

export function readKimiApiKey(): string | null {
  if (typeof window === 'undefined') return ENV_KEY;
  try {
    return window.localStorage.getItem(STORAGE_KEY) || ENV_KEY;
  } catch {
    return ENV_KEY;
  }
}

export function writeKimiApiKey(key: string): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, key);
  } catch {
    /* Storage blocked (private mode, quota) — WattLahMan still runs offline. */
  }
}
