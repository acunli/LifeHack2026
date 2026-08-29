🎮 WATTWISE INTERACTIVE APARTMENT - COMPREHENSIVE PROPOSAL
Based on thorough inspection of the Sierraassets furniture pack and existing codebase.

A. SIERRAASSETS INVENTORY
TILE SYSTEM
Base Unit: 8×8 pixels (floor tiles)
Floor Spritesheet: 135×155px (organized tile patterns)
Furniture Spritesheet: 628×356px (dense sprite collection)
Total Assets: 520 sprites, 213 unique pieces
OUTLINE STYLES AVAILABLE
Three consistent visual styles (choose ONE for cohesion):

No outline - Clean, minimal (RECOMMENDED for modern apartment)
Grey outline - Soft separation
Colored outline - Bold, game-like
Recommendation: No outline for a cleaner, more polished look that feels less "game-y" and more like a real energy management interface.

B. RECOMMENDED ENVIRONMENT ASSETS
FLOORS (8×8 tiles, from floors and walls spritesheet)
From visual inspection, I identified these distinct floor patterns:

Wood Planks (Brown/Tan) - Perfect for living room, bedroom

Warm, residential feel
Multiple shades available
Tile Patterns (Various colors available)

White/Grey tiles - Kitchen, bathroom
Blue tiles - Bathroom option
Pink tiles - Decorative option
Green tiles - Alternative option
Recommended Primary Floor: Wood planks for main living areas, white/grey tiles for kitchen and bathroom.

WALLS (8×8 tiles with overlays)
Wall sections with support for openings on all sides
Shadow tiles for depth (right/bottom of walls)
Optional skirting board overlays (white trim)
Recommended: Use wood-tone walls with white skirting for consistency with floor choice.

C. RECOMMENDED FURNITURE COMBINATIONS
From the spritesheet analysis, I identified these visually cohesive furniture sets:

LIVING ROOM SET (Brown/Wood tones)
Couch: Multi-seat sofa (appears to be ~40-48px wide)
TV: Wall-mounted or table TV (16×16 to 24×16)
TV Stand/Table: Matching wood tone
Side Table: Small table for lamp
Plant: Decorative greenery
BEDROOM SET (Consistent wood furniture)
Bed: Double bed (~32×24 footprint)
Nightstand: Bedside table
Closet/Wardrobe: Tall storage unit
Desk: Work surface (appears ~24-32px wide)
Chair: Desk chair
KITCHEN SET (White/Grey appliances)
Refrigerator: Tall unit with open/close states
Gas Stove: With on/off states
Counter/Cabinet: Kitchen cabinetry
Microwave: Countertop or built-in
Small Table: Dining/prep surface
BATHROOM SET (White fixtures)
Bathtub/Shower: Space-efficient option
Toilet: Standard fixture
Wash Basin: Sink with cabinet variants
Mirror: Wall-mounted
SHARED DECORATIONS
Paintings: Famous art reproductions (Van Gogh, Mondrian, etc.)
Plants: Various sizes
Lamps: Multiple styles
Windows: With frames
Door: Entry door
Visual Cohesion Strategy: Wood tones for furniture, white/grey for appliances, selective color accents via paintings and plants.

D. RECOMMENDED APPLIANCE SPRITES
Based on actual Sierraassets inventory (NOT assumptions):

CONFIRMED AVAILABLE APPLIANCES:
Appliance	Asset Available	Sprite Details	Socket Placement
Refrigerator	✅ YES	7 fridges + variants, open/close states	Kitchen counter
Microwave	✅ YES	2 microwaves, open/close states	Kitchen counter
Television	✅ YES	6 different TVs, 3 channel variants	Living room
Washing Machine	✅ YES	4 machines + 4 variants	Bathroom/utility
Air Conditioner	✅ YES	2 units, ANIMATED	Wall-mounted
Fan	✅ YES	1 fan, ANIMATED	Table/floor
Lamp	✅ YES	8 lamps, 5 variants, multiple perspectives	Tables/walls
Monitor/PC	✅ YES	7 monitors, 3 PCs, 3 monitor faces	Desk
Espresso Machine	✅ YES	1 machine	Kitchen counter
Heater	✅ YES	6 heaters + 3 variants	Floor
NOT AVAILABLE:
❌ Standard "Laptop" (but PC/monitor combo works)
❌ Standalone "Coffee Machine" (but espresso machine exists)
Recommended Initial Set (9 appliances with perfect sprites):

