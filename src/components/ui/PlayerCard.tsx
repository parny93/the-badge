'use client'
import { RatedPlayer } from '@/types'
import { TREND_ARROW, TREND_COLOUR } from '@/lib/agingCurve'

interface Props {
  player: RatedPlayer
  selected?: boolean
  onClick?: () => void
  showAge?: boolean
}

export default function PlayerCard({ player, selected, onClick, showAge = true }: Props) {
  const arrow = TREND_ARROW[player.trend]
  const colour = TREND_COLOUR[player.trend]

  const ratingColour =
    player.ratingAtYear >= 88 ? 'text-yellow-400' :
    player.ratingAtYear >= 82 ? 'text-emerald-400' :
    player.ratingAtYear >= 75 ? 'text-sky-400' :
    'text-slate-400'

  return (
    <button
      onClick={onClick}
      disabled={!onClick}
      className={[
        'w-full rounded-xl p-3 text-left transition-all duration-150',
        'border-2',
        selected
          ? 'border-yellow-400 bg-yellow-400/10 scale-[1.02]'
          : 'border-white/10 bg-white/5 hover:border-white/30 hover:bg-white/10 active:scale-95',
      ].join(' ')}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="font-bold text-white truncate leading-tight">{player.name}</div>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-xs text-slate-400 bg-white/10 rounded px-1.5 py-0.5">
              {player.positions[0]}
            </span>
            {showAge && (
              <span className="text-xs text-slate-400">
                Age {player.ageAtYear}
              </span>
            )}
            <span className={`text-xs font-medium ${colour}`}>
              {arrow}
            </span>
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <div className={`text-2xl font-black leading-none ${ratingColour}`}>
            {player.ratingAtYear}
          </div>
          <div className="text-xs text-slate-500 mt-0.5">{player.peakRating} peak</div>
        </div>
      </div>

      {/* Mini attributes */}
      <div className="mt-2 grid grid-cols-3 gap-1">
        {[
          { label: 'PAC', val: player.peakAttributes.pace },
          { label: 'SHO', val: player.peakAttributes.shooting },
          { label: 'PAS', val: player.peakAttributes.passing },
          { label: 'DRI', val: player.peakAttributes.dribbling },
          { label: 'DEF', val: player.peakAttributes.defending },
          { label: 'PHY', val: player.peakAttributes.physical },
        ].map(attr => (
          <div key={attr.label} className="flex items-center gap-1">
            <span className="text-slate-500 text-xs w-7 shrink-0">{attr.label}</span>
            <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-white/50 rounded-full"
                style={{ width: `${attr.val}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </button>
  )
}
