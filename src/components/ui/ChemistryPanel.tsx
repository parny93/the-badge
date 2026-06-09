'use client'
import { ChemistryReport } from '@/types'
import { CHEM_LABEL } from '@/lib/chemistry'

export default function ChemistryPanel({ report }: { report: ChemistryReport }) {
  const { score, notes } = report

  const ring =
    score >= 80 ? 'text-emerald-400' :
    score >= 68 ? 'text-yellow-400' :
    score >= 55 ? 'text-orange-400' :
    'text-red-400'

  const circumference = 2 * Math.PI * 26

  return (
    <div className="rounded-xl bg-white/5 border border-white/10 p-4">
      <div className="flex items-center gap-4">
        {/* Score ring */}
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

      {/* Notes */}
      <div className="mt-3 flex flex-col gap-1.5">
        {notes.map((note, i) => (
          <div key={i} className="flex items-start gap-2 text-xs leading-snug">
            <span className="shrink-0 mt-px">
              {note.type === 'good' ? '✅' : note.type === 'bad' ? '⚠️' : 'ℹ️'}
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
