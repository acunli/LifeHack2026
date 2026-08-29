/**
 * Collision helpers - builds static collider rectangles for walls and
 * major furniture from apartment_layout.json.
 *
 * Wall tiles were identified by visual inspection of the 16 tile sprites
 * used in this layout (see /scripts or the rendered reference crop): the
 * rose/salmon "Slice 6x/7x" tiles are wall segments, the wood/tile/green
 * sprites are floors. Small decorations (plants, lamps, wall-mounted items,
 * the doorway itself) are excluded so the player can walk through/around
 * them naturally, per the proposal's collision rules.
 */

import * as Phaser from 'phaser';
import { apartmentLayout, TileEntry, FurnitureEntry } from '../data/apartmentMap';

const WALL_TILE_FILES = new Set([
  'Slice 61.png', 'Slice 62.png', 'Slice 63.png', 'Slice 65.png', 'Slice 66.png',
  'Slice 68.png', 'Slice 69.png', 'Slice 71.png', 'Slice 72.png', 'Slice 73.png',
  'Slice 74.png', 'Slice 75.png',
]);

const NON_COLLIDING_FURNITURE = new Set([
  'Potted Cactus',
  'Potted Plant',
  'Floor Lamp',
  'Wall TV',
  'Curtain (tan/maroon)',
  'Easel',
  'Door (wood)',
  'Monitor (blue)',
  'Item 350',
]);

export function isWallTile(tile: TileEntry): boolean {
  return WALL_TILE_FILES.has(tile.file);
}

export function isCollidableFurniture(item: FurnitureEntry): boolean {
  return !NON_COLLIDING_FURNITURE.has(item.name);
}

/**
 * The tile layer has a wall tile ("Slice 73.png" at tile 22,20) sitting
 * directly under the door decoration, right in the middle of the doorway
 * gap the wall row otherwise leaves open at tile 22-23,19. The door sprite
 * visually hides it, but without this exclusion it silently blocks the only
 * path between the living room and the rest of the apartment. Any wall tile
 * whose cell falls inside a door's footprint is treated as open floor.
 */
function isUnderDoorway(tile: TileEntry, tileSize: number): boolean {
  const cellX = tile.tile_x * tileSize + tileSize / 2;
  const cellY = tile.tile_y * tileSize + tileSize / 2;
  return apartmentLayout.furniture.some(item => {
    if (item.name !== 'Door (wood)') return false;
    return (
      cellX >= item.x_px &&
      cellX <= item.x_px + item.width_px &&
      cellY >= item.y_px &&
      cellY <= item.y_px + item.height_px
    );
  });
}

/**
 * Builds a static physics group with one invisible rectangle per wall tile
 * and per collidable furniture item, ready to pass to `physics.add.collider`.
 */
export function buildCollisionGroup(scene: Phaser.Scene): Phaser.Physics.Arcade.StaticGroup {
  const group = scene.physics.add.staticGroup();
  const { tiles, furniture, canvas } = apartmentLayout;

  tiles
    .filter(isWallTile)
    .filter(tile => !isUnderDoorway(tile, canvas.tile_size))
    .forEach(tile => {
      const x = tile.tile_x * canvas.tile_size;
      const y = tile.tile_y * canvas.tile_size;
      addRect(scene, group, x, y, canvas.tile_size, canvas.tile_size);
    });

  furniture.filter(isCollidableFurniture).forEach(item => {
    const centerX = item.x_px + item.width_px / 2;
    const centerY = item.y_px + item.height_px / 2;

    // 90°/270° rotation swaps the on-screen bounding box dimensions
    // (ApartmentScene rotates sprites in place around their center).
    const rotated90 = item.rotation_deg === 90 || item.rotation_deg === 270;
    const boxW = rotated90 ? item.height_px : item.width_px;
    const boxH = rotated90 ? item.width_px : item.height_px;

    if (item.rotation_deg !== 0) {
      // Full bounding box for rotated items - keeps things simple and correct.
      addRect(scene, group, centerX - boxW / 2, centerY - boxH / 2, boxW, boxH);
      return;
    }

    // For upright furniture, only collide with a footprint near the base
    // so tall pieces (dressers, fridges) don't block the space in front of
    // them - the player can walk right up to and around them.
    const footprintHeight = Math.max(8, Math.round(boxH * 0.4));
    const y = item.y_px + boxH - footprintHeight;
    addRect(scene, group, item.x_px, y, boxW, footprintHeight);
  });

  return group;
}

function addRect(
  scene: Phaser.Scene,
  group: Phaser.Physics.Arcade.StaticGroup,
  x: number,
  y: number,
  width: number,
  height: number
): void {
  const rect = scene.add.rectangle(x + width / 2, y + height / 2, width, height);
  rect.setVisible(false);
  scene.physics.add.existing(rect, true);
  group.add(rect);
}
