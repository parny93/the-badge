'use client'
import { useState, useRef, useMemo, useEffect } from 'react'
import { Formation, GameAction, RatedPlayer } from '@/types'
import { FORMATIONS } from '@/lib/teamStrength'
import { familiarity } from '@/lib/chemistry'
import { getDraftPool } from '@/lib/playerPool'
import FormationDisplay from '@/components/ui/FormationDisplay'

interface Props {
  formation: Formation
  squad: (RatedPlayer | null)[]
  dispatch: React.Dispatch<GameAction>
}

type Phase = 'idle' | 'spinning' | 'choosing' | 'placing'

export default function DraftScreen({ formation, squad, dispatch }: Props) {
  const slots = FORMATIONS[formation]
  const [phase, setPhase] = useState<Phase>('idle')
  const [drawn, setDrawn] = useState<RatedPlayer[]>([])
  const [chosen, setChosen] = useState<RatedPlayer | null>(null)
  const [reelRows, setReelRows] = useState<string[]>(['???', '???', '???', '???', '???'])
  const [reelPopped, setReelPopped] = useState(false)
  const [revealedCount, setRevealedCount] = useState(-1)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const pickedIds = useMemo(() => squad.filter(Boolean).map(p => p!.id), [squad])
  const filledCount = pickedIds.length
  const isComplete = filledCount === slots.length

  const clearTimer = () => { if (timerRef.current) clearTimeout(timerRef.current) }

  useEffect(() => () => clearTimer(), [])

  const spin = () => {
    if (phase === 'spinning') return
    const pool = getDraftPool(pickedIds)
    if (pool.length < 3) return

    setPhase('spinning')
    setChosen(null)
    setReelPopped(false)
    setRevealedCount(-1)

    let ticks = 0
    const TOTAL = 28

    const doTick = () => {
      ticks++

      // Update the reel rows — show a window of 5 names
      const names = Array.from({ length: 5 }, () =>
        pool[Math.floor(Math.random() * pool.length)].name
      )
      setReelRows(names)

      // Speed curve: fast → slow → stop
      const delay =
        ticks < 14 ? 55 :
        ticks < 20 ? 80 :
        ticks < 24 ? 140 :
        ticks < 27 ? 240 : 380

      if (ticks < TOTAL) {
        timerRef.current = setTimeout(doTick, delay)
      } else {
        // Done spinning — freeze on final name then reveal cards
        const shuffled = [...pool].sort(() => Math.random() - 0.5)
        const picked = shuffled.slice(0, 3)
        setDrawn(picked)

        timerRef.current = setTimeout(() => {
          setReelPopped(true)
          timerRef.current = setTimeout(() => {
            setPhase('choosing')
            setRevealedCount(0)
            timerRef.current = setTimeout(() => setRevealedCount(1), 280)
            timerRef.current = setTimeout(() => setRevealedCount(2), 520)
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

  const placeInSlot = (slotIndex: number) => {
    if (!chosen || squad[slotIndex]) return
    dispatch({ type: 'PICK_PLAYER', player: chosen, slotIndex })
    setChosen(null)
    setDrawn([])
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
              <p className="text-slate-400 text-sm text-center">
                Spin to draw three legends. Pick one. Make it work.
              </p>
              <button
                onClick={spin}
                className="relative w-full max-w-xs bg-fuchsia-500 hover:bg-fuchsia-400 active:scale-95
                  text-white font-black text-xl py-4 rounded-2xl transition-all
                  shadow-[0_0_32px_rgba(217,70,239,0.45)]"
              >
                <span className="relative z-10">🎰 SPIN</span>
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
              <div className="text-slate-400 text-xs uppercase tracking-widest mb-3 text-center font-bold">
                Pick one to draft
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
                      <div className={`text-2xl font-black ${ratingColor(p.ratingAtYear)}`}>
                        {p.ratingAtYear}
                      </div>
                      <div className="text-slate-600 text-sm">→</div>
                    </div>
                  </button>
                ))}
              </div>
              {revealedCount >= 2 && (
                <p className="text-center text-slate-600 text-xs mt-3 animate-card-reveal">
                  Choose wisely — you can't go back
                </p>
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
