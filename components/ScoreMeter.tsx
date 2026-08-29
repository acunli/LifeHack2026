/**
 * Segmented energy meter for a 0–100 score. Ten blocks light in proportion.
 * The number is always shown alongside, so the meter is a redundant indicator
 * rather than the only one.
 *
 * Ported from the leaderboard mock onto our tokens.
 */

const BLOCKS = 10;

export default function ScoreMeter({
  score,
  className = "",
}: {
  score: number;
  className?: string;
}) {
  const clamped = Math.min(100, Math.max(0, score));
  const filled = Math.round((clamped / 100) * BLOCKS);

  return (
    <div
      className={`flex items-center gap-2 ${className}`}
      role="img"
      aria-label={`Energy score ${score} out of 100`}
    >
      <div className="flex gap-[2px]" aria-hidden>
        {Array.from({ length: BLOCKS }, (_, i) => (
          <span
            key={i}
            className="h-3 w-[6px]"
            style={{
              background: i < filled ? "var(--amber)" : "var(--bg-deep)",
              boxShadow:
                i < filled
                  ? "inset 0 0 0 1px var(--amber-deep)"
                  : "inset 0 0 0 1px var(--line)",
            }}
          />
        ))}
      </div>
      <span className="pixel text-[11px] tabular-nums text-ink">{score}</span>
    </div>
  );
}
