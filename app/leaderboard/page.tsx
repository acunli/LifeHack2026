"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/useSession";
import { buildStanding, type LeaderboardRow } from "@/data/leaderboard";
import Mascot from "@/components/Mascot";
import Countdown from "@/components/Countdown";
import Podium from "@/components/Podium";
import ScoreMeter from "@/components/ScoreMeter";
import ChangeIndicator from "@/components/ChangeIndicator";
import Footer from "@/components/Footer";
import { MOCK_APARTMENT } from "@/data/mockApartment";
import { computeScore } from "@/lib/scoring";

/**
 * The social surface. Ecovolt's deck names social competition directly, and
 * it is the strongest thing we have for the Stickiness criterion.
 *
 * ⚠️ COPY IS PLACEHOLDER — Lane D owns every string here.
 */

const MEDALS = ["🥇", "🥈", "🥉"];

function scoreColour(score: number): string {
  if (score >= 85) return "var(--green)";
  if (score >= 60) return "var(--amber)";
  return "var(--red)";
}

function Row({ row, place }: { row: LeaderboardRow; place: number }) {
  return (
    <li
      className={`flex items-center gap-3 px-4 py-3 ${
        row.isYou ? "border-2 border-amber bg-amber/10" : "border-2 border-transparent"
      }`}
    >
      <span className="w-9 shrink-0 text-center text-sm tabular-nums text-ink-dim">
        {place <= 3 ? MEDALS[place - 1] : place}
      </span>

      <Mascot scale={1} character={row.mascot} animate={false} className="shrink-0" />

      <span
        className={`flex-1 text-sm ${row.isYou ? "text-amber" : ""}`}
        style={row.isYou ? { fontFamily: "var(--font-pixel)" } : undefined}
      >
        {row.handle}
      </span>

      <ChangeIndicator delta={row.delta} className="w-12 shrink-0 justify-end" />

      <span className="hidden sm:block">
        <ScoreMeter score={row.score} />
      </span>
      <span
        className="w-10 shrink-0 text-right text-sm tabular-nums sm:hidden"
        style={{ color: scoreColour(row.score) }}
      >
        {row.score}
      </span>
    </li>
  );
}

export default function LeaderboardPage() {
  const router = useRouter();
  const session = useSession();

  useEffect(() => {
    if (session === null) router.replace("/");
  }, [session, router]);

  if (!session) return null;

  const score = computeScore(MOCK_APARTMENT).score;
  const standing = buildStanding(session.roomNumber, score, 3, session.username);

  // Top three, then a window around the resident so their neighbours are the
  // ones on screen. A 48-row table is a spreadsheet; this is a rivalry.
  const youIndex = standing.rank - 1;
  const from = Math.max(3, youIndex - 2);
  const near = standing.rows.slice(from, Math.min(from + 6, standing.rows.length));
  const podium = standing.rows.slice(0, 3);
  const gapped = from > 3;

  return (
    <main className="float-in mx-auto flex w-full max-w-2xl flex-1 flex-col gap-5 p-5 sm:p-7">
      <header className="pixel-panel flex flex-wrap items-center justify-between gap-4 px-5 py-4">
        <div>
          <p className="text-[9px] uppercase tracking-widest text-ink-dim">
            Eco League · today
          </p>
          <h1
            className="mt-1.5 text-base text-amber"
            style={{ fontFamily: "var(--font-pixel)" }}
          >
            Your building
          </h1>
        </div>
        <Countdown />
        <Link
          href="/apartment"
          className="pixel-btn-ghost px-4 py-2.5 text-[9px] uppercase tracking-widest"
          style={{ fontFamily: "var(--font-pixel)" }}
        >
          Back home
        </Link>
      </header>

      {/* The headline: rank, then the one number that motivates. */}
      <section className="pixel-panel flex flex-col items-center gap-2 p-6">
        <p className="text-[9px] uppercase tracking-widest text-ink-dim">
          You are
        </p>
        <p
          className="text-[44px] leading-none text-amber"
          style={{ fontFamily: "var(--font-pixel)" }}
        >
          #{standing.rank}
        </p>
        <p className="text-sm text-ink-dim">
          of {standing.total} apartments
        </p>

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
      </section>

      <Podium rows={podium} />

      <section className="pixel-panel overflow-hidden">
        {gapped && (
          <p className="px-4 py-2 text-center text-xs text-ink-dim/60">···</p>
        )}

        <ul className="divide-y divide-line/40">
          {near.map((row, i) => (
            <Row key={row.handle} row={row} place={from + i + 1} />
          ))}
        </ul>
      </section>

      <Footer />
    </main>
  );
}
