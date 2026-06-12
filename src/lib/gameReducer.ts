import { BENCH_SIZE, GameState, GameAction, RatedPlayer, RESPINS, WorldCupData } from '@/types'
import { FORMATIONS } from './teamStrength'
import { WORLD_CUPS } from '@/data/worldCups'
import { EUROS } from '@/data/euros'

// Manager Mode already pins a year (its label IS the tournament), so resolve
// that single tournament rather than asking the player to choose it again.
function tournamentForYear(year: number): WorldCupData | null {
  return WORLD_CUPS.find(t => t.year === year) ?? EUROS.find(t => t.year === year) ?? null
}

// Bounds for the era-range setting.
export const ERA_MIN = 1950
export const ERA_MAX = 2026
// Default window starts at Mexico '86 — modern-football-and-back-a-bit; the
// full range stays one preset tap away.
export const ERA_DEFAULT_FROM = 1986

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
  difficultyLevel: 'normal',
  respinsLeft: RESPINS.normal,
  yearFrom: ERA_DEFAULT_FROM,
  yearTo: ERA_MAX,
  realFixtures: false,
  daily: null,
  bench: Array(BENCH_SIZE).fill(null),
  benchIndex: 0,
  captainId: null,
  penaltyTakers: [],
  managerId: null,
}

// v2: the settings-first flow added fields (yearFrom/yearTo/difficultyLevel/
// respinsLeft). Bumping the key drops stale v1 saves that would otherwise
// hydrate over the new flow and skip the settings screen entirely.
const STORAGE_KEY = 'thebadge.state.v2'

// Restore in-progress games across reloads so a refresh (or a mobile tab being
// evicted from memory) never dumps the player back to the home screen.
export function loadState(): GameState {
  if (typeof window === 'undefined') return INITIAL_STATE
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return INITIAL_STATE
    const parsed = JSON.parse(raw) as GameState
    // Merge over INITIAL_STATE so a save from an older build can never
    // resurrect with missing fields.
    if (parsed && typeof parsed.screen === 'string') return { ...INITIAL_STATE, ...parsed }
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
      return { ...INITIAL_STATE, screen: 'settings' }

    case 'SET_SETTINGS':
      return {
        ...state,
        yearFrom: action.yearFrom,
        yearTo: action.yearTo,
        difficultyLevel: action.level,
        hardMode: action.level === 'hard',
        respinsLeft: RESPINS[action.level],
        realFixtures: action.realFixtures,
        screen: 'mode-select',
      }

    case 'USE_RESPIN':
      return { ...state, respinsLeft: Math.max(0, state.respinsLeft - 1) }

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
        bench: Array(BENCH_SIZE).fill(null),
        benchIndex: 0,
        captainId: null,
        penaltyTakers: [],
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

    case 'CONFIRM_SQUAD': {
      // No armband handed out? The best-rated player wears it by default.
      const captainId = state.captainId ??
        (state.squad.filter(Boolean) as RatedPlayer[])
          .sort((a, b) => b.ratingAtYear - a.ratingAtYear)[0]?.id ?? null
      // Every mode picks its bench the same way now (pick 3 of 5, auto-fill 4).
      return { ...state, captainId, benchIndex: firstEmpty(state.bench), screen: 'bench-pick' }
    }

    case 'SET_CAPTAIN':
      return { ...state, captainId: action.playerId }

    case 'PICK_BENCH': {
      const newBench = [...state.bench]
      newBench[action.slotIndex] = action.player
      return { ...state, bench: newBench, benchIndex: firstEmpty(newBench, action.slotIndex + 1) }
    }

    case 'REMOVE_BENCH': {
      const newBench = [...state.bench]
      newBench[action.slotIndex] = null
      return { ...state, bench: newBench, benchIndex: action.slotIndex }
    }

    case 'SET_BENCH_SLOT':
      return { ...state, benchIndex: action.slotIndex }

    case 'SET_BENCH':
      return { ...state, bench: action.bench }

    case 'CONFIRM_BENCH':
      // Next: set the penalty-taker order before locking in the tournament.
      return { ...state, screen: 'penalties' }

    case 'SET_PENALTY_TAKERS':
      return { ...state, penaltyTakers: action.takers }

    case 'CONFIRM_PENALTIES': {
      if (state.daily && state.worldCup) return { ...state, screen: 'tournament' }
      // Manager Mode: the chosen year IS the tournament — enter it directly
      // instead of asking again.
      if (state.mode === 'manager') {
        const wc = tournamentForYear(state.squadYear)
        if (wc) return { ...state, worldCup: wc, screen: 'tournament' }
      }
      return { ...state, screen: 'tournament-select' }
    }

    case 'SWAP_PLAYER': {
      // Mid-tournament rotation: starter <-> bench seat. Keepers only swap
      // with keepers; outfielders only with outfielders.
      const squad = [...state.squad]
      const bench = [...state.bench]
      const starter = squad[action.slotIndex]
      const sub = bench[action.benchIndex]
      const slotIsGK = FORMATIONS[state.formation][action.slotIndex]?.position === 'GK'
      if (sub && (sub.positions[0] === 'GK') !== slotIsGK) return state
      squad[action.slotIndex] = sub
      bench[action.benchIndex] = starter
      return { ...state, squad, bench }
    }

    case 'START_DAILY': {
      const slots = FORMATIONS[action.formation]
      return {
        ...INITIAL_STATE,
        mode: 'draft',
        difficulty: 'prime',
        difficultyLevel: 'normal',
        respinsLeft: RESPINS.normal,
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
        case 'settings': return { ...state, screen: 'home' }
        case 'mode-select': return { ...state, screen: 'settings' }
        case 'manager-year': return { ...state, screen: 'mode-select' }
        case 'formation': return { ...state, screen: state.mode === 'manager' ? 'manager-year' : 'mode-select' }
        case 'draft':
          // Daily runs have a fixed formation — backing out exits to home.
          if (state.daily) return { ...INITIAL_STATE }
          return { ...state, screen: 'formation' }
        case 'free-pick': return { ...state, screen: 'formation' }
        case 'squad-review': return { ...state, screen: state.mode === 'draft' ? 'draft' : 'free-pick' }
        case 'bench-pick': return { ...state, screen: 'squad-review' }
        case 'penalties': return { ...state, screen: 'bench-pick' }
        case 'tournament-select': return { ...state, screen: 'penalties' }
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
