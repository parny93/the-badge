'use client'
import { GameAction } from '@/types'

interface Props { dispatch: React.Dispatch<GameAction> }

// Notable England squad years — the eras people actually want to relive.
const YEARS: { year: number; label: string; blurb: string }[] = [
  { year: 1970, label: '1970', blurb: 'Reigning champions — Moore, Banks, Hurst' },
  { year: 1986, label: '1986', blurb: 'Lineker\'s Golden Boot, Robson, Hoddle' },
  { year: 1990, label: '1990', blurb: 'Italia \'90 — Gazza, Lineker, Pearce, Waddle' },
  { year: 1996, label: '1996', blurb: 'Football\'s coming home — Shearer, Gascoigne' },
  { year: 2004, label: '2004', blurb: 'Young Rooney explodes onto the scene' },
  { year: 2006, label: '2006', blurb: 'The Golden Generation at its supposed peak' },
  { year: 2010, label: '2010', blurb: 'Can YOU make Lampard & Gerrard work?' },
  { year: 2018, label: '2018', blurb: 'It\'s coming home (again) — Kane, Sterling' },
  { year: 2022, label: '2022', blurb: 'Bellingham\'s emergence, Kane, Saka' },
  { year: 2026, label: '2026', blurb: 'The current crop — your strongest options' },
]

export default function ManagerYearScreen({ dispatch }: Props) {
  return (
    <div className="min-h-screen px-4 py-6 pb-10">
      <h2 className="text-2xl font-black text-white mb-1">Pick Your Year</h2>
      <p className="text-slate-400 text-sm mb-5">
        You can only select players available that year — rated as they actually were.
      </p>

      <div className="flex flex-col gap-2.5">
        {YEARS.map(y => (
          <button
            key={y.year}
            onClick={() => dispatch({ type: 'SELECT_YEAR', year: y.year })}
            className="rounded-xl p-3.5 text-left border border-white/10 bg-white/5 hover:border-white/30 active:scale-[0.98] transition-all flex items-center gap-4"
          >
            <span className="font-black text-2xl text-white w-16 shrink-0">{y.label}</span>
            <span className="text-slate-300 text-sm leading-snug">{y.blurb}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
