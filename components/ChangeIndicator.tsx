/**
 * Score change from the resident's baseline. Direction is shown with an arrow AND a
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

  const bgColor =
    change.direction === 'up'
      ? 'rgba(155, 229, 100, 0.15)'
      : change.direction === 'down'
        ? 'rgba(255, 122, 107, 0.15)'
        : 'transparent'

  const magnitude = Math.abs(change.value)

  return (
    <span
      className={`pixel inline-flex items-center gap-1 rounded-sm px-1.5 py-0.5 text-[10px] ${className ?? ''}`}
      style={{ color, background: bgColor }}
    >
      <span aria-hidden className="text-[10px] leading-none">
        {ARROW[change.direction]}
      </span>
      <span className="tabular-nums">
        {change.direction === 'flat' ? '0' : `${change.direction === 'up' ? '+' : '-'}${magnitude}`}
      </span>
      <span className="sr-only">
        {LABEL[change.direction]}
        {change.direction !== 'flat' ? ` ${magnitude} points versus baseline` : ' versus baseline'}
      </span>
    </span>
  )
}

export default ChangeIndicator
