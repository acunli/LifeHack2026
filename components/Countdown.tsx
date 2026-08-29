"use client";

import { useEffect, useState } from "react";
import { APP_TIMEZONE } from "@/lib/config";
import { formatDuration, secondsUntilMidnight } from "@/lib/time";

/**
 * Live countdown to the daily reset (local midnight in APP_TIMEZONE).
 *
 * This is the stickiness mechanic. A leaderboard alone tells you where you
 * stand; a leaderboard that resets tonight gives you a reason to come back
 * tomorrow — which is what the brief means by "an action people repeat".
 *
 * Renders a placeholder until mounted: the remaining time differs between the
 * server render and the client, so computing it during render would
 * hydrate-mismatch.
 */
export default function Countdown({ className = "" }: { className?: string }) {
  const [seconds, setSeconds] = useState<number | null>(null);

  useEffect(() => {
    const tick = () =>
      setSeconds(secondsUntilMidnight(new Date(), APP_TIMEZONE));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span
        className="inline-block h-2 w-2 shrink-0"
        style={{ background: "var(--amber)" }}
        aria-hidden
      />
      <span
        className="text-[9px] uppercase tracking-widest text-ink-dim"
        style={{ fontFamily: "var(--font-pixel)" }}
      >
        Resets in
      </span>
      <span
        className="text-[10px] tabular-nums text-amber"
        style={{ fontFamily: "var(--font-pixel)" }}
        suppressHydrationWarning
      >
        {seconds === null ? "--:--:--" : formatDuration(seconds)}
      </span>
    </div>
  );
}
