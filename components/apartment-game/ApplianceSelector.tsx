'use client';

/**
 * ApplianceSelector - modal that opens when the player presses E at an
 * empty socket, or clicks a not-yet-installed custom placeholder. Both
 * flows share the same GAME_EVENTS.APPLIANCE_INTERACT event, so this one
 * modal handles fixed and custom appliances identically.
 */

import { useEffect, useState } from 'react';
import {
  gameEvents,
  GAME_EVENTS,
  ApplianceInteractPayload,
} from '@/lib/game/utils/gameEvents';

export default function ApplianceSelector() {
  const [pending, setPending] = useState<ApplianceInteractPayload | null>(null);

  useEffect(() => {
    const handleInteract = (payload: ApplianceInteractPayload) => setPending(payload);
    gameEvents.on(GAME_EVENTS.APPLIANCE_INTERACT, handleInteract);
    return () => {
      gameEvents.off(GAME_EVENTS.APPLIANCE_INTERACT, handleInteract);
    };
  }, []);

  if (!pending) return null;

  const install = () => {
    gameEvents.emit(GAME_EVENTS.APPLIANCE_INSTALL_REQUEST, {
      installTargetId: pending.installTargetId,
    });
    setPending(null);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 50,
      }}
      onClick={() => setPending(null)}
    >
      <div
        style={{
          backgroundColor: '#1f1f1f',
          border: '1px solid #4ade80',
          borderRadius: '10px',
          padding: '1.5rem',
          maxWidth: '320px',
          width: '90%',
          color: '#fff',
          fontFamily: 'monospace',
        }}
        onClick={e => e.stopPropagation()}
      >
        <p style={{ fontSize: '0.75rem', color: '#888', marginBottom: '0.25rem' }}>
          {pending.purpose}
        </p>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>{pending.appliance.name}</h2>
        <p style={{ fontSize: '0.8rem', color: '#ccc', marginBottom: '1.25rem' }}>
          {pending.appliance.tip}
        </p>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={install}
            style={{
              flex: 1,
              padding: '0.5rem',
              backgroundColor: '#4ade80',
              color: '#111',
              border: 'none',
              borderRadius: '6px',
              fontWeight: 'bold',
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            Install
          </button>
          <button
            onClick={() => setPending(null)}
            style={{
              flex: 1,
              padding: '0.5rem',
              backgroundColor: 'transparent',
              color: '#888',
              border: '1px solid #444',
              borderRadius: '6px',
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
