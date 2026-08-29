import type { CSSProperties } from "react";

/**
 * Sprite coordinates into the LimeZu sheets.
 *
 * ⚠️ Tile size: we use the 48×48 tier at 1× rather than the 32×32 tier README
 * §9.2 suggests. Same art, no runtime scaling, more detail. §9.2 itself calls
 * the tier "a single constant, not an architectural decision" — this is that
 * constant. Change TILE and the SHEET paths together or nothing lines up.
 *
 * All coordinates are in TILES, not pixels. toPx() converts.
 * Verify any coordinate at /dev/sheets, which draws the grid over the sheet.
 */

export const TILE = 48;

export const SHEETS = {
  room: "/assets/interior/48x48/Room_Builder_free_48x48.png",
  interiors: "/assets/interior/48x48/Interiors_free_48x48.png",
} as const;

export type SheetName = keyof typeof SHEETS;

/** Sheet dimensions in tiles — measured, see AGENTS.md. */
export const SHEET_TILES: Record<SheetName, { cols: number; rows: number }> = {
  room: { cols: 17, rows: 23 },
  interiors: { cols: 16, rows: 89 },
};

export interface Sprite {
  sheet: SheetName;
  /** Top-left cell, in tiles. */
  col: number;
  row: number;
  /** Size in tiles. */
  w: number;
  h: number;
}

/**
 * Floor materials. Confirmed by cropping the sheet: the right-hand block of
 * Room Builder holds five materials in two-row bands at cols 11-13.
 */
export const FLOORS = {
  brick: { sheet: "room", col: 11, row: 5, w: 1, h: 1 },
  cream: { sheet: "room", col: 11, row: 7, w: 1, h: 1 },
  teal: { sheet: "room", col: 11, row: 9, w: 1, h: 1 },
  grey: { sheet: "room", col: 11, row: 11, w: 1, h: 1 },
  herringbone: { sheet: "room", col: 11, row: 13, w: 1, h: 1 },
} as const satisfies Record<string, Sprite>;

/**
 * Furniture. These are ESTIMATES pending verification at /dev/sheets — the
 * objects on the interiors sheet do not all sit flush to the grid.
 * Lane B owns tightening these.
 */
export const FURNITURE = {
  rugGreen: { sheet: "interiors", col: 0, row: 5, w: 3, h: 2 },
  rugOlive: { sheet: "interiors", col: 3, row: 5, w: 3, h: 2 },
  sofa: { sheet: "interiors", col: 4, row: 10, w: 3, h: 2 },
  armchair: { sheet: "interiors", col: 2, row: 9, w: 2, h: 2 },
  bed: { sheet: "interiors", col: 7, row: 9, w: 2, h: 3 },
  wardrobe: { sheet: "interiors", col: 0, row: 9, w: 2, h: 3 },
  cabinet: { sheet: "interiors", col: 7, row: 12, w: 2, h: 2 },
  plantTall: { sheet: "interiors", col: 13, row: 7, w: 2, h: 2 },
  plantSmall: { sheet: "interiors", col: 12, row: 8, w: 1, h: 2 },
  table: { sheet: "interiors", col: 2, row: 1, w: 2, h: 2 },
} as const satisfies Record<string, Sprite>;

export const toPx = (tiles: number) => tiles * TILE;

/** Inline style that crops one sprite out of its sheet. */
export function spriteStyle(s: Sprite): CSSProperties {
  return {
    width: toPx(s.w),
    height: toPx(s.h),
    backgroundImage: `url("${SHEETS[s.sheet]}")`,
    backgroundPosition: `${-toPx(s.col)}px ${-toPx(s.row)}px`,
    backgroundRepeat: "no-repeat",
  };
}
