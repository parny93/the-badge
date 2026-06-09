'use client'
import { GameAction, RatedPlayer, Formation, WorldCupData } from '@/types'
import { WORLD_CUPS } from '@/data/worldCups'
import { EUROS } from '@/data/euros'
import { calculateTeamStrength } from '@/lib/teamStrength'

interface Props {
  squad: (RatedPlayer | null)[]
  formation: Formation
  dispatch: React.Dispatch<GameAction>
}

function eraGradient(year: number) {
  if (year < 1970) return 'from-yellow-900/40'
  if (year < 1980) return 'from-orange-900/40'
  if (year < 1990) return 'from-red-900/40'
  if (year < 2000) return 'from-rose-900/40'
  if (year < 2010) return 'from-purple-900/40'
  if (year < 2020) return 'from-blue-900/40'
  return 'from-teal-900/40'
}

function TournamentCard({ t, dispatch }: { t: WorldCupData; dispatch: React.Dispatch<GameAction> }) {
  const isEuro = t.competition === 'Euro'
  return (
    <button
      onClick={() => dispatch({ type: 'SELECT_TOURNAMENT', worldCup: t })}
      className={`relative rounded-2xl p-4 text-left bg-gradient-to-br ${eraGradient(t.year)} to-white/5 border border-white/10 hover:border-white/30 active:scale-95 transition-all`}
    >
      <div className="text-3xl font-black text-white leading-none">{t.year}</div>
      <div className="text-xs text-slate-400 mt-1 leading-snug">{t.host.split(' / ')[0]}</div>
      <div className="text-xs text-slate-500 mt-1">
        {isEuro ? '🏅' : '🏆'} {t.historicalWinner === 'TBD' ? 'Up for grabs' : t.historicalWinner}
      </div>
      {!t.englandQualified && (
        <div className="absolute top-2 right-2 text-[9px] font-bold text-amber-400/70 bg-amber-400/10 rounded px-1.5 py-0.5 leading-none">
          WILDCARD
        </div>
      )}
    </button>
  )
}

export default function TournamentSelectScreen({ squad, formation, dispatch }: Props) {
  const strength = calculateTeamStrength(squad, formation)

  return (
    <div className="min-h-screen px-4 py-6 pb-10">
      <h2 className="text-2xl font-black text-white mb-1">Enter a Tournament</h2>
      <p className="text-slate-400 text-sm mb-1">Take your squad to any World Cup or Euro in history.</p>
      <p className="text-slate-500 text-xs mb-6">
        Your XI: <span className="text-white font-bold">{strength.overall} OVR</span> · the further back you go,
        the more legendary the opponents.
      </p>

      {/* ── World Cups ─────────────────────────────────────────────────────── */}
      <div className="mb-2 flex items-center gap-2">
        <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">🏆 World Cups</span>
        <span className="text-xs text-slate-600">1966 – 2026</span>
      </div>
      <div className="grid grid-cols-2 gap-3 mb-8">
        {WORLD_CUPS.map(wc => (
          <TournamentCard key={`wc-${wc.year}`} t={wc} dispatch={dispatch} />
        ))}
      </div>

      {/* ── European Championships ──────────────────────────────────────────── */}
      <div className="mb-2 flex items-center gap-2">
        <span className="text-xs font-bold text-sky-400 uppercase tracking-widest">🏅 European Championships</span>
        <span className="text-xs text-slate-600">1960 – 2024</span>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {EUROS.map(euro => (
          <TournamentCard key={`euro-${euro.year}`} t={euro} dispatch={dispatch} />
        ))}
      </div>
    </div>
  )
}
