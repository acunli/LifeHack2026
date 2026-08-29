'use client'

/**
 * Loading / empty / error presentations for the leaderboard, all in the pixel
 * style. Loading uses stepped skeleton blocks; empty and error are friendly and
 * give the user a clear next action.
 */

export function LoadingState() {
  return (
    <div
      className="flex flex-col gap-3"
      role="status"
      aria-live="polite"
      aria-label="Loading leaderboard"
    >
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="pixel-panel flex items-center gap-3 p-3">
          <div className="anim-skeleton h-8 w-8 bg-panel-hi" />
          <div className="anim-skeleton h-6 w-6 bg-panel-hi" />
          <div className="flex flex-1 flex-col gap-2">
            <div className="anim-skeleton h-3 w-1/2 bg-panel-hi" />
            <div className="anim-skeleton h-2 w-1/4 bg-panel-hi" />
          </div>
          <div className="anim-skeleton h-4 w-20 bg-panel-hi" />
        </div>
      ))}
      <span className="sr-only">Loading the latest standings…</span>
    </div>
  )
}

export function EmptyState() {
  return (
    <div className="pixel-panel flex flex-col items-center gap-3 p-8 text-center">
      <span className="anim-hop inline-block text-2xl" aria-hidden>
        <span className="pixel text-gold">?</span>
      </span>
      <h2 className="pixel text-[12px] text-foreground">No scores yet</h2>
      <p className="pixel max-w-xs text-[9px] leading-relaxed text-muted-w">
        Complete an energy audit and preview a savings plan to take your place
        in the building league.
      </p>
    </div>
  )
}

export function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div
      className="pixel-panel flex flex-col items-center gap-4 p-8 text-center"
      role="alert"
    >
      <h2 className="pixel text-[12px]" style={{ color: 'var(--neg)' }}>
        Connection lost
      </h2>
      <p className="pixel max-w-xs text-[9px] leading-relaxed text-muted-w">
        We couldn&apos;t load the leaderboard. Check your connection and try
        again.
      </p>
      <button type="button" onClick={onRetry} className="pixel-btn px-4 py-3 text-[10px]">
        Retry
      </button>
    </div>
  )
}
