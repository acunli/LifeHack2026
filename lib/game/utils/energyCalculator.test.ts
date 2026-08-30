import { describe, expect, it } from 'vitest';
import { calculateEnergyScore } from './energyCalculator';
import { applianceCatalog } from '../data/applianceData';
import { socketDefinitions } from '../data/socketDefinitions';

const on = (dailyKwh: number, referenceDailyKwh: number) => ({ dailyKwh, referenceDailyKwh, isOn: true });
const off = (dailyKwh: number, referenceDailyKwh: number) => ({ dailyKwh, referenceDailyKwh, isOn: false });

describe('calculateEnergyScore', () => {
  it('scores a flat at its reference as 100', () => {
    expect(calculateEnergyScore([on(1.2, 1.2), on(0.6, 0.6)]).score).toBe(100);
  });

  it('subtracts one point per percent over the reference', () => {
    // 1.25 against 1.0 is 25% over.
    expect(calculateEnergyScore([on(1.25, 1.0)]).score).toBe(75);
  });

  it('clamps a frugal flat to 100 rather than exceeding it', () => {
    expect(calculateEnergyScore([on(0.5, 1.0)]).score).toBe(100);
  });

  it('treats an unaudited flat as at benchmark', () => {
    const result = calculateEnergyScore([]);
    expect(result.score).toBe(100);
    expect(result.referenceDailyKwh).toBe(0);
  });

  /*
   * The property the whole game rests on: WattLahMan switching something off
   * must move the score up. It only holds because the reference counts every
   * installed appliance while consumption counts only the ones on - if the
   * reference shrank too, switching off an appliance that was already at or
   * below its typical figure would *lower* the score.
   */
  it('improves the score when an appliance is switched off', () => {
    const before = calculateEnergyScore([on(2.0, 1.0), on(1.0, 1.0)]).score;
    const after = calculateEnergyScore([off(2.0, 1.0), on(1.0, 1.0)]).score;
    expect(after).toBeGreaterThan(before);
  });

  it('improves the score even when the appliance switched off was under its own reference', () => {
    const before = calculateEnergyScore([on(2.0, 1.0), on(0.5, 1.0)]).score;
    const after = calculateEnergyScore([on(2.0, 1.0), off(0.5, 1.0)]).score;
    expect(after).toBeGreaterThan(before);
  });

  it('does not penalise a resident for auditing more of their flat', () => {
    // Each appliance sits exactly at its own reference, so scanning more of
    // them must not move the score. Under the old flat 2.5 kWh/day household
    // constant this fell from 100 as each meter was scanned.
    const oneScanned = calculateEnergyScore([on(1.2, 1.2)]).score;
    const allScanned = calculateEnergyScore([on(1.2, 1.2), on(0.6, 0.6), on(1.0, 1.0)]).score;
    expect(allScanned).toBe(oneScanned);
  });

  it('puts the fully audited demo flat in the 72-78 band README §11 expects', () => {
    const installed = socketDefinitions.map(socket => {
      const definition = applianceCatalog[socket.applianceId];
      return on(definition.dailyKwh, definition.referenceDailyKwh);
    });
    const { score } = calculateEnergyScore(installed);
    expect(score).toBeGreaterThanOrEqual(72);
    expect(score).toBeLessThanOrEqual(78);
  });
});
