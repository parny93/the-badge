'use client'
import { useMemo, useState } from 'react'
import { BENCH_SIZE, GameAction, GameMode, RatedPlayer } from '@/types'
import { getBenchPool } from '@/lib/playerPool'
import { displaySurname } from '@/lib/names'
import { ratingStyle } from '@/lib/ratingColor'
import { rand } from '@/lib/rng'

interface Props {
  mode: GameMode
  squadYear: number
  squad: (RatedPlayer | null)[]
  hardMode: boolean
  yearFrom: number
  yearTo: number
  dispatch: React.Dispatch<GameAction>
}

const PICK_COUNT = 3      // you choose this many...
const OFFER_COUNT = 5     // ...from this many candidates; the rest are random

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export default function BenchScreen({ mode, squadYear, squad, hardMode, yearFrom, yearTo, dispatch }: Props) {
  const takenIds = squad.filter(Boolean).map(p => p!.id)

  // The pools, era- and eligibility-filtered. Outfield candidates to choose
  // from; keepers (and spare outfielders) for the random auto-fill.
  const { offer, gkPool, fillPool } = useMemo(() => {
    const ranged = (players: RatedPlayer[]) => {
      if (mode === 'manager') return players
      const r = players.filter(p => {
        const y = Math.max(1950, p.peakYear)
        return y >= yearFrom && y <= yearTo
      })
      return r.length > 0 ? r : players
    }
    const opts = { year: squadYear, prime: mode !== 'manager', managerEligibility: mode === 'manager' }
    const outfield = ranged(getBenchPool({ ...opts, gk: false, exclude: takenIds }))
    const gks = ranged(getBenchPool({ ...opts, gk: true, exclude: takenIds }))
    const shuffled = shuffle(outfield)
    return {
      offer: shuffled.slice(0, OFFER_COUNT),
      gkPool: gks,
      fillPool: shuffled.slice(OFFER_COUNT),
    }
    // Rolled once per visit (seeded), so the offer is stable while choosing.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [squadYear, mode, yearFrom, yearTo, takenIds.join(',')])

  const [picked, setPicked] = useState<string[]>([])

  const toggle = (id: string) => {
    setPicked(prev =>
      prev.includes(id) ? prev.filter(x => x !== id)
      : prev.length < PICK_COUNT ? [...prev, id]
      : prev
    )
  }

  const confirm = () => {
    const chosen = offer.filter(p => picked.includes(p.id))
    // Auto-fill: one random sub keeper + random outfielders to complete a
    // BENCH_SIZE bench (slot 0 = GK). Your depth is down to luck too.
    const subGK = gkPool.length > 0 ? shuffle(gkPool)[0] : null
    const need = BENCH_SIZE - 1 - chosen.length
    const extras = shuffle(fillPool).slice(0, Math.max(0, need))
    const bench: (RatedPlayer | null)[] = [subGK, ...chosen, ...extras]
    while (bench.length < BENCH_SIZE) bench.push(null)
    dispatch({ type: 'SET_BENCH', bench: bench.slice(0, BENCH_SIZE) })
    dispatch({ type: 'CONFIRM_BENCH' })
  }

  return (
    <div className="min-h-screen px-4 py-5 pb-28 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-slate-400 text-xs uppercase tracking-widest">Tournament squad</div>
          <div className="text-white font-black text-lg">Pick your bench</div>
        </div>
        <button onClick={() => dispatch({ type: 'BACK' })} className="text-slate-500 hover:text-white text-sm">← Back</button>
      </div>

      <p className="text-slate-400 text-sm leading-snug">
        Choose <span className="text-white font-bold">{PICK_COUNT}</span> from these{' '}
        <span className="text-white font-bold">{offer.length}</span> — the rest of the bench (and a
        sub keeper) is dealt to you at random. Depth is luck too.
      </p>

      <div className="flex flex-col gap-2">
        {offer.map(p => {
          const on = picked.includes(p.id)
          const rs = ratingStyle(p.peakRating, p.ratingAtYear)
          return (
            <button
              key={p.id}
              onClick={() => toggle(p.id)}
              className={`flex items-center justify-between rounded-xl border-2 p-3.5 text-left transition-all ${
                on ? 'border-amber-400 bg-amber-400/10' : 'border-white/10 bg-white/5 hover:border-white/25 active:scale-95'
              }`}
            >
              <div>
                <div className="text-white font-bold text-base leading-tight">{p.name}</div>
                <div className="text-xs text-slate-400 mt-0.5">{p.positions.join(' / ')}</div>
              </div>
              <div className="flex items-center gap-3">
                {hardMode ? (
                  <div className="text-right">
                    <div className="text-[9px] text-slate-500 uppercase tracking-widest leading-none">Era</div>
                    <div className="text-lg font-black text-amber-400 leading-tight">&rsquo;{String(p.peakYear).slice(2)}</div>
                  </div>
                ) : (
                  <span className="text-2xl font-black" style={{ color: rs.color, textShadow: rs.textShadow }}>
                    {p.ratingAtYear}
                  </span>
                )}
                <span className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-black ${
                  on ? 'border-amber-400 bg-amber-400 text-slate-900' : 'border-white/25 text-transparent'
                }`}>✓</span>
              </div>
            </button>
          )
        })}
      </div>

      <div className="fixed bottom-4 left-4 right-4 z-30 max-w-md mx-auto">
        <button
          onClick={confirm}
          disabled={picked.length !== PICK_COUNT}
          className="w-full bg-amber-400 text-slate-900 font-black text-lg py-4 rounded-2xl active:scale-95 transition-all shadow-2xl disabled:opacity-50"
        >
          {picked.length === PICK_COUNT
            ? 'Deal the rest of the bench →'
            : `Pick ${PICK_COUNT - picked.length} more`}
        </button>
      </div>
    </div>
  )
}
