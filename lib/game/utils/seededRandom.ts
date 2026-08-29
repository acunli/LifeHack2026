/**
 * Deterministic pseudo-random fraction from a string seed + index. No
 * Math.random() (see AGENTS.md determinism rule) - the same seed always
 * produces the same value, so mock data stays stable across renders instead
 * of reshuffling every time a component re-renders.
 */
export function seededFraction(seed: string, index = 0): number {
  const str = `${seed}:${index}`;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) >>> 0;
  }
  return (hash % 1000) / 1000; // [0, 1)
}
