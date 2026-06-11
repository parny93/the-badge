// ─── Positions ───────────────────────────────────────────────────────────────

export type Position = 'GK' | 'RB' | 'CB' | 'LB' | 'CDM' | 'CM' | 'CAM' | 'RM' | 'LM' | 'RW' | 'LW' | 'ST'

export type PositionGroup = 'GK' | 'DEF' | 'MID' | 'ATT'

export function positionGroup(pos: Position): PositionGroup {
  if (pos === 'GK') return 'GK'
  if (['RB', 'CB', 'LB'].includes(pos)) return 'DEF'
  if (['CDM', 'CM', 'CAM', 'RM', 'LM'].includes(pos)) return 'MID'
  return 'ATT'
}

// ─── Players ─────────────────────────────────────────────────────────────────

export interface PlayerAttributes {
  pace: number
  shooting: number
  passing: number
  dribbling: number
  defending: number
  physical: number
  gk?: number // goalkeepers only
}

export interface Player {
  id: string
  name: string
  positions: Position[]          // primary first
  bornYear: number
  peakYear: number
  peakRating: number             // 60–99 overall at peak
  peakAttributes: PlayerAttributes
  caps: number
  goals: number
  moments: string[]              // narrative lines for this player
  ratingOverrides?: Record<number, number> // manual fixes for specific WC years
}

export interface RatedPlayer extends Player {
  ratingAtYear: number           // computed for chosen WC year
  trend: 'rising' | 'peak' | 'declining' | 'ineligible'
  ageAtYear: number
}

// ─── Badge chemistry styles ───────────────────────────────────────────────────
// Each player is assigned a style derived from their primary position + peak
// attributes. Styles drive per-player pip scores and team synergy bonuses.

export type ChemistryStyle =
  | 'SENTINEL'    // hard defending, no-nonsense — Adams, Terry, Rice, Stiles
  | 'RAZOR'       // pace + defending — Ashley Cole, Des Walker, Kyle Walker
  | 'DYNAMO'      // box-to-box, workhorse — Gerrard, Robson, Lampard
  | 'CONDUCTOR'   // technical passer — Scholes, Hoddle, Foden, Wilkins
  | 'WIZARD'      // dribbler, creator — Gascoigne, Bellingham, Wilshere
  | 'SCHEMER'     // set-piece / crossing specialist — Beckham, Carrick
  | 'ROCKET'      // pure pace wide — Walcott, Sterling, Rashford (winger)
  | 'ARTIST'      // dribbling wide — Barnes, Waddle, Saka, Sancho
  | 'COLOSSUS'    // complete striker — Shearer, Rooney, Hurst, Charlton B
  | 'RAPTOR'      // pace + goal threat — Owen, Vardy, Cole, Defoe
  | 'MARKSMAN'    // clinical finisher — Lineker, Greaves, Fowler, Kane
  | 'TOWER'       // physical hold-up — Crouch, Heskey, Chivers
  | 'GUARDIAN'    // traditional keeper — Banks, Shilton, Seaman
  | 'LIBERO'      // active, comes off line — Pickford, Hart

export interface PlayerChemEntry {
  playerId: string
  name: string
  pips: number           // 0–3 (like FUT chem pip dots)
  style: ChemistryStyle
  slotLabel: string
}

export interface ChemistryNote {
  text: string
  type: 'good' | 'bad' | 'info'
}

export interface ChemistryReport {
  score: number                  // 35–100
  notes: ChemistryNote[]
  attackMod: number              // points applied to attack score
  defenseMod: number             // points applied to defense score
  players: PlayerChemEntry[]     // FUT-style per-player breakdown
}

export interface TeamStrength {
  overall: number
  attack: number
  midfield: number
  defense: number
  chemistry: ChemistryReport
}

// ─── Formation ───────────────────────────────────────────────────────────────

export type Formation = '4-3-3' | '4-4-2' | '4-2-3-1' | '3-5-2' | '5-3-2'

export interface FormationSlot {
  position: Position
  label: string
  // Percentage positions on the pitch display (0–100, 0=bottom/goal, 100=top)
  x: number // left-right %
  y: number // bottom-top %
}

// ─── World Cup data ───────────────────────────────────────────────────────────

export type WCFormat =
  | '16-team' | '24-team' | '32-team' | '48-team'
  | 'euro-4-team' | 'euro-8-team' | 'euro-16-team' | 'euro-24-team'

export interface WCGroup {
  name: string
  teams: string[]
}

export interface WorldCupData {
  year: number
  host: string
  historicalWinner: string
  format: WCFormat
  groups: WCGroup[]
  englandGroup: string           // which group England are placed in
  englandQualified: boolean      // did England actually qualify
  englandEntered?: boolean       // false = England didn't even enter (Euro 1960/1964); omit = entered
  competition?: 'WorldCup' | 'Euro'  // omit = WorldCup (back-compat)
}

