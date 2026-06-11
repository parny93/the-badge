'use client'
import { GameAction, GameMode } from '@/types'

interface Props { dispatch: React.Dispatch<GameAction> }

const MODES: { id: GameMode; title: string; tag: string; desc: string; accent: string }[] = [
  {
    id: 'alltime',
    title: 'All-Time XI',
    tag: 'Free pick · Any era',
    desc: 'Build your perfect England XI from any era — every player at their absolute peak. Your dream team, your call.',
    accent: 'from-yellow-500/20',
  },
  {
    id: 'manager',
    title: 'Manager Mode',
    tag: 'Free pick · One year',
    desc: 'Step into a single year, from 1950 to today. Pick from the players actually available — rated exactly as they were. Can you fix the Golden Generation?',
    accent: 'from-sky-500/20',
  },
  {
    id: 'draft',
    title: 'All-Time Draft',
    tag: 'Spin the wheel · Chaos',
    desc: 'Spin for your squad. Take what you\'re given and make it work. The hardest, funniest, most shareable way to play.',
    accent: 'from-fuchsia-500/20',
  },
]

export default function ModeSelectScreen({ dispatch }: Props) {
  return (
    <div className="min-h-screen px-4 py-6 pb-10">
      <h2 className="text-2xl font-black text-white mb-1">Choose How You Build</h2>
      <p className="text-slate-400 text-sm mb-5">Three ways to assemble your England squad.</p>

      <div className="flex flex-col gap-3">
        {MODES.map(mode => (
          <button
            key={mode.id}
            onClick={() => dispatch({ type: 'SELECT_MODE', mode: mode.id })}
            className={`relative rounded-2xl p-4 text-left bg-gradient-to-br ${mode.accent} to-white/5 border border-white/10 hover:border-white/30 active:scale-[0.98] transition-all`}
          >
            <div className="mb-1">
              <div className="font-black text-white text-lg leading-none">{mode.title}</div>
              <div className="text-xs text-slate-400 mt-1">{mode.tag}</div>
            </div>
            <p className="text-slate-300 text-sm leading-snug mt-2">{mode.desc}</p>
          </button>
        ))}
      </div>
    </div>
  )
}
