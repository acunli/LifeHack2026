# WattLah — pitch deck handover

**For: Claude Design. Purpose: build the LifeHack 2026 pitch deck.**

This is a briefing document, not a script. Everything below is either lifted
from the working build or from `docs/rationale.md`. Where a claim is unsourced
it is marked — see §7, which is binding.

---

## 1. What we are pitching

**WattLah** — a gamified home energy audit. A resident logs into a top-down
pixel-art version of their own apartment, walks around it, scans appliance
meters, sees which appliance is bleeding money, previews what one specific
change is worth, and compares against the rest of the building.

One line for the title slide:

> Invisible utility data, turned into something you can see, act on, and
> compete over.

**Event:** LifeHack 2026 · Ecovolt track, "Small Green Habits".
**Name:** *WattLah* is canonical (260 uses in the repo vs 17 stale "WattWise").
Do not use WattWise anywhere in the deck.

---

## 2. The judging rubric — build the deck against this

These weights are from the Ecovolt slide deck. **This should drive slide count
and ordering more than narrative taste does.**

| Criterion | Weight | What it asks |
|---|---|---|
| **Fun and engagement** | **40%** | Would you use it regularly? Would you tell friends? |
| Behaviour change | 20% | A real behaviour, and a believable path to it |
| Stickiness | 20% | Survives the novelty. Streaks, social hooks |
| Craft and usability | 20% | Usable end to end, polished, clear |

Measurability is a hard constraint in the written brief even though it dropped
off the weighted list. It must be covered.

**Implication for design:** fun is 40% and the pixel apartment is our entire
answer to it. The deck should *look like the product* — screenshots big, chrome
minimal, the room on screen early and often. A deck full of bullet points
arguing that our product is fun will lose to a deck that shows it.

**Known weak axis — stickiness.** We have the league and a daily reset, but no
streaks and no commitment device. Don't oversell it; §6 handles this honestly.

---

## 3. The argument, in order

This is the spine. Each numbered item is roughly one slide.

**1 · Title.** WattLah. Gamified home energy audit. Team name, LifeHack 2026,
Ecovolt track.

**2 · The problem, in Ecovolt's own words.** Sustainability does not have a
data problem; it has a behaviour problem. Their deck lists what has already
failed: *Dashboards — ignored. Statistics — ignored. Stern reminders — ignored.*
Quoting their framing back at them is deliberate and should be visually
prominent — three struck-through words is a strong slide.

**3 · So we deleted the dashboard.** There is no line chart in WattLah. The
resident's own flat is the interface, and consumption is something you walk
through rather than read. This is the thesis slide. It should be a full-bleed
screenshot of the apartment with almost no text on it.

**4 · The one behaviour: set the aircon to 25°C.** Not "use less energy". One
setting, on one appliance. Free, instant, reversible, requires buying nothing.
The brief's hard constraint #2 asks for one concrete behaviour — ours is a
setpoint. Cooling dominates a Singapore household bill, and every degree below
25°C adds roughly 8% to cooling cost. **[SOURCE? — see §7 before using either
figure]**

**5 · The journey.** Six steps, ideally as a horizontal strip of six small
screenshots rather than text:

```
room login → choose public handle → scan 5 meters → inspect appliances
           → build a savings plan → preview score and league rank
```

Privacy note worth a line: your block sees a handle, never your unit number.

**6 · Mechanic A — name the culprit.** Most energy feedback gives you a total.
A total is not actionable; you cannot do anything differently tomorrow because
you used 403 kWh. WattLah opens by naming the single worst appliance and the
single change that fixes it:

> ❄️ Your air conditioner is the biggest drag — 180 kWh against a typical 118.

**7 · Mechanic B — make it spatial.** Appliances glow on a heatmap by draw, so
the aircon is visibly the hottest thing in the flat. The insight arrives as a
picture of your own home before it arrives as a number.

