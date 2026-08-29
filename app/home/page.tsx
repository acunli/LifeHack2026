'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from '@/lib/useSession'
import { logout } from '@/lib/session'
import UsernameSetup from '@/components/UsernameSetup'

/**
 * The standalone appliance dashboard, taken verbatim from the
 * watt-lah-dashboard zip. Self-contained: one React import, its own inline
 * <style>, and it already uses our token names.
 *
 * Only the session guard and the back link were added.
 */

const REFERENCE = 320
const TARIFF = 0.2994

type Appliance = {
  id: string
  name: string
  icon: string
  kwh: number
  ref: number
  x: number
  y: number
  r: number
  tip: string
}

const APPLIANCES: Appliance[] = [
  {
    id: 'aircon',
    name: 'Air Conditioner',
    icon: '❄️',
    kwh: 180,
    ref: 118,
    x: 23,
    y: 17,
    r: 15,
    tip: 'Every degree below 25°C adds roughly 8% to your cooling bill.',
  },
  {
    id: 'fridge',
    name: 'Refrigerator',
    icon: '🧊',
    kwh: 95,
    ref: 98,
    x: 55,
    y: 25,
    r: 10,
    tip: 'Running well. Keep the coils clear and the door shut.',
  },
  {
    id: 'washer',
    name: 'Washing Machine',
    icon: '🧺',
    kwh: 58,
    ref: 46,
    x: 64,
    y: 14,
    r: 9,
    tip: 'Cold washes use up to 80% less energy. Run full loads only.',
  },
  {
    id: 'tv',
    name: 'Television',
    icon: '📺',
    kwh: 40,
    ref: 33,
    x: 87,
    y: 11,
    r: 9,
    tip: 'Standby draw is real — a switched-off TV still sips power.',
  },
  {
    id: 'lights',
    name: 'Lighting',
    icon: '💡',
    kwh: 30,
    ref: 25,
    x: 52,
    y: 49,
    r: 11,
    tip: 'Swapping the last halogens for LED cuts lighting load by ~80%.',
  },
]

type Rec = {
  id: string
  for: string
  title: string
  save: number
  effort: string
  body: string
}

const RECS: Rec[] = [
  {
    id: 'ac-25',
    for: 'aircon',
    title: 'Set the aircon to 25°C',
    save: 34,
    effort: 'Free',
    body: 'You are running at 22°C. Every degree costs roughly 8% more. 25°C is the NEA-recommended setting and most people cannot feel the difference at night.',
  },
  {
    id: 'ac-timer',
    for: 'aircon',
    title: 'Use the 2-hour sleep timer',
    save: 22,
    effort: 'Free',
    body: 'The room stays cool long after the compressor stops. Cutting the last two hours of an eight-hour night removes about a quarter of the run time.',
  },
  {
    id: 'ac-clean',
    for: 'aircon',
    title: 'Wash the filters this month',
    save: 12,
    effort: '20 min',
    body: 'A clogged filter makes the unit work harder for the same cooling. Servicing is the single most-skipped maintenance job in HDB flats.',
  },
  {
    id: 'wash-cold',
    for: 'washer',
    title: 'Switch to cold washes',
    save: 11,
    effort: 'Free',
    body: 'Around 80% of a wash cycle’s energy goes into heating water. Modern detergents are formulated for 30°C and below.',
  },
  {
    id: 'wash-full',
    for: 'washer',
    title: 'Only run full loads',
    save: 6,
    effort: 'Free',
    body: 'A half load uses nearly the same energy as a full one. Two half loads a week is roughly a wasted cycle.',
  },
  {
    id: 'tv-standby',
    for: 'tv',
    title: 'Kill standby at the socket',
    save: 7,
    effort: 'Free',
    body: 'Your TV draws power whenever it is plugged in. A switched power strip removes it entirely.',
  },
  {
    id: 'led',
    for: 'lights',
    title: 'Swap remaining halogens',
    save: 9,
    effort: 'S$30',
    body: 'LEDs use about 80% less for the same brightness and last years longer. Pays for itself in roughly four months.',
  },
  {
    id: 'fridge-coils',
    for: 'fridge',
    title: 'Keep it running well',
    save: 0,
    effort: 'Free',
    body: 'Your fridge is already below the typical figure. Keep the coils clear and the door seals clean and it will stay there.',
  },
  {
    id: 'h-fan',
    for: 'home',
    title: 'Run a fan with the aircon',
    save: 18,
    effort: 'Free',
    body: 'Moving air makes 26°C feel like 24°C. A ceiling fan draws about 1% of what a compressor does.',
  },
  {
    id: 'h-peak',
    for: 'home',
    title: 'Shift heavy loads off-peak',
    save: 0,
    effort: 'Free',
    body: 'Washing and ironing after 11pm eases the block’s peak demand. It will not cut your kWh, but it lowers the building’s load — and counts toward your block’s league score.',
  },
  {
    id: 'h-curtain',
    for: 'home',
    title: 'Close curtains at midday',
    save: 14,
    effort: 'Free',
    body: 'West-facing flats gain serious heat through glass in the afternoon. Blocking it means the aircon starts from a cooler room.',
  },
]

