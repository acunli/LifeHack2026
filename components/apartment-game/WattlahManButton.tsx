'use client';

/**
 * WattlahManButton - summons WattLahMan into the running ApartmentScene.
 * The button only owns the API key prompt and its own busy/idle label; all
 * of the actual decide → walk → toggle → speak loop lives in
 * ApartmentScene.handleWattlahmanSummon, reached over the shared gameEvents
 * bus (Phaser and React are separate render trees - see gameEvents.ts).
 */

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { gameEvents, GAME_EVENTS, WattlahmanStatus, WattlahmanStatusPayload } from '@/lib/game/utils/gameEvents';
import { readKimiApiKey, writeKimiApiKey } from '@/lib/wattlahman/apiKeyStorage';

const STATUS_LABEL: Record<WattlahmanStatus, string> = {
  thinking: 'WattLahMan is thinking…',
  acting: 'WattLahMan is on it…',
  done: 'Call WattLahMan',
  dismissed: 'Call WattLahMan',
  'nothing-to-do': 'Call WattLahMan',
};

export default function WattlahManButton() {
  const [status, setStatus] = useState<WattlahmanStatus>('done');
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [apiKeyDraft, setApiKeyDraft] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleStatus = (payload: WattlahmanStatusPayload) => setStatus(payload.status);
    gameEvents.on(GAME_EVENTS.WATTLAHMAN_STATUS, handleStatus);
    return () => {
      gameEvents.off(GAME_EVENTS.WATTLAHMAN_STATUS, handleStatus);
    };
  }, []);

  useEffect(() => {
    if (showKeyModal) inputRef.current?.focus();
  }, [showKeyModal]);

  const busy = status === 'thinking' || status === 'acting';

  function summon(apiKey: string | null) {
    gameEvents.emit(GAME_EVENTS.WATTLAHMAN_SUMMON_REQUEST, { apiKey });
  }

  function handleCall() {
    const existingKey = readKimiApiKey();
    if (existingKey) {
      summon(existingKey);
      return;
    }
    setApiKeyDraft('');
    setShowKeyModal(true);
  }

  function saveAndSummon() {
    const key = apiKeyDraft.trim();
    if (key) writeKimiApiKey(key);
    setShowKeyModal(false);
    summon(key || null);
  }

  function skipAndSummon() {
    setShowKeyModal(false);
    summon(null);
  }

  return (
    <>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <button
          type="button"
          className="pixel-btn"
          disabled={busy}
          onClick={handleCall}
          style={{ padding: '10px 16px', fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.1em', opacity: busy ? 0.7 : 1 }}
        >
          {STATUS_LABEL[status]}
        </button>
        {busy && (
          <button
            type="button"
            className="pixel-btn-ghost"
            onClick={() => gameEvents.emit(GAME_EVENTS.WATTLAHMAN_DISMISS_REQUEST)}
            style={{ padding: '10px 14px', fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.1em' }}
          >
            Stop
          </button>
        )}
      </div>

      {showKeyModal &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="wattlahman-key-title"
            className="game-dialog-backdrop"
            onClick={() => setShowKeyModal(false)}
          >
            <div className="game-dialog pixel-panel" onClick={e => e.stopPropagation()}>
              <p className="game-dialog-eyebrow">WATTLAHMAN · SETUP</p>
              <h2 id="wattlahman-key-title">Paste your Kimi K3 API key</h2>
              <p className="game-dialog-copy">
                WattLahMan uses it to decide what to switch off next. Stored only in this
                browser, sent only to Fireworks&apos; API — never anywhere else. No key?
                He&apos;ll still work off a built-in heuristic.
              </p>
              <input
                ref={inputRef}
                type="password"
                className="pixel-input"
                placeholder="sk-..."
                value={apiKeyDraft}
                onChange={e => setApiKeyDraft(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') saveAndSummon();
                }}
                style={{ width: '100%', padding: '10px 12px', marginTop: 8, marginBottom: 4, fontSize: 11 }}
              />
              <div className="game-dialog-actions">
                <button className="pixel-btn" onClick={saveAndSummon}>
                  Save &amp; summon
                </button>
                <button className="pixel-btn-ghost" onClick={skipAndSummon}>
                  Skip for now
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
