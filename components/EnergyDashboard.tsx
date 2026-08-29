"use client";

import { useEffect, useRef } from "react";
import { APPLIANCES, applianceScore, worstAppliance } from "@/data/appliances";
import { RECOMMENDATIONS, type Recommendation } from "@/data/recommendations";
import { useCountUp } from "@/lib/useCountUp";
import type { useEnergyState } from "@/lib/useEnergyState";

/**
 * The welcome-home dashboard, and the what-if surface.
 *
 * Applying a recommendation drops that appliance's consumption, the apartment
 * score recalculates and counts up, and the blob over that appliance cools in
 * the room behind. That loop — see a problem, see what fixing it is worth,
 * watch the number move — is the whole behaviour-change argument.
 *
 * ⚠️ COPY IS PLACEHOLDER — Lane D owns every string here.
 */

type Energy = ReturnType<typeof useEnergyState>;

function barColour(score: number): string {
  if (score >= 85) return "var(--green)";
  if (score >= 60) return "var(--amber)";
  return "var(--red)";
}

function RecRow({
  rec,
  applied,
  onToggle,
}: {
  rec: Recommendation;
  applied: boolean;
  onToggle: () => void;
}) {
  return (
    <li className="border-t border-line/40 py-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm">{rec.title}</p>
          <p className="mt-1 text-xs leading-relaxed text-ink-dim">{rec.body}</p>
        </div>
        <button
          onClick={onToggle}
          aria-pressed={applied}
          className={`${
            applied ? "pixel-btn-ghost" : "pixel-btn"
          } shrink-0 px-3 py-2 text-[8px] uppercase tracking-widest`}
          style={{ fontFamily: "var(--font-pixel)" }}
        >
          {applied ? "Undo" : "Do it"}
        </button>
      </div>
      <div className="mt-2 flex items-center gap-3 text-[9px] uppercase tracking-widest text-ink-dim">
        {rec.save > 0 && (
          <span style={{ color: "var(--green)" }}>−{rec.save} kWh</span>
        )}
        <span>{rec.effort}</span>
      </div>
    </li>
  );
}

export default function EnergyDashboard({
  onClose,
  roomNumber,
  energy,
}: {
  onClose: () => void;
  roomNumber: string;
  energy: Energy;
}) {
  const { result, applied, saved, potential, baselineScore, toggle, reset } =
    energy;
  const closeRef = useRef<HTMLButtonElement>(null);
  // Counts up from zero on first reveal; afterwards useCountUp animates from
  // whatever it is currently showing, so applying a fix reads as a change
  // rather than a fresh reveal.
  const shown = useCountUp(result.score, 0);

  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const worst = worstAppliance();
  const gained = result.score - baselineScore;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Your energy this month"
        onClick={(e) => e.stopPropagation()}
        className="pixel-panel float-in max-h-[90vh] w-full max-w-lg overflow-y-auto p-6"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[9px] uppercase tracking-widest text-ink-dim">
              This month
            </p>
            <h2
              className="mt-1.5 text-sm text-ink"
              style={{ fontFamily: "var(--font-pixel)" }}
            >
              Room {roomNumber}
            </h2>
          </div>
          <button
            ref={closeRef}
            onClick={onClose}
            className="pixel-btn-ghost px-3 py-1.5 text-[9px] uppercase tracking-widest"
            style={{ fontFamily: "var(--font-pixel)" }}
          >
            Close
          </button>
        </div>

        <div className="mt-6 flex items-end justify-center gap-3">
          <span
            className="text-[56px] leading-none tabular-nums"
            style={{ fontFamily: "var(--font-pixel)", color: barColour(shown) }}
          >
            {shown}
          </span>
          <span className="pb-2 text-sm text-ink-dim">/ 100</span>
        </div>

        <p
          className="mt-3 text-center text-[11px] uppercase tracking-widest"
          style={{ fontFamily: "var(--font-pixel)", color: barColour(result.score) }}
        >
          {result.status}
        </p>

        {gained > 0 ? (
          <p
            className="mt-3 text-center text-[10px] uppercase tracking-widest"
            style={{ fontFamily: "var(--font-pixel)", color: "var(--green)" }}
          >
            ▲ {gained} from {saved} kWh saved
          </p>
        ) : (
          <p className="mt-4 text-center text-sm text-ink-dim">
            You used{" "}
            <strong className="text-ink">{result.comparisonPercent}% more</strong>{" "}
            than a comparable flat — about{" "}
            <strong className="text-ink">S${result.estimatedCost.toFixed(2)}</strong>{" "}
            this month.
          </p>
        )}

        <div className="mt-5 border-l-4 border-bad bg-bg-deep p-3">
          <p className="text-sm">
            <span aria-hidden>{worst.icon}</span> Your{" "}
            <strong>{worst.name.toLowerCase()}</strong> is the biggest drag —{" "}
            {worst.kwh} kWh against a typical {worst.referenceKwh}.
          </p>
          <p className="mt-1.5 text-xs text-ink-dim">
            Everything below is worth {potential} kWh a month if you do the lot.
          </p>
        </div>

        <div className="mt-6 flex items-baseline justify-between">
          <h3 className="text-[9px] uppercase tracking-widest text-ink-dim">
            What you can do
          </h3>
          {applied.size > 0 && (
            <button
              onClick={reset}
              className="text-[9px] uppercase tracking-widest text-ink-dim underline underline-offset-2 hover:text-ink"
              style={{ fontFamily: "var(--font-pixel)" }}
            >
              Reset
            </button>
          )}
        </div>

        <ul className="mt-1">
          {RECOMMENDATIONS.map((rec) => (
            <RecRow
              key={rec.id}
              rec={rec}
              applied={applied.has(rec.id)}
              onToggle={() => toggle(rec)}
            />
          ))}
        </ul>

        <h3 className="mt-6 text-[9px] uppercase tracking-widest text-ink-dim">
          Every appliance
        </h3>
        <ul className="mt-1 divide-y divide-line/40">
          {[...APPLIANCES]
            .sort((a, b) => applianceScore(a) - applianceScore(b))
            .map((a) => {
              const score = applianceScore(a);
              return (
                <li key={a.id} className="flex items-center gap-3 py-2.5">
                  <span className="w-6 shrink-0 text-center text-base" aria-hidden>
                    {a.icon}
                  </span>
                  <span className="w-32 shrink-0 truncate text-sm">{a.name}</span>
                  <span className="relative h-2.5 flex-1 bg-bg-deep">
                    <span
                      className="absolute inset-y-0 left-0 transition-[width] duration-700"
                      style={{ width: `${score}%`, background: barColour(score) }}
                    />
                  </span>
                  <span className="w-16 shrink-0 text-right text-xs tabular-nums text-ink-dim">
                    {energy.kwh[a.id] ?? a.kwh} kWh
                  </span>
                </li>
              );
            })}
        </ul>

        <button
          onClick={onClose}
          className="pixel-btn mt-6 w-full px-4 py-3 text-[10px] uppercase tracking-widest"
          style={{ fontFamily: "var(--font-pixel)" }}
        >
          See my apartment
        </button>
      </div>
    </div>
  );
}
