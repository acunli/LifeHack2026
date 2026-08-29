import { ATTRIBUTION } from "@/lib/config";

/**
 * Site footer. Carries the LimeZu attribution the asset licence requires, on
 * every page rather than only the login screen.
 *
 * Ported from the leaderboard mock, including its better instinct: no support
 * contact details are invented. Anything not configured is simply not shown.
 */
export default function Footer() {
  return (
    <footer className="mt-auto px-5 py-6 text-center">
      <p className="pixel text-[8px] leading-relaxed text-ink-dim/70">
        Simulated data — demo build for LifeHack 2026
      </p>
      <p className="mt-2 text-[11px] text-ink-dim/70">
        Pixel art by{" "}
        <a
          href={ATTRIBUTION.href}
          target="_blank"
          rel="noreferrer"
          className="underline underline-offset-2 hover:text-ink"
        >
          {ATTRIBUTION.label}
        </a>
      </p>
    </footer>
  );
}
