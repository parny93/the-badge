'use client'
import { useEffect, useRef, useState, useCallback } from 'react'
import { Formation, GameAction, MatchMoment, MatchResult, RatedPlayer, TournamentResult, WorldCupData } from '@/types'
import { runTournament } from '@/lib/tournament'
import { calculateTeamStrength } from '@/lib/teamStrength'
import { FORMATIONS } from '@/lib/teamStrength'
import { getTeamRating } from '@/data/teamRatings'
import { getLore } from '@/data/tournamentLore'

// ─── Types ────────────────────────────────────────────────────────────────────

interface MatchDisplay {
  match: MatchResult
  roundLabel: string
  isKnockout: boolean
  isGroupFinal: boolean  // last group game
  isFinal: boolean       // the actual WC Final
}

type Phase = 'loading' | 'intro' | 'prematch' | 'live' | 'scoreboard'

const ROUND_LABELS: Record<string, string> = {
  Group: 'Group Stage',
  R16:   'Round of 16',
  QF:    'Quarter-Final',
  SF:    'Semi-Final',
  Final: 'The Final',
}

const MOMENT_ICON: Record<string, string> = {
  goal:    '⚽',
  save:    '🧤',
  miss:    '😬',
  post:    '🥊',
  card:    '🟥',
  penalty: '🎯',
  chance:  '💨',
  info:    '📢',
}

