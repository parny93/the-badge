'use client'
import { useState, useRef, useMemo, useEffect } from 'react'
import { DifficultyLevel, Formation, GameAction, Position, RatedPlayer } from '@/types'
import { FORMATIONS } from '@/lib/teamStrength'
import { familiarity } from '@/lib/chemistry'
import { getDraftPool, canPlaySlot } from '@/lib/playerPool'
import { rand } from '@/lib/rng'
import FormationDisplay from '@/components/ui/FormationDisplay'

interface Props {
  formation: Formation
  squad: (RatedPlayer | null)[]
  difficultyLevel: DifficultyLevel
  respinsLeft: number
  yearFrom: number
  yearTo: number
  daily: string | null
  dispatch: React.Dispatch<GameAction>
}

type Phase = 'idle' | 'spinning' | 'choosing' | 'placing'
type WheelType = 'era' | 'peak'

// ─── Era wheel ────────────────────────────────────────────────────────────────
// The spin lands on an era, and your picks come from that era — so what the
// reel shows is what you actually get.

interface Era { decade: number; label: string; nickname: string }

const ERAS: Era[] = [
  { decade: 1950, label: "THE '50s", nickname: 'Matthews, Finney & Wright' },
  { decade: 1960, label: "THE '60s", nickname: "The Boys of '66" },
  { decade: 1970, label: "THE '70s", nickname: 'The Wilderness Years' },
  { decade: 1980, label: "THE '80s", nickname: "Robson's England" },
  { decade: 1990, label: "THE '90s", nickname: "Gazza's England" },
  { decade: 2000, label: "THE '00s", nickname: 'The Golden Generation' },
  { decade: 2010, label: "THE '10s", nickname: 'The Rebuild' },
  { decade: 2020, label: "THE '20s", nickname: 'New England' },
]

// Pre-1950 peaks (Matthews, Mannion) fold into the '50s bucket.
function eraOf(peakYear: number): number {
  return Math.min(2020, Math.max(1950, Math.floor(peakYear / 10) * 10))
}

