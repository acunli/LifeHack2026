import { describe, expect, it } from "vitest";
import { COMPLEX_SIZE, buildStanding } from "./leaderboard";

describe("buildStanding", () => {
  it("is deterministic — the same inputs give the same rank every time", () => {
    // A rank that jitters between renders would hydrate-mismatch, and would
    // change mid-demo.
    const a = buildStanding("04-12", 74);
    const b = buildStanding("04-12", 74);
    expect(a.rank).toBe(b.rank);
    expect(a.rows.map((r) => r.handle)).toEqual(b.rows.map((r) => r.handle));
  });

  it("includes the resident exactly once", () => {
    const s = buildStanding("04-12", 74);
    expect(s.rows.filter((r) => r.isYou)).toHaveLength(1);
  });

  it("never renders a neighbour's room number", () => {
    // A public board of unit numbers says where people live. Handles only.
    const s = buildStanding("04-12", 74);
    for (const row of s.rows) {
      expect(row).not.toHaveProperty("roomNumber");
      expect(row.handle).not.toMatch(/\d{2}-\d{2}/);
    }
  });

  it("gives every row a stable mascot", () => {
    const a = buildStanding("04-12", 74);
    const b = buildStanding("04-12", 74);
    expect(a.rows.map((r) => r.mascot)).toEqual(b.rows.map((r) => r.mascot));
  });

  it("uses unique handles", () => {
    const s = buildStanding("04-12", 74);
    const handles = s.rows.map((r) => r.handle);
    expect(new Set(handles).size).toBe(handles.length);
  });

  it("keeps the complex at full size", () => {
    const s = buildStanding("99-99", 74);
    expect(s.total).toBe(COMPLEX_SIZE + 1);
  });

  it("sorts by score descending", () => {
    const s = buildStanding("04-12", 74);
    for (let i = 1; i < s.rows.length; i++) {
      expect(s.rows[i - 1].score).toBeGreaterThanOrEqual(s.rows[i].score);
    }
  });

  it("ranks a perfect score first, with no gap", () => {
    const s = buildStanding("04-12", 100);
    expect(s.rank).toBe(1);
    expect(s.ahead).toBeNull();
    expect(s.gapToNext).toBe(0);
  });

  it("ranks a terrible score last", () => {
    const s = buildStanding("04-12", 0);
    expect(s.rank).toBe(s.total);
  });

  it("reports a non-negative gap to the apartment above", () => {
    const s = buildStanding("04-12", 74);
    expect(s.gapToNext).toBeGreaterThanOrEqual(0);
    if (s.ahead) expect(s.ahead.score).toBeGreaterThanOrEqual(74);
  });
});

describe("handles", () => {
  it("uses the resident's chosen handle when they have one", () => {
    const s = buildStanding("04-12", 74, 3, "VoltViper9");
    expect(s.rows.find((r) => r.isYou)?.handle).toBe("VoltViper9");
  });

  it('falls back to "You" when no handle has been chosen', () => {
    const s = buildStanding("04-12", 74);
    expect(s.rows.find((r) => r.isYou)?.handle).toBe("You");
  });

  it("ignores a blank handle rather than rendering an empty row", () => {
    const s = buildStanding("04-12", 74, 3, "   ");
    expect(s.rows.find((r) => r.isYou)?.handle).toBe("You");
  });
});