const TENSION_LINES = [
  'Sixty years of hurt. Today it ends — or it doesn\'t.',
  'A nation dares to dream. Carefully.',
  'Three Lions on the shirt. The whole country has stopped.',
  'From Wembley \'66 to Italia \'90 — every heartbreak led to this.',
  'Gazza\'s tears, Beckham\'s red card, Rooney\'s injury. This squad carries it all.',
  'England v the World. Again. Let\'s go.',
  'Your squad. Their legacy. Sixty years of longing.',
  'The whole country is watching. Holding its breath. Again.',
  '"Some people are on the pitch... they think it\'s all over." Make it all over.',
  'Not just a game. Never just a game for England.',
]

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  worldCup: WorldCupData
  squad: (RatedPlayer | null)[]
  formation: Formation
  dispatch: React.Dispatch<GameAction>
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function TournamentScreen({ worldCup, squad, formation, dispatch }: Props) {
  const [phase, setPhase]           = useState<Phase>('loading')
  const [matches, setMatches]       = useState<MatchDisplay[]>([])
  const [matchIdx, setMatchIdx]     = useState(0)
  const [momentIdx, setMomentIdx]   = useState(0)   // how many moments are visible
  const [finalResult, setFinalResult] = useState<TournamentResult | null>(null)
  const [tensionLine]               = useState(() => TENSION_LINES[Math.floor(Math.random() * TENSION_LINES.length)])

  const timer   = useRef<ReturnType<typeof setTimeout> | null>(null)
  const scrollRef = useRef<HTMLDivElement | null>(null)

  const clearTimer = () => { if (timer.current) clearTimeout(timer.current) }

  // ── Compute full tournament on mount ──────────────────────────────────────
  useEffect(() => {
    const res = runTournament(worldCup, squad, formation)

    const flat: MatchDisplay[] = []
    const groupRound = res.rounds.find(r => r.type === 'Group')
    const groupMatches = groupRound?.matches.filter(m => m.home === 'England' || m.away === 'England') ?? []

    res.rounds.forEach(round => {
      round.matches
        .filter(m => m.home === 'England' || m.away === 'England')
        .forEach(m => {
          flat.push({
            match: m,
            roundLabel: ROUND_LABELS[round.type] ?? round.type,
            isKnockout: round.type !== 'Group',
            isGroupFinal: round.type === 'Group' && groupMatches.indexOf(m) === groupMatches.length - 1,
            isFinal: round.type === 'Final',
          })
        })
    })

    setFinalResult(res)
    setMatches(flat)
    // Open with a nostalgic tournament intro (when we have lore for the year),
    // otherwise go straight to the first prematch.
    const opener: Phase = getLore(worldCup.year) ? 'intro' : 'prematch'
    timer.current = setTimeout(() => setPhase(opener), 800)
    return clearTimer
  }, [])

  // ── Prematch → live auto-advance ──────────────────────────────────────────
  useEffect(() => {
    if (phase !== 'prematch') return
    timer.current = setTimeout(() => { setPhase('live'); setMomentIdx(0) }, 2200)
    return clearTimer
  }, [phase, matchIdx])

  // ── Moment drip-feed ──────────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== 'live') return
    const m = matches[matchIdx]
    if (!m) return
    const total = m.match.moments.length

    if (momentIdx < total) {
      const isPenalty = m.match.moments[momentIdx]?.type === 'penalty'
      timer.current = setTimeout(() => {
        setMomentIdx(i => i + 1)
        // scroll to bottom of feed
        scrollRef.current?.scrollTo({ top: 99999, behavior: 'smooth' })
      }, isPenalty ? 1100 : 950)
    } else {
      // All moments shown → pause for drama then reveal scoreboard
      timer.current = setTimeout(() => setPhase('scoreboard'), 800)
    }
    return clearTimer
  }, [phase, momentIdx, matchIdx, matches])

  // ── Skip / tap-through ────────────────────────────────────────────────────
  const skipPhase = useCallback(() => {
    clearTimer()
    const m = matches[matchIdx]
    if (!m) return

    if (phase === 'prematch') {
      setPhase('live')
      setMomentIdx(0)
    } else if (phase === 'live') {
      setMomentIdx(m.match.moments.length)
      setPhase('scoreboard')
    }
    // scoreboard phase: tap does nothing — must use the button
  }, [phase, matchIdx, matches])

  // ── Advance to next match or end ──────────────────────────────────────────
  const advance = useCallback(() => {
    clearTimer()
    if (!finalResult) return

    if (matchIdx < matches.length - 1) {
      setMatchIdx(i => i + 1)
      setMomentIdx(0)
      setPhase('prematch')
    } else {
      dispatch({ type: 'SET_TOURNAMENT', result: finalResult })
    }
  }, [finalResult, matchIdx, matches, dispatch])

  // ── Loading screen ────────────────────────────────────────────────────────
  if (phase === 'loading' || matches.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-5 px-4">
        <div className="text-5xl animate-spin" style={{ animationDuration: '1.5s' }}>⚽</div>
        <p className="text-slate-400 text-sm">Drawing the brackets...</p>
      </div>
    )
  }

  // ── Tournament intro — sets the nostalgic scene before the first match ──────
  if (phase === 'intro') {
    const lore = getLore(worldCup.year)!
    const compName = worldCup.competition === 'Euro' ? 'European Championship' : 'World Cup'
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center gap-6 px-6 py-10 text-center bg-slate-900"
        onClick={() => { clearTimer(); setPhase('prematch') }}
      >
        <div className="text-amber-400/80 text-xs font-bold uppercase tracking-[0.3em]">
          {compName}
        </div>

        {/* Nickname — the way fans actually say it */}
        <h1 className="text-4xl font-black text-white leading-none">{lore.nickname}</h1>

        <div className="inline-flex items-center gap-2 text-slate-400 text-sm">
          <span>📍 {lore.host}</span>
          <span className="text-slate-700">·</span>
          <span>{worldCup.year}</span>
        </div>

        {/* Tagline */}
        <p className="text-amber-200/90 text-base italic leading-relaxed max-w-sm">
          {lore.tagline}
        </p>

        {/* England's story — the iconic headlines */}
        <div className="rounded-2xl bg-white/5 border border-white/10 px-5 py-4 max-w-sm">
          <div className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-2">
            England&rsquo;s story
          </div>
          <p className="text-slate-200 text-sm leading-relaxed">{lore.englandTale}</p>
        </div>

        {worldCup.englandQualified === false && (
          <div className="text-amber-400/70 text-xs">
            England didn&rsquo;t qualify this year — you&rsquo;re here on a wildcard. Make it count.
          </div>
        )}

        <button
          onClick={(e) => { e.stopPropagation(); clearTimer(); setPhase('prematch') }}
          className="mt-2 bg-amber-400 text-slate-900 font-black text-lg px-8 py-3.5 rounded-2xl active:scale-95 transition-all shadow-[0_0_32px_rgba(251,191,36,0.35)]"
        >
          Begin the Campaign →
        </button>
        <p className="text-slate-700 text-xs">or tap anywhere</p>
      </div>
    )
  }

  const { match, roundLabel, isKnockout, isFinal } = matches[matchIdx]
  const opponent     = match.home === 'England' ? match.away : match.home
  const oppRating    = getTeamRating(opponent, worldCup.year)
  const engStrength  = calculateTeamStrength(squad, formation)
  const visibleMoments = match.moments.slice(0, momentIdx)

  // Running score — derived from visible goal moments
  let engScore = 0, oppScore = 0
  for (const m of visibleMoments) {
    if (m.type === 'goal' && m.team === 'england')   engScore++
    if (m.type === 'goal' && m.team === 'opponent')  oppScore++
  }
  // In scoreboard phase, show the real final score
  const showFinalScore = phase === 'scoreboard'
  const displayEng = showFinalScore ? match.homeGoals : engScore
  const displayOpp = showFinalScore ? match.awayGoals : oppScore

  const engWon  = match.englandWon
  const isDraw  = !isKnockout && match.homeGoals === match.awayGoals
  const scoreColour =
    showFinalScore
      ? engWon  ? 'text-emerald-400'
        : isDraw ? 'text-yellow-400'
        : 'text-red-400'
      : 'text-white'

  // Is this the last match we'll ever see? (knocked out or won)
  const isEliminated = isKnockout && !engWon
  const isChampion   = finalResult?.exitRound === 'Winner' && matchIdx === matches.length - 1

  return (
    <div
      className="min-h-screen flex flex-col bg-slate-900 overflow-hidden"
      onClick={phase !== 'scoreboard' ? skipPhase : undefined}
    >
      {/* ── Top bar ─────────────────────────────────────────────── */}
      <div className="px-4 pt-5 pb-3 flex flex-col items-center gap-1 border-b border-white/8">
        <div className="text-slate-500 text-xs font-bold uppercase tracking-widest">
          {worldCup.year} {worldCup.competition === 'Euro' ? 'European Championship' : 'World Cup'} · {worldCup.host.split(' / ')[0]} · {roundLabel}
        </div>

        {/* Teams + score */}
        <div className="flex items-center gap-4 w-full max-w-sm mt-1">
          <div className="flex-1 text-center">
            <div className="text-2xl mb-0.5">🏴󠁧󠁢󠁥󠁮󠁧󠁿</div>
            <div className="text-white font-black text-sm leading-tight">England</div>
            <div className="text-slate-600 text-xs">{engStrength.overall} OVR</div>
          </div>

          {/* Score */}
          <div className="text-center min-w-[72px]">
            {phase === 'prematch' ? (
              <div className="text-slate-400 font-black text-2xl">vs</div>
            ) : (
              <div className={`font-black text-3xl transition-all duration-500 ${scoreColour}`}>
                {displayEng} – {displayOpp}
              </div>
            )}
            {showFinalScore && match.wentToPenalties && (
              <div className="text-slate-400 text-xs mt-0.5">
                pens {match.homePenalties}–{match.awayPenalties}
              </div>
            )}
          </div>

          <div className="flex-1 text-center">
            <div className="text-2xl mb-0.5">🌍</div>
            <div className="text-white font-black text-sm leading-tight">{opponent}</div>
            <div className="text-slate-600 text-xs">{oppRating} OVR</div>
          </div>
        </div>
      </div>

      {/* ── Prematch splash ──────────────────────────────────────── */}
      {phase === 'prematch' && (
        <div className="flex-1 flex flex-col items-center justify-center gap-6 px-6 text-center">
          <div className="flex gap-3">
            {[0, 1, 2].map(i => (
              <div key={i} className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }} />
            ))}
          </div>
          <p className="text-slate-300 text-base leading-relaxed max-w-xs">{tensionLine}</p>
          <p className="text-slate-600 text-xs">Tap to kick off</p>
        </div>
      )}

      {/* ── Live moment feed ─────────────────────────────────────── */}
      {(phase === 'live' || phase === 'scoreboard') && (
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-2.5">
          {visibleMoments.map((moment, i) => (
            <MomentCard key={i} moment={moment} opponent={opponent} />
          ))}

          {/* Typing indicator while waiting for next moment */}
          {phase === 'live' && momentIdx < match.moments.length && (
            <div className="flex gap-1 items-center px-3 py-2">
              {[0, 1, 2].map(i => (
                <div key={i} className="w-1.5 h-1.5 rounded-full bg-white/25 animate-pulse"
                  style={{ animationDelay: `${i * 0.18}s` }} />
              ))}
            </div>
          )}

          {/* Full time banner once all moments are shown */}
          {phase === 'scoreboard' && (
            <div className="text-center py-2">
              <span className="text-slate-500 text-xs font-bold uppercase tracking-widest">
                {match.wentToPenalties ? '— Penalty Shootout —' : '— Full Time —'}
              </span>
            </div>
          )}
        </div>
      )}

      {/* ── Scoreboard result panel ──────────────────────────────── */}
      {phase === 'scoreboard' && (
        <div className="px-4 pb-8 pt-2 border-t border-white/8 flex flex-col gap-3">
          {/* Result verdict */}
          <div className={`rounded-2xl px-4 py-4 text-center ${
            isChampion        ? 'bg-amber-400/20 border border-amber-400/40' :
            isEliminated      ? 'bg-red-500/15 border border-red-500/30' :
            engWon            ? 'bg-emerald-500/15 border border-emerald-500/30' :
            isDraw            ? 'bg-yellow-500/15 border border-yellow-500/30' :
                                'bg-red-500/10 border border-red-500/20'
          }`}>
            <div className="text-3xl mb-1.5">
              {isChampion ? '🏆' : isEliminated ? '💀' : engWon ? '✅' : isDraw ? '🤝' : '❌'}
            </div>
            <div className={`font-black text-xl leading-tight ${
              isChampion   ? 'text-amber-300' :
              isEliminated ? 'text-red-300' :
              engWon       ? 'text-emerald-300' :
              isDraw       ? 'text-yellow-300' :
                             'text-red-300'
            }`}>
              {isChampion && worldCup.competition === 'Euro' ? 'EURO CHAMPIONS!' :
               isChampion        ? 'IT\'S COMING HOME!' :
               isEliminated && match.wentToPenalties ? 'Out on penalties. Again.' :
               isEliminated      ? 'England are out.' :
               engWon && isFinal ? 'INTO THE FINAL — dare to dream.' :
               engWon            ? 'England through!' :
               isDraw            ? 'Honours even.' :
                                   'England lose.'}
            </div>
            {isEliminated && (
              <p className="text-slate-500 text-xs mt-1 leading-snug">
                {match.wentToPenalties
                  ? 'Out on penalties. Sixty years of hurt in a single kick.'
                  : 'Another tournament, another exit. But the dream never dies.'}
              </p>
            )}
            {isChampion && (
              <p className="text-amber-400/70 text-xs mt-1">
                {worldCup.competition === 'Euro'
                  ? "They've only gone and done it. England are European Champions!"
                  : "Sixty years of hurt. Finally. It was always coming home."}
              </p>
            )}
          </div>

          <button
            onClick={(e) => { e.stopPropagation(); advance() }}
            className={`w-full py-4 rounded-2xl font-black text-lg active:scale-95 transition-all ${
              isEliminated || isChampion
                ? 'bg-amber-400 text-slate-900 shadow-[0_0_24px_rgba(251,191,36,0.3)]'
                : engWon
                  ? 'bg-white text-slate-900'
                  : 'bg-white/10 text-white'
            }`}
          >
            {isEliminated || isChampion || (matchIdx === matches.length - 1)
              ? 'See Full Campaign →'
              : 'Next Match →'}
          </button>

          {phase !== 'scoreboard' && (
            <p className="text-center text-slate-700 text-xs">Tap anywhere to skip</p>
          )}
        </div>
      )}

      {/* Tap-to-skip hint during live feed */}
      {phase === 'live' && (
        <div className="px-4 pb-3 text-center">
          <p className="text-slate-700 text-xs">Tap to skip</p>
        </div>
      )}
    </div>
  )
}

