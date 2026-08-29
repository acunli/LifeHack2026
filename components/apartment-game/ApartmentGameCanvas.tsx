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
import { gameEvents, GAME_EVENTS } from '@/lib/game/utils/gameEvents';

const GAME_WIDTH = 768;
const GAME_HEIGHT = 576;

export default function ApartmentGameCanvas() {
  const gameRef = useRef<Phaser.Game | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;

    // Phaser game configuration
    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: 768,  // 48 tiles × 16px (displayed at 2× scale)
      height: 576, // 36 tiles × 16px (displayed at 2× scale)
      parent: containerRef.current,
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
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
    };

    // Create game instance
    gameRef.current = new Phaser.Game(config);

    // Cleanup on unmount
    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, []);

  return (
    <div
      style={{
        position: 'relative',
        width: '768px',
        margin: '0 auto',
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
          width: '768px',
          height: '576px',
          border: dragOver ? '2px dashed #4ade80' : '2px solid #333',
          borderRadius: '8px',
          overflow: 'hidden',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
        }}
      />
      <EnergyScoreOverlay />
    </div>
  );
}
