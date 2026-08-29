/**
 * ApartmentScene - Renders apartment from apartment_layout.json
 *
 * EXACT TRANSCRIPTION - no redesign, no repositioning, no resizing.
 * Renders every tile and furniture piece at the exact coordinates specified.
 */

import * as Phaser from 'phaser';
import { apartmentLayout, normalizeSpritePath } from '../data/apartmentMap';
import Player from '../entities/Player';
import Socket from '../entities/Socket';
import Appliance from '../entities/Appliance';
import { buildCollisionGroup } from '../utils/collisionHelpers';
import { socketDefinitions, INTERACTION_RADIUS } from '../data/socketDefinitions';
import { applianceCatalog } from '../data/applianceData';
import { customApplianceTypes, CustomApplianceType } from '../data/customApplianceTypes';
import {
  gameEvents,
  GAME_EVENTS,
  AppliancePayload,
  ApplianceInstallRequestPayload,
  ApplianceRemoveRequestPayload,
  ApplianceTogglePowerRequestPayload,
  PlayerMoveRequestPayload,
  PlaceCustomAppliancePayload,
} from '../utils/gameEvents';
import {
  connectAuditTarget,
  disconnectAuditTarget,
  readAuditProgress,
  setAuditTargetPower,
} from '../utils/auditProgress';
import { readRawSession } from '@/lib/session';

// Spawn just below the apartment's only door, facing up into the room.
const SPAWN_X = 368;
const SPAWN_Y = 344;

const PLACEHOLDER_SIZE = 28;

export default class ApartmentScene extends Phaser.Scene {
  private player!: Player;
  private sockets: Socket[] = [];
  // Keyed by "install target id" - a socket id for the 5 fixed appliances,
  // a generated placeholder id for custom ones. One shared map lets install
  // requests, clicks, and the score overlay treat both kinds identically.
  private appliancesByTargetId = new Map<string, Appliance>();

  /**
   * Heat aura. A soft ellipse under the player whose colour and size follow
   * the draw of appliances nearby — walk toward the aircon and it flares red,
   * stand by the fridge and it stays green. Makes consumption something you
   * feel while moving, rather than only a number on the panel.
   */
  private heatAura!: Phaser.GameObjects.Ellipse;

  /** Tooltip shown while hovering an appliance. */
  private hoverLabel!: Phaser.GameObjects.Text;
  private nearestSocketId: string | undefined = undefined;
  private keyE!: Phaser.Input.Keyboard.Key;
  private customApplianceCounter = 0;
  private roomNumber = 'demo';

  constructor() {
    super({ key: 'ApartmentScene' });
  }

