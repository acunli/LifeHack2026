/**
 * Interactive Apartment Page
 *
 * NEW implementation - completely separate from the existing static apartment.
 * This route contains the Phaser-based interactive energy management game.
 */

'use client';

import dynamic from 'next/dynamic';

// Dynamically import Phaser component (client-side only, no SSR)
const ApartmentGameCanvas = dynamic(
  () => import('@/components/apartment-game/ApartmentGameCanvas'),
  { ssr: false }
);

const InteractionPrompt = dynamic(
  () => import('@/components/apartment-game/InteractionPrompt'),
  { ssr: false }
);

const ApplianceSelector = dynamic(
  () => import('@/components/apartment-game/ApplianceSelector'),
  { ssr: false }
);

const AppliancePanel = dynamic(
  () => import('@/components/apartment-game/AppliancePanel'),
  { ssr: false }
);

const AppliancePalette = dynamic(
  () => import('@/components/apartment-game/AppliancePalette'),
  { ssr: false }
);

export default function InteractiveApartmentPage() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#1a1a1a',
        padding: '2rem',
      }}
    >
      {/* Header */}
      <div
        style={{
          marginBottom: '1.5rem',
          textAlign: 'center',
          color: '#fff',
        }}
      >
        <h1
          style={{
            fontSize: '2rem',
            fontWeight: 'bold',
            marginBottom: '0.5rem',
          }}
        >
          WattWise Interactive Apartment
        </h1>
        <p
          style={{
            fontSize: '1rem',
            color: '#888',
          }}
        >
          Manage your energy consumption through interactive gameplay
        </p>
      </div>

      {/* Game Canvas */}
      <ApartmentGameCanvas />

      {/* Interaction prompt (shows near an empty socket) */}
      <InteractionPrompt />

      {/* Drag one of these onto the room to add a custom appliance */}
      <AppliancePalette />

      {/* Modals: install an appliance at a socket/placeholder, or inspect one that's installed */}
      <ApplianceSelector />
      <AppliancePanel />

      {/* Controls */}
      <div
        style={{
          marginTop: '1rem',
          color: '#666',
          fontSize: '0.75rem',
          textAlign: 'center',
        }}
      >
        WASD/Arrow Keys - Move · E - Install at a socket · Click an appliance to install/inspect it
        <br />
        Drag an appliance from above onto the room to add it anywhere
      </div>
    </div>
  );
}
