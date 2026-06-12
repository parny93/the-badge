'use client'
import { DifficultyLevel, GameAction, GameMode, RatedPlayer } from '@/types'
import { penaltyRating } from '@/data/playerTags'
import { displaySurname } from '@/lib/names'
import { ratingStyle } from '@/lib/ratingColor'

interface Props {
  mode: GameMode
  squad: (RatedPlayer | null)[]
  penaltyTakers: string[]
  difficultyLevel: DifficultyLevel
  dispatch: React.Dispatch<GameAction>
}

const MAX_TAKERS = 5

export default function PenaltiesScreen({ mode, squad, penaltyTakers, difficultyLevel, dispatch }: Props) {
  // Pens are taken by the outfield XI (keepers stop them, they don't take them).
  const xi = (squad.filter(Boolean) as RatedPlayer[]).filter(p => p.positions[0] !== 'GK')
  // Ratings are a coach's read on who's ice-cold from twelve yards — only the
  // easy mode lets you see the numbers; otherwise you back your own judgement.
  const showRatings = difficultyLevel === 'easy'

  const order = penaltyTakers
  const rankOf = (id: string) => order.indexOf(id)

  const toggle = (id: string) => {
    const i = rankOf(id)
    if (i >= 0) {
      dispatch({ type: 'SET_PENALTY_TAKERS', takers: order.filter(x => x !== id) })
    } else if (order.length < MAX_TAKERS) {
      dispatch({ type: 'SET_PENALTY_TAKERS', takers: [...order, id] })
    }
  }

  const autoPick = () => {
    const best = [...xi].sort((a, b) => penaltyRating(b) - penaltyRating(a)).slice(0, MAX_TAKERS)
    dispatch({ type: 'SET_PENALTY_TAKERS', takers: best.map(p => p.id) })
  }

  const clear = () => dispatch({ type: 'SET_PENALTY_TAKERS', takers: [] })

  // List the chosen takers first (in order), then the rest of the XI.
  const chosen = order.map(id => xi.find(p => p.id === id)).filter(Boolean) as RatedPlayer[]
  const rest = xi.filter(p => rankOf(p.id) < 0).sort((a, b) => b.ratingAtYear - a.ratingAtYear)
  const listed = [...chosen, ...rest]

  return (
    <div className="min-h-screen px-4 py-6 pb-28 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-white">Penalty Takers</h2>
          <p className="text-slate-400 text-sm">
            {mode === 'manager' ? 'Manager Mode' : mode === 'draft' ? 'Drafted XI' : 'All-Time XI'} · set your shootout order
          </p>
        </div>
        <button
          onClick={() => dispatch({ type: 'BACK' })}
          className="text-slate-500 hover:text-white text-sm transition-colors"
        >
          ← Back
        </button>
      </div>

      <p className="text-slate-500 text-xs leading-snug">
        Tap up to five players in the order they&rsquo;ll step up. Your No. 1 takes the first kick.
        {showRatings
          ? ' Numbers show each man’s penalty rating.'
          : ' Penalty ratings are hidden — trust your gut (Easy Mode reveals them).'}
      </p>

      <div className="flex items-center gap-2">
        <button
          onClick={autoPick}
          className="flex-1 rounded-xl border border-amber-400/40 bg-amber-400/10 text-amber-200 font-bold text-sm py-2.5 active:scale-95 transition-all"
        >
          Auto-pick best five
        </button>
        {order.length > 0 && (
          <button
            onClick={clear}
            className="rounded-xl border border-white/10 text-slate-400 text-sm py-2.5 px-4 active:scale-95 transition-all"
          >
            Clear
          </button>
        )}
      </div>

      <div className="rounded-xl bg-white/5 border border-white/10 divide-y divide-white/5">
        {listed.map(player => {
          const rank = rankOf(player.id)
          const isChosen = rank >= 0
          const full = order.length >= MAX_TAKERS && !isChosen
          const pr = penaltyRating(player)
          const rs = ratingStyle(95, pr)  // colour the pen rating on its own scale
          return (
            <button
              key={player.id}
              onClick={() => toggle(player.id)}
              disabled={full}
              className={`w-full flex items-center justify-between px-3 py-2.5 text-left transition-colors ${
                isChosen ? 'bg-amber-400/10' : full ? 'opacity-40' : 'hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-black ${
                  isChosen ? 'bg-amber-400 text-slate-900' : 'bg-white/10 text-slate-500'
                }`}>
                  {isChosen ? rank + 1 : '·'}
                </span>
                <span className="text-xs text-slate-500 w-8 shrink-0">{player.positions[0]}</span>
                <span className="text-white text-sm font-medium truncate">{displaySurname(player.name)}</span>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                {showRatings && (
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider">
                    PEN <span className="font-black text-sm" style={{ color: rs.color, textShadow: rs.textShadow }}>{pr}</span>
                  </span>
                )}
                <span className="text-xs text-slate-500">{player.ratingAtYear} OVR</span>
              </div>
            </button>
          )
        })}
      </div>

      <p className="text-slate-600 text-xs">
        Leave it empty and your best takers step up automatically. Anyone sent off or injured in the match is skipped.
      </p>

      <div className="fixed bottom-4 left-4 right-4 z-30 max-w-md mx-auto">
        <button
          onClick={() => dispatch({ type: 'CONFIRM_PENALTIES' })}
          className="w-full bg-white text-slate-900 font-black text-lg py-4 rounded-2xl active:scale-95 transition-all shadow-2xl"
        >
          {mode === 'draft' || mode === 'alltime' ? 'Choose a Tournament →' : 'Enter the Tournament →'}
        </button>
      </div>
    </div>
  )
}
