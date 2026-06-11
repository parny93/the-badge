'use client'
import { GameAction } from '@/types'
import { MANAGERS } from '@/data/managers'

interface Props {
  dispatch: React.Dispatch<GameAction>
}

export default function ManagerScreen({ dispatch }: Props) {
  return (
    <div className="min-h-screen px-4 py-6 pb-10">
      <h2 className="text-2xl font-black text-white mb-1">Pick Your Manager</h2>
      <p className="text-slate-400 text-sm mb-5">
        Every gaffer brings his own ideas. Some of them even work.
      </p>

      <div className="flex flex-col gap-2.5">
        {MANAGERS.map(m => {
          const buffs: string[] = []
          if (m.attackMod > 0) buffs.push(`+${m.attackMod} ATT`)
          if (m.attackMod < 0) buffs.push(`${m.attackMod} ATT`)
          if (m.defenseMod > 0) buffs.push(`+${m.defenseMod} DEF`)
          if (m.defenseMod < 0) buffs.push(`${m.defenseMod} DEF`)
          if (m.chemBonus > 0) buffs.push(`+${m.chemBonus} CHEM`)
          if (m.knockoutBoost) buffs.push('KO boost')
          if (m.penaltyBoost) buffs.push('Pens boost')
          if (m.starBias) buffs.push('Star bias')

          return (
            <button
              key={m.id}
              onClick={() => dispatch({ type: 'SELECT_MANAGER', managerId: m.id })}
              className="rounded-xl p-3.5 text-left border border-white/10 bg-white/5 hover:border-white/30 active:scale-[0.98] transition-all"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-white font-bold text-base">{m.name}</span>
                <span className="text-slate-500 text-xs shrink-0">{m.tenure}</span>
              </div>
              <div className="text-slate-400 text-xs leading-snug mt-1">{m.tactic}</div>
              {buffs.length > 0 && (
                <div className="flex gap-1.5 flex-wrap mt-2">
                  {buffs.map(b => (
                    <span
                      key={b}
                      className={`text-[10px] font-bold rounded px-1.5 py-0.5 ${
                        b.startsWith('-')
                          ? 'bg-red-500/15 text-red-300'
                          : 'bg-emerald-500/15 text-emerald-300'
                      }`}
                    >
                      {b}
                    </span>
                  ))}
                </div>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
