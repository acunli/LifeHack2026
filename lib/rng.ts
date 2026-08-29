/**
 * Deterministic PRNG. Mock data must render identically on the server and the
 * client — Math.random() differs between the two passes and shows up as
 * hydration mismatch (AGENTS.md).
 */

export function hashSeed(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** mulberry32 — small and fast; ample for plausible-looking numbers. */
export function makeRng(seed: string): () => number {
  let a = hashSeed(seed);
  return function next() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const between = (rng: () => number, min: number, max: number) =>
  min + rng() * (max - min);
