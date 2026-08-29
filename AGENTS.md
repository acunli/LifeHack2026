# AGENTS.md — operating context for AI coding agents

Project: **WattLah** — gamified energy-saving web app for a housing complex.
Built for **LifeHack 2026**, Ecovolt "Small Green Habits" track.

`README.md` is the plan and the source of truth. **Read it before writing code.**
This file is the short version: the rules that are easy to break by accident.

## 2026-08-30 implementation override — read first

The repository has intentionally evolved beyond the pre-build lane plan kept
below for historical context. The working product now uses Phaser, movement,
socket scans, room-scoped persistence, savings-plan previews, and a building
leaderboard. Do not remove those features to satisfy the archived "no engine"
or two-route guidance.

Current rules:

- `/home` is the canonical product surface; `/leaderboard` is its social loop.
- Keep measured usage distinct from projected plans and label projections.
- Use `lib/scoring.ts` as the only scoring truth; its exact-reference score of
  100 is intentional.
- Keep persisted audit and plan state isolated by room and validate storage.
- Phaser owns room simulation; React owns product state. Communicate through
  the typed, SSR-safe bus in `lib/game/utils/gameEvents.ts`.
- Preserve deterministic data, pixel-art rendering, accessible HTML controls,
  responsive touch support, and the no-backend/no-new-dependency constraints.
- Run lint, `tsc --noEmit`, tests, build, and the core browser journey before
  handing off.

Sections below describing missing files, lane ownership, no canvas, and the
original scope are archived constraints, not the current implementation.

---

## Current state — read this first

**Lane A's foundation is in.** The app scaffolds, builds, and has a working
login → apartment flow. What exists:

```
app/
  layout.tsx  page.tsx           login screen (built)
  apartment/page.tsx             integration shell — SLOTS ONLY, see below
  globals.css                    game visual system (seeded by A, owned by C)
components/LoginForm.tsx         built
lib/scoring.ts  session.ts       the contract, computeScore, session helpers
lib/scoring.test.ts              16 passing cases
data/mockApartment.ts            ⚠️ PLACEHOLDER — Lane D replaces
public/assets/                   all 10 sheets, copied and serving
```

**What does NOT exist yet:**

- `components/ApartmentRoom.tsx` — the pixel room (Lane B)
- `data/spriteMap.ts` — sprite coordinates (Lane B)
- `components/EnergyDashboard.tsx`, `StatCard.tsx`, `ScoreBadge.tsx` (Lane C)
- `docs/` — rationale, copy, demo script (Lane D)

`app/apartment/page.tsx` renders two labelled placeholder panels where B's room
and C's HUD drop in. **Do not build the room or the HUD inside that file** — it
is the shared integration point and stays tiny.

All commands in Verification now work.

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

**Known characteristic — do not "fix" it.** An apartment consuming exactly the
reference amount scores 100 and lands in the top band, and consuming *less* also
clamps to 100. That is intentional: the formula is a deliberate linear
normalisation against a stated reference, chosen for being explainable in one
sentence, not for modelling a real distribution. If you think it should be
recentred, raise it — do not change it unilaterally. Three lanes and the demo
script depend on the numbers it produces.

To land the demo apartment in the 72–78 band (README §11), it must consume roughly
22–28% above reference.

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
| `*_idle_16x16.png` (×4) | 64 × 32 | **4 frames of 16×32** — one per facing |

Key points:
- The three tiers are **pre-rendered upscales of identical art**, not different
  content.
- Characters exist **only at 16×16**. In a 32px room they need exactly 2×.
- **The character frames are facings, not an idle animation.** The sheet is four
  16×32 frames — left, back, right, front — so cycling them spins the character
  on the spot. Frame 3 (x=48) is front-facing; that is the mascot pose. Any
  liveliness has to come from CSS, and `components/Mascot.tsx` already does it.
- Art is **LimeZu — Modern Interiors** (free version). Credit must appear in the
  UI. The free licence is more restrictive than the paid one.

To verify anything yourself:

```bash
sips -g pixelWidth -g pixelHeight <file>.png
```

---

## Where files go

Create files here, not wherever seems natural (README §14):

```
app/
  layout.tsx  page.tsx           login
  apartment/page.tsx             integration shell — keep tiny
  globals.css
components/
  LoginForm.tsx  ApartmentRoom.tsx
  EnergyDashboard.tsx  StatCard.tsx  ScoreBadge.tsx
lib/
  scoring.ts  scoring.test.ts  session.ts
data/
  mockApartment.ts  spriteMap.ts
public/assets/                   copied from Assets/
docs/
```

Hardcoded numbers belong in `data/`, never inline in a component. That separation
is what lets mock data become real data later without touching the UI.

## File ownership

Four lanes (README §15). Stay in your lane's files; ask before editing another's.

| Lane | Owns |
|---|---|
| A — Foundation | `app/layout.tsx`, `app/page.tsx`, `components/LoginForm.tsx`, `lib/`, tests, deploy |
| B — Room | `components/ApartmentRoom.tsx`, `data/spriteMap.ts`, `public/assets/` |
| C — HUD | `components/EnergyDashboard.tsx`, `StatCard.tsx`, `ScoreBadge.tsx`, `globals.css` |
| D — Experience & Story | `docs/`, `data/mockApartment.ts`, all on-screen copy, the video, the upload |

Two of Lane D's files are easy to trample by accident:

**`data/mockApartment.ts` is Lane D's, not Lane A's.** Those numbers are the story
the demo tells, and each is sourced. Do not invent, round, or "improve" them to
make a component look better — change the component. If a value looks wrong,
raise it; never silently edit it.

**On-screen copy comes from `docs/copy.md`.** Every button label, empty state and
explanatory line is written deliberately. Do not substitute your own wording
because it reads better in code, and do not leave placeholder copy in a component
and call it done — take the string from `copy.md` or ask for it.

**Conflict hotspots — never edit these solo:** `app/apartment/page.tsx`,
`globals.css`, `package.json`.

---

## Verification

Run after any non-trivial change, before moving on. All three work today:

```bash
./node_modules/.bin/tsc --noEmit   # must be clean
npm run build                      # must succeed
npm test                           # 16 cases, must stay green
```

Use `./node_modules/.bin/tsc`, not `npx tsc` — `npx` will fetch an unrelated
package called `tsc` from the registry and print nonsense.

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

---

## Git

- **Never commit to `main` directly** and never force-push it. Four people share it.
- Branch per lane: `feat/foundation`, `feat/room`, `feat/hud`, `feat/docs`
- Do not commit `node_modules/`, `.next/`, or `.DS_Store` — add a `.gitignore` as
  part of the scaffold task
- Pull before you start and before you push
- **Do not commit or push unless asked.** Say what you changed and let the human
  decide.

---

## What we are judged on

When trading one thing off against another, this is the basis:

| Criterion | Weight |
|---|---|
| **Fun and engagement** | **40%** |
| Behaviour change | 20% |
| Stickiness | 20% |
| Craft and usability | 20% |

An hour on the pixel room or the score reveal is worth more than an hour on test
coverage or architecture. That is not an excuse for broken code — it is how to
choose when both are defensible and only one fits.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
