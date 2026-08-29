"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Animates a number toward its target. Used for the score, so applying a
 * recommendation is a moment rather than a value swap — the five seconds
 * where the number climbs is the demo beat worth having.
 *
 * Starts at `from` so the reveal on open counts up from zero.
 */
export function useCountUp(target: number, from = 0, duration = 850): number {
  const [shown, setShown] = useState(from);
  const raf = useRef<number | null>(null);
  const current = useRef(from);

  useEffect(() => {
    const start = current.current;
    const diff = target - start;
    if (diff === 0) return;

    // Reduced motion collapses the duration rather than setting state here:
    // setState in an effect body cascades renders, and the rule is right.
    const reduced =
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    const dur = reduced ? 1 : Math.max(1, duration);

    const t0 = performance.now();
    const step = (now: number) => {
      const k = Math.min(1, (now - t0) / dur);
      const eased = 1 - Math.pow(1 - k, 3);
      const value = Math.round(start + diff * eased);
      current.current = value;
      // setState in a rAF callback, not in the effect body — this is the
      // "subscribe to an external system" case the lint rule allows.
      setShown(value);
      if (k < 1) raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);

    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [target, duration]);

  return shown;
}
