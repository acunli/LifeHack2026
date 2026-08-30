/**
 * Palette of generic appliances the player can drag into the room, for
 * anything not already sitting in the apartment as real pixel art. Each is
 * rendered in Phaser as a plain placeholder (colored tile + emoji), not a
 * sprite - see AppliancePlaceholder in ApartmentScene.ts.
 *
 * dailyKwh/hoursPerDay are illustrative, same basis as applianceData.ts.
 */

export interface CustomApplianceType {
  type: string;
  name: string;
  icon: string;
  color: number; // Phaser fill color for the placeholder tile
  dailyKwh: number;
  hoursPerDay: number;
  tip: string;
  /**
   * 1 (barely noticed) to 5 (actively disruptive) - how much it costs the
   * resident to have this switched off right now. See applianceData.ts's
   * ApplianceDefinition for the same field on the fixed catalog.
   */
  inconvenience: number;
}

export const customApplianceTypes: CustomApplianceType[] = [
  {
    type: 'fan',
    name: 'Fan',
    icon: '🌀',
    color: 0x60a5fa,
    dailyKwh: 0.4,
    hoursPerDay: 6,
    tip: 'A fan uses a fraction of an air conditioner\'s power for similar comfort on mild days.',
    inconvenience: 2,
  },
  {
    type: 'air_conditioner',
    name: 'Air Conditioner',
    icon: '❄️',
    color: 0x38bdf8,
    dailyKwh: 2.5,
    hoursPerDay: 5,
    tip: 'Set it a couple degrees warmer — each degree lower can add 5-10% to its energy use.',
    // Real comfort cost - switching it off outright is a bigger ask than
    // just nudging the setpoint.
    inconvenience: 4,
  },
  {
    type: 'heater',
    name: 'Space Heater',
    icon: '🔥',
    color: 0xf97316,
    dailyKwh: 1.8,
    hoursPerDay: 4,
    tip: 'Heat only the room you\'re in rather than running central heating for an empty apartment.',
    inconvenience: 4,
  },
  {
    type: 'speaker',
    name: 'Speaker',
    icon: '🔊',
    color: 0xa78bfa,
    dailyKwh: 0.15,
    hoursPerDay: 3,
    tip: 'Bluetooth speakers idle at very low power, but unplug them if unused for long stretches.',
    inconvenience: 1,
  },
  {
    type: 'console',
    name: 'Game Console',
    icon: '🎮',
    color: 0x34d399,
    dailyKwh: 0.3,
    hoursPerDay: 2,
    tip: 'Enable auto-sleep so it doesn\'t idle at full power after you stop playing.',
    // Might be mid-game.
    inconvenience: 3,
  },
  {
    type: 'kettle',
    name: 'Electric Kettle',
    icon: '☕',
    color: 0xfacc15,
    dailyKwh: 0.2,
    hoursPerDay: 0.5,
    tip: 'Boil only the water you need — reheating a full kettle for one cup wastes most of it.',
    inconvenience: 1,
  },
];
