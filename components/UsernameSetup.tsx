'use client'

/**
 * Shown when a legacy session exists (logged in, but no username yet). Lets the
 * user attach a username without re-entering their room number.
 */

import { useState } from 'react'
import { WattLahLogo } from '@/components/WattLahLogo'
import { logout, setUsername } from '@/lib/session'

export function UsernameSetup() {
  const [username, setUsernameInput] = useState('')
  const [error, setError] = useState<string | null>(null)

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    const u = username.trim()
    if (u.length < 2) {
      setError('Pick a username with at least 2 characters.')
      return
    }
    setError(null)
    setUsername(u)
  }

  return (
    <div className="mx-auto w-full max-w-sm">
      <div className="pixel-panel pixel-panel-gold p-6">
        <div className="mb-6 flex justify-center">
          <WattLahLogo size={30} />
        </div>
        <h1 className="pixel mb-2 text-center text-[12px] text-foreground">
          Choose a username
        </h1>
        <p className="pixel mb-6 text-center text-[9px] leading-relaxed text-muted-w">
          Welcome back! We updated WattLah with public usernames. Pick one to
          appear on the leaderboard.
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

          {error && (
            <p role="alert" className="pixel text-[10px]" style={{ color: 'var(--neg)' }}>
              {error}
            </p>
          )}

          <button type="submit" className="pixel-btn mt-2 px-4 py-3 text-[11px]">
            Save Username
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
