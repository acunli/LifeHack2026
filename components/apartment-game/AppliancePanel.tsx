'use client';

/**
 * AppliancePanel - gamified detail view for an appliance. Opens two ways:
 * right after a successful install (celebratory framing), or on clicking an
 * already-installed appliance (plain inspect framing). Both share the same
 * layout: an animated kWh counter, a 7-day usage history bar chart, and an
 * efficiency badge.
 */

import { useEffect, useState } from 'react';
import {
  gameEvents,
  GAME_EVENTS,
  AppliancePayload,
  ApplianceInstalledPayload,
  ApplianceClickedPayload,
  AppliancePowerChangedPayload,
  ApplianceRemovedPayload,
} from '@/lib/game/utils/gameEvents';
import { getUsageHistory } from '@/lib/game/utils/usageHistory';

interface ViewState {
  installTargetId: string;
  appliance: AppliancePayload;
  justInstalled: boolean;
  isOn: boolean;
}

function useCountUp(target: number, active: boolean, durationMs = 700): number {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!active) return;
    // Deferred: setting state in the effect body cascades a render.
    const start = performance.now();
    let frame: number;
    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / durationMs);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(target * eased);
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, active, durationMs]);
  return value;
}

function efficiencyBadge(dailyKwh: number): { label: string; color: string } {
  if (dailyKwh <= 0.5) return { label: '🌱 Eco Pick', color: '#4ade80' };
  if (dailyKwh <= 1.5) return { label: '⚖️ Balanced', color: '#facc15' };
  return { label: '⚡ Power Hungry', color: '#f87171' };
}

