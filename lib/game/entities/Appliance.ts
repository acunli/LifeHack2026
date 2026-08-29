/**
 * Appliance - wraps a visual (an existing furniture sprite for the 5 fixed
 * appliances, or a placeholder tile for a custom one) and turns it into an
 * interactive, energy-consuming appliance once installed.
 *
 * Fixed appliances reuse the sprite already rendered in Checkpoint 2's
 * static room - no duplicate is spawned. Custom appliances get a small
 * placeholder tile created where the player dropped it.
 *
 * The visual is clickable from the moment it exists: before install, a
 * click opens the install-confirm modal (ApartmentScene routes this based
 * on `isInstalled()`); after install, a click opens the inspect panel.
 */

import * as Phaser from 'phaser';
import type { AppliancePayload } from '../utils/gameEvents';

export type ApplianceVisual = Phaser.GameObjects.Image | Phaser.GameObjects.Container;

export default class Appliance {
  readonly info: AppliancePayload;
  private visual: ApplianceVisual;
  private powerDot: Phaser.GameObjects.Arc;
  private installed = false;
  private onInstallEffect?: () => void;

  constructor(
    scene: Phaser.Scene,
    info: AppliancePayload,
    visual: ApplianceVisual,
    onInstallEffect?: () => void
  ) {
    this.info = info;
    this.visual = visual;
    this.onInstallEffect = onInstallEffect;

    const bounds = visual.getBounds();
    this.powerDot = scene.add.circle(bounds.right - 2, bounds.top + 2, 2.5, 0x4ade80, 1);
    this.powerDot.setDepth(('depth' in visual ? visual.depth : 0) + 1);
    this.powerDot.setVisible(false);
  }

  /**
   * The caller is responsible for calling `setInteractive` on the visual
   * first (a Container needs an explicit hit area, an Image doesn't) - this
   * just attaches the click routing.
   */
  onClick(handler: () => void): void {
    this.visual.on('pointerdown', handler);
  }

  install(): void {
    if (this.installed) return;
    this.installed = true;
    this.powerDot.setVisible(true);
    this.onInstallEffect?.();
  }

  isInstalled(): boolean {
    return this.installed;
  }
}
