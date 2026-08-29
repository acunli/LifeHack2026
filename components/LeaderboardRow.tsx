'use client'

/**
 * A single leaderboard row. The current user's row is highlighted with a gold
 * frame and a "You" tag (not color alone). Rank, username, tier, score meter
 * and daily change are all shown.
 */

import { ChangeIndicator } from '@/components/ChangeIndicator'
import { Mascot } from '@/components/PixelMascot'
import { PixelMedal } from '@/components/PixelMedal'
import { ScoreMeter } from '@/components/ScoreMeter'
import type { LeaderboardEntry } from '@/data/leaderboard'

function ordinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd']
  const v = n % 100
  return n + (s[(v - 20) % 10] || s[v] || s[0])
}

export function LeaderboardRow({
  entry,
  index,
}: {
  entry: LeaderboardEntry
  index: number
}) {
  const isTop3 = entry.rank <= 3
  const highlight = entry.isCurrentUser

  return (
    <li
      className="anim-row-in list-none"
      style={{ animationDelay: `${Math.min(index, 10) * 45}ms` }}
    >
      <div
        className={`pixel-panel ${highlight ? 'pixel-panel-gold' : ''} flex items-center gap-3 p-3`}
        aria-current={highlight ? 'true' : undefined}
      >
        {/* Rank / medal */}
        <div className="flex w-12 shrink-0 flex-col items-center gap-1">
          {isTop3 ? (
            <PixelMedal place={entry.rank as 1 | 2 | 3} size={22} />
          ) : (
            <span className="pixel text-[9px] text-muted-w">#</span>
          )}
          <span
            className="pixel text-[11px] tabular-nums"
            style={{ color: isTop3 ? 'var(--gold)' : 'var(--ink)' }}
          >
            {ordinal(entry.rank)}
          </span>
        </div>

        {/* Mascot */}
        <div className="shrink-0">
          <Mascot name={entry.mascot} scale={2} animated={isTop3 || highlight} />
        </div>

        {/* Name + tier */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="pixel truncate text-[12px] text-foreground">
              {entry.username}
            </span>
            {highlight && (
              <span
                className="pixel shrink-0 px-1 py-[2px] text-[8px] uppercase"
                style={{ background: 'var(--gold)', color: 'var(--deep)' }}
              >
                You
              </span>
            )}
          </div>
          <span className="pixel text-[9px] text-muted-w">{entry.tier}</span>
        </div>

        {/* Score + change */}
        <div className="flex shrink-0 flex-col items-end gap-1">
          <ScoreMeter score={entry.score} />
          <ChangeIndicator change={entry.change} />
        </div>
      </div>
    </li>
  )
}

export default LeaderboardRow
