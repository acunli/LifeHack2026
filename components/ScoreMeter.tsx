/**
 * Segmented pixel energy meter for a 0–100 score. Ten blocks light up in
 * proportion to the score; the numeric value is always shown alongside so the
 * meter is a redundant, not sole, indicator.
 */

const BLOCKS = 10

export function ScoreMeter({
  score,
  className,
}: {
  score: number
  className?: string
}) {
  const filled = Math.round((Math.min(100, Math.max(0, score)) / 100) * BLOCKS)

  return (
    <div
      className={`flex items-center gap-2 ${className ?? ''}`}
      role="img"
      aria-label={`Energy score ${score} out of 100`}
    >
      <div className="flex gap-[2px]" aria-hidden>
        {Array.from({ length: BLOCKS }).map((_, i) => (
          <span
            key={i}
            className="h-3 w-[6px]"
            style={{
              background: i < filled ? 'var(--gold)' : 'var(--deep)',
              boxShadow:
                i < filled ? 'inset 0 0 0 1px var(--gold-deep)' : 'inset 0 0 0 1px var(--border-w)',
            }}
          />
        ))}
      </div>
      <span className="pixel text-[11px] text-foreground tabular-nums">
        {score}
      </span>
    </div>
  )
}

export default ScoreMeter
