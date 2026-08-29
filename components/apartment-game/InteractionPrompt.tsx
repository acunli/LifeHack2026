'use client';

/**
 * InteractionPrompt - shows "[E] Add appliance" when the player is near an
 * empty socket. Listens on the shared gameEvents bus since Phaser and React
 * are separate render trees with no shared state.
 */

import { useEffect, useState } from 'react';
import { gameEvents, GAME_EVENTS, SocketNearPayload } from '@/lib/game/utils/gameEvents';

export default function InteractionPrompt() {
  const [near, setNear] = useState<SocketNearPayload | null>(null);

  useEffect(() => {
    const handleNear = (payload: SocketNearPayload) => setNear(payload);
    const handleFar = () => setNear(null);

    gameEvents.on(GAME_EVENTS.SOCKET_NEAR, handleNear);
    gameEvents.on(GAME_EVENTS.SOCKET_FAR, handleFar);

    return () => {
      gameEvents.off(GAME_EVENTS.SOCKET_NEAR, handleNear);
      gameEvents.off(GAME_EVENTS.SOCKET_FAR, handleFar);
    };
  }, []);

  if (!near || near.occupied) return null;

  return (
    <div
      style={{
        marginTop: '0.75rem',
        padding: '0.5rem 1rem',
        backgroundColor: '#2a2a2a',
        border: '1px solid #4ade80',
        borderRadius: '6px',
        color: '#fff',
        fontSize: '0.875rem',
        fontFamily: 'monospace',
      }}
    >
      <strong style={{ color: '#4ade80' }}>[E]</strong> Add appliance — {near.purpose}
    </div>
  );
}
