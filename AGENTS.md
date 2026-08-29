# AGENTS.md — operating context for AI coding agents

Project: **WattWise** — gamified energy-saving web app for a housing complex.
Built for **LifeHack 2026**, Ecovolt "Small Green Habits" track.

`README.md` is the plan and the source of truth. **Read it before writing code.**
This file is the short version: the rules that are easy to break by accident.

---

## Deadline and priority

Working deadline: **Sunday 30 August, 11:00** (see README §21, decision 3 — the
brief's own header says 22–23 August, unresolved).

Priority order when something has to give:

1. A working login → apartment flow
2. Visual polish on the pixel room
3. The HUD and score
4. Everything else

Never sacrifice a working demo for architecture nobody will see. This is a
24-hour hackathon build, not a product.

---

## Hard rules

These cause real, visible bugs. Do not violate them without saying so explicitly.

### Determinism
- **No `Math.random()` anywhere in the render path.** Mock data must be static or
  deterministically derived. Random values differ between the server render and
  the client hydration pass, which surfaces as visible flicker or a hydration
  crash.
- Same room number must always produce the same numbers.

### Pixel art
- **`image-rendering: pixelated`** on every element that renders a sprite crop.
- **Integer scale factors only** (1×, 2×, 3×). A fractional scale reintroduces
  blur regardless of the rendering hint.
- **Never** pass these PNGs through Next.js `<Image>`. It re-encodes and blurs
  pixel art. Serve them as plain static files from `public/`.
- Use the **32×32 tier as shipped**. Do not CSS-scale the 16×16 sheet — the pack
  already ships pixel-perfect upscales.

### Hydration
- `localStorage` does not exist during SSR. Read it inside `useEffect`, never
  during render. Render the same empty state on the server and the first client
  pass.

### Architecture
- **No game engine.** No canvas. The room is a CSS grid of `<div>`s cropping a
  sprite sheet via `background-position`.
- **No backend, no database, no API routes.** All data is a static TypeScript
  module.
- **No new dependencies** without asking. No state library, no auth library, no
  animation library.

---

## Scope is binding

README §5 lists what is out of scope. It is not a suggestion — it was agreed by
the team. Do not build any of it, even if it seems like an obvious improvement:

- Appliance placement, drag-and-drop, socket configuration flows
- Real smart plugs, IoT, meters, live telemetry
- Real auth, databases, backend services
- AI recommendations, ML
- Character movement, multiplayer, physics
- Real-time or persisted leaderboard
- Admin dashboards, notifications

**One item is deliberately undecided:** appliance hover-to-inspect. See README §21
decision 1. Do not build it until the team has decided.

If a task seems to require something on this list, stop and say so rather than
building it.

---

## The shared contract

Four people work in parallel against these two types. **Do not change their shape
without flagging it** — three other lanes are coding against them.

```ts
interface ApartmentEnergyData {
  roomNumber: string;
  totalConsumptionKwh: number;
  referenceConsumptionKwh: number;
  costPerKwh: number;              // use 0.2994 — Singapore regulated tariff
}

interface ApartmentScoreResult {
  score: number;                   // 0-100
  comparisonPercent: number;
  estimatedCost: number;
  status: "Energy Saver" | "Good" | "Average" | "Needs Improvement";
}
```

Scoring formula (README §11):

```
comparisonPercent = (total - reference) / reference * 100
score             = clamp(round(100 - comparisonPercent), 0, 100)
```

---

## Asset facts — measured, do not re-derive

All ten PNGs in `Assets/` were measured with `sips`. **Do not infer tile size from
the filename** — that has already caused one wrong plan.

| Sheet | Dimensions | Tile grid |
|---|---|---|
| `Room_Builder_free_16x16.png` | 272 × 368 | 17 × 23 |
| `Room_Builder_free_32x32.png` | 544 × 736 | 17 × 23 |
| `Room_Builder_free_48x48.png` | 816 × 1104 | 17 × 23 |
| `Interiors_free_16x16.png` | 256 × 1424 | 16 × 89 |
| `Interiors_free_32x32.png` | 512 × 2848 | 16 × 89 |
| `Interiors_free_48x48.png` | 768 × 4272 | 16 × 89 |
| `*_idle_16x16.png` (×4) | 64 × 32 | 4 × 2 frames of 16×16 |

Key points:
- The three tiers are **pre-rendered upscales of identical art**, not different
  content.
- Characters exist **only at 16×16**. In a 32px room they need exactly 2×.
- Art is **LimeZu — Modern Interiors** (free version). Credit must appear in the
  UI. The free licence is more restrictive than the paid one.

To verify anything yourself:

```bash
sips -g pixelWidth -g pixelHeight <file>.png
```

---

## File ownership

Four lanes (README §15). Stay in your lane's files; ask before editing another's.

| Lane | Owns |
|---|---|
| A — Foundation | `app/page.tsx`, `lib/`, `data/mockApartment.ts`, tests, deploy |
| B — Room | `components/ApartmentRoom.tsx`, `data/spriteMap.ts`, `public/assets/` |
| C — HUD | `components/EnergyDashboard.tsx`, `StatCard.tsx`, `ScoreBadge.tsx`, `globals.css` |
| D — Submission | `docs/`, the video, the upload |

**Conflict hotspots — never edit these solo:** `app/apartment/page.tsx`,
`globals.css`, `package.json`.

---

## Verification

Run after any non-trivial change, before moving on:

```bash
npx tsc --noEmit     # must be clean
npm run build        # must succeed
npm test             # after any change to lib/scoring.ts
```

Node was installed via Homebrew (v26.7.0). If you hit `command not found: node`,
that is why — `brew install node`.

---

## Working style

- **One task at a time.** README §17 is the task list; treat each row as one unit
  of work. Small diffs are reviewable by teammates; large ones are not.
- **Do not refactor working code.** If a task is additive ("add a logout button"),
  add the button. Do not restyle the page around it. The deadline makes
  unrequested rewrites expensive.
- **Inspect before modifying** any file another lane wrote. Read it and summarise
  its prop contract before wiring it up; do not rewrite a teammate's component to
  "fit better."
- **Report honestly.** If the build fails, say so and show the output. If you
  skipped something, say which part and why. A demo built on an inaccurate status
  report fails at 10:55.
- **Ask when scope is ambiguous** rather than guessing expansively. The cost of a
  question is thirty seconds; the cost of building an out-of-scope feature is an
  hour nobody has.