**8 · Mechanic C — make it social.** The Eco League ranks all 49 apartments in
the building. The headline is never the rank alone, it is the *gap*:

> Just 3 points behind Room 06-11.

A specific, closeable gap beats both absolute feedback and comparison against a
faceless average. Show the "Resets in 19:20:08" timer — that is the return hook.

**9 · WattLahMan.** Our AI helper and the most demo-able thing we built. You
summon a pixel mascot; he walks across the flat, switches off the appliance
with the biggest wasteful draw, and says why in Singlish. Two design decisions
worth one line each on the slide, because they show engineering judgment:

- He is powered by **Kimi K3**, but the AI is *not load-bearing* — every
  failure path falls back to a local heuristic, so he always works.
- He **stops at the best achievable score**, not at an empty flat. The goal is
  the fewest sensible changes, not maximum deprivation.

**10 · The numbers.** The appliance table in §5. Score 74. S$120.66/month.
Apply the aircon fix and the score climbs 74 → 80 live on screen.

**11 · Why it can't be gamed.** The obvious attack on a self-reported energy
app is claiming savings you never made, and it is the first question a
sceptical judge will ask. **Nothing you click earns you standing.** The league
ranks on measured consumption only. Applying every recommendation moves your
*projected* score to 84 and leaves your league position exactly where it was.
The board says so in plain text: "Plan would reach 84 · rank updates when
metered." The plan is a planning tool, not a scoreboard — a mortgage calculator
does not give you a house.

**12 · How we'd know it worked.**

| | |
|---|---|
| **Metric** | Monthly kWh per apartment, and the derived 0–100 score |
| **Baseline** | Each apartment's own prior 3 months, plus the complex-wide reference |
| **Target** | +10 score points (≈10% reduction) over 8 weeks |
| **Method** | Meter reads pre/post, against non-participating apartments as control |
| **Guard** | Weather-normalise — a cool month would otherwise read as behaviour change |

Leading indicators if 8 weeks is too slow to steer by: weekly open rate, and
the proportion of residents whose worst-named appliance *changes* between
months — direct evidence the named culprit was acted on.

**13 · What we're not claiming.** Do not cut this slide. It reads as
confidence, not weakness, and it inoculates against the questions that would
otherwise land in Q&A. Four bullets: our data is simulated (the brief expressly
permits it); we have not run a trial, +10 points is a target not a result; we
measure total consumption, not the setpoint itself; the leaderboard is one
building of seeded neighbours.

**14 · Close.** Return to the one-liner from §1. Optionally the stack in small
type: Next.js 16, React 19, TypeScript, Tailwind 4, Phaser 3, Vitest,
Playwright. No backend, no sensor required.

**If the deck has to be shorter:** merge 6–8 into one "three mechanics" slide
and drop 14. Never drop 4, 11, 12 or 13 — those are the rubric's hard
constraints and the credibility of the whole thing.

---

## 4. Brand and visual direction

The product is a **dark, warm, pixel-art game**, not a green corporate
sustainability brand. Do not put it on a white deck with a leaf logo.

Palette, taken from `app/globals.css`:

| Token | Hex | Use |
|---|---|---|
| `--bg` | `#16261d` | Deep forest green — primary slide ground |
| `--bg-deep` | `#0d1813` | Near-black green — full-bleed / title slides |
| `--panel` | `#223a2c` | Card and panel fill |
| `--panel-hi` | `#2f5240` | Raised panel |
| `--line` | `#3f6b4e` | Borders, dividers |
| `--line-hi` | `#5fa072` | Emphasised border |
| `--ink` | `#f3f2e6` | Warm off-white — body text |
| `--ink-dim` | `#a3c4ac` | Muted sage — secondary text |
| `--amber` | `#ffe066` | **The accent.** Scores, highlights, CTAs |
| `--amber-deep` | `#e6b800` | Accent shadow / pressed state |
| `--green` | `#9be564` | Positive delta (+6, savings) |
| `--red` | `#ff7a6b` | Negative delta (overconsumption) |