  create() {
    // Set background color
    this.cameras.main.setBackgroundColor('#1a1a1a');

    const { canvas, tiles, furniture } = apartmentLayout;

    console.log(`Rendering apartment: ${canvas.width_px}×${canvas.height_px}px, ${tiles.length} tiles, ${furniture.length} furniture items`);

    // LAYER 1: Render all floor/wall tiles
    // Tiles are 8×8 native, rendered at 16×16 (2× scale)
    this.renderTiles(tiles, canvas.tile_size);

    // LAYER 2: Render furniture in layer order (1-33)
    // Sort by layer to ensure correct z-ordering
    const sortedFurniture = [...furniture].sort((a, b) => a.layer - b.layer);
    const furnitureSprites = this.renderFurniture(sortedFurniture);

    // Wrap the 5 sprites that double as appliances (fridge, microwave, TV,
    // monitor, washing machine) so a socket install can activate them.
    // Keyed by the socket that powers each one, not the appliance's own id.
    socketDefinitions.forEach(socketDef => {
      const applianceDef = applianceCatalog[socketDef.applianceId];
      const sprite = furnitureSprites.get(applianceDef.furnitureName);
      if (!sprite) {
        console.warn(`Appliance sprite not found for "${applianceDef.furnitureName}"`);
        return;
      }
      const info: AppliancePayload = {
        id: applianceDef.id,
        name: applianceDef.name,
        dailyKwh: applianceDef.dailyKwh,
        hoursPerDay: applianceDef.hoursPerDay,
        tip: applianceDef.tip,
        isCustom: false,
      };
      const appliance = new Appliance(this, info, sprite);
      sprite.setInteractive({ useHandCursor: true });
      this.wireApplianceClick(appliance, socketDef.id, socketDef.purpose);
      this.wireApplianceHover(appliance);
      this.appliancesByTargetId.set(socketDef.id, appliance);
    });

    // Aura sits under the player but over the floor.
    this.heatAura = this.add.ellipse(SPAWN_X, SPAWN_Y, 96, 48, 0x9be564, 0.22);
    this.heatAura.setDepth(880);
    this.heatAura.setBlendMode(Phaser.BlendModes.ADD);

    // LAYER 3: Player, always drawn above the room
    this.player = new Player(this, SPAWN_X, SPAWN_Y);
    this.player.setDepth(900);

    this.hoverLabel = this.add.text(0, 0, '', {
      fontFamily: 'monospace',
      fontSize: '11px',
      color: '#f3f2e6',
      backgroundColor: '#0d1813',
      padding: { x: 6, y: 4 },
    });
    this.hoverLabel.setDepth(1200);
    this.hoverLabel.setVisible(false);
    this.physics.world.setBounds(0, 0, canvas.width_px, canvas.height_px);

    // Walls + major furniture block movement; small decorations and the
    // doorway do not (see collisionHelpers.ts for the exact rules).
    const collisionGroup = buildCollisionGroup(this);
    this.physics.add.collider(this.player, collisionGroup);

    // LAYER 4: Sockets - small pixel indicators that glow on approach
    this.sockets = socketDefinitions.map(def => new Socket(this, def));
    this.keyE = this.input.keyboard!.addKey('E');

    this.roomNumber = readRawSession()?.roomNumber?.trim() || 'demo';
    const auditProgress = readAuditProgress(this.roomNumber);
    auditProgress.connectedTargetIds.forEach(targetId => {
      const appliance = this.appliancesByTargetId.get(targetId);
      const socket = this.sockets.find(candidate => candidate.definition.id === targetId);
      if (!appliance || !socket) return;
      appliance.install();
      if (auditProgress.powerByTargetId[targetId] === false) appliance.setOn(false);
      socket.occupy();
    });

    // React requests an install (from a socket walk-up or a custom
    // placeholder click), a power toggle, a removal, or a custom appliance
    // drop; this scene owns whether it's valid and actually flips the state.
    gameEvents.on(GAME_EVENTS.APPLIANCE_INSTALL_REQUEST, this.handleInstallRequest, this);
    gameEvents.on(GAME_EVENTS.APPLIANCE_PLACE_CUSTOM_REQUEST, this.handlePlaceCustomRequest, this);
    gameEvents.on(GAME_EVENTS.APPLIANCE_TOGGLE_POWER_REQUEST, this.handleTogglePowerRequest, this);
    gameEvents.on(GAME_EVENTS.APPLIANCE_REMOVE_REQUEST, this.handleRemoveRequest, this);
    gameEvents.on(GAME_EVENTS.PLAYER_MOVE_REQUEST, this.handlePlayerMoveRequest, this);
    gameEvents.on(GAME_EVENTS.PLAYER_INTERACT_REQUEST, this.handlePlayerInteractRequest, this);
    const removeEventHandlers = () => {
      gameEvents.off(GAME_EVENTS.APPLIANCE_INSTALL_REQUEST, this.handleInstallRequest, this);
      gameEvents.off(GAME_EVENTS.APPLIANCE_PLACE_CUSTOM_REQUEST, this.handlePlaceCustomRequest, this);
      gameEvents.off(GAME_EVENTS.APPLIANCE_TOGGLE_POWER_REQUEST, this.handleTogglePowerRequest, this);
      gameEvents.off(GAME_EVENTS.APPLIANCE_REMOVE_REQUEST, this.handleRemoveRequest, this);
      gameEvents.off(GAME_EVENTS.PLAYER_MOVE_REQUEST, this.handlePlayerMoveRequest, this);
      gameEvents.off(GAME_EVENTS.PLAYER_INTERACT_REQUEST, this.handlePlayerInteractRequest, this);
    };
    // Phaser can destroy a game without dispatching Scene SHUTDOWN first.
    // Listening for both lifecycle exits keeps the module-level React/Phaser
    // bus from retaining handlers bound to dead sprites after navigation.
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, removeEventHandlers);
    this.events.once(Phaser.Scenes.Events.DESTROY, removeEventHandlers);

