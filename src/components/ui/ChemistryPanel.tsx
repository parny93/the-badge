'use client'
import { ChemistryReport, PlayerChemEntry } from '@/types'
import { CHEM_LABEL } from '@/lib/chemistry'
import { displaySurname } from '@/lib/names'

// ── Pip dots (like FUT chemistry dots) ────────────────────────────────────────
function PipDots({ pips }: { pips: number }) {
  const colour =
    pips === 3 ? 'bg-emerald-400' :
    pips === 2 ? 'bg-yellow-400' :
    pips === 1 ? 'bg-orange-400' :
    'bg-red-500'
  return (
    <div className="flex gap-0.5 items-center">
      {[0, 1, 2].map(i => (
        <div
          key={i}
          className={`w-2 h-2 rounded-full ${i < pips ? colour : 'bg-white/15'}`}
        />
      ))}
    </div>
  )
}

// ── Per-player row ─────────────────────────────────────────────────────────────
function PlayerChemRow({ entry }: { entry: PlayerChemEntry }) {
  const surname = displaySurname(entry.name)
  return (
    <div className="flex items-center gap-2">
      <div className="w-20 text-slate-300 text-xs font-semibold truncate">{surname}</div>
      <PipDots pips={entry.pips} />
      <div className="text-xs font-medium text-slate-400 truncate">
        {entry.club ?? '—'}
      </div>
    </div>
  )
}

export default function ChemistryPanel({ report }: { report: ChemistryReport }) {
  const { score, notes, players } = report

  const ring =
    score >= 80 ? 'text-emerald-400' :
    score >= 68 ? 'text-yellow-400' :
    score >= 55 ? 'text-orange-400' :
    'text-red-400'

  const circumference = 2 * Math.PI * 26

  return (
    <div className="rounded-xl bg-white/5 border border-white/10 p-4 flex flex-col gap-4">
      {/* Header: score ring + label */}
      <div className="flex items-center gap-4">
        <div className="relative w-16 h-16 shrink-0">
          <svg className="w-16 h-16 -rotate-90" viewBox="0 0 60 60">
            <circle cx="30" cy="30" r="26" fill="none" stroke="currentColor" strokeWidth="5" className="text-white/10" />
            <circle
              cx="30" cy="30" r="26" fill="none" strokeWidth="5" strokeLinecap="round"
              className={ring}
              stroke="currentColor"
              strokeDasharray={circumference}
              strokeDashoffset={circumference * (1 - score / 100)}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={`font-black text-lg ${ring}`}>{score}</span>
          </div>
        </div>
        <div>
          <div className="text-slate-400 text-xs uppercase tracking-widest">Chemistry</div>
          <div className="text-white font-bold text-lg leading-tight">{CHEM_LABEL(score)}</div>
        </div>
      </div>

      {/* Per-player FUT-style pips */}
      {players.length > 0 && (
        <div>
          <div className="text-slate-500 text-xs uppercase tracking-widest mb-2">Player Chemistry</div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
            {players.map(entry => (
              <PlayerChemRow key={entry.playerId} entry={entry} />
            ))}
          </div>
        </div>
      )}

      {/* Team notes */}
      <div className="flex flex-col gap-1.5">
        {notes.map((note, i) => (
          <div key={i} className="flex items-start gap-2 text-xs leading-snug">
            <span className="shrink-0 mt-px">
              <span className={
                note.type === 'good' ? 'text-emerald-400' :
                note.type === 'bad' ? 'text-amber-400' : 'text-slate-500'
              }>●</span>
            </span>
            <span className={
              note.type === 'good' ? 'text-emerald-300' :
              note.type === 'bad' ? 'text-orange-300' :
              'text-slate-400'
            }>
              {note.text}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