// ─── Team ratings ─────────────────────────────────────────────────────────────
// teamRatings[year][teamName] = 0-99 strength at that tournament

export type TeamRatings = Record<number, Record<string, number>>

// ─── Difficulty ───────────────────────────────────────────────────────────────

export type Difficulty = 'prime' | 'historical' | 'nightmare'

// ─── Match & Tournament ───────────────────────────────────────────────────────

export interface MatchMoment {
  minute: number
  text: string
  type: 'goal' | 'save' | 'miss' | 'card' | 'chance' | 'info' | 'post' | 'penalty'
  team?: 'england' | 'opponent'  // present on goal / card / penalty moments
}

export interface MatchResult {
  home: string
  away: string
  homeGoals: number
  awayGoals: number
  homePenalties?: number
  awayPenalties?: number
  wentToPenalties: boolean
  moments: MatchMoment[]
  englandWon: boolean | null     // null if England not involved
}

export type KnockoutRound = 'R16' | 'QF' | 'SF' | 'Final'

export interface TournamentRound {
  type: 'Group' | KnockoutRound
  matches: MatchResult[]
}

export interface TournamentResult {
  rounds: TournamentRound[]
  exitRound: 'Group' | KnockoutRound | 'Winner'
  groupPosition?: number         // 1st, 2nd, 3rd, 4th
}

// ─── Game modes ───────────────────────────────────────────────────────────────

export type GameMode =
  | 'draft'      // All-Time Draft — spin the wheel, take what you're given
  | 'manager'    // Manager Mode — free-pick from players eligible in a chosen year
  | 'alltime'    // All-Time XI — free-pick the best of any era (prime ratings)

// ─── Game state ───────────────────────────────────────────────────────────────

export type GameScreen =
  | 'home'
  | 'settings'          // era range + difficulty, before anything else
  | 'mode-select'
  | 'manager-year'      // pick the squad year (manager mode only)
  | 'formation'
  | 'draft'             // wheel-spin build
  | 'free-pick'         // browse-and-pick build (manager + alltime)
  | 'squad-review'      // review XI + hand out the captain's armband
  | 'bench-pick'        // tournament squad depth: 1 sub GK + 6 outfield subs
  | 'manager-pick'      // choose the gaffer
  | 'tournament-select' // choose which World Cup to enter your squad into
  | 'tournament'
  | 'result'

export const BENCH_SIZE = 7   // slot 0 = sub GK, slots 1–6 = outfield

export interface GameState {
  screen: GameScreen
  mode: GameMode
  squadYear: number              // year the squad is rated at (manager mode)
  worldCup: WorldCupData | null  // the tournament the squad is entered into
  difficulty: Difficulty
  formation: Formation
  squad: (RatedPlayer | null)[]  // slots in formation order
  pickIndex: number              // active slot for building
  tournament: TournamentResult | null
  hardMode: boolean              // Hard difficulty: ratings hidden while building; badge on card
  yearFrom: number               // era range — pool restricted to peaks in [yearFrom, yearTo]
  yearTo: number
  daily: string | null           // UTC date key when playing the Daily Challenge
  bench: (RatedPlayer | null)[]  // BENCH_SIZE slots; 0 = sub GK
  benchIndex: number             // active bench slot
  captainId: string | null       // armband holder (one of the XI)
  managerId: string | null       // chosen England manager
}

export type GameAction =
  | { type: 'START' }
  | { type: 'SET_SETTINGS'; yearFrom: number; yearTo: number; hard: boolean }
  | { type: 'SELECT_MODE'; mode: GameMode }
  | { type: 'SELECT_YEAR'; year: number }
  | { type: 'SELECT_FORMATION'; formation: Formation }
  | { type: 'PICK_PLAYER'; player: RatedPlayer; slotIndex: number }
  | { type: 'REMOVE_PLAYER'; slotIndex: number }
  | { type: 'SET_ACTIVE_SLOT'; slotIndex: number }
  | { type: 'REVIEW_SQUAD' }
  | { type: 'CONFIRM_SQUAD' }
  | { type: 'PICK_BENCH'; player: RatedPlayer; slotIndex: number }
  | { type: 'REMOVE_BENCH'; slotIndex: number }
  | { type: 'SET_BENCH_SLOT'; slotIndex: number }
  | { type: 'CONFIRM_BENCH' }
  | { type: 'SET_CAPTAIN'; playerId: string }
  | { type: 'SELECT_MANAGER'; managerId: string }
  | { type: 'SELECT_TOURNAMENT'; worldCup: WorldCupData }
  | { type: 'SET_TOURNAMENT'; result: TournamentResult }
  | { type: 'START_DAILY'; date: string; worldCup: WorldCupData; formation: Formation }
  | { type: 'HYDRATE'; state: GameState }
  | { type: 'BACK' }
  | { type: 'RESTART' }