    // Status text (temporary)
    // Debug label removed — it read 'Apartment from JSON (exact transcription)'
    // on screen, which is a developer note, not something a resident should see.
    const statusText = this.add.text(10, 10, '', {
      fontSize: '12px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 4, y: 2 },
    });
    statusText.setDepth(1000); // Always on top
  }

  /**
   * Render all floor/wall tiles at their exact grid positions
   */
  private renderTiles(tiles: typeof apartmentLayout.tiles, tileSize: number): void {
    const tileGroup = this.add.group();

    tiles.forEach(tile => {
      const key = this.getTileKey(tile.file);
      const x = tile.tile_x * tileSize;
      const y = tile.tile_y * tileSize;

      const sprite = this.add.image(x, y, key);
      sprite.setOrigin(0, 0);
      sprite.setScale(2); // 8×8 native → 16×16 on-screen
      tileGroup.add(sprite);
    });

    console.log(`Rendered ${tiles.length} tiles`);
  }

  /**
   * Render all furniture at exact pixel positions with rotation
   */
  private renderFurniture(furniture: typeof apartmentLayout.furniture): Map<string, Phaser.GameObjects.Image> {
    const furnitureGroup = this.add.group();
    const spritesByName = new Map<string, Phaser.GameObjects.Image>();

    furniture.forEach(item => {
      const key = this.getFurnitureKey(item.file);

      // Exact pixel position from JSON
      const x = item.x_px;
      const y = item.y_px;

      const sprite = this.add.image(x, y, key);
      sprite.setOrigin(0, 0); // Top-left origin before rotation

      // Calculate scale: width_px / native_w (should be 2 for most items)
      const scaleX = item.width_px / item.native_w;
      const scaleY = item.height_px / item.native_h;
      sprite.setScale(scaleX, scaleY);

      // Apply rotation if specified
      if (item.rotation_deg !== 0) {
        // Convert degrees to radians
        const radians = Phaser.Math.DegToRad(item.rotation_deg);

        // For rotation, we need to adjust the origin to rotate around the center
        // Then offset position to account for the rotated bounding box
        sprite.setOrigin(0.5, 0.5);
        sprite.setPosition(x + item.width_px / 2, y + item.height_px / 2);
        sprite.setRotation(radians);

        console.log(`Rotated ${item.name} (layer ${item.layer}) by ${item.rotation_deg}°`);
      }

      sprite.setDepth(item.layer); // Use layer as depth for proper z-ordering
      furnitureGroup.add(sprite);
      spritesByName.set(item.name, sprite);
    });

    console.log(`Rendered ${furniture.length} furniture items`);
    return spritesByName;
  }

  /**
   * Get Phaser texture key for a tile sprite
   */
  private getTileKey(filename: string): string {
    const normalized = normalizeSpritePath(filename, 'tile');
    return 'tile_' + normalized.replace('.png', '').replace(/[^a-zA-Z0-9]/g, '_');
  }

  /**
   * Get Phaser texture key for a furniture sprite
   */
  private getFurnitureKey(filename: string): string {
    const normalized = normalizeSpritePath(filename, 'furniture');
    return 'furniture_' + normalized.replace('.png', '').replace(/[^a-zA-Z0-9]/g, '_');
  }

  update() {
    this.player.update();
    this.updateSocketProximity();
    this.updateHeatAura();
  }

  /**
   * Hover an appliance to read it without walking over and scanning. The
   * label follows the appliance rather than the cursor, so it does not jitter.
   */
  private wireApplianceHover(appliance: Appliance): void {
    appliance.onHover(
      () => {
        const c = appliance.getCentre();
        const state = appliance.isDrawing() ? '' : '  (off)';
        this.hoverLabel.setText(
          `${appliance.info.name}  ${appliance.info.dailyKwh} kWh/day${state}`,
        );
        this.hoverLabel.setPosition(
          c.x - this.hoverLabel.width / 2,
          c.y - this.hoverLabel.height - 14,
        );
        this.hoverLabel.setVisible(true);
      },
      () => this.hoverLabel.setVisible(false),
    );
  }

  /**
   * Colour and size follow the nearest drawing appliance, falling off with
   * distance. Green when the flat is quiet, red when standing next to
   * something hungry.
   */
  private updateHeatAura(): void {
    const RANGE = 140;
    let heat = 0;

    for (const appliance of this.appliancesByTargetId.values()) {
      if (!appliance.isDrawing()) continue;
      const c = appliance.getCentre();
      const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, c.x, c.y);
      if (dist > RANGE) continue;
      // Normalised draw, 0-1, against a hungry appliance at ~6 kWh/day.
      const draw = Math.min(1, appliance.info.dailyKwh / 6);
      heat = Math.max(heat, draw * (1 - dist / RANGE));
    }

    const t = Phaser.Math.Clamp(heat, 0, 1);
    const cool = Phaser.Display.Color.ValueToColor(0x9be564);
    const hot = Phaser.Display.Color.ValueToColor(0xff7a6b);
    const mix = Phaser.Display.Color.Interpolate.ColorWithColor(cool, hot, 100, t * 100);

    this.heatAura.setPosition(this.player.x, this.player.y - 4);
    this.heatAura.setFillStyle(
      Phaser.Display.Color.GetColor(mix.r, mix.g, mix.b),
      0.16 + t * 0.3,
    );
    const size = 84 + t * 60;
    this.heatAura.setSize(size, size / 2);
  }

  private updateSocketProximity(): void {
    const found = this.sockets.reduce<{ socket: Socket; dist: number } | undefined>(
      (best, socket) => {
        const dist = socket.distanceTo(this.player.x, this.player.y);
        const near = !socket.isOccupied() && dist <= INTERACTION_RADIUS;
        socket.setNear(near);
        if (near && (!best || dist < best.dist)) {
          return { socket, dist };
        }
        return best;
      },
      undefined
    );

    const newNearestId = found?.socket.definition.id;
    if (newNearestId !== this.nearestSocketId) {
      this.nearestSocketId = newNearestId;
      if (found) {
        gameEvents.emit(GAME_EVENTS.SOCKET_NEAR, {
          socketId: found.socket.definition.id,
          purpose: found.socket.definition.purpose,
          occupied: found.socket.isOccupied(),
        });
      } else {
        gameEvents.emit(GAME_EVENTS.SOCKET_FAR);
      }
    }

    if (found && Phaser.Input.Keyboard.JustDown(this.keyE)) {
      this.emitInteract(found.socket.definition.id, found.socket.definition.purpose);
    }
  }

  /** Shared click routing for both fixed appliance sprites and custom placeholders. */
  private wireApplianceClick(appliance: Appliance, targetId: string, purpose: string): void {
    appliance.onClick(() => {
      if (appliance.isInstalled()) {
        gameEvents.emit(GAME_EVENTS.APPLIANCE_CLICKED, {
          installTargetId: targetId,
          appliance: appliance.info,
          isOn: appliance.isOn(),
        });
      } else {
        this.emitInteract(targetId, purpose);
      }
    });
  }

  private emitInteract(installTargetId: string, purpose: string): void {
    const appliance = this.appliancesByTargetId.get(installTargetId);
    if (!appliance || appliance.isInstalled()) return;
    gameEvents.emit(GAME_EVENTS.APPLIANCE_INTERACT, {
      installTargetId,
      purpose,
      appliance: appliance.info,
    });
  }

  private handleInstallRequest(payload: ApplianceInstallRequestPayload): void {
    const appliance = this.appliancesByTargetId.get(payload.installTargetId);
    if (!appliance || appliance.isInstalled()) return;

    appliance.install();

    const socket = this.sockets.find(s => s.definition.id === payload.installTargetId);
    socket?.occupy();
    if (socket) connectAuditTarget(this.roomNumber, payload.installTargetId);

    gameEvents.emit(GAME_EVENTS.APPLIANCE_INSTALLED, {
      installTargetId: payload.installTargetId,
      appliance: appliance.info,
    });
  }

  private handleTogglePowerRequest(payload: ApplianceTogglePowerRequestPayload): void {
    const appliance = this.appliancesByTargetId.get(payload.installTargetId);
    if (!appliance || !appliance.isInstalled()) return;

    appliance.setOn(!appliance.isOn());
    if (this.sockets.some(socket => socket.definition.id === payload.installTargetId)) {
      setAuditTargetPower(this.roomNumber, payload.installTargetId, appliance.isOn());
    }

    gameEvents.emit(GAME_EVENTS.APPLIANCE_POWER_CHANGED, {
      installTargetId: payload.installTargetId,
      appliance: appliance.info,
      isOn: appliance.isOn(),
    });
  }

  /**
   * A fixed appliance (fridge, TV, etc.) is part of the static room - removing
   * it means unplugging it, so it stays in place and its socket opens back up
   * for a future install. A custom placeholder only exists because the player
   * dragged it in, so removing it deletes the sprite entirely.
   */
  private handleRemoveRequest(payload: ApplianceRemoveRequestPayload): void {
    const appliance = this.appliancesByTargetId.get(payload.installTargetId);
    if (!appliance || !appliance.isInstalled()) return;

    const info = appliance.info;

    if (info.isCustom) {
      appliance.destroy();
      this.appliancesByTargetId.delete(payload.installTargetId);
    } else {
      appliance.uninstall();
      const socket = this.sockets.find(s => s.definition.id === payload.installTargetId);
      socket?.release();
      disconnectAuditTarget(this.roomNumber, payload.installTargetId);
    }

    gameEvents.emit(GAME_EVENTS.APPLIANCE_REMOVED, {
      installTargetId: payload.installTargetId,
      appliance: info,
    });
  }

  private handlePlayerMoveRequest(payload: PlayerMoveRequestPayload): void {
    this.player.setVirtualDirection(payload.x, payload.y);
  }

  private handlePlayerInteractRequest(): void {
    if (!this.nearestSocketId) return;
    const socket = this.sockets.find(candidate => candidate.definition.id === this.nearestSocketId);
    if (socket) this.emitInteract(socket.definition.id, socket.definition.purpose);
  }

  /** Drops a new placeholder tile where the player dragged a custom appliance from the palette. */
  private handlePlaceCustomRequest(payload: PlaceCustomAppliancePayload): void {
    const customType = customApplianceTypes.find(t => t.type === payload.customType);
    if (!customType) return;

    this.customApplianceCounter += 1;
    const targetId = `custom-${customType.type}-${this.customApplianceCounter}`;

    const { container, background } = this.createPlaceholderVisual(payload.x, payload.y, customType);

    const info: AppliancePayload = {
      id: targetId,
      name: customType.name,
      dailyKwh: customType.dailyKwh,
      hoursPerDay: customType.hoursPerDay,
      tip: customType.tip,
      isCustom: true,
    };

    const appliance = new Appliance(this, info, container, () => {
      background.setFillStyle(customType.color, 1);
      background.setStrokeStyle(0);
    });
    this.wireApplianceClick(appliance, targetId, customType.name);
    this.appliancesByTargetId.set(targetId, appliance);
  }

  private createPlaceholderVisual(
    x: number,
    y: number,
    customType: CustomApplianceType
  ): { container: Phaser.GameObjects.Container; background: Phaser.GameObjects.Rectangle } {
    const background = this.add.rectangle(0, 0, PLACEHOLDER_SIZE, PLACEHOLDER_SIZE, customType.color, 0.35);
    background.setStrokeStyle(2, customType.color, 1);
    const icon = this.add.text(0, 0, customType.icon, { fontSize: '16px' }).setOrigin(0.5);

    const container = this.add.container(x, y, [background, icon]);
    container.setSize(PLACEHOLDER_SIZE, PLACEHOLDER_SIZE);
    container.setDepth(950);
    container.setInteractive(
      new Phaser.Geom.Rectangle(-PLACEHOLDER_SIZE / 2, -PLACEHOLDER_SIZE / 2, PLACEHOLDER_SIZE, PLACEHOLDER_SIZE),
      Phaser.Geom.Rectangle.Contains
    );

    return { container, background };
  }
}
