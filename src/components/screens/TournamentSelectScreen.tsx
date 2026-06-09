'use client'
import { GameAction, RatedPlayer, Formation } from '@/types'
import { WORLD_CUPS } from '@/data/worldCups'
import { calculateTeamStrength } from '@/lib/teamStrength'

interface Props {
  squad: (RatedPlayer | null)[]
  formation: Formation
  dispatch: React.Dispatch<GameAction>
}

function era(year: number) {
  if (year < 1970) return 'from-yellow-900/40'
  if (year < 1980) return 'from-orange-900/40'
  if (year < 1990) return 'from-red-900/40'
  if (year < 2000) return 'from-rose-900/40'
  if (year < 2010) return 'from-purple-900/40'
  if (year < 2020) return 'from-blue-900/40'
  return 'from-teal-900/40'
}

export default function TournamentSelectScreen({ squad, formation, dispatch }: Props) {
  const strength = calculateTeamStrength(squad, formation)

  return (
    <div className="min-h-screen px-4 py-6 pb-10">
      <h2 className="text-2xl font-black text-white mb-1">Enter a World Cup</h2>
      <p className="text-slate-400 text-sm mb-1">Take your squad to any tournament in history.</p>
      <p className="text-slate-500 text-xs mb-5">
        Your XI: <span className="text-white font-bold">{strength.overall} OVR</span> · the further back you go,
        the more legendary the opponents.
      </p>

      <div className="grid grid-cols-2 gap-3">
        {WORLD_CUPS.map(wc => (
          <button
            key={wc.year}
            onClick={() => dispatch({ type: 'SELECT_TOURNAMENT', worldCup: wc })}
            className={`relative rounded-2xl p-4 text-left bg-gradient-to-br ${era(wc.year)} to-white/5 border border-white/10 hover:border-white/30 active:scale-95 transition-all`}
          >
            <div className="text-3xl font-black text-white leading-none">{wc.year}</div>
            <div className="text-xs text-slate-400 mt-1 leading-snug">{wc.host.split(' / ')[0]}</div>
            <div className="text-xs text-slate-500 mt-1">
              🏆 {wc.historicalWinner === 'TBD' ? 'Up for grabs' : wc.historicalWinner}
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
