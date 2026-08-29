/**
 * Daily score change. Direction is carried by a pixel arrow, a signed number,
 * AND a screen-reader label — never by colour alone.
 *
 * Ported from the leaderboard mock; takes our plain `delta` number rather than
 * a DailyChange object.
 */

export default function ChangeIndicator({
  delta,
  className = "",
}: {
  delta: number;
  className?: string;
}) {
  const direction = delta > 0 ? "up" : delta < 0 ? "down" : "flat";
  const arrow = direction === "up" ? "▲" : direction === "down" ? "▼" : "▬";
  const colour =
    direction === "up"
      ? "var(--green)"
      : direction === "down"
        ? "var(--red)"
        : "var(--ink-dim)";

  return (
    <span
      className={`pixel inline-flex items-center gap-1 text-[10px] ${className}`}
      style={{ color: colour }}
    >
      <span aria-hidden className="text-[8px] leading-none">
        {arrow}
      </span>
      <span className="tabular-nums" aria-hidden>
        {Math.abs(delta)}
      </span>
      <span className="sr-only">
        {direction === "flat"
          ? "no change since yesterday"
          : `${direction} ${Math.abs(delta)} points since yesterday`}
      </span>
    </span>
  );
}