export default function DraftScreen({ formation, squad, difficultyLevel, respinsLeft, yearFrom, yearTo, daily, dispatch }: Props) {
  const slots = FORMATIONS[formation]
  const [phase, setPhase] = useState<Phase>('idle')
  const [drawn, setDrawn] = useState<RatedPlayer[]>([])
  const [drawnEra, setDrawnEra] = useState<Era | null>(null)
  const [chosen, setChosen] = useState<RatedPlayer | null>(null)
  // Easy/Normal choose the wheel each spin; Hard is locked to the era wheel.
  const [wheelType, setWheelType] = useState<WheelType>('era')
  const [reelRows, setReelRows] = useState<string[]>(['???', '???', '???', '???', '???'])
  const [reelPopped, setReelPopped] = useState(false)
  const [revealedCount, setRevealedCount] = useState(-1)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const hard = difficultyLevel === 'hard'
  const drawCount = 3
  const peakWheel = !hard && wheelType === 'peak'

  const pickedIds = useMemo(() => squad.filter(Boolean).map(p => p!.id), [squad])
  const filledCount = pickedIds.length
  const isComplete = filledCount === slots.length

  // Positions still needed in the XI. In hard mode the wheel narrows to only
  // players who can fill one of these — positions drop out as they're filled.
  const openPositions = useMemo(() => {
    const set = new Set<Position>()
    slots.forEach((slot, i) => { if (!squad[i]) set.add(slot.position) })
    return [...set]
  }, [slots, squad])

  const clearTimer = () => { if (timerRef.current) clearTimeout(timerRef.current) }

  useEffect(() => () => clearTimer(), [])

  const spin = () => {
    if (phase === 'spinning') return
    // Every drawn player must fit a position you still NEED — in any mode.
    // (This used to be Hard Mode only, which is how you ended up offered a
    // goalkeeper when the open slots were ST, LW and LB.)
    const all = getDraftPool(pickedIds)
    const fitting = all.filter(p => openPositions.some(pos => canPlaySlot(p, pos)))
    // Era-range filter from the sliders; pre-1950 peaks count as 1950.
    const inRange = fitting.filter(p => {
      const y = Math.max(1950, p.peakYear)
      return y >= yearFrom && y <= yearTo
    })
    const pool = inRange.length > 0 ? inRange : fitting.length > 0 ? fitting : all
    if (pool.length === 0) return

    // rand() (not Math.random) so Daily Challenge spins are identical for all.
    let era: Era | null = null
    let picked: RatedPlayer[]

    if (peakWheel) {
      // ── Peak-ratings wheel: draw from the whole range at peak strength ───
      const shuffled = [...pool].sort(() => rand() - 0.5)
      picked = shuffled.slice(0, Math.min(drawCount, shuffled.length))
    } else {
      // ── Era wheel: land on an era, then draw the picks FROM that era ─────
      const byEra = new Map<number, RatedPlayer[]>()
      for (const p of pool) {
        const d = eraOf(p.peakYear)
        byEra.set(d, [...(byEra.get(d) ?? []), p])
      }
      // Weighted by how many eligible players each era still has, so the
      // wheel never lands on an empty decade.
      const weighted: Era[] = ERAS.filter(e => (byEra.get(e.decade)?.length ?? 0) > 0)
      const totalWeight = weighted.reduce((s, e) => s + byEra.get(e.decade)!.length, 0)
      let roll = rand() * totalWeight
      era = weighted[0]
      for (const e of weighted) {
        roll -= byEra.get(e.decade)!.length
        if (roll <= 0) { era = e; break }
      }

      // The era's players, topped up from neighbouring decades when thin.
      const decade = era.decade
      let eraPool = [...(byEra.get(decade) ?? [])]
      if (eraPool.length < drawCount) {
        const fillers = pool
          .filter(p => !eraPool.includes(p))
          .sort((a, b) => Math.abs(eraOf(a.peakYear) - decade) - Math.abs(eraOf(b.peakYear) - decade))
        eraPool = [...eraPool, ...fillers].slice(0, Math.max(drawCount, eraPool.length))
      }
      const shuffled = [...eraPool].sort(() => rand() - 0.5)
      picked = shuffled.slice(0, Math.min(drawCount, shuffled.length))
    }

    setPhase('spinning')
    setChosen(null)
    setReelPopped(false)
    setRevealedCount(-1)

    let ticks = 0
    const TOTAL = 28

    const doTick = () => {
      ticks++

      // The reel cycles era labels (or names on the peak wheel) — cosmetic,
      // Math.random is fine — and freezes on the real result's centre row.
      const rows = peakWheel
        ? Array.from({ length: 5 }, () => pool[Math.floor(Math.random() * pool.length)].name)
        : Array.from({ length: 5 }, () => ERAS[Math.floor(Math.random() * ERAS.length)].label)
      if (ticks >= TOTAL) rows[2] = peakWheel ? picked[0].name : era!.label
      setReelRows(rows)

      // Speed curve: fast → slow → stop
      const delay =
        ticks < 14 ? 55 :
        ticks < 20 ? 80 :
        ticks < 24 ? 140 :
        ticks < 27 ? 240 : 380

      if (ticks < TOTAL) {
        timerRef.current = setTimeout(doTick, delay)
      } else {
        setDrawnEra(era)
        setDrawn(picked)

        timerRef.current = setTimeout(() => {
          setReelPopped(true)
          timerRef.current = setTimeout(() => {
            setPhase('choosing')
            setRevealedCount(0)
            // Stagger the reveal of each drawn card.
            for (let r = 1; r < picked.length; r++) {
              setTimeout(() => setRevealedCount(r), 280 + (r - 1) * 240)
            }
          }, 250)
        }, 180)
      }
    }

    timerRef.current = setTimeout(doTick, 55)
  }

  const choosePlayer = (p: RatedPlayer) => {
    setChosen(p)
    setPhase('placing')
  }

  // Bin the current offering and spin again — costs one of your re-spins.
  const respin = () => {
    if (respinsLeft <= 0 || phase === 'spinning') return
    dispatch({ type: 'USE_RESPIN' })
    setDrawn([])
    setDrawnEra(null)
    spin()
  }

  const placeInSlot = (slotIndex: number) => {
    if (!chosen || squad[slotIndex]) return
    dispatch({ type: 'PICK_PLAYER', player: chosen, slotIndex })
    setChosen(null)
    setDrawn([])
    setDrawnEra(null)
    setPhase('idle')
  }

  const slotFit = (slotIndex: number): 'filled' | 'good' | 'oop' => {
    if (squad[slotIndex]) return 'filled'
    if (!chosen) return 'good'
    return familiarity(chosen, slots[slotIndex].position) >= 0.9 ? 'good' : 'oop'
  }

  const ratingColor = (r: number) =>
    r >= 88 ? 'text-yellow-400' : r >= 82 ? 'text-emerald-400' : 'text-sky-400'

  return (
    <div className="min-h-screen px-4 py-4 pb-32 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-slate-400 text-xs uppercase tracking-widest">All-Time Draft</div>
          <div className="text-white font-black text-xl">
            {filledCount} / {slots.length} <span className="text-slate-500 text-sm font-normal">drafted</span>
          </div>
        </div>
        <button onClick={() => dispatch({ type: 'BACK' })} className="text-slate-500 hover:text-white text-sm">← Back</button>
      </div>

      {/* Pitch */}
      <div className="relative">
        <FormationDisplay
          squad={squad}
          formation={formation}
          activeIndex={phase === 'placing' ? -1 : undefined}
          onSelectSlot={phase === 'placing' ? placeInSlot : undefined}
        />
        {phase === 'placing' && (
          <div className="absolute inset-0 pointer-events-none">
            {slots.map((slot, i) => {
              const fit = slotFit(i)
              if (fit === 'filled') return null
              return (
                <div
                  key={i}
                  className="absolute"
                  style={{ left: `${slot.x}%`, bottom: `${slot.y}%`, transform: 'translate(-50%, 50%)' }}
                >
                  <div className={`w-12 h-12 rounded-full animate-pulse ${
                    fit === 'good' ? 'ring-4 ring-emerald-400 bg-emerald-400/20' : 'ring-4 ring-amber-400 bg-amber-400/20'
                  }`} />
                </div>
              )
            })}
          </div>
        )}
      </div>

      {phase === 'placing' && (
        <div className="text-center text-sm">
          <span className="text-white font-bold">{chosen?.name}</span>
          <span className="text-slate-400"> — tap a </span>
          <span className="text-emerald-400 font-semibold">green</span>
          <span className="text-slate-400"> (natural) or </span>
          <span className="text-amber-400 font-semibold">amber</span>
          <span className="text-slate-400"> (out of position) slot</span>
        </div>
      )}

      {/* Spin panel */}
      {!isComplete && phase !== 'placing' && (
        <div className="rounded-2xl bg-white/5 border border-white/10 overflow-hidden">

          {/* ── IDLE ── */}
          {phase === 'idle' && (
            <div className="p-5 flex flex-col items-center gap-4">
              {/* Hard Mode toggle — locked in the Daily Challenge so everyone
                  plays the same wheel */}
              {daily ? (
                <div className="w-full max-w-xs text-center">
                  <span className="inline-block text-xs font-bold text-amber-300 bg-amber-400/10 border border-amber-400/30 rounded-full px-3 py-1.5">
                    Daily Challenge · {daily}
                  </span>
                  <p className="text-slate-500 text-xs mt-2 leading-snug">
                    Same wheel, same tournament for everyone today. One attempt counts.
                  </p>
                </div>
              ) : (
                <div className="w-full max-w-xs text-center">
                  {/* Settings chosen upfront — just a reminder of what's in play */}
                  <span className="inline-block text-xs font-bold text-slate-300 bg-white/10 rounded-full px-3 py-1.5 tabular-nums">
                    {yearFrom} – {yearTo} · {difficultyLevel.charAt(0).toUpperCase() + difficultyLevel.slice(1)}
                    {respinsLeft > 0 && ` · ${respinsLeft} re-spin${respinsLeft === 1 ? '' : 's'}`}
                  </span>
                </div>
              )}

              {/* Wheel type — Easy/Normal choose; Hard is era-only */}
              {!hard && (
                <div className="w-full max-w-xs">
                  <div className="flex items-center rounded-xl bg-slate-800/80 border border-white/10 p-1">
                    {(['era', 'peak'] as WheelType[]).map(w => (
                      <button
                        key={w}
                        onClick={() => setWheelType(w)}
                        className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${
                          wheelType === w
                            ? 'bg-fuchsia-500 text-white shadow-[0_0_16px_rgba(217,70,239,0.35)]'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {w === 'era' ? 'Era wheel' : 'Peak ratings'}
                      </button>
                    ))}
                  </div>
                  <p className="text-slate-500 text-xs text-center mt-2 leading-snug">
                    {wheelType === 'era'
                      ? 'The wheel lands on a decade and your three picks come from it.'
                      : 'Drawn from your whole era range, every player at peak rating.'}
                  </p>
                </div>
              )}

              <p className="text-slate-400 text-sm text-center">
                Spin to draw three legends. Pick one. Make it work.
                {hard && ' Era wheel only — ratings stay hidden until your XI is locked.'}
              </p>
              <button
                onClick={spin}
                className="relative w-full max-w-xs bg-fuchsia-500 hover:bg-fuchsia-400 active:scale-95
                  text-white font-black text-xl py-4 rounded-2xl transition-all
                  shadow-[0_0_32px_rgba(217,70,239,0.45)]"
              >
                <span className="relative z-10">SPIN</span>
                <div className="absolute inset-0 rounded-2xl animate-shimmer" />
              </button>
            </div>
          )}

          {/* ── SPINNING ── */}
          {phase === 'spinning' && (
            <div className="p-4 flex flex-col items-center gap-3">
              <div className="text-slate-400 text-xs uppercase tracking-widest font-bold">Drawing…</div>

              {/* Slot reel */}
              <div className={`relative w-full overflow-hidden rounded-xl border-2 border-fuchsia-500/70
                bg-slate-800/80 h-[88px] ${reelPopped ? 'animate-reel-pop' : ''}`}
              >
                {/* Top/bottom fade */}
                <div className="absolute inset-x-0 top-0 h-7 bg-gradient-to-b from-slate-800 to-transparent z-10 pointer-events-none" />
                <div className="absolute inset-x-0 bottom-0 h-7 bg-gradient-to-t from-slate-800 to-transparent z-10 pointer-events-none" />

                {/* Highlight band */}
                <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[30px] border-y border-fuchsia-400/30 z-10 pointer-events-none" />

                <div className="flex flex-col h-full">
                  {reelRows.map((name, i) => (
                    <div
                      key={i}
                      className={`flex-1 flex items-center justify-center px-4
                        ${i === 2 ? 'text-white font-black text-base' : 'text-slate-500 text-xs'}`}
                    >
                      {name}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-1.5">
                {[0, 1, 2].map(i => (
                  <div key={i} className="w-1.5 h-1.5 rounded-full bg-fuchsia-400 animate-bounce"
                    style={{ animationDelay: `${i * 0.12}s` }} />
                ))}
              </div>
            </div>
          )}

          {/* ── CHOOSING ── */}
          {phase === 'choosing' && (
            <div className="p-4">
              <div className="text-center mb-3">
                {drawnEra && (
                  <div className="text-fuchsia-300 font-black text-base leading-tight">
                    {drawnEra.label} <span className="text-slate-400 font-semibold text-xs">· {drawnEra.nickname}</span>
                  </div>
                )}
                {!drawnEra && (
                  <div className="text-fuchsia-300 font-black text-base leading-tight">
                    Peak ratings draw
                  </div>
                )}
                <div className="text-slate-400 text-xs uppercase tracking-widest mt-1 font-bold">
                  Pick one to draft
                </div>
              </div>
              <div className="flex flex-col gap-2.5">
                {drawn.map((p, i) => (
                  <button
                    key={p.id}
                    onClick={() => choosePlayer(p)}
                    className={`flex items-center justify-between rounded-xl border-2 border-white/10
                      bg-white/5 hover:border-fuchsia-400 hover:bg-fuchsia-500/10
                      active:scale-95 transition-all p-3.5
                      ${i <= revealedCount ? 'animate-card-reveal' : 'opacity-0'}`}
                    style={{ animationDelay: `${i * 0}ms` }}
                  >
                    <div className="text-left">
                      <div className="font-bold text-white text-base leading-tight">{p.name}</div>
                      <div className="text-xs text-slate-400 mt-0.5">{p.positions.join(' / ')}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      {hard ? (
                        <div className="text-right">
                          <div className="text-[9px] text-slate-500 uppercase tracking-widest leading-none">Era</div>
                          <div className="text-xl font-black text-amber-400 leading-tight">
                            &rsquo;{String(p.peakYear).slice(2)}
                          </div>
                        </div>
                      ) : (
                        <div className={`text-2xl font-black ${ratingColor(p.ratingAtYear)}`}>
                          {p.ratingAtYear}
                        </div>
                      )}
                      <div className="text-slate-600 text-sm">→</div>
                    </div>
                  </button>
                ))}
              </div>
              {revealedCount >= drawn.length - 1 && (
                <>
                  {respinsLeft > 0 ? (
                    <button
                      onClick={respin}
                      className="w-full mt-3 py-2.5 rounded-xl border border-fuchsia-400/40 text-fuchsia-300 text-sm font-bold hover:bg-fuchsia-500/10 active:scale-95 transition-all animate-card-reveal"
                    >
                      Don&rsquo;t fancy these? Re-spin · {respinsLeft} left
                    </button>
                  ) : (
                    <p className="text-center text-slate-600 text-xs mt-3 animate-card-reveal">
                      {hard ? 'No ratings. No re-spins. Trust your gut.' : 'No re-spins left — choose wisely'}
                    </p>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      )}

      {/* Complete */}
      {isComplete && (
        <div className="fixed bottom-4 left-4 right-4 z-30">
          <button
            onClick={() => dispatch({ type: 'REVIEW_SQUAD' })}
            className="w-full bg-yellow-400 text-slate-900 font-black text-lg py-4 rounded-2xl active:scale-95 transition-all shadow-2xl"
          >
            Squad Complete — Review XI →
          </button>
        </div>
      )}
    </div>
  )
}