Refrigerator
Microwave
Television
Washing Machine
Air Conditioner
Fan
Lamp
Monitor
Espresso Machine
E. RECOMMENDED CHARACTER
Choice: Adam (Assets/Characters/Adam_idle_16x16.png)

Specifications:

Sprite dimensions: 64×32px (4 frames of 16×32 each)
4 directional facings: Left, Back, Right, Front
Frame 3 (x=48) = Front-facing (good for idle state)
Clean, simple design that won't clash with Sierraassets style
Alternative: Any of the 4 characters work (Adam/Alex/Amelia/Bob) - all same dimensions. Adam chosen for neutral appearance.

F. PROPOSED ROOM LAYOUT
ROOM DIMENSIONS
48 tiles wide × 36 tiles tall (384px × 288px logical)

With 8×8 floor tiles, displayed at 2× scale = 768px × 576px viewport

Why these dimensions:

Fits laptop screens comfortably (most are 1366×768 or larger)
6:1 aspect ratio works well for horizontal layout
Large enough for distinct rooms, small enough to feel contained
2× integer scaling keeps pixels crisp
ROOM ARRANGEMENT (Top-down view)

┌─────────────────────────────────────────────┐
│  BATHROOM  │  BEDROOM         │  STUDY      │
│    8×12    │   16×12          │   8×12      │
│            │                  │             │
│   [toilet] │  [bed]           │  [desk]     │
│   [shower] │  [closet]        │  [monitor]  │
│            │                  │             │
├────────────┴──────────────────┴─────────────┤
│                                              │
│  KITCHEN        LIVING ROOM                  │
│   12×24            36×24                     │
│                                              │
│  [fridge]         [couch]     [TV]           │
│  [stove]                                     │
│  [micro]          [table]                    │
│                                              │
│  ┌──┐ ENTRY                                  │
│  │  │                                        │
└──┴──┴──────────────────────────────────────-┘
    DOOR
VISUAL DESIGN PRINCIPLES
Wood plank floors throughout main areas
Tile floors in kitchen and bathroom
Walls with skirting for definition
Natural furniture placement (not grid-aligned)
Open walking paths through center
Windows on back wall for depth
Entry door at bottom-left
G. PROPOSED SOCKET LOCATIONS
Total: 9 sockets (strategically placed for natural appliance positions)

#	Room	Position	Purpose	Appliance Options
1	Kitchen	Counter right	Microwave	Microwave, Espresso Machine
2	Kitchen	Counter left	Refrigerator	Refrigerator
3	Kitchen	Wall	Secondary	Fan, Heater
4	Living Room	TV wall	Television	TV, Monitor
5	Living Room	Side table	Lamp	Lamp, Fan
6	Bedroom	Bedside	Bedside Lamp	Lamp, Fan, Heater
7	Study	Desk	Monitor/PC	Monitor, Lamp
8	Bathroom	Wall	Washing Machine	Washing Machine, Heater
9	Living Room	Ceiling/Wall	Air Conditioner	Air Conditioner
Socket Visual: Small pixel-art indicator (2×2 or 3×3px), subtle when empty, highlights on player approach.

Interaction Radius: 24px (3 tiles) - player can interact from nearby, not just standing directly on it.

H. PROPOSED PLAYER SPAWN
Spawn Location: Near entry door, facing up into the apartment

Position: x: 64px, y: 256px (8 tiles from left, 32 tiles from top)
Facing: Up (into the room)
Clear path ahead into living room
Why here:

Natural entry point
Immediately shows the main living space
Not blocking any furniture
Clear walking path visible
I. PROPOSED WALKING ROUTES
PRIMARY PATHS (2-3 tiles wide, unobstructed):

DOOR → LIVING ROOM → KITCHEN
         ↓              ↓
      BEDROOM ←──── BATHROOM
         ↓
       STUDY
Specific Routes:

