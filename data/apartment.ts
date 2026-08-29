import type { RoomName, Socket } from "@/lib/types";

/**
 * The apartment is authored in TILE units, never pixels. The sprite layer
 * multiplies by the active tile size, so swapping in a differently-scaled
 * art pack rescales the whole floor plan without touching this file.
 */
export const GRID_COLS = 22;
export const GRID_ROWS = 15;

export type RoomRect = {
  name: RoomName;
  label: string;
  tx: number;
  ty: number;
  w: number;
  h: number;
};

/** One apartment, laid out well, rather than five laid out badly. */
export const ROOMS: RoomRect[] = [
  { name: "bedroom", label: "Bedroom", tx: 0, ty: 0, w: 13, h: 6 },
  { name: "bathroom", label: "Bathroom", tx: 13, ty: 0, w: 9, h: 6 },
  { name: "living", label: "Living Room", tx: 0, ty: 6, w: 22, h: 5 },
  { name: "kitchen", label: "Kitchen", tx: 0, ty: 11, w: 12, h: 4 },
  { name: "dining", label: "Dining", tx: 12, ty: 11, w: 10, h: 4 },
];

/** Seven sockets: enough to feel like a home, few enough to configure on stage. */
export const SOCKETS: Socket[] = [
  { id: "s1", room: "kitchen", tx: 2, ty: 12 },
  { id: "s2", room: "kitchen", tx: 6, ty: 12 },
  { id: "s3", room: "living", tx: 4, ty: 8 },
  { id: "s4", room: "living", tx: 15, ty: 8 },
  { id: "s5", room: "bedroom", tx: 3, ty: 2 },
  { id: "s6", room: "bedroom", tx: 9, ty: 3 },
  { id: "s7", room: "bathroom", tx: 17, ty: 2 },
];

export const SOCKETS_BY_ID = new Map(SOCKETS.map((s) => [s.id, s]));

/** Fake auth. Room number -> resident. Password for all demo accounts. */
export const DEMO_PASSWORD = "password";

export const RESIDENTS: Record<string, { name: string }> = {
  "04-12": { name: "Josh" },
  "08-14": { name: "Mei" },
  "12-03": { name: "Arjun" },
};
