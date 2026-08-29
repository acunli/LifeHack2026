import type { CSSProperties } from "react";

/**
 * SPRITE LAYER — the seam between the game scene and the art pack.
 *
 * The LimeZu "Modern Interiors" sheets are not on disk yet, so every sprite
 * currently renders as a styled glyph. When the PNGs land:
 *
 *   1. Drop them in public/assets/
 *   2. Measure them, do NOT guess:
 *        sips -g pixelWidth -g pixelHeight public/assets/<file>.png
 *   3. Set TILE_SOURCE_PX to the measured tile size and fill in ATLAS
 *   4. Flip ART_MODE to "sprites"
 *
 * Nothing outside this file needs to change. Feature code only ever asks for
 * "the microwave sprite" and gets back something renderable.
 */

export type ArtMode = "placeholder" | "sprites";

export const ART_MODE: ArtMode = "placeholder";

/**
 * Source tile size in the art pack, in pixels. UNVERIFIED until the sheets
 * are measured. A file named `*_48x48.png` is most likely already 48px per
 * tile and wants DISPLAY_SCALE 1, not 3.
 */
export const TILE_SOURCE_PX = 48;

/** On-screen upscale. Keep integer, or the pixel art will shimmer. */
export const DISPLAY_SCALE = 1;

/** Final on-screen size of one tile. Everything in the scene derives from this. */
export const TILE_PX = TILE_SOURCE_PX * DISPLAY_SCALE;

/**
 * Known trap: the room sheets and the character sheet may come from different
 * scale variants of the pack (48x48 rooms vs a 16x16 Adam). If so the
 * character needs its own multiplier to sit correctly in the scene.
 */
export const CHARACTER_SOURCE_PX = 16;
export const CHARACTER_SCALE = TILE_PX / CHARACTER_SOURCE_PX;

/** Sub-rect of a sheet, in source pixels. Populated once sheets are measured. */
export type AtlasEntry = {
  sheet: string;
  sx: number;
  sy: number;
  sw: number;
  sh: number;
};

export const ATLAS: Record<string, AtlasEntry> = {
  // e.g. microwave: { sheet: "/assets/interiors.png", sx: 96, sy: 240, sw: 48, sh: 48 },
};

/** Tile units -> pixels. The one place this conversion happens. */
export function toPx(tiles: number): number {
  return tiles * TILE_PX;
}

/** CSS for crisp upscaled pixel art. */
export const PIXELATED: CSSProperties = {
  imageRendering: "pixelated",
};
