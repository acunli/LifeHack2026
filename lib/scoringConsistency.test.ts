import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { computeScore as apartmentScore } from "./scoring";
import { computeScore as leagueScore } from "./leagueScoring";
import { MOCK_APARTMENT } from "@/data/mockApartment";

/**
 * Three surfaces compute a score: the dashboard, the league, and the shared
 * apartment model. They have drifted apart before — at one point the league
 * used `50 + saved * 100` while the dashboard used `100 - over`, so the same
 * flat read differently depending on which page you were on.
 *
 * These lock them to one definition:
 *
 *   comparison = (usage - reference) / reference * 100     (a percentage)
 *   score      = clamp(100 - comparison, 0, 100)
 */
describe("one scoring definition across every surface", () => {
  it("the league and the apartment agree for the same reading", () => {
    for (const [usage, reference] of [
      [403, 320],
      [320, 320],
      [160, 320],
      [640, 320],
    ]) {
      const a = apartmentScore({
        roomNumber: "t",
        totalConsumptionKwh: usage,
        referenceConsumptionKwh: reference,
        costPerKwh: 0.2994,
      }).score;
      const l = leagueScore({ usageKwh: usage, baselineKwh: reference });
      expect(l).toBe(a);
    }
  });

  it("compares as a percentage of the reference, not a raw difference", () => {
    // 10 over 100 and 100 over 1000 are both +10%, so both must score 90.
    const small = apartmentScore({
      roomNumber: "t",
      totalConsumptionKwh: 110,
      referenceConsumptionKwh: 100,
      costPerKwh: 0.3,
    });
    const large = apartmentScore({
      roomNumber: "t",
      totalConsumptionKwh: 1100,
      referenceConsumptionKwh: 1000,
      costPerKwh: 0.3,
    });
    expect(small.comparisonPercent).toBe(10);
    expect(large.comparisonPercent).toBe(10);
    expect(small.score).toBe(large.score);
    expect(small.score).toBe(90);
  });

  it("the demo apartment reads 74 at 26% over, as the panel claims", () => {
    const r = apartmentScore(MOCK_APARTMENT);
    expect(Math.round(r.comparisonPercent)).toBe(26);
    expect(r.score).toBe(74);
  });
});

/**
 * The room is allowed exactly one scorer, and it must borrow the shared
 * formula rather than invent one.
 *
 * This started as a stricter rule — that nothing under lib/game may score at
 * all — written while the room was being made a pure consumer of the
 * dashboard's number. That direction was abandoned because it froze the score:
 * switching appliances off in the flat left the dial unmoved, which is the
 * whole point of the game. The room scores itself again, from what is actually
 * installed and powered.
 *
 * What still must not happen is a *second* one appearing beside it. Before
 * this boundary existed the room and the dashboard showed different numbers on
 * the same screen, and WattLahMan read the room's aloud — telling a resident
 * looking at 74 they were "already maxed at 100".
 */
describe("the game layer has exactly one scorer", () => {
  const walk = (dir: string): string[] =>
    readdirSync(dir).flatMap((entry) => {
      const full = join(dir, entry);
      if (statSync(full).isDirectory()) return walk(full);
      return /\.tsx?$/.test(entry) && !/\.test\.tsx?$/.test(entry) ? [full] : [];
    });

  const gameFiles = walk(join(import.meta.dirname, "game"));

  it("only energyCalculator turns usage into a score", () => {
    const scorers = gameFiles
      .filter((f) => /computeScore\s*\(/.test(readFileSync(f, "utf8")))
      .map((f) => f.split("/lib/")[1]);
    expect(scorers).toEqual(["game/utils/energyCalculator.ts"]);
  });

  it("and it defers to the shared contract instead of its own formula", () => {
    const src = readFileSync(join(import.meta.dirname, "game/utils/energyCalculator.ts"), "utf8");
    expect(src).toMatch(/from ['"]@\/lib\/scoring['"]/);
    // A hand-rolled 100 - percentage would mean the room had drifted off the
    // shared definition even while importing it.
    expect(src).not.toMatch(/100\s*-\s*/);
  });
});
