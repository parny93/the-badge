'use client'
import { useState, useRef, useMemo } from 'react'
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
  const [reelName, setReelName] = useState('???')
  const reelRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const pickedIds = useMemo(() => squad.filter(Boolean).map(p => p!.id), [squad])
  const filledCount = pickedIds.length
  const isComplete = filledCount === slots.length

  const spin = () => {
    if (phase === 'spinning') return
    const pool = getDraftPool(pickedIds)
    if (pool.length < 3) return

    setPhase('spinning')
    setChosen(null)

    // Reel animation — cycle random names fast, then settle
    let ticks = 0
    reelRef.current = setInterval(() => {
      setReelName(pool[Math.floor(Math.random() * pool.length)].name)
      ticks++
      if (ticks > 16) {
        if (reelRef.current) clearInterval(reelRef.current)
        // Draw 3 distinct random players
        const shuffled = [...pool].sort(() => Math.random() - 0.5)
        setDrawn(shuffled.slice(0, 3))
        setPhase('choosing')
      }
    }, 80)
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

  // Which open slots can the chosen player fill, and how well?
  const slotFit = (slotIndex: number): 'filled' | 'good' | 'oop' => {
    if (squad[slotIndex]) return 'filled'
    if (!chosen) return 'good'
    return familiarity(chosen, slots[slotIndex].position) >= 0.9 ? 'good' : 'oop'
  }

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
          <span className="text-slate-400"> slot (natural) or </span>
          <span className="text-amber-400 font-semibold">amber</span>
          <span className="text-slate-400"> (out of position)</span>
        </div>
      )}

      {/* Spin reel / drawn players */}
      {!isComplete && phase !== 'placing' && (
        <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
          {phase === 'spinning' && (
            <div className="text-center py-6">
              <div className="text-slate-400 text-xs uppercase tracking-widest mb-2">Spinning…</div>
              <div className="text-2xl font-black text-white animate-pulse">{reelName}</div>
            </div>
          )}

          {phase === 'idle' && (
            <div className="text-center py-4">
              <p className="text-slate-400 text-sm mb-3">Spin to draw three players. Pick one. Make it work.</p>
              <button
                onClick={spin}
                className="bg-fuchsia-500 hover:bg-fuchsia-400 text-white font-black text-lg px-8 py-3 rounded-2xl active:scale-95 transition-all"
              >
                🎡 SPIN
              </button>
            </div>
          )}

          {phase === 'choosing' && (
            <div>
              <div className="text-slate-400 text-xs uppercase tracking-widest mb-2 text-center">Pick one to draft</div>
              <div className="flex flex-col gap-2">
                {drawn.map(p => (
                  <button
                    key={p.id}
                    onClick={() => choosePlayer(p)}
                    className="flex items-center justify-between rounded-xl border-2 border-white/10 bg-white/5 hover:border-fuchsia-400 active:scale-95 transition-all p-3"
                  >
                    <div className="text-left">
                      <div className="font-bold text-white">{p.name}</div>
                      <div className="text-xs text-slate-400">{p.positions.join(' / ')}</div>
                    </div>
                    <div className={`text-2xl font-black ${
                      p.ratingAtYear >= 88 ? 'text-yellow-400' :
                      p.ratingAtYear >= 82 ? 'text-emerald-400' : 'text-sky-400'
                    }`}>{p.ratingAtYear}</div>
                  </button>
                ))}
              </div>
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
