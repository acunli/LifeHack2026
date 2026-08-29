# WattWise (working title) — Gamified Energy Saving for Housing Complexes

> Planning document and single source of truth for the MVP build. No application code exists yet — this repository currently contains only pixel-art assets. This README defines what we build first, what we deliberately defer, and how a 2-person team executes it under a tight deadline.

---

## 1. Project Overview

WattWise is a gamified web application that lets residents of a housing complex log into a virtual, top-down pixel-art version of their own apartment, see their energy consumption translated into a game-like score, and (eventually) compare that score against neighbors on a building-wide leaderboard.

This document covers:
- The **MVP** we can realistically ship under the current deadline.
- The **future product vision** the MVP must not architecturally block.
- The **exact tech stack, file structure, task breakdown, and team split** needed to start building immediately.

## 2. Problem Statement

Residents in multi-unit housing complexes rarely see individualized, actionable feedback on their energy use. Utility bills are delayed, aggregated, and unengaging. There's no immediate feedback loop, no social comparison, and no incentive structure that makes saving energy feel rewarding rather than just virtuous. A game-like interface — your own apartment, your own score, your own rank — creates an emotional hook that a spreadsheet or bill never will.

## 3. Product Vision

Long-term, a resident should be able to:
1. Log in and see their real apartment, represented as a 2D pixel-art room.
2. See real sockets/appliances in that room, each with real or simulated energy draw.
3. Interact with individual appliances to see appliance-level energy data.
4. See an overall apartment score derived from real consumption data.
5. Compare that score against other apartments in the same building/complex on a leaderboard.
6. Participate in energy-saving challenges and earn rewards for improvement.

This is a multi-quarter product. The MVP is a deliberately thin vertical slice of steps 1, 4 (mocked), and a preview of the visual identity — nothing else.

## 4. MVP Scope

The MVP is exactly these five things:

| # | Feature | Notes |
|---|---|---|
| 1 | Fake login | Any room number + any password succeeds. No backend, no validation beyond "non-empty." |
| 2 | 2D pixel-art apartment view | Static top-down room built from the provided asset packs. No character movement required. |
| 3 | Gamified energy dashboard (HUD) | Shown alongside the room. Total consumption, score, comparison vs. reference, estimated cost, status/rank. |
| 4 | Apartment-level energy score | One number, deterministically computed from mock data, with a clearly documented formula. |
| 5 | Basic navigation/state | Login → apartment/dashboard. Room number visible in the UI. Logout returns to login. |

All data is **mocked and deterministic** — same inputs always produce the same numbers. Nothing is randomized on load, and nothing requires a network call.

## 5. Out of Scope (Explicitly Deferred)

None of the following are part of the MVP. They are listed here so that neither teammate nor Claude Code accidentally scope-creeps into them:

- Appliance hover interactions, popups, or socket selection
- Appliance placement / drag-and-drop
- Real smart plugs, IoT integration, real meters, real-time telemetry
- Real authentication, database-backed users, any backend service
- AI recommendations / machine learning
- Character movement, multiplayer
- Real-time leaderboard
- Complex animations or game mechanics
- Admin dashboard, notifications, mobile app

