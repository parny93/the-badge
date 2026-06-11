'use client'
import Image from 'next/image'
import { GameAction } from '@/types'
import {
  PLAYER_COUNT, WC_COUNT, EURO_COUNT, FORMATION_COUNT,
  WC_FIRST_YEAR, WC_LAST_YEAR, EURO_FIRST_YEAR,
} from '@/lib/stats'

interface Props { dispatch: React.Dispatch<GameAction> }

const MODES = [
  {
    icon: '🎰',
    label: 'Draft Mode',
    desc: 'Spin the wheel — take what you\'re given. Can you build a winner from whatever fate deals you?',
  },
  {
    icon: '🗓️',
    label: 'Manager Mode',
    desc: 'Pick any era from 1966 to 2026. Build the best squad from players who were available that year.',
  },
  {
    icon: '🏆',
    label: 'All-Time XI',
    desc: 'No era restrictions — pick England\'s greatest players ever and enter any World Cup or Euro.',
  },
]

const STATS = [
  `${PLAYER_COUNT} legends`,
  `${WC_COUNT} World Cups`,
  `${EURO_COUNT} European Championships`,
  'Badge chemistry',
  `${FORMATION_COUNT} formations`,
]

export default function HomeScreen({ dispatch }: Props) {
  return (
    <div className="min-h-screen flex flex-col items-center px-5 pt-10 pb-8 gap-0">

      {/* Logo — sits on a page background sampled to match the badge exactly */}
      <div className="-mb-1 -mt-2">
        <Image
          src="/logo.png"
          alt="The Badge"
          width={224}
          height={224}
          priority
          className="w-52 h-52 sm:w-60 sm:h-60 drop-shadow-[0_10px_40px_rgba(201,168,76,0.45)]"
        />
      </div>

      {/* Title */}
      <h1 className="text-4xl font-black tracking-tight text-white leading-none">
        THE BADGE
      </h1>
      <p className="text-amber-400 text-xs font-semibold tracking-[0.25em] uppercase mt-1.5 mb-6">
        Build Your Golden Generation
      </p>

      {/* Hero copy */}
      <p className="text-slate-300 text-center max-w-sm leading-relaxed mb-8">
        Pick your greatest England squad, face real World Cup and European Championship opponents,
        and find out if you can finally bring it home.
      </p>

      {/* CTA */}
      <button
        onClick={() => dispatch({ type: 'START' })}
        className="w-full max-w-xs bg-amber-400 text-slate-900 font-black text-lg py-4 rounded-2xl hover:bg-amber-300 active:scale-95 transition-all shadow-[0_0_32px_rgba(201,168,76,0.4)] mb-10"
      >
        Start Playing →
      </button>

      {/* Mode cards */}
      <div className="w-full max-w-sm flex flex-col gap-3 mb-10">
        <p className="text-slate-500 text-xs uppercase tracking-widest mb-1">Three ways to play</p>
        {MODES.map(m => (
          <div key={m.label} className="flex items-start gap-3 rounded-xl bg-white/5 border border-white/8 px-4 py-3.5">
            <span className="text-xl mt-0.5 shrink-0">{m.icon}</span>
            <div>
              <div className="text-white font-bold text-sm leading-snug">{m.label}</div>
              <div className="text-slate-400 text-xs leading-snug mt-0.5">{m.desc}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Feature highlights */}
      <div className="w-full max-w-sm grid grid-cols-2 gap-3 mb-10">
        <div className="rounded-xl bg-white/5 border border-white/8 px-4 py-3.5">
          <div className="text-amber-400 font-black text-2xl leading-none">{PLAYER_COUNT}</div>
          <div className="text-slate-400 text-xs mt-1 leading-snug">England legends from every era</div>
        </div>
        <div className="rounded-xl bg-white/5 border border-white/8 px-4 py-3.5">
          <div className="text-amber-400 font-black text-2xl leading-none">{WC_COUNT}</div>
          <div className="text-slate-400 text-xs mt-1 leading-snug">World Cups from {WC_FIRST_YEAR} to {WC_LAST_YEAR}</div>
        </div>
        <div className="rounded-xl bg-white/5 border border-white/8 px-4 py-3.5">
          <div className="text-amber-400 font-black text-2xl leading-none">{EURO_COUNT}</div>
          <div className="text-slate-400 text-xs mt-1 leading-snug">European Championships from {EURO_FIRST_YEAR}</div>
        </div>
        <div className="rounded-xl bg-white/5 border border-white/8 px-4 py-3.5">
          <div className="text-amber-400 font-black text-2xl leading-none">Real</div>
          <div className="text-slate-400 text-xs mt-1 leading-snug">Opponents rated year-by-year</div>
        </div>
      </div>

      {/* Stats strip */}
      <div className="flex items-center gap-2 flex-wrap justify-center">
        {STATS.map((s, i) => (
          <span key={s} className="flex items-center gap-2">
            <span className="text-slate-500 text-xs">{s}</span>
            {i < STATS.length - 1 && <span className="text-slate-700 text-xs">•</span>}
          </span>
        ))}
      </div>

    </div>
  )
}
