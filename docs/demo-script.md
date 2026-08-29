# WattLah! — demo script

**Target: 2 min 40 s.** The brief asks for 2–3 minutes, end to end, "ideally
with someone actually using it."

Every interaction below is real in the current build. Nothing is mocked for the
video. Labels are quoted exactly as they appear on screen.

---

## Pre-flight

- [ ] `npm run dev`, open **http://localhost:3000**
- [ ] **Clear site data** for localhost. Without it you skip the handle prompt
      *and* the score starts from a saved value instead of counting up — you
      lose the best beat in the demo.
- [ ] Browser at **~1440×900**, zoom 100%. Narrower and the apartment scales down.
- [ ] Close devtools, hide the bookmarks bar.
- [ ] Decide about music: the **♪ button, bottom right** loops a track. For a
      voiceover take, leave it **off** and add music in the edit so you control
      the mix.
- [ ] Do one full dry run. The score reveal only counts up on a fresh load.

**Do not open `/room-test` or `/interactive-apartment`.** Both are leftover dev
routes with no chrome.

---

## The beats

### 0:00 — The problem (15 s)
> "Everyone agrees they should use less electricity. Almost nobody changes what
> they actually do. Bills arrive weeks late, and a number on a statement has
> never once made someone turn the aircon up."

No screen yet, or B-roll of a bill.

### 0:15 — Sign in (10 s)
Room **04-12**, any password. **Enter Home**.

*Let the mascot glance around for a beat before clicking — he's the first thing
that says "this is a game, not a form".*

### 0:25 — Pick a handle (8 s)
Type **VoltViper**. Save.

> "Your block sees a handle, never your unit number."

A deliberate privacy choice, and worth saying out loud.

### 0:33 — The score lands (20 s)
The dashboard opens and the score **counts up to 74**.

> "This flat scores seventy-four. Twenty-six percent above a comparable unit —
> about a hundred and twenty dollars this month."

### 0:53 — The flat is the interface (35 s)
> "Instead of a chart, we show them their own home. And you can walk around it."

**Walk with WASD.** Move to a glowing socket and press **E** to scan a meter.
The mission bar above the room reads **"Map your biggest energy drains — 0/5"**
and ticks up.

> "Every glow is an appliance nobody has looked at yet."

### 1:28 — Name the fix (25 s)
Click **💡 Ways to save**. Read the top card aloud:

> "Set the aircon to twenty-five degrees. Thirty-four kilowatt-hours a month.
> Costs nothing."

### 1:53 — Watch it move (30 s)
Click **Preview this action**.

The **score climbs 74 → 80**, the header shows **"+6 · 1 applied — reset"**, and
the **🎟️ voucher unlocks**.

> "Apply it and you see exactly what it's worth. That's the loop — see the
> problem, see the value, watch it change."

Click the **🎟️ voucher** badge to open the reward.

### 2:23 — Make it social (20 s)
Click the **rank chip** in the header.

> "And because a block is a community, it's a league."

Point at **"Resets in 19:20:08"**.

> "It resets at midnight. That's what brings people back tomorrow."

### 2:43 — Close (10 s)
> "Invisible utility data, turned into something you can see, act on, and
> compete over."

---

## If something breaks

| Symptom | Do this |
|---|---|
| Score doesn't count up | Clear site data and reload |
| Blank page after login | Reload once; the session guard resolves after hydration |
| Voucher badge does nothing | It reads **🔒 Save first** until you apply a recommendation |
| Page won't scroll | Should be fixed; if it recurs, move the cursor off the game canvas |
| Server hangs / pins the CPU | `pkill -f next-server`, `rm -rf .next`, `npm run dev` |

---

## Do not claim on camera

`docs/rationale.md` still marks four figures `[SOURCE?]`. Until those are cited:

- **Don't** attribute the 8%-per-degree figure to NEA
- **Don't** present the data as measured — say **simulated** if asked
- **Don't** quote the +10 points over 8 weeks as a result. It's a target

"Our data is simulated, the brief allows it, and here's how we'd measure it for
real" is a stronger answer than being caught overstating.
