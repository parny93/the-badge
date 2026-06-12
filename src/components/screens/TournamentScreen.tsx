'use client'
import { useEffect, useRef, useState, useCallback } from 'react'
import { Formation, GameAction, MatchMoment, MatchResult, RatedPlayer, WorldCupData } from '@/types'
import {
  TournamentRun, createTournamentRun, playNextEnglandMatch, runResult,
  nextOpponent, nextRoundType,
} from '@/lib/tournament'
import { AvailabilityEvent, rollAvailabilityEvents, injectEventMoments } from '@/lib/matchEvents'
import { calculateTeamStrength, FORMATIONS } from '@/lib/teamStrength'
import { Manager } from '@/data/managers'
import { getTeamRating } from '@/data/teamRatings'
import { getLore } from '@/data/tournamentLore'
import { displaySurname } from '@/lib/names'
import FormationDisplay from '@/components/ui/FormationDisplay'

// ─── Types ────────────────────────────────────────────────────────────────────

type Phase = 'loading' | 'intro' | 'team-sheet' | 'prematch' | 'live' | 'scoreboard'

const ROUND_LABELS: Record<string, string> = {
  Group: 'Group Stage',
  R32:   'Round of 32',
  R16:   'Round of 16',
  QF:    'Quarter-Final',
  SF:    'Semi-Final',
  Final: 'The Final',
}

