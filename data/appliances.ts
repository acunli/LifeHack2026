/**
 * The appliance layer. One array drives three surfaces: the heatmap glow, the
 * hover readout, and the dashboard list.
 *
 * ⚠️ Numbers are PLACEHOLDER and belong to Lane D (AGENTS.md). They are
 * internally consistent — kwh sums to MOCK_APARTMENT.totalConsumptionKwh — so
 * changing one means rebalancing the rest. See appliances.test.ts, which fails
 * if the sum drifts.
 *
 * `score` here is per-appliance, for colour-coding and the "this one is
 * hurting you" line. It does NOT feed the apartment score, which stays
 * total-vs-reference per README §11.
 */
export interface Appliance {
  id: string;
  name: string;
  icon: string;
  /** Monthly consumption, kWh. */
  kwh: number;
  /** What a comparable flat's appliance of this kind uses, kWh. */
  referenceKwh: number;
  /**
   * Position over room.png, as a PERCENTAGE of the image. Percentages rather
   * than tiles so the room scales to any width without the blobs drifting off
   * their appliances.
   */
  x: number;
  y: number;
  /** Heat blob radius, as a percentage of room width. */
  r: number;
  room: string;
  tip: string;
}

export const APPLIANCES: Appliance[] = [
  {
    id: "aircon",
    name: "Air Conditioner",
    icon: "❄️",
    kwh: 180,
    referenceKwh: 118,
    x: 23,
    y: 17,
    r: 15,
    room: "Living room",
    tip: "Every degree below 25°C adds roughly 8% to your cooling bill.",
  },
  {
    id: "fridge",
    name: "Refrigerator",
    icon: "🧊",
    kwh: 95,
    referenceKwh: 98,
    x: 55,
    y: 25,
    r: 10,
    room: "Kitchen",
    tip: "Running well. Keep the coils clear and the door shut.",
  },
  {
    id: "washer",
    name: "Washing Machine",
    icon: "🧺",
    kwh: 58,
    referenceKwh: 46,
    x: 64,
    y: 14,
    r: 9,
    room: "Utility",
    tip: "Cold washes use up to 80% less energy. Run full loads only.",
  },
  {
    id: "tv",
    name: "Television",
    icon: "📺",
    kwh: 40,
    referenceKwh: 33,
    x: 87,
    y: 11,
    r: 9,
    room: "Living room",
    tip: "Standby draw is real — a switched-off TV still sips power.",
  },
  {
    id: "lights",
    name: "Lighting",
    icon: "💡",
    kwh: 30,
    referenceKwh: 25,
    x: 52,
    y: 49,
    r: 11,
    room: "Throughout",
    tip: "Swapping the last halogens for LED cuts lighting load by ~80%.",
  },
];

/** Per-appliance score, same shape of comparison as the apartment score. */
export function applianceScore(a: Appliance): number {
  const over = ((a.kwh - a.referenceKwh) / a.referenceKwh) * 100;
  return Math.max(0, Math.min(100, Math.round(100 - over)));
}

/** 0–1, for the heatmap. Normalised across the set so the hottest reads hot. */
export function applianceLoad(a: Appliance, all: Appliance[] = APPLIANCES): number {
  const max = Math.max(...all.map((x) => x.kwh));
  return max > 0 ? a.kwh / max : 0;
}

/** The one dragging the flat down hardest. Drives the headline line. */
export function worstAppliance(all: Appliance[] = APPLIANCES): Appliance {
  return all.reduce((worst, a) =>
    applianceScore(a) < applianceScore(worst) ? a : worst,
  );
}

export const totalApplianceKwh = (all: Appliance[] = APPLIANCES) =>
  all.reduce((sum, a) => sum + a.kwh, 0);