// ─── Moment card ──────────────────────────────────────────────────────────────

function MomentCard({ moment, opponent }: { moment: MatchMoment; opponent: string }) {
  const isEngGoal  = moment.type === 'goal'    && moment.team === 'england'
  const isOppGoal  = moment.type === 'goal'    && moment.team === 'opponent'
  const isPenEng   = moment.type === 'penalty' && moment.team === 'england'
  const isPenOpp   = moment.type === 'penalty' && moment.team === 'opponent'
  const isBadCard  = moment.type === 'card'    && moment.team === 'england'
  const isGoodCard = moment.type === 'card'    && moment.team === 'opponent'

  const bg =
    isEngGoal                        ? 'bg-emerald-500/20 border-emerald-500/40' :
    isOppGoal                        ? 'bg-red-500/15 border-red-500/30' :
    isPenEng && moment.text.includes('SCORED') ? 'bg-emerald-500/15 border-emerald-500/30' :
    isPenOpp && moment.text.includes('aved')   ? 'bg-emerald-500/10 border-emerald-500/20' :
    moment.type === 'save'           ? 'bg-sky-500/15 border-sky-500/30' :
    moment.type === 'post'           ? 'bg-orange-500/10 border-orange-500/20' :
    moment.type === 'miss'           ? 'bg-slate-500/10 border-white/8' :
    isBadCard                        ? 'bg-red-500/20 border-red-500/40' :
    isGoodCard                       ? 'bg-amber-500/10 border-amber-500/20' :
                                       'bg-white/5 border-white/8'

  const textColour =
    isEngGoal                        ? 'text-emerald-200' :
    isOppGoal                        ? 'text-red-300' :
    moment.type === 'save'           ? 'text-sky-300' :
    moment.type === 'post'           ? 'text-orange-300' :
    moment.type === 'miss'           ? 'text-slate-400' :
    isBadCard                        ? 'text-red-300' :
    isGoodCard                       ? 'text-amber-300' :
                                       'text-slate-300'

  // Make England goals extra prominent
  const isHighlight = isEngGoal || isOppGoal

  return (
    <div className={`flex items-start gap-3 rounded-xl border px-3 py-2.5 ${bg} ${
      isHighlight ? 'shadow-lg' : ''
    }`}>
      <span className="text-slate-500 text-xs font-mono tabular-nums shrink-0 mt-0.5 w-7 text-right">
        {moment.minute}'
      </span>
      <span className="text-lg shrink-0">
        {MOMENT_ICON[moment.type] ?? '📢'}
      </span>
      <span className={`text-sm leading-snug font-medium ${textColour} ${
        isHighlight ? 'font-bold' : ''
      }`}>
        {moment.text}
      </span>
    </div>
  )
}
