# Lane B Room Builder — Complete Guide

## Overview

The Room Builder is a visual apartment construction tool that allows you to:
1. Select sprites from the sprite sheets
2. Build a sprite palette
3. Place and arrange objects on a canvas
4. Export production-ready TypeScript files

## How to Launch

```bash
cd /Users/ayushmanchaudhuri/LifeHack2026/tools/sprite-selector
./launch.sh
```

Then open: `http://localhost:8765/tools/sprite-selector/`

## Interface Layout

The interface has three main panels:

### LEFT PANEL: Sprite Sheet Selector
- Browse the Interiors and Room Builder sprite sheets
- Select rectangular regions from the sheets
- Add sprites to your palette with semantic names

### CENTER PANEL: Apartment Canvas
- Visual grid where you construct the apartment
- Configurable room dimensions (default: 24×18 tiles)
- Interactive placement and arrangement of objects

### RIGHT PANEL: Palette & Objects
- **Sprite Palette**: All sprites you've added
- **Placed Objects**: List of objects in the room
- **Properties**: Edit selected object properties

## Complete Workflow

### PHASE 1: Build Your Sprite Palette

1. **Select a sprite sheet**
   - Choose "Interiors 32×32" or "Room Builder 32×32" from dropdown

2. **Adjust zoom if needed**
   - Click 2× or 3× for better visibility

3. **Select a sprite**
   - Click and drag across the sprite sheet
   - Selection automatically snaps to 32×32 grid
   - Multi-tile objects (beds, sofas) can span multiple cells

4. **Name the sprite**
   - Enter a semantic name (e.g., "bed", "sofa", "floor")

5. **Add to palette**
   - Click "Add to Palette"
   - Sprite appears in the right panel

6. **Repeat** for all sprites you need:
   - floor
   - wall
   - door
   - bed
   - nightstand
   - sofa
   - television
   - fridge
   - counter
   - table
   - chair

### PHASE 2: Configure Room

1. **Set room dimensions**
   - Default: 24 columns × 18 rows
   - Adjust in the room settings if needed
   - Valid range: 10-50 cols, 10-40 rows

2. **Choose canvas zoom**
   - 100% is recommended for building
   - Use 50% for overview
   - Use 150-200% for detail work

### PHASE 3: Build the Apartment

#### Mode 1: PAINT MODE (for floors and walls)

1. Click "Paint" mode button
2. Select a 1×1 sprite from palette (floor or wall)
3. Click and drag across the canvas to paint tiles
4. Great for filling large areas quickly

#### Mode 2: PLACE MODE (for furniture)

1. Click "Place" mode button
2. Select a sprite from the palette
3. Click on the canvas to place the object
4. Object snaps to grid
5. Repeat for all furniture

#### Mode 3: SELECT MODE (for editing)

1. Click "Select" mode button
2. Click on any placed object to select it
3. Drag to move it
4. Use properties panel to adjust z-index
5. Delete or duplicate as needed

### PHASE 4: Arrange and Polish

1. **Layer objects correctly**
   - Floor tiles should be at the back (low z-index)
   - Furniture should be in front (higher z-index)
   - Select object → Properties → "To Front/Back"

2. **Fine-tune positions**
   - Drag objects to exact positions
   - Use grid to align properly

3. **Duplicate repeated objects**
   - Chairs, wall tiles, etc.
   - Select object → "Duplicate" button
   - Saves time vs. placing individually

4. **Preview the result**
   - Click "Preview" button
   - Hides grid and UI overlays
   - Shows final appearance
   - Click "Edit Mode" to continue working

### PHASE 5: Save Your Work

1. **Auto-save**
   - Room automatically saves to browser localStorage
   - Survives page refreshes

2. **Manual save**
   - Click "Save JSON"
   - Downloads `room-data.json`
   - Contains all sprites and placements

3. **Load saved room**
   - Click "Load JSON"
   - Select previously saved `room-data.json`
   - Restores entire room state

### PHASE 6: Export for Production

1. **Click "Show Export Panel"**
   - Opens export section at bottom

2. **Check for validation errors**
   - Tool automatically validates:
     - All objects within room bounds
     - Valid sprite references
     - Integer coordinates
     - Proper dimensions

3. **If errors exist**
   - Red error box appears
   - Fix each error
   - Re-open export panel

4. **Export files**
   - **Download spriteMap.ts**: Contains all sprite definitions
   - **Download apartmentLayout.ts**: Contains room layout
   - **Download Both Files**: Gets both at once
   - Or use "Copy" buttons to copy code to clipboard

5. **What gets exported**

**spriteMap.ts:**
```typescript
export const spriteMap = {
  bed: {
    sheet: "interiors",
    col: 5,
    row: 0,
    width: 4,
    height: 3,
  },
  // ... all your sprites
};
```

**apartmentLayout.ts:**
```typescript
export const apartmentLayout = {
  cols: 24,
  rows: 18,
  objects: [
    {
      id: "bed-1",
      sprite: "bed",
      x: 5,
      y: 3,
      zIndex: 10,
    },
    // ... all placed objects
  ],
};
```

## Build Modes Explained

### SELECT Mode
- **Purpose**: Edit existing objects
- **Controls**:
  - Click object → select it
  - Drag → move object
  - Properties panel → adjust z-index
  - Delete key → remove object

