/**
 * Actionable fixes, each tied to an appliance and a quantified saving.
 *
 * Merged from the watt-lah-dashboard mock. This is the most
 * behaviour-change-shaped thing in the product: a total tells a resident
 * nothing they can act on, whereas "set the aircon to 25°C, save 34 kWh, costs
 * nothing" is a decision they can make tonight.
 *
 * ⚠️ The savings figures are PLACEHOLDER and belong to Lane D, like the rest of
 * the mock data. Each needs a source or a softer claim before submission —
 * see docs/rationale.md.
 */

export interface Recommendation {
  id: string;
  /** Appliance id, or "home" for whole-flat habits. */
  appliance: string;
  title: string;
  /** kWh/month saved if applied. 0 means no direct saving. */
  save: number;
  /** What it costs the resident — money or time. */
  effort: string;
  body: string;
}

export const RECOMMENDATIONS: Recommendation[] = [
  {
    id: "ac-25",
    appliance: "aircon",
    title: "Set the aircon to 25°C",
    save: 34,
    effort: "Free",
    body: "You are running at 22°C. Every degree costs roughly 8% more. 25°C is the NEA-recommended setting and most people cannot feel the difference at night.",
  },
  {
    id: "ac-timer",
    appliance: "aircon",
    title: "Use the 2-hour sleep timer",
    save: 22,
    effort: "Free",
    body: "The room stays cool long after the compressor stops. Cutting the last two hours of an eight-hour night removes about a quarter of the run time.",
  },
  {
    id: "ac-clean",
    appliance: "aircon",
    title: "Wash the filters this month",
    save: 12,
    effort: "20 min",
    body: "A clogged filter makes the unit work harder for the same cooling. Servicing is the single most-skipped maintenance job in HDB flats.",
  },
  {
    id: "wash-cold",
    appliance: "washer",
    title: "Switch to cold washes",
    save: 11,
    effort: "Free",
    body: "Around 80% of a wash cycle's energy goes into heating water. Modern detergents are formulated for 30°C and below.",
  },
  {
    id: "wash-full",
    appliance: "washer",
    title: "Only run full loads",
    save: 6,
    effort: "Free",
    body: "A half load uses nearly the same energy as a full one. Two half loads a week is roughly a wasted cycle.",
  },
  {
    id: "tv-standby",
    appliance: "tv",
    title: "Kill standby at the socket",
    save: 7,
    effort: "Free",
    body: "Your TV draws power whenever it is plugged in. A switched power strip removes it entirely.",
  },
  {
    id: "led",
    appliance: "lights",
    title: "Swap remaining halogens",
    save: 9,
    effort: "S$30",
    body: "LEDs use about 80% less for the same brightness and last years longer. Pays for itself in roughly four months.",
  },
  {
    id: "h-fan",
    appliance: "home",
    title: "Run a fan with the aircon",
    save: 18,
    effort: "Free",
    body: "Moving air makes 26°C feel like 24°C. A ceiling fan draws about 1% of what a compressor does.",
  },
  {
    id: "h-curtain",
    appliance: "home",
    title: "Close curtains at midday",
    save: 14,
    effort: "Free",
    body: "West-facing flats gain serious heat through glass in the afternoon. Blocking it means the aircon starts from a cooler room.",
  },
];

export const recsFor = (applianceId: string) =>
  RECOMMENDATIONS.filter((r) => r.appliance === applianceId);
