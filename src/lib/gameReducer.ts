import { GameState, GameAction } from '@/types'
import { FORMATIONS } from './teamStrength'

export const INITIAL_STATE: GameState = {
  screen: 'home',
  mode: 'alltime',
  squadYear: 2026,
  worldCup: null,
  difficulty: 'prime',
  formation: '4-3-3',
  squad: Array(11).fill(null),
  pickIndex: 0,
  tournament: null,
}

function firstEmpty(squad: GameState['squad'], from = 0): number {
  for (let i = from; i < squad.length; i++) if (!squad[i]) return i
  for (let i = 0; i < squad.length; i++) if (!squad[i]) return i
  return -1
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'START':
      return { ...INITIAL_STATE, screen: 'mode-select' }

    case 'SELECT_MODE': {
      // draft & alltime use prime ratings; manager uses historical (year-rated)
      const difficulty = action.mode === 'manager' ? 'historical' : 'prime'
      const nextScreen = action.mode === 'manager' ? 'manager-year' : 'formation'
      return { ...state, mode: action.mode, difficulty, screen: nextScreen }
    }

    case 'SELECT_YEAR':
      return { ...state, squadYear: action.year, screen: 'formation' }

    case 'SELECT_FORMATION': {
      const slots = FORMATIONS[action.formation]
      return {
        ...state,
        formation: action.formation,
        squad: Array(slots.length).fill(null),
        pickIndex: 0,
        screen: state.mode === 'draft' ? 'draft' : 'free-pick',
      }
    }

    case 'SET_ACTIVE_SLOT':
      return { ...state, pickIndex: action.slotIndex }

    case 'PICK_PLAYER': {
      const newSquad = [...state.squad]
      newSquad[action.slotIndex] = action.player
      return {
        ...state,
        squad: newSquad,
        pickIndex: firstEmpty(newSquad, action.slotIndex + 1),
      }
    }

    case 'REMOVE_PLAYER': {
      const newSquad = [...state.squad]
      newSquad[action.slotIndex] = null
      return { ...state, squad: newSquad, pickIndex: action.slotIndex }
    }

    case 'REVIEW_SQUAD':
      return { ...state, screen: 'squad-review' }

    case 'CONFIRM_SQUAD':
      return { ...state, screen: 'tournament-select' }

    case 'SELECT_TOURNAMENT':
      return { ...state, worldCup: action.worldCup, screen: 'tournament' }

    case 'SET_TOURNAMENT':
      return { ...state, tournament: action.result, screen: 'result' }

    case 'BACK': {
      switch (state.screen) {
        case 'mode-select': return { ...state, screen: 'home' }
        case 'manager-year': return { ...state, screen: 'mode-select' }
        case 'formation': return { ...state, screen: state.mode === 'manager' ? 'manager-year' : 'mode-select' }
        case 'draft':
        case 'free-pick': return { ...state, screen: 'formation' }
        case 'squad-review': return { ...state, screen: state.mode === 'draft' ? 'draft' : 'free-pick' }
        case 'tournament-select': return { ...state, screen: 'squad-review' }
        default: return { ...state, screen: 'home' }
      }
    }

    case 'RESTART':
      return { ...INITIAL_STATE }

    default:
      return state
  }
}
