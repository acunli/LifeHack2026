/**
 * Deterministic mock usage history for an installed appliance.
 *
 * No Math.random() (see AGENTS.md determinism rule) - the same appliance id
 * always produces the same 7-day history, derived from a simple string hash
 * so each appliance still gets a distinctive-looking pattern.
 */

function seededFraction(seed: string, index: number): number {
  const str = `${seed}:${index}`;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) >>> 0;
  }
  return (hash % 1000) / 1000; // [0, 1)
}

export interface DayUsage {
  label: string;
  kwh: number;
}

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

/** Past 7 days of usage, ending "today" (last entry), varying ±30% around the daily baseline. */
export function getUsageHistory(applianceId: string, dailyKwh: number): DayUsage[] {
  return DAY_LABELS.map((label, i) => {
    const variance = 0.7 + seededFraction(applianceId, i) * 0.6;
    return { label, kwh: Math.round(dailyKwh * variance * 100) / 100 };
  });
}