### PLACE Mode
- **Purpose**: Add new objects
- **Controls**:
  - Click palette sprite → activate it
  - Click canvas → place object at that position
  - Object automatically snaps to grid

### PAINT Mode
- **Purpose**: Fill large areas with 1×1 tiles
- **Controls**:
  - Select 1×1 sprite (floor/wall)
  - Click or drag on canvas
  - Paints continuously while dragging
- **Restriction**: Only works with single-tile sprites

## Keyboard Shortcuts

- **Delete / Backspace**: Delete selected object (in Select mode)
- **Ctrl+Z / Cmd+Z**: Undo
- **Ctrl+Y / Cmd+Y**: Redo
- **Ctrl+Shift+Z / Cmd+Shift+Z**: Redo (alternate)

## Undo/Redo System

- Tracks up to 50 actions
- Actions that trigger undo snapshots:
  - Placing an object
  - Moving an object
  - Deleting an object
  - Duplicating an object
  - Changing z-index
  - Clearing room

## Object Properties

When an object is selected, you can:

- **View**: ID, sprite, position, size, z-index
- **Move**: Drag on canvas
- **Layer Control**:
  - **To Front**: Move to topmost layer
  - **Forward**: Move one layer up
  - **Backward**: Move one layer down
  - **To Back**: Move to bottommost layer
- **Duplicate**: Create a copy
- **Delete**: Remove from room

## Z-Index Tips

- **Floors**: z-index 0-9
- **Walls**: z-index 10-19
- **Large furniture**: z-index 20-50
- **Small objects**: z-index 51-100
- **Decorations**: z-index 101+

The tool automatically assigns reasonable z-indexes, but you can manually adjust them.

## Validation Rules

Before export, the tool checks:

1. ✓ At least one sprite exists
2. ✓ All placed objects reference valid sprites
3. ✓ No objects extend beyond room bounds
4. ✓ All positions are integers
5. ✓ All z-indexes are valid numbers
6. ✓ Room dimensions are within valid range

## Common Workflows

### Building a Bedroom

1. Paint mode → floor tiles across entire area
2. Paint mode → wall tiles along edges
3. Place mode → bed
4. Place mode → nightstand
5. Select mode → arrange furniture
6. Adjust z-indexes so floor is behind furniture

### Building a Kitchen

1. Paint mode → floor
2. Place mode → counter along wall
3. Place mode → fridge, table, chairs
4. Select mode → fine-tune positions
5. Duplicate chairs for dining set

### Building a Complete Apartment

1. **Foundation**:
   - Paint floor across entire room
   - Paint walls around perimeter
   - Place door

2. **Zones**:
   - Bedroom area (bed, nightstand)
   - Living area (sofa, TV)
   - Kitchen (counter, fridge, table, chairs)

3. **Polish**:
   - Ensure all floors are z-index 0
   - Furniture properly layered
   - No objects overlapping unintentionally

4. **Preview**:
   - Check final appearance
   - Make adjustments

5. **Export**:
   - Validate
   - Download spriteMap.ts
   - Download apartmentLayout.ts

## Integration with Main Application

The exported files are designed to work directly with `ApartmentRoom.tsx`:

1. Copy `spriteMap.ts` → `data/spriteMap.ts`
2. Copy `apartmentLayout.ts` → `data/apartmentLayout.ts`
3. `ApartmentRoom.tsx` will import and render them using CSS/DOM (no canvas)

Each object renders as:
```tsx
<div
  style={{
    position: 'absolute',
    left: object.x * 32,
    top: object.y * 32,
    width: sprite.width * 32,
    height: sprite.height * 32,
    backgroundImage: `url(${SPRITE_SHEETS[sprite.sheet]})`,
    backgroundPosition: `-${sprite.col * 32}px -${sprite.row * 32}px`,
    imageRendering: 'pixelated',
    zIndex: object.zIndex,
  }}
/>
```

## Troubleshooting

**Grid not visible?**
- Increase canvas zoom to 100% or more

**Can't place an object?**
- Check if it fits within room bounds
- Multi-tile objects need space for their full size

**Object won't move?**
- Switch to Select mode
- Click object first, then drag

**Paint mode not working?**
- Only works with 1×1 sprites
- Select a floor or wall tile first

**Export shows errors?**
- Read validation messages carefully
- Fix objects that extend beyond room
- Ensure all sprites are properly defined

**Room looks different after reload?**
- Check if localStorage is enabled
- Use "Save JSON" for permanent backups

## File Sizes

- Typical sprite palette: 10-15 sprites
- Typical apartment: 50-200 placed objects
- spriteMap.ts: ~1-2 KB
- apartmentLayout.ts: ~5-15 KB
- room-data.json: ~10-50 KB

## Performance

- Room canvas renders at 60fps for rooms up to 50×40 tiles
- Supports 500+ placed objects before slowdown
- Undo history limited to 50 actions to preserve memory

## Next Steps After Export

1. Manually copy exported files into main WattWise application
2. Create `components/ApartmentRoom.tsx` to render the layout
3. Test rendering with actual sprite sheets
4. Adjust z-indexes if needed
5. Add interactivity (hover effects, tooltips, etc.)

This tool is for **development only** — it does NOT need to be deployed with the final application.
