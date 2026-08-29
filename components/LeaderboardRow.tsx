'use client'

/**
 * A single leaderboard row. The current user's row is highlighted with a gold
 * frame and a "You" tag (not color alone). Rank, username, tier, score meter
 * and daily change are all shown. Hovering reveals expanded details.
 */

import { useState } from 'react'
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
  const [hovered, setHovered] = useState(false)
  const isTop3 = entry.rank <= 3
  const highlight = entry.isCurrentUser

  return (
    <li
      className={`anim-row-in list-none relative ${hovered ? 'z-20' : 'z-0'}`}
      style={{ animationDelay: `${Math.min(index, 10) * 45}ms` }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        className={`pixel-panel ${highlight ? 'pixel-panel-gold' : ''} flex items-center gap-3 p-3 transition-all duration-200 ${hovered ? 'translate-x-1 border-[var(--line-hi)]' : ''}`}
        aria-current={highlight ? 'true' : undefined}
        style={hovered ? { boxShadow: '12px 12px 0 0 var(--bg-deep)', position: 'relative', zIndex: 21 } : undefined}
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
          <Mascot name={entry.mascot} scale={2} animated={isTop3 || highlight || hovered} />
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

        {/* Hover tooltip with expanded details */}
        {hovered && (
          <div
            className="pixel-panel absolute left-1/2 top-full mt-2 w-56 -translate-x-1/2 p-3"
            style={{ background: 'var(--bg-deep)', zIndex: 30 }}
          >
            <div className="flex items-center gap-2 mb-2">
              <Mascot name={entry.mascot} scale={2} animated={false} />
              <div>
                <span className="pixel text-[10px] text-foreground block">{entry.username}</span>
                <span className="pixel text-[8px] text-muted-w">{entry.tier}</span>
              </div>
            </div>
            <div className="flex flex-col gap-1 text-[9px]">
              <div className="flex justify-between">
                <span className="text-muted-w">Rank</span>
                <span style={{ color: isTop3 ? 'var(--gold)' : 'var(--ink)' }}>{ordinal(entry.rank)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-w">Score</span>
                <span className="text-foreground">{entry.score}/100</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-w">Change</span>
                <span style={{ color: entry.change.direction === 'up' ? 'var(--pos)' : entry.change.direction === 'down' ? 'var(--neg)' : 'var(--muted-w)' }}>
                  {entry.change.direction === 'up' ? '+' : entry.change.direction === 'down' ? '-' : ''}{Math.abs(entry.change.value)}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </li>
  )
}

export default LeaderboardRow
