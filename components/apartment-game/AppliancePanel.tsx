'use client';

/**
 * AppliancePanel - gamified detail view for an appliance. Opens two ways:
 * right after a successful install (celebratory framing), or on clicking an
 * already-installed appliance (plain inspect framing). Both share the same
 * layout: an animated kWh counter, a 7-day usage history bar chart, and an
 * efficiency badge.
 */

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
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
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      const frame = requestAnimationFrame(() => setValue(target));
      return () => cancelAnimationFrame(frame);
    }
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
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleInstalled = (payload: ApplianceInstalledPayload) =>
      setView({ installTargetId: payload.installTargetId, appliance: payload.appliance, justInstalled: true, isOn: true });
    const handleClicked = (payload: ApplianceClickedPayload) =>
      setView({ installTargetId: payload.installTargetId, appliance: payload.appliance, justInstalled: false, isOn: payload.isOn });
    const handlePowerChanged = (payload: AppliancePowerChangedPayload) =>
      setView(prev => (prev && prev.installTargetId === payload.installTargetId
        ? { ...prev, isOn: payload.isOn, justInstalled: false }
        : prev));
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

  const dialogOpen = view !== null;
  useEffect(() => {
    if (!dialogOpen) return;
    const previousFocus = document.activeElement as HTMLElement | null;
    closeButtonRef.current?.focus();
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setView(null);
      if (event.key !== 'Tab') return;
      const focusable = [...(dialogRef.current?.querySelectorAll<HTMLElement>('button, [href], input, [tabindex]:not([tabindex="-1"])') ?? [])];
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => {
      window.removeEventListener('keydown', closeOnEscape);
      previousFocus?.focus();
    };
  }, [dialogOpen]);

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

  if (!view || typeof document === 'undefined') return null;
  const { installTargetId, appliance, justInstalled, isOn } = view;
  const badge = efficiencyBadge(appliance.dailyKwh);
  const history = getUsageHistory(appliance.id, appliance.dailyKwh);
  const maxKwh = Math.max(...history.map(d => d.kwh), 0.1);

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="appliance-dialog-title"
      className="game-dialog-backdrop"
      onClick={() => setView(null)}
    >
      <div
        ref={dialogRef}
        className="game-dialog appliance-dialog pixel-panel"
        style={{
          borderColor: badge.color,
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
          <p className="game-dialog-eyebrow" style={{ color: '#9be564' }}>
            ✓ METER CONNECTED · +25 XP
          </p>
        )}
        {!justInstalled && (
          <p className="game-dialog-eyebrow" style={{ color: isOn ? '#9be564' : '#a3c4ac' }}>
            {isOn ? '● LIVE METER READING' : '○ METER PAUSED'}
          </p>
        )}

        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
          <h2 id="appliance-dialog-title" style={{ margin: 0 }}>{appliance.name}</h2>
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
          role="img"
          aria-label={`Past seven days of ${appliance.name} energy usage`}
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
            className={isOn ? 'pixel-btn-ghost' : 'pixel-btn'}
          >
            {isOn ? 'Turn Off' : 'Turn On'}
          </button>
          <button
            onClick={() => {
              gameEvents.emit(GAME_EVENTS.APPLIANCE_REMOVE_REQUEST, { installTargetId });
              setView(null);
            }}
            className="pixel-btn-ghost game-remove-button"
          >
            {appliance.isCustom ? 'Remove' : 'Disconnect meter'}
          </button>
        </div>

        <button
          ref={closeButtonRef}
          onClick={() => setView(null)}
          className="pixel-btn game-dialog-close"
        >
          Close
        </button>
      </div>
    </div>,
    document.body,
  );
}
