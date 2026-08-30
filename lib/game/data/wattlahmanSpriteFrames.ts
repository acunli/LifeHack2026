/**
 * WattLahMan sprite frame data — from `2D Character Pack.v01`.
 *
 * The sheets in that pack are tightly-trimmed, variable-width frames (not a
 * uniform grid), and ship with no atlas/JSON alongside them. The frame rects
 * below were measured directly off each PNG by scanning for fully-transparent
 * gutter columns between characters — see the sheets in
 * `public/game-assets/wattlahman/`. Do not assume a fixed frame width if a
 * sheet is ever replaced; re-measure it.
 */

export type WattlahmanFacing = 'front' | 'back' | 'left' | 'right';
export type WattlahmanPose = 'idle' | 'walk';

export interface WattlahmanFrameRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface WattlahmanSheet {
  /** Phaser texture key this sheet is loaded under. */
  key: string;
  /** Path under /public. */
  path: string;
  frames: WattlahmanFrameRect[];
}

function sheet(key: string, path: string, height: number, spans: [number, number][]): WattlahmanSheet {
  return {
    key,
    path,
    frames: spans.map(([x0, x1]) => ({ x: x0, y: 0, width: x1 - x0, height })),
  };
}

export const WATTLAHMAN_SHEETS: Record<WattlahmanFacing, Record<WattlahmanPose, WattlahmanSheet>> = {
  front: {
    idle: sheet('wattlahman_front_idle', '/game-assets/wattlahman/front_idle.png', 18, [
      [0, 14], [32, 46], [65, 77], [96, 110],
    ]),
    walk: sheet('wattlahman_front_walk', '/game-assets/wattlahman/front_walk.png', 18, [
      [0, 14], [33, 45], [65, 77], [97, 109], [128, 142], [160, 173], [193, 205], [225, 237],
    ]),
  },
  back: {
    idle: sheet('wattlahman_back_idle', '/game-assets/wattlahman/back_idle.png', 18, [
      [1, 15], [17, 31], [34, 46], [49, 63], [65, 79], [81, 95],
    ]),
    walk: sheet('wattlahman_back_walk', '/game-assets/wattlahman/back_walk.png', 18, [
      [1, 15], [18, 31], [34, 46], [50, 62], [65, 79], [82, 94], [98, 110], [114, 126],
    ]),
  },
  left: {
    idle: sheet('wattlahman_left_idle', '/game-assets/wattlahman/left_idle.png', 17, [
      [3, 17], [21, 34], [39, 52], [57, 71],
    ]),
    walk: sheet('wattlahman_left_walk', '/game-assets/wattlahman/left_walk.png', 17, [
      [3, 16], [21, 34], [38, 51], [56, 69], [74, 87], [92, 105], [111, 124], [129, 143],
    ]),
  },
  right: {
    idle: sheet('wattlahman_right_idle', '/game-assets/wattlahman/right_idle.png', 17, [
      [1, 15], [20, 33], [38, 51], [55, 69],
    ]),
    walk: sheet('wattlahman_right_walk', '/game-assets/wattlahman/right_walk.png', 17, [
      [1, 15], [20, 33], [39, 52], [57, 70], [75, 88], [93, 106], [110, 123], [128, 141],
    ]),
  },
};

export const WATTLAHMAN_ALL_SHEETS: WattlahmanSheet[] = Object.values(WATTLAHMAN_SHEETS).flatMap(
  byPose => Object.values(byPose),
);

/** Integer-only, per AGENTS.md's pixel-art rule (1x/2x/3x, never fractional). */
export const WATTLAHMAN_SCALE = 3;
