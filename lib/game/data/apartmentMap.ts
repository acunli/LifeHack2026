/**
 * Apartment Map Data - Parsed from apartment_layout.json
 *
 * This is a FAITHFUL TRANSCRIPTION of the user-designed apartment layout.
 * Every tile and furniture piece is placed exactly as specified in the JSON.
 *
 * DO NOT modify positions, sizes, rotations, or layer order.
 */

import apartmentLayoutData from '../../../apartment_layout.json';

export interface TileEntry {
  tile_x: number;
  tile_y: number;
  file: string;
  name: string;
}

export interface FurnitureEntry {
  layer: number;
  name: string;
  file: string;
  tile_x: number;
  tile_y: number;
  x_px: number;
  y_px: number;
  width_px: number;
  height_px: number;
  native_w: number;
  native_h: number;
  rotation_deg: number;
}

export interface ApartmentLayoutData {
  canvas: {
    tile_size: number;
    cols: number;
    rows: number;
    width_px: number;
    height_px: number;
    note: string;
  };
  tiles: TileEntry[];
  furniture: FurnitureEntry[];
}

// Export the parsed JSON data
export const apartmentLayout: ApartmentLayoutData = apartmentLayoutData as ApartmentLayoutData;

/**
 * Helper to convert JSON file names to asset paths
 * JSON uses "partSlice N.png" and "Slice N.png"
 * Files use "part-Slice N.png" and "Slice N.png"
 */
export function normalizeSpritePath(filename: string, type: 'furniture' | 'tile'): string {
  // Handle furniture sprites: "partSlice N.png" -> "part-Slice N.png"
  if (type === 'furniture') {
    return filename.replace(/^partSlice/, 'part-Slice');
  }
  // Tile sprites use "Slice N.png" which matches the file names
  return filename;
}

/**
 * Get unique list of all sprite files needed
 */
export function getRequiredSprites(): { furniture: string[]; tiles: string[] } {
  const furnitureSet = new Set<string>();
  const tileSet = new Set<string>();

  apartmentLayout.furniture.forEach(item => {
    furnitureSet.add(normalizeSpritePath(item.file, 'furniture'));
  });

  apartmentLayout.tiles.forEach(tile => {
    tileSet.add(normalizeSpritePath(tile.file, 'tile'));
  });

  return {
    furniture: Array.from(furnitureSet).sort(),
    tiles: Array.from(tileSet).sort(),
  };
}
