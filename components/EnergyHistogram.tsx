'use client'

import { useMemo } from 'react'

type EnergyHistogramProps = {
  appliances: { id: string; name: string; icon: string; kwh: number }[]
  currentUsage: Record<string, number>
  total: number
  tariff: number
}

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

function seededBar(day: string, id: string): number {
  let h = 2166136261 >>> 0
  const seed = `${id}:${day}`
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i)
    h = Math.imul(h, 16777619) >>> 0
  }
  return 0.5 + ((h >>> 8) % 100000) / 100000
}

export default function EnergyHistogram({
  appliances,
  currentUsage,
  total,
  tariff,
}: EnergyHistogramProps) {
  const weeklyData = useMemo(() => {
    const dailyAverage = total / 30
    return DAYS.map((day) => {
      const factor = seededBar(day, 'weekly')
      return Math.round(dailyAverage * factor * 10) / 10
    })
  }, [total])

  const costData = useMemo(() => {
    return weeklyData.map((kwh) => Math.round(kwh * tariff * 100) / 100)
  }, [weeklyData, tariff])

  const maxVal = Math.max(...weeklyData, 1)
  const maxCost = Math.max(...costData, 1)
  const avg = Math.round((weeklyData.reduce((s, v) => s + v, 0) / 7) * 10) / 10
  const peak = Math.max(...weeklyData)
  const low = Math.min(...weeklyData)

  const topAppliance = useMemo(() => {
    let max = 0
    let top = appliances[0]
    for (const a of appliances) {
      const kwh = currentUsage[a.id] ?? a.kwh
      if (kwh > max) {
        max = kwh
        top = a
      }
    }
    return top
  }, [appliances, currentUsage])

  /*
   * Plot into a padded band rather than the full 0-100 box.
   *
   * With y = 100 - (v/maxCost)*100 the peak landed exactly on y=0, so the
   * highest point and its stroke were clipped by the viewport edge and the
   * top axis label sat on top of it. Insetting top and bottom gives the line
   * room to breathe and stops the peak colliding with its own label.
   */
  const PLOT_TOP = 10
  const PLOT_BOTTOM = 92
  // Inset horizontally too: at x=0 and x=100 the first and last dots were
  // centred on the container edges and rendered half-clipped.
  const PLOT_LEFT = 3
  const PLOT_RIGHT = 97
  const xFor = (i: number, n: number) =>
    PLOT_LEFT + (i / (n - 1)) * (PLOT_RIGHT - PLOT_LEFT)
  const yFor = (v: number) =>
    PLOT_BOTTOM - (v / maxCost) * (PLOT_BOTTOM - PLOT_TOP)

  const linePoints = costData.map((v, i) => {
    return `${xFor(i, costData.length)},${yFor(v)}`
  })
  const linePath = `M${linePoints.join(' L')}`

  // Area fill path (closes at bottom)
  const areaPath = `${linePath} L${PLOT_RIGHT},${PLOT_BOTTOM} L${PLOT_LEFT},${PLOT_BOTTOM} Z`

  return (
    <div className="histogram-section">
      <div className="histogram-row">
        {/* Left: Histogram */}
        {/* Daily cost trend. The weekly usage bars were removed: two charts
            saying much the same thing, and cost is more concrete than kWh. */}
        <div className="histogram-panel">
          <div className="histogram-title">Daily Cost Trend</div>
          <div
            className="linechart-container"
            role="img"
            aria-label={`Illustrative daily cost trend. Weekly total S$${costData.reduce((sum, value) => sum + value, 0).toFixed(2)}.`}
          >
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="linechart-svg" aria-hidden="true">
              <defs>
                <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--amber)" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="var(--amber)" stopOpacity="0.02" />
                </linearGradient>
              </defs>
              {[0, 25, 50, 75, 100].map((y) => (
                <line key={y} x1="0" y1={y} x2="100" y2={y} stroke="var(--line)" strokeWidth="0.3" strokeDasharray="2,2" />
              ))}
              <path d={areaPath} fill="url(#lineGrad)" />
              {/* non-scaling-stroke: the viewBox is square and the box is wide, so
                  without it the stroke renders thicker vertically than
                  horizontally. */}
              <path
                d={linePath}
                fill="none"
                stroke="var(--amber)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
              />
            </svg>
            {/* Dots live outside the SVG. Inside it they inherit the
                non-uniform scale and render as ovals rather than circles. */}
            {costData.map((v, i) => (
              <span
                key={i}
                className="linechart-dot"
                style={{
                  left: `${xFor(i, costData.length)}%`,
                  top: `${yFor(v)}%`,
                }}
              />
            ))}
            {/* Positioned at the same percentages as the dots. With
                space-between the first label's left edge sat at 0 while the
                first point's centre did, so every label was offset from the
                point it names. */}
            <div className="linechart-labels">
              {DAYS.map((day, i) => (
                <span
                  key={day}
                  className="linechart-label"
                  style={{ left: `${xFor(i, DAYS.length)}%` }}
                >
                  {day}
                </span>
              ))}
            </div>
            <div className="linechart-y-labels">
              <span>S${maxCost.toFixed(2)}</span>
              <span>S${(maxCost / 2).toFixed(2)}</span>
              <span>S$0</span>
            </div>
          </div>
          <div className="histogram-avg">
            Total: <b>S${costData.reduce((s, v) => s + v, 0).toFixed(2)}</b> this week
          </div>
        </div>
      </div>

      {/* Stats row below charts */}
      <div className="histogram-row stats-row">
        <div className="stat-card">
          <div className="stat-label">Total Usage</div>
          <div className="stat-value">{total} kWh</div>
          <div className="stat-unit">this month</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Est. Cost</div>
          <div className="stat-value">S${(total * tariff).toFixed(2)}</div>
          <div className="stat-unit">this month</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Peak Day</div>
          <div className="stat-value">{peak} kWh</div>
          <div className="stat-unit">highest this week</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Low Day</div>
          <div className="stat-value">{low} kWh</div>
          <div className="stat-unit">lowest this week</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Top Consumer</div>
          <div className="stat-value">{topAppliance.icon} {topAppliance.name}</div>
          <div className="stat-unit">{currentUsage[topAppliance.id] ?? topAppliance.kwh} kWh</div>
        </div>
      </div>
    </div>
  )
}
