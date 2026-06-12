'use client'
import { RatedPlayer } from '@/types'
import { TREND_ARROW, TREND_COLOUR } from '@/lib/agingCurve'
import { ratingStyle } from '@/lib/ratingColor'

interface Props {
  player: RatedPlayer
  selected?: boolean
  onClick?: () => void
  showAge?: boolean
  hideRating?: boolean   // Hard difficulty: pick on era and instinct, not numbers
}

export default function PlayerCard({ player, selected, onClick, showAge = true, hideRating = false }: Props) {
  const arrow = TREND_ARROW[player.trend]
  const colour = TREND_COLOUR[player.trend]

  const rs = ratingStyle(player.peakRating, player.ratingAtYear)

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
          {hideRating ? (
            <>
              <div className="text-xl font-black leading-none text-amber-400">
                &rsquo;{String(player.peakYear).slice(2)}
              </div>
              <div className="text-xs text-slate-500 mt-0.5">era</div>
            </>
          ) : (
            <>
              <div
                className="text-2xl font-black leading-none"
                style={{ color: rs.color, textShadow: rs.textShadow }}
              >
                {player.ratingAtYear}
              </div>
              <div className="text-xs text-slate-500 mt-0.5">
                {rs.icon ? 'ICON' : `${player.peakRating} peak`}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Mini attributes — hidden on Hard, where instinct does the scouting */}
      {!hideRating && (
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
      )}
    </button>
  )
}
