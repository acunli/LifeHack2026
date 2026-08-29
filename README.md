# WattWise — Gamified Energy Saving for Housing Complexes

**LifeHack 2026 · Ecovolt track: "Small Green Habits"**

> Planning document and single source of truth. No application code exists yet —
> this repository currently contains pixel-art assets and this plan.

---

## 0. What changed in this revision

This builds on Ayushman's plan (`a999937`), which was right about the things that
matter most: DOM/CSS sprite cropping over a canvas engine, deterministic mock
data, the 32×32 tier, and a tightly-bounded MVP. Those decisions all stand.

Added or changed:

| # | Change | Why |
|---|---|---|
| 1 | **§1–2: the actual brief and rubric** | The previous revision was written without the Ecovolt problem statement. The rubric changes what we should prioritise. |
| 2 | **§6: required deliverables** | The brief requires a demo video and a written rationale. Neither was in the plan. A perfect app that misses these scores zero on them. |
| 3 | **§15: four-person split** | Previous split assumed two people. |
| 4 | **§16: dated timeline with cut-lines** | Phases had no clock against a hard deadline. |
| 5 | **§9: asset measurements verified** | All ten PNGs measured with `sips`. Ayushman's figures were correct; exact tile grids now recorded. |
| 6 | **§9.7: licence resolved** | Was an open item. It's LimeZu *Modern Interiors*. |
| 7 | **§12: measurability** | The rubric asks for a baseline, a metric and a target. We had none. |

---

## 1. The brief we are being judged against

From the Ecovolt problem statement:

> **How might we nudge ordinary people toward sustainable habits — around energy,
> water, waste, or consumption — in a way that produces real, measurable
> behaviour change rather than just good intentions?**

The framing to internalise, in their words:

> *"Sustainability does not have a data problem; it has a behaviour problem."*

Their deck lists what has already failed: **Dashboards — Ignored. Statistics —
Ignored. Stern reminders — Ignored.**

**Hard constraints** (from §4 of the brief):

1. Usable end-to-end by a real person
2. Targets **one concrete sustainable behaviour**
3. Makes a credible, **measurable** case for why the behaviour would change

**Explicitly permitted:** *"You do NOT need real sensors, hardware, or live data;
you may invent or mock any inputs."* Our entire mock-data approach is sanctioned —
we never need to apologise for simulated telemetry.

**Explicitly discounted:** *"A technically heavy backend will not earn extra points
if it does not move behaviour."*

---

## 2. Judging rubric → what it means for our scope

Weights are from the Ecovolt slide deck (the PDF lists criteria without weights;
the deck is the later document and carries the weightings).

| Criterion | Weight | What it asks |
|---|---|---|
| **Fun and engagement** | **40%** | Would you use it regularly? Would you tell friends? |
| Behaviour change | 20% | A real behaviour, and a believable path to it |
| Stickiness | 20% | Survives the novelty. Streaks, social hooks |
| Craft and usability | 20% | Usable end to end, polished, clear |

The PDF also lists **Measurability** as a criterion — dropped from the deck's
weighted list but still a hard constraint in §4. Cover it (see §12).

### What this means for us

**Fun and engagement is the single heaviest criterion, and the pixel apartment is
our answer to it.** Protect it. Every hour spent on the room and its polish is
spent on the 40%.

**⚠️ Open scope risk.** The current MVP specifies a *fully static* room. Against
"would you use it regularly, would you tell your friends," a picture you look at
once is thin. The cheapest fix that materially moves this criterion is **hover-to-
inspect on 3–4 appliances** — one tooltip component, no new state, no new routes.
See §21, decision 1. This is a scope call the team should make deliberately rather
than by default.

**Behaviour change and Measurability are our weakest axes** and we should be
honest with ourselves about it. A general apartment score does not target one
concrete behaviour, which is hard constraint #2. §12 sets out the strongest
credible case we can make within the current direction.

---

## 3. Project overview

WattWise lets a resident of a housing complex log into a top-down pixel-art version
of their own apartment, see their energy consumption translated into a game-like
score, and understand how they compare to the rest of the building.

The apartment **is** the interface. We are not building another dashboard with a
room graphic bolted on; the room is the primary surface and the numbers live
around it.

---

## 4. MVP scope

Exactly these six things:

| # | Feature | Notes |
|---|---|---|
| 1 | Fake login | Any room number + non-empty password succeeds. No backend. |
| 2 | 2D pixel-art apartment | Static top-down room from the asset packs. No movement. |
| 3 | Energy HUD | Consumption, score, comparison vs reference, estimated cost, rank label. |
| 4 | Apartment score | One number, deterministic, documented formula (§11). |
| 5 | Navigation & session | Login → apartment. Room number visible. Logout works. Refresh survives. |
| 6 | **Demo video + rationale** | Required deliverables (§6). Not optional extras. |

All data is **mocked and deterministic**: same inputs always produce the same
numbers, no `Math.random()` anywhere in the render path (it also causes React
hydration mismatches under SSR, which surface as visible flicker or a crash).

---

## 5. Out of scope

Listed so nobody — human or Claude Code — scope-creeps into them:

- Appliance placement, drag-and-drop, socket configuration flows
- Real smart plugs, IoT, meters, live telemetry
- Real authentication, databases, any backend service
- AI recommendations, ML prediction
- Character movement, multiplayer, physics
- Real-time or persisted leaderboard
- Admin dashboard, notifications, mobile app

**Deliberately undecided:** appliance *hover* interaction — see §2 and §21.

---

## 6. Required deliverables

The brief lists three required outputs. **All three are graded. Two of them are
not code.**

| # | Deliverable | Spec | Owner |
|---|---|---|---|
| 1 | Working prototype | Web app a real person can pick up and use | Lanes A–C |
| 2 | **Demo video** | 2–3 min, end-to-end, "ideally with someone actually using it" | **Lane D** |
| 3 | **Written rationale** | Target audience · the specific behaviour · the mechanic · how success is measured | **Lane D** |

Deliverable 3 is four questions with four short answers. It takes an hour and
carries real marks. It has historically been the thing teams discover at 10:40am.

---

## 7. User flow

```
LOGIN  (room number + password)
  ↓
APARTMENT
  ├── pixel-art room, rendered from sprite sheets
  ├── HUD: consumption · score · comparison · cost · rank
  └── logout
```

Two routes. That is the whole application.

---

## 8. Technology stack

| Layer | Choice |
|---|---|
| Framework | Next.js (App Router) |
| Language | TypeScript |
| UI | React + Tailwind CSS |
| State | `localStorage`, no store library |
| Data | Static TypeScript modules |
| Tests | Vitest (scoring functions only) |
| Deploy | Vercel |

**No game engine.** The room is a fixed arrangement of tiles with no per-frame
redraw. A CSS grid of `<div>`s cropping a sprite sheet via `background-position`
reproduces it exactly and is far faster to build and debug than canvas.

**Note:** Node was not installed on Josh's machine as of this revision — installed
via `brew install node` (v26.7.0). Anyone else hitting `command not found: node`
needs the same.

---

## 9. Asset strategy

### 9.1 Verified contents

Every file measured with `sips`. All ten confirmed:

| File | Dimensions | Tile grid |
|---|---|---|
| `Room_Builder_free_16x16.png` | 272 × 368 | 17 × 23 |
| `Room_Builder_free_32x32.png` | 544 × 736 | 17 × 23 |
| `Room_Builder_free_48x48.png` | 816 × 1104 | 17 × 23 |
| `Interiors_free_16x16.png` | 256 × 1424 | 16 × 89 |
| `Interiors_free_32x32.png` | 512 × 2848 | 16 × 89 |
| `Interiors_free_48x48.png` | 768 × 4272 | 16 × 89 |
| `Adam / Alex / Amelia / Bob _idle_16x16.png` | 64 × 32 each | 4 × 2 frames of 16×16 |

**The three tiers are pre-rendered upscales of identical art, not different
content.** Room Builder is always 17×23 tiles; Interiors is always 16×89.

### 9.2 Use the 32×32 tier natively

Take the 32×32 sheets as shipped. Do **not** take the 16×16 sheet and scale it in
CSS — the pack already ships pixel-perfect nearest-neighbour upscales, so using the
matching tier avoids runtime scaling entirely and guarantees crisp source pixels.

16×16 makes a room feel cramped beside a HUD on a laptop. 48×48 eats too much
vertical space. 32×32 is the practical default, and it is one constant to change.

### 9.3 Characters need exactly 2×

Characters ship **only at 16×16** — there is no 32px or 48px variant. A character
placed in a 32px room must be scaled by exactly **2×** (or 3× against 48px).
Integer multiples only; a fractional scale reintroduces blur regardless of
`image-rendering`.

