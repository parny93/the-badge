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

// ─── Roles & Chemistry ────────────────────────────────────────────────────────

export type PlayerRole =
  | 'GK'
  | 'FB'        // full-back / wing-back
  | 'CB'        // centre-back
  | 'DM'        // holding / destroyer
  | 'B2B'       // box-to-box runner
  | 'DLP'       // deep-lying playmaker
  | 'AP'        // advanced playmaker / number 10
  | 'WIDE'      // winger / wide mid
  | 'TARGET'    // target man
  | 'POACHER'   // fox in the box
  | 'PACE'      // pace striker

export interface ChemistryNote {
  text: string
  type: 'good' | 'bad' | 'info'
}

export interface ChemistryReport {
  score: number                  // 35–100
  notes: ChemistryNote[]
  attackMod: number              // points applied to attack score
  defenseMod: number             // points applied to defense score
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

export type WCFormat = '16-team' | '24-team' | '32-team' | '48-team'

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
  type: 'goal' | 'save' | 'miss' | 'card' | 'chance' | 'info'
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
  | 'mode-select'
  | 'manager-year'      // pick the squad year (manager mode only)
  | 'formation'
  | 'draft'             // wheel-spin build
  | 'free-pick'         // browse-and-pick build (manager + alltime)
  | 'squad-review'
  | 'tournament-select' // choose which World Cup to enter your squad into
  | 'tournament'
  | 'result'

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
}

export type GameAction =
  | { type: 'START' }
  | { type: 'SELECT_MODE'; mode: GameMode }
  | { type: 'SELECT_YEAR'; year: number }
  | { type: 'SELECT_FORMATION'; formation: Formation }
  | { type: 'PICK_PLAYER'; player: RatedPlayer; slotIndex: number }
  | { type: 'REMOVE_PLAYER'; slotIndex: number }
  | { type: 'SET_ACTIVE_SLOT'; slotIndex: number }
  | { type: 'REVIEW_SQUAD' }
  | { type: 'CONFIRM_SQUAD' }
  | { type: 'SELECT_TOURNAMENT'; worldCup: WorldCupData }
  | { type: 'SET_TOURNAMENT'; result: TournamentResult }
  | { type: 'HYDRATE'; state: GameState }
  | { type: 'BACK' }
  | { type: 'RESTART' }