// Short typographic tags replace the old emoji column — the row's colour
// already carries the mood; this just names the event type.
const MOMENT_TAG: Record<string, string> = {
  goal:    'GOAL',
  save:    'SAVE',
  miss:    'MISS',
  post:    'POST',
  card:    'CARD',
  penalty: 'PEN',
  chance:  'CHANCE',
  info:    '',
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

interface Unavailability {
  games: number
  reason: string
}

interface Props {
  worldCup: WorldCupData
  squad: (RatedPlayer | null)[]
  formation: Formation
  manager?: Manager
  captainId?: string | null
  bench?: (RatedPlayer | null)[]
  dispatch: React.Dispatch<GameAction>
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function TournamentScreen({ worldCup, squad, formation, manager, captainId, bench, dispatch }: Props) {
  const [run, setRun]               = useState<TournamentRun | null>(null)
  const [phase, setPhase]           = useState<Phase>('loading')
  const [match, setMatch]           = useState<MatchResult | null>(null)
  const [roundLabel, setRoundLabel] = useState('Group Stage')
  const [isKnockoutMatch, setIsKnockoutMatch] = useState(false)
  const [momentIdx, setMomentIdx]   = useState(0)
  const [unavailable, setUnavailable] = useState<Record<string, Unavailability>>({})
  const [news, setNews]             = useState<string[]>([])
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null)
  const [tensionLine]               = useState(() => TENSION_LINES[Math.floor(Math.random() * TENSION_LINES.length)])

  const pendingEvents = useRef<AvailabilityEvent[]>([])
  const timer   = useRef<ReturnType<typeof setTimeout> | null>(null)
  const scrollRef = useRef<HTMLDivElement | null>(null)

  const clearTimer = () => { if (timer.current) clearTimeout(timer.current) }

  // ── Create the run on mount ────────────────────────────────────────────────
  useEffect(() => {
    setRun(createTournamentRun(worldCup))
    const opener: Phase = getLore(worldCup.year) ? 'intro' : 'team-sheet'
    timer.current = setTimeout(() => setPhase(opener), 800)
    return clearTimer
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Kick off the next England match with the CURRENT squad ────────────────
  const kickOff = useCallback(() => {
    if (!run || run.stage === 'done') return
    clearTimer()
    const { run: nextRun, match: m, roundType } = playNextEnglandMatch(
      run, squad, formation, { manager, captainId, bench }
    )
    // Injuries / suspensions — rolled per match, woven into the feed.
    const events = rollAvailabilityEvents(squad)
    injectEventMoments(m, events)
    pendingEvents.current = events

    setRun(nextRun)
    setMatch(m)
    setRoundLabel(ROUND_LABELS[roundType] ?? roundType)
    setIsKnockoutMatch(roundType !== 'Group')
    setMomentIdx(0)
    setPhase('prematch')
  }, [run, squad, formation, manager, captainId, bench])

  // ── Prematch → live auto-advance ──────────────────────────────────────────
  useEffect(() => {
    if (phase !== 'prematch') return
    timer.current = setTimeout(() => { setPhase('live'); setMomentIdx(0) }, 2200)
    return clearTimer
  }, [phase])

  // ── Moment drip-feed ──────────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== 'live' || !match) return
    const total = match.moments.length

    if (momentIdx < total) {
      const isPenalty = match.moments[momentIdx]?.type === 'penalty'
      timer.current = setTimeout(() => {
        setMomentIdx(i => i + 1)
        scrollRef.current?.scrollTo({ top: 99999, behavior: 'smooth' })
      }, isPenalty ? 1100 : 950)
    } else {
      timer.current = setTimeout(() => setPhase('scoreboard'), 800)
    }
    return clearTimer
  }, [phase, momentIdx, match])

  // ── Skip / tap-through ────────────────────────────────────────────────────
  const skipPhase = useCallback(() => {
    clearTimer()
    if (!match) return
    if (phase === 'prematch') {
      setPhase('live')
      setMomentIdx(0)
    } else if (phase === 'live') {
      setMomentIdx(match.moments.length)
      setPhase('scoreboard')
    }
  }, [phase, match])

  // ── Advance: tournament over → result; otherwise next team sheet ──────────
  const advance = useCallback(() => {
    clearTimer()
    if (!run) return
    if (run.stage === 'done') {
      dispatch({ type: 'SET_TOURNAMENT', result: runResult(run) })
      return
    }
    // Players who sat this match out have served one game; new knocks begin.
    setUnavailable(prev => {
      const next: Record<string, Unavailability> = {}
      for (const [id, u] of Object.entries(prev)) {
        if (u.games - 1 > 0) next[id] = { ...u, games: u.games - 1 }
      }
      for (const e of pendingEvents.current) {
        next[e.playerId] = { games: e.games, reason: e.type === 'injury' ? 'Injured' : 'Suspended' }
      }
      return next
    })
    setNews(pendingEvents.current.map(e => e.text))
    pendingEvents.current = []
    setSelectedSlot(null)
    setPhase('team-sheet')
  }, [run, dispatch])

  // ── Loading ───────────────────────────────────────────────────────────────
  if (phase === 'loading' || !run) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-5 px-4">
        <div className="text-5xl animate-spin" style={{ animationDuration: '1.5s' }}>⚽</div>
        <p className="text-slate-400 text-sm">Drawing the brackets...</p>
      </div>
    )
  }

  // ── Tournament intro — sets the nostalgic scene before the first match ─────
  if (phase === 'intro') {
    const lore = getLore(worldCup.year)!
    const compName = worldCup.competition === 'Euro' ? 'European Championship' : 'World Cup'
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center gap-6 px-6 py-10 text-center bg-[#0c1420]"
        onClick={() => { clearTimer(); setPhase('team-sheet') }}
      >
        <div className="text-amber-400/80 text-xs font-bold uppercase tracking-[0.3em]">
          {compName}
        </div>
        <h1 className="text-4xl font-black text-white leading-none">{lore.nickname}</h1>
        <div className="inline-flex items-center gap-2 text-slate-400 text-sm">
          <span>{lore.host}</span>
          <span className="text-slate-700">·</span>
          <span>{worldCup.year}</span>
        </div>
        <p className="text-amber-200/90 text-base italic leading-relaxed max-w-sm">
          {lore.tagline}
        </p>
        <div className="rounded-2xl bg-white/5 border border-white/10 px-5 py-4 max-w-sm">
          <div className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-2">
            England&rsquo;s story
          </div>
          <p className="text-slate-200 text-sm leading-relaxed">{lore.englandTale}</p>
        </div>
        {worldCup.englandQualified === false && (
          <div className="text-amber-400/70 text-xs">
            {worldCup.englandEntered === false
              ? 'England didn’t even enter this one. Pure what-if territory — rewrite history.'
              : 'England didn’t qualify this year — you’re here on a wildcard. Make it count.'}
          </div>
        )}
        <button
          onClick={(e) => { e.stopPropagation(); clearTimer(); setPhase('team-sheet') }}
          className="mt-2 bg-amber-400 text-slate-900 font-black text-lg px-8 py-3.5 rounded-2xl active:scale-95 transition-all shadow-[0_0_32px_rgba(251,191,36,0.35)]"
        >
          Begin the Campaign →
        </button>
        <p className="text-slate-700 text-xs">or tap anywhere</p>
      </div>
    )
  }

  // ── Team sheet — rotate between matches, resolve injuries/suspensions ──────
  if (phase === 'team-sheet') {
    const opponent = nextOpponent(run) ?? 'TBD'
    const roundType = nextRoundType(run) ?? 'Group'
    const flaggedIds = (squad.filter(Boolean) as RatedPlayer[])
      .filter(p => unavailable[p.id])
      .map(p => p.id)
    const benchPlayers = bench ?? []
    const slots = FORMATIONS[formation]

    const benchUsable = (b: RatedPlayer | null, slotIndex: number | null): boolean => {
      if (!b || unavailable[b.id]) return false
      if (slotIndex === null) return false
      const slotIsGK = slots[slotIndex]?.position === 'GK'
      return (b.positions[0] === 'GK') === slotIsGK
    }

    // Block kick-off only while an unavailable starter has a legal replacement
    // sitting on the bench.
    const blockingSlot = squad.findIndex((p, i) =>
      p && unavailable[p.id] && benchPlayers.some(b => benchUsable(b, i))
    )
    const canKickOff = blockingSlot === -1

    return (
      <div className="min-h-screen px-4 py-5 pb-28 flex flex-col gap-3 bg-[#0c1420]">
        <div className="text-center">
          <div className="text-slate-500 text-xs font-bold uppercase tracking-widest">
            Next · {ROUND_LABELS[roundType] ?? roundType}
          </div>
          <div className="text-white font-black text-2xl leading-tight mt-0.5">
            England v {opponent}
          </div>
          <div className="text-slate-600 text-xs mt-0.5">
            {getTeamRating(opponent, worldCup.year)} OVR opposition · your XI {calculateTeamStrength(squad, formation, { manager, captainId, bench }).overall} OVR
          </div>
        </div>

        {/* Treatment-room news from the last match */}
        {news.length > 0 && (
          <div className="rounded-xl bg-amber-400/10 border border-amber-400/30 px-3.5 py-2.5 flex flex-col gap-1">
            {news.map((n, i) => (
              <p key={i} className="text-amber-300 text-xs leading-snug">{n}</p>
            ))}
          </div>
        )}
        {flaggedIds.length > 0 && (
          <p className="text-red-300 text-xs text-center">
            {flaggedIds.map(id => {
              const p = (squad.filter(Boolean) as RatedPlayer[]).find(x => x.id === id)!
              return `${displaySurname(p.name)} (${unavailable[id].reason.toLowerCase()}, ${unavailable[id].games} more)`
            }).join(' · ')} — tap him, then a replacement below.
          </p>
        )}

        <FormationDisplay
          squad={squad}
          formation={formation}
          activeIndex={selectedSlot ?? undefined}
          onSelectSlot={i => setSelectedSlot(s => s === i ? null : i)}
          captainId={captainId}
          flaggedIds={flaggedIds}
        />

        {/* Bench */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Bench</span>
            <span className="text-slate-600 text-[10px]">
              {selectedSlot === null ? 'Tap a starter to rotate' : 'Now tap his replacement'}
            </span>
          </div>
          {benchPlayers.filter(Boolean).length === 0 ? (
            <p className="text-slate-600 text-xs">No bench drafted — the XI goes again.</p>
          ) : (
            <div className="grid grid-cols-4 gap-1.5">
              {benchPlayers.map((b, bi) => {
                if (!b) return null
                const out = !!unavailable[b.id]
                const usable = benchUsable(b, selectedSlot)
                return (
                  <button
                    key={bi}
                    disabled={!usable}
                    onClick={() => {
                      if (selectedSlot === null) return
                      dispatch({ type: 'SWAP_PLAYER', slotIndex: selectedSlot, benchIndex: bi })
                      setSelectedSlot(null)
                    }}
                    className={`rounded-lg border px-1.5 py-2 text-center transition-all ${
                      out ? 'border-red-500/40 bg-red-500/10 opacity-60' :
                      usable ? 'border-amber-400/60 bg-amber-400/10' :
                      'border-white/10 bg-white/5 opacity-70'
                    }`}
                  >
                    <div className="text-white text-[11px] font-bold leading-tight truncate">
                      {displaySurname(b.name)}
                    </div>
                    <div className="text-slate-500 text-[9px]">
                      {out ? unavailable[b.id].reason : `${b.positions[0]} · ${b.ratingAtYear}`}
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        <div className="fixed bottom-4 left-4 right-4 z-30 max-w-md mx-auto">
          <button
            onClick={kickOff}
            disabled={!canKickOff}
            className="w-full bg-amber-400 text-slate-900 font-black text-lg py-4 rounded-2xl active:scale-95 transition-all shadow-2xl disabled:opacity-50"
          >
            {canKickOff ? 'Kick Off →' : 'Resolve your team sheet first'}
          </button>
        </div>
      </div>
    )
  }

  // ── Match phases ──────────────────────────────────────────────────────────
  if (!match) return null
  const opponent     = match.away
  const oppRating    = getTeamRating(opponent, worldCup.year)
  const engStrength  = calculateTeamStrength(squad, formation, { manager, captainId, bench })
  const visibleMoments = match.moments.slice(0, momentIdx)

  let engScore = 0, oppScore = 0
  for (const m of visibleMoments) {
    if (m.type === 'goal' && m.team === 'england')   engScore++
    if (m.type === 'goal' && m.team === 'opponent')  oppScore++
  }
  const showFinalScore = phase === 'scoreboard'
  const displayEng = showFinalScore ? match.homeGoals : engScore
  const displayOpp = showFinalScore ? match.awayGoals : oppScore

  const engWon  = match.englandWon
  const isDraw  = !isKnockoutMatch && match.homeGoals === match.awayGoals
  const scoreColour =
    showFinalScore
      ? engWon  ? 'text-emerald-400'
        : isDraw ? 'text-yellow-400'
        : 'text-red-400'
      : 'text-white'

  const done        = run.stage === 'done'
  const isChampion  = done && run.exitRound === 'Winner'
  const isEliminated = done && run.exitRound !== 'Winner' && isKnockoutMatch
  const isFinal     = roundLabel === 'The Final'

  return (
    <div
      className="min-h-screen flex flex-col bg-[#0c1420] overflow-hidden"
      onClick={phase !== 'scoreboard' ? skipPhase : undefined}
    >
      {/* ── Top bar ─────────────────────────────────────────────── */}
      <div className="px-4 pt-5 pb-3 flex flex-col items-center gap-1 border-b border-white/8">
        <div className="text-slate-500 text-xs font-bold uppercase tracking-widest">
          {worldCup.year} {worldCup.competition === 'Euro' ? 'European Championship' : 'World Cup'} · {worldCup.host.split(' / ')[0]} · {roundLabel}
        </div>

        <div className="flex items-center gap-4 w-full max-w-sm mt-1">
          <div className="flex-1 text-center">
            <div className="text-white font-black text-sm leading-tight">England</div>
            <div className="text-slate-600 text-xs">{engStrength.overall} OVR</div>
          </div>

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
            <MomentCard key={i} moment={moment} />
          ))}

          {phase === 'live' && momentIdx < match.moments.length && (
            <div className="flex gap-1 items-center px-3 py-2">
              {[0, 1, 2].map(i => (
                <div key={i} className="w-1.5 h-1.5 rounded-full bg-white/25 animate-pulse"
                  style={{ animationDelay: `${i * 0.18}s` }} />
              ))}
            </div>
          )}

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
          <div className={`rounded-2xl px-4 py-4 text-center ${
            isChampion        ? 'bg-amber-400/20 border border-amber-400/40' :
            isEliminated      ? 'bg-red-500/15 border border-red-500/30' :
            engWon            ? 'bg-emerald-500/15 border border-emerald-500/30' :
            isDraw            ? 'bg-yellow-500/15 border border-yellow-500/30' :
                                'bg-red-500/10 border border-red-500/20'
          }`}>
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
            {done ? 'See Full Campaign →' : 'Next Match →'}
          </button>
        </div>
      )}

      {phase === 'live' && (
        <div className="px-4 pb-3 text-center">
          <p className="text-slate-700 text-xs">Tap to skip</p>
        </div>
      )}
    </div>
  )
}

// ─── Moment card ──────────────────────────────────────────────────────────────

function MomentCard({ moment }: { moment: MatchMoment }) {
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

  const isHighlight = isEngGoal || isOppGoal

  return (
    <div className={`flex items-start gap-3 rounded-xl border px-3 py-2.5 ${bg} ${
      isHighlight ? 'shadow-lg' : ''
    }`}>
      <span className="text-slate-500 text-xs font-mono tabular-nums shrink-0 mt-0.5 w-7 text-right">
        {moment.minute}'
      </span>
      {MOMENT_TAG[moment.type] && (
        <span className={`text-[9px] font-black tracking-wider shrink-0 mt-1 w-11 ${textColour} opacity-70`}>
          {MOMENT_TAG[moment.type]}
        </span>
      )}
      <span className={`text-sm leading-snug font-medium ${textColour} ${
        isHighlight ? 'font-bold' : ''
      }`}>
        {moment.text}
      </span>
    </div>
  )
}
