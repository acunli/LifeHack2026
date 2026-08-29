'use client'

/**
 * First run. The login screen takes a room number and password; this screen
 * takes the two things that are actually the resident's own — the name the
 * building sees on the leaderboard, and the character who lives in their flat.
 *
 * Both are written to localStorage as part of the session, so the choice
 * survives a reload without a backend. It is also shown to older sessions that
 * were created before either field existed.
 */

import { useState } from 'react'
import WattLahLogo from '@/components/WattLahLogo'
import { logout, setUsername } from '@/lib/session'
import { MASCOT_ORDER, type MascotName } from '@/data/mascotSprites'

/** One frame per facing; frame 3 (x=48) is front-facing — see AGENTS.md. */
const FRAME_W = 16
const FRAME_H = 32
const FRONT_COL = 3
const PICK_SCALE = 3

const SHEETS: Record<MascotName, string> = {
  Alex: '/assets/characters/Alex_idle_16x16.png',
  Adam: '/assets/characters/Adam_idle_16x16.png',
  Amelia: '/assets/characters/Amelia_idle_16x16.png',
  Bob: '/assets/characters/Bob_idle_16x16.png',
}

export function UsernameSetup() {
  const [username, setUsernameInput] = useState('')
  const [mascot, setMascot] = useState<MascotName>('Alex')
  const [error, setError] = useState<string | null>(null)

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    const u = username.trim()
    if (u.length < 2) {
      setError('Pick a username with at least 2 characters.')
      return
    }
    setError(null)
    setUsername(u, mascot)
  }

  return (
    <div className="mx-auto w-full max-w-sm">
      <div className="pixel-panel pixel-panel-gold p-6">
        <div className="mb-6 flex justify-center">
          <WattLahLogo className="text-[30px]" />
        </div>
        <h1 className="pixel mb-2 text-center text-[12px] text-foreground">
          Set up your resident
        </h1>
        <p className="pixel mb-5 text-center text-[9px] leading-relaxed text-muted-w">
          Pick who lives in your flat and the name the building sees on the
          leaderboard.
        </p>

        <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
          <label className="flex flex-col gap-2">
            <span className="pixel text-[10px] uppercase tracking-wide text-muted-w">
              Username
            </span>
            <input
              value={username}
              onChange={(e) => setUsernameInput(e.target.value)}
              autoComplete="nickname"
              maxLength={16}
              placeholder="WattWarden"
              className="pixel bg-deep px-3 py-2 text-[12px] text-foreground outline-none focus-visible:border-gold"
              style={{ borderWidth: 3, borderStyle: 'solid', borderColor: 'var(--border-w)' }}
            />
          </label>

          <fieldset className="flex flex-col gap-2 border-0 p-0">
            <legend className="pixel mb-2 text-[10px] uppercase tracking-wide text-muted-w">
              Character
            </legend>
            <div className="grid grid-cols-4 gap-2">
              {MASCOT_ORDER.map((name) => {
                const selected = name === mascot
                return (
                  <button
                    key={name}
                    type="button"
                    onClick={() => setMascot(name)}
                    aria-pressed={selected}
                    className="flex flex-col items-center gap-1 py-2 transition-colors"
                    style={{
                      borderWidth: 3,
                      borderStyle: 'solid',
                      borderColor: selected ? 'var(--gold)' : 'var(--border-w)',
                      background: selected ? 'rgba(255,200,102,0.12)' : 'var(--deep)',
                    }}
                  >
                    <span
                      aria-hidden
                      style={{
                        width: FRAME_W * PICK_SCALE,
                        height: FRAME_H * PICK_SCALE,
                        backgroundImage: `url("${SHEETS[name]}")`,
                        backgroundSize: `${64 * PICK_SCALE}px ${32 * PICK_SCALE}px`,
                        backgroundPosition: `${-FRONT_COL * FRAME_W * PICK_SCALE}px 0`,
                        backgroundRepeat: 'no-repeat',
                        imageRendering: 'pixelated',
                      }}
                    />
                    <span
                      className="pixel text-[8px]"
                      style={{ color: selected ? 'var(--gold)' : 'var(--muted-w)' }}
                    >
                      {name}
                    </span>
                  </button>
                )
              })}
            </div>
          </fieldset>

          {error && (
            <p role="alert" className="pixel text-[10px]" style={{ color: 'var(--neg)' }}>
              {error}
            </p>
          )}

          <button type="submit" className="pixel-btn mt-2 px-4 py-3 text-[11px]">
            Enter Your Flat
          </button>
        </form>

        <button
          type="button"
          onClick={logout}
          className="pixel mt-4 w-full text-center text-[9px] text-muted-w underline underline-offset-4 hover:text-foreground"
        >
          Sign out instead
        </button>
      </div>
    </div>
  )
}

export default UsernameSetup
