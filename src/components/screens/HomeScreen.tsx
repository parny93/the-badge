'use client'
import Image from 'next/image'
import { GameAction } from '@/types'

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
    desc: 'Pick any era from 1966 to 2026. Build the best squad from players who were actually available that year.',
  },
  {
    icon: '🏆',
    label: 'All-Time XI',
    desc: 'No era restrictions — pick England\'s greatest players ever and take them straight to the World Cup.',
  },
]

const STATS = ['120+ legends', '16 World Cups', 'FUT chemistry', '5 formations']

export default function HomeScreen({ dispatch }: Props) {
  return (
    <div className="min-h-screen flex flex-col items-center px-5 pt-10 pb-8 gap-0">

      {/* Logo */}
      <div className="mb-5">
        <Image
          src="/logo.svg"
          alt="The Badge"
          width={110}
          height={121}
          priority
          className="drop-shadow-[0_4px_24px_rgba(201,168,76,0.35)]"
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
        Pick your greatest England squad, face real World Cup opponents,
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
          <div className="text-amber-400 font-black text-2xl leading-none">120+</div>
          <div className="text-slate-400 text-xs mt-1 leading-snug">England legends from every era</div>
        </div>
        <div className="rounded-xl bg-white/5 border border-white/8 px-4 py-3.5">
          <div className="text-amber-400 font-black text-2xl leading-none">16</div>
          <div className="text-slate-400 text-xs mt-1 leading-snug">World Cups from 1966 to 2026</div>
        </div>
        <div className="rounded-xl bg-white/5 border border-white/8 px-4 py-3.5">
          <div className="text-amber-400 font-black text-2xl leading-none">FUT</div>
          <div className="text-slate-400 text-xs mt-1 leading-snug">Chemistry — per-player pip scoring</div>
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
