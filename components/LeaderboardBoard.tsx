"use client";

import { useEffect, useState } from "react";
import Countdown from "@/components/Countdown";
import LeaderboardRow from "@/components/LeaderboardRow";
import Podium from "@/components/Podium";
import ScoreMeter from "@/components/ScoreMeter";
import ChangeIndicator from "@/components/ChangeIndicator";
import { EmptyState, ErrorState, LoadingState } from "@/components/StateViews";
import { fetchStanding, type Standing } from "@/data/leaderboard";

/**
 * The league. Ported from the leaderboard mock.
 *
 * Fetches through a promise even though the data is local, so the loading,
 * empty and error paths are real code rather than components nobody renders.
 * When this is swapped for a real backend, no UI changes.
 */

type Status = "loading" | "ok" | "empty" | "error";

function ordinal(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

export default function LeaderboardBoard({
  roomNumber,
  score,
  handle,
}: {
  roomNumber: string;
  score: number;
  handle?: string;
}) {
  const [status, setStatus] = useState<Status>("loading");
  const [standing, setStanding] = useState<Standing | null>(null);
  const [attempt, setAttempt] = useState(0);

  /**
   * State updates live in the promise callbacks, not the effect body — that is
   * the "subscribe to an external system" shape the set-state-in-effect rule
   * is asking for. The cancelled flag stops a slow response updating state
   * after the component has gone.
   */
  useEffect(() => {
    let cancelled = false;

    fetchStanding(roomNumber, score, 3, handle)
      .then((data) => {
        if (cancelled) return;
        if (data.rows.length === 0) {
          setStanding(null);
          setStatus("empty");
          return;
        }
        setStanding(data);
        setStatus("ok");
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      });

    return () => {
      cancelled = true;
    };
  }, [roomNumber, score, handle, attempt]);

  const retry = () => {
    setStatus("loading");
    setAttempt((n) => n + 1);
  };

  if (status === "loading") return <LoadingState />;
  if (status === "error") return <ErrorState onRetry={retry} />;
  if (status === "empty" || !standing) return <EmptyState />;

  const me = standing.rows.find((r) => r.isYou) ?? null;
  const youIndex = standing.rank - 1;
  const from = Math.max(3, youIndex - 2);
  const near = standing.rows.slice(from, Math.min(from + 6, standing.rows.length));
  const gapped = from > 3;

  return (
    <div className="flex flex-col gap-5">
      <section className="pixel-panel flex flex-col items-center gap-2 p-6">
        <p className="pixel text-[9px] uppercase tracking-widest text-ink-dim">
          You are
        </p>
        <p className="pixel text-[44px] leading-none text-amber">
          {ordinal(standing.rank)}
        </p>
        <p className="text-sm text-ink-dim">of {standing.total} apartments</p>

        {me && (
          <div className="mt-3 flex items-center gap-4">
            <ScoreMeter score={me.score} />
            <ChangeIndicator delta={me.change.value} />
          </div>
        )}

        {standing.ahead ? (
          <p className="mt-3 text-center text-sm">
            Just{" "}
            <strong className="text-amber">
              {standing.gapToNext} point{standing.gapToNext === 1 ? "" : "s"}
            </strong>{" "}
            behind {standing.ahead.handle}.
          </p>
        ) : (
          <p className="mt-3 text-center text-sm text-good">
            Top of the building. Hold it.
          </p>
        )}

        <Countdown className="mt-4" />
      </section>

      <Podium rows={standing.rows.slice(0, 3)} />

      <ul className="flex flex-col gap-2">
        {standing.rows.slice(0, 3).map((row, i) => (
          <LeaderboardRow key={row.handle} row={row} index={i} />
        ))}
      </ul>

      {gapped && (
        <p className="pixel text-center text-[10px] text-ink-dim/60">···</p>
      )}

      <ul className="flex flex-col gap-2">
        {near.map((row, i) => (
          <LeaderboardRow key={row.handle} row={row} index={i + 3} />
        ))}
      </ul>
    </div>
  );
}
