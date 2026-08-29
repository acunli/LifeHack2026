"use client";

import { useState } from "react";
import {
  SHEETS,
  SHEET_TILES,
  TILE,
  type SheetName,
} from "@/data/spriteMap";

/**
 * DEV TOOL — README §9.6, task 7.
 *
 * Draws a numbered grid over each sprite sheet so coordinates can be read off
 * directly instead of guessed. Objects on the interiors sheet do not all sit
 * flush to the grid, which is why eyeballing them fails.
 *
 * Hover a cell to see its col/row; click to copy `{ col, row }`.
 * Not linked from the app. Delete before submission if you like — it costs
 * nothing to leave, since nothing links here.
 */
export default function SheetInspector() {
  const [sheet, setSheet] = useState<SheetName>("interiors");
  const [hover, setHover] = useState<{ col: number; row: number } | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [showGrid, setShowGrid] = useState(true);

  const { cols, rows } = SHEET_TILES[sheet];

  function copy(col: number, row: number) {
    const text = `{ sheet: "${sheet}", col: ${col}, row: ${row}, w: 1, h: 1 }`;
    navigator.clipboard?.writeText(text).catch(() => {});
    setCopied(text);
  }

  return (
    <main className="min-h-screen p-6 font-mono text-sm">
      <div className="sticky top-0 z-10 mb-4 flex flex-wrap items-center gap-3 bg-bg/95 py-3">
        {(Object.keys(SHEETS) as SheetName[]).map((name) => (
          <button
            key={name}
            onClick={() => setSheet(name)}
            className={`px-3 py-1.5 ${
              sheet === name ? "pixel-btn" : "pixel-btn-ghost"
            }`}
          >
            {name}
          </button>
        ))}

        <button
          onClick={() => setShowGrid((g) => !g)}
          className="pixel-btn-ghost px-3 py-1.5"
        >
          grid: {showGrid ? "on" : "off"}
        </button>

        <span className="text-ink-dim">
          {cols}×{rows} tiles @ {TILE}px
        </span>

        <span className="text-amber">
          {hover ? `col ${hover.col}, row ${hover.row}` : "hover a cell"}
        </span>

        {copied && (
          <span className="text-good">copied: {copied}</span>
        )}
      </div>

      <div
        className="relative"
        style={{ width: cols * TILE, height: rows * TILE }}
        onMouseLeave={() => setHover(null)}
      >
        {/* next/image re-encodes and blurs pixel art — AGENTS.md forbids it here. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={SHEETS[sheet]}
          alt={sheet}
          className="pixelated absolute inset-0"
          style={{ width: cols * TILE, height: rows * TILE }}
        />

        {showGrid && (
          <div
            className="absolute inset-0 grid"
            style={{
              gridTemplateColumns: `repeat(${cols}, ${TILE}px)`,
              gridTemplateRows: `repeat(${rows}, ${TILE}px)`,
            }}
          >
            {Array.from({ length: cols * rows }, (_, i) => {
              const col = i % cols;
              const row = Math.floor(i / cols);
              const isHover = hover?.col === col && hover?.row === row;
              return (
                <button
                  key={i}
                  onMouseEnter={() => setHover({ col, row })}
                  onClick={() => copy(col, row)}
                  className={`border text-[8px] leading-none ${
                    isHover
                      ? "border-amber bg-amber/30"
                      : "border-amber/15 hover:bg-amber/10"
                  }`}
                  title={`col ${col}, row ${row}`}
                >
                  {/* Label every 5th cell so the grid stays readable. */}
                  {col % 5 === 0 && row % 5 === 0 ? (
                    <span className="text-amber/70">
                      {col},{row}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
