'use client'
import { RatedPlayer, Formation } from '@/types'
import { FORMATIONS } from '@/lib/teamStrength'

interface Props {
  squad: (RatedPlayer | null)[]
  formation: Formation
  activeIndex?: number
  onSelectSlot?: (index: number) => void
  compact?: boolean
}

export default function FormationDisplay({ squad, formation, activeIndex, onSelectSlot, compact }: Props) {
  const slots = FORMATIONS[formation]
  const pitchH = compact ? 260 : 360

  return (
    <div
      className="relative w-full rounded-xl overflow-hidden"
      style={{ height: pitchH, background: 'linear-gradient(180deg, #166534 0%, #15803d 40%, #16a34a 60%, #166534 100%)' }}
    >
      {/* Pitch markings */}
      <svg className="absolute inset-0 w-full h-full opacity-20" viewBox="0 0 100 100" preserveAspectRatio="none">
        {/* Centre circle */}
        <circle cx="50" cy="50" r="12" fill="none" stroke="white" strokeWidth="0.5" />
        <circle cx="50" cy="50" r="0.8" fill="white" />
        {/* Halfway line */}
        <line x1="0" y1="50" x2="100" y2="50" stroke="white" strokeWidth="0.5" />
        {/* Penalty areas */}
        <rect x="22" y="82" width="56" height="16" fill="none" stroke="white" strokeWidth="0.5" />
        <rect x="22" y="2" width="56" height="16" fill="none" stroke="white" strokeWidth="0.5" />
        {/* Goals */}
        <rect x="38" y="97" width="24" height="3" fill="none" stroke="white" strokeWidth="0.5" />
        <rect x="38" y="0" width="24" height="3" fill="none" stroke="white" strokeWidth="0.5" />
      </svg>

      {/* Player tokens */}
      {slots.map((slot, i) => {
        const player = squad[i]
        const isActive = i === activeIndex
        const isFilled = !!player

        const left = `${slot.x}%`
        const bottom = `${slot.y}%`
        const size = compact ? 36 : 44

        return (
          <div
            key={i}
            className="absolute flex flex-col items-center gap-0.5 cursor-pointer"
            style={{
              left,
              bottom,
              transform: 'translate(-50%, 50%)',
              zIndex: isActive ? 20 : 10,
            }}
            onClick={() => onSelectSlot?.(i)}
          >
            <div
              className={[
                'rounded-full flex items-center justify-center font-bold text-xs transition-all',
                isActive
                  ? 'ring-4 ring-yellow-400 bg-yellow-400 text-slate-900'
                  : isFilled
                    ? 'bg-white text-slate-900 ring-2 ring-white/60'
                    : 'bg-white/20 text-white ring-2 ring-white/40',
              ].join(' ')}
              style={{ width: size, height: size }}
            >
              {isFilled ? (
                <span className="text-center leading-none px-0.5" style={{ fontSize: compact ? 7 : 8 }}>
                  {player.name.split(' ').pop()}
                </span>
              ) : (
                <span style={{ fontSize: compact ? 9 : 11 }}>{slot.label}</span>
              )}
            </div>
            {!compact && isFilled && (
              <span className="text-white text-center font-medium leading-none bg-black/40 rounded px-1"
                style={{ fontSize: 9, maxWidth: 52 }}>
                {player.ratingAtYear}
              </span>
            )}
          </div>
        )
      })}
    </div>
  )
}
