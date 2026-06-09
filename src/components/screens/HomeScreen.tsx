'use client'
import { GameAction } from '@/types'

interface Props { dispatch: React.Dispatch<GameAction> }

export default function HomeScreen({ dispatch }: Props) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center gap-6">
      {/* Badge icon */}
      <div className="text-7xl select-none">🏴󠁧󠁢󠁥󠁮󠁧󠁿</div>

      <div>
        <h1 className="text-5xl font-black tracking-tight text-white">THE BADGE</h1>
        <p className="text-slate-400 mt-1 text-sm tracking-widest uppercase">
          Build your Golden Generation
        </p>
      </div>

      <p className="text-slate-300 max-w-xs leading-relaxed">
        Pick your all-time England XI and take them to the World Cup.
        Can you finally bring it home?
      </p>

      <button
        onClick={() => dispatch({ type: 'START' })}
        className="w-full max-w-xs bg-white text-slate-900 font-black text-lg py-4 rounded-2xl hover:bg-slate-100 active:scale-95 transition-all"
      >
        Let's Go →
      </button>

      <div className="flex items-center gap-4 text-slate-600 text-xs">
        <span>🏆 16 World Cups</span>
        <span>•</span>
        <span>👕 England only</span>
        <span>•</span>
        <span>⚽ Free forever</span>
      </div>
    </div>
  )
}
