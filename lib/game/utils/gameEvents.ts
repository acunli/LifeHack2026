/**
 * Shared event bus between the Phaser scene (ApartmentScene) and the React
 * overlay components. Phaser and React mount as separate trees, so this is
 * the only channel between them - no shared React state, no polling.
 *
 * Fixed appliances (plugged in at a socket) and custom appliances (dragged
 * in from the palette) share the same interact/install/click events - both
 * are just an "install target" identified by `installTargetId` (a socket id
 * for fixed appliances, a generated placeholder id for custom ones).
 */

import * as Phaser from 'phaser';

export interface AppliancePayload {
  id: string;
  name: string;
  dailyKwh: number;
  hoursPerDay: number;
  tip: string;
  isCustom: boolean;
}

export interface SocketNearPayload {
  socketId: string;
  purpose: string;
  occupied: boolean;
}

export interface ApplianceInteractPayload {
  installTargetId: string;
  purpose: string;
  appliance: AppliancePayload;
}

export interface ApplianceInstallRequestPayload {
  installTargetId: string;
}

export interface ApplianceInstalledPayload {
  installTargetId: string;
  appliance: AppliancePayload;
}

export interface ApplianceClickedPayload {
  appliance: AppliancePayload;
}

export interface PlaceCustomAppliancePayload {
  customType: string;
  x: number;
  y: number;
}

export const gameEvents = new Phaser.Events.EventEmitter();

export const GAME_EVENTS = {
  SOCKET_NEAR: 'socket:near',
  SOCKET_FAR: 'socket:far',
  APPLIANCE_INTERACT: 'appliance:interact',
  APPLIANCE_INSTALL_REQUEST: 'appliance:install-request',
  APPLIANCE_INSTALLED: 'appliance:installed',
  APPLIANCE_CLICKED: 'appliance:clicked',
  APPLIANCE_PLACE_CUSTOM_REQUEST: 'appliance:place-custom-request',
} as const;
