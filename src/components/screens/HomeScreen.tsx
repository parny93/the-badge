'use client'
import Image from 'next/image'
import { GameAction } from '@/types'
import { PLAYER_COUNT, WC_COUNT, EURO_COUNT, WC_FIRST_YEAR, WC_LAST_YEAR } from '@/lib/stats'

interface Props { dispatch: React.Dispatch<GameAction> }

const HOW_TO_PLAY = [
  {
    n: 1,
    title: 'Draft Mode',
    desc: 'Spin the wheel and take what fate deals you. Three picks a spin (four on Hard Mode, ratings hidden). Build an XI from chaos.',
  },
  {
    n: 2,
    title: 'Manager Mode',
    desc: 'Step into one year. Only players actually available that summer, rated as they really were. Fix 2010. Redeem Euro 96.',
  },
  {
    n: 3,
    title: 'All-Time XI',
    desc: 'No restrictions. Every England legend at their absolute peak. Pick your perfect XI and take it into any tournament in history.',
  },
  {
    n: 4,
    title: 'Enter a tournament',
    desc: 'Take your squad into any World Cup or Euro — real groups, real opponents rated year-by-year. Survive the group, navigate the knockouts, and pray it doesn\'t go to penalties.',
  },
]

const CHALLENGES = [
  'Win a tournament with a Golden Generation only XI',
  'Bring it home without a single Manchester United player',
  'Win Euro 96 — the redemption run',
  'All-time XI on Hard Mode (ratings hidden)',
  'Win it on penalties',
  'One-club-only XI (Liverpool / Arsenal / Spurs / Man Utd / City)',
  'Pre-Premier League era XI (pre-1992)',
  'Survive the Group of Death',
]

const FAQS = [
  {
    q: 'What is The Badge?',
    a: `A free England football fantasy game. Build a squad from ${PLAYER_COUNT} legends across every era, enter a real World Cup or European Championship, and see how far your XI gets — including, inevitably, the penalty shootouts.`,
  },
  {
    q: 'How do I play?',
    a: 'Pick a mode (Draft, Manager, or All-Time XI), choose a formation, build your XI, then enter any tournament from history. Matches simulate with a live text feed; your result becomes a shareable card.',
  },
  {
    q: 'Where do the ratings come from?',
    a: 'A blend of historical FIFA-style ratings, market-value percentiles, season performance and tournament relevance, with hand-checked career curves so a 1990 Gazza feels different to a 1998 Gazza. They\'re opinionated by design — argue with us.',
  },
  {
    q: 'Is it free?',
    a: 'Yes. Every mode and every tournament is free to play. If it makes you smile, you can buy us a coffee in the footer.',
  },
  {
    q: 'Is this affiliated with the FA, FIFA or UEFA?',
    a: 'No. The Badge is an independent, fan-made game. It is not affiliated with, endorsed by, or connected to the Football Association, FIFA, UEFA, or any club or player. No official logos, kits or likenesses are used.',
  },
]

