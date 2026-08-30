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
  /** 1-5, how disruptive switching this off is right now - see applianceData.ts. */
  inconvenience: number;
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

export type WattlahmanStatus = 'thinking' | 'acting' | 'done' | 'dismissed' | 'nothing-to-do';

export interface WattlahmanSummonRequestPayload {
  /** Kimi K3 API key, or null to run WattLahMan in offline/heuristic mode. */
  apiKey: string | null;
}

export interface WattlahmanStatusPayload {
  status: WattlahmanStatus;
}

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
  WATTLAHMAN_SUMMON_REQUEST: 'wattlahman:summon-request',
  WATTLAHMAN_DISMISS_REQUEST: 'wattlahman:dismiss-request',
  WATTLAHMAN_STATUS: 'wattlahman:status',
} as const;

type GameEventMap = {
  [GAME_EVENTS.SOCKET_NEAR]: [SocketNearPayload];
  [GAME_EVENTS.SOCKET_FAR]: [];
  [GAME_EVENTS.APPLIANCE_INTERACT]: [ApplianceInteractPayload];
  [GAME_EVENTS.APPLIANCE_INSTALL_REQUEST]: [ApplianceInstallRequestPayload];
  [GAME_EVENTS.APPLIANCE_INSTALLED]: [ApplianceInstalledPayload];
  [GAME_EVENTS.APPLIANCE_CLICKED]: [ApplianceClickedPayload];
  [GAME_EVENTS.APPLIANCE_TOGGLE_POWER_REQUEST]: [ApplianceTogglePowerRequestPayload];
  [GAME_EVENTS.APPLIANCE_POWER_CHANGED]: [AppliancePowerChangedPayload];
  [GAME_EVENTS.APPLIANCE_REMOVE_REQUEST]: [ApplianceRemoveRequestPayload];
  [GAME_EVENTS.APPLIANCE_REMOVED]: [ApplianceRemovedPayload];
  [GAME_EVENTS.APPLIANCE_PLACE_CUSTOM_REQUEST]: [PlaceCustomAppliancePayload];
  [GAME_EVENTS.PLAYER_MOVE_REQUEST]: [PlayerMoveRequestPayload];
  [GAME_EVENTS.PLAYER_INTERACT_REQUEST]: [];
  [GAME_EVENTS.WATTLAHMAN_SUMMON_REQUEST]: [WattlahmanSummonRequestPayload];
  [GAME_EVENTS.WATTLAHMAN_DISMISS_REQUEST]: [];
  [GAME_EVENTS.WATTLAHMAN_STATUS]: [WattlahmanStatusPayload];
};

type GameEventName = keyof GameEventMap;
type EventHandler = (...args: never[]) => void;
type Listener = { handler: EventHandler; context?: unknown };

/** A tiny framework-neutral bus that is safe to import during Next.js SSR. */
class GameEventBus {
  private listeners = new Map<string, Listener[]>();

  on<K extends GameEventName>(
    event: K,
    handler: (...args: GameEventMap[K]) => void,
    context?: unknown,
  ): this {
    const listeners = this.listeners.get(event) ?? [];
    listeners.push({ handler: handler as EventHandler, context });
    this.listeners.set(event, listeners);
    return this;
  }

  off<K extends GameEventName>(
    event: K,
    handler?: (...args: GameEventMap[K]) => void,
    context?: unknown,
  ): this {
    if (!handler) {
      this.listeners.delete(event);
      return this;
    }

    const listeners = this.listeners.get(event)?.filter(listener => (
      listener.handler !== handler as EventHandler ||
      (context !== undefined && listener.context !== context)
    ));
    if (listeners?.length) this.listeners.set(event, listeners);
    else this.listeners.delete(event);
    return this;
  }

  emit<K extends GameEventName>(event: K, ...args: GameEventMap[K]): boolean {
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
