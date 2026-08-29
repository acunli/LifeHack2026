'use client'

/**
 * Live countdown to the next daily reset (local midnight in APP_TIMEZONE).
 * Avoids hydration mismatch by only rendering the ticking value after mount.
 */

import { useEffect, useState } from 'react'
import { APP_TIMEZONE } from '@/lib/config'
import { formatDuration, secondsUntilMidnight } from '@/lib/time'

export function Countdown({ className }: { className?: string }) {
  const [seconds, setSeconds] = useState<number | null>(null)

  useEffect(() => {
    const tick = () =>
      setSeconds(secondsUntilMidnight(new Date(), APP_TIMEZONE))
    tick()
    const id = window.setInterval(tick, 1000)
    return () => window.clearInterval(id)
  }, [])

  return (
    <div
      className={`pixel flex items-center gap-2 text-muted-w ${className ?? ''}`}
    >
      <span className="anim-pulse inline-block h-2 w-2 bg-gold" aria-hidden />
      <span className="text-[10px] uppercase tracking-wide">Resets in</span>
      <span
        className="text-[11px] text-foreground tabular-nums"
        aria-live="off"
        suppressHydrationWarning
      >
        {seconds === null ? '--:--:--' : formatDuration(seconds)}
      </span>
    </div>
  )
}

export default Countdown
