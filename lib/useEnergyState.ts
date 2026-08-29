"use client";

import { useCallback, useMemo, useState } from "react";
import { APPLIANCES } from "@/data/appliances";
import { RECOMMENDATIONS, type Recommendation } from "@/data/recommendations";
import { MOCK_APARTMENT } from "@/data/mockApartment";
import { computeScore, type ApartmentScoreResult } from "@/lib/scoring";
import { saveScore } from "@/lib/session";

/**
 * The what-if layer.
 *
 * A resident applies a recommendation, the appliance's consumption drops, and
 * the apartment score recalculates. That turns the dashboard from a readout
 * into a decision: you can see what a change is worth before making it.
 *
 * The apartment score is still total-vs-reference (README §11) — only the
 * total moves. Nothing about the agreed formula changes.
 */

export type KwhById = Record<string, number>;

const baseline = (): KwhById =>
  Object.fromEntries(APPLIANCES.map((a) => [a.id, a.kwh]));

/** Applying `rec` to `kwh`. Pure, so it can be tested without React. */
export function applyRecommendation(
  kwh: KwhById,
  rec: Recommendation,
  undo: boolean,
): KwhById {
  if (rec.appliance === "home" || rec.save <= 0) return kwh;
  const base = APPLIANCES.find((a) => a.id === rec.appliance)?.kwh;
  if (base === undefined) return kwh;

  const current = kwh[rec.appliance] ?? base;
  return {
    ...kwh,
    // Undo cannot push consumption above the authored baseline, and applying
    // cannot drive it below zero.
    [rec.appliance]: undo
      ? Math.min(base, current + rec.save)
      : Math.max(0, current - rec.save),
  };
}

export function totalOf(kwh: KwhById): number {
  return APPLIANCES.reduce((sum, a) => sum + (kwh[a.id] ?? a.kwh), 0);
}

export function scoreFor(kwh: KwhById): ApartmentScoreResult {
  return computeScore({ ...MOCK_APARTMENT, totalConsumptionKwh: totalOf(kwh) });
}

/** Deterministic, so it can be a module constant rather than a ref. */
const BASELINE_SCORE = scoreFor(baseline()).score;

export function useEnergyState(userId?: string) {
  const [kwh, setKwh] = useState<KwhById>(baseline);
  const [applied, setApplied] = useState<ReadonlySet<string>>(
    () => new Set<string>(),
  );

  const total = useMemo(() => totalOf(kwh), [kwh]);
  const result = useMemo(() => scoreFor(kwh), [kwh]);

  const toggle = useCallback((rec: Recommendation) => {
    setApplied((prev) => {
      const undo = prev.has(rec.id);
      setKwh((k) => {
        const next = applyRecommendation(k, rec, undo);
        // Persist score change so the leaderboard picks it up.
        if (userId) {
          const newScore = scoreFor(next).score;
          saveScore(userId, newScore);
        }
        return next;
      });
      const next = new Set(prev);
      if (undo) next.delete(rec.id);
      else next.add(rec.id);
      return next;
    });
  }, [userId]);

  const reset = useCallback(() => {
    setKwh(baseline());
    setApplied(new Set<string>());
    // Reset score to baseline in localStorage.
    if (userId) {
      saveScore(userId, BASELINE_SCORE);
    }
  }, [userId]);

  /** kWh saved against the authored baseline. */
  const saved = totalOf(baseline()) - total;

  /** Total possible saving if every recommendation were applied. */
  const potential = useMemo(
    () =>
      RECOMMENDATIONS.filter((r) => r.appliance !== "home").reduce(
        (s, r) => s + r.save,
        0,
      ),
    [],
  );

  return {
    kwh,
    applied,
    total,
    result,
    saved,
    potential,
    baselineScore: BASELINE_SCORE,
    toggle,
    reset,
  };
}
