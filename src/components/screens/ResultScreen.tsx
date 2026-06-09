'use client'
import { useState } from 'react'
import { Formation, GameAction, RatedPlayer, TournamentResult, WorldCupData } from '@/types'
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
  Winner:   { emoji: '🏆', headline: 'THEY BROUGHT IT HOME!', sub: 'England are World Champions. It only took 60 years.' },
  Final:    { emoji: '🥈', headline: 'So close. Heartbreak in the Final.', sub: 'A runner-up medal. But England deserve more.' },
  SF:       { emoji: '😤', headline: 'Semi-final exit. Again.', sub: 'The nation holds its breath... and then sighs.' },
  QF:       { emoji: '😞', headline: 'Quarter-final exit.', sub: 'The press won\'t be kind this week.' },
  R16:      { emoji: '😬', headline: 'Round of 16. Knocked out.', sub: 'Just not quite good enough on the day.' },
  R32:      { emoji: '😔', headline: 'Round of 32. An early exit.', sub: 'Didn\'t even get going.' },
  Group:    { emoji: '💀', headline: 'Couldn\'t get out of the group.', sub: 'Classic England. Somehow, they found a way out. Oh wait — they didn\'t.' },
}

export default function ResultScreen({ worldCup, squad, formation, result, dispatch }: Props) {
  const [tab, setTab] = useState<Tab>('result')
  const copy = EXIT_COPY[result.exitRound] ?? EXIT_COPY['Group']

  const allEnglandMatches = result.rounds.flatMap(r =>
    r.matches.filter(m => m.home === 'England' || m.away === 'England')
  )

  const shareText = [
    `🏴󠁧󠁢󠁥󠁧󠁧󠁮󠁧󠁿 THE BADGE — ${worldCup.year} World Cup`,
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
          <span className="text-slate-300 text-xs">{worldCup.year} World Cup · {formation}</span>
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
