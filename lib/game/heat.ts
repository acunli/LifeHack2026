/**
 * The heat the resident is standing in.
 *
 * Pulled out of ApartmentScene so the mechanic can be tested without a canvas.
 * It was previously inline in a private method, which meant the only way to
 * check that walking toward the aircon actually reddens the aura was to look
 * at the screen and believe it.
 *
 * Pure: same inputs, same number, no Phaser.
 */

import { applianceCatalog } from './data/applianceData'
import { customApplianceTypes } from './data/customApplianceTypes'

/** Nothing beyond this many pixels contributes. */
export const HEAT_RANGE = 140

/**
 * Daily draw treated as "as hungry as it gets" when normalising to 0-1.
 *
 * Derived from the catalogue rather than picked. It used to be a flat 6, which
 * no appliance in the game comes close to — the hungriest fixed one is the
 * fridge at 1.4 kWh/day and the hungriest placeable is the aircon at 2.5. That
 * capped the aura at 0.23 of its range in the default room, so it was
 * mathematically incapable of reaching the red end and looked broken. Taking
 * the real maximum means standing on the worst thing in the flat reads as the
 * worst thing in the flat, and it cannot drift when the catalogue changes.
 */
export const HEAT_REFERENCE_KWH = Math.max(
  ...Object.values(applianceCatalog).map((a) => a.dailyKwh),
  ...customApplianceTypes.map((a) => a.dailyKwh),
)

export type HeatSource = {
  /** Centre of the appliance, in world pixels. */
  x: number
  y: number
  dailyKwh: number
  /** An unplugged or switched-off unit adds no heat. */
  drawing: boolean
}

/**
 * 0 when the flat is quiet around you, 1 when you are stood on top of
 * something hungry. Takes the strongest single source rather than a sum: the
 * aura answers "what am I next to", and adding up a room's worth of standby
 * draw would saturate it everywhere.
 */
export function heatAt(px: number, py: number, sources: readonly HeatSource[]): number {
  let heat = 0
  for (const s of sources) {
    if (!s.drawing) continue
    const dist = Math.hypot(px - s.x, py - s.y)
    if (dist > HEAT_RANGE) continue
    const draw = Math.min(1, s.dailyKwh / HEAT_REFERENCE_KWH)
    heat = Math.max(heat, draw * (1 - dist / HEAT_RANGE))
  }
  return Math.min(1, Math.max(0, heat))
}

/** Aura colour endpoints: the quiet flat, and standing beside the aircon. */
export const HEAT_COOL = 0x9be564
export const HEAT_HOT = 0xff7a6b

/** Alpha and diameter both grow with heat, so it reads before you read it. */
export function auraAlpha(t: number): number {
  return 0.16 + t * 0.3
}

export function auraSize(t: number): number {
  return 84 + t * 60
}
