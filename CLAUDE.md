# Project: EcoNest

Gamified energy-saving web app for residents of a housing complex.
LifeHack 2026 submission.

## Deadline

Demo/submission: **30 August 2026, 11:00 AM** Singapore time.

## Core idea

The apartment *is* the dashboard. Residents see a top-down pixel-art
view of their own home, with real appliances placed at real sockets.
Energy consumption becomes visible, understandable, and competitive.

Not another line-chart dashboard.

## Priority order

1. Working end-to-end user flow
2. Visual polish
3. Pixel-art apartment
4. Appliance interaction
5. Energy scoring
6. Leaderboard
7. Production infrastructure  <- explicitly last, likely skipped

Do not sacrifice a working demo for architecture that won't be seen.

## Technical direction

- Next.js (App Router) + TypeScript + React + Tailwind
- Local mock data only; no database, no backend
- localStorage for persistence
- Fake login (accept a few seeded room numbers)
- No game engine. The room is CSS/absolute-positioned React components.
- Add dependencies only when genuinely required

## Visual direction

- Top-down pixel-art apartment
- `image-rendering: pixelated` everywhere sprites are drawn
- Warm, modern UI chrome surrounding the pixel scene

### Asset scale — IMPORTANT

Tile scale is NOT yet verified. The intended art is the LimeZu
"Modern Interiors" pack, not yet on disk.

Before rendering real sprites, measure them:

    sips -g pixelWidth -g pixelHeight public/assets/<file>.png

Then derive the tile grid from the measured size. Do not assume 16px.
A file named `*_48x48.png` is most likely already 48px per tile and
should render at 1x or 2x, NOT 3x.

Known trap: the room sheets and the character sheet may be from
different scale variants of the pack (48x48 rooms vs 16x16 Adam).
If so the character must be upscaled ~3x to match the furniture,
or a matching-scale character sheet must be used instead.

All sprite rendering goes through the sprite layer so the art can be
swapped without touching feature code.

## Asset licensing

Pixel art by **LimeZu — Modern Interiors**. Credit must appear in the
app UI. Do not commit raw sprite sheets to a public repo unless the
purchased license permits redistribution; the free-version license is
more restrictive than the paid one.

## Development rules

- Small, coherent changes
- Run typecheck/build after substantial changes
- Don't rewrite working components
- Ship the demo
