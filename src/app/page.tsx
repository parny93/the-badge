'use client'
import { useReducer, useEffect, useRef } from 'react'
import { gameReducer, INITIAL_STATE, loadState, saveState } from '@/lib/gameReducer'

import HomeScreen from '@/components/screens/HomeScreen'
import ModeSelectScreen from '@/components/screens/ModeSelectScreen'
import ManagerYearScreen from '@/components/screens/ManagerYearScreen'
import FormationScreen from '@/components/screens/FormationScreen'
import DraftScreen from '@/components/screens/DraftScreen'
import FreePickScreen from '@/components/screens/FreePickScreen'
import SquadReviewScreen from '@/components/screens/SquadReviewScreen'
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

export default function Page() {
  const [state, dispatch] = useReducer(gameReducer, INITIAL_STATE)
  const hydrated = useRef(false)

  // Restore any in-progress game after mount (avoids SSR hydration mismatch).
  useEffect(() => {
    const saved = loadState()
    if (saved.screen !== 'home') dispatch({ type: 'HYDRATE', state: saved })
    hydrated.current = true
  }, [])

  // Persist on every change once we've hydrated.
  useEffect(() => {
    if (hydrated.current) saveState(state)
  }, [state])

  const { screen, mode, squadYear, worldCup, formation, squad, pickIndex, tournament } = state
  const back = () => dispatch({ type: 'BACK' })

  return (
    <main className="max-w-md mx-auto min-h-screen bg-[#0c1420] text-white relative">
      {screen === 'home' && <HomeScreen dispatch={dispatch} />}

      {screen === 'mode-select' && (
        <><TopBar onBack={back} /><ModeSelectScreen dispatch={dispatch} /></>
      )}

      {screen === 'manager-year' && (
        <><TopBar onBack={back} /><ManagerYearScreen dispatch={dispatch} /></>
      )}

      {screen === 'formation' && (
        <><TopBar onBack={back} /><FormationScreen dispatch={dispatch} /></>
      )}

      {screen === 'draft' && (
        <DraftScreen formation={formation} squad={squad} dispatch={dispatch} />
      )}

      {screen === 'free-pick' && (
        <FreePickScreen
          mode={mode}
          squadYear={squadYear}
          formation={formation}
          squad={squad}
          pickIndex={pickIndex}
          dispatch={dispatch}
        />
      )}

      {screen === 'squad-review' && (
        <SquadReviewScreen
          mode={mode}
          squadYear={squadYear}
          formation={formation}
          squad={squad}
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
          dispatch={dispatch}
        />
      )}

      {screen === 'result' && worldCup && tournament && (
        <ResultScreen
          worldCup={worldCup}
          squad={squad}
          formation={formation}
          result={tournament}
          dispatch={dispatch}
        />
      )}
    </main>
  )
}
