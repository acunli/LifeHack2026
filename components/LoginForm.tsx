"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { seedLegacySession } from "@/lib/session";
import Mascot from "@/components/Mascot";
import WattLahLogo from "@/components/WattLahLogo";

/**
 * Fake login (README §4). Any room number with a non-empty password succeeds.
 *
 * Design merged from the WattLah! v0 mock; the session and navigation are ours.
 * The mock pulled its sprite from a remote blob URL — we serve the real sheet
 * locally instead, so the demo does not depend on a network fetch.
 */

interface FieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  autoComplete?: string;
  invalid?: boolean;
}

function Field({
  id,
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  autoComplete = "off",
  invalid,
}: FieldProps) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-2 block text-[8px] uppercase tracking-[0.22em] text-ink-dim"
        style={{ fontFamily: "var(--font-pixel)" }}
      >
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        placeholder={placeholder}
        autoComplete={autoComplete}
        aria-invalid={invalid || undefined}
        onChange={(e) => onChange(e.target.value)}
        className="pixel-input w-full px-3.5 py-3 text-xs tracking-wider"
        style={{ fontFamily: "var(--font-pixel)" }}
      />
    </div>
  );
}

export default function LoginForm() {
  const router = useRouter();
  const [room, setRoom] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!room.trim() || !password.trim()) {
      setError("Enter room and password");
      return;
    }
    setError("");
    // Handle is chosen on the next screen, so seed a session without one.
    seedLegacySession(room.trim());
    router.push("/home");
  }

  return (
    <div className="relative w-full max-w-md">
      {/* Mascot stands on the card's top edge, feet on the border. */}
      <div className="absolute left-1/2 z-10 -translate-x-1/2" style={{ top: -116 }}>
        <Mascot scale={4} glow character="Alex" />
      </div>

      <section className="pixel-panel px-7 pb-7 pt-12">
        <header className="mb-7 text-center">
          <h1 className="flex justify-center text-[24px] leading-none sm:text-[27px]">
            <WattLahLogo />
          </h1>
          <p
            className="mt-3.5 text-[9px] leading-relaxed text-ink-dim"
            style={{ fontFamily: "var(--font-pixel)" }}
          >
            Save energy. Level up your block.
          </p>
        </header>

        <form onSubmit={handleSubmit} noValidate>
          <Field
            id="room"
            label="Room"
            value={room}
            onChange={(v) => {
              setRoom(v);
              if (error) setError("");
            }}
            placeholder="04-12"
            invalid={Boolean(error) && !room.trim()}
          />

          <div className="mt-4">
            <Field
              id="password"
              label="Password"
              type="password"
              value={password}
              onChange={(v) => {
                setPassword(v);
                if (error) setError("");
              }}
              placeholder="••••••"
              autoComplete="current-password"
              invalid={Boolean(error) && !password.trim()}
            />
          </div>

          {/* Reserved row so the card does not jump when the error appears. */}
          <div
            role="alert"
            className="my-3.5 flex min-h-5 items-center justify-center text-[8px] uppercase tracking-[0.06em] text-amber"
            style={{ fontFamily: "var(--font-pixel)" }}
          >
            {error}
          </div>

          <button
            type="submit"
            className="pixel-btn w-full px-4 py-3.5 text-xs uppercase tracking-[0.16em]"
            style={{ fontFamily: "var(--font-pixel)" }}
          >
            Enter Home
          </button>
        </form>
      </section>

      <p className="mt-6 text-center text-xs text-ink-dim/70">
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
