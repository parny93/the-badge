'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import GameShell from '@/components/GameShell'
import {
  DailyConfig, DailyResult, EXIT_LABEL, getDailyConfig,
  loadDailyResults, personalBests,
} from '@/lib/daily'
import { LifetimeStats, loadLifetimeStats } from '@/lib/lifetimeStats'
import { getLore } from '@/data/tournamentLore'

export default function DailyPage() {
  const [config, setConfig] = useState<DailyConfig | null>(null)
  const [results, setResults] = useState<Record<string, DailyResult>>({})
  const [lifetime, setLifetime] = useState<LifetimeStats | null>(null)
  const [playing, setPlaying] = useState(false)

  // Config + results are read on the client so the UTC date and localStorage
  // are the player's own (avoids SSR hydration mismatch).
  useEffect(() => {
    setConfig(getDailyConfig())
    setResults(loadDailyResults())
    setLifetime(loadLifetimeStats())
  }, [playing])

  if (playing && config) return <GameShell daily={config} />

  if (!config) {
    return (
      <main className="max-w-md mx-auto min-h-screen bg-[#0c1420] text-white flex items-center justify-center">
        <div className="text-4xl animate-spin" style={{ animationDuration: '1.5s' }}>⚽</div>
      </main>
    )
  }

  const todays = results[config.date]
  const bests = personalBests(results)
  const lore = getLore(config.worldCup.year)
  const compLabel = config.worldCup.competition === 'Euro' ? 'European Championship' : 'World Cup'
  const history = Object.values(results).sort((a, b) => b.date.localeCompare(a.date))

  return (
    <main className="max-w-md mx-auto min-h-screen bg-[#0c1420] text-white px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <Link href="/" className="text-slate-400 hover:text-white text-sm">← The Badge</Link>
        <span className="text-slate-600 text-xs">resets 00:00 UTC</span>
      </div>

      <div className="text-center mb-6">
        <div className="text-sky-300 text-xs font-semibold tracking-[0.25em] uppercase mb-2">
          📅 Daily Challenge
        </div>
        <h1 className="text-3xl font-black leading-tight">{config.date}</h1>
        <p className="text-slate-400 text-sm mt-2">
          Everyone in the world gets the same wheel today. One run counts.
        </p>
      </div>

      {/* Today's brief */}
      <div className="rounded-2xl bg-white/5 border border-white/10 p-4 mb-4">
        <div className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-2">
          Today&rsquo;s assignment
        </div>
        <div className="text-white font-black text-xl leading-tight">
          {config.worldCup.year} {compLabel}
        </div>
        {lore?.nickname && (
          <div className="text-amber-300/80 text-sm italic mt-0.5">{lore.nickname}</div>
        )}
        <div className="text-slate-400 text-sm mt-1">
          📍 {config.worldCup.host.split(' / ')[0]} · Formation locked: <span className="text-white font-bold">{config.formation}</span> · Draft wheel
        </div>
      </div>

      {/* Play / result */}
      {todays ? (
        <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/30 p-4 text-center mb-6">
          <div className="text-emerald-300 font-black text-lg">
            {EXIT_LABEL[todays.exit] ?? todays.exit}
          </div>
          <div className="text-slate-400 text-sm mt-1">
            CHEM {todays.chem} · OVR {todays.ovr} · Eras {todays.era}
            {todays.wonPens > 0 && ` · 🎯 won on pens`}
            {todays.lostPens > 0 && ` · 🎯 out on pens`}
          </div>
          <Link
            href={`/run/${todays.runId}`}
            className="inline-block mt-3 bg-white/10 text-white font-bold text-sm px-5 py-2.5 rounded-xl active:scale-95 transition-all"
          >
            View share card →
          </Link>
          <p className="text-slate-600 text-xs mt-3">Come back tomorrow for a new wheel.</p>
        </div>
      ) : (
        <button
          onClick={() => setPlaying(true)}
          className="w-full bg-sky-400 text-slate-900 font-black text-lg py-4 rounded-2xl active:scale-95 transition-all shadow-[0_0_32px_rgba(56,189,248,0.35)] mb-6"
        >
          Play today&rsquo;s challenge →
        </button>
      )}

      {/* Personal leaderboard */}
      <div className="mb-2 text-xs font-bold text-slate-400 uppercase tracking-widest">Your record</div>
      <div className="grid grid-cols-2 gap-2 mb-6">
        <div className="rounded-xl bg-white/5 border border-white/10 p-3">
          <div className="text-slate-500 text-xs">Best result</div>
          <div className="text-white font-black text-lg leading-tight">
            {bests.bestExit ? (EXIT_LABEL[bests.bestExit] ?? bests.bestExit) : '—'}
          </div>
        </div>
        <div className="rounded-xl bg-white/5 border border-white/10 p-3">
          <div className="text-slate-500 text-xs">Best chemistry</div>
          <div className="text-amber-400 font-black text-lg leading-tight">{bests.bestChem || '—'}</div>
        </div>
        <div className="rounded-xl bg-white/5 border border-white/10 p-3">
          <div className="text-slate-500 text-xs">Widest era spread</div>
          <div className="text-white font-black text-lg leading-tight">
            {bests.bestEraSpan ? `${bests.bestEraSpan} years` : '—'}
          </div>
        </div>
        <div className="rounded-xl bg-white/5 border border-white/10 p-3">
          <div className="text-slate-500 text-xs">Shootouts won — all time</div>
          <div className="text-white font-black text-lg leading-tight">
            🎯 {lifetime?.shootoutsWon ?? 0}
            {lifetime && lifetime.shootoutsLost > 0 && (
              <span className="text-slate-500 text-xs font-normal"> · {lifetime.shootoutsLost} lost</span>
            )}
          </div>
        </div>
      </div>
      <p className="text-slate-600 text-xs mb-6">
        Global leaderboard coming soon — for now, your record lives on this device.
      </p>

      {/* History */}
      {history.length > 0 && (
        <>
          <div className="mb-2 text-xs font-bold text-slate-400 uppercase tracking-widest">History</div>
          <div className="rounded-xl bg-white/5 border border-white/10 divide-y divide-white/5">
            {history.map(r => (
              <Link
                key={r.date}
                href={`/run/${r.runId}`}
                className="flex items-center justify-between px-3 py-2.5 hover:bg-white/5"
              >
                <span className="text-slate-400 text-xs tabular-nums">{r.date}</span>
                <span className="text-white text-sm font-semibold">
                  {EXIT_LABEL[r.exit] ?? r.exit}
                  {r.hard && ' 🔥'}
                  {r.wonPens > 0 && ' 🎯'}
                </span>
                <span className="text-slate-500 text-xs">CHEM {r.chem}</span>
              </Link>
            ))}
          </div>
        </>
      )}
    </main>
  )
}
