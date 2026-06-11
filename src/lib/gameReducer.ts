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
  hardMode: false,
  daily: null,
}

const STORAGE_KEY = 'thebadge.state.v1'

// Restore in-progress games across reloads so a refresh (or a mobile tab being
// evicted from memory) never dumps the player back to the home screen.
export function loadState(): GameState {
  if (typeof window === 'undefined') return INITIAL_STATE
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return INITIAL_STATE
    const parsed = JSON.parse(raw) as GameState
    if (parsed && typeof parsed.screen === 'string') return parsed
  } catch {}
  return INITIAL_STATE
}

export function saveState(state: GameState): void {
  if (typeof window === 'undefined') return
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {}
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
      // Daily Challenge: the tournament is fixed by the day's seed — skip selection.
      return state.daily && state.worldCup
        ? { ...state, screen: 'tournament' }
        : { ...state, screen: 'tournament-select' }

    case 'SET_HARD_MODE':
      return { ...state, hardMode: action.hard }

    case 'START_DAILY': {
      const slots = FORMATIONS[action.formation]
      return {
        ...INITIAL_STATE,
        mode: 'draft',
        difficulty: 'prime',
        screen: 'draft',
        daily: action.date,
        worldCup: action.worldCup,
        formation: action.formation,
        squad: Array(slots.length).fill(null),
      }
    }

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
          // Daily runs have a fixed formation — backing out exits to home.
          if (state.daily) return { ...INITIAL_STATE }
          return { ...state, screen: 'formation' }
        case 'free-pick': return { ...state, screen: 'formation' }
        case 'squad-review': return { ...state, screen: state.mode === 'draft' ? 'draft' : 'free-pick' }
        case 'tournament-select': return { ...state, screen: 'squad-review' }
        default: return { ...state, screen: 'home' }
      }
    }

    case 'HYDRATE':
      return action.state

    case 'RESTART':
      return { ...INITIAL_STATE }

    default:
      return state
  }
}