Entry → Living Room: Central path from door through living area
Living → Kitchen: Natural flow to left side
Living → Bedroom: Path along right wall
Bedroom → Bathroom: Connecting hallway
Bedroom → Study: Upper right connection
Circuit Loop: Can walk a complete loop through all rooms
Collision Boundaries:

All walls (solid)
Large furniture (bed, couch, tables, refrigerator, closets)
No collision: Small decorations (plants, lamps, paintings)
J. PHASER VS ALTERNATIVE TECHNOLOGY
RECOMMENDATION: ✅ PHASER 3
Why Phaser:

Pros:
Perfect fit for 2D pixel-art games - Built-in pixel-perfect rendering
Tilemap support - Native 8×8 tile handling
Arcade Physics - Simple WASD movement + collision out of the box
Sprite management - Easy sprite sheet loading and animation
Mature ecosystem - Well-documented, active community
React integration - Can coexist with Next.js React UI layers
Small bundle - ~700KB minified, reasonable for a game feature
No backend needed - Runs entirely client-side
Cons:
Additional dependency (~700KB)
Learning curve if team unfamiliar
Separate render loop from React
Alternative Considered: Pure React + CSS
Pros: No new dependency, leverages existing skills
Cons: Manual collision, manual game loop, harder to optimize, no physics helpers
Verdict: Phaser's benefits far outweigh the dependency cost for this use case. The built-in tilemap + physics + sprite systems will save days of development time.
K. REQUIRED DEPENDENCIES

{
  "dependencies": {
    "phaser": "^3.87.0"     // Latest stable Phaser 3
  },
  "devDependencies": {
    "@types/phaser": "^2.0.0"  // TypeScript definitions
  }
}
Total added: ~700KB minified bundle size

Zero backend dependencies - everything runs client-side

L. PROPOSED FILE STRUCTURE

app/
  interactive-apartment/        ← NEW ROUTE
    page.tsx                    ← React wrapper, UI overlays
    
components/
  apartment-game/               ← NEW DIRECTORY (isolated)
    ApartmentGameCanvas.tsx     ← Phaser game mount component
    AppliancePanel.tsx          ← React appliance info panel
    ApplianceSelector.tsx       ← React appliance selection UI
    EnergyScoreOverlay.tsx      ← React HUD overlay
    GameControls.tsx            ← React controls help overlay
    
lib/
  game/                         ← NEW DIRECTORY
    scenes/
      ApartmentScene.ts         ← Main Phaser scene
      PreloadScene.ts           ← Asset loading scene
    entities/
      Player.ts                 ← Player sprite + movement
      Socket.ts                 ← Socket interaction object
      Appliance.ts              ← Appliance sprite entity
    data/
      apartmentMap.ts           ← Tilemap layout data
      socketDefinitions.ts      ← Socket positions + config
      applianceData.ts          ← Appliance stats + sprites
    utils/
      collisionHelpers.ts       ← Collision detection helpers
      energyCalculator.ts       ← Energy score calculation
      
public/
  game-assets/                  ← NEW DIRECTORY
    sierrassets/
      floors/                   ← Copied from Sierraassets pack
      furniture/                ← Copied from Sierraassets pack
      characters/               ← Copied from existing Characters/
Isolation Strategy:

✅ All new code in apartment-game/ and lib/game/
✅ Separate route /interactive-apartment
✅ Separate asset directory public/game-assets/
✅ Zero modifications to existing components/ApartmentRoom.tsx
✅ Zero modifications to existing data/apartmentLayout.ts
M. IMPLEMENTATION CHECKPOINTS
CHECKPOINT 0: Asset Preparation & Design Approval ⏸️ ← STOP HERE
✅ Sierraassets inspection complete
✅ Room design proposed
✅ Technology stack proposed
⏸️ AWAITING USER APPROVAL
Before proceeding, I need your confirmation on:

Room dimensions (48×36 tiles OK?)
Outline style choice (no outline / grey / colored?)
Room layout (bathroom/bedroom/study top, kitchen/living bottom?)
Socket placement (9 sockets in proposed locations?)
Technology (Phaser 3 approved?)
CHECKPOINT 1: Phaser + Next.js Integration
What: Install Phaser, create basic game canvas mount

