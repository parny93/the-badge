'use client'
import { useReducer, useEffect, useRef } from 'react'
import { gameReducer, INITIAL_STATE, loadState, saveState } from '@/lib/gameReducer'
import { seedRng, resetRng } from '@/lib/rng'
import { DailyConfig, saveDailyResult } from '@/lib/daily'
import { recordRunStats } from '@/lib/lifetimeStats'
import { calculateTeamStrength } from '@/lib/teamStrength'
import { encodeRun, shootoutRecord, eraSpread } from '@/lib/runCodec'
import { getManager } from '@/data/managers'

import HomeScreen from '@/components/screens/HomeScreen'
import SettingsScreen from '@/components/screens/SettingsScreen'
import ModeSelectScreen from '@/components/screens/ModeSelectScreen'
import ManagerYearScreen from '@/components/screens/ManagerYearScreen'
import FormationScreen from '@/components/screens/FormationScreen'
import DraftScreen from '@/components/screens/DraftScreen'
import FreePickScreen from '@/components/screens/FreePickScreen'
import SquadReviewScreen from '@/components/screens/SquadReviewScreen'
import BenchScreen from '@/components/screens/BenchScreen'
import TournamentSelectScreen from '@/components/screens/TournamentSelectScreen'
import TournamentScreen from '@/components/screens/TournamentScreen'
import ResultScreen from '@/components/screens/ResultScreen'

function TopBar({ onBack }: { onBack: () => void }) {
  return (
    <div className="flex justify-between items-center px-4 pt-4 pb-0">
      <button onClick={onBack} className="text-slate-400 hover:text-white text-sm">← Back</button>
      <span className="text-slate-600 text-xs">🏴󠁧󠁢󠁥󠁮󠁧󠁿 The Badge</span>
    </div>
  )
}

interface Props {
  daily?: DailyConfig
}