A single static idle frame, standing in the room, costs nothing and makes the space
feel inhabited. No animation loop. Decorative only.

### 9.4 Keeping pixel art crisp

- `image-rendering: pixelated` on every element rendering a crop
- Scale only by integer multiples, via `transform: scale()`
- **Never** run these PNGs through Next.js `<Image>` optimisation — it re-encodes
  and blurs pixel art. Serve as plain static files from `public/`.

### 9.5 Organisation

Copy `Assets/` into `public/assets/`, preserving structure:

```
public/assets/
  characters/
  interior/16x16/  interior/32x32/  interior/48x48/
```

### 9.6 The sprite map is the long pole

Picking coordinates out of a 16 × 89 furniture sheet means *looking* at it. This is
the single task most likely to consume an afternoon.

**Method:** render the sheet once with an indexed grid overlay (row/column numbers
burned on), screenshot it, and read coordinates off the image. Minutes instead of
hours of trial-and-error. Do this before writing any of `ApartmentRoom.tsx`.

Only map what the room actually uses: one floor tile, one wall tile, and 5–7
furniture pieces. Adding a piece later is a one-line coordinate addition.

### 9.7 Licence — resolved

These are **LimeZu — Modern Interiors**, free version.

- **Credit LimeZu visibly in the app.** A line in the footer or login screen.
- The free-version licence is more restrictive than the paid one. Committing the
  raw sheets to a public repo may exceed it — they are already committed here, so
  either confirm the licence permits it or make the repo private before judging.

---

## 10. Energy data model

```ts
interface ApartmentEnergyData {
  roomNumber: string;              // from login, user-entered
  totalConsumptionKwh: number;     // mock, static for the period
  referenceConsumptionKwh: number; // mock, the complex-wide average
  costPerKwh: number;              // mock, plausible local tariff
}

interface ApartmentScoreResult {
  score: number;             // 0–100, derived (§11)
  comparisonPercent: number; // (total - reference) / reference * 100
  estimatedCost: number;     // totalConsumptionKwh * costPerKwh
  status: "Energy Saver" | "Good" | "Average" | "Needs Improvement";
}
```

Use **S$0.2994/kWh** for `costPerKwh` — the Singapore regulated tariff. A real
local figure is free credibility on stage.

One static mock dataset is sufficient. Optionally, deterministically select from
3–4 profiles by hashing the room number — same determinism guarantee, more variety.
Explicitly optional; must not delay the core build.

---

## 11. Scoring system

```
comparisonPercent = (total - reference) / reference * 100
score             = clamp(round(100 - comparisonPercent), 0, 100)
```

| Score | Status | Meaning |
|---|---|---|
| 90–100 | Energy Saver 🌱 | At or below the reference apartment |
| 75–89 | Good | Slightly above reference |
| 50–74 | Average | Noticeably above |
| 0–49 | Needs Improvement | Far above |

