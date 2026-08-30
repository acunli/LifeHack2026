import { describe, expect, it } from 'vitest'
import {
  auraAlpha,
  auraSize,
  heatAt,
  HEAT_RANGE,
  HEAT_REFERENCE_KWH,
  type HeatSource,
} from './heat'

/** An appliance as hungry as the scale allows, at the origin. */
const hungry = (over: Partial<HeatSource> = {}): HeatSource => ({
  x: 0,
  y: 0,
  dailyKwh: HEAT_REFERENCE_KWH,
  drawing: true,
  ...over,
})

describe('heatAt', () => {
  it('is cold in an empty room', () => {
    expect(heatAt(0, 0, [])).toBe(0)
  })

  it('is at its hottest standing on a hungry appliance', () => {
    expect(heatAt(0, 0, [hungry()])).toBe(1)
  })

  it('falls off to nothing at the edge of range, and stays there beyond it', () => {
    expect(heatAt(HEAT_RANGE, 0, [hungry()])).toBe(0)
    expect(heatAt(HEAT_RANGE + 50, 0, [hungry()])).toBe(0)
  })

  it('cools steadily as the resident walks away', () => {
    const walk = [0, 35, 70, 105, 140].map((d) => heatAt(d, 0, [hungry()]))
    for (let i = 1; i < walk.length; i++) {
      expect(walk[i]).toBeLessThan(walk[i - 1])
    }
    expect(walk[2]).toBeCloseTo(0.5, 5)
  })

  it('measures distance in both axes, not just one', () => {
    // 3-4-5: a source 70px away diagonally reads the same as 70px along a wall.
    const diagonal = heatAt(42, 56, [hungry()])
    const straight = heatAt(70, 0, [hungry()])
    expect(diagonal).toBeCloseTo(straight, 10)
  })

  it('ignores an appliance that is switched off', () => {
    expect(heatAt(0, 0, [hungry({ drawing: false })])).toBe(0)
  })

  it('scales with draw, so a lamp never reads like an aircon', () => {
    const lamp = heatAt(0, 0, [hungry({ dailyKwh: 0.15 })])
    const aircon = heatAt(0, 0, [hungry({ dailyKwh: HEAT_REFERENCE_KWH })])
    expect(lamp).toBeLessThan(0.1)
    expect(aircon).toBe(1)
  })

  it('is calibrated so the real appliances actually span the scale', () => {
    // The bug this guards: the reference used to be a flat 6 kWh/day, which
    // nothing in the game reaches, so the aura never left the green end.
    const fridge = heatAt(0, 0, [hungry({ dailyKwh: 1.4 })])
    const aircon = heatAt(0, 0, [hungry({ dailyKwh: 2.5 })])
    expect(aircon).toBe(1)
    expect(fridge).toBeGreaterThan(0.5)
  })

  it('does not let a very hungry appliance push past the top of the scale', () => {
    expect(heatAt(0, 0, [hungry({ dailyKwh: 40 })])).toBe(1)
  })

  it('takes its reference from the catalogue, not a guessed constant', () => {
    expect(HEAT_REFERENCE_KWH).toBeCloseTo(2.5, 5)
  })

  it('takes the strongest source rather than summing the room', () => {
    // Six quiet appliances stacked together must not read as one hungry one.
    const one = hungry({ dailyKwh: 0.2 })
    const six = Array.from({ length: 6 }, () => one)
    expect(heatAt(0, 0, six)).toBeCloseTo(heatAt(0, 0, [one]), 10)

    // And a hungry one further off can still beat a quiet one underfoot.
    const mixed = [
      hungry({ dailyKwh: 0.2, x: 0 }),
      hungry({ dailyKwh: HEAT_REFERENCE_KWH, x: 70 }),
    ]
    expect(heatAt(0, 0, mixed)).toBeCloseTo(0.5, 5)
  })

  it('stays inside 0-1 whatever it is handed', () => {
    const cases: HeatSource[][] = [
      [],
      [hungry({ dailyKwh: 0 })],
      [hungry({ dailyKwh: -5 })],
      [hungry({ x: 1e6, y: 1e6 })],
    ]
    for (const c of cases) {
      const t = heatAt(0, 0, c)
      expect(t).toBeGreaterThanOrEqual(0)
      expect(t).toBeLessThanOrEqual(1)
    }
  })
})

describe('the aura the heat drives', () => {
  it('grows and solidifies as the room heats up', () => {
    expect(auraAlpha(0)).toBeLessThan(auraAlpha(1))
    expect(auraSize(0)).toBeLessThan(auraSize(1))
  })

  it('stays within a sane range at both ends', () => {
    expect(auraAlpha(0)).toBeCloseTo(0.16, 5)
    expect(auraAlpha(1)).toBeCloseTo(0.46, 5)
    expect(auraSize(0)).toBe(84)
    expect(auraSize(1)).toBe(144)
  })
})
