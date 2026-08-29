/**
 * Timezone-aware helpers for the daily reset countdown.
 *
 * The leaderboard "resets" at local midnight in APP_TIMEZONE. These helpers
 * are pure so they can be unit-tested with a fixed `now`.
 */

/** Wall-clock parts of `date` as observed in `timeZone`. */
export function zonedParts(
  date: Date,
  timeZone: string,
): { hour: number; minute: number; second: number } {
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  })
  const parts = fmt.formatToParts(date)
  const get = (type: string) =>
    Number(parts.find((p) => p.type === type)?.value ?? "0")
  let hour = get("hour")
  // Intl can emit "24" for midnight in some environments; normalize.
  if (hour === 24) hour = 0
  return { hour, minute: get("minute"), second: get("second") }
}

/** Whole seconds remaining until the next local midnight in `timeZone`. */
export function secondsUntilMidnight(now: Date, timeZone: string): number {
  const { hour, minute, second } = zonedParts(now, timeZone)
  const elapsed = hour * 3600 + minute * 60 + second
  const remaining = 24 * 3600 - elapsed
  // Clamp into (0, 86400].
  return Math.max(1, Math.min(24 * 3600, remaining))
}

/** Format seconds as HH:MM:SS. */
export function formatDuration(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds))
  const hh = String(Math.floor(s / 3600)).padStart(2, "0")
  const mm = String(Math.floor((s % 3600) / 60)).padStart(2, "0")
  const ss = String(s % 60).padStart(2, "0")
  return `${hh}:${mm}:${ss}`
}
