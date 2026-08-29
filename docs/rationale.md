# WattWise — rationale

**LifeHack 2026 · Ecovolt track: "Small Green Habits"**

> ⚠️ DRAFT. Two things need a human before submission: every figure marked
> `[SOURCE?]` needs a citation or deletion, and §5 needs an honest read from the
> team. Do not submit with an unsourced number in it — the brief rewards a
> credible case, and one invented figure discredits the rest.

---

## 1. Target audience

Residents of high-density housing in Singapore — HDB blocks and condominiums,
where hundreds of households share a building and nobody has any idea how their
consumption compares to the flat next door.

We chose this audience because the social layer already exists. These people
share a lift, a void deck and a management committee. A leaderboard between
apartments is not an artificial construct; it maps onto a community that is
already there.

## 2. The specific behaviour

**Raising the air-conditioner setpoint to 25°C.**

Not "using less energy" in general. One setting, on one appliance.

We chose it because in a Singapore household it is the single highest-leverage
change available: cooling dominates the bill, and the adjustment is free,
instant, reversible, and requires buying nothing. `[SOURCE? — need a citation
for cooling as the dominant share of an HDB electricity bill]`

Every degree below 25°C adds roughly 8% to cooling cost. `[SOURCE? — NEA or
equivalent]`

This matters for the brief's hard constraint that a submission must "target one
concrete sustainable behaviour." Ours is a setpoint.

## 3. The behaviour-change mechanic

Three mechanics stacked, in the order a resident meets them.

**a. Name the culprit.** Most energy feedback tells you a total. A total is not
actionable — you cannot do anything differently tomorrow because you used 403
kWh. WattWise opens by naming the single worst appliance and the single change
that fixes it:

> ❄️ Your air conditioner is the biggest drag — 180 kWh against a typical 118.
> Every degree below 25°C adds roughly 8% to your cooling bill.

**b. Make consumption spatial.** The apartment is the interface, not a chart.
Appliances glow on a heatmap by draw, so the aircon is visibly the hottest thing
in the flat. The insight arrives as a picture of your own home before it arrives
as a number. This is the part that answers "would you look at it twice."

**c. Make it social.** The Eco League ranks all 49 apartments in the building.
The headline is never the rank alone — it is the gap:

> Just 3 points behind Room 06-11.

Social comparison against a *specific, closeable* gap outperforms both absolute
feedback and comparison against a faceless average. `[SOURCE? — this is the
Opower / normative-feedback literature; cite it or soften the claim]`

**Why not a dashboard.** Ecovolt's own framing is that dashboards, statistics
and stern reminders are ignored, and that sustainability has a behaviour problem
rather than a data problem. We took that literally: there is no line chart in
WattWise. The room is the display.

## 4. How we would measure whether it works

| | |
|---|---|
| **Metric** | Monthly kWh per apartment, and the derived 0–100 score |
| **Baseline** | Each apartment's own prior 3 months, plus the complex-wide reference |
| **Target** | Participating apartments improve **+10 score points** (≈10% consumption reduction) over 8 weeks |
| **Method** | Meter reads pre- and post-rollout, against non-participating apartments in the same complex as a control |
| **Guard** | Weather-normalise. A cool month would otherwise read as behaviour change |

**Leading indicators**, if the 8-week metric is too slow to steer by: proportion
of residents who open the app in a given week, and proportion whose worst-named
appliance changes between months — the latter being direct evidence the named
culprit was acted on.

## 5. What we are not claiming

This section exists because the rubric asks whether we could tell **with
evidence** that it worked, and overclaiming is the fastest way to fail that test.

- **Our data is simulated.** The brief explicitly permits this. No smart plug or
  meter is connected; consumption figures are authored, internally consistent,
  and deterministic. Nothing in the demo is a live reading.
- **We have not run a trial.** The +10 points over 8 weeks is a target we would
  test, not a result we obtained.
- **We measure total consumption, not the setpoint itself.** We name the aircon
  and prompt the 25°C change, but a real deployment would need either a smart
  thermostat or self-reporting to confirm the setpoint actually moved. As built,
  a resident could improve their score by any means and we would credit it.
- **The leaderboard is one building of seeded neighbours**, not real households.

## 5b. Why this cannot simply be gamed

The obvious attack on a self-reported energy app is to claim savings you never
made. It is the first question a sceptical reader should ask, so:

**Nothing you click earns you standing.** The league ranks on *measured*
consumption only. Applying every recommendation in the app moves your projected
score — the dashboard will show 84 instead of 74 — and leaves your league
position exactly where it was. The board says so plainly: "Plan would reach 84 ·
rank updates when metered."

**The plan is a planning tool, not a scoreboard.** Its job is to answer "what is
this worth?" before you commit, in the same way a mortgage calculator does not
give you a house.

**In deployment the measurement is not self-reported at all.** Ecovolt's product
is smart plugs; consumption comes off the meter. A resident cannot type their
way to a lower bill because the number is read, not claimed. This prototype has
no meter, so it simulates that reading — which is exactly why the app keeps the
measured figure and the previewed figure apart rather than letting one quietly
become the other.

**What remains gameable, honestly.** Rewards in this build unlock on applying a
plan, not on achieving it, because a two-day prototype cannot wait a month to
verify anything. In a real deployment the voucher would settle against the next
meter read, and an unmet plan would simply not pay out. That is a product
decision we would make, not one we have implemented.

## 6. Honest read on stickiness

The weakest part of the current build. The leaderboard and the weekly delta give
a reason to return, but we have not built streaks, a seven-day challenge, or any
commitment device — the mechanics that carry a habit past the novelty window.

If we had another day, that is where it would go: a seven-day aircon challenge
with a streak counter, because the guiding question in the brief is explicit that
most habit apps are abandoned within a week.

---

## Appendix — the numbers on screen

All figures are simulated and internally consistent. The five appliances sum
exactly to the apartment total; a test enforces it.

| | kWh/month | Typical | Score |
|---|---|---|---|
| Air conditioner | 180 | 118 | 47 |
| Refrigerator | 95 | 98 | 100 |
| Washing machine | 58 | 46 | 74 |
| Television | 40 | 33 | 79 |
| Lighting | 30 | 25 | 80 |
| **Apartment** | **403** | **320** | **74** |

Tariff: S$0.2994/kWh, the Singapore regulated rate. Estimated monthly cost:
S$120.66.
