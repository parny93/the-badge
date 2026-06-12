'use client'
import { useState } from 'react'
import { DifficultyLevel, GameAction } from '@/types'
import { ERA_MIN, ERA_MAX } from '@/lib/gameReducer'

interface Props {
  yearFrom: number
  yearTo: number
  difficultyLevel: DifficultyLevel
  realFixtures: boolean
  dispatch: React.Dispatch<GameAction>
}

const DIFFICULTIES: {
  level: DifficultyLevel
  title: string
  desc: string
  accent: string
}[] = [
  {
    level: 'easy',
    title: 'Easy',
    desc: '3 re-spins. Spin the wheel on peak ratings or by era — your choice each spin.',
    accent: 'border-emerald-400 bg-emerald-400/10',
  },
  {
    level: 'normal',
    title: 'Normal',
    desc: '1 re-spin. Peak ratings or era wheel — choose before each spin.',
    accent: 'border-sky-400 bg-sky-400/10',
  },
  {
    level: 'hard',
    title: 'Hard',
    desc: 'No re-spins. Era wheel only — ratings hidden everywhere until squad review, and a Hard Mode badge on your card.',
    accent: 'border-red-400 bg-red-400/10',
  },
]

// Quick presets for the eras people actually argue about.
const PRESETS: { label: string; from: number; to: number }[] = [
  { label: 'All eras', from: ERA_MIN, to: ERA_MAX },
  { label: 'Pre-Premier League', from: ERA_MIN, to: 1991 },
  { label: '90s & 00s', from: 1990, to: 2009 },
  { label: 'Modern', from: 2010, to: ERA_MAX },
]

export default function SettingsScreen({ yearFrom, yearTo, difficultyLevel, realFixtures, dispatch }: Props) {
  const [from, setFrom] = useState(yearFrom)
  const [to, setTo] = useState(yearTo)
  const [level, setLevel] = useState<DifficultyLevel>(difficultyLevel)
  const [real, setReal] = useState(realFixtures)

  return (
    <div className="min-h-screen px-4 py-6 pb-28">
      <h2 className="text-2xl font-black text-white mb-1">Set Up Your Game</h2>
      <p className="text-slate-400 text-sm mb-6">
        Pick a difficulty and an era, then choose how you want to build.
      </p>

      {/* ── Difficulty ─────────────────────────────────────────────────────── */}
      <div className="rounded-2xl bg-white/5 border border-white/10 p-4 mb-4">
        <div className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-3">Difficulty</div>
        <div className="flex flex-col gap-2">
          {DIFFICULTIES.map(d => (
            <button
              key={d.level}
              onClick={() => setLevel(d.level)}
              className={`rounded-xl border-2 p-3.5 text-left transition-all ${
                level === d.level ? d.accent : 'border-white/10 bg-white/5 hover:border-white/25'
              }`}
            >
              <div className="text-white font-bold text-sm">{d.title}</div>
              <div className="text-slate-400 text-xs leading-snug mt-0.5">{d.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* ── Era range ──────────────────────────────────────────────────────── */}
      <div className="rounded-2xl bg-white/5 border border-white/10 p-4 mb-4">
        <div className="flex items-center justify-between mb-1">
          <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Era range</span>
          <span className="text-white text-base font-black tabular-nums">{from} – {to}</span>
        </div>
        <p className="text-slate-500 text-xs mb-3 leading-snug">
          Only players whose peak falls in this window are in your pool — across every mode.
        </p>

        {/* Dual-handle slider — drag either end of the one track */}
        <div className="relative h-7 mb-3">
          <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 h-1.5 rounded-full bg-white/10" />
          <div
            className="absolute top-1/2 -translate-y-1/2 h-1.5 rounded-full bg-amber-400/70"
            style={{
              left: `${((from - ERA_MIN) / (ERA_MAX - ERA_MIN)) * 100}%`,
              right: `${100 - ((to - ERA_MIN) / (ERA_MAX - ERA_MIN)) * 100}%`,
            }}
          />
          <input
            type="range"
            aria-label="Era range from"
            min={ERA_MIN}
            max={ERA_MAX}
            value={from}
            onChange={e => setFrom(Math.min(Number(e.target.value), to))}
            className="dual-range"
            // When both handles sit at the right edge, the From thumb must win
            // the click so the range can be reopened.
            style={{ zIndex: from > (ERA_MIN + ERA_MAX) / 2 ? 30 : 20 }}
          />
          <input
            type="range"
            aria-label="Era range to"
            min={ERA_MIN}
            max={ERA_MAX}
            value={to}
            onChange={e => setTo(Math.max(Number(e.target.value), from))}
            className="dual-range"
            style={{ zIndex: 25 }}
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

      {/* ── Real fixtures ──────────────────────────────────────────────────── */}
      <button
        onClick={() => setReal(r => !r)}
        className={`rounded-2xl border-2 p-4 text-left transition-all mb-4 flex items-start gap-3 ${
          real ? 'border-sky-400 bg-sky-400/10' : 'border-white/10 bg-white/5 hover:border-white/25'
        }`}
      >
        <span className={`mt-0.5 shrink-0 w-10 h-6 rounded-full transition-all flex items-center px-0.5 ${
          real ? 'bg-sky-400 justify-end' : 'bg-white/15 justify-start'
        }`}>
          <span className="w-5 h-5 rounded-full bg-white shadow" />
        </span>
        <div>
          <div className="text-white font-bold text-sm">Real fixtures</div>
          <div className="text-slate-400 text-xs leading-snug mt-0.5">
            Face England&rsquo;s actual knockout opponents from each tournament — France in the
            2022 quarter-final, Italy in the Euro 2020 final, Spain in 2024. Get far enough and
            re-write the moments that hurt. (Groups are already the real draws.)
          </div>
        </div>
      </button>

      <div className="fixed bottom-4 left-4 right-4 z-30 max-w-md mx-auto">
        <button
          onClick={() => dispatch({ type: 'SET_SETTINGS', yearFrom: from, yearTo: to, level, realFixtures: real })}
          className="w-full bg-white text-slate-900 font-black text-lg py-4 rounded-2xl active:scale-95 transition-all shadow-2xl"
        >
          Choose How You Build →
        </button>
      </div>
    </div>
  )
}
