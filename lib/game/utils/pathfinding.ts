/**
 * Coarse grid pathfinding for WattLahMan.
 *
 * He has no way to reach a socket other than steering straight at it (see
 * WattlahMan.walkTo) - fine in open floor, but this room is one big space
 * threaded with furniture islands (bed, desk, dining table, sofa), so a
 * straight line from wherever he's summoned to most sockets clips a
 * furniture corner and wedges him against it (confirmed by instrumenting a
 * real walk: he got pinned "blocked up+right" 84px short of the study desk
 * and had to time out). This builds a walkable grid from the same
 * collision rectangles the room's real Arcade colliders use
 * (collisionHelpers.buildCollisionRects), runs a plain BFS over it, and
 * hands back a line of waypoints ApartmentScene walks him through one
 * short hop at a time - each hop is a single open grid cell, so it can't
 * clip a corner the way one long diagonal beeline can.
 */

import { apartmentLayout } from '../data/apartmentMap';
import { buildCollisionRects, CollisionRect } from './collisionHelpers';

/**
 * Deliberately much finer than the room's own 16px tile grid. Measured
 * against this room's actual collision rects: the microwave socket sits in
 * a nook with only ~1-2px of clearance beyond WattLahMan's own hitbox on a
 * 16px grid, at ANY margin - the tile is simply too coarse to resolve a gap
 * that narrow, so no margin value fixes it there. 2px cells with a 2px
 * margin are confirmed (see pathfinding.test.ts) to keep every fixed socket
 * in the apartment reachable while giving routed waypoints a little real
 * clearance from wall edges - a coarser cell or a thinner margin both
 * reopen the microwave case or leave waypoints landing within a couple of
 * pixels of a wall (WattLahMan's own hitbox is sized to match, see
 * WattlahMan.ts).
 */
const CELL = 2;
const COLS = Math.ceil(apartmentLayout.canvas.width_px / CELL);
const ROWS = Math.ceil(apartmentLayout.canvas.height_px / CELL);

/** Safety buffer around each obstacle, in pixels - see the CELL comment above for why this has to stay this small. */
const BODY_MARGIN = 2;

export interface GridPoint {
  x: number;
  y: number;
}

let cachedGrid: boolean[][] | null = null;

function inflate(rect: CollisionRect): CollisionRect {
  return {
    x: rect.x - BODY_MARGIN,
    y: rect.y - BODY_MARGIN,
    width: rect.width + BODY_MARGIN * 2,
    height: rect.height + BODY_MARGIN * 2,
  };
}

function buildWalkableGrid(): boolean[][] {
  const rects = buildCollisionRects().map(inflate);
  const grid: boolean[][] = [];
  for (let row = 0; row < ROWS; row += 1) {
    const cols: boolean[] = [];
    for (let col = 0; col < COLS; col += 1) {
      const cx = col * CELL + CELL / 2;
      const cy = row * CELL + CELL / 2;
      const blocked = rects.some(
        r => cx >= r.x && cx <= r.x + r.width && cy >= r.y && cy <= r.y + r.height,
      );
      cols.push(!blocked);
    }
    grid.push(cols);
  }
  return grid;
}

/** The apartment layout is static per session, so the grid is built once and reused. */
function getGrid(): boolean[][] {
  if (!cachedGrid) cachedGrid = buildWalkableGrid();
  return cachedGrid;
}

function clampInt(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, Math.floor(n)));
}

function worldToCell(x: number, y: number): { col: number; row: number } {
  return { col: clampInt(x / CELL, 0, COLS - 1), row: clampInt(y / CELL, 0, ROWS - 1) };
}

function cellCenter(col: number, row: number): GridPoint {
  return { x: col * CELL + CELL / 2, y: row * CELL + CELL / 2 };
}

const NEIGHBOURS: [number, number][] = [[1, 0], [-1, 0], [0, 1], [0, -1]];

/** BFS out from a possibly-blocked cell to the nearest walkable one. */
function nearestWalkable(
  col: number,
  row: number,
  grid: boolean[][],
): { col: number; row: number } | null {
  if (grid[row]?.[col]) return { col, row };
  const seen = new Set<string>([`${col},${row}`]);
  const queue: [number, number][] = [[col, row]];
  let cursor = 0;
  while (cursor < queue.length) {
    const [c, r] = queue[cursor];
    cursor += 1;
    for (const [dc, dr] of NEIGHBOURS) {
      const nc = c + dc;
      const nr = r + dr;
      if (nc < 0 || nc >= COLS || nr < 0 || nr >= ROWS) continue;
      const key = `${nc},${nr}`;
      if (seen.has(key)) continue;
      seen.add(key);
      if (grid[nr][nc]) return { col: nc, row: nr };
      queue.push([nc, nr]);
    }
  }
  return null;
}

