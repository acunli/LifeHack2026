"use client";

import ChangeIndicator from "@/components/ChangeIndicator";
import Mascot from "@/components/Mascot";
import PixelMedal, { type Place } from "@/components/PixelMedal";
import ScoreMeter from "@/components/ScoreMeter";
import type { LeaderboardRow as Row } from "@/data/leaderboard";

/**
 * One league row. Ported from the leaderboard mock.
 *
 * The resident's own row gets a gold frame AND a "You" tag — never colour
 * alone. Rows deal in with a stagger, capped at ten so a long list does not
 * take a second to appear.
 */

function ordinal(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

export default function LeaderboardRow({
  row,
  index,
}: {
  row: Row;
  index: number;
}) {
  const isTop3 = row.rank <= 3;

  return (
    <li
      className="anim-row-in list-none"
      style={{ animationDelay: `${Math.min(index, 10) * 45}ms` }}
    >
      <div
        className={`pixel-panel ${row.isYou ? "pixel-panel-gold" : ""} flex items-center gap-3 p-3`}
        aria-current={row.isYou ? "true" : undefined}
      >
        <div className="flex w-12 shrink-0 flex-col items-center gap-1">
          {isTop3 ? (
            <PixelMedal place={row.rank as Place} size={22} />
          ) : (
            <span className="pixel text-[9px] text-ink-dim">#</span>
          )}
          <span className="pixel text-[11px] tabular-nums text-ink">
            {ordinal(row.rank)}
          </span>
        </div>

        <Mascot
          scale={2}
          character={row.mascot}
          animate={isTop3 || row.isYou}
          props_={false}
          className="shrink-0"
        />

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="pixel truncate text-[12px] text-ink">
              {row.handle}
            </span>
            {row.isYou && (
              <span
                className="pixel shrink-0 px-1 py-[2px] text-[8px] uppercase"
                style={{ background: "var(--amber)", color: "var(--bg-deep)" }}
              >
                You
              </span>
            )}
          </div>
          <span className="pixel text-[9px] text-ink-dim">{row.tier}</span>
        </div>

        <div className="flex shrink-0 flex-col items-end gap-1">
          <ScoreMeter score={row.score} />
          <ChangeIndicator delta={row.change.value} />
        </div>
      </div>
    </li>
  );
}
