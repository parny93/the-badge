'use client'
import { useState } from 'react'
import { GameAction } from '@/types'
import { ERA_MIN, ERA_MAX } from '@/lib/gameReducer'

interface Props {
  yearFrom: number
  yearTo: number
  hardMode: boolean
  dispatch: React.Dispatch<GameAction>
}

// Quick presets for the eras people actually argue about.
const PRESETS: { label: string; from: number; to: number }[] = [
  { label: 'All eras', from: ERA_MIN, to: ERA_MAX },
  { label: 'Pre-Premier League', from: ERA_MIN, to: 1991 },
  { label: '90s & 00s', from: 1990, to: 2009 },
  { label: 'Modern', from: 2010, to: ERA_MAX },
]

export default function SettingsScreen({ yearFrom, yearTo, hardMode, dispatch }: Props) {
  const [from, setFrom] = useState(yearFrom)
  const [to, setTo] = useState(yearTo)
  const [hard, setHard] = useState(hardMode)

  return (
    <div className="min-h-screen px-4 py-6 pb-28">
      <h2 className="text-2xl font-black text-white mb-1">Set Up Your Game</h2>
      <p className="text-slate-400 text-sm mb-6">
        Two choices, then pick how you want to build.
      </p>

      {/* ── Era range ──────────────────────────────────────────────────────── */}
      <div className="rounded-2xl bg-white/5 border border-white/10 p-4 mb-4">
        <div className="flex items-center justify-between mb-1">
          <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Era range</span>
          <span className="text-white text-base font-black tabular-nums">{from} – {to}</span>
        </div>
        <p className="text-slate-500 text-xs mb-3 leading-snug">
          Only players whose peak falls in this window are in your pool — across every mode.
        </p>

        <div className="flex items-center gap-2 mb-2">
          <span className="text-slate-500 text-[10px] w-8 shrink-0">From</span>
          <input
            type="range"
            min={ERA_MIN}
            max={ERA_MAX}
            value={from}
            onChange={e => setFrom(Math.min(Number(e.target.value), to))}
            className="w-full accent-amber-400"
          />
        </div>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-slate-500 text-[10px] w-8 shrink-0">To</span>
          <input
            type="range"
            min={ERA_MIN}
            max={ERA_MAX}
            value={to}
            onChange={e => setTo(Math.max(Number(e.target.value), from))}
            className="w-full accent-amber-400"
          />
        </div>

        <div className="flex gap-1.5 flex-wrap">
          {PRESETS.map(p => {
            const active = from === p.from && to === p.to
            return (
              <button
                key={p.label}
                onClick={() => { setFrom(p.from); setTo(p.to) }}
                className={`text-xs font-semibold rounded-full px-3 py-1.5 transition-all ${
                  active
                    ? 'bg-amber-400 text-slate-900'
                    : 'bg-white/10 text-slate-300 hover:bg-white/15'
                }`}
              >
                {p.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Difficulty ─────────────────────────────────────────────────────── */}
      <div className="rounded-2xl bg-white/5 border border-white/10 p-4 mb-4">
        <div className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-3">Difficulty</div>
        <div className="flex flex-col gap-2">
          <button
            onClick={() => setHard(false)}
            className={`rounded-xl border-2 p-3.5 text-left transition-all ${
              !hard ? 'border-emerald-400 bg-emerald-400/10' : 'border-white/10 bg-white/5 hover:border-white/25'
            }`}
          >
            <div className="text-white font-bold text-sm">Classic</div>
            <div className="text-slate-400 text-xs leading-snug mt-0.5">
              Ratings and attributes visible while you build. Three picks per spin in Draft.
            </div>
          </button>
          <button
            onClick={() => setHard(true)}
            className={`rounded-xl border-2 p-3.5 text-left transition-all ${
              hard ? 'border-red-400 bg-red-400/10' : 'border-white/10 bg-white/5 hover:border-white/25'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="text-white font-bold text-sm">Hard</span>
              <span className="text-[9px] font-bold text-amber-400/70 bg-amber-400/10 rounded px-1.5 py-0.5">
                PRO · free while in beta
              </span>
            </div>
            <div className="text-slate-400 text-xs leading-snug mt-0.5">
              Ratings hidden in every mode — pick on era and instinct. Four picks per spin in
              Draft, the truth revealed at squad review, and a Hard Mode badge on your card.
            </div>
          </button>
        </div>
      </div>

      <div className="fixed bottom-4 left-4 right-4 z-30 max-w-md mx-auto">
        <button
          onClick={() => dispatch({ type: 'SET_SETTINGS', yearFrom: from, yearTo: to, hard })}
          className="w-full bg-white text-slate-900 font-black text-lg py-4 rounded-2xl active:scale-95 transition-all shadow-2xl"
        >
          Choose How You Build →
        </button>
      </div>
    </div>
  )
}
