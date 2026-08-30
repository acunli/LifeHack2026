import { describe, expect, it } from 'vitest';
import { planRoute } from './pathfinding';
import { socketDefinitions } from '../data/socketDefinitions';

// Matches ApartmentScene's SPAWN_X/SPAWN_Y - not imported directly since
// that module pulls in Phaser, which this test doesn't need.
const SPAWN_X = 368;
const SPAWN_Y = 344;

describe('planRoute', () => {
  it('finds a real route from the spawn point to every fixed socket, landing within one grid cell of it', () => {
    // The final waypoint is a verified-clear cell center, not the exact
    // socket coordinate - some sockets sit within a couple of pixels of a
    // wall, and it's that last-mile snap onto the literal point that used
    // to wedge WattlahMan right at the end of an otherwise-clear route.
    socketDefinitions.forEach(socket => {
      const plan = planRoute(SPAWN_X, SPAWN_Y, socket.x, socket.y);
      expect(plan.routed, `expected a BFS route to ${socket.id}`).toBe(true);
      const last = plan.waypoints.at(-1)!;
      expect(Math.abs(last.x - socket.x), `${socket.id} x too far off`).toBeLessThanOrEqual(2);
      expect(Math.abs(last.y - socket.y), `${socket.id} y too far off`).toBeLessThanOrEqual(2);
    });
  });

  it('is symmetric enough that sockets can also route to each other', () => {
    const [first, second] = socketDefinitions;
    const plan = planRoute(first.x, first.y, second.x, second.y);
    expect(plan.routed).toBe(true);
  });

  it('returns just the target with routed:true when start and target share a grid cell', () => {
    const plan = planRoute(100, 100, 100.5, 100.9);
    expect(plan.routed).toBe(true);
    expect(plan.waypoints).toEqual([{ x: 100.5, y: 100.9 }]);
  });
});
