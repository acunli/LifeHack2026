# Lane B Room Builder

**Visual apartment construction tool for WattWise**

## What It Does

The Room Builder is a complete visual development tool that allows you to:

1. **Select sprites** from pixel-art sprite sheets
2. **Build a palette** of reusable sprites
3. **Construct an apartment** visually on a grid canvas
4. **Arrange objects** with drag-and-drop
5. **Export production files** ready for the React application

This tool eliminates the need to manually write sprite coordinates or object positions in code.

## Quick Start

### Launch the tool:

```bash
cd /Users/ayushmanchaudhuri/LifeHack2026/tools/sprite-selector
./launch.sh
```

Open: `http://localhost:8765/tools/sprite-selector/`

### Basic workflow:

1. **LEFT**: Select sprites from sprite sheets → Add to palette
2. **CENTER**: Place and arrange objects on the room canvas
3. **RIGHT**: Manage your sprite palette and placed objects
4. **BOTTOM**: Export spriteMap.ts and apartmentLayout.ts

## Key Features

### Sprite Selection (Left Panel)
- Browse Interiors and Room Builder sprite sheets
- Drag-select rectangular regions
- Multi-tile sprite support
- Grid-aligned selection
- Visual preview

### Room Construction (Center Panel)
- Configurable room dimensions (10-50 × 10-40 tiles)
- Three build modes:
  - **SELECT**: Edit existing objects
  - **PLACE**: Add new objects
  - **PAINT**: Fill areas with tiles
- Real-time canvas rendering
- Grid overlay and snapping
- Preview mode

### Object Management (Right Panel)
- Sprite palette with thumbnails
- Placed objects list
- Object properties editor
- Z-index control
- Duplicate/Delete actions

### Advanced Features
- **Undo/Redo**: Full history tracking (50 actions)
- **Drag and drop**: Move objects visually
- **Z-order control**: Layer management
- **Save/Load**: JSON export/import
- **localStorage**: Auto-save on changes
- **Validation**: Pre-export error checking

### Export System
- **spriteMap.ts**: All sprite definitions
- **apartmentLayout.ts**: Complete room layout
- **Validation**: Ensures data integrity
- **Copy/Download**: Multiple export options

## Build Modes

| Mode | Purpose | How to Use |
|------|---------|------------|
| **SELECT** | Edit objects | Click object → Drag to move → Delete/Edit |
| **PLACE** | Add objects | Select palette sprite → Click canvas → Object placed |
| **PAINT** | Fill tiles | Select 1×1 sprite → Click/drag canvas → Area filled |

## Keyboard Shortcuts

- `Delete` or `Backspace` — Delete selected object
- `Ctrl+Z` / `Cmd+Z` — Undo
- `Ctrl+Y` / `Cmd+Y` — Redo

## File Structure

```
tools/sprite-selector/
├── index.html               — Main UI
├── room-builder.js          — Complete functionality
├── launch.sh                — Quick launch script
├── README.md                — This file
├── ROOM-BUILDER-GUIDE.md    — Detailed guide
└── QUICKSTART.md            — Quick reference
```

## Exported Files

The tool generates two TypeScript files:

### spriteMap.ts
```typescript
export const spriteMap = {
  bed: {
    sheet: "interiors",
    col: 5,
    row: 0,
    width: 4,
    height: 3,
  },
  // ... more sprites
};
```

### apartmentLayout.ts
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
    // ... more objects
  ],
};
```

These files can be directly copied into the main WattWise application.

## Integration

The exported data is designed to work with `ApartmentRoom.tsx`:

1. Copy exported files to `data/` directory
2. Import in component:
   ```typescript
   import { spriteMap } from '../data/spriteMap';
   import { apartmentLayout } from '../data/apartmentLayout';
   ```
3. Render using CSS background-position cropping

No canvas or game engine required — pure DOM/CSS rendering.

## Validation

Before export, the tool validates:
- All sprites properly defined
- Objects within room bounds
- Valid coordinates (integers)
- Proper sprite references
- Room dimensions in valid range

Errors are displayed with specific fix instructions.

## Data Persistence

- **Auto-save**: localStorage (survives page refresh)
- **Manual save**: Download JSON file
- **Load**: Import previously saved JSON

## Technical Details

- **Tile size**: 32×32 pixels
- **Default room**: 24×18 tiles (768×576 px)
- **Max history**: 50 undo steps
- **Coordinate system**: Zero-based (0,0 = top-left)
- **Rendering**: HTML5 Canvas with pixelated rendering
- **Dependencies**: None (vanilla JavaScript)

## Common Use Cases

### Build a complete apartment
1. Paint floor across entire room
2. Paint walls around perimeter
3. Place door
4. Add bedroom furniture (bed, nightstand)
5. Add living room furniture (sofa, TV)
6. Add kitchen furniture (fridge, counter, table, chairs)
7. Adjust z-indexes for proper layering
8. Preview and export

### Create reusable room templates
1. Build a room layout
2. Save as JSON
3. Distribute to team
4. Load and modify as needed

## Tips

- Start with floor tiles in Paint mode
- Use Place mode for unique furniture
- Duplicate for repeated objects (chairs)
- Preview frequently to check appearance
- Save JSON backups before major changes
- Export early and often during development

## What This Tool Is NOT

- ❌ Not a game engine
- ❌ Not part of the final application
- ❌ Not a general-purpose editor
- ❌ Not for animations or complex interactions

This is a **development tool for Lane B** to visually construct ONE static apartment for the WattWise MVP.

## Documentation

- **README.md** (this file) — Overview
- **ROOM-BUILDER-GUIDE.md** — Complete step-by-step guide
- **QUICKSTART.md** — Quick reference

## Support

This is a temporary development tool. For questions or issues:
- Check ROOM-BUILDER-GUIDE.md for detailed workflows
- Verify sprite sheets are accessible
- Check browser console for errors
- Ensure localStorage is enabled

## Version

- **Tool**: Lane B Room Builder v2.0
- **Generated exports**: Compatible with WattWise MVP
- **Last updated**: 2026-08-29