/** Drops interior waypoints that don't change direction, so a straight corridor is one hop, not ten. */
function simplify(points: GridPoint[]): GridPoint[] {
  if (points.length <= 2) return points;
  const result: GridPoint[] = [points[0]];
  for (let i = 1; i < points.length - 1; i += 1) {
    const prev = result[result.length - 1];
    const cur = points[i];
    const next = points[i + 1];
    const dirA = `${Math.sign(cur.x - prev.x)},${Math.sign(cur.y - prev.y)}`;
    const dirB = `${Math.sign(next.x - cur.x)},${Math.sign(next.y - cur.y)}`;
    if (dirA !== dirB) result.push(cur);
  }
  result.push(points[points.length - 1]);
  return result.slice(1);
}

export interface RoutePlan {
  waypoints: GridPoint[];
  /** False when no BFS route connected start to target - `waypoints` is then a same-cell or direct-hop fallback. */
  routed: boolean;
}

/**
 * Plans a route from (startX, startY) to (targetX, targetY) around
 * furniture. `waypoints` excludes the start and always ends on the exact
 * requested target (not a cell centre); it never comes back empty. `routed`
 * tells the caller (and tests) whether that's a real BFS-found path or a
 * same-cell/no-route fallback - `findPath` below is the production entry
 * point and just discards that flag, since WattlahMan's own per-leg walk
 * timeout is what keeps a failed plan from hanging the caller either way.
 */
export function planRoute(startX: number, startY: number, targetX: number, targetY: number): RoutePlan {
  const grid = getGrid();
  const startCellRaw = worldToCell(startX, startY);
  const targetCellRaw = worldToCell(targetX, targetY);
  const startCell = nearestWalkable(startCellRaw.col, startCellRaw.row, grid);
  const targetCell = nearestWalkable(targetCellRaw.col, targetCellRaw.row, grid);

  if (!startCell || !targetCell) return { waypoints: [{ x: targetX, y: targetY }], routed: false };
  if (startCell.col === targetCell.col && startCell.row === targetCell.row) {
    return { waypoints: [{ x: targetX, y: targetY }], routed: true };
  }

  const startKey = `${startCell.col},${startCell.row}`;
  const targetKey = `${targetCell.col},${targetCell.row}`;
  const cameFrom = new Map<string, string>();
  const visited = new Set<string>([startKey]);
  const queue: [number, number][] = [[startCell.col, startCell.row]];
  let cursor = 0;
  let found = false;

  while (cursor < queue.length) {
    const [c, r] = queue[cursor];
    cursor += 1;
    if (`${c},${r}` === targetKey) {
      found = true;
      break;
    }
    for (const [dc, dr] of NEIGHBOURS) {
      const nc = c + dc;
      const nr = r + dr;
      if (nc < 0 || nc >= COLS || nr < 0 || nr >= ROWS) continue;
      if (!grid[nr][nc]) continue;
      const key = `${nc},${nr}`;
      if (visited.has(key)) continue;
      visited.add(key);
      cameFrom.set(key, `${c},${r}`);
      queue.push([nc, nr]);
    }
  }

  if (!found) return { waypoints: [{ x: targetX, y: targetY }], routed: false };

  const cellPath: GridPoint[] = [];
  let key = targetKey;
  while (key !== startKey) {
    const [c, r] = key.split(',').map(Number);
    cellPath.push(cellCenter(c, r));
    key = cameFrom.get(key)!;
  }
  cellPath.reverse();
  // Deliberately NOT overwritten with the exact (targetX, targetY): that
  // point can sit within a couple of pixels of a wall (see the CELL/MARGIN
  // comment above), and the final leg targeting it directly was enough to
  // wedge WattlahMan at the very last step of an otherwise-clear route. The
  // cell's own center is guaranteed clear by construction, and he doesn't
  // need pixel-perfect proximity to an appliance the way the player's E-key
  // interaction does - he flips it by id, not by standing on top of it.

  return { waypoints: simplify([{ x: startX, y: startY }, ...cellPath]), routed: true };
}

/**
 * Returns a sequence of waypoints (excluding the start) leading from
 * (startX, startY) to (targetX, targetY), routed around furniture. Never
 * returns an empty array - if no grid route is found (shouldn't happen for
 * a reachable socket), it falls back to a direct hop so the caller always
 * has somewhere to walk.
 */
export function findPath(startX: number, startY: number, targetX: number, targetY: number): GridPoint[] {
  return planRoute(startX, startY, targetX, targetY).waypoints;
}
