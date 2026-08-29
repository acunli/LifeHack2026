"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { clearSession } from "@/lib/session";
import { useSession } from "@/lib/useSession";
import ApartmentRoom, { type HeatZone } from "@/components/ApartmentRoom";
import EnergyDashboard from "@/components/EnergyDashboard";
import Mascot from "@/components/Mascot";
import { APPLIANCES, applianceLoad, applianceScore } from "@/data/appliances";
import { MOCK_APARTMENT } from "@/data/mockApartment";
import { computeScore } from "@/lib/scoring";

/**
 * INTEGRATION SHELL — keep it thin (README §15.7). It composes; it does not
 * build. The room, the HUD and the dashboard each own their own rendering.
 */
export default function ApartmentPage() {
  const router = useRouter();
  const session = useSession();
  const [hovered, setHovered] = useState<HeatZone | null>(null);

  // Derived, not synchronised: the dashboard is open whenever a session has
  // resolved and the resident has not dismissed it. Expressing it this way
  // means no effect, so it cannot fire on the pre-hydration frame and cannot
  // cascade a render.
  const [dismissed, setDismissed] = useState(false);
  const showDashboard = Boolean(session) && !dismissed;

  useEffect(() => {
    if (session === null) router.replace("/");
  }, [session, router]);

  // One array, three surfaces: the heatmap, the hover readout, the dashboard.
  const heat: HeatZone[] = useMemo(
    () =>
      APPLIANCES.map((a) => ({
        id: a.id,
        label: `${a.icon} ${a.name}`,
        col: a.col,
        row: a.row,
        radius: a.radius,
        load: applianceLoad(a),
      })),
    [],
  );

  if (!session) return null;

  const result = computeScore(MOCK_APARTMENT);
  const hoveredAppliance = hovered
    ? APPLIANCES.find((a) => a.id === hovered.id)
    : null;

  function handleLogout() {
    clearSession();
    router.replace("/");
  }

  return (
    <main className="float-in mx-auto flex w-full max-w-6xl flex-1 flex-col gap-5 p-5 sm:p-7">
      <header className="pixel-panel flex flex-wrap items-center justify-between gap-4 px-5 py-4">
        <div className="flex items-center gap-4">
          <Mascot scale={2} />
          <div>
            <p className="text-[9px] uppercase tracking-widest text-ink-dim">
              Welcome home
            </p>
            <h1
              className="mt-1.5 text-base text-amber"
              style={{ fontFamily: "var(--font-pixel)" }}
            >
              Room {session.roomNumber}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setDismissed(false)}
            className="pixel-btn px-4 py-2.5 text-[9px] uppercase tracking-widest"
            style={{ fontFamily: "var(--font-pixel)" }}
          >
            Score {result.score}
          </button>
          <Link
            href="/leaderboard"
            className="pixel-btn-ghost px-4 py-2.5 text-[9px] uppercase tracking-widest"
            style={{ fontFamily: "var(--font-pixel)" }}
          >
            League
          </Link>
          <button
            onClick={handleLogout}
            className="pixel-btn-ghost px-4 py-2.5 text-[9px] uppercase tracking-widest"
            style={{ fontFamily: "var(--font-pixel)" }}
          >
            Log out
          </button>
        </div>
      </header>

      <section className="pixel-panel flex flex-col items-center gap-4 p-5">
        <ApartmentRoom heat={heat} onZoneHover={setHovered} />

        {/* Readout swaps to the hovered appliance, falls back to the legend. */}
        <div className="flex min-h-10 w-full max-w-xl items-center justify-center">
          {hoveredAppliance ? (
            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-center">
              <span className="text-sm">
                <span aria-hidden>{hoveredAppliance.icon}</span>{" "}
                <strong>{hoveredAppliance.name}</strong>
              </span>
              <span className="text-sm tabular-nums text-ink-dim">
                {hoveredAppliance.kwh} kWh
              </span>
              <span
                className="text-[10px] uppercase tracking-widest"
                style={{
                  fontFamily: "var(--font-pixel)",
                  color:
                    applianceScore(hoveredAppliance) >= 85
                      ? "var(--green)"
                      : applianceScore(hoveredAppliance) >= 60
                        ? "var(--amber)"
                        : "var(--red)",
                }}
              >
                {applianceScore(hoveredAppliance)}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-3 text-[9px] uppercase tracking-widest text-ink-dim/70">
              <span>Low draw</span>
              <span
                className="h-2.5 w-40"
                style={{
                  background:
                    "linear-gradient(90deg, rgb(110,231,168), rgb(255,200,102), rgb(255,110,90))",
                }}
              />
              <span>High draw</span>
              <span className="ml-2 normal-case">hover a glow</span>
            </div>
          )}
        </div>
      </section>

      {showDashboard && (
        <EnergyDashboard onClose={() => setDismissed(true)} />
      )}
    </main>
  );
}
