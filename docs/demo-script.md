# WattLah! — demo script

**Target: 2 min 35 s.** The brief asks for 2–3 minutes, end to end, "ideally
with someone actually using it."

Everything below is a real interaction in the current build. Nothing is mocked
for the video.

---

## Pre-flight (do this before recording)

- [ ] `npm run dev`, open **http://localhost:3000**
- [ ] **Clear site data** for localhost — otherwise you skip the handle prompt
      and the score reveal starts from an already-saved value
- [ ] Browser at **~1440×900**, zoomed to 100%. Below 820px wide the room
      scales down and the demo looks cramped
- [ ] Close devtools. Hide bookmarks bar
- [ ] Do a full dry run once — the score reveal only counts up on first load

**Do not navigate to `/room-test`.** It is a bare dev route with no chrome.

---

## The beats

### 0:00 — The problem (15 s)
> "Everyone agrees they should use less electricity. Almost nobody changes what
> they actually do. Bills arrive weeks late, and a number on a statement has
> never once made someone turn the aircon up."

No screen yet, or B-roll of a bill.

### 0:15 — Login (10 s)
Type room **04-12**, any password. Hit **Enter Home**.

> "Residents sign in with their unit."

*The mascot is glancing around and the bolt is animating — let it breathe for a
beat before clicking.*

### 0:25 — Pick a handle (8 s)
Type a handle, e.g. **VoltViper**.

> "Your block sees a handle, never your unit number."

That is a deliberate privacy choice and worth saying out loud.

### 0:33 — The score lands (20 s)
The dashboard opens and the score **counts up to 74**.

> "This is the flat's energy score. Seventy-four — twenty-six percent above a
> comparable unit, about a hundred and twenty dollars this month."

*If it does not animate, hit **Replay reveal**.*

### 0:53 — The room is the dashboard (30 s)
> "Instead of a chart, we show them their own home."

Point at the **red glow** over the living area.

> "The hot spots are where the energy goes. The aircon is the problem, and you
> can see it before you read a single number."

**Click the aircon zone** — it selects and the panel updates.

### 1:23 — Name the fix (25 s)
Click **Ways to save**. The drawer opens.

> "We do not just say 'use less'. We name the single change worth the most."

Read the top one aloud:
> "Set the aircon to twenty-five degrees. Thirty-four kilowatt-hours a month.
> Costs nothing."

### 1:48 — Watch it move (25 s)
Click **Apply** on that recommendation.

> "Apply it, and you see what it is worth."

The **score climbs** and the **aircon glow cools**. Let both finish.

> "That is the loop. See the problem, see what fixing it is worth, watch it
> change."

### 2:13 — Make it social (20 s)
Click the **#N Rank** chip.

> "And because a block is a community, it is a league."

Point at the **countdown**.

> "It resets at midnight. That is the part that brings people back tomorrow."

### 2:33 — Close (10 s)
> "Invisible utility data, turned into something you can see, act on, and
> compete over."

---

## If something breaks

| Symptom | Do this |
|---|---|
| Score does not count up | Click **Replay reveal** |
| Handle prompt does not appear | Clear site data and reload |
| A glow sits over the wrong furniture | Do not point at that one; use the aircon, which is anchored to the living area |
| Page blank after login | Reload once — the session guard resolves after hydration |

---

## Do not claim on camera

The rationale marks several figures `[SOURCE?]`. Until they are sourced:

- **Do not** say the 8%-per-degree figure is from NEA
- **Do not** present the data as measured — say **simulated** if asked
- **Do not** claim the +10 points over 8 weeks as a result. It is a target

Saying "our data is simulated, the brief allows it, and here is how we would
measure it for real" is stronger than being caught overstating.
