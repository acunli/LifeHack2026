"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { clearSession, getSession } from "@/lib/session";

/**
 * INTEGRATION SHELL — deliberately minimal (README §15.7).
 *
 * The two slots below are where B's <ApartmentRoom /> and C's
 * <EnergyDashboard /> drop in. Do not build the room or the HUD in this file.
 */
export default function ApartmentPage() {
  const router = useRouter();
  const [roomNumber, setRoomNumber] = useState<string | null>(null);

  // localStorage does not exist during SSR — read after mount, never in render.
  useEffect(() => {
    const session = getSession();
    if (!session) {
      router.replace("/");
      return;
    }
    setRoomNumber(session.roomNumber);
  }, [router]);

  if (!roomNumber) return null;

  function handleLogout() {
    clearSession();
    router.replace("/");
  }

  return (
    <main className="float-in mx-auto flex w-full max-w-6xl flex-1 flex-col gap-5 p-5 sm:p-7">
      <header className="pixel-panel flex items-center justify-between gap-4 px-5 py-4">
        <div className="flex items-center gap-4">
          <div className="sprite-idle pixelated shrink-0" aria-hidden />
          <div>
            <p className="text-[9px] uppercase tracking-widest text-ink-dim">
              Welcome home
            </p>
            <h1
              className="mt-1.5 text-base text-amber"
              style={{ fontFamily: "var(--font-pixel)" }}
            >
              Room {roomNumber}
            </h1>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="pixel-btn-ghost px-4 py-2.5 text-[9px] uppercase tracking-widest"
          style={{ fontFamily: "var(--font-pixel)" }}
        >
          Log out
        </button>
      </header>

      <div className="flex flex-1 flex-col gap-5 lg:flex-row">
        {/* Lane B — <ApartmentRoom /> */}
        <section className="pixel-panel flex min-h-[22rem] flex-1 items-center justify-center">
          <p
            className="text-[10px] uppercase tracking-widest text-ink-dim/60"
            style={{ fontFamily: "var(--font-pixel)" }}
          >
            Lane B — apartment
          </p>
        </section>

        {/* Lane C — <EnergyDashboard /> */}
        <section className="pixel-panel flex min-h-[22rem] items-center justify-center lg:w-80">
          <p
            className="text-[10px] uppercase tracking-widest text-ink-dim/60"
            style={{ fontFamily: "var(--font-pixel)" }}
          >
            Lane C — HUD
          </p>
        </section>
      </div>
    </main>
  );
}
