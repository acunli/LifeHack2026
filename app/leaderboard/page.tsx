"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/useSession";
import { isLoggedIn } from "@/lib/session";
import LeaderboardBoard from "@/components/LeaderboardBoard";
import Footer from "@/components/Footer";
import UsernameSetup from "@/components/UsernameSetup";
import WattLahLogo from "@/components/WattLahLogo";
import { logout } from "@/lib/session";

/**
 * League route. Thin — LeaderboardBoard owns the data states and the layout.
 *
 * ⚠️ COPY IS PLACEHOLDER — Lane D owns these strings.
 */
export default function LeaderboardPage() {
  const router = useRouter();
  const { session, needsUsername, isAuthenticated } = useSession();

  // Read storage directly: useSession's server snapshot is empty, so
  // isAuthenticated is false on the first committed render even when signed
  // in, and redirecting on it bounces the resident to login on every refresh.
  useEffect(() => {
    if (!isLoggedIn()) router.replace("/");
  }, [isAuthenticated, router]);

  // Order matters: useSession returns session === null whenever a handle is
  // missing, so the needsUsername branch has to come first or a resident who
  // has just logged in gets a blank page instead of the handle prompt.
  if (needsUsername) return <UsernameSetup />;
  if (!session) return null;

  return (
    <main className="float-in mx-auto flex w-full max-w-2xl flex-1 flex-col gap-5 p-5 sm:p-7">
      <header className="pixel-panel px-5 py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-col items-center">
            <WattLahLogo className="text-[22px] sm:text-[25px]" />
            <p className="pixel mt-2 text-[9px] uppercase tracking-widest text-ink-dim">
              Eco league · current period
            </p>
            <h1 className="pixel mt-1 text-base text-amber">Your building</h1>
          </div>
          <nav aria-label="League navigation" className="flex items-center gap-3">
            <Link
              href="/home"
              className="pixel pixel-btn px-4 py-2.5 text-[9px] uppercase tracking-widest"
            >
              Home
            </Link>
            <button
              type="button"
              onClick={logout}
              className="pixel text-[9px] text-ink-dim underline underline-offset-4 hover:text-ink"
            >
              Sign out
            </button>
          </nav>
        </div>
      </header>

      <LeaderboardBoard
        username={session.username}
        roomNumber={session.roomNumber}
        mascot={session.mascot}
      />

      <Footer />
    </main>
  );
}
