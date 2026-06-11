'use client'
import { RatedPlayer, Formation } from '@/types'
import { FORMATIONS } from '@/lib/teamStrength'
import { displaySurname } from '@/lib/names'

interface Props {
  squad: (RatedPlayer | null)[]
  formation: Formation
  activeIndex?: number
  onSelectSlot?: (index: number) => void
  compact?: boolean
  captainId?: string | null
}

// ─── Pitch markings SVG ───────────────────────────────────────────────────────
// Proportions based on a standard 105m × 68m pitch, mapped to a 100×100 viewBox.
// preserveAspectRatio="none" stretches to fill the container; the slight ellipse
// on circles is imperceptible at typical screen sizes.
//
// Key measurements (as % of pitch dimensions):
//   Penalty area  — 40.32m wide (59.3%), 16.5m deep (15.7%)   → x=20 w=60 h=16
//   6-yard box    — 18.32m wide (26.9%), 5.5m deep (5.2%)     → x=36.5 w=27 h=5.5
//   Penalty spot  — 11m from goal (10.5%)                     → y=10.5 / 89.5
//   Penalty arc   — 9.15m radius (8.7%)                       → r=9
//   Corner arc    — 1m radius (1.5%)                          → r=1.5
//   Centre circle — 9.15m radius                              → r=9

function PitchMarkings() {
  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      style={{ opacity: 0.38 }}
    >
      {/* ── Touchline border ── */}
      <rect x="0" y="0" width="100" height="100" fill="none" stroke="white" strokeWidth="0.6" />

      {/* ── Top goal (opponent) ── */}
      {/* Goal frame (sits on the goal line) */}
      <rect x="43" y="-2.5" width="14" height="2.5" fill="none" stroke="white" strokeWidth="0.5" />
      {/* 6-yard box */}
      <rect x="36.5" y="0" width="27" height="5.5" fill="none" stroke="white" strokeWidth="0.45" />
      {/* Penalty area */}
      <rect x="20" y="0" width="60" height="16" fill="none" stroke="white" strokeWidth="0.5" />
      {/* Penalty spot */}
      <circle cx="50" cy="10.5" r="0.9" fill="white" />
      {/* Penalty arc — only the portion outside the penalty area (below y=16) */}
      <path d="M 42.88 16 A 9 9 0 0 1 57.12 16" fill="none" stroke="white" strokeWidth="0.5" />

      {/* ── Halfway line + centre circle ── */}
      <line x1="0" y1="50" x2="100" y2="50" stroke="white" strokeWidth="0.5" />
      <circle cx="50" cy="50" r="9" fill="none" stroke="white" strokeWidth="0.5" />
      <circle cx="50" cy="50" r="0.9" fill="white" />

      {/* ── Bottom goal (England's) ── */}
      {/* Goal frame */}
      <rect x="43" y="100" width="14" height="2.5" fill="none" stroke="white" strokeWidth="0.5" />
      {/* 6-yard box */}
      <rect x="36.5" y="94.5" width="27" height="5.5" fill="none" stroke="white" strokeWidth="0.45" />
      {/* Penalty area */}
      <rect x="20" y="84" width="60" height="16" fill="none" stroke="white" strokeWidth="0.5" />
      {/* Penalty spot */}
      <circle cx="50" cy="89.5" r="0.9" fill="white" />
      {/* Penalty arc — only outside penalty area (above y=84) */}
      <path d="M 42.88 84 A 9 9 0 0 0 57.12 84" fill="none" stroke="white" strokeWidth="0.5" />

      {/* ── Corner arcs ── */}
      <path d="M 2 0 A 2 2 0 0 1 0 2"   fill="none" stroke="white" strokeWidth="0.4" />
      <path d="M 98 0 A 2 2 0 0 0 100 2" fill="none" stroke="white" strokeWidth="0.4" />
      <path d="M 0 98 A 2 2 0 0 1 2 100" fill="none" stroke="white" strokeWidth="0.4" />
      <path d="M 100 98 A 2 2 0 0 0 98 100" fill="none" stroke="white" strokeWidth="0.4" />
    </svg>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function FormationDisplay({ squad, formation, activeIndex, onSelectSlot, compact, captainId }: Props) {
  const slots = FORMATIONS[formation]
  const pitchH = compact ? 260 : 360

  return (
    <div
      className="relative w-full rounded-xl overflow-hidden"
      style={{
        height: pitchH,
        // Alternating grass stripes — 10 horizontal bands
        background: `repeating-linear-gradient(
          to bottom,
          #165e2f 0%,
          #165e2f 10%,
          #1c7238 10%,
          #1c7238 20%
        )`,
      }}
    >
      {/* Edge vignette for depth */}
      <div
        className="absolute inset-0 pointer-events-none rounded-xl"
        style={{
          boxShadow: 'inset 0 0 32px rgba(0,0,0,0.45)',
        }}
      />

      {/* Pitch markings */}
      <PitchMarkings />

      {/* Player tokens */}
      {slots.map((slot, i) => {
        const player = squad[i]
        const isActive = i === activeIndex
        const isFilled = !!player

        const left = `${slot.x}%`
        const bottom = `${slot.y}%`
        const size = compact ? 36 : 44

        // Token ring colour based on state
        const ringCls = isActive
          ? 'ring-4 ring-amber-400'
          : isFilled
            ? 'ring-2 ring-white/50'
            : 'ring-2 ring-white/30'

        // Token background
        const bgCls = isActive
          ? 'bg-amber-400 text-slate-900'
          : isFilled
            ? 'bg-white text-slate-900'
            : 'bg-white/15 text-white/70'

        return (
          <div
            key={i}
            className="absolute flex flex-col items-center gap-0.5 cursor-pointer select-none"
            style={{
              left,
              bottom,
              transform: 'translate(-50%, 50%)',
              zIndex: isActive ? 20 : 10,
            }}
            onClick={() => onSelectSlot?.(i)}
          >
            {/* Avatar circle */}
            <div
              className={`relative rounded-full flex items-center justify-center font-bold transition-all shadow-md ${ringCls} ${bgCls}`}
              style={{ width: size, height: size }}
            >
              {isFilled && player.id === captainId && (
                <span
                  className="absolute -top-1.5 -right-1.5 bg-amber-400 text-slate-900 font-black rounded-full flex items-center justify-center shadow"
                  style={{ width: 15, height: 15, fontSize: 9 }}
                >
                  C
                </span>
              )}
              {isFilled ? (
                <span className="text-center leading-none px-0.5" style={{ fontSize: compact ? 7 : 8 }}>
                  {displaySurname(player.name)}
                </span>
              ) : (
                <span style={{ fontSize: compact ? 9 : 11 }}>{slot.label}</span>
              )}
            </div>

            {/* Rating badge (non-compact only) */}
            {!compact && isFilled && (
              <span
                className="text-white text-center font-bold leading-none rounded px-1.5 py-0.5"
                style={{
                  fontSize: 9,
                  maxWidth: 52,
                  background: 'rgba(0,0,0,0.55)',
                  backdropFilter: 'blur(2px)',
                }}
              >
                {player.ratingAtYear}
              </span>
            )}
          </div>
        )
      })}
    </div>
  )
}
