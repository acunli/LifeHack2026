/**
 * ApartmentRoom — Static pixel-art apartment renderer
 *
 * Renders the finalized apartment layout from apartmentLayout.ts
 * using sprite sheets via CSS background-position cropping.
 *
 * Room dimensions: 23 columns × 18 rows at 32px per tile = 736×576px
 *
 * DO NOT modify this to add interactivity, hover, or game mechanics.
 * This component is ONLY the static visual renderer.
 */

import { apartmentLayout } from "@/data/apartmentLayout";
import { spriteMap, SPRITE_SHEETS, TILE_SIZE } from "@/data/spriteMap";

/**
 * Sprite sheet dimensions in pixels for background-size.
 * These match the actual PNG file dimensions at 32px tile scale.
 */
const SHEET_DIMENSIONS = {
  interiors: { width: 512, height: 2848 },
  roomBuilder: { width: 544, height: 736 },
} as const;

export default function ApartmentRoom() {
  const roomWidth = apartmentLayout.cols * TILE_SIZE;
  const roomHeight = apartmentLayout.rows * TILE_SIZE;

  return (
    <div
      className="apartment-room"
      style={{
        position: "relative",
        width: `${roomWidth}px`,
        height: `${roomHeight}px`,
        imageRendering: "pixelated",
      }}
    >
      {apartmentLayout.objects.map((obj) => {
        const sprite = spriteMap[obj.sprite];
        if (!sprite) {
          console.warn(`Sprite not found: ${obj.sprite}`);
          return null;
        }

        // Source coordinates in the sprite sheet (in pixels)
        const sourceX = sprite.col * TILE_SIZE;
        const sourceY = sprite.row * TILE_SIZE;

        // Display dimensions (sprite size in pixels)
        const displayWidth = sprite.width * TILE_SIZE;
        const displayHeight = sprite.height * TILE_SIZE;

        // Destination coordinates (placement in room)
        const displayX = obj.x * TILE_SIZE;
        const displayY = obj.y * TILE_SIZE;

        // Get the appropriate sprite sheet path and dimensions
        const sheetPath = `/assets/${SPRITE_SHEETS[sprite.sheet]}`;
        const sheetDimensions = SHEET_DIMENSIONS[sprite.sheet];

        return (
          <div
            key={obj.id}
            style={{
              position: "absolute",
              left: `${displayX}px`,
              top: `${displayY}px`,
              width: `${displayWidth}px`,
              height: `${displayHeight}px`,
              backgroundImage: `url('${sheetPath}')`,
              backgroundPosition: `-${sourceX}px -${sourceY}px`,
              backgroundSize: `${sheetDimensions.width}px ${sheetDimensions.height}px`,
              backgroundRepeat: "no-repeat",
              imageRendering: "pixelated",
              zIndex: obj.zIndex,
            }}
          />
        );
      })}
    </div>
  );
}
