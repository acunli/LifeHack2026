/**
 * Interactive Apartment Page
 *
 * NEW implementation - completely separate from the existing static apartment.
 * This route contains the Phaser-based interactive energy management game.
 */

'use client';

import dynamic from 'next/dynamic';
import { Fragment, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useSession } from '@/lib/useSession'
import { isLoggedIn } from '@/lib/session'
import UsernameSetup from '@/components/UsernameSetup'

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
  const router = useRouter()
  const { session, needsUsername } = useSession()

  // Read storage directly: useSession's server snapshot is empty, so
  // isAuthenticated is false on the first committed render even when signed in.
  useEffect(() => {
    if (!isLoggedIn()) router.replace('/')
  }, [router])

  if (needsUsername) return <UsernameSetup />
  if (!session) return null

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
      <nav
        style={{
          display: 'flex',
          gap: 10,
          justifyContent: 'center',
          padding: '0 0 20px',
        }}
      >
        <Link
          href="/home"
          className="pixel pixel-btn-ghost"
          style={{ padding: '10px 16px', fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.16em' }}
        >
          Dashboard
        </Link>
        <Link
          href="/leaderboard"
          className="pixel pixel-btn-ghost"
          style={{ padding: '10px 16px', fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.16em' }}
        >
          League
        </Link>
      </nav>
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
          Your Apartment
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

      <Fragment key={session.roomNumber}>
        {/* Game Canvas */}
        <ApartmentGameCanvas />

        {/* Interaction prompt (shows near an empty socket) */}
        <InteractionPrompt />

        {/* Drag one of these onto the room to add a custom appliance */}
        <AppliancePalette />

        {/* Modals: scan an appliance at a socket/placeholder, or inspect one that's connected */}
        <ApplianceSelector />
        <AppliancePanel />
      </Fragment>

      {/* Controls */}
      <div
        style={{
          marginTop: '1rem',
          color: '#666',
          fontSize: '0.75rem',
          textAlign: 'center',
        }}
      >
        WASD/Arrow Keys - Move · E - Scan at a socket · Click an appliance to scan/inspect it
        <br />
        Drag an appliance from above onto the room to add it anywhere
      </div>
    </div>
  );
}
