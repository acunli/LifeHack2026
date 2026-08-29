"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/useSession";
import LeaderboardBoard from "@/components/LeaderboardBoard";
import Footer from "@/components/Footer";
import UsernameSetup from "@/components/UsernameSetup";
import { MOCK_APARTMENT } from "@/data/mockApartment";
import { computeScore } from "@/lib/scoring";

/**
 * League route. Thin — LeaderboardBoard owns the data states and the layout.
 *
 * ⚠️ COPY IS PLACEHOLDER — Lane D owns these strings.
 */
export default function LeaderboardPage() {
  const router = useRouter();
  const session = useSession();

  useEffect(() => {
    if (session === null) router.replace("/");
  }, [session, router]);

  if (!session) return null;
  if (!session.username) return <UsernameSetup />;

  const score = computeScore(MOCK_APARTMENT).score;

  return (
    <main className="float-in mx-auto flex w-full max-w-2xl flex-1 flex-col gap-5 p-5 sm:p-7">
      <header className="pixel-panel flex flex-wrap items-center justify-between gap-4 px-5 py-4">
        <div>
          <p className="pixel text-[9px] uppercase tracking-widest text-ink-dim">
            Eco League · today
          </p>
          <h1 className="pixel mt-1.5 text-base text-amber">Your building</h1>
        </div>
        <Link
          href="/apartment"
          className="pixel pixel-btn-ghost px-4 py-2.5 text-[9px] uppercase tracking-widest"
        >
          Back home
        </Link>
      </header>

      <LeaderboardBoard
        roomNumber={session.roomNumber}
        score={score}
        handle={session.username}
      />

      <Footer />
    </main>
  );
}
