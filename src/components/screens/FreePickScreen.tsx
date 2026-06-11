'use client'
import { useMemo } from 'react'
import { Formation, GameAction, GameMode, RatedPlayer } from '@/types'
import { FORMATIONS, calculateTeamStrength } from '@/lib/teamStrength'
import { getEligiblePool } from '@/lib/playerPool'
import { CHEM_LABEL } from '@/lib/chemistry'
import PlayerCard from '@/components/ui/PlayerCard'
import FormationDisplay from '@/components/ui/FormationDisplay'

interface Props {
  mode: GameMode
  squadYear: number
  formation: Formation
  squad: (RatedPlayer | null)[]
  pickIndex: number
  hardMode: boolean
  yearFrom: number
  yearTo: number
  dispatch: React.Dispatch<GameAction>
}

export default function FreePickScreen({ mode, squadYear, formation, squad, pickIndex, hardMode, yearFrom, yearTo, dispatch }: Props) {
  const slots = FORMATIONS[formation]
  const activeSlot = slots[pickIndex] ?? slots[0]
  const pickedIds = squad.filter(Boolean).map(p => p!.id)
  const filledCount = pickedIds.length
  const isComplete = filledCount === slots.length

  const pool = useMemo(() => {
    const base = getEligiblePool({
      slot: activeSlot.position,
      year: squadYear,
      prime: mode !== 'manager',
      managerEligibility: mode === 'manager',
      exclude: pickedIds,
    })
    // All-Time XI honours the upfront era range (Manager Mode is already
    // pinned to a single year). Relax rather than dead-end an empty slot.
    if (mode !== 'manager') {
      const ranged = base.filter(p => {
        const y = Math.max(1950, p.peakYear)
        return y >= yearFrom && y <= yearTo
      })
      if (ranged.length > 0) return ranged
    }
    return base
  }, [activeSlot.position, squadYear, mode, pickedIds.join(','), yearFrom, yearTo])

  const strength = calculateTeamStrength(squad, formation)

  const title = mode === 'manager' ? `Manager Mode · ${squadYear}` : 'All-Time XI'
  const currentPlayer = squad[pickIndex]

  return (
    <div className="min-h-screen px-4 py-4 pb-32 flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="text-slate-400 text-xs uppercase tracking-widest">{title}</div>
          <div className="text-white font-black text-lg">
            {filledCount} / {slots.length} <span className="text-slate-500 text-sm font-normal">picked</span>
          </div>
        </div>
        <button onClick={() => dispatch({ type: 'BACK' })} className="text-slate-500 hover:text-white text-sm">← Back</button>
      </div>

      {/* Live strength bar */}
      {filledCount > 0 && (
        <div className="flex gap-2">
          <div className="flex-1 rounded-lg bg-white/5 border border-white/10 px-3 py-2 flex items-center justify-between">
            <span className="text-slate-400 text-xs">OVR</span>
            {/* Hard difficulty keeps the team rating under wraps until review */}
            <span className="text-white font-black text-lg">{hardMode ? '??' : strength.overall}</span>
          </div>
          <div className="flex-1 rounded-lg bg-white/5 border border-white/10 px-3 py-2 flex items-center justify-between">
            <span className="text-slate-400 text-xs">CHEM</span>
            <span className={`font-black text-lg ${
              strength.chemistry.score >= 80 ? 'text-emerald-400' :
              strength.chemistry.score >= 68 ? 'text-yellow-400' : 'text-orange-400'
            }`}>{strength.chemistry.score}</span>
          </div>
        </div>
      )}

      {/* Pitch — tap a slot to fill it */}
      <FormationDisplay
        squad={squad}
        formation={formation}
        activeIndex={pickIndex}
        onSelectSlot={(i) => dispatch({ type: 'SET_ACTIVE_SLOT', slotIndex: i })}
        compact
      />

      {/* Active slot indicator */}
      <div className="flex items-center justify-between">
        <div className="text-sm">
          <span className="text-slate-400">Filling: </span>
          <span className="text-white font-bold">{activeSlot.label}</span>
          {currentPlayer && <span className="text-slate-500"> — currently {currentPlayer.name}</span>}
        </div>
        {currentPlayer && (
          <button
            onClick={() => dispatch({ type: 'REMOVE_PLAYER', slotIndex: pickIndex })}
            className="text-red-400 hover:text-red-300 text-xs font-semibold"
          >
            ✕ Remove
          </button>
        )}
      </div>

      {/* Eligible players */}
      <div className="flex flex-col gap-2">
        {pool.length === 0 ? (
          <div className="text-center text-slate-500 py-8 text-sm">
            No eligible players for {activeSlot.label} in {squadYear}.
          </div>
        ) : (
          pool.map(player => (
            <PlayerCard
              key={player.id}
              player={player}
              onClick={() => dispatch({ type: 'PICK_PLAYER', player, slotIndex: pickIndex })}
              showAge={mode === 'manager'}
              hideRating={hardMode}
            />
          ))
        )}
      </div>

      {/* Complete */}
      {isComplete && (
        <div className="fixed bottom-4 left-4 right-4 z-30">
          <button
            onClick={() => dispatch({ type: 'REVIEW_SQUAD' })}
            className="w-full bg-yellow-400 text-slate-900 font-black text-lg py-4 rounded-2xl active:scale-95 transition-all shadow-2xl"
          >
            Review XI · {CHEM_LABEL(strength.chemistry.score)} →
          </button>
        </div>
      )}
    </div>
  )
}
