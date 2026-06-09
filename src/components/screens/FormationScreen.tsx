'use client'
import { Formation, GameAction } from '@/types'

interface Props { dispatch: React.Dispatch<GameAction> }

const FORMATIONS: { id: Formation; shape: string; desc: string }[] = [
  { id: '4-3-3', shape: '4-3-3', desc: 'Attacking, wide, high press' },
  { id: '4-4-2', shape: '4-4-2', desc: 'Classic, balanced, two up front' },
  { id: '4-2-3-1', shape: '4-2-3-1', desc: 'Modern, solid base, creative CAM' },
  { id: '3-5-2', shape: '3-5-2', desc: 'Wing-backs, two strikers, dominant midfield' },
  { id: '5-3-2', shape: '5-3-2', desc: 'Defensive solidity, on the counter' },
]

export default function FormationScreen({ dispatch }: Props) {
  return (
    <div className="min-h-screen px-4 py-6 pb-10">
      <h2 className="text-2xl font-black text-white mb-1">Pick Your Formation</h2>
      <p className="text-slate-400 text-sm mb-5">This determines which 11 positions you fill.</p>

      <div className="flex flex-col gap-3">
        {FORMATIONS.map(f => (
          <button
            key={f.id}
            onClick={() => dispatch({ type: 'SELECT_FORMATION', formation: f.id })}
            className="rounded-2xl p-4 text-left border border-white/10 bg-white/5 hover:border-white/30 active:scale-95 transition-all flex items-center gap-4"
          >
            <span className="font-black text-xl text-white w-24 shrink-0 whitespace-nowrap tabular-nums">{f.shape}</span>
            <span className="text-slate-300 text-sm">{f.desc}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
