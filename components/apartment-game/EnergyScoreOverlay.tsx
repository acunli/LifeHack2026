'use client';

/**
 * EnergyScoreOverlay - live score badge that updates as appliances (fixed
 * or custom) are installed, removed, or switched on/off. The tracking logic
 * lives in useLiveApartmentScore so /home's own score panel reads the exact
 * same number - see that hook's docstring.
 */

import { useLiveApartmentScore } from '@/lib/game/hooks/useLiveApartmentScore';

const STATUS_COLOR: Record<string, string> = {
  'Energy Saver': '#4ade80',
  Good: '#a3e635',
  Average: '#facc15',
  'Needs Improvement': '#f87171',
};

export default function EnergyScoreOverlay() {
  const { installed, onCount, result } = useLiveApartmentScore();

  return (
    <div
      style={{
        position: 'absolute',
        top: '0.75rem',
        right: '0.75rem',
        backgroundColor: 'rgba(0,0,0,0.75)',
        border: `1px solid ${STATUS_COLOR[result.status]}`,
        borderRadius: '8px',
        padding: '0.6rem 0.9rem',
        color: '#fff',
        lineHeight: 'normal',
        fontFamily: 'monospace',
        fontSize: '0.75rem',
        minWidth: '150px',
        zIndex: 10,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <span style={{ color: '#888' }}>Score</span>
        <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: STATUS_COLOR[result.status] }}>
          {result.score}
        </span>
      </div>
      <div style={{ color: STATUS_COLOR[result.status], marginBottom: '0.35rem' }}>
        {result.status}
      </div>
      <div style={{ color: '#aaa' }}>{result.totalDailyKwh} kWh/day</div>
      <div style={{ color: '#666', marginTop: '0.25rem' }}>
        {installed.length} appliance{installed.length === 1 ? '' : 's'} installed · {onCount} on
      </div>
    </div>
  );
}