**Type.** The app uses **Press Start 2P** everywhere. On slides that is a trap —
it is unreadable in paragraphs. Use it for **headlines, big numbers, and the
score only**, and set body copy in a clean sans (Inter or system UI) at a
comfortable size. The pixel font should feel like a deliberate accent that ties
back to the product, not the whole deck.

**Other cues:** hard-edged panels with a 2–3px border and an offset shadow (the
`pixel-panel` look), no soft gradients, no rounded corners, no drop shadows
with blur. Keep image rendering crisp — never let a sprite get resampled soft.

---

## 5. The numbers — use these exactly

All simulated, internally consistent, and enforced by a test: the five
appliances sum exactly to the apartment total.

| | kWh/month | Typical | Score |
|---|---|---|---|
| Air conditioner | 180 | 118 | 47 |
| Refrigerator | 95 | 98 | 100 |
| Washing machine | 58 | 46 | 74 |
| Television | 40 | 33 | 79 |
| Lighting | 30 | 25 | 80 |
| **Apartment** | **403** | **320** | **74** |

- Tariff: **S$0.2994/kWh** (Singapore regulated rate) → **S$120.66/month**
- Scoring contract: reference usage scores 100; each percentage point above
  the reference removes one point. Every surface uses `lib/scoring.ts`.
- Demo beat: applying the aircon recommendation moves **74 → 80** (+6, 34 kWh)
- Full plan applied: projected **84** — always labelled *projected*, never
  presented as measured
- Building: **49 apartments** in the league

---

## 6. Tone

Confident and specific; never preachy. WattLah does not lecture anyone about
the planet — it shows a number, names one fix, and makes it a competition. The
copy in the product is playful and a bit Singaporean (WattLahMan says "lah").
The deck can carry a little of that, but the argument slides (11–13) should be
sober and precise. The contrast is the point: fun product, serious case.

---

## 7. Binding constraints — read before writing any slide

**Four figures in `docs/rationale.md` are still marked `[SOURCE?]` and have not
been verified.** Until someone cites them:

- **Do not** attribute the "8% per degree" figure to NEA or any named body.
  Either cite it properly or soften to "roughly" with no source implied.
- **Do not** state cooling's share of an HDB bill as fact without a citation.
- **Do not** present any consumption figure as measured. It is **simulated**,
  and the brief expressly permits that — say so plainly rather than blurring it.
- **Do not** present "+10 points over 8 weeks" as a result. It is a target.

One invented figure discredits every other number on the slide. "Our data is
simulated, the brief allows it, and here's how we'd measure it for real" is a
stronger position than being caught overstating.

Also: **no live deployment URL exists yet.** Leave the link off, or leave a
placeholder the team fills in — do not invent one.

---

## 8. Assets

- `~/Desktop/wattlah-cover.png` and `wattlah-cover.jpg` — cover art, use for
  the title slide
- `components/WattLahLogo.tsx` — the in-app logo mark
- **Screenshots still need capturing.** Run `npm run dev` and shoot at
  ~1440×900, zoom 100%, devtools closed. Priority shots: the apartment at
  `/home` with the HUD, the appliance heatmap, the "Ways to save" panel, the
  score mid-count, the leaderboard with the reset timer, and WattLahMan
  mid-walk with a speech bubble. `docs/demo-script.md` has the exact click
  path and pre-flight checklist for each of these.

---

## 9. Related docs

| File | What's in it |
|---|---|
| `docs/rationale.md` | The full written case — audience, behaviour, mechanics, measurement. Source for slides 4, 6–8, 11–13 |
| `docs/demo-script.md` | The 2m40s demo video script, beat by beat with timings |
| `rulebook.md` | Submission write-up — inspiration, challenges, what we learned |
| `README.md` | Product state, routes, scoring contract, the original brief and rubric |
