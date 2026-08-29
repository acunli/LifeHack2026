/**
 * Deterministic PRNG. The demo's "telemetry" must be identical on the server
 * and on the client, or React hydration mismatches. Never use Math.random()
 * for anything that reaches the DOM.
 */
export function hashSeed(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** mulberry32 — small, fast, good enough for plausible-looking numbers. */
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

/** Uniform float in [min, max) from a seeded stream. */
export function between(rng: () => number, min: number, max: number): number {
  return min + rng() * (max - min);
}

export function round(value: number, dp: number): number {
  const f = 10 ** dp;
  return Math.round(value * f) / f;
}
