'use client'
import { useMemo } from 'react'
import { GameAction, GameMode, RatedPlayer } from '@/types'
import { getBenchPool } from '@/lib/playerPool'
import { displaySurname } from '@/lib/names'
import PlayerCard from '@/components/ui/PlayerCard'

interface Props {
  mode: GameMode
  squadYear: number
  squad: (RatedPlayer | null)[]
  bench: (RatedPlayer | null)[]
  benchIndex: number
  dispatch: React.Dispatch<GameAction>
}

// Slot 0 is the sub keeper; the rest are outfield cover.
const SLOT_LABELS = ['SUB GK', 'SUB 2', 'SUB 3', 'SUB 4', 'SUB 5', 'SUB 6', 'SUB 7']

export default function BenchScreen({ mode, squadYear, squad, bench, benchIndex, dispatch }: Props) {
  const isGKSlot = benchIndex === 0
  const takenIds = [
    ...squad.filter(Boolean).map(p => p!.id),
    ...bench.filter(Boolean).map(p => p!.id),
  ]
  const filledCount = bench.filter(Boolean).length

  const pool = useMemo(() => getBenchPool({
    gk: isGKSlot,
    year: squadYear,
    prime: mode !== 'manager',
    managerEligibility: mode === 'manager',
    exclude: takenIds,
  }), [isGKSlot, squadYear, mode, takenIds.join(',')]) // eslint-disable-line react-hooks/exhaustive-deps

  const current = bench[benchIndex]

  return (
    <div className="min-h-screen px-4 py-4 pb-32 flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="text-slate-400 text-xs uppercase tracking-widest">Tournament squad</div>
          <div className="text-white font-black text-lg">
            Bench · {filledCount} / {bench.length}
          </div>
        </div>
        <button onClick={() => dispatch({ type: 'BACK' })} className="text-slate-500 hover:text-white text-sm">← Back</button>
      </div>

      <p className="text-slate-400 text-sm leading-snug">
        A tournament is six or seven matches. Pick a sub keeper and six outfield players —
        injuries, suspensions and dead-rubber rotations are coming.
      </p>

      {/* Bench slots */}
      <div className="grid grid-cols-4 gap-2">
        {bench.map((p, i) => (
          <button
            key={i}
            onClick={() => dispatch({ type: 'SET_BENCH_SLOT', slotIndex: i })}
            className={`rounded-xl border px-1.5 py-2.5 text-center transition-all ${
              i === benchIndex
                ? 'border-amber-400 bg-amber-400/10'
                : p ? 'border-white/20 bg-white/5' : 'border-dashed border-white/15 bg-transparent'
            }`}
          >
            <div className="text-[9px] text-slate-500 font-bold tracking-wider">{SLOT_LABELS[i]}</div>
            <div className="text-white text-[11px] font-bold leading-tight mt-1 truncate">
              {p ? displaySurname(p.name) : '—'}
            </div>
            {p && <div className="text-amber-400 text-[10px] font-black">{p.ratingAtYear}</div>}
          </button>
        ))}
      </div>

      {/* Active slot indicator */}
      <div className="flex items-center justify-between">
        <div className="text-sm">
          <span className="text-slate-400">Filling: </span>
          <span className="text-white font-bold">{SLOT_LABELS[benchIndex]}</span>
          {current && <span className="text-slate-500"> — currently {current.name}</span>}
        </div>
        {current && (
          <button
            onClick={() => dispatch({ type: 'REMOVE_BENCH', slotIndex: benchIndex })}
            className="text-red-400 hover:text-red-300 text-xs font-semibold"
          >
            ✕ Remove
          </button>
        )}
      </div>

      {/* Pool */}
      <div className="flex flex-col gap-2">
        {pool.slice(0, 40).map(player => (
          <PlayerCard
            key={player.id}
            player={player}
            onClick={() => dispatch({ type: 'PICK_BENCH', player, slotIndex: benchIndex })}
            showAge={mode === 'manager'}
          />
        ))}
      </div>

      {/* Continue */}
      <div className="fixed bottom-4 left-4 right-4 z-30">
        <button
          onClick={() => dispatch({ type: 'CONFIRM_BENCH' })}
          className="w-full bg-yellow-400 text-slate-900 font-black text-lg py-4 rounded-2xl active:scale-95 transition-all shadow-2xl"
        >
          {filledCount === bench.length ? 'Bench locked — Pick your manager →' : `Continue with ${filledCount} sub${filledCount === 1 ? '' : 's'} →`}
        </button>
      </div>
    </div>
  )
}
