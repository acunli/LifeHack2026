import { describe, expect, it } from "vitest";
import { formatDuration, secondsUntilMidnight, zonedParts } from "./time";

const TZ = "Asia/Singapore";

describe("zonedParts", () => {
  it("reads wall-clock time in the target zone, not the host's", () => {
    // 16:00 UTC is midnight in Singapore (UTC+8).
    const parts = zonedParts(new Date("2026-08-29T16:00:00Z"), TZ);
    expect(parts.hour).toBe(0);
    expect(parts.minute).toBe(0);
  });
});

describe("secondsUntilMidnight", () => {
  it("is a full day at the stroke of midnight, never zero", () => {
    // Clamped to (0, 86400] so the countdown never displays 00:00:00 and
    // stalls there.
    const s = secondsUntilMidnight(new Date("2026-08-29T16:00:00Z"), TZ);
    expect(s).toBe(86400);
  });

  it("counts down through the day", () => {
    // 17:00 UTC = 01:00 SGT, so 23 hours remain.
    const s = secondsUntilMidnight(new Date("2026-08-29T17:00:00Z"), TZ);
    expect(s).toBe(23 * 3600);
  });

  it("stays inside one day for any instant", () => {
    for (let h = 0; h < 24; h++) {
      const d = new Date(`2026-08-29T${String(h).padStart(2, "0")}:30:00Z`);
      const s = secondsUntilMidnight(d, TZ);
      expect(s).toBeGreaterThan(0);
      expect(s).toBeLessThanOrEqual(86400);
    }
  });
});

describe("formatDuration", () => {
  it.each([
    [0, "00:00:00"],
    [59, "00:00:59"],
    [3600, "01:00:00"],
    [86399, "23:59:59"],
  ])("formats %i as %s", (secs, expected) => {
    expect(formatDuration(secs)).toBe(expected);
  });

  it("never renders a negative clock", () => {
    expect(formatDuration(-5)).toBe("00:00:00");
  });
});
