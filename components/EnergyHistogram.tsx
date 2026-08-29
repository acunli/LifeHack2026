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
    return DAYS.map((day) => {
      const factor = seededBar(day, 'weekly')
      return Math.round(total * factor * 10) / 10
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

  // Build SVG path for line chart
  const linePoints = costData.map((v, i) => {
    const x = (i / (costData.length - 1)) * 100
    const y = 100 - (v / maxCost) * 100
    return `${x},${y}`
  })
  const linePath = `M${linePoints.join(' L')}`

  // Area fill path (closes at bottom)
  const areaPath = `${linePath} L100,100 L0,100 Z`

  return (
    <div className="histogram-section">
      <div className="histogram-row">
        {/* Left: Histogram */}
        <div className="histogram-panel">
          <div className="histogram-title">Weekly Usage Trend</div>
          <div className="histogram-chart">
            {DAYS.map((day, i) => (
              <div key={day} className="histogram-bar-col">
                <div className="histogram-bar-wrap">
                  <div
                    className="histogram-bar"
                    style={{ height: `${(weeklyData[i] / maxVal) * 100}%` }}
                  />
                </div>
                <div className="histogram-bar-label">{day}</div>
                <div className="histogram-bar-value">{weeklyData[i]}</div>
              </div>
            ))}
          </div>
          <div className="histogram-avg">
            Avg: <b>{avg}</b> kWh/day
          </div>
        </div>

        {/* Right: Line Chart — Daily Cost Trend */}
        <div className="histogram-panel">
          <div className="histogram-title">Daily Cost Trend</div>
          <div className="linechart-container">
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="linechart-svg">
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
              <path d={linePath} fill="none" stroke="var(--amber)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              {costData.map((v, i) => {
                const x = (i / (costData.length - 1)) * 100
                const y = 100 - (v / maxCost) * 100
                return <circle key={i} cx={x} cy={y} r="2.5" fill="var(--amber)" stroke="var(--bg-deep)" strokeWidth="1" />
              })}
            </svg>
            <div className="linechart-labels">
              {DAYS.map((day) => (
                <span key={day} className="linechart-label">{day}</span>
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
