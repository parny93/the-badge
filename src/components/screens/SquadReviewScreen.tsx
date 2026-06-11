'use client'
import { Formation, GameAction, GameMode, RatedPlayer } from '@/types'
import FormationDisplay from '@/components/ui/FormationDisplay'
import ChemistryPanel from '@/components/ui/ChemistryPanel'
import { calculateTeamStrength } from '@/lib/teamStrength'

interface Props {
  mode: GameMode
  squadYear: number
  formation: Formation
  squad: (RatedPlayer | null)[]
  captainId: string | null
  dispatch: React.Dispatch<GameAction>
}

export default function SquadReviewScreen({ mode, squadYear, formation, squad, captainId, dispatch }: Props) {
  const strength = calculateTeamStrength(squad, formation, { captainId })
  const avgRating = strength.overall

  const ratingLabel =
    avgRating >= 88 ? 'World Class' :
    avgRating >= 83 ? 'Elite' :
    avgRating >= 78 ? 'Strong' :
    avgRating >= 72 ? 'Solid' :
    'Raw'

  return (
    <div className="min-h-screen px-4 py-6 pb-24 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-white">Your England XI</h2>
          <p className="text-slate-400 text-sm">
            {mode === 'manager' ? `${squadYear} squad` : mode === 'draft' ? 'Drafted XI' : 'All-Time XI'} · {formation}
          </p>
        </div>
        <button
          onClick={() => dispatch({ type: 'BACK' })}
          className="text-slate-500 hover:text-white text-sm transition-colors"
        >
          ← Back
        </button>
      </div>

      {/* Formation visual */}
      <FormationDisplay squad={squad} formation={formation} captainId={captainId} />

      {/* Team rating */}
      <div className="rounded-xl bg-white/5 border border-white/10 p-4 flex items-center justify-between">
        <div>
          <div className="text-slate-400 text-xs uppercase tracking-widest">Team Rating</div>
          <div className="text-white font-black text-3xl leading-none mt-0.5">{avgRating}</div>
        </div>
        <div className="text-right">
          <div className="text-white font-bold text-lg">{ratingLabel}</div>
          <div className="text-slate-500 text-xs mt-0.5">
            {avgRating >= 85 ? 'Strong favourites' :
             avgRating >= 78 ? 'Could go all the way' :
             'Underdogs — but stranger things have happened'}
          </div>
        </div>
      </div>

      {/* Attack / Midfield / Defence breakdown */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'ATT', val: strength.attack },
          { label: 'MID', val: strength.midfield },
          { label: 'DEF', val: strength.defense },
        ].map(phase => (
          <div key={phase.label} className="rounded-xl bg-white/5 border border-white/10 p-3 text-center">
            <div className="text-slate-500 text-xs tracking-widest">{phase.label}</div>
            <div className={`font-black text-2xl mt-0.5 ${
              phase.val >= 85 ? 'text-yellow-400' :
              phase.val >= 78 ? 'text-emerald-400' :
              phase.val >= 70 ? 'text-sky-400' : 'text-slate-400'
            }`}>{phase.val}</div>
          </div>
        ))}
      </div>

      {/* Chemistry — the tweak-to-fix feedback loop */}
      <ChemistryPanel report={strength.chemistry} />

      {/* Player list — tap a player to hand them the armband */}
      <div>
        <p className="text-slate-500 text-xs mb-2">
          👑 Tap a player to make him captain{captainId ? '' : ' — otherwise your highest-rated player leads'}
        </p>
        <div className="rounded-xl bg-white/5 border border-white/10 divide-y divide-white/5">
          {squad.map((player, i) => {
            if (!player) return null
            const isCaptain = player.id === captainId
            return (
              <button
                key={i}
                onClick={() => dispatch({ type: 'SET_CAPTAIN', playerId: player.id })}
                className={`w-full flex items-center justify-between px-3 py-2.5 text-left transition-colors ${
                  isCaptain ? 'bg-amber-400/10' : 'hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 w-8 shrink-0">{player.positions[0]}</span>
                  <span className="text-white text-sm font-medium">{player.name}</span>
                  {isCaptain && (
                    <span className="text-[10px] font-black bg-amber-400 text-slate-900 rounded px-1.5 py-0.5">C</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500">Age {player.ageAtYear}</span>
                  <span className={`font-bold text-sm ${
                    player.ratingAtYear >= 88 ? 'text-yellow-400' :
                    player.ratingAtYear >= 82 ? 'text-emerald-400' :
                    player.ratingAtYear >= 75 ? 'text-sky-400' :
                    'text-slate-400'
                  }`}>{player.ratingAtYear}</span>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Go button */}
      <div className="fixed bottom-4 left-4 right-4 z-30">
        <button
          onClick={() => dispatch({ type: 'CONFIRM_SQUAD' })}
          className="w-full bg-white text-slate-900 font-black text-lg py-4 rounded-2xl active:scale-95 transition-all shadow-2xl"
        >
          Pick Your Bench →
        </button>
      </div>
    </div>
  )
}
