export type ApplianceType =
  | "aircon"
  | "refrigerator"
  | "microwave"
  | "washing-machine"
  | "television"
  | "lighting"
  | "computer";

export type RoomName =
  | "living"
  | "kitchen"
  | "bedroom"
  | "bathroom"
  | "dining";

/** A wall socket in the apartment. Starts empty; the resident assigns an appliance. */
export type Socket = {
  id: string;
  room: RoomName;
  /** Position in tile units, not pixels. The sprite layer converts to px. */
  tx: number;
  ty: number;
};

/** Static facts about a kind of appliance. Never changes per-resident. */
export type ApplianceProfile = {
  type: ApplianceType;
  name: string;
  /** Placeholder glyph, used until the real sprite sheet is on disk. */
  glyph: string;
  /** Typical daily consumption for this appliance class, kWh. */
  baselineKwh: number;
  /** Share of the apartment score this appliance class carries, 0-1. */
  weight: number;
  tip: string;
};

/** A profile placed at a socket by a resident, with simulated telemetry. */
export type Appliance = {
  id: string;
  type: ApplianceType;
  name: string;
  glyph: string;
  socketId: string;
  room: RoomName;
  tx: number;
  ty: number;

  currentKwh: number;
  averageKwh: number;
  monthlyCost: number;
  energyScore: number;
  /** Signed % difference from the class average. Positive means overconsuming. */
  deltaPct: number;
  weight: number;
  tip: string;
};

export type Rank = {
  label: string;
  emoji: string;
  min: number;
};

export type LeaderboardEntry = {
  roomNumber: string;
  score: number;
  weeklyDelta: number;
  isCurrentResident: boolean;
};
