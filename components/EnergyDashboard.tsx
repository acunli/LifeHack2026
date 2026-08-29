"use client";

import { useEffect, useRef } from "react";
import {
  APPLIANCES,
  applianceScore,
  worstAppliance,
  type Appliance,
} from "@/data/appliances";
import { MOCK_APARTMENT } from "@/data/mockApartment";
import { computeScore } from "@/lib/scoring";

/**
 * The welcome-home dashboard. Opens on fresh login, closes to reveal the
 * apartment, reopens from the header button.
 *
 * ⚠️ COPY IS PLACEHOLDER — Lane D owns every string here.
 */

function barColour(score: number): string {
  if (score >= 85) return "var(--green)";
  if (score >= 60) return "var(--amber)";
  return "var(--red)";
}

function ApplianceRow({ a }: { a: Appliance }) {
  const score = applianceScore(a);
  const pct = Math.round((a.kwh / a.referenceKwh) * 100 - 100);
  return (
    <li className="flex items-center gap-3 py-2.5">
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
        {a.kwh} kWh
      </span>

      <span
        className="w-14 shrink-0 text-right text-xs tabular-nums"
        style={{ color: pct > 0 ? "var(--red)" : "var(--green)" }}
      >
        {pct > 0 ? "+" : ""}
        {pct}%
      </span>
    </li>
  );
}

export default function EnergyDashboard({ onClose }: { onClose: () => void }) {
  const result = computeScore(MOCK_APARTMENT);
  const worst = worstAppliance();
  const closeRef = useRef<HTMLButtonElement>(null);

  // Focus the close button so Escape and Tab behave, and the modal is
  // dismissible by keyboard alone.
  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

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
              Room {MOCK_APARTMENT.roomNumber}
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

        {/* The number, given room to land. */}
        <div className="mt-6 flex items-end justify-center gap-3">
          <span
            className="text-[56px] leading-none text-amber"
            style={{ fontFamily: "var(--font-pixel)" }}
          >
            {result.score}
          </span>
          <span className="pb-2 text-sm text-ink-dim">/ 100</span>
        </div>

        <p
          className="mt-3 text-center text-[11px] uppercase tracking-widest"
          style={{ fontFamily: "var(--font-pixel)", color: barColour(result.score) }}
        >
          {result.status}
        </p>

        <p className="mt-4 text-center text-sm text-ink-dim">
          You used{" "}
          <strong className="text-ink">
            {result.comparisonPercent}% more
          </strong>{" "}
          than a comparable flat, costing about{" "}
          <strong className="text-ink">
            S${result.estimatedCost.toFixed(2)}
          </strong>{" "}
          this month.
        </p>

        {/* The line that makes it actionable rather than just informative. */}
        <div className="mt-5 border-l-4 border-bad bg-bg-deep p-3">
          <p className="text-sm">
            <span aria-hidden>{worst.icon}</span> Your{" "}
            <strong>{worst.name.toLowerCase()}</strong> is the biggest drag —{" "}
            {worst.kwh} kWh against a typical {worst.referenceKwh}.
          </p>
          <p className="mt-1.5 text-xs text-ink-dim">{worst.tip}</p>
        </div>

        <h3 className="mt-6 text-[9px] uppercase tracking-widest text-ink-dim">
          Every appliance
        </h3>
        <ul className="mt-1 divide-y divide-line/40">
          {[...APPLIANCES]
            .sort((a, b) => applianceScore(a) - applianceScore(b))
            .map((a) => (
              <ApplianceRow key={a.id} a={a} />
            ))}
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
