/**
 * Daily score change indicator. Direction is shown with a pixel arrow AND a
 * signed number + text label, so meaning never depends on color alone.
 */

import type { DailyChange } from '@/lib/leagueScoring'

const ARROW: Record<DailyChange['direction'], string> = {
  up: '\u25B2', // ▲
  down: '\u25BC', // ▼
  flat: '\u25AC', // ▬
}

const LABEL: Record<DailyChange['direction'], string> = {
  up: 'up',
  down: 'down',
  flat: 'no change',
}

export function ChangeIndicator({
  change,
  className,
}: {
  change: DailyChange
  className?: string
}) {
  const color =
    change.direction === 'up'
      ? 'var(--pos)'
      : change.direction === 'down'
        ? 'var(--neg)'
        : 'var(--muted-w)'

  const magnitude = Math.abs(change.value)

  return (
    <span
      className={`pixel inline-flex items-center gap-1 text-[10px] ${className ?? ''}`}
      style={{ color }}
    >
      <span aria-hidden className="text-[8px] leading-none">
        {ARROW[change.direction]}
      </span>
      <span className="tabular-nums">
        {change.direction === 'flat' ? '0' : magnitude}
      </span>
      <span className="sr-only">
        {LABEL[change.direction]}
        {change.direction !== 'flat' ? ` ${magnitude} points since yesterday` : ' since yesterday'}
      </span>
    </span>
  )
}

export default ChangeIndicator