export default function HomeScreen({ dispatch }: Props) {
  return (
    <div className="min-h-screen flex flex-col items-center px-5 pt-10 pb-8 gap-0">

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
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

      <h1 className="text-4xl font-black tracking-tight text-white leading-none text-center">
        BUILD YOUR GOLDEN GENERATION
      </h1>
      <p className="text-amber-400 text-sm font-semibold tracking-wide mt-3 mb-6 text-center">
        Can you finally bring it home?
      </p>

      <button
        onClick={() => dispatch({ type: 'START' })}
        className="w-full max-w-xs bg-amber-400 text-slate-900 font-black text-lg py-4 rounded-2xl hover:bg-amber-300 active:scale-95 transition-all shadow-[0_0_32px_rgba(201,168,76,0.4)] mb-8"
      >
        Start Playing →
      </button>

      {/* ── Stat triplet ─────────────────────────────────────────────────── */}
      <div className="w-full max-w-sm grid grid-cols-3 gap-3 mb-10">
        <div className="rounded-xl bg-white/5 border border-white/8 px-3 py-3.5 text-center">
          <div className="text-amber-400 font-black text-2xl leading-none">{PLAYER_COUNT}</div>
          <div className="text-slate-400 text-xs mt-1 leading-snug">England legends</div>
        </div>
        <div className="rounded-xl bg-white/5 border border-white/8 px-3 py-3.5 text-center">
          <div className="text-amber-400 font-black text-2xl leading-none">{WC_COUNT}</div>
          <div className="text-slate-400 text-xs mt-1 leading-snug">World Cups</div>
        </div>
        <div className="rounded-xl bg-white/5 border border-white/8 px-3 py-3.5 text-center">
          <div className="text-amber-400 font-black text-2xl leading-none">{EURO_COUNT}</div>
          <div className="text-slate-400 text-xs mt-1 leading-snug">Euros entered</div>
        </div>
      </div>

      {/* ── What is The Badge? ───────────────────────────────────────────── */}
      <section className="w-full max-w-sm mb-10">
        <h2 className="text-white font-black text-xl mb-3">What is The Badge?</h2>
        <p className="text-slate-300 text-sm leading-relaxed mb-3">
          The Badge is an England football fantasy game. You assemble a squad from {PLAYER_COUNT} legends
          spanning {WC_FIRST_YEAR} to {WC_LAST_YEAR} — Banks to Pickford, Moore to Bellingham — and throw
          them into a real tournament against real opponents, rated as they were that summer.
        </p>
        <p className="text-slate-300 text-sm leading-relaxed">
          Sixty years of hurt, condensed into ten minutes. Win it all and the card says so forever.
          Go out on penalties and, well… you already know how that feels.
        </p>
      </section>

      {/* ── How to play ──────────────────────────────────────────────────── */}
      <section className="w-full max-w-sm mb-10">
        <h2 className="text-white font-black text-xl mb-3">How to play</h2>
        <ol className="flex flex-col gap-3">
          {HOW_TO_PLAY.map(step => (
            <li key={step.n} className="flex items-start gap-3 rounded-xl bg-white/5 border border-white/8 px-4 py-3.5">
              <span className="shrink-0 w-6 h-6 rounded-full bg-amber-400 text-slate-900 font-black text-sm flex items-center justify-center mt-0.5">
                {step.n}
              </span>
              <div>
                <div className="text-white font-bold text-sm leading-snug">{step.title}</div>
                <div className="text-slate-400 text-xs leading-snug mt-0.5">{step.desc}</div>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* ── Popular challenges ───────────────────────────────────────────── */}
      <section className="w-full max-w-sm mb-10">
        <h2 className="text-white font-black text-xl mb-1">Popular challenges</h2>
        <p className="text-slate-500 text-xs mb-3">Set your own rules. Screenshot the proof.</p>
        <ul className="flex flex-col gap-2">
          {CHALLENGES.map(c => (
            <li key={c} className="flex items-start gap-2.5 rounded-lg bg-white/5 border border-white/8 px-3.5 py-2.5">
              <span className="text-amber-400 text-sm mt-0.5 shrink-0">🏅</span>
              <span className="text-slate-300 text-sm leading-snug">{c}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────────────── */}
      <section className="w-full max-w-sm mb-10">
        <h2 className="text-white font-black text-xl mb-3">FAQ</h2>
        <div className="flex flex-col gap-2">
          {FAQS.map(f => (
            <details key={f.q} className="group rounded-xl bg-white/5 border border-white/8 overflow-hidden">
              <summary className="cursor-pointer list-none px-4 py-3.5 flex items-center justify-between gap-3">
                <span className="text-white font-bold text-sm leading-snug">{f.q}</span>
                <span className="text-slate-500 text-xs transition-transform group-open:rotate-180">▼</span>
              </summary>
              <p className="px-4 pb-4 text-slate-400 text-sm leading-relaxed">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* ── Footer / disclaimer ──────────────────────────────────────────── */}
      <footer className="w-full max-w-sm border-t border-white/10 pt-6 text-center">
        <button
          onClick={() => dispatch({ type: 'START' })}
          className="w-full max-w-xs bg-white/10 text-white font-bold text-base py-3 rounded-2xl active:scale-95 transition-all mb-6"
        >
          Start Playing →
        </button>
        <p className="text-slate-600 text-[11px] leading-relaxed">
          The Badge is an independent, fan-made game. It is not affiliated with, endorsed by, or
          connected to the Football Association, FIFA, UEFA, the Premier League, or any club,
          league or player. No official logos, kits, badges or player likenesses are used.
          Player names and historical statistics are used in a factual, editorial context.
        </p>
        <p className="text-slate-700 text-[11px] mt-3">🏴󠁧󠁢󠁥󠁮󠁧󠁿 thebadge.app</p>
      </footer>

    </div>
  )
}
