'use client'
import { GameAction } from '@/types'

interface Props { dispatch: React.Dispatch<GameAction> }

// Notable England squad years — the eras people actually want to relive.
// `tournament` names the real competition that summer so the year reads correctly.
const YEARS: { year: number; tournament: string; blurb: string }[] = [
  { year: 1950, tournament: '1950 World Cup', blurb: 'England\'s first — Matthews, Finney, Mortensen' },
  { year: 1954, tournament: '1954 World Cup', blurb: 'Wright\'s England against Puskás\'s Hungary' },
  { year: 1958, tournament: '1958 World Cup', blurb: 'After Munich — Haynes, Finney, a grieving squad' },
  { year: 1962, tournament: '1962 World Cup', blurb: 'Greaves, Charlton, a 21-year-old Bobby Moore' },
  { year: 1970, tournament: '1970 World Cup', blurb: 'Reigning champions — Moore, Banks, Hurst' },
  { year: 1986, tournament: '1986 World Cup', blurb: 'Lineker\'s Golden Boot, Robson, Hoddle' },
  { year: 1990, tournament: '1990 World Cup', blurb: 'Italia \'90 — Gazza, Lineker, Pearce, Waddle' },
  { year: 1996, tournament: 'Euro 96', blurb: 'Football\'s coming home — Shearer, Gascoigne' },
  { year: 2004, tournament: 'Euro 2004', blurb: 'Young Rooney explodes onto the scene' },
  { year: 2006, tournament: '2006 World Cup', blurb: 'The Golden Generation at its supposed peak' },
  { year: 2010, tournament: '2010 World Cup', blurb: 'Can YOU make Lampard & Gerrard work?' },
  { year: 2018, tournament: '2018 World Cup', blurb: 'It\'s coming home (again) — Kane, Sterling' },
  { year: 2022, tournament: '2022 World Cup', blurb: 'Bellingham\'s emergence, Kane, Saka' },
  { year: 2026, tournament: '2026 World Cup', blurb: 'The current crop — your strongest options' },
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
            className="rounded-xl p-3.5 text-left border border-white/10 bg-white/5 hover:border-white/30 active:scale-[0.98] transition-all flex items-center gap-3"
          >
            <span className="font-black text-2xl text-white w-16 shrink-0 tabular-nums">{y.year}</span>
            <span className="min-w-0">
              <span className="block text-white font-bold text-sm">{y.tournament}</span>
              <span className="block text-slate-400 text-xs leading-snug">{y.blurb}</span>
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