**Why it is defensible:** a direct linear normalisation against a stated reference —
the same comparison real utility "home energy reports" use ("you used X% more than
similar homes"), re-expressed 0–100. Deliberately simple. It does not model
tariffs, weather or occupancy, and we should say so rather than be caught claiming
otherwise.

Set the mock numbers so the demo apartment lands around **72–78** — visibly
imperfect, with obvious room to improve. A demo that opens on 94/100 has nowhere
to go and nothing to talk about.

---

## 12. Measurability — baseline, metric, target

The rubric asks whether you could tell **with evidence** that it worked. State this
explicitly in the rationale and on a slide:

| | |
|---|---|
| **Audience** | Residents of a multi-unit housing complex |
| **Behaviour** | Reducing household electricity consumption against a peer benchmark |
| **Metric** | Monthly kWh per apartment, and the derived 0–100 score |
| **Baseline** | The complex-wide reference consumption (`referenceConsumptionKwh`) |
| **Target** | A pilot cohort moves +10 score points (≈10% consumption reduction) over 8 weeks |
| **How measured** | Per-apartment meter reads, pre- and post-rollout, against the non-participating remainder of the complex as a control |

**Be honest about the limitation.** We are not measuring one specific behaviour;
we are measuring total consumption. Saying so plainly is stronger than being caught
overclaiming — the rubric rewards a credible case, and judges recognise the
difference between a clear-eyed limitation and hand-waving.

---

## 13. Architecture

```
Browser
└── Next.js app (client-rendered)
      ├── /            login → writes { roomNumber } to localStorage
      └── /apartment   reads session; renders Room + Dashboard
            ├── ApartmentRoom      presentational; spriteMap + fixed layout
            └── EnergyDashboard    mock data → scoring → HUD
```

`/apartment` checks session on mount; redirects to `/` if absent. This is also what
makes refresh survive.

**Hydration discipline:** `localStorage` does not exist during SSR. Read it in
`useEffect`, never during render, and render the same empty state on server and
first client pass. Reading storage during render hydrate-mismatches.

---

## 14. File structure

```
app/
  layout.tsx  page.tsx           ← login
  apartment/page.tsx             ← integration shell (keep tiny)
  globals.css
components/
  LoginForm.tsx
  ApartmentRoom.tsx
  EnergyDashboard.tsx  StatCard.tsx  ScoreBadge.tsx
lib/
  scoring.ts  scoring.test.ts  session.ts
data/
  mockApartment.ts  spriteMap.ts
public/assets/
docs/
  rationale.md  demo-script.md
```

---

## 15. Four-person team split

Four lanes, split so two people rarely touch the same file. Each lane below lists
what it owns, what it must never touch, its hour-by-hour work, and its handoffs.

**The three rules that make this work:**

1. **Own your files.** If a change lands outside your lane's file list, ask first.
2. **Handoffs are scheduled, not ad hoc.** Every arrow in §15.5 has a clock time.
3. **Three checkpoints — 14:00, 18:00, 22:00.** Five minutes standing up. What
   landed, what slipped, what you need from whom.

---

### Lane A — Foundation & Logic

**Exists because:** everyone else is blocked until the repo builds. A's first hour
is the whole team's first hour.

**Owns:** `app/layout.tsx` · `app/page.tsx` · `lib/scoring.ts` · `lib/session.ts` ·
`lib/scoring.test.ts` · `package.json` · Vercel
(`data/mockApartment.ts` is authored by D and consumed here)

**Never touches:** `components/*` · `globals.css` · `data/spriteMap.ts`

**Blocked by:** nobody. Starts first, at 13:00.

| Window | Work | Output |
|---|---|---|
| **13:00–14:00** | 🚩 **Scaffold and push.** `create-next-app` + TS + Tailwind, builds clean, on `main`. **Three people are idle until this lands — it is the highest-priority hour on the team.** | repo |
| 14:00–15:00 | 🚩 **The two interfaces** (§10). Publish the moment they compile — B and C code against them. Shape matters more than correctness here; get it agreed, then refine. | `lib/scoring.ts` |
| 15:00–16:00 | `computeScore` per §11, plus typed session helpers. Pure functions, no UI. | `lib/scoring.ts`, `lib/session.ts` |
| 16:00–17:00 | Login screen, using D's copy. Rejects an empty room number, writes session, navigates. | `app/page.tsx` |
| 17:00–17:30 | Vitest on the scoring boundaries: at-reference, above, below-clamp, each status edge. | `lib/scoring.test.ts` |
| 17:30–19:00 | **Integration 1** — paired on `app/apartment/page.tsx` | the shell |
| 19:00–22:00 | Vercel project, first deploy, session-guard and refresh behaviour | live URL |
| 22:00–00:00 | Deploy the frozen build. Verify the live URL, not localhost. | live URL |
| 07:00–09:00 | QA checklist with the team | — |
| 09:00–10:00 | 🚩 **Final production build and deploy.** Verify in a fresh incognito window. | live URL |

**Hands out:** working repo → all (14:00) · types → B, C (15:00) · live URL → D (22:00)
**Needs in:** copy → from D (16:00) · `mockApartment.ts` → from D (16:00)

---

### Lane B — Room & Assets

**Exists because:** the pixel room is the product. It is also the longest task on
the board and the one most likely to overrun.

**Owns:** `components/ApartmentRoom.tsx` · `data/spriteMap.ts` · `public/assets/`

**Never touches:** `lib/*` · `globals.css` · HUD components

**Blocked by:** A's scaffold at 14:00 — but the overlay work (the risky part) needs
no scaffold and starts at 13:00.

| Window | Work | Output |
|---|---|---|
| 13:00–13:30 | Copy `Assets/` → `public/assets/`, structure preserved (§9.5) | assets in place |
| **13:30–15:00** | 🚩 **Indexed sheet overlay** (§9.6) — render both sheets with row/column numbers burned on, screenshot them. **This is the long pole. Timebox to 90 minutes.** If it overruns, cut furniture variety, not this step — guessing coordinates by trial and error costs far more. | two reference images |
| 15:00–16:30 | `spriteMap.ts` — one floor tile, one wall tile, 5–7 furniture pieces from the **32×32** sheets. Nothing speculative; map only what the room uses. | `data/spriteMap.ts` |
| 16:30–18:00 | 🚩 **Render the room.** CSS grid, `background-position` crops, `.pixelated`. Ugly layout is fine; *rendering at all* is the milestone. | `ApartmentRoom.tsx` |
| 18:00–19:00 | Lay the room out properly. Optional: one static character frame at exactly 2× (§9.3). | `ApartmentRoom.tsx` |
| 19:00–22:00 | Pixel QA — every integer zoom, no blur, no seams, no half-pixel offsets | — |
| 22:00–00:00 | Frozen. Support C on layout only. | — |
| 07:00–09:00 | QA checklist with the team | — |

**Hands out:** a rendering room → C and D (18:00) — D cannot film without it
**Needs in:** repo → from A (14:00) · `.pixelated` class name → agreed with C (14:00)

> **If B slips, the demo slips.** The 18:00 milestone is the one to protect. A room
> with three pieces of furniture that renders beats a beautiful one that does not.

---

### Lane C — HUD & Visual System

**Exists because:** the room and the numbers have to read as one product rather
than a game with a spreadsheet stapled to it. C owns the 20% craft score.

**Owns:** `components/EnergyDashboard.tsx` · `StatCard.tsx` · `ScoreBadge.tsx` ·
`app/globals.css` · the Tailwind theme

**Never touches:** `lib/*` · `data/spriteMap.ts` · `ApartmentRoom.tsx`

**Blocked by:** A's scaffold at 14:00 — the first hour is design, not code.

| Window | Work | Output |
|---|---|---|
| 13:00–14:00 | **Pull the palette out of the tileset** so the HUD and the room share colours, and sketch the HUD on paper. No code — the repo does not exist yet. Agree the `.pixelated` class name with B. | a palette |
| 14:00–15:30 | Design tokens, type scale, `globals.css`, Tailwind theme | `globals.css` |
| 15:30–17:00 | `StatCard` + `ScoreBadge` against a hand-typed stub. **Build against the stub — do not wait for A.** | components |
| 17:00–17:30 | `EnergyDashboard` composes them from the two typed props | `EnergyDashboard.tsx` |
| **17:30–19:00** | 🚩 **The score reveal, paired with D.** The five seconds carrying the heaviest criterion. | `ScoreBadge.tsx` |
| 19:00–22:00 | Polish: spacing, hierarchy, the room and HUD reading as one surface. Laptop width first. | — |
| 22:00–00:00 | Final polish pass. Nothing new — tighten what exists. | — |
| 07:00–09:00 | Fix what D's cold user test found | — |

**Hands out:** HUD → integration (17:30)
**Needs in:** types → from A (15:00) · copy → from D (16:00) · room → from B (18:00)

> **C is the lane most able to absorb a slip elsewhere.** Building against a stub
> means C is never truly blocked, so if A or B overruns, C is where the spare hands
> come from.

---

### Lane D — Experience & Story

**Owns:** the demo narrative · **all on-screen copy** · the score-reveal moment ·
`data/mockApartment.ts` · `docs/` · the video · **the upload**

**Lane D owns the 40%.**

Fun & engagement is the heaviest criterion on the rubric and, without this lane,
nobody owns it. B owns rendering the room; C owns the HUD, which is *craft* —
worth 20%. Neither of those answers the question the judges are actually asking:
*would you use this regularly, and would you tell your friends?* That question
needs an owner, and the person who is not deep in a component tree is the one who
can still hear it.

Three things make this a build lane, not a documentation lane:

**1. The demo story is written first, and it is the spec.**
Not a write-up of whatever got built by 22:00 — a 90-second story written at
13:00 that tells A, B and C what must exist. If the story is "watch the score
land on 74 and the room react," then the score reveal is a requirement, not a
nice-to-have. A demo script written at 19:00 can only document; one written at
13:00 directs. Hand it to the other three lanes before they open an editor.

**2. Every word on screen.**
Button labels, the empty state, the score's one-line explanation, the status
pills, the login prompt. Nobody else will do this well — developers write
placeholder copy and ship it. Bad microcopy is the single most reliable tell of
an unfinished hackathon app, and fixing it costs nothing but attention.

**3. The score reveal.**
The five seconds where the number lands is the moment the demo lives or dies, and
it is the one piece of the app aimed squarely at the 40%. D designs it and pairs
with C to build it.

**Blocked by:** nobody. Everything before 22:00 can start at hour zero.

| Window | Work | Output |
|---|---|---|
| **13:00–14:00** | **Write the 90-second demo story.** Before any code. What does the judge see, in order, and what is the one line they repeat afterwards? Hand to A/B/C — it is their spec. | `docs/demo-script.md` |
| 14:00–15:00 | **All on-screen copy.** Every label, empty state, and the plain-English sentence that explains the score. Hand to C. | `docs/copy.md` |
| 15:00–16:00 | **The numbers.** Real Singapore figures — HDB consumption, the S$0.2994 tariff, Ecovolt's "up to 20%" schools result — sourced inline, then written as the mock dataset. Demo apartment lands 72–78 (§11). Hand to A. | `data/mockApartment.ts` |
| 16:00–17:30 | **The rationale.** Audience · behaviour · mechanic · measurement (§12). Required deliverable, graded. | `docs/rationale.md` |
| 17:30–19:00 | **Design the score reveal** and pair with C to build it. The five seconds that carry the heaviest criterion. | in the app |
| 19:00–20:00 | **Shoot problem B-roll** — bill, standby light, plug wall. Singapore sunset is ~19:10; this is the last usable light. | footage |
| 20:00–21:00 | **Record the problem-segment voiceover.** Needs no app footage. Quiet room, phone mic close. You will not get a second pass at this. | audio |
| 21:00–22:00 | **Cold user test.** Use the app having not built it; narrate every hesitation. You are the only unbiased tester on the team. Findings to C while there is still time to act. | `docs/qa.md` |
| **22:00** | 🚩 **Safety take.** Film whatever exists, however rough. | footage |
| 00:00–01:00 | Film the real demo against the deployed URL | footage |
| 07:00–09:00 | Edit, captions, audio check | video |
| 10:00 | **Submit.** Screenshot the confirmation. | ✅ |

**The 22:00 safety take is the most important row in this table.** It converts
every hour after it from risk into upside — the same logic that makes the running
order in `plan-29aug.md` work: *"bank the easy win first, so everything after it
is upside, not risk."* A rough demo of a working app beats a polished demo of
nothing, and teams learn this at 10:40 or never.

> **Lane D is the hardest lane to do well, not the lightest.** A, B and C each
> own a component tree with a clear finish line. D owns a question — *is this
> worth telling someone about?* — that has no obvious done state, carries the
> largest single share of the rubric, and cannot be recovered by the other three
> at 09:00. Give it to whoever argues best, not whoever codes least.

### 15.5 Handoff schedule

Every dependency between lanes, with a time. If a handoff slips, the receiving
lane says so at the next checkpoint rather than waiting quietly.

| Time | From | To | What | If it slips |
|---|---|---|---|---|
| 14:00 | A | all | Working repo on `main` | **Everything stops.** All hands to A. |
| 14:00 | B ↔ C | — | `.pixelated` class name agreed | Two conflicting classes in `globals.css` |
| 15:00 | A | B, C | The two interfaces (§10) | C keeps using its stub; costs a small refactor |
| 16:00 | D | A | `data/mockApartment.ts` | A hardcodes placeholders, swaps later |
| 16:00 | D | C | `docs/copy.md` | C ships placeholder copy — visible to judges |
| 17:30 | C | integration | HUD components | Integration 1 slips to 19:00 |
| 18:00 | B | C, D | A room that renders | **D cannot film. Protect this one.** |
| 22:00 | A | D | Deployed URL | D films localhost and says so |

### 15.6 Assigning people

Write names against lanes before anyone writes code.

Based on what has already been done: **Ayushman** has the deepest context on the
assets and wrote the original plan — Lane B, or Lane A if he would rather own the
foundation. **Josh** set up the repo and tooling — Lane A. The other two take C
and D.

**Choosing who takes D:** give it to whoever argues best, not whoever codes least.
It owns the largest share of the rubric and the submission itself.

**Whoever takes D must not also sit on the app's critical path** — they will be
filming and editing while the other three are still committing.

**If you are only three people:** drop Lane C. B takes the room *and* the visual
system; D keeps the copy and the score reveal. Do not drop D — you would lose two
required deliverables and 40% of the rubric.

### 15.7 The shared contract — agree before coding

1. The exact shape of `ApartmentEnergyData` and `ApartmentScoreResult` (§10)
2. The `spriteMap.ts` coordinate format (§9)
3. The name of the pixelated-rendering utility class (so B and C don't both add one)

Once those three are agreed, all four lanes run in parallel.

**Integration point:** `app/apartment/page.tsx`. Keep it tiny. Pair on it for
fifteen minutes rather than having two people iterate on it alone.

**Merge-conflict hotspots:** `app/apartment/page.tsx`, `globals.css`,
`package.json`. Coordinate before adding any dependency.

---

## 16. Timeline

Working deadline: **Sunday 30 August, 11:00**. ⚠️ See §21 decision 3 — the brief
header says the event was 22–23 August, which needs resolving.

| Time | What | Who |
|---|---|---|
| **13:00–14:00** | Agree the contract (§15). Assign lanes. Scaffold pushed. **D writes the demo story — it is the spec.** | All |
| **14:00** | 🚩 D hands the demo story to A/B/C. Nobody opens an editor before this. | D → all |
| 14:00–16:00 | Parallel build. B does the sheet overlay first. D writes the on-screen copy, then the numbers. | All |
| **16:00** | D hands `mockApartment.ts` to A and `docs/copy.md` to C | D → A, C |
| 16:00–17:30 | Build continues. D writes the rationale. | All |
| 17:30–19:00 | **Integration 1** — room and HUD together, ugly is fine. **C + D build the score reveal.** | A + B + C + D |
| 19:00–21:00 | Build continues. D shoots B-roll while there is light, then records voiceover. | All |
| 21:00–22:00 | D user-tests the app cold and hands findings to C | D |
| **22:00** | 🚩 **Feature freeze** — nothing new after this. **D films the safety take.** | All |
| 22:00–00:00 | Polish, responsive pass, deploy to Vercel | A + C |
| 00:00–01:00 | D films the real demo against the deployed URL | D |
| — | Sleep. Seriously. | |
| 07:00–09:00 | QA checklist end-to-end. D edits, captions, audio check. | All |
| **09:00** | 🚩 **Cut-line** — anything broken gets cut from the demo, not fixed | All |
| 09:00–10:00 | Final production build, deploy, verify the live URL | A |
| 10:00–10:30 | **Submit.** Screenshot the confirmation. | D |
| 10:30–11:00 | Buffer | |

**The two flags are the whole point of this table.** Feature freeze at 22:00 and
the 09:00 cut-line are what stop a good demo becoming a broken one at 10:55.

### What gets cut, in order

If time runs short, drop in this order — the earlier items cost the fewest marks:

1. Character sprite in the room (decorative)
2. Responsive/mobile layout (demo on a laptop)
3. Unit tests (keep the scoring function correct by inspection)
4. Multiple mock profiles (one apartment is enough)
5. Vercel deploy (demo from `localhost` — say so, it costs almost nothing)

**Never cut:** the video, the rationale, or a working login → apartment flow.

---

## 17. Task breakdown

| # | Objective | Files | Depends on | Done when | Lane |
|---|---|---|---|---|---|
| 1 | Scaffold + Tailwind | `package.json`, `app/layout.tsx` | — | `npm run dev` serves a blank page; `build` clean | A |
| 2 | Data model types | `lib/scoring.ts` | 1 | Both interfaces exist, agreed with B and C | A |
| 3 | Scoring logic | `lib/scoring.ts` | 2 | Pure `computeScore(data)` per §11 | A |
| 4 | Session helpers | `lib/session.ts` | 1 | `set/get/clearSession`, typed, try/caught | A |
| 5 | Login screen | `components/LoginForm.tsx`, `app/page.tsx` | 4 | Submits, writes session, navigates | A |
| 6 | Copy assets | `public/assets/**` | — | Structure preserved | B |
| 7 | **Indexed sheet overlay** | throwaway script | 6 | Screenshot of both sheets with row/col numbers | B |
| 8 | Sprite map | `data/spriteMap.ts` | 7 | Floor, wall, 5–7 furniture coords from the 32×32 sheets | B |
| 9 | Render the room | `components/ApartmentRoom.tsx` | 8 | CSS grid, `background-position` crops, zero blur | B |
| 10 | HUD components | `StatCard.tsx`, `ScoreBadge.tsx` | 2 (stub ok) | Reads as a game HUD, not a business dashboard | C |
| 11 | Assemble dashboard | `EnergyDashboard.tsx` | 10 | Composes from the two typed props | C |
| 12 | Visual system | `globals.css`, Tailwind theme | — | Palette, type scale, `.pixelated` agreed with B | C |
| **0** | 🚩 **Demo story — the spec** | `docs/demo-script.md` | — | 90 seconds, beat by beat. **Blocks tasks 1–12.** Handed to A/B/C by 14:00 | D |
| 13a | **On-screen copy** | `docs/copy.md` | 0 | Every label, empty state, and the score's plain-English line. Handed to C | D |
| 13b | **The numbers** | `data/mockApartment.ts` | 0 | Sourced inline, demo lands 72–78 (§11), handed to A | D |
| 13c | **Rationale doc** | `docs/rationale.md` | 13b | Audience · behaviour · mechanic · measurement (§12) | D |
| 13d | **Score reveal** | `ScoreBadge.tsx` | 10, 13a | The five seconds carrying the 40%. Designed by D, built with C | D + C |
| 14a | **Problem B-roll** | footage | — | Bill, standby light, plug wall. Before ~19:10 sunset. | D |
| 14b | **Problem-segment VO** | audio | 0 | Recorded before app footage exists | D |
| 15a | QA checklist | `docs/qa.md` | 0 | Every flow in §7 as a checkbox | D |
| 15b | **Cold user test** | `docs/qa.md` | 16 | D uses the app having not built it; findings to C | D |
| 15c | 🚩 **Safety take** | footage | 16 | Whatever exists at 22:00, filmed. Non-negotiable. | D |
| 16 | Integration shell | `app/apartment/page.tsx` | 5, 9, 11 | Session guard, room + HUD, room number visible | A+B+C paired |
| 17 | Logout | small button | 16 | Clears session, returns to `/` | any |
| 18 | Polish pass | `components/*` | 16 | Coherent at laptop width, no breakage | C |
| 19 | Deploy | Vercel | 16 | Public URL loads | A |
| 20 | **Film + edit** | video | 19 | 2–3 min, end-to-end, audible | D |
| 21 | **Submit** | — | 20 | Uploaded, confirmation screenshotted | D |

---

## 18. Git workflow

- `main` stays deployable
- One branch per lane: `feat/foundation`, `feat/room`, `feat/hud`, `feat/docs`
- Small commits, PR into `main`, no force-push to `main`
- Pull before you start and before you push — four people, twenty hours

---

## 19. Risks

| Risk | Likelihood | Mitigation |
|---|---|---|
| Sprite map eats the afternoon | **High** | Indexed overlay first (§9.6). Timebox to 90 min, then use fewer furniture pieces. |
| Blurry pixel art | Medium | 32×32 tier natively, integer scale, no `<Image>` |
| Nobody films anything | **High** | Lane D owns it; safety take at 19:00 before the app is finished |
| Merge conflicts in the shell | Medium | Pair on `app/apartment/page.tsx`; nobody edits it solo |
| Hydration mismatch flicker | Medium | No `Math.random()` in render; `localStorage` in `useEffect` only |
| Scope creep into §5 | Medium | The out-of-scope list is binding. Point at it. |
| Deadline is wrong (§21.3) | Unknown | Resolve today |

---

## 20. Definition of done

- [ ] `npm run build` clean, no type errors
- [ ] Login accepts a room number and navigates
- [ ] Apartment renders the pixel room with no blur at 100% zoom
- [ ] HUD shows consumption, score, comparison, cost, rank
- [ ] Room number visible; logout returns to login
- [ ] Refresh on `/apartment` stays logged in
- [ ] LimeZu credited in the UI
- [ ] Demo video under 3:00, audible on laptop speakers
- [ ] `docs/rationale.md` answers all four questions
- [ ] Submitted, confirmation screenshotted, posted to the group chat

---

## 21. Open decisions

1. **Hover-to-inspect appliances?** One tooltip component, no new state. Materially
   serves the 40% criterion; a fully static room is thin against "would you use it
   regularly." **Recommend: yes, if the room lands by 18:00.** — *decide by 18:00*
2. **Repo public or private?** The LimeZu sheets are committed. Confirm the free
   licence permits redistribution, or go private before judging. — *decide today*
3. **⚠️ What is the actual deadline?** The brief header reads *22–23 August 2026*,
   which has passed. We are working to Sunday 30 August, 11:00 on Josh's word.
   Somebody confirm against the submission portal. — *decide today, before anything else*
4. **Who is Lane D?** Must not be on the app's critical path. — *decide at 13:00*
