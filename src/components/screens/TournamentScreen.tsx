'use client'
import { useEffect, useState } from 'react'
import { Formation, GameAction, RatedPlayer, WorldCupData } from '@/types'
import { runTournament } from '@/lib/tournament'

interface Props {
  worldCup: WorldCupData
  squad: (RatedPlayer | null)[]
  formation: Formation
  dispatch: React.Dispatch<GameAction>
}

export default function TournamentScreen({ worldCup, squad, formation, dispatch }: Props) {
  const [status, setStatus] = useState<'simulating' | 'done'>('simulating')

  useEffect(() => {
    // Small delay so the user sees the loading state
    const t = setTimeout(() => {
      const result = runTournament(worldCup, squad, formation)
      dispatch({ type: 'SET_TOURNAMENT', result })
      setStatus('done')
    }, 1800)
    return () => clearTimeout(t)
  }, [])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 gap-6 text-center">
      <div className="text-6xl animate-bounce">⚽</div>
      <div>
        <h2 className="text-2xl font-black text-white">Simulating...</h2>
        <p className="text-slate-400 mt-1">
          Your England XI are taking on the {worldCup.year} World Cup.
        </p>
      </div>
      <div className="flex gap-1">
        {[0, 1, 2].map(i => (
          <div
            key={i}
            className="w-2 h-2 rounded-full bg-white/40 animate-pulse"
            style={{ animationDelay: `${i * 0.2}s` }}
          />
        ))}
      </div>
    </div>
  )
}
