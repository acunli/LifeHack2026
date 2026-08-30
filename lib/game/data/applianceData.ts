/**
 * Appliance catalog for the interactive apartment.
 *
 * Limited to the 5 appliances that already have a real sprite placed in
 * apartment_layout.json - see socketDefinitions.ts for why Air Conditioner,
 * Fan, Lamp, and Espresso Machine were dropped from this fixed set (players
 * can still add generic versions of those - see customApplianceTypes.ts).
 *
 * `furnitureName` matches the `name` field on the matching entry in
 * apartment_layout.json, which is how ApartmentScene finds the sprite to
 * activate when a socket is installed - no new sprite is spawned, the
 * appliance that's already sitting in the room is "plugged in".
 *
 * dailyKwh/hoursPerDay figures are illustrative household averages (not
 * measured), used to drive the score via lib/scoring.ts's computeScore and
 * to label the "time open" stat in the appliance panel.
 */

export interface ApplianceDefinition {
  id: string;
  name: string;
  furnitureName: string;
  dailyKwh: number;
  /**
   * What a typical flat in the block draws from this same appliance, daily
   * kWh. The score is this appliance's actual draw measured against this
   * figure, not against a whole-household constant - see energyCalculator.ts
   * for why that distinction matters.
   *
   * The five fixed figures sum to 3.12 kWh/day against the catalog's 3.9,
   * putting a fully audited demo flat at +25% and a score of 75 - inside the
   * 72-78 band README §11 and the demo script both expect. Retuning one of
   * these moves the headline score, so move them together.
   */
  referenceDailyKwh: number;
  hoursPerDay: number;
  tip: string;
  /**
   * 1 (barely noticed) to 5 (actively disruptive) - how much it costs the
   * resident to have this switched off right now, e.g. mid-use. WattLahMan
   * weighs this against dailyKwh rather than just maximizing score; see
   * lib/wattlahman/kimiClient.ts.
   */
  inconvenience: number;
}

export const applianceCatalog: Record<string, ApplianceDefinition> = {
  refrigerator: {
    id: 'refrigerator',
    name: 'Refrigerator',
    furnitureName: 'Fridge (orange)',
    dailyKwh: 1.4,
    referenceDailyKwh: 1.2,
    hoursPerDay: 24,
    tip: 'Keep it at 4°C (fridge) / -18°C (freezer) — colder settings waste energy without extra freshness.',
    // Runs continuously and is excluded from WattLahMan's candidates
    // outright (see ApartmentScene's ESSENTIAL_HOURS_PER_DAY filter) -
    // the rating here is moot but kept high for consistency/documentation.
    inconvenience: 5,
  },
  microwave: {
    id: 'microwave',
    name: 'Microwave',
    furnitureName: 'Microwave (alt)',
    dailyKwh: 0.3,
    referenceDailyKwh: 0.3,
    hoursPerDay: 0.25,
    tip: 'Reheating in a microwave uses a fraction of the energy an oven would for the same job.',
    // Used in short bursts; almost never mid-use when scanned.
    inconvenience: 1,
  },
  television: {
    id: 'television',
    name: 'Television',
    furnitureName: 'Wall TV',
    dailyKwh: 0.6,
    referenceDailyKwh: 0.42,
    hoursPerDay: 4,
    tip: 'Switch off at the wall instead of standby — standby draw adds up over a month.',
    // Might be mid-show.
    inconvenience: 3,
  },
  monitor: {
    id: 'monitor',
    name: 'Monitor / PC',
    furnitureName: 'Monitor (blue)',
    dailyKwh: 1.0,
    referenceDailyKwh: 0.65,
    hoursPerDay: 8,
    tip: 'Enable sleep mode after a few idle minutes to cut power draw when you step away.',
    // Might be mid-task/work.
    inconvenience: 3,
  },
  washing_machine: {
    id: 'washing_machine',
    name: 'Washing Machine',
    furnitureName: 'Cabinet w/ Crystal',
    dailyKwh: 0.6,
    referenceDailyKwh: 0.55,
    hoursPerDay: 1,
    tip: 'Wash on a cold or eco cycle — heating the water is most of a washing machine\'s energy use.',
    // Interrupting a cycle mid-wash is a real hassle, not just an inconvenience.
    inconvenience: 4,
  },
};
