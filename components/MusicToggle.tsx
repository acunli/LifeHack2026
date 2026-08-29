"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Background music toggle.
 *
 * Lives in the root layout rather than a page, so the track keeps playing
 * across navigation — otherwise it would restart every time you moved between
 * the dashboard and the league.
 *
 * Off by default and started only by a click: browsers block autoplay with
 * sound, and a demo should not open with audio nobody asked for.
 */

const PREF_KEY = "wattlah.music";
const VOLUME = 0.35; // a sub-bassline at full volume is overbearing

export default function MusicToggle() {
  const [playing, setPlaying] = useState(false);
  const [ready, setReady] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Mount-only: the button renders nothing on the server, so the markup cannot
  // disagree between passes.
  useEffect(() => {
    const id = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    return () => {
      audioRef.current?.pause();
      audioRef.current = null;
    };
  }, []);

  function toggle() {
    if (!audioRef.current) {
      const audio = new Audio("/audio/theme.m4a");
      audio.loop = true;
      audio.volume = VOLUME;
      audioRef.current = audio;
    }
    const audio = audioRef.current;

    if (playing) {
      audio.pause();
      setPlaying(false);
      try {
        window.localStorage.setItem(PREF_KEY, "off");
      } catch {
        /* storage can be blocked */
      }
      return;
    }

    // play() rejects if the gesture is not trusted; fall back to off rather
    // than showing a playing state that is silent.
    audio
      .play()
      .then(() => {
        setPlaying(true);
        try {
          window.localStorage.setItem(PREF_KEY, "on");
        } catch {
          /* storage can be blocked */
        }
      })
      .catch(() => setPlaying(false));
  }

  if (!ready) return null;

  return (
    <button
      onClick={toggle}
      aria-pressed={playing}
      aria-label={playing ? "Mute music" : "Play music"}
      title={playing ? "Mute music" : "Play music"}
      className="pixel pixel-btn-ghost"
      style={{
        position: "fixed",
        right: 14,
        bottom: 14,
        zIndex: 900,
        padding: "9px 12px",
        fontSize: 12,
        lineHeight: 1,
      }}
    >
      {playing ? "♪" : "♪̸"}
    </button>
  );
}
