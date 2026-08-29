"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { setSession } from "@/lib/session";

/**
 * Fake login (README §4). Any non-empty room number succeeds.
 *
 * ⚠️ COPY IS PLACEHOLDER — belongs to Lane D, arrives in docs/copy.md.
 */
export default function LoginForm() {
  const router = useRouter();
  const [roomNumber, setRoomNumber] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const trimmed = roomNumber.trim();
    if (!trimmed) {
      setError("Enter your room number");
      return;
    }
    setSession(trimmed);
    router.push("/apartment");
  }

  return (
    <div className="float-in flex w-full max-w-md flex-col items-center">
      {/* Character stands on top of the panel, as if on a ledge. */}
      <div className="sprite-idle pixelated -mb-2 translate-x-1" aria-hidden />

      <form onSubmit={handleSubmit} noValidate className="pixel-panel w-full p-7">
        <h1
          className="text-center text-[22px] leading-relaxed text-amber"
          style={{ fontFamily: "var(--font-pixel)" }}
        >
          WattWise
        </h1>
        <p className="mt-3 text-center text-sm text-ink-dim">
          Your home. Your energy.
        </p>

        <label
          htmlFor="room"
          className="mt-7 block text-[10px] uppercase tracking-widest text-ink-dim"
          style={{ fontFamily: "var(--font-pixel)" }}
        >
          Room
        </label>
        <input
          id="room"
          value={roomNumber}
          onChange={(e) => {
            setRoomNumber(e.target.value);
            if (error) setError(null);
          }}
          placeholder="04-12"
          autoComplete="off"
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? "room-error" : undefined}
          className="pixel-input mt-2 w-full px-3 py-2.5 text-sm tracking-wider"
        />

        <label
          htmlFor="password"
          className="mt-5 block text-[10px] uppercase tracking-widest text-ink-dim"
          style={{ fontFamily: "var(--font-pixel)" }}
        >
          Password
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          autoComplete="off"
          className="pixel-input mt-2 w-full px-3 py-2.5 text-sm tracking-wider"
        />

        {/* Reserved row so the panel does not jump when the error appears. */}
        <p
          id="room-error"
          role="alert"
          className="mt-4 min-h-[18px] text-center text-[10px] uppercase tracking-widest text-bad"
          style={{ fontFamily: "var(--font-pixel)" }}
        >
          {error}
        </p>

        <button
          type="submit"
          className="pixel-btn mt-1 w-full px-4 py-3.5 text-[11px] uppercase tracking-widest"
          style={{ fontFamily: "var(--font-pixel)" }}
        >
          Enter Home
        </button>
      </form>

      <p className="mt-6 text-center text-xs text-ink-dim/70">
        Demo build — any room number works.
        <br />
        Pixel art by{" "}
        <a
          href="https://limezu.itch.io/moderninteriors"
          target="_blank"
          rel="noreferrer"
          className="underline underline-offset-2 hover:text-ink"
        >
          LimeZu — Modern Interiors
        </a>
      </p>
    </div>
  );
}