export default function GameShell({ daily }: Props) {
  const [state, dispatch] = useReducer(gameReducer, INITIAL_STATE)
  const hydrated = useRef(false)
  const dailySaved = useRef(false)
  const statsRecorded = useRef(false)

  // Restore any in-progress game after mount (avoids SSR hydration mismatch).
  // Daily runs skip restore: they start fresh from the day's seed instead.
  useEffect(() => {
    if (daily) {
      seedRng(daily.seed)
      dispatch({ type: 'START_DAILY', date: daily.date, worldCup: daily.worldCup, formation: daily.formation })
    } else {
      resetRng()
      const saved = loadState()
      if (saved.screen !== 'home' && !saved.daily) dispatch({ type: 'HYDRATE', state: saved })
    }
    hydrated.current = true
  }, [daily])

  // Persist on every change once we've hydrated.
  useEffect(() => {
    if (hydrated.current) saveState(state)
  }, [state])

  // Lifetime stats (shootouts won/lost, titles) — every finished run counts.
  useEffect(() => {
    if (state.screen !== 'result') {
      statsRecorded.current = false
      return
    }
    if (statsRecorded.current || !state.tournament) return
    statsRecorded.current = true
    const pens = shootoutRecord(state.tournament)
    recordRunStats({ exit: state.tournament.exitRound, wonPens: pens.won, lostPens: pens.lost })
  }, [state.screen, state.tournament])

  // Record the Daily Challenge result the moment the run finishes.
  useEffect(() => {
    if (!state.daily || state.screen !== 'result' || dailySaved.current) return
    if (!state.tournament || !state.worldCup) return
    dailySaved.current = true
    const strength = calculateTeamStrength(state.squad, state.formation)
    const pens = shootoutRecord(state.tournament)
    const payload = {
      v: 1 as const,
      mode: state.mode,
      formation: state.formation,
      year: state.worldCup.year,
      comp: (state.worldCup.competition === 'Euro' ? 'Euro' : 'WorldCup') as 'Euro' | 'WorldCup',
      exit: state.tournament.exitRound,
      chem: strength.chemistry.score,
      ovr: strength.overall,
      hard: state.hardMode,
      wonPens: pens.won,
      lostPens: pens.lost,
      xi: state.squad.map(p => p?.id ?? '').filter(Boolean),
      captain: state.captainId ?? undefined,
      manager: state.managerId ?? undefined,
      bench: state.bench.filter(Boolean).map(p => p!.id),
      daily: state.daily,
    }
    saveDailyResult({
      date: state.daily,
      exit: state.tournament.exitRound,
      chem: strength.chemistry.score,
      ovr: strength.overall,
      era: eraSpread(state.squad),
      wonPens: pens.won,
      lostPens: pens.lost,
      hard: state.hardMode,
      runId: encodeRun(payload),
    })
  }, [state])

  const { screen, mode, squadYear, worldCup, formation, squad, pickIndex, tournament } = state
  const back = () => dispatch({ type: 'BACK' })

  return (
    <main className="max-w-md mx-auto min-h-screen bg-[#0c1420] text-white relative">
      {screen === 'home' && <HomeScreen dispatch={dispatch} />}

      {screen === 'settings' && (
        <><TopBar onBack={back} />
        <SettingsScreen
          yearFrom={state.yearFrom}
          yearTo={state.yearTo}
          difficultyLevel={state.difficultyLevel}
          dispatch={dispatch}
        /></>
      )}

      {screen === 'mode-select' && (
        <><TopBar onBack={back} /><ModeSelectScreen dispatch={dispatch} /></>
      )}

      {screen === 'manager-year' && (
        <><TopBar onBack={back} />
        <ManagerYearScreen yearFrom={state.yearFrom} yearTo={state.yearTo} dispatch={dispatch} /></>
      )}

      {screen === 'formation' && (
        <><TopBar onBack={back} /><FormationScreen dispatch={dispatch} /></>
      )}

      {screen === 'draft' && (
        <DraftScreen
          formation={formation}
          squad={squad}
          bench={state.bench}
          difficultyLevel={state.difficultyLevel}
          respinsLeft={state.respinsLeft}
          yearFrom={state.yearFrom}
          yearTo={state.yearTo}
          daily={state.daily}
          dispatch={dispatch}
        />
      )}

      {screen === 'free-pick' && (
        <FreePickScreen
          mode={mode}
          squadYear={squadYear}
          formation={formation}
          squad={squad}
          pickIndex={pickIndex}
          hardMode={state.hardMode}
          yearFrom={state.yearFrom}
          yearTo={state.yearTo}
          dispatch={dispatch}
        />
      )}

      {screen === 'squad-review' && (
        <SquadReviewScreen
          mode={mode}
          squadYear={squadYear}
          formation={formation}
          squad={squad}
          captainId={state.captainId}
          dispatch={dispatch}
        />
      )}

      {screen === 'bench-pick' && (
        <BenchScreen
          mode={mode}
          squadYear={squadYear}
          squad={squad}
          bench={state.bench}
          benchIndex={state.benchIndex}
          hardMode={state.hardMode}
          yearFrom={state.yearFrom}
          yearTo={state.yearTo}
          dispatch={dispatch}
        />
      )}

      {screen === 'tournament-select' && (
        <><TopBar onBack={back} /><TournamentSelectScreen squad={squad} formation={formation} dispatch={dispatch} /></>
      )}

      {screen === 'tournament' && worldCup && (
        <TournamentScreen
          worldCup={worldCup}
          squad={squad}
          formation={formation}
          manager={state.managerId ? getManager(state.managerId) : undefined}
          captainId={state.captainId}
          bench={state.bench}
          dispatch={dispatch}
        />
      )}

      {screen === 'result' && worldCup && tournament && (
        <ResultScreen
          worldCup={worldCup}
          squad={squad}
          formation={formation}
          result={tournament}
          mode={mode}
          hardMode={state.hardMode}
          daily={state.daily}
          captainId={state.captainId}
          managerId={state.managerId}
          bench={state.bench}
          dispatch={dispatch}
        />
      )}
    </main>
  )
}
