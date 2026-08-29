/**
 * PreloadScene - Asset loading from apartment_layout.json
 * Loads all tiles and furniture sprites specified in the JSON
 */

import * as Phaser from 'phaser';
import { getRequiredSprites } from '../data/apartmentMap';

export default class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PreloadScene' });
  }

  preload() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    const loadingText = this.add.text(width / 2, height / 2, 'Loading apartment...', {
      fontSize: '20px',
      color: '#ffffff',
    });
    loadingText.setOrigin(0.5, 0.5);

    // Progress bar
    const progressBar = this.add.graphics();
    const progressBox = this.add.graphics();
    progressBox.fillStyle(0x222222, 0.8);
    progressBox.fillRect(width / 2 - 160, height / 2 + 20, 320, 30);

    this.load.on('progress', (value: number) => {
      progressBar.clear();
      progressBar.fillStyle(0x4ade80, 1);
      progressBar.fillRect(width / 2 - 150, height / 2 + 25, 300 * value, 20);
    });

    this.load.on('complete', () => {
      progressBar.destroy();
      progressBox.destroy();
      loadingText.destroy();
    });

    // Get required sprites from JSON
    const required = getRequiredSprites();

    // Load all furniture sprites
    const furniturePath = '/game-assets/sierrassets/furniture/';
    required.furniture.forEach(filename => {
      // Use filename without extension as the key
      const key = 'furniture_' + filename.replace('.png', '').replace(/[^a-zA-Z0-9]/g, '_');
      this.load.image(key, furniturePath + filename);
    });

    // Load all tile sprites
    const tilesPath = '/game-assets/sierrassets/tiles/';
    required.tiles.forEach(filename => {
      const key = 'tile_' + filename.replace('.png', '').replace(/[^a-zA-Z0-9]/g, '_');
      this.load.image(key, tilesPath + filename);
    });

    // Load player character sheet: 4 static facings, 16x32 each
    // (left, back, right, front - see AGENTS.md asset facts)
    this.load.spritesheet(
      'player_adam',
      '/game-assets/sierrassets/characters/Adam_idle_16x16.png',
      { frameWidth: 16, frameHeight: 32 }
    );
  }

  create() {
    this.scene.start('ApartmentScene');
  }
}
