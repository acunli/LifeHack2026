/**
 * Socket - a wall outlet the player can plug an appliance into.
 *
 * Rendered as a small pixel indicator: subtle when idle, glowing when the
 * player is within interaction range. Occupied sockets stop glowing since
 * they no longer accept new appliances.
 */

import * as Phaser from 'phaser';
import type { SocketDefinition } from '../data/socketDefinitions';

const IDLE_RADIUS = 3;
const GLOW_RADIUS = 6;
const IDLE_COLOR = 0xffe066;
const GLOW_COLOR = 0x4ade80;
const OCCUPIED_COLOR = 0x666666;

export default class Socket extends Phaser.GameObjects.Container {
  readonly definition: SocketDefinition;
  private dot: Phaser.GameObjects.Arc;
  private glow: Phaser.GameObjects.Arc;
  private isNear = false;
  private occupied: boolean;

  constructor(scene: Phaser.Scene, definition: SocketDefinition) {
    super(scene, definition.x, definition.y);
    this.definition = definition;
    this.occupied = definition.occupied;

    this.glow = scene.add.circle(0, 0, GLOW_RADIUS, GLOW_COLOR, 0.35);
    this.glow.setVisible(false);

    this.dot = scene.add.circle(0, 0, IDLE_RADIUS, IDLE_COLOR, 1);

    this.add([this.glow, this.dot]);
    this.setDepth(800);
    scene.add.existing(this);

    this.refreshVisual();
  }

  setNear(near: boolean): void {
    if (this.isNear === near) return;
    this.isNear = near;
    this.refreshVisual();
  }

  isOccupied(): boolean {
    return this.occupied;
  }

  occupy(): void {
    this.occupied = true;
    this.isNear = false;
    this.refreshVisual();
  }

  /** Frees the socket back up after its appliance is removed. */
  release(): void {
    this.occupied = false;
    this.refreshVisual();
  }

  private refreshVisual(): void {
    if (this.isOccupied()) {
      this.glow.setVisible(false);
      this.dot.setFillStyle(OCCUPIED_COLOR, 1);
      this.dot.setRadius(IDLE_RADIUS);
      return;
    }
    this.glow.setVisible(this.isNear);
    this.dot.setFillStyle(this.isNear ? GLOW_COLOR : IDLE_COLOR, 1);
    this.dot.setRadius(this.isNear ? GLOW_RADIUS * 0.6 : IDLE_RADIUS);
  }

  distanceTo(x: number, y: number): number {
    return Phaser.Math.Distance.Between(this.x, this.y, x, y);
  }
}