Every item above reappears in [Section 23 — Future Roadmap](#23-future-roadmap) with a note on how the MVP architecture accommodates it later.

## 6. User Flow

**MVP flow (implement now):**

```
Login screen (room number + password, any values)
        ↓
Client-side "session" stored (localStorage)
        ↓
Apartment screen: pixel-art room + energy dashboard HUD, room number shown
        ↓
(optional) Logout → back to login, session cleared
```

**Long-term flow (do not build yet — see Section 25):**

```
LOGIN → PERSONAL APARTMENT → USER SEES SOCKETS/APPLIANCES → SELECT SOCKET →
SELECT APPLIANCE → APPLIANCE APPEARS IN ROOM → USER INTERACTS WITH APPLIANCE →
ENERGY DATA + COMPARISONS → APPLIANCE ENERGY SCORE → OVERALL APARTMENT SCORE →
BUILDING/COMPLEX LEADERBOARD → ENERGY-SAVING CHALLENGES / REWARDS
```

## 7. UI/UX Concept

**Visual hierarchy:** the apartment room is the emotional centerpiece; the dashboard is a HUD that frames it, not a competing focal point.

1. **Login screen** — simple centered card: room number input, password input (any value accepted), a "pixel" button style consistent with the game aesthetic. No branding complexity needed; this can even reuse a cropped interior tile as a background.
2. **Main apartment screen** — the pixel-art room fills the dominant visual space (left/center on desktop). Rendered at a fixed, crisp pixel scale (see Section 10).
3. **Energy dashboard (HUD)** — docked to one side (or as an overlay panel/bottom bar on mobile), styled like a game HUD: chunky stat cards, a prominent score "badge" (think a level/rank indicator, not a corporate KPI tile), a small comparison bar (you vs. reference apartment), and a status pill ("Energy Saver 🌱", "Good", "Needs Improvement").
4. **Score presentation** — the score is the single largest number on screen after the room itself. Pair it with the status label and a one-line plain-English explanation ("Better than 80% of a typical apartment").
5. **Navigation** — room number always visible in a header/corner; a small logout/back-to-login control, no nested navigation needed for MVP.

Design language: pixel-art-consistent (`image-rendering: pixelated`), rounded/game-like cards for the HUD (a light "modern-retro" mix is fine — the room stays strictly pixel-perfect, the HUD chrome around it can be modern CSS as long as the color palette is drawn from the tileset so it reads as one coherent product, not two mismatched UIs).

## 8. Technology Stack

| Layer | Choice | 
|---|---|
| Framework | Next.js (App Router) |
| UI library | React 18 |
| Language | TypeScript |
| Styling | Tailwind CSS |
| State | React `useState`/`useContext` + `localStorage` (no library) |
| Data | Static TypeScript modules (mock data), no database |
| Backend | None — no API routes needed for MVP |
| Rendering of pixel art | Plain DOM + CSS (`background-position` sprite cropping), no canvas |
| Game engine | None (Phaser explicitly rejected — see Section 9) |
| Testing | Vitest + React Testing Library (unit tests for scoring logic + one smoke test) |
| Deployment | Vercel |

## 9. Why This Stack

| Decision | Reasoning |
|---|---|
| **Next.js** over plain Vite/React SPA | File-based routing gives us two clean, independently ownable routes (`/` login, `/apartment` main view) for free — directly supports the 2-person parallel split in Section 15. Zero-config Vercel deploy. If/when a real backend is needed (Phase 3), API routes slot in without a framework migration. |
| **React + TypeScript** | Team familiarity, huge ecosystem, and Claude Code works exceptionally well with typed React — types double as the shared contract between the two developers (Section 15). |
| **Tailwind CSS** | Fastest way to build a HUD-style dashboard without hand-writing a stylesheet; utility classes reduce the chance two developers edit the same CSS file and conflict. |
| **No backend (rejected for now)** | Nothing in the MVP requires persistence beyond a client-side flag. Standing up any backend (even a trivial one) is pure overhead against the deadline with zero MVP payoff. Revisit in Phase 3 when real IoT/meter data exists. |
| **No database (rejected for now)** | Same reasoning — mock data lives in a TypeScript module. A database has nothing to store yet (no real users, no real readings). |
| **No game engine / Phaser (rejected)** | Confirmed by asset inspection (Section 10): the room is a static composition of tiles and furniture with no movement, physics, or per-frame redraw in the MVP. Phaser would add a canvas lifecycle, asset-loader boilerplate, and a real learning curve for zero functional benefit right now. If Phase 2 introduces draggable appliances, plain React drag handling (or a small library like `dnd-kit`) is still very likely sufficient — canvas/engine is revisited only if that turns out to be false. |
| **No state management library (Redux/Zustand/Jotai) (rejected)** | Total MVP state is: is-logged-in, room-number, and a static mock-data object. This fits in one `useState`/`useContext` plus `localStorage`. A library here is pure ceremony. |
| **No auth library (NextAuth/Clerk/etc.) (rejected)** | Login is intentionally fake. Real auth is explicitly a Phase 3+ concern tied to a real user/database backend, which doesn't exist yet. |
| **No animation library (Framer Motion) for MVP (deferred, not rejected)** | CSS transitions cover any score reveal/hover polish needed now. Framer Motion is cheap to add later in Phase 2 for HUD polish without touching the architecture — not worth the dependency today. |
| **Vitest + RTL, no E2E framework** | Playwright/Cypress setup cost isn't justified for an MVP this small; a short manual QA checklist (Section 20) covers navigation/visual concerns. The only logic worth automated-testing is the scoring function, which is a pure function — perfect for a couple of unit tests. Revisit E2E once there's a real backend and more flows to regress. |
| **Vercel for deployment** | Zero-config for Next.js, generous free tier, automatic preview URLs per branch/PR (valuable for a 2-person team reviewing each other's work), no environment variables required since there's no real backend/secret to configure. |

## 10. Asset Strategy

### 10.1 What's actually in `Assets/`

| File | Dimensions | Contents |
|---|---|---|
| `Characters/Adam_idle_16x16.png`, `Alex_...`, `Amelia_...`, `Bob_...` | 64×32 px each | 4 columns × 2 rows of 16×16 frames — a small idle-animation sheet per character (likely 4 facing directions × 2-frame idle bob, or similar). |
| `InteriorElements/16x16/Room_Builder_free_16x16.png` | 272×368 px | Wall/floor/border tiles: room corners, ceiling edges, and multiple flooring/wall material variants (wood, tile, carpet) laid out in a column grid. |
| `InteriorElements/16x16/Interiors_free_16x16.png` | 256×1424 px | A large furniture/object sheet: beds, wardrobes, sofas, tables, chairs, kitchen counters, fridges, TVs, bookshelves, rugs, plants, lamps, mirrors, curtains, desks, and more — dozens of individually-cropped objects on a shared grid. |
| `InteriorElements/32x32/...` and `48x48/...` | 2×/3× of the above | **Pre-rendered upscaled versions of the exact same art**, not separate content. |

This is a standard 16×16-grid top-down interior/furniture tileset (the kind used for Stardew-Valley-style apartment/room scenes), paired with small idle character sheets. Nothing here implies movement, physics, or animation is required — it's furniture-and-walls content, dropped onto a grid.

**Open item:** confirm the license/source of this pack before shipping publicly (see Section 22 and Section 26) — it wasn't specified where it was sourced from, and typical itch.io interior packs range from CC0 to "credit required" to "no redistribution."

### 10.2 Rendering approach: DOM + CSS, not canvas

- **No canvas/game engine is necessary.** The room is a fixed arrangement of a limited number of tiles/furniture pieces with no per-frame redraw. A CSS grid of `<div>` cells, each cropped from a sprite sheet via `background-image` + `background-position`, fully reproduces the room and is far faster to build and debug than a canvas renderer.
- Define a small TypeScript map of `{ spriteName: { x, y } }` pixel coordinates for only the specific tiles/furniture actually used in the MVP room (floor tile, wall/border tile, bed, sofa, table, one or two decorative objects). This map is trivial to extend — adding a new piece of furniture is a one-line coordinate addition, not a rendering-code change.
- Render the room as a fixed-size CSS grid; each grid cell is a `div` styled with the sheet as its background image and the correct `background-position` offset, sized exactly to one tile.

### 10.3 Which resolution tier to use

Use the **32×32 tier directly** as shipped — do not take the 16×16 sheet and scale it in CSS.
- The pack already ships pixel-perfect nearest-neighbor upscales at 32×32 and 48×48; using the tier that matches our target on-screen tile size avoids any runtime scaling math and guarantees crisp source pixels.
- 16×16 makes a full room feel cramped next to a HUD on a normal laptop screen; 48×48 eats too much vertical space to fit a full room comfortably. 32×32 is the practical default. This is trivially revisited once a real layout is on screen — it's a single constant, not an architectural decision.

### 10.4 Preventing blurry pixel art

- Apply `image-rendering: pixelated;` (with `image-rendering: -webkit-crisp-edges;` / `image-rendering: crisp-edges;` as fallbacks) to every element that renders a cropped sprite.
- If any further on-screen scaling is applied (e.g., for responsive resizing), scale only by **integer multiples** (1×, 2×, 3×) via CSS `transform: scale()` — never a fractional/arbitrary scale factor, which reintroduces blur regardless of the rendering hint.
- Never run these PNGs through Next.js's built-in `<Image>` automatic resizing/optimization pipeline (it re-encodes and can blur pixel art) — serve them as plain static assets from `public/`.

### 10.5 Characters (optional, effectively free)

Movement is out of MVP scope, but a single static crop of one idle character frame, placed standing in the room, costs nothing (the asset and the same CSS-cropping technique already exist) and makes the room feel inhabited. Treat this as an optional decorative addition, not a feature — no animation loop or input handling should be built around it for the MVP.

### 10.6 Asset organization in the project

Copy `Assets/` into `public/assets/`, preserving the existing subfolder structure so both source and in-app assets stay easy to cross-reference:

```
public/assets/
  characters/
  interior/16x16/
  interior/32x32/
  interior/48x48/
```

## 11. Energy Data Model

A single, small, typed model is sufficient for the MVP. All values below are **mock**, hand-authored or derived, and deterministic (same room number → same numbers every time — no `Math.random()` in the render path).

```ts
interface ApartmentEnergyData {
  roomNumber: string;          // from login input, mock/real: real (user-entered)
  totalConsumptionKwh: number; // mock: static value for the period (e.g. "this month")
  referenceConsumptionKwh: number; // mock: the complex-wide average/reference apartment
  costPerKwh: number;          // mock: a plausible local utility rate, hardcoded
}

interface ApartmentScoreResult {
  score: number;                // 0–100, derived (see Section 12)
  comparisonPercent: number;    // derived: (total - reference) / reference * 100
  estimatedCost: number;        // derived: totalConsumptionKwh * costPerKwh
  status: "Energy Saver" | "Good" | "Average" | "Needs Improvement"; // derived from score
}
```

| Field | Meaning | Mock or Real (MVP) | Path to real data (later) |
|---|---|---|---|
| `roomNumber` | Identifies the apartment | Real (user-typed, unvalidated) | Becomes the real login identity once real auth exists (Phase 3). |
| `totalConsumptionKwh` | Energy used by the apartment in the period | Mock, hardcoded | Sum of real smart-plug/meter readings for that apartment (Phase 3). |
| `referenceConsumptionKwh` | Average/benchmark consumption for a comparable apartment | Mock, hardcoded | Computed from real aggregate data across the complex (Phase 3+). |
| `costPerKwh` | Local utility rate used to estimate cost | Mock, hardcoded constant | Configurable per building/utility contract (Phase 3). |
| `estimatedCost` | `totalConsumptionKwh * costPerKwh` | Derived from mock inputs | Same formula, real inputs. |
| `comparisonPercent` | How far above/below reference the apartment is | Derived from mock inputs | Same formula, real inputs. |
| `score` / `status` | Gamified summary of performance | Derived from mock inputs | Same formula initially; formula sophistication grows in Phase 4 (see Section 12). |

For the MVP, **one static mock dataset is sufficient** (the resident's room number doesn't need to change the numbers). A near-zero-cost enhancement, if time allows, is deterministically selecting from 3–4 predefined mock profiles via a hash of the room number string — same determinism guarantee, slightly more variety. This is explicitly optional and should not delay the core build.

## 12. Scoring System

**Goal:** a score that's instantly understandable, cheap to compute, and credible enough to explain in one sentence.

**Formula:**

```
comparisonPercent = (totalConsumptionKwh - referenceConsumptionKwh) / referenceConsumptionKwh * 100

score = clamp( round( 100 - comparisonPercent ), 0, 100 )
```

- **Inputs:** `totalConsumptionKwh`, `referenceConsumptionKwh` (both from the mock data model).
- **Calculation:** the score starts at a baseline of 100 (meaning "exactly average"). Every percentage point of consumption *above* the reference apartment subtracts one point; consuming *below* the reference apartment would push the raw value above 100, which is clamped back down to a max of 100 (a resident can't score "more than perfect," but is clearly rewarded by landing at the top of the range).
- **Output:** an integer 0–100.
- **Range meaning:**

| Score range | Status label | Meaning |
|---|---|---|
| 90–100 | "Energy Saver" 🌱 | At or well below the reference apartment's usage. |
| 75–89 | "Good" | Slightly above reference but clearly efficient. |
| 50–74 | "Average" | Noticeably above reference. |
| 0–49 | "Needs Improvement" | Far above reference usage. |

- **Why this is defensible, not arbitrary:** it's a direct, linear normalization against a stated reference value — the same shape of comparison used in real utility "home energy reports" (e.g., "you used X% more than similar homes"), just re-expressed as a 0–100 score for gamification. It is explicitly simple by design; it is not meant to model real tariffs, weather-normalization, or occupancy — that sophistication is deliberately deferred.
- **How it grows later (Phase 3–4, no MVP rework required):** the same `score()` function's *inputs* can be swapped from mock constants to real aggregated smart-plug data without changing its signature; later, the formula itself can add weighting (e.g., per-appliance sub-scores rolling up into the apartment score, time-of-day/peak-usage weighting, household-size normalization) behind the same `ApartmentScoreResult` interface, so nothing that consumes the score (the HUD, a future leaderboard) needs to change.

## 13. Architecture

Client-only Next.js app. No servers, no databases, no external APIs for the MVP.

```
Browser
  └── Next.js app (static/CSR)
        ├── / (login route)          — writes roomNumber + "loggedIn" flag to localStorage
        └── /apartment (main route)  — reads localStorage; renders Room + Dashboard
                ├── Room component        — pure presentational, reads sprite-map + a fixed layout
                └── Dashboard component   — reads mock data module → scoring lib → renders HUD
```

- **Session/state:** `localStorage` holds `{ roomNumber, loggedIn: boolean }`. The `/apartment` route checks this on mount; if absent, client-side redirect to `/`. This is also what satisfies "refresh should not break the experience" in the Definition of Done (Section 24) — a refresh on `/apartment` stays logged in.
- **Data flow:** the mock data module → a pure scoring function → the Dashboard component. The scoring function has no side effects and is the only piece of logic worth unit-testing (Section 20).
- **Rendering:** DOM/CSS sprite cropping, no canvas (Section 10).

## 14. Recommended File Structure

```
app/
  page.tsx                 # Login screen ("/")
  apartment/
    page.tsx               # Main apartment + dashboard screen ("/apartment")
  layout.tsx                # Root layout, global font/meta
  globals.css                # Tailwind entry + pixelated-rendering utility class

components/
  LoginForm.tsx             # Room number / password inputs + submit
  ApartmentRoom.tsx          # Renders the pixel-art room grid
  EnergyDashboard.tsx        # HUD container
  ScoreBadge.tsx             # The big score + status pill
  StatCard.tsx               # Reusable small stat tile (consumption, cost, comparison)

data/
  mockApartment.ts           # ApartmentEnergyData mock value(s), typed
  spriteMap.ts                # {name: {x, y, w, h}} coordinates into the tile sheets

lib/
  scoring.ts                  # Pure scoring/derivation functions + types
  session.ts                    # localStorage get/set/clear helpers

public/
  assets/
    characters/
    interior/16x16/
    interior/32x32/
    interior/48x48/

tests/ (or colocated *.test.ts)
  scoring.test.ts
```

| Directory | Responsibility |
|---|---|
| `app/` | Routing and page composition only — pages import components/data, minimal logic of their own. |
| `components/` | Presentational UI, one concern per file. `ApartmentRoom` and `EnergyDashboard` are the two heaviest components and are the two developers' primary parallel workstreams. |
| `data/` | All mock/static values and the sprite coordinate map — the only place hardcoded numbers should live. |
| `lib/` | Pure, framework-independent logic — scoring math and session helpers. Easiest code to unit test, easiest code to hand to Claude Code in isolation. |
| `public/assets/` | Static pixel-art files, untouched/uncompressed, served as-is. |

## 15. Team Responsibilities

Two parallel workstreams, split so the two developers rarely touch the same file.

| | **Person A — Foundation & Logic** | **Person B — Visual & Interaction** |
|---|---|---|
| Owns | `app/page.tsx` (login), `lib/`, `data/mockApartment.ts`, project setup, tests, deployment | `components/ApartmentRoom.tsx`, `data/spriteMap.ts`, `components/EnergyDashboard.tsx` + `ScoreBadge`/`StatCard`, `public/assets/`, Tailwind theme/pixelated CSS |
| Builds | Fake login flow, `localStorage` session helpers, `ApartmentEnergyData` type + mock values, `scoring.ts` pure functions, Vitest unit tests, Vercel deploy | The pixel-art room (sprite cropping + layout), the HUD UI/styling, visual polish and responsiveness |
| Depends on B for | The `/apartment` route eventually needing `ApartmentRoom` and `EnergyDashboard` to compose against | Nothing blocking — B can build the room and dashboard against a hand-typed stub `ApartmentScoreResult` object before A's real `scoring.ts` lands |
| Depends on A for | Nothing blocking — A can build login/session/scoring fully in isolation with unit tests, no UI needed | The final typed shape of `ApartmentEnergyData`/`ApartmentScoreResult` (agree on this **before** coding — see below) |

**Agree before coding (the shared contract):** the exact shape of `ApartmentEnergyData` and `ApartmentScoreResult` (Section 11) and the sprite coordinate map format in `spriteMap.ts` (Section 10.2). Once these two TypeScript interfaces are agreed, both people can work fully in parallel against stub data.

**Integration point:** `app/apartment/page.tsx` — a short "shell" file that imports `ApartmentRoom` and `EnergyDashboard` and wires real data through. Keep this file intentionally tiny and touch it together (pair for 15 minutes) rather than having either person iterate on it solo, since it's the one file both branches will want to edit.

**Likely merge-conflict hotspots to avoid editing simultaneously:** `app/apartment/page.tsx`, `tailwind.config.ts`/`globals.css` (agree on the pixelated-rendering utility class name up front so both aren't adding it independently), and `package.json` (coordinate before either person adds a dependency).

**Branch strategy:** see Section 19.

## 16. Development Phases

| Phase | Name | Goal |
|---|---|---|
| 0 | Project setup | Next.js + TS + Tailwind scaffold, deployed "hello world" on Vercel |
| 1 | Data & scoring foundation | Types, mock data, pure scoring functions, unit tests |
| 2 | Login screen | Fake login UI + session write |
| 3 | Apartment room rendering | Sprite map + CSS-cropped static room |
| 4 | Energy dashboard (HUD) | Stat cards, score badge, status pill, styled as a game HUD |
| 5 | Integration | Wire login → session guard → room + dashboard on `/apartment`, room number visible |
| 6 | Polish | Visual coherence, responsive layout, pixel-rendering QA |
| 7 | Testing | Unit tests pass, manual QA checklist (Section 20) run end-to-end |
| 8 | Deployment | Production build verified, deployed to Vercel |

Phases 1–4 are parallelizable per Section 15; Phases 5–8 require both developers.

## 17. Detailed Task Breakdown

Each task below is scoped to be handed to Claude Code as one focused implementation prompt.

| # | Phase | Objective | Files | Depends on | Definition of Done | Owner |
|---|---|---|---|---|---|---|
| 1 | 0 | Scaffold the app | `package.json`, `app/layout.tsx`, `app/page.tsx`, `tailwind.config.ts` | — | `npm run dev` shows a blank Next.js + Tailwind page; `npm run build` succeeds | A |
| 2 | 0 | Deploy skeleton to Vercel | Vercel project link | Task 1 | A public preview URL loads the blank scaffold | A |
| 3 | 1 | Define data model types | `lib/scoring.ts` (types), `data/mockApartment.ts` | Task 1 | `ApartmentEnergyData` and `ApartmentScoreResult` types exist and are agreed with Person B | A |
| 4 | 1 | Implement scoring logic | `lib/scoring.ts` | Task 3 | Pure `computeScore(data): ApartmentScoreResult` implemented per Section 12 formula | A |
| 5 | 1 | Unit test scoring logic | `lib/scoring.test.ts` | Task 4 | Vitest covers: at-reference (score 100), above-reference, below-reference clamp, each status boundary | A |
| 6 | 1 | Session helpers | `lib/session.ts` | Task 1 | `setSession`, `getSession`, `clearSession` wrapping `localStorage`, typed | A |
| 7 | 2 | Login screen UI | `components/LoginForm.tsx`, `app/page.tsx` | Task 1 | Room number + password inputs, submit calls `setSession` and navigates to `/apartment`; empty room number blocked client-side | A |
| 8 | 3 | Copy & organize assets | `public/assets/**` | — | Assets copied from `Assets/` into `public/assets/` preserving subfolders | B |
| 9 | 3 | Define sprite coordinate map | `data/spriteMap.ts` | Task 8 | Coordinates recorded for: 1 floor tile, 1 wall/border tile, bed, sofa, table, 1–2 decorative items, from the 32×32 sheets | B |
| 10 | 3 | Render the room | `components/ApartmentRoom.tsx` | Task 9 | A fixed-size CSS grid renders a coherent small room using only `background-position` crops; `image-rendering: pixelated` applied; no blur at any integer zoom | B |
| 11 | 4 | Build HUD stat components | `components/StatCard.tsx`, `components/ScoreBadge.tsx` | Task 3 (types only, can stub) | Presentational components accept typed props and render consumption/cost/comparison/status visually as a HUD, not a business dashboard | B |
| 12 | 4 | Assemble the dashboard | `components/EnergyDashboard.tsx` | Task 11 | Composes `StatCard`s + `ScoreBadge` from an `ApartmentScoreResult` + `ApartmentEnergyData` prop | B |
| 13 | 5 | Build the apartment route shell | `app/apartment/page.tsx` | Tasks 6, 7, 10, 12 | Route reads session (redirects to `/` if absent), renders room number, `ApartmentRoom`, and `EnergyDashboard` fed by `mockApartment.ts` → `computeScore` | A + B (paired) |
| 14 | 5 | Logout | `app/apartment/page.tsx` or a small `LogoutButton` | Task 13 | Clears session, navigates to `/` | Either |
| 15 | 6 | Responsive + visual polish pass | `components/*`, `globals.css` | Task 13 | Room + HUD read coherently on both desktop width and a common mobile width; no layout breakage | B |
| 16 | 7 | Manual QA pass | — | Task 15 | Full checklist in Section 20 executed and passing | A + B |
| 17 | 8 | Production build + deploy | Vercel | Task 16 | `npm run build` clean, deployed URL matches Definition of Done (Section 24) | A |

## 18. Claude Code Workflow

**General principles for this project specifically:**
- Treat each row in Section 17 as one Claude Code task. Don't batch multiple rows into a single prompt — smaller diffs are easier for the other teammate to review and reduce the chance Claude "helpfully" touches unrelated files.
- **Use Plan Mode** before any task that creates new files or establishes a new pattern (Tasks 1, 3, 9, 10, 13). Skip plan mode for small, mechanical follow-ups (Task 14, small copy/style tweaks).
- **Use `/clear` between unrelated tasks**, especially when switching between Person A's logic-side work and Person B's visual-side work in the same terminal session — stale context about the room grid isn't useful (and burns tokens) while writing scoring unit tests, and vice versa.
- **Ask Claude to inspect before modifying** whenever picking up a task that touches a file the other person already wrote (e.g., before Task 13's integration, ask Claude to read `ApartmentRoom.tsx` and `EnergyDashboard.tsx` and summarize their prop contracts before wiring them up — don't let it rewrite either component to "fit better" without being asked).
- **Explicitly tell Claude "do not refactor working code"** when a task is additive (e.g., "add a logout button" should not turn into a restyle of the whole apartment page). This project's tight deadline makes unrequested rewrites especially costly.
- **Verify after every task:** run `npx tsc --noEmit` and `npm run build` after any non-trivial change, and re-run `npm test` after any change to `lib/scoring.ts`. Do this before moving to the next task, not in a batch at the end.
- **Minimize context usage:** for logic-only tasks (scoring, session helpers), there's no need to have the whole `components/` tree in context — point Claude specifically at `lib/` and `data/`.

**Recommended prompt sequence** (mirrors Section 17; do not execute yet):

1. "Scaffold a Next.js (App Router) + TypeScript + Tailwind project. No extra dependencies. Verify `npm run dev` and `npm run build` both work." *(Task 1)*
2. "Read Section 11/12 of README.md. Create `lib/scoring.ts` with the `ApartmentEnergyData`/`ApartmentScoreResult` types and a pure `computeScore` function implementing the exact formula described. Add `data/mockApartment.ts` with one static mock value. No UI." *(Tasks 3–4)*
3. "Add Vitest, then write unit tests for `computeScore` covering the score-100 at-reference case, an above-reference case, a below-reference clamp-to-100 case, and one test per status boundary in the table in Section 12." *(Task 5)*
4. "Create `lib/session.ts` with typed `setSession`/`getSession`/`clearSession` wrapping `localStorage` for `{ roomNumber: string, loggedIn: boolean }`. Then build `components/LoginForm.tsx` and wire it into `app/page.tsx`: on submit, reject empty room number, otherwise call `setSession` and navigate to `/apartment`." *(Tasks 6–7)*
5. "Inspect `public/assets/interior/32x32/*.png` (do not modify). Report tile grid size and propose pixel coordinates for a floor tile, a wall/border tile, a bed, a sofa, and a table, to go into `data/spriteMap.ts`." *(Task 9, inspect-first)*

Continue this pattern through Tasks 10–17, always ending a task with a build/test verification step before starting the next.

## 19. Git Workflow

Kept intentionally simple for a 2-person team on a deadline.

- **Branch naming:** `feature/<short-task-name>`, e.g. `feature/login`, `feature/room-render`, `feature/scoring`, `feature/dashboard`.
- **Commit strategy:** small, frequent commits per logical change; no requirement to squash. Commit messages describe *why* when non-obvious, not a restatement of the diff.
- **Merge cadence:** merge to `main` as soon as a task from Section 17 is done and builds cleanly — don't let branches live more than a day given the timeline. Frequent small merges beat one large end-of-project merge.
- **Before opening a PR:** pull latest `main` and resolve conflicts locally.
- **Files not to edit simultaneously on two branches:** `app/apartment/page.tsx`, `tailwind.config.ts`/`globals.css`, `package.json` (see Section 15's merge-conflict hotspots). If both need a change there in the same window, do it paired/live instead of on separate branches.
- **Shared components** (`StatCard`, `ScoreBadge`): once a component's prop interface is agreed, only its owner (Person B) should change its external API; the other person consumes it as-is or requests a change rather than editing it directly.

## 20. Testing Strategy

| Area | How | Why this level |
|---|---|---|
| Scoring calculation | Vitest unit tests on `computeScore` (Section 12 boundary cases) | Pure function, high bug risk if wrong, cheap to test — the one thing worth automating |
| Login flow | Manual QA (enter any room number/password → lands on `/apartment`; empty room number blocked) | Trivial flow, not worth E2E tooling setup for MVP |
| Room rendering | Manual visual QA at multiple zoom levels / browser widths, checking for blurring | Visual correctness isn't meaningfully unit-testable; a checklist is more effective than brittle pixel-diff tests |
| Dashboard values | Manual QA cross-check against `mockApartment.ts` values by hand | Small, fixed dataset — easy to eyeball-verify |
| Navigation | Manual QA: login → apartment → logout → back to login; refresh on `/apartment` stays logged in | Session logic is simple enough that a scripted test isn't worth the setup time yet |
| Responsive behavior | Manual QA at a common desktop width and a common mobile width | No responsive framework complexity to justify automated viewport testing |
| Asset rendering | Manual QA: zoom in/out, confirm no blur, confirm `image-rendering: pixelated` is applied everywhere sprites render | Visual, checklist-appropriate |
| Production build | `npm run build` + serve locally, or the Vercel preview URL | Confirms nothing environment-specific (e.g., a dev-only import) breaks the real build |

No E2E framework (Playwright/Cypress) for the MVP — see Section 9 for reasoning. Revisit once a real backend/auth exists and there are more flows worth regression-protecting.

## 21. Deployment

- **Platform:** Vercel.
- **Build command:** default Next.js build (`next build`); no custom build steps needed.
- **Environment variables:** none required for the MVP — there is no backend, API key, or database connection string to configure.
- **Backend requirement:** none. The entire MVP is static/client-rendered against bundled mock data.
- **How mock data behaves after deployment:** `data/mockApartment.ts` is bundled into the client build like any other module — it behaves identically in production and in local dev, since it's not read from a database or file system at runtime.
- **Process:** push to `main` → Vercel auto-builds and deploys → verify the live URL against the Definition of Done checklist (Section 24). Feature branches get automatic preview URLs, useful for the two developers to review each other's work before merging.

## 22. Risks and Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| Deadline risk | Miss the ship date | MVP is deliberately scoped to 5 features (Section 4); anything not in that list is out, no exceptions, until the MVP is done and deployed. |
| Scope creep (esp. from the long-term vision) | MVP never ships because "just one more feature" | Section 5's out-of-scope list is explicit; Claude Code prompts should quote it when a task risks drifting into Phase 2+ territory. |
| Pixel-art rendering complexity | Blurry/misaligned sprites undermine the whole visual identity | Use the pre-scaled 32×32 tier directly, `image-rendering: pixelated` everywhere, integer-only scaling (Section 10.4) — verified visually in Task 15/Section 20. |
| Asset licensing | Can't legally ship/demo with these assets | **Unresolved — flagged in Section 26.** Confirm the source/license of the `Assets/` pack before any public deployment or demo distribution. |
| Responsive layout | Room + HUD don't fit together on smaller screens | Design the HUD as a side panel on desktop that collapses to a stacked/bottom layout on mobile widths; verified in manual QA (Section 20). |
| Fake vs. real energy data confusion | Users or judges/stakeholders think the numbers are real when they're mocked | Consider a small, honest UI label (e.g., "Simulated data") if this is presented externally — a one-line decision to make together (Section 26). |
| Scoring credibility | Score feels arbitrary or unfair to a technical reviewer | Formula is a direct, explainable percentage-vs-reference normalization (Section 12), not a black box — document it in-app if time allows. |
| Future backend migration | Rework needed when real IoT data arrives | Mock data and scoring are already isolated behind typed interfaces (`ApartmentEnergyData`, `ApartmentScoreResult`) — swapping the data source later doesn't require touching the UI layer (Section 25). |
| Claude Code introducing unnecessary complexity | Wasted time, harder-to-review diffs, drift from the plan | Grant Claude Code focused, single-task prompts (Section 17/18); explicitly instruct "do not refactor working code" on additive tasks; run `tsc`/`build` after each task to catch drift immediately. |

## 23. Future Roadmap

| Phase | Scope |
|---|---|
| **Phase 1 (this document)** | MVP: fake login, static pixel-art room, mocked dashboard, one apartment score. |
| **Phase 2** | Interactive appliances/sockets: hover states, socket selection, appliance placement/drag-and-drop, appliance appearing in the room, per-appliance mocked or lightly-modeled energy data. |
| **Phase 3** | Real energy data: introduce a real backend and database, real authentication, and integration with real smart plugs/meters or a telemetry ingestion pipeline; replace mock modules with real data sources behind the same typed interfaces. |
| **Phase 4** | Complex gamification: daily/weekly challenges, achievements, streaks, rewards, personalized energy-saving recommendations, historical usage graphs. |
| **Phase 5** | Building-wide competition: real-time leaderboard across the housing complex, building-level statistics, resident profiles, notifications. |

| Future feature | How the MVP architecture already allows it without building it now |
|---|---|
| Socket/appliance selection | `ApartmentRoom` already renders from a coordinate/data map (`spriteMap.ts`); appliances become additional entries with click handlers, no rendering-approach change. |
| Appliance-level energy data | `ApartmentEnergyData` can grow an `appliances: ApplianceEnergyData[]` field without breaking existing consumers of the top-level fields. |
| Appliance comparisons | Same `computeScore`-style pure-function pattern applies per-appliance; no architectural change, just more functions in `lib/`. |
| Personalized recommendations | A new derived field/function reading from the same data model; additive. |
| Challenges/achievements/streaks/rewards | New data entities and UI, layered on top of the existing session/data pattern; doesn't require touching the room-rendering or scoring core. |
| Leaderboard | Requires Phase 3's real backend/database (comparing across real apartments); the `ApartmentScoreResult` shape is already what a leaderboard row would sort by. |
| Building statistics | Aggregation over the same per-apartment data model, once real/Phase-3 data exists. |
| IoT/smart plug integration, real-time telemetry | Swaps the *source* feeding `ApartmentEnergyData` from a static module to a real API/DB call — the type stays the same, so the UI layer needs no changes. |
| Resident profiles | New data entity alongside `ApartmentEnergyData`, tied to real auth from Phase 3. |
| Historical energy graphs | New data field (`history: { date, kwh }[]`) plus a new chart component; additive, doesn't touch the MVP's existing components. |
| Notifications | A cross-cutting Phase 4/5 feature layered on top of a real backend; irrelevant to MVP's client-only architecture. |

## 24. MVP Definition of Done

The MVP is complete only when a new user can:

1. Open the web application.
2. Enter any room number/password.
3. Successfully enter the application.
4. See their room/apartment in 2D pixel art.
5. See a gamified energy dashboard.
6. See total energy consumption.
7. See an apartment energy score.
8. See comparison/reference energy data.
9. See an understandable energy status (e.g., "Energy Saver").
10. Navigate/use the application without obvious bugs.
11. Refresh/reopen the application without the core experience breaking (session persists via `localStorage`; pixel art renders crisply).
12. Build and deploy the application successfully (`npm run build` clean, live on a Vercel URL).

## 25. Future Technical Architecture

Once Phase 3 begins, the architecture grows outward from the MVP rather than being replaced:

```
Browser (Next.js, same app shell)
  ├── Real auth (NextAuth or similar) replaces fake login
  ├── API routes / dedicated backend service
  │      └── Database (apartments, residents, appliances, readings)
  │      └── Ingestion layer for smart-plug/meter telemetry
  ├── Scoring logic (same computeScore-style pure functions, real inputs)
  └── Leaderboard/aggregation queries across apartments in a building
```

The load-bearing decision made now that enables this: **keep all energy data and scoring behind typed interfaces (`ApartmentEnergyData`, `ApartmentScoreResult`) and pure functions, never inline mock numbers directly into components.** This is the seam where "mock" becomes "real" later without a UI rewrite.

## 26. Open Questions / Decisions To Make

These need a decision from the team (not Claude Code) before or shortly after MVP work starts:

1. **Asset license/source** — where does the `Assets/` pack come from, and does its license permit our intended use (including any public demo/deployment)? Needs confirmation before external sharing.
2. **Product name** — "WattWise" is a placeholder working title used throughout this document; confirm or replace.
3. **Should the MVP visually label data as "simulated"?** — relevant if this will be shown to non-technical stakeholders who might otherwise assume it's live/real.
4. **Mock data variety** — ship with a single static mock apartment, or the near-zero-cost room-number-hash variant described in Section 11? Not blocking, but worth a quick team decision.
5. **Target device priority** — is desktop the primary target with mobile as a "shouldn't break" concern, or is mobile equally primary? This affects how much responsive-design time to budget in Phase 6/Task 15.

---

## Executive Summary

**A. Recommended MVP architecture:** A single Next.js (App Router) client-rendered app, no backend, no database. Two routes (`/` login, `/apartment` main view). State is a `localStorage` session flag plus a static typed mock-data module, run through a pure scoring function. The room is rendered as a CSS grid of `background-position`-cropped sprites from the existing pixel-art sheets — no canvas, no game engine.

**B. Recommended tech stack:** Next.js + React + TypeScript + Tailwind CSS, deployed on Vercel. No database, no backend, no game engine, no state-management library, no auth library, no animation library, no E2E test framework — all deliberately deferred as unnecessary for MVP scope (Section 9).

**C. Exact MVP feature list:** (1) fake login, (2) static 2D pixel-art apartment room, (3) gamified energy dashboard/HUD, (4) one apartment-level energy score with a documented formula, (5) login → apartment navigation with visible room number and logout. Nothing else (Section 5).

**D. Team responsibilities:** Person A owns login, session, data types, mock data, and the scoring logic (plus tests and deployment). Person B owns the pixel-art room rendering, the sprite coordinate map, and the dashboard/HUD UI and styling. They integrate briefly, paired, at `app/apartment/page.tsx` (Section 15).

**E. Ordered implementation sequence:** Phase 0 (setup) → Phase 1 (data/scoring, A) parallel with Phase 3 prep (asset copy/sprite map, B) → Phase 2 (login, A) parallel with Phase 3–4 (room + HUD, B) → Phase 5 (integration, paired) → Phase 6 (polish) → Phase 7 (testing) → Phase 8 (deploy). Full task-level detail in Section 17.

**F. Future roadmap:** Phase 2 interactive appliances/sockets → Phase 3 real backend/database/IoT data → Phase 4 challenges/achievements/recommendations → Phase 5 building-wide leaderboard. The MVP's typed data model and pure-function scoring are the seam that lets each phase build outward without rewriting the MVP (Section 23/25).

**G. First 5 Claude Code implementation prompts (do not run yet):**
1. Scaffold Next.js + TypeScript + Tailwind, verify dev/build both work.
2. Implement `lib/scoring.ts` types + `computeScore` per Section 12, plus `data/mockApartment.ts` — no UI.
3. Add Vitest and unit-test `computeScore`'s boundary cases.
4. Implement `lib/session.ts` and the login screen (`LoginForm.tsx` + `app/page.tsx`).
5. Inspect (read-only) the 32×32 asset sheets and propose sprite coordinates for `data/spriteMap.ts` before any room-rendering code is written.
