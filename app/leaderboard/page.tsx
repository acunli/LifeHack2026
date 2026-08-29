"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/useSession";
import LeaderboardBoard from "@/components/LeaderboardBoard";
import Footer from "@/components/Footer";
import UsernameSetup from "@/components/UsernameSetup";

/**
 * League route. Thin — LeaderboardBoard owns the data states and the layout.
 *
 * ⚠️ COPY IS PLACEHOLDER — Lane D owns these strings.
 */
export default function LeaderboardPage() {
  const router = useRouter();
  const { session, needsUsername, isAuthenticated } = useSession();

  useEffect(() => {
    if (isAuthenticated === false) router.replace("/");
  }, [isAuthenticated, router]);

  // Order matters: useSession returns session === null whenever a handle is
  // missing, so the needsUsername branch has to come first or a resident who
  // has just logged in gets a blank page instead of the handle prompt.
  if (needsUsername) return <UsernameSetup />;
  if (!session) return null;

  return (
    <main className="float-in mx-auto flex w-full max-w-2xl flex-1 flex-col gap-5 p-5 sm:p-7">
      <header className="pixel-panel flex flex-wrap items-center justify-between gap-4 px-5 py-4">
        <div>
          <p className="pixel text-[9px] uppercase tracking-widest text-ink-dim">
            Eco League · today
          </p>
          <h1 className="pixel mt-1.5 text-base text-amber">Your building</h1>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/room"
            className="pixel pixel-btn-ghost px-4 py-2.5 text-[9px] uppercase tracking-widest"
          >
            Room
          </Link>
          <Link
            href="/home"
            className="pixel pixel-btn px-4 py-2.5 text-[9px] uppercase tracking-widest"
          >
            Dashboard
          </Link>
        </div>
      </header>

      <LeaderboardBoard
        username={session.username}
        roomNumber={session.roomNumber}
      />

      <Footer />
    </main>
  );
}