export default function AppliancePanel() {
  const [view, setView] = useState<ViewState | null>(null);
  const [chartIn, setChartIn] = useState(false);

  useEffect(() => {
    const handleInstalled = (payload: ApplianceInstalledPayload) =>
      setView({ installTargetId: payload.installTargetId, appliance: payload.appliance, justInstalled: true, isOn: true });
    const handleClicked = (payload: ApplianceClickedPayload) =>
      setView({ installTargetId: payload.installTargetId, appliance: payload.appliance, justInstalled: false, isOn: payload.isOn });
    const handlePowerChanged = (payload: AppliancePowerChangedPayload) =>
      setView(prev => (prev && prev.installTargetId === payload.installTargetId ? { ...prev, isOn: payload.isOn } : prev));
    const handleRemoved = (payload: ApplianceRemovedPayload) =>
      setView(prev => (prev && prev.installTargetId === payload.installTargetId ? null : prev));

    gameEvents.on(GAME_EVENTS.APPLIANCE_INSTALLED, handleInstalled);
    gameEvents.on(GAME_EVENTS.APPLIANCE_CLICKED, handleClicked);
    gameEvents.on(GAME_EVENTS.APPLIANCE_POWER_CHANGED, handlePowerChanged);
    gameEvents.on(GAME_EVENTS.APPLIANCE_REMOVED, handleRemoved);
    return () => {
      gameEvents.off(GAME_EVENTS.APPLIANCE_INSTALLED, handleInstalled);
      gameEvents.off(GAME_EVENTS.APPLIANCE_CLICKED, handleClicked);
      gameEvents.off(GAME_EVENTS.APPLIANCE_POWER_CHANGED, handlePowerChanged);
      gameEvents.off(GAME_EVENTS.APPLIANCE_REMOVED, handleRemoved);
    };
  }, []);

  const kwh = useCountUp(view && view.isOn ? view.appliance.dailyKwh : 0, view !== null);

  useEffect(() => {
    // Both branches run in timers rather than synchronously in the body —
    // setting state directly here cascades a render on every view change.
    if (!view) {
      const off = setTimeout(() => setChartIn(false), 0);
      return () => clearTimeout(off);
    }
    const reset = setTimeout(() => setChartIn(false), 0);
    const t = setTimeout(() => setChartIn(true), 50);
    return () => {
      clearTimeout(reset);
      clearTimeout(t);
    };
  }, [view]);

  if (!view) return null;
  const { installTargetId, appliance, justInstalled, isOn } = view;
  const badge = efficiencyBadge(appliance.dailyKwh);
  const history = getUsageHistory(appliance.id, appliance.dailyKwh);
  const maxKwh = Math.max(...history.map(d => d.kwh), 0.1);

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.65)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 50,
        lineHeight: 'normal',
      }}
      onClick={() => setView(null)}
    >
      <div
        style={{
          backgroundColor: '#1a1a1a',
          border: `1px solid ${badge.color}`,
          borderRadius: '12px',
          padding: '1.5rem',
          maxWidth: '360px',
          width: '92%',
          color: '#fff',
          fontFamily: 'monospace',
          boxShadow: `0 0 24px ${badge.color}33`,
          animation: 'appliance-panel-in 220ms ease-out',
        }}
        onClick={e => e.stopPropagation()}
      >
        <style>{`
          @keyframes appliance-panel-in {
            from { transform: scale(0.9); opacity: 0; }
            to { transform: scale(1); opacity: 1; }
          }
          @keyframes bar-grow {
            from { transform: scaleY(0); }
            to { transform: scaleY(1); }
          }
        `}</style>

        {justInstalled && (
          <p style={{ fontSize: '0.75rem', color: '#4ade80', marginBottom: '0.25rem', letterSpacing: '0.05em' }}>
            ✓ INSTALLED
          </p>
        )}
        {!justInstalled && (
          <p style={{ fontSize: '0.75rem', color: isOn ? '#4ade80' : '#888', marginBottom: '0.25rem' }}>
            {isOn ? '● Powered on' : '○ Powered off'}
          </p>
        )}

        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
          <h2 style={{ fontSize: '1.25rem', margin: 0 }}>{appliance.name}</h2>
          <span
            style={{
              fontSize: '0.7rem',
              color: badge.color,
              border: `1px solid ${badge.color}`,
              borderRadius: '999px',
              padding: '0.15rem 0.5rem',
            }}
          >
            {badge.label}
          </span>
        </div>

        <div style={{ display: 'flex', gap: '1.5rem', margin: '1rem 0' }}>
          <div>
            <div style={{ fontSize: '1.75rem', fontWeight: 'bold', color: badge.color }}>
              {kwh.toFixed(2)}
            </div>
            <div style={{ fontSize: '0.7rem', color: '#888' }}>kWh / day</div>
          </div>
          <div>
            <div style={{ fontSize: '1.75rem', fontWeight: 'bold' }}>{appliance.hoursPerDay}h</div>
            <div style={{ fontSize: '0.7rem', color: '#888' }}>time open / day</div>
          </div>
        </div>

        <p style={{ fontSize: '0.7rem', color: '#888', marginBottom: '0.4rem' }}>Past 7 days</p>
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            gap: '4px',
            height: '56px',
            marginBottom: '1rem',
            borderBottom: '1px solid #333',
            paddingBottom: '4px',
          }}
        >
          {history.map((day, i) => (
            <div key={day.label} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
              <div
                title={`${day.label}: ${day.kwh} kWh`}
                style={{
                  width: '100%',
                  height: `${Math.max(6, (day.kwh / maxKwh) * 100)}%`,
                  backgroundColor: badge.color,
                  opacity: 0.35 + (i / history.length) * 0.5,
                  borderRadius: '2px 2px 0 0',
                  transform: chartIn ? 'scaleY(1)' : 'scaleY(0)',
                  transformOrigin: 'bottom',
                  transition: `transform 400ms ease-out ${i * 60}ms`,
                }}
              />
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '4px', marginTop: '-0.8rem', marginBottom: '1rem' }}>
          {history.map(day => (
            <div key={day.label} style={{ flex: 1, textAlign: 'center', fontSize: '0.6rem', color: '#666' }}>
              {day.label}
            </div>
          ))}
        </div>

        <p style={{ fontSize: '0.8rem', color: '#ccc', marginBottom: '1.25rem' }}>{appliance.tip}</p>

        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <button
            onClick={() =>
              gameEvents.emit(GAME_EVENTS.APPLIANCE_TOGGLE_POWER_REQUEST, { installTargetId })
            }
            style={{
              flex: 1,
              padding: '0.5rem',
              backgroundColor: isOn ? 'transparent' : badge.color,
              color: isOn ? '#ccc' : '#111',
              border: `1px solid ${isOn ? '#555' : badge.color}`,
              borderRadius: '6px',
              fontWeight: 'bold',
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            {isOn ? 'Turn Off' : 'Turn On'}
          </button>
          <button
            onClick={() => {
              gameEvents.emit(GAME_EVENTS.APPLIANCE_REMOVE_REQUEST, { installTargetId });
              setView(null);
            }}
            style={{
              flex: 1,
              padding: '0.5rem',
              backgroundColor: 'transparent',
              color: '#f87171',
              border: '1px solid #f87171',
              borderRadius: '6px',
              fontWeight: 'bold',
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            Remove
          </button>
        </div>

        <button
          onClick={() => setView(null)}
          style={{
            width: '100%',
            padding: '0.5rem',
            backgroundColor: badge.color,
            color: '#111',
            border: 'none',
            borderRadius: '6px',
            fontWeight: 'bold',
            cursor: 'pointer',
            fontFamily: 'inherit',
          }}
        >
          Close
        </button>
      </div>
    </div>
  );
}
