'use client'

/**
 * Top-three podium. Order is 2nd / 1st / 3rd with the champion raised highest.
 * Purely presentational; the full list below remains the accessible source of
 * truth for ranking.
 */

import { Mascot } from '@/components/PixelMascot'
import { PixelMedal } from '@/components/PixelMedal'
import type { LeaderboardEntry } from '@/data/leaderboard'

const HEIGHTS: Record<number, string> = { 1: 'h-20', 2: 'h-14', 3: 'h-10' }
const ORDER = [2, 1, 3]

export function Podium({ entries }: { entries: LeaderboardEntry[] }) {
  const byRank = new Map(entries.map((e) => [e.rank, e]))
  const top = ORDER.map((r) => byRank.get(r)).filter(Boolean) as LeaderboardEntry[]
  if (top.length < 3) return null

  return (
    <section aria-label="Top three" className="mb-6">
      <div className="flex items-end justify-center gap-3">
        {top.map((entry) => {
          const place = entry.rank as 1 | 2 | 3
          const isChampion = place === 1
          return (
            <div key={entry.id} className="flex w-24 flex-col items-center">
              {isChampion && (
                <div className="anim-medal mb-1">
                  <PixelMedal place={1} size={20} animated={false} />
                </div>
              )}
              <Mascot name={entry.mascot} scale={isChampion ? 3 : 2} />
              <div className="mt-1 flex items-center gap-1">
                <PixelMedal place={place} size={16} animated={false} />
                <span className="pixel max-w-16 truncate text-[9px] text-foreground">
                  {entry.username}
                </span>
              </div>
              <span className="pixel mt-[2px] text-[11px] tabular-nums" style={{ color: 'var(--gold)' }}>
                {entry.score}
              </span>
              <div
                className={`pixel-panel mt-2 w-full ${HEIGHTS[place]} ${isChampion ? 'anim-energy' : ''} flex items-start justify-center pt-1`}
                style={
                  isChampion
                    ? { borderColor: 'var(--gold-deep)' }
                    : undefined
                }
              >
                <span className="pixel text-[10px] text-muted-w">
                  {place}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

export default Podium