const clamp = (n: number, a: number, b: number) => Math.min(b, Math.max(a, n))
const scoreOf = (t: number) =>
  clamp(Math.round(100 - ((t - REFERENCE) / REFERENCE) * 100), 0, 100)
const rankOf = (s: number) =>
  s >= 90 ? 'Energy Saver' : s >= 75 ? 'Good' : s >= 50 ? 'Average' : 'Needs Improvement'
const scoreColour = (s: number) =>
  s >= 90 ? 'var(--lime)' : s >= 50 ? 'var(--amber)' : 'var(--red)'
const applianceScore = (curKwh: number, ref: number) =>
  clamp(Math.round(100 - ((curKwh - ref) / ref) * 100), 0, 100)

function heat(load: number) {
  const t = clamp(load, 0, 1)
  if (t < 0.5) {
    const k = t / 0.5
    return `rgb(${Math.round(155 + k * 100)},${Math.round(229 - k * 29)},${Math.round(100 + k * 2)})`
  }
  const k = (t - 0.5) / 0.5
  return `rgb(255,${Math.round(200 - k * 90)},${Math.round(102 - k * 12)})`
}

const BASE_SCORE = scoreOf(APPLIANCES.reduce((x, a) => x + a.kwh, 0))

export default function HomePage() {
  const router = useRouter()
  const { session, needsUsername, isAuthenticated } = useSession()

  useEffect(() => {
    if (isAuthenticated === false) router.replace('/')
  }, [isAuthenticated, router])

  const [cur, setCur] = useState<Record<string, number>>(() =>
    Object.fromEntries(APPLIANCES.map((a) => [a.id, a.kwh])),
  )
  const [selected, setSelected] = useState<string | null>(null)
  const [whatIf, setWhatIf] = useState(false)
  const [applied, setApplied] = useState<Set<string>>(() => new Set())
  const [tab, setTab] = useState<'appliance' | 'home'>('appliance')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [displayScore, setDisplayScore] = useState(0)

  const shownRef = useRef(0)
  const rafRef = useRef<number | null>(null)

  const total = useMemo(
    () => APPLIANCES.reduce((s, a) => s + cur[a.id], 0),
    [cur],
  )
  const score = scoreOf(total)
  const rank = rankOf(score)
  const colour = scoreColour(score)
  const over = Math.round(((total - REFERENCE) / REFERENCE) * 100)
  const maxCur = Math.max(...APPLIANCES.map((a) => cur[a.id]))

  const animateTo = useCallback((target: number, from: number) => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    const diff = target - from
    const dur = 850
    const t0 = performance.now()
    shownRef.current = from
    setDisplayScore(from)
    const step = (now: number) => {
      const k = Math.min(1, (now - t0) / dur)
      const e = 1 - Math.pow(1 - k, 3)
      const v = Math.round(from + diff * e)
      shownRef.current = v
      setDisplayScore(v)
      if (k < 1) rafRef.current = requestAnimationFrame(step)
    }
    rafRef.current = requestAnimationFrame(step)
  }, [])

  // Reveal on load. Deferred into a frame callback rather than called
  // synchronously in the effect body, which would set state before the first
  // paint and cascade a render.
  useEffect(() => {
    const id = requestAnimationFrame(() => animateTo(score, 0))
    return () => {
      cancelAnimationFrame(id)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Esc closes drawer
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setDrawerOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  function select(id: string) {
    setSelected((prev) => (prev === id ? null : id))
  }

  function openDrawer(which?: 'appliance' | 'home') {
    if (which) setTab(which)
    setDrawerOpen(true)
  }

  function applyRec(rec: Rec) {
    const done = applied.has(rec.id)
    const nextApplied = new Set(applied)
    let newScore = score
    setCur((prev) => {
      const next = { ...prev }
      if (rec.for !== 'home' && rec.save > 0) {
        const base = APPLIANCES.find((a) => a.id === rec.for)!.kwh
        if (done) next[rec.for] = Math.min(base, prev[rec.for] + rec.save)
        else next[rec.for] = Math.max(0, prev[rec.for] - rec.save)
      }
      newScore = scoreOf(APPLIANCES.reduce((s, a) => s + next[a.id], 0))
      return next
    })
    if (done) nextApplied.delete(rec.id)
    else nextApplied.add(rec.id)
    setApplied(nextApplied)
    animateTo(newScore, shownRef.current)
  }

  function reset() {
    setCur(Object.fromEntries(APPLIANCES.map((a) => [a.id, a.kwh])))
    setApplied(new Set())
    animateTo(BASE_SCORE, shownRef.current)
  }

  const selectedAppliance = selected
    ? APPLIANCES.find((a) => a.id === selected) ?? null
    : null

  const drawerLabel =
    tab === 'appliance'
      ? selectedAppliance
        ? `${selectedAppliance.icon} ${selectedAppliance.name}`
        : 'No appliance selected'
      : 'Whole home'
  const drawerItems =
    tab === 'appliance'
      ? selectedAppliance
        ? RECS.filter((r) => r.for === selectedAppliance.id)
        : []
      : RECS.filter((r) => r.for === 'home')
  const potential = drawerItems
    .filter((r) => !applied.has(r.id))
    .reduce((s, r) => s + r.save, 0)

  const delta = displayScore > BASE_SCORE ? score - BASE_SCORE : 0

  // After every hook, and needsUsername first: useSession reports a null
  // session for a signed-in resident who has not picked a handle yet.
  if (needsUsername) return <UsernameSetup />
  if (!session) return null

  return (
    <div style={styles.page}>
      <style>{css}</style>
      <div className="wl-app">
        {/* Header */}
        <header className="wl-panel wl-header">
          <div className="wl-who">
            <div className="wl-sprite" aria-hidden="true" />
            <div>
              <div className="wl-eyebrow wl-px">Welcome home</div>
              <div className="wl-roomno wl-px">Room {session.roomNumber}</div>
            </div>
          </div>
          <div className="wl-controls">
            <button className="wl-btn" onClick={() => openDrawer(selected ? 'appliance' : 'home')}>
              💡 Ways to save
            </button>
            <button className="wl-ghost" onClick={() => animateTo(score, 0)}>
              Replay reveal
            </button>
            <button
              className={'wl-ghost' + (whatIf ? ' on' : '')}
              onClick={() => setWhatIf((v) => !v)}
            >
              {whatIf ? 'What-if: ON' : 'What-if mode'}
            </button>
            <button className="wl-ghost" onClick={() => router.push('/leaderboard')}>
              League
            </button>
            <button
              className="wl-ghost"
              onClick={() => {
                logout()
                router.replace('/')
              }}
            >
              Log out
            </button>
          </div>
        </header>

        <div className="wl-split">
          {/* Room */}
          <section className="wl-panel wl-roomwrap">
            <div className="wl-stage">
              {/* next/image re-encodes and blurs pixel art (AGENTS.md). */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/room.png" alt="Top-down pixel-art view of your apartment" />
              {APPLIANCES.map((a) => {
                const load = maxCur > 0 ? cur[a.id] / maxCur : 0
                const c = heat(load)
                const opacity = (whatIf ? 0.18 : 0.3) + load * (whatIf ? 0.3 : 0.45)
                return (
                  <div key={a.id}>
                    <div
                      className={'wl-zone' + (selected === a.id ? ' sel' : '')}
                      onClick={() => select(a.id)}
                      title={a.name}
                      style={{
                        left: a.x + '%',
                        top: a.y + '%',
                        width: a.r * 2 + '%',
                        paddingBottom: a.r * 2 + '%',
                        height: 0,
                        background: `radial-gradient(circle, ${c} 0%, transparent 70%)`,
                        opacity,
                      }}
                    />
                    <div className="wl-pin" style={{ left: a.x + '%', top: a.y + '%' }}>
                      {a.icon}
                    </div>
                  </div>
                )
              })}
            </div>
            <div className="wl-legend">
              <span>Low draw</span>
              <span className="wl-ramp" />
              <span>High draw</span>
              <span className="wl-legend-note">— hover a glow, click to inspect</span>
            </div>
          </section>

          {/* HUD */}
          <aside className="wl-panel wl-hud">
            <div className="wl-scorewrap">
              <div className="wl-h3">This month</div>
              <div style={{ marginTop: 10 }}>
                <span className="wl-bigscore" style={{ color: colour }}>
                  {displayScore}
                </span>
                <span className="wl-outof">/ 100</span>
              </div>
              <div className="wl-rank" style={{ color: colour }}>
                {rank}
              </div>
              <div className="wl-delta">
                {delta > 0 ? `▲ +${delta} from your changes` : '\u00A0'}
              </div>
              <div className="wl-bar">
                <i style={{ width: score + '%', background: colour }} />
              </div>
              <div className="wl-ticks">
                <span>0</span>
                <span>50</span>
                <span>75</span>
                <span>90</span>
                <span>100</span>
              </div>
            </div>

            <p className="wl-line">
              {over > 0 ? (
                <>
                  You used <b>{over}% more</b> than a comparable flat — about{' '}
                  <b>S${(total * TARIFF).toFixed(2)}</b> this month.
                </>
              ) : (
                <>
                  You&apos;re <b>{Math.abs(over)}% below</b> a comparable flat — about{' '}
                  <b>S${(total * TARIFF).toFixed(2)}</b> this month.
                </>
              )}
            </p>

            <div className="wl-detail">
              {selectedAppliance ? (
                (() => {
                  const a = selectedAppliance
                  const o = Math.round(((cur[a.id] - a.ref) / a.ref) * 100)
                  return (
                    <>
                      <div className="wl-dt">
                        {o > 0 ? (
                          <>
                            {a.icon} Your <b>{a.name.toLowerCase()}</b> uses{' '}
                            <b>{cur[a.id]} kWh</b> — {o}% more than a typical {a.ref}.
                          </>
                        ) : (
                          <>
                            {a.icon} Your <b>{a.name.toLowerCase()}</b> uses{' '}
                            <b>{cur[a.id]} kWh</b>, at or below the typical {a.ref}. Nicely
                            done.
                          </>
                        )}
                      </div>
                      <div className="wl-tip">{a.tip}</div>
                      <div className="wl-fixrow">
                        <button className="wl-btn wl-mini-btn" onClick={() => openDrawer('appliance')}>
                          How to improve
                        </button>
                        <button className="wl-ghost wl-mini-btn" onClick={reset}>
                          Reset
                        </button>
                      </div>
                    </>
                  )
                })()
              ) : (
                <>
                  <div className="wl-dt">Click any glow in the room, or a row below.</div>
                  <div className="wl-tip">
                    Each appliance is compared against what a typical flat in your block uses.
                  </div>
                </>
              )}
            </div>

            <div>
              <div className="wl-h3">Every appliance</div>
              <div className="wl-applist">
                {APPLIANCES.map((a) => {
                  const as = applianceScore(cur[a.id], a.ref)
                  const p = Math.round(((cur[a.id] - a.ref) / a.ref) * 100)
                  const off = cur[a.id] < a.kwh
                  const barColor =
                    as >= 85 ? 'var(--lime)' : as >= 60 ? 'var(--amber)' : 'var(--red)'
                  return (
                    <div
                      key={a.id}
                      className={
                        'wl-row' + (selected === a.id ? ' sel' : '') + (off ? ' off' : '')
                      }
                      onClick={() => select(a.id)}
                    >
                      <span className="wl-ic">{a.icon}</span>
                      <span className="wl-nm">{a.name}</span>
                      <span className="wl-mini">
                        <i style={{ width: as + '%', background: barColor }} />
                      </span>
                      <span className="wl-kwh">{cur[a.id]} kWh</span>
                      <span
                        className="wl-pct"
                        style={{ color: p > 0 ? 'var(--red)' : 'var(--lime)' }}
                      >
                        {(p > 0 ? '+' : '') + p}%
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          </aside>
        </div>

        <div className="wl-foot">Prototype — pixel art by LimeZu, Modern Interiors</div>
      </div>

      {/* Drawer */}
      <div
        className={'wl-scrim' + (drawerOpen ? ' open' : '')}
        onClick={() => setDrawerOpen(false)}
      />
      <aside className={'wl-drawer' + (drawerOpen ? ' open' : '')} aria-label="Ways to save">
        <div className="wl-dhead">
          <div>
            <div className="wl-h3">Ways to save</div>
            <div className="wl-drawer-sub">{drawerLabel}</div>
          </div>
          <button
            className="wl-ghost"
            style={{ padding: '9px 11px', fontSize: 8 }}
            onClick={() => setDrawerOpen(false)}
          >
            Close
          </button>
        </div>
        <div className="wl-tabs">
          <button
            className={'wl-tab' + (tab === 'appliance' ? ' on' : '')}
            onClick={() => setTab('appliance')}
          >
            This appliance
          </button>
          <button
            className={'wl-tab' + (tab === 'home' ? ' on' : '')}
            onClick={() => setTab('home')}
          >
            Whole home
          </button>
        </div>
        <div className="wl-dbody">
          {drawerItems.length === 0 ? (
            <div className="wl-empty">
              Pick an appliance in the room — a glow or a row — to see tips written for it.
              <br />
              <br />
              Or switch to <b>Whole home</b>.
            </div>
          ) : (
            <>
              {potential > 0 && (
                <div className="wl-potential">
                  Acting on everything here saves about <b>{potential} kWh</b> — roughly{' '}
                  <b>S${(potential * TARIFF).toFixed(2)}</b> a month.
                </div>
              )}
              {drawerItems.map((r) => {
                const done = applied.has(r.id)
                return (
                  <div key={r.id} className={'wl-rec' + (done ? ' done' : '')}>
                    <h4>
                      <span>{done ? '✅' : '💡'}</span>
                      <span>{r.title}</span>
                    </h4>
                    <p>{r.body}</p>
                    <div className="wl-impact">
                      {r.save > 0 ? (
                        <>
                          <span className="wl-chip save">-{r.save} kWh</span>
                          <span className="wl-chip save">
                            S${(r.save * TARIFF).toFixed(2)}/mo
                          </span>
                        </>
                      ) : (
                        <span className="wl-chip">no kWh change</span>
                      )}
                      <span className="wl-chip easy">{r.effort}</span>
                    </div>
                    {r.save > 0 && (
                      <button
                        className={(done ? 'wl-ghost' : 'wl-btn') + ' wl-act'}
                        onClick={() => applyRec(r)}
                      >
                        {done ? 'Undo' : 'Apply to what-if'}
                      </button>
                    )}
                  </div>
                )
              })}
            </>
          )}
        </div>
      </aside>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100%',
    background: 'var(--bg)',
    backgroundImage:
      'radial-gradient(ellipse 80% 60% at 50% 35%,#2f4d38 0%,var(--bg) 55%,var(--bg-deep) 100%)',
    backgroundAttachment: 'fixed',
    color: 'var(--ink)',
    padding: 18,
    display: 'flex',
    justifyContent: 'center',
  },
}

const css = `
.wl-app{
  --bg:#16261d; --bg-deep:#0d1813; --panel:#223a2c; --panel-hi:#2f5240;
  --line:#3f6b4e; --line-hi:#5fa072; --ink:#f3f2e6; --ink-dim:#a3c4ac;
  --amber:#ffc866; --amber-deep:#d99a2b; --lime:#9be564; --red:#ff7a6b;
  width:100%;max-width:1240px;display:flex;flex-direction:column;gap:14px;
  font-family:var(--font-geist-sans),system-ui,sans-serif;
}
.wl-scrim,.wl-drawer{
  --bg:#16261d; --bg-deep:#0d1813; --panel:#223a2c; --panel-hi:#2f5240;
  --line:#3f6b4e; --line-hi:#5fa072; --ink:#f3f2e6; --ink-dim:#a3c4ac;
  --amber:#ffc866; --amber-deep:#d99a2b; --lime:#9be564; --red:#ff7a6b;
  font-family:var(--font-geist-sans),system-ui,sans-serif;
}
.wl-panel{background:var(--panel);border:3px solid var(--line-hi);
  box-shadow:0 0 0 3px var(--bg-deep),8px 8px 0 0 rgba(0,0,0,.45)}
.wl-px{font-family:var(--font-pixel),monospace;text-transform:uppercase;letter-spacing:.14em}

.wl-header{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:14px 18px;flex-wrap:wrap}
.wl-who{display:flex;align-items:center;gap:14px}
.wl-sprite{width:48px;height:96px;image-rendering:pixelated;background:var(--panel-hi);
  border:3px solid var(--line);position:relative;overflow:hidden}
.wl-sprite::after{content:'';position:absolute;inset:0;
  background:linear-gradient(180deg,transparent 55%,rgba(155,229,100,.18) 100%)}
.wl-eyebrow{font-size:8px;color:var(--ink-dim)}
.wl-roomno{font-size:15px;color:var(--amber);margin-top:8px}
.wl-controls{display:flex;gap:10px;align-items:center;flex-wrap:wrap}
.wl-app button,.wl-drawer button{font-family:var(--font-pixel),monospace;text-transform:uppercase;letter-spacing:.14em;cursor:pointer}
.wl-btn{background:var(--amber);color:#2b1d05;border:3px solid #2b1d05;
  box-shadow:0 5px 0 0 var(--amber-deep);padding:11px 15px;font-size:10px;
  transition:transform 60ms steps(2),box-shadow 60ms steps(2)}
.wl-btn:active{transform:translateY(5px);box-shadow:0 0 0 0 var(--amber-deep)}
.wl-ghost{background:transparent;color:var(--ink-dim);border:3px solid var(--line);padding:11px 15px;font-size:10px}
.wl-ghost:hover{color:var(--ink);border-color:var(--line-hi)}
.wl-ghost.on{color:#2b1d05;background:var(--lime);border-color:#1e3a10}

.wl-split{display:grid;grid-template-columns:minmax(0,1fr) 380px;gap:14px;align-items:start}
@media(max-width:1080px){.wl-split{grid-template-columns:1fr}}

.wl-roomwrap{padding:16px;display:flex;flex-direction:column;align-items:center;gap:12px}
.wl-stage{position:relative;line-height:0;max-width:100%}
.wl-stage img{width:100%;height:auto;image-rendering:pixelated;display:block}
.wl-zone{position:absolute;transform:translate(-50%,-50%);border-radius:50%;
  cursor:pointer;transition:opacity .18s ease, filter .18s ease;mix-blend-mode:screen}
.wl-zone:hover{filter:brightness(1.35)}
.wl-zone.sel{animation:wl-pulse 1.1s steps(6) infinite}
@keyframes wl-pulse{0%,100%{filter:brightness(1.1)}50%{filter:brightness(1.7)}}
.wl-pin{position:absolute;transform:translate(-50%,-50%);font-size:19px;pointer-events:none;
  filter:drop-shadow(0 2px 0 rgba(0,0,0,.6))}
.wl-legend{display:flex;align-items:center;gap:10px;font-size:8px;color:var(--ink-dim);
  font-family:var(--font-pixel),monospace;text-transform:uppercase;letter-spacing:.14em;
  flex-wrap:wrap;justify-content:center}
.wl-ramp{width:150px;height:10px;background:linear-gradient(90deg,var(--lime),var(--amber),var(--red));
  border:2px solid var(--line)}
.wl-legend-note{text-transform:none;letter-spacing:0;font-family:var(--font-geist-sans),sans-serif;font-size:12px;margin-left:6px}

.wl-hud{padding:18px;display:flex;flex-direction:column;gap:16px}
.wl-scorewrap{text-align:center}
.wl-bigscore{font-family:var(--font-pixel),monospace;font-size:52px;line-height:1;color:var(--amber);
  display:inline-block;transition:color .3s}
.wl-outof{font-size:13px;color:var(--ink-dim);margin-left:6px}
.wl-rank{font-family:var(--font-pixel),monospace;font-size:10px;letter-spacing:.14em;text-transform:uppercase;margin-top:12px}
.wl-delta{font-family:var(--font-pixel),monospace;font-size:9px;letter-spacing:.1em;margin-top:9px;min-height:12px;color:var(--lime)}
.wl-bar{height:14px;background:var(--bg-deep);border:2px solid var(--line);margin-top:14px;position:relative}
.wl-bar > i{position:absolute;inset:0 auto 0 0;display:block;background:var(--amber);transition:width .5s ease,background .3s}
.wl-ticks{display:flex;justify-content:space-between;font-size:7px;color:var(--ink-dim);
  font-family:var(--font-pixel),monospace;margin-top:6px;letter-spacing:.06em}
.wl-line{font-size:13px;color:var(--ink-dim);line-height:1.55;text-align:center;margin:0}
.wl-line b{color:var(--ink)}

.wl-applist{display:flex;flex-direction:column;gap:0}
.wl-h3{font-family:var(--font-pixel),monospace;font-size:8px;letter-spacing:.16em;text-transform:uppercase;color:var(--ink-dim);margin-bottom:4px}
.wl-row{display:flex;align-items:center;gap:9px;padding:9px 6px;border-top:1px solid rgba(95,160,114,.28);
  cursor:pointer;transition:background .15s}
.wl-row:hover{background:var(--panel-hi)}
.wl-row.sel{background:var(--panel-hi);box-shadow:inset 3px 0 0 var(--amber)}
.wl-ic{width:19px;text-align:center;font-size:14px}
.wl-nm{flex:1;font-size:12px;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.wl-mini{width:56px;height:8px;background:var(--bg-deep);position:relative;flex:none}
.wl-mini i{position:absolute;inset:0 auto 0 0;transition:width .45s ease,background .3s}
.wl-kwh{width:56px;text-align:right;font-size:11px;color:var(--ink-dim);font-variant-numeric:tabular-nums}
.wl-pct{width:46px;text-align:right;font-size:11px;font-variant-numeric:tabular-nums;font-weight:600}
.wl-row.off{opacity:.45}
.wl-row.off .wl-nm{text-decoration:line-through}

.wl-detail{border-left:4px solid var(--amber);background:var(--bg-deep);padding:12px}
.wl-dt{font-size:13px;line-height:1.5}
.wl-tip{font-size:12px;color:var(--ink-dim);margin-top:7px;line-height:1.5}
.wl-fixrow{display:flex;gap:8px;margin-top:11px}
.wl-mini-btn{font-size:8px;padding:9px 10px;flex:1}

.wl-foot{font-size:11px;color:rgba(163,196,172,.65);text-align:center;padding:4px 0 0}

.wl-scrim{position:fixed;inset:0;background:rgba(0,0,0,.6);opacity:0;pointer-events:none;
  transition:opacity .25s;z-index:40}
.wl-scrim.open{opacity:1;pointer-events:auto}
.wl-drawer{position:fixed;top:0;right:0;height:100%;width:min(420px,92vw);z-index:50;
  background:var(--panel);border-left:3px solid var(--line-hi);
  transform:translateX(103%);transition:transform .28s cubic-bezier(.3,.9,.3,1);
  display:flex;flex-direction:column;overflow:hidden;color:var(--ink)}
.wl-drawer.open{transform:translateX(0)}
.wl-dhead{padding:16px 18px;border-bottom:3px solid var(--line);display:flex;
  align-items:flex-start;justify-content:space-between;gap:12px}
.wl-drawer-sub{font-size:12px;color:var(--ink-dim);margin-top:7px}
.wl-tabs{display:flex;gap:0;border-bottom:3px solid var(--line)}
.wl-tab{flex:1;background:transparent;border:0;border-bottom:3px solid transparent;margin-bottom:-3px;
  color:var(--ink-dim);font-family:var(--font-pixel),monospace;font-size:8px;letter-spacing:.1em;
  text-transform:uppercase;padding:13px 8px;cursor:pointer}
.wl-tab.on{color:var(--amber);border-bottom-color:var(--amber)}
.wl-dbody{flex:1;overflow-y:auto;padding:16px 18px;display:flex;flex-direction:column;gap:12px}
.wl-rec{border:3px solid var(--line);background:var(--bg-deep);padding:13px}
.wl-rec.done{border-color:var(--lime);opacity:.72}
.wl-rec h4{margin:0;font-size:13px;font-weight:600;display:flex;gap:8px;align-items:flex-start;font-family:var(--font-geist-sans),sans-serif}
.wl-rec p{margin:8px 0 0;font-size:12px;color:var(--ink-dim);line-height:1.55}
.wl-impact{display:flex;gap:8px;margin-top:11px;flex-wrap:wrap}
.wl-chip{font-family:var(--font-pixel),monospace;font-size:7px;letter-spacing:.08em;text-transform:uppercase;
  padding:6px 7px;border:2px solid var(--line);color:var(--ink-dim)}
.wl-chip.save{color:var(--lime);border-color:var(--lime)}
.wl-chip.easy{color:var(--amber);border-color:var(--amber)}
.wl-act{margin-top:11px;width:100%;font-size:8px;padding:10px}
.wl-empty{font-size:12px;color:var(--ink-dim);line-height:1.6;text-align:center;padding:26px 10px}
.wl-potential{background:var(--bg-deep);border-left:4px solid var(--lime);padding:12px;font-size:12px;line-height:1.55}
.wl-potential b{color:var(--lime)}
`
