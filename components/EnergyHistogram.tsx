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

  const maxVal = Math.max(...weeklyData, 1)
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

  return (
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

      {/* Right: Statistics */}
      <div className="histogram-stats">
        <div className="histogram-title">This Month&apos;s Stats</div>
        <div className="stat-grid">
          <div className="stat-card">
            <div className="stat-label">Total Usage</div>
            <div className="stat-value">{total}</div>
            <div className="stat-unit">kWh</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Est. Cost</div>
            <div className="stat-value">S${(total * tariff).toFixed(0)}</div>
            <div className="stat-unit">this month</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Peak Day</div>
            <div className="stat-value">{peak}</div>
            <div className="stat-unit">kWh</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Low Day</div>
            <div className="stat-value">{low}</div>
            <div className="stat-unit">kWh</div>
          </div>
          <div className="stat-card stat-card-wide">
            <div className="stat-label">Top Consumer</div>
            <div className="stat-value">
              {topAppliance.icon} {topAppliance.name}
            </div>
            <div className="stat-unit">
              {currentUsage[topAppliance.id] ?? topAppliance.kwh} kWh
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
