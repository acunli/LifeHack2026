"use client";

import { useState, type FormEvent } from "react";
import { setUsername } from "@/lib/session";
import Mascot from "@/components/Mascot";

/**
 * Shown once, after login, when a session has no handle yet.
 *
 * Ported from the leaderboard mock. The point it makes is a good one: the
 * league shows public handles, so the resident should choose theirs rather
 * than appearing as "You" while everyone else has a name.
 *
 * ⚠️ COPY IS PLACEHOLDER — Lane D owns these strings.
 */
export default function UsernameSetup() {
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const handle = value.trim();
    if (handle.length < 2) {
      setError("Pick a handle with at least 2 characters");
      return;
    }
    setError(null);
    // Writing the session fires the same-tab event, so useSession re-reads and
    // this screen unmounts on its own.
    setUsername(handle);
  }

  return (
    <main className="flex flex-1 items-center justify-center p-6">
      <div className="relative w-full max-w-md">
        <div className="absolute left-1/2 z-10 -translate-x-1/2" style={{ top: -116 }}>
          <Mascot scale={4} glow props_={false} />
        </div>

        <div className="pixel-panel px-7 pb-7 pt-12">
          <h1 className="pixel text-center text-[13px] text-amber">
            Pick your handle
          </h1>
          <p className="pixel mt-3 text-center text-[9px] leading-relaxed text-ink-dim">
            This is what your block sees on the league. Your unit number stays
            private.
          </p>

          <form onSubmit={onSubmit} noValidate className="mt-7">
            <label
              htmlFor="handle"
              className="pixel mb-2 block text-[8px] uppercase tracking-[0.22em] text-ink-dim"
            >
              Handle
            </label>
            <input
              id="handle"
              value={value}
              onChange={(e) => {
                setValue(e.target.value);
                if (error) setError(null);
              }}
              maxLength={16}
              autoComplete="nickname"
              placeholder="WattWarden"
              aria-invalid={error ? true : undefined}
              className="pixel pixel-input w-full px-3.5 py-3 text-xs"
            />

            <p
              role="alert"
              className="pixel my-3.5 flex min-h-5 items-center justify-center text-[8px] uppercase tracking-widest"
              style={{ color: "var(--red)" }}
            >
              {error}
            </p>

            <button
              type="submit"
              className="pixel pixel-btn w-full px-4 py-3.5 text-xs uppercase tracking-[0.16em]"
            >
              Join the league
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
