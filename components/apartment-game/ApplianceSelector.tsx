'use client';

/**
 * ApplianceSelector - modal that opens when the player presses E at an
 * empty socket, or clicks a not-yet-installed custom placeholder. Both
 * flows share the same GAME_EVENTS.APPLIANCE_INTERACT event, so this one
 * modal handles fixed and custom appliances identically.
 */

import { useEffect, useRef, useState } from 'react';
import {
  gameEvents,
  GAME_EVENTS,
  ApplianceInteractPayload,
} from '@/lib/game/utils/gameEvents';

export default function ApplianceSelector() {
  const [pending, setPending] = useState<ApplianceInteractPayload | null>(null);
  const scanButtonRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleInteract = (payload: ApplianceInteractPayload) => setPending(payload);
    gameEvents.on(GAME_EVENTS.APPLIANCE_INTERACT, handleInteract);
    return () => {
      gameEvents.off(GAME_EVENTS.APPLIANCE_INTERACT, handleInteract);
    };
  }, []);

  useEffect(() => {
    if (!pending) return;
    const previousFocus = document.activeElement as HTMLElement | null;
    scanButtonRef.current?.focus();
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setPending(null);
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
  }, [pending]);

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
      aria-labelledby="scan-dialog-title"
      className="game-dialog-backdrop"
      onClick={() => setPending(null)}
    >
      <div
        ref={dialogRef}
        className="game-dialog pixel-panel"
        onClick={e => e.stopPropagation()}
      >
        <p className="game-dialog-eyebrow">ENERGY AUDIT · {pending.purpose}</p>
        <h2 id="scan-dialog-title">Scan {pending.appliance.name}</h2>
        <p className="game-dialog-copy">
          {pending.appliance.tip}
        </p>
        <div className="game-dialog-actions">
          <button
            ref={scanButtonRef}
            onClick={install}
            className="pixel-btn"
          >
            Scan usage
          </button>
          <button
            onClick={() => setPending(null)}
            className="pixel-btn-ghost"
          >
            Not now
          </button>
        </div>
      </div>
    </div>
  );
}
