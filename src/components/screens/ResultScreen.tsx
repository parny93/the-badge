'use client'
import { useState } from 'react'
import { Formation, GameAction, RatedPlayer, TournamentResult, WorldCupData } from '@/types'
import { getLore } from '@/data/tournamentLore'
import FormationDisplay from '@/components/ui/FormationDisplay'

interface Props {
  worldCup: WorldCupData
  squad: (RatedPlayer | null)[]
  formation: Formation
  result: TournamentResult
  dispatch: React.Dispatch<GameAction>
}

type Tab = 'result' | 'matches' | 'squad'

const EXIT_COPY: Record<string, { emoji: string; headline: string; sub: string }> = {
  Winner: {
    emoji: '🏆',
    headline: 'IT\'S COMING HOME. IT\'S ACTUALLY COMING HOME.',
    sub: 'England are World Champions. The sixty-year wait is finally over. Alf Ramsey is smiling somewhere.',
  },
  Final: {
    emoji: '🥈',
    headline: 'So close. The Final. Heartbreak again.',
    sub: 'A runner-up medal. The nation almost dared to believe. Almost.',
  },
  SF: {
    emoji: '😤',
    headline: 'Semi-final exit. England\'s favourite tournament to lose.',
    sub: 'Gascoigne cried here. Southgate missed here. The hurt just gets passed down the generations.',
  },
  QF: {
    emoji: '😞',
    headline: 'Quarter-final exit.',
    sub: 'The press will be brutal on Monday. Somewhere, a penalty shootout is being blamed.',
  },
  R16: {
    emoji: '😬',
    headline: 'Round of 16. An early flight home.',
    sub: 'Not quite good enough. The Golden Generation title is safe for now.',
  },
  R32: {
    emoji: '😔',
    headline: 'Round of 32. Didn\'t even warm up.',
    sub: 'Out before England fans had finished complaining about the group draw.',
  },
  Group: {
    emoji: '💀',
    headline: 'England crashed out in the group stage.',
    sub: 'A new low. Even 1950 against the USA was closer than this. The pub is going to be quiet tomorrow.',
  },
}

const EURO_WINNER_COPY = {
  emoji: '🏆',
  headline: 'EURO CHAMPIONS! FINALLY!',
  sub: "They've only gone and done it. England are European Champions. The whole nation erupts.",
}