Install phaser and @types/phaser
Create ApartmentGameCanvas.tsx that mounts Phaser
Create basic ApartmentScene.ts with empty game world
Create route /interactive-apartment that shows black canvas
Test: See 768×576px black canvas with "Phaser 3" watermark
Deliverable: Working Phaser canvas in Next.js page

CHECKPOINT 2: Sierraassets Apartment Map
What: Build the tile-based apartment with floors, walls, furniture

Copy required Sierraassets sprites to public/game-assets/
Create apartmentMap.ts with tilemap data
Render floors (wood planks + tiles)
Render walls with skirting
Place furniture (couch, bed, fridge, etc.)
Add decorations (plants, paintings, windows, door)
Test: See complete apartment with all rooms visible
Deliverable: Beautiful pixel-art apartment that matches proposal

CHECKPOINT 3: Player Movement
What: Add Adam character with WASD/Arrow controls

Load Adam sprite sheet (4 directional frames)
Create Player.ts entity class
Implement WASD + Arrow key movement
Spawn player at entry door
Test: Walk Adam around apartment (no collision yet)
Deliverable: Movable player character

CHECKPOINT 4: Collision
What: Add wall and furniture collision

Define collision tilemap layer for walls
Add collision bounds for major furniture
Implement collisionHelpers.ts
Apply physics to player
Test: Cannot walk through walls or furniture
Deliverable: Realistic movement with boundaries

CHECKPOINT 5: Sockets + Interaction Prompts
What: Add socket objects with proximity detection

Create Socket.ts entity class
Place 9 sockets from socketDefinitions.ts
Detect player proximity (24px radius)
Show React overlay [E] Add appliance when near socket
Test: Walk near socket, see prompt appear/disappear
Deliverable: Interactive socket system

CHECKPOINT 6: Appliance Selection + Spawning
What: Let player choose and place appliances

Create ApplianceSelector.tsx React modal
Load appliance sprites from Sierraassets
Player presses E → modal opens
Player selects appliance → modal closes
Spawn Appliance.ts entity at socket position
Mark socket as occupied
Test: Install microwave at kitchen socket
Deliverable: Appliance installation flow

CHECKPOINT 7: Appliance Click + Information Panel
What: Show appliance details on click

Make appliances clickable (Phaser pointer events)
Create AppliancePanel.tsx React modal
Show appliance stats (power, usage, efficiency, tip)
Test: Click installed microwave, see detailed panel
Deliverable: Appliance inspection system

CHECKPOINT 8: Energy Score + Polish
What: Calculate and display apartment energy score

Create energyCalculator.ts
Sum all installed appliance consumption
Calculate 0-100 score
Create EnergyScoreOverlay.tsx HUD
Show score + daily kWh in top-right
Add polish: animations, sound (optional), fine-tuning
Test: Install multiple appliances, watch score update
Deliverable: Complete energy management game

N. VISUAL QUALITY OPTIMIZATION PRIORITIES
To ensure the new room is substantially more interesting than the existing static apartment:

1. Cohesive Art Style
✅ Single Sierraassets pack (consistent pixel size, color palette)
✅ Matched furniture sets (not random grab-bag)
✅ One outline style (no mixing)
2. Environmental Depth
Layering: Foreground decorations (plants) in front of furniture
Shadows: Floor shadows under tall objects
Windows: Visible through walls suggesting exterior
Skirting boards: Wall detail that grounds the space
3. Natural Composition
Room flow: Clear sight-lines and pathways
Asymmetric placement: Furniture not perfectly grid-aligned
Focal points: TV wall, bed as visual anchors
Negative space: Open areas for player to inhabit
4. Interactive Visual Feedback
Socket highlights: Glow when player approaches
Appliance state: Animated sprites (fan spinning, AC working)
Player shadow: Small shadow under character
UI polish: Smooth modal transitions, elegant panels
5. Game Feel
Responsive movement: Immediate WASD response
Smooth camera: No jitter or snap-scrolling
Satisfying interactions: Visual/audio feedback on appliance placement
Clear affordances: Obvious what's clickable/interactive
