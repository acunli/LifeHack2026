# Quick Reference — Lane B Room Builder

## Launch

```bash
cd /Users/ayushmanchaudhuri/LifeHack2026/tools/sprite-selector
./launch.sh
```

URL: `http://localhost:8765/tools/sprite-selector/`

## 3-Panel Interface

```
┌─────────────────┬──────────────────────┬─────────────────┐
│  LEFT           │  CENTER              │  RIGHT          │
│  Sprite Sheets  │  Room Canvas         │  Palette        │
│  (select tiles) │  (build apartment)   │  (your sprites) │
└─────────────────┴──────────────────────┴─────────────────┘
```

## Essential Workflow

### 1. Build Sprite Palette

**Left Panel:**
1. Select sheet (Interiors or Room Builder)
2. Zoom to 2× or 3×
3. Drag across tiles to select
4. Name it (e.g., "bed", "floor")
5. Click "Add to Palette"
6. Repeat for all needed sprites

**Minimum sprites needed:**
- floor (1×1)
- wall (1×1)
- door (1×2)
- bed (multi-tile)
- sofa (multi-tile)
- TV (multi-tile)
- fridge (multi-tile)
- counter (multi-tile)
- table (multi-tile)
- chair (1×1)

### 2. Set Room Size

**Center Panel — Room Settings:**
- Width: 24 tiles (default)
- Height: 18 tiles (default)
- Adjust if needed

### 3. Build the Room

**Use 3 modes:**

**PAINT mode** (for floors/walls):
- Click "Paint" button
- Select 1×1 sprite from palette
- Click/drag on canvas to fill area
- Fast for large areas

**PLACE mode** (for furniture):
- Click "Place" button
- Select sprite from palette
- Click canvas to place
- Repeat for each piece

**SELECT mode** (for editing):
- Click "Select" button
- Click object to select
- Drag to move
- Use properties to adjust z-index
- Delete/duplicate as needed

### 4. Arrange & Polish

1. Floor tiles → z-index 0 (back layer)
2. Walls → z-index 10
3. Large furniture → z-index 20-50
4. Small objects → z-index 51+

**Adjust z-index:**
- Select object
- Properties panel → "To Front/Back/Forward/Backward"

### 5. Preview

- Click "Preview" to hide grid
- Check final appearance
- Click "Edit Mode" to continue

### 6. Export

1. Click "Show Export Panel"
2. Check for validation errors
3. Fix any issues
4. Download spriteMap.ts
5. Download apartmentLayout.ts
6. Copy to main WattWise app

## Build Modes Quick Reference

| Mode | Button | Use For | How |
|------|--------|---------|-----|
| SELECT | Select | Edit objects | Click → Drag → Edit |
| PLACE | Place | Add furniture | Select palette → Click canvas |
| PAINT | Paint | Fill floors/walls | Select 1×1 tile → Drag on canvas |

## Keyboard Shortcuts

- `Delete` or `Backspace` — Delete selected
- `Ctrl+Z` / `Cmd+Z` — Undo
- `Ctrl+Y` / `Cmd+Y` — Redo

## Common Tasks

**Fill floor:**
1. Paint mode
2. Select floor sprite
3. Drag across entire room

**Add walls:**
1. Paint mode
2. Select wall sprite
3. Paint perimeter

**Place bed:**
1. Place mode
2. Select bed from palette
3. Click where you want it

**Move object:**
1. Select mode
2. Click object
3. Drag to new position

**Duplicate chair:**
1. Select mode
2. Click chair
3. Right panel → "Duplicate" button
4. Move duplicated chair

**Layer control:**
1. Select mode
2. Click object
3. Properties → "To Front" or "To Back"

**Save work:**
- Click "Save JSON"
- Keeps a backup

**Load saved room:**
- Click "Load JSON"
- Select file

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Can't see grid | Increase canvas zoom to 100% |
| Can't place object | Check if it fits in room bounds |
| Object won't move | Switch to Select mode first |
| Paint not working | Only works with 1×1 tiles |
| Export has errors | Read error messages and fix |

## Export Files

**spriteMap.ts:**
- Contains all sprite definitions
- Shows which sheet, column, row
- Defines width/height

**apartmentLayout.ts:**
- Contains room dimensions
- Lists all placed objects
- Includes positions and z-indexes

Both files go into `data/` directory of main app.

## Recommended Build Order

1. Paint floor (entire room)
2. Paint walls (perimeter)
3. Place door
4. Place bedroom furniture
5. Place living room furniture
6. Place kitchen furniture
7. Adjust all z-indexes
8. Preview
9. Export

## Tips

✓ Start with Paint mode for floors
✓ Use Place mode for unique furniture
✓ Use Duplicate for repeated items
✓ Preview frequently
✓ Save JSON backups
✓ Export early to test integration

## Canvas Zoom

- 50% — Full overview
- 100% — Recommended for building
- 150% — Detail work
- 200% — Precise placement

## Room Dimensions

- **Default**: 24 cols × 18 rows
- **Min**: 10 × 10
- **Max**: 50 × 40
- **Recommended**: 20-30 × 15-25

## Object Limits

- Sprites in palette: No limit
- Objects in room: 500+ supported
- Undo history: 50 actions

## Save Options

| Method | When to Use |
|--------|-------------|
| Auto-save (localStorage) | Continuous work |
| Save JSON | Backup before major changes |
| Export TS | Final production files |

## Next Steps After Export

1. Copy spriteMap.ts → `data/spriteMap.ts`
2. Copy apartmentLayout.ts → `data/apartmentLayout.ts`
3. Create ApartmentRoom.tsx component
4. Import and render the layout
5. Test with actual sprite sheets

## Most Common Beginner Mistakes

1. ❌ Trying to paint with multi-tile sprites (use Place mode)
2. ❌ Forgetting to select sprite from palette before placing
3. ❌ Not adjusting z-indexes (floor appears on top)
4. ❌ Objects extending beyond room bounds
5. ❌ Exporting without validating first

## File Output Sizes

- spriteMap.ts: ~1-2 KB
- apartmentLayout.ts: ~5-15 KB
- room-data.json: ~10-50 KB

All files are plain text TypeScript/JSON.
