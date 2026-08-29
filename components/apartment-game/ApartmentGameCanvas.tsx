'use client';

/**
 * ApartmentGameCanvas - React component that mounts Phaser 3 game
 *
 * This component:
 * 1. Creates a Phaser game instance on mount
 * 2. Properly cleans up on unmount
 * 3. Handles window resize
 * 4. Provides a container for the game canvas
 */

import { useEffect, useRef, useState } from 'react';
import * as Phaser from 'phaser';
import PreloadScene from '@/lib/game/scenes/PreloadScene';
import ApartmentScene from '@/lib/game/scenes/ApartmentScene';
import EnergyScoreOverlay from './EnergyScoreOverlay';
import GameControls from './GameControls';
import { gameEvents, GAME_EVENTS } from '@/lib/game/utils/gameEvents';

const GAME_WIDTH = 768;
const GAME_HEIGHT = 576;

/**
 * `showScore` is off when embedded in the dashboard, which owns the score
 * panel. With both visible the screen showed 100 / Energy Saver beside
 * 74 / Average — two different answers to the same question.
 */
export default function ApartmentGameCanvas({
  showScore = true,
}: {
  showScore?: boolean;
} = {}) {
  const gameRef = useRef<Phaser.Game | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;

    // Username setup, React strict mode, and hot reload can remount this tree
    // rapidly in development. The mount owns this container exclusively, so
    // clear any stale Phaser canvas before creating exactly one new game.
    container.replaceChildren();

    // Phaser game configuration
    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: 768,  // 48 tiles × 16px (displayed at 2× scale)
      height: 576, // 36 tiles × 16px (displayed at 2× scale)
      parent: container,
      backgroundColor: '#000000',
      pixelArt: true, // Crisp pixel rendering
      scene: [PreloadScene, ApartmentScene],
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { x: 0, y: 0 }, // Top-down game, no gravity
          debug: false, // Set to true to see collision bounds
        },
      },
      /*
       * The room plays no sounds of its own — the soundtrack is an <audio>
       * element in the layout, so it survives navigation. Left enabled, Phaser
       * still opens a WebAudio context and suspends it on window blur; if the
       * game has already been destroyed (a route change, a Strict Mode
       * remount) that context is closed and the suspend throws
       * "Cannot suspend a closed AudioContext".
       */
      audio: { noAudio: true },
      input: {
        mouse: {
          // Phaser calls preventDefault on wheel events by default, which
          // stopped the page scrolling whenever the cursor was over the
          // apartment — most of the screen.
          preventDefaultWheel: false,
        },
      },
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
    };

    // Create game instance
    const game = new Phaser.Game(config);
    gameRef.current = game;

    // Cleanup on unmount
    return () => {
      game.destroy(true);
      container.replaceChildren();
      if (gameRef.current === game) {
        gameRef.current = null;
      }
    };
  }, []);

  return (
    <div
      className="apartment-game-shell"
      role="group"
      aria-label="Interactive apartment energy audit"
      style={{
        position: 'relative',
        width: '100%',
        maxWidth: '768px',
        margin: '0 auto',
        lineHeight: 'normal',
      }}
    >
      <div
        ref={containerRef}
        className="apartment-game-container"
        onDragOver={e => {
          e.preventDefault();
          e.dataTransfer.dropEffect = 'copy';
          if (!dragOver) setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={e => {
          e.preventDefault();
          setDragOver(false);
          const customType = e.dataTransfer.getData('text/plain');
          if (!customType || !containerRef.current) return;

          const rect = containerRef.current.getBoundingClientRect();
          const x = ((e.clientX - rect.left) / rect.width) * GAME_WIDTH;
          const y = ((e.clientY - rect.top) / rect.height) * GAME_HEIGHT;

          gameEvents.emit(GAME_EVENTS.APPLIANCE_PLACE_CUSTOM_REQUEST, { customType, x, y });
        }}
        style={{
          width: '100%',
          aspectRatio: '4 / 3',
          border: dragOver ? '2px dashed #4ade80' : '2px solid #333',
          overflow: 'hidden',
          boxShadow: '6px 6px 0 rgba(0,0,0,0.35)',
        }}
      />
      {showScore && <EnergyScoreOverlay />}
      <GameControls />
    </div>
  );
}