export default function ResultScreen({ worldCup, squad, formation, result, dispatch }: Props) {
  const [tab, setTab] = useState<Tab>('result')
  const isEuro = worldCup.competition === 'Euro'
  const compLabel = isEuro ? 'European Championship' : 'World Cup'
  const rawCopy = EXIT_COPY[result.exitRound] ?? EXIT_COPY['Group']
  const copy = result.exitRound === 'Winner' && isEuro ? EURO_WINNER_COPY : rawCopy

  const lore = getLore(worldCup.year)
  const hostLabel = lore?.host ?? worldCup.host.split(' / ')[0]

  const allEnglandMatches = result.rounds.flatMap(r =>
    r.matches.filter(m => m.home === 'England' || m.away === 'England')
  )

  const shareText = [
    `🏴󠁧󠁢󠁥󠁮󠁧󠁿 THE BADGE — ${worldCup.year} ${compLabel}`,
    `${copy.emoji} ${copy.headline}`,
    `Formation: ${formation}`,
    allEnglandMatches.slice(0, 4).map(m =>
      `${m.home} ${m.homeGoals}–${m.awayGoals} ${m.away}${m.wentToPenalties ? ` (pens ${m.homePenalties}–${m.awayPenalties})` : ''}`
    ).join('\n'),
    '',
    'Can you do better? → thebadge.app',
  ].join('\n')

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ text: shareText, title: 'The Badge' })
        return
      } catch {}
    }
    await navigator.clipboard.writeText(shareText)
    alert('Copied to clipboard!')
  }

  return (
    <div className="min-h-screen px-4 py-6 pb-32">
      {/* Hero result */}
      <div className="text-center mb-6">
        <div className="text-6xl mb-3">{copy.emoji}</div>
        <h1 className="text-2xl font-black text-white leading-tight">{copy.headline}</h1>
        <p className="text-slate-400 mt-2 text-sm leading-snug">{copy.sub}</p>
        <div className="mt-3 inline-block bg-white/10 rounded-full px-3 py-1">
          <span className="text-slate-300 text-xs">
            {lore?.nickname ?? `${worldCup.year} ${compLabel}`} · 📍 {hostLabel} · {formation}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex rounded-xl bg-white/5 p-1 gap-1 mb-4">
        {(['result', 'matches', 'squad'] as Tab[]).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all capitalize ${
              tab === t ? 'bg-white text-slate-900' : 'text-slate-400 hover:text-white'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === 'result' && (
        <div className="flex flex-col gap-3">
          {result.rounds.map((round, ri) => {
            const engMatches = round.matches.filter(
              m => m.home === 'England' || m.away === 'England'
            )
            if (engMatches.length === 0) return null

            return (
              <div key={ri} className="rounded-xl bg-white/5 border border-white/10 overflow-hidden">
                <div className="px-3 py-2 bg-white/5 text-xs font-bold text-slate-400 uppercase tracking-widest">
                  {round.type === 'Group' ? 'Group Stage' : round.type}
                </div>
                {engMatches.map((m, mi) => (
                  <div key={mi} className="px-3 py-3 border-t border-white/5">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-white text-sm">{m.home}</span>
                      <span className={`font-black text-xl ${
                        m.englandWon ? 'text-emerald-400' : m.englandWon === false ? 'text-red-400' : 'text-yellow-400'
                      }`}>
                        {m.homeGoals} – {m.awayGoals}
                        {m.wentToPenalties && (
                          <span className="text-xs font-normal text-slate-500 ml-1">
                            (pens {m.homePenalties}–{m.awayPenalties})
                          </span>
                        )}
                      </span>
                      <span className="font-bold text-white text-sm">{m.away}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      {m.moments.slice(0, 3).map((moment, moi) => (
                        <div key={moi} className="flex items-start gap-2 text-xs">
                          <span className="text-slate-500 shrink-0 w-6">{moment.minute}'</span>
                          <span className={`leading-snug ${
                            moment.type === 'goal' ? 'text-emerald-300' :
                            moment.type === 'miss' ? 'text-orange-300' :
                            moment.type === 'save' ? 'text-sky-300' :
                            'text-slate-400'
                          }`}>
                            {moment.text}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )
          })}
        </div>
      )}

      {tab === 'matches' && (
        <div className="flex flex-col gap-2">
          {allEnglandMatches.map((m, i) => (
            <div key={i} className="rounded-xl bg-white/5 border border-white/10 p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-white font-bold text-sm">{m.home}</span>
                <span className={`font-black text-lg ${
                  m.englandWon ? 'text-emerald-400' : 'text-red-400'
                }`}>{m.homeGoals} – {m.awayGoals}</span>
                <span className="text-white font-bold text-sm">{m.away}</span>
              </div>
              {m.moments.map((moment, mi) => (
                <div key={mi} className="flex items-start gap-1.5 text-xs mt-1">
                  <span className="text-slate-500 shrink-0 w-5">{moment.minute}'</span>
                  <span className="text-slate-400 leading-snug">{moment.text}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {tab === 'squad' && (
        <FormationDisplay squad={squad} formation={formation} />
      )}

      {/* Fixed buttons */}
      <div className="fixed bottom-4 left-4 right-4 flex flex-col gap-2 z-30">
        <button
          onClick={handleShare}
          className="w-full bg-yellow-400 text-slate-900 font-black text-lg py-4 rounded-2xl active:scale-95 transition-all shadow-2xl"
        >
          📤 Share Result
        </button>
        <button
          onClick={() => dispatch({ type: 'RESTART' })}
          className="w-full bg-white/10 text-white font-bold text-base py-3 rounded-2xl active:scale-95 transition-all"
        >
          Try Again →
        </button>
      </div>
    </div>
  )
}
