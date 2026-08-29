/**
 * Socket positions for the interactive apartment.
 *
 * Positions were derived from apartment_layout.json: each socket sits on
 * the nearest open floor tile to the real furniture piece it services
 * (verified against the wall/furniture collision rects so the player can
 * actually stand there). The room layout here is the apartment's actual
 * built layout (kitchen / combined bedroom+study / bathroom on the top
 * strip, one large living room below) rather than the original 5-room
 * proposal sketch, which the real furniture placement didn't end up
 * matching room-for-room.
 *
 * The appliance list is reduced to the 5 appliances that have a real
 * sprite already placed in the layout: Refrigerator, Microwave,
 * Television, Monitor, and Washing Machine. The auto-generated furniture
 * catalog mislabeled two bathroom pieces - "Cabinet w/ Crystal" is
 * actually the washing machine (front-loader, round door) and
 * "Fridge (small, alt)" is actually the toilet - confirmed by inspecting
 * the sprite art directly. Air Conditioner, Fan, Lamp, and Espresso
 * Machine were dropped: no confirmed sprite exists for them in this
 * layout, and inventing placeholder art for a hackathon demo isn't worth
 * the risk of an off-brand look.
 */

export interface SocketDefinition {
  id: string;
  room: string;
  purpose: string;
  x: number;
  y: number;
  /** The one appliance (from applianceData.ts) this socket powers. */
  applianceId: string;
  occupied: boolean;
}

export const INTERACTION_RADIUS = 48; // 3 on-screen tiles (16px each)

export const socketDefinitions: SocketDefinition[] = [
  {
    id: 'kitchen_microwave',
    room: 'Kitchen',
    purpose: 'Microwave',
    x: 200,
    y: 248,
    applianceId: 'microwave',
    occupied: false,
  },
  {
    id: 'kitchen_fridge',
    room: 'Kitchen',
    purpose: 'Refrigerator',
    x: 248,
    y: 280,
    applianceId: 'refrigerator',
    occupied: false,
  },
  {
    id: 'living_tv',
    room: 'Living Room',
    purpose: 'Television',
    x: 408,
    y: 520,
    applianceId: 'television',
    occupied: false,
  },
  {
    id: 'study_desk',
    room: 'Study',
    purpose: 'Monitor/PC',
    x: 488,
    y: 184,
    applianceId: 'monitor',
    occupied: false,
  },
  {
    id: 'bathroom_washer',
    room: 'Bathroom',
    purpose: 'Washing Machine',
    x: 616,
    y: 216,
    applianceId: 'washing_machine',
    occupied: false,
  },
];
