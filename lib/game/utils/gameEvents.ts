/**
 * Shared event bus between the Phaser scene (ApartmentScene) and the React
 * overlay components. Phaser and React mount as separate trees, so this is
 * the only channel between them - no shared React state, no polling.
 *
 * Fixed appliances (plugged in at a socket) and custom appliances (dragged
 * in from the palette) share the same interact/install/click/power/remove
 * events - both are just an "install target" identified by
 * `installTargetId` (a socket id for fixed appliances, a generated
 * placeholder id for custom ones).
 */

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
  installTargetId: string;
  appliance: AppliancePayload;
  isOn: boolean;
}

export interface ApplianceTogglePowerRequestPayload {
  installTargetId: string;
}

export interface AppliancePowerChangedPayload {
  installTargetId: string;
  appliance: AppliancePayload;
  isOn: boolean;
}

export interface ApplianceRemoveRequestPayload {
  installTargetId: string;
}

export interface ApplianceRemovedPayload {
  installTargetId: string;
  appliance: AppliancePayload;
}

export interface PlaceCustomAppliancePayload {
  customType: string;
  x: number;
  y: number;
}

export interface PlayerMoveRequestPayload {
  x: number;
  y: number;
}

type EventHandler = (...args: never[]) => void;
type Listener = { handler: EventHandler; context?: unknown };

/** A tiny framework-neutral bus that is safe to import during Next.js SSR. */
class GameEventBus {
  private listeners = new Map<string, Listener[]>();

  on(event: string, handler: EventHandler, context?: unknown): this {
    const listeners = this.listeners.get(event) ?? [];
    listeners.push({ handler, context });
    this.listeners.set(event, listeners);
    return this;
  }

  off(event: string, handler?: EventHandler, context?: unknown): this {
    if (!handler) {
      this.listeners.delete(event);
      return this;
    }

    const listeners = this.listeners.get(event)?.filter(listener => (
      listener.handler !== handler ||
      (context !== undefined && listener.context !== context)
    ));
    if (listeners?.length) this.listeners.set(event, listeners);
    else this.listeners.delete(event);
    return this;
  }

  emit(event: string, ...args: unknown[]): boolean {
    const listeners = this.listeners.get(event);
    if (!listeners?.length) return false;
    listeners.slice().forEach(listener => {
      const handler = listener.handler as (...values: unknown[]) => void;
      handler.apply(listener.context, args);
    });
    return true;
  }
}

export const gameEvents = new GameEventBus();

export const GAME_EVENTS = {
  SOCKET_NEAR: 'socket:near',
  SOCKET_FAR: 'socket:far',
  APPLIANCE_INTERACT: 'appliance:interact',
  APPLIANCE_INSTALL_REQUEST: 'appliance:install-request',
  APPLIANCE_INSTALLED: 'appliance:installed',
  APPLIANCE_CLICKED: 'appliance:clicked',
  APPLIANCE_TOGGLE_POWER_REQUEST: 'appliance:toggle-power-request',
  APPLIANCE_POWER_CHANGED: 'appliance:power-changed',
  APPLIANCE_REMOVE_REQUEST: 'appliance:remove-request',
  APPLIANCE_REMOVED: 'appliance:removed',
  APPLIANCE_PLACE_CUSTOM_REQUEST: 'appliance:place-custom-request',
  PLAYER_MOVE_REQUEST: 'player:move-request',
  PLAYER_INTERACT_REQUEST: 'player:interact-request',
} as const;
