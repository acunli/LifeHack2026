import type { ApplianceProfile, ApplianceType } from "@/lib/types";

/**
 * Baselines are rough daily-consumption figures for a Singapore HDB flat.
 * They only need to be defensible on stage, not metrologically exact.
 */
export const APPLIANCE_PROFILES: Record<ApplianceType, ApplianceProfile> = {
  aircon: {
    type: "aircon",
    name: "Air Conditioner",
    glyph: "❄️",
    baselineKwh: 3.21,
    weight: 0.3,
    tip: "Every degree below 25°C adds roughly 8% to your cooling bill. Try 25°C with a fan.",
  },
  refrigerator: {
    type: "refrigerator",
    name: "Refrigerator",
    glyph: "🧊",
    baselineKwh: 1.2,
    weight: 0.2,
    tip: "Keep the coils clear and the door shut. A fridge set colder than 4°C wastes energy nightly.",
  },
  "washing-machine": {
    type: "washing-machine",
    name: "Washing Machine",
    glyph: "🧺",
    baselineKwh: 0.94,
    weight: 0.15,
    tip: "Cold washes use up to 80% less energy. Run full loads only.",
  },
  television: {
    type: "television",
    name: "Television",
    glyph: "📺",
    baselineKwh: 0.62,
    weight: 0.15,
    tip: "Standby draw is real. A switched-off TV still sips power at the plug.",
  },
  microwave: {
    type: "microwave",
    name: "Microwave",
    glyph: "🍳",
    baselineKwh: 0.86,
    weight: 0.1,
    tip: "Reheating in short bursts beats one long run. Unplug to kill standby draw.",
  },
  lighting: {
    type: "lighting",
    name: "Lighting",
    glyph: "💡",
    baselineKwh: 0.48,
    weight: 0.1,
    tip: "Swapping the last halogens for LED cuts lighting load by about 80%.",
  },
  computer: {
    type: "computer",
    name: "Computer",
    glyph: "🖥️",
    baselineKwh: 0.75,
    weight: 0.1,
    tip: "Sleep on idle. A desktop left awake overnight burns more than the fridge.",
  },
};

export const APPLIANCE_TYPES = Object.keys(
  APPLIANCE_PROFILES,
) as ApplianceType[];

/** Singapore regulated tariff, SGD per kWh. */
export const TARIFF_SGD_PER_KWH = 0.2994;
