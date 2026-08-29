'use client'

/**
 * Main authenticated leaderboard view. Handles data fetching, loading/empty/
 * error states, the podium, the ranked list, and a pinned summary of the
 * current user's standing.
 */

import { useCallback, useEffect, useMemo, useState } from 'react'
import { ChangeIndicator } from '@/components/ChangeIndicator'
import { LeaderboardRow } from '@/components/LeaderboardRow'
import { Podium } from '@/components/Podium'
import { ScoreMeter } from '@/components/ScoreMeter'
import { EmptyState, ErrorState, LoadingState } from '@/components/StateViews'
import { fetchLeaderboard, type LeaderboardEntry } from '@/data/leaderboard'

type Status = 'loading' | 'ok' | 'error' | 'empty'

function ordinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd']
  const v = n % 100
  return n + (s[(v - 20) % 10] || s[v] || s[0])
}

export function LeaderboardBoard({
  username,
  roomNumber,
}: {
  username: string
  roomNumber: string
}) {
  const [status, setStatus] = useState<Status>('loading')
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])

  const current = useMemo(
    () => ({ username, roomNumber }),
    [username, roomNumber],
  )

  const [attempt, setAttempt] = useState(0)

  /**
   * State updates live in the promise callbacks rather than the effect body:
   * calling an async loader directly sets state synchronously before its first
   * await, which cascades a render. The cancelled flag also stops a slow
   * response writing state after the component has unmounted.
   */
  useEffect(() => {
    let cancelled = false

    fetchLeaderboard(current)
      .then((data) => {
        if (cancelled) return
        if (data.length === 0) {
          setEntries([])
          setStatus('empty')
          return
        }
        setEntries(data)
        setStatus('ok')
      })
      .catch(() => {
        if (!cancelled) setStatus('error')
      })

    return () => {
      cancelled = true
    }
  }, [current, attempt])

  const load = useCallback(() => {
    setStatus('loading')
    setAttempt((n) => n + 1)
  }, [])

  const me = entries.find((e) => e.isCurrentUser) ?? null

  return (
    <div className="mx-auto w-full max-w-2xl pb-4">
      {/* Current user summary */}
      {status === 'ok' && me && (
        <div className="pixel-panel pixel-panel-gold mb-6 flex items-center justify-between gap-3 p-4">
          <div className="flex flex-col">
            <span className="pixel text-[9px] uppercase tracking-wide text-muted-w">
              {me.isProjected ? 'Projected rank' : 'Your rank'}
            </span>
            <span className="pixel rank-gold text-[16px]">
              {ordinal(me.rank)}
            </span>
            <span className="pixel mt-1 text-[9px] text-muted-w">{me.tier}</span>
            {me.isProjected && (
              <span className="pixel mt-2 text-[7px] uppercase text-gold">
                Preview · not measured yet
              </span>
            )}
          </div>
          <div className="flex flex-col items-end gap-2">
            <ScoreMeter score={me.score} />
            {me.isProjected ? (
              <span className="pixel text-[7px] uppercase text-gold">Plan preview</span>
            ) : (
              <ChangeIndicator change={me.change} />
            )}
          </div>
        </div>
      )}

      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="pixel text-[13px] text-foreground">Building standings</h2>
        {/* The arrows had no label anywhere on the page, so nobody could tell
            what they measured. */}
        <span className="pixel text-[9px] text-muted-w">
          ▲▼ change vs baseline · plans are previews
        </span>
      </div>

      {status === 'loading' && <LoadingState />}
      {status === 'error' && <ErrorState onRetry={load} />}
      {status === 'empty' && <EmptyState />}
      {status === 'ok' && (
        <>
          <Podium entries={entries} />
          <ol className="flex flex-col gap-3">
            {entries.map((entry, i) => (
              <LeaderboardRow key={entry.id} entry={entry} index={i} />
            ))}
          </ol>
        </>
      )}
    </div>
  )
}

export default LeaderboardBoard
