import { WorldCupData, TournamentResult, TournamentRound, KnockoutRound, RatedPlayer } from '@/types'
import { Formation } from '@/types'
import { simulateMatch } from './matchSimulator'
import { calculateTeamStrength } from './teamStrength'
import { Manager } from '@/data/managers'
import { TournamentStats, createStats, attributeGoals, attributeEnglandGoals } from './tournamentStats'
import { getRealOpponent } from '@/data/realFixtures'
import { rand } from './rng'
import { getTeamRating } from '@/data/teamRatings'
import { KNOCKOUT_ROUNDS } from '@/data/worldCups'

// ─── Group stage simulation ───────────────────────────────────────────────────

interface GroupTeam {
  name: string
  played: number
  won: number
  drawn: number
  lost: number
  gf: number
  ga: number
  points: number
}

function simGroupMatch(teamA: string, teamB: string, wcYear: number): [number, number] {
  const ratingA = getTeamRating(teamA, wcYear)
  const ratingB = getTeamRating(teamB, wcYear)
  const diff = (ratingA - ratingB) * 0.025
  const lambdaA = Math.max(0.2, 1.1 + diff)
  const lambdaB = Math.max(0.2, 1.1 - diff)

  const goalsA = poissonSample(lambdaA)
  const goalsB = poissonSample(lambdaB)
  return [goalsA, goalsB]
}

function poissonSample(lambda: number): number {
  const L = Math.exp(-Math.max(0.1, lambda))
  let k = 0, p = 1
  do { k++; p *= rand() } while (p > L)
  return k - 1
}

export interface TournamentContext {
  manager?: Manager
  captainId?: string | null
  bench?: (RatedPlayer | null)[]
  penaltyTakers?: string[]
  realFixtures?: boolean
  availabilityEvents?: import('./matchEvents').AvailabilityEvent[]
}

// In real-fixtures mode, force England's bracket pair to the actual historical
// opponent for the upcoming round (if one is known for this tournament).
function applyRealFixture(field: string[], year: number, round: 'Group' | KnockoutRound): void {
  if (round === 'Group') return
  const real = getRealOpponent(year, round)
  if (!real) return
  const ei = field.indexOf('England')
  if (ei === -1) return
  const partner = ei % 2 === 0 ? ei + 1 : ei - 1
  if (partner >= 0 && partner < field.length) field[partner] = real
}

// ─── Knockout simulation ──────────────────────────────────────────────────────

function simKnockoutOpponent(teamA: string, teamB: string, wcYear: number): { winner: string; goalsA: number; goalsB: number } {
  const ratingA = getTeamRating(teamA, wcYear)
  const ratingB = getTeamRating(teamB, wcYear)
  // Knockout football rewards the better team more than the group stage — a
  // steeper coefficient means fewer upset finals (no 75-rated team cruising
  // the far half of the draw), without making it deterministic.
  const diff = (ratingA - ratingB) * 0.045
  const winProbA = 1 / (1 + Math.exp(-diff * 2.2))

  const goalsA = poissonSample(Math.max(0.2, 1.0 + diff))
  const goalsB = poissonSample(Math.max(0.2, 1.0 - diff))

  const winner = goalsA !== goalsB
    ? (goalsA > goalsB ? teamA : teamB)
    : (rand() < winProbA ? teamA : teamB)  // penalties
  return { winner, goalsA, goalsB }
}

// ─── Bracket seeding ──────────────────────────────────────────────────────────
// Standard single-elimination seed order so the top seeds are spread across
// the bracket and only meet late: for 8 → [1,8,4,5,2,7,3,6].
function bracketSeedOrder(size: number): number[] {
  let pots = [1]
  while (pots.length < size) {
    const len = pots.length * 2 + 1
    const next: number[] = []
    for (const p of pots) { next.push(p); next.push(len - p) }
    pots = next
  }
  return pots
}

interface SeedTeam { name: string; rating: number }

// Arrange the knockout field by seeded strength. Stronger qualifiers earn the
// kinder slots (they meet other giants latest), so better teams reach later
// rounds more often. A little noise keeps it from being identical every time.
function buildSeededField(
  qualifiers: SeedTeam[],
  size: number,
  fillPool: SeedTeam[],
): string[] {
  const have = new Set(qualifiers.map(q => q.name))
  const pool = [...qualifiers]
  for (const t of [...fillPool].sort((a, b) => b.rating - a.rating)) {
    if (pool.length >= size) break
    if (!have.has(t.name)) { pool.push(t); have.add(t.name) }
  }
  pool.sort((a, b) => (b.rating + (rand() * 4 - 2)) - (a.rating + (rand() * 4 - 2)))
  const seeds = pool.slice(0, size)
  const order = bracketSeedOrder(size)
  const field: string[] = new Array(size)
  order.forEach((seed, pos) => { field[pos] = seeds[seed - 1]?.name ?? 'Rest of the World' })
  return field
}

function getExpectedKOSize(format: WorldCupData['format']): number {
  switch (format) {
    case '16-team':      return 8
    case '24-team':      return 16
    case '32-team':      return 16
    case '48-team':      return 32
    case 'euro-4-team':  return 2   // top 2 from 1 group → Final
    case 'euro-8-team':  return 4   // top 2 from each of 2 groups → SF → Final
    case 'euro-16-team': return 8   // top 2 from each of 4 groups → QF → SF → Final
    case 'euro-24-team': return 16  // top 3 from each of 6 groups → R16 → QF → SF → Final
    default: return 16
  }
}

// ─── Stepwise tournament engine ───────────────────────────────────────────────
// Plays England's campaign ONE match at a time so the manager can rotate the
// squad (and absorb injuries/suspensions) between games. Non-England results
// are simulated around England's fixtures; the accumulated output is the same
// TournamentResult shape the rest of the app consumes.

export interface TournamentRun {
  worldCup: WorldCupData
  stage: 'group' | 'knockout' | 'done'
  englandFixtures: string[]
  groupMatchesPlayed: number
  standings: GroupTeam[]                                   // England's group
  otherGroups: { groupName: string; standings: GroupTeam[] }[]
  knockoutQueue: KnockoutRound[]
  field: string[]                                          // current knockout field
  rounds: TournamentRound[]
  exitRound: TournamentResult['exitRound'] | null
  groupPosition?: number
  stats: TournamentStats        // golden-boot race across the whole tournament
}

function sortStandings(s: GroupTeam[]): void {
  s.sort((a, b) =>
    b.points - a.points ||
    (b.gf - b.ga) - (a.gf - a.ga) ||
    b.gf - a.gf
  )
}

export function createTournamentRun(worldCup: WorldCupData): TournamentRun {
  const stats = createStats()
  const group = worldCup.groups.find(g => g.name === worldCup.englandGroup)!
  const standings: GroupTeam[] = group.teams.map(name => ({
    name, played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, points: 0,
  }))

  // Pre-play the fixtures that don't involve England (in England's group).
  const others = group.teams.filter(t => t !== 'England')
  for (let i = 0; i < others.length; i++) {
    for (let j = i + 1; j < others.length; j++) {
      const [gA, gB] = simGroupMatch(others[i], others[j], worldCup.year)
      attributeGoals(stats, others[i], worldCup.year, gA)
      attributeGoals(stats, others[j], worldCup.year, gB)
      const sA = standings.find(s => s.name === others[i])!
      const sB = standings.find(s => s.name === others[j])!
      sA.played++; sB.played++
      sA.gf += gA; sA.ga += gB; sB.gf += gB; sB.ga += gA
      if (gA > gB) { sA.won++; sA.points += 3; sB.lost++ }
      else if (gA < gB) { sB.won++; sB.points += 3; sA.lost++ }
      else { sA.drawn++; sA.points++; sB.drawn++; sB.points++ }
    }
  }

  // Other groups play out in full.
  const otherGroups: TournamentRun['otherGroups'] = []
  for (const g of worldCup.groups) {
    if (g.name === worldCup.englandGroup) continue
    const st: GroupTeam[] = g.teams.map(name => ({
      name, played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, points: 0,
    }))
    for (let i = 0; i < g.teams.length; i++) {
      for (let j = i + 1; j < g.teams.length; j++) {
        const [gA, gB] = simGroupMatch(g.teams[i], g.teams[j], worldCup.year)
        attributeGoals(stats, g.teams[i], worldCup.year, gA)
        attributeGoals(stats, g.teams[j], worldCup.year, gB)
        const sA = st.find(s => s.name === g.teams[i])!
        const sB = st.find(s => s.name === g.teams[j])!
        sA.played++; sB.played++
        sA.gf += gA; sA.ga += gB; sB.gf += gB; sB.ga += gA
        if (gA > gB) { sA.won++; sA.points += 3; sB.lost++ }
        else if (gA < gB) { sB.won++; sB.points += 3; sA.lost++ }
        else { sA.drawn++; sA.points++; sB.drawn++; sB.points++ }
      }
    }
    sortStandings(st)
    otherGroups.push({ groupName: g.name, standings: st })
  }

  return {
    worldCup,
    stage: 'group',
    englandFixtures: others,
    groupMatchesPlayed: 0,
    standings,
    otherGroups,
    knockoutQueue: [...(KNOCKOUT_ROUNDS[worldCup.format] as KnockoutRound[])],
    field: [],
    rounds: [{ type: 'Group', matches: [] }],
    exitRound: null,
    stats,
  }
}

// England's NEXT opponent, for the team-sheet screen.
export function nextOpponent(run: TournamentRun): string | null {
  if (run.stage === 'group') return run.englandFixtures[run.groupMatchesPlayed] ?? null
  if (run.stage === 'knockout') {
    const idx = run.field.indexOf('England')
    if (idx === -1) return null
    const partner = idx % 2 === 0 ? run.field[idx + 1] : run.field[idx - 1]
    return !partner || partner === 'Unknown' ? 'Rest of the World' : partner
  }
  return null
}

export function nextRoundType(run: TournamentRun): 'Group' | KnockoutRound | null {
  if (run.stage === 'group') return 'Group'
  if (run.stage === 'knockout') return run.knockoutQueue[0] ?? null
  return null
}

export function playNextEnglandMatch(
  run: TournamentRun,
  squad: (RatedPlayer | null)[],
  formation: Formation,
  ctx: TournamentContext = {}
): { run: TournamentRun; match: import('@/types').MatchResult; roundType: 'Group' | KnockoutRound } {
  const r: TournamentRun = {
    ...run,
    standings: run.standings.map(s => ({ ...s })),
    knockoutQueue: [...run.knockoutQueue],
    field: [...run.field],
    rounds: run.rounds.map(round => ({ ...round, matches: [...round.matches] })),
    stats: { scorers: run.stats.scorers.map(s => ({ ...s })) },
  }

  if (r.stage === 'group') {
    const opponent = r.englandFixtures[r.groupMatchesPlayed]
    const match = simulateMatch({
      englandSquad: squad, englandFormation: formation,
      opponent, wcYear: r.worldCup.year, isKnockout: false, round: 'Group', ...ctx,
    })
    attributeEnglandGoals(r.stats, squad, match.homeGoals)
    attributeGoals(r.stats, opponent, r.worldCup.year, match.awayGoals)
    const sE = r.standings.find(s => s.name === 'England')!
    const sO = r.standings.find(s => s.name === opponent)!
    const ge = match.homeGoals, go = match.awayGoals
    sE.played++; sO.played++
    sE.gf += ge; sE.ga += go; sO.gf += go; sO.ga += ge
    if (ge > go) { sE.won++; sE.points += 3; sO.lost++ }
    else if (ge < go) { sO.won++; sO.points += 3; sE.lost++ }
    else { sE.drawn++; sE.points++; sO.drawn++; sO.points++ }

    r.rounds[0].matches.push(match)
    r.groupMatchesPlayed++

    if (r.groupMatchesPlayed >= r.englandFixtures.length) {
      sortStandings(r.standings)
      const pos = r.standings.findIndex(s => s.name === 'England') + 1
      r.groupPosition = pos
      const threshold =
        r.worldCup.format === '48-team' || r.worldCup.format === 'euro-24-team' ? 3 : 2
      if (pos > threshold) {
        r.exitRound = 'Group'
        r.stage = 'done'
      } else {
        // Build a SEEDED knockout field. England is rated by its actual XI so
        // a strong squad earns a kinder draw; group winners get a small bump.
        const allGroups = [
          { groupName: r.worldCup.englandGroup, standings: r.standings },
          ...r.otherGroups,
        ]
        const engOVR = calculateTeamStrength(squad, formation, ctx).overall
        const seedOf = (name: string, groupPos: number): SeedTeam => {
          const base = name === 'England' ? engOVR : getTeamRating(name, r.worldCup.year)
          return { name, rating: base + (groupPos === 0 ? 3 : 0) } // winners seeded above runners-up
        }
        const qualifiers: SeedTeam[] = []
        for (const g of allGroups) {
          g.standings.slice(0, threshold).forEach((t, gp) => {
            if (!qualifiers.some(q => q.name === t.name)) qualifiers.push(seedOf(t.name, gp))
          })
        }
        // Fill pool: everyone NOT already qualified, for the odd format where
        // qualifiers fall short of the bracket size — strongest names, not 'Unknown'.
        const fillPool: SeedTeam[] = []
        for (const g of r.worldCup.groups) {
          for (const name of g.teams) {
            if (!qualifiers.some(q => q.name === name) && !fillPool.some(f => f.name === name)) {
              fillPool.push({ name, rating: name === 'England' ? engOVR : getTeamRating(name, r.worldCup.year) })
            }
          }
        }
        const size = getExpectedKOSize(r.worldCup.format)
        r.field = buildSeededField(qualifiers, size, fillPool)
        // Real fixtures: pin England's first-round opponent to the real one.
        if (ctx.realFixtures) applyRealFixture(r.field, r.worldCup.year, r.knockoutQueue[0])
        r.stage = 'knockout'
      }
    }
    return { run: r, match, roundType: 'Group' }
  }

  // ── Knockout round ────────────────────────────────────────────────────────
  const roundName = r.knockoutQueue.shift()!
  let englandMatch: import('@/types').MatchResult | null = null
  const nextField: string[] = []

  for (let i = 0; i < r.field.length; i += 2) {
    const teamA = r.field[i]
    const teamB = r.field[i + 1] ?? 'Unknown'
    if (teamA === 'England' || teamB === 'England') {
      const opponent = teamA === 'England' ? teamB : teamA
      englandMatch = simulateMatch({
        englandSquad: squad, englandFormation: formation,
        opponent: opponent === 'Unknown' ? 'Rest of the World' : opponent,
        wcYear: r.worldCup.year, isKnockout: true, round: roundName, ...ctx,
      })
      attributeEnglandGoals(r.stats, squad, englandMatch.homeGoals)
      attributeGoals(r.stats, opponent, r.worldCup.year, englandMatch.awayGoals)
      nextField.push(englandMatch.englandWon ? 'England' : opponent)
    } else if (teamA === 'Unknown' || teamB === 'Unknown') {
      nextField.push(teamA === 'Unknown' ? teamB : teamA)
    } else {
      const { winner, goalsA, goalsB } = simKnockoutOpponent(teamA, teamB, r.worldCup.year)
      attributeGoals(r.stats, teamA, r.worldCup.year, goalsA)
      attributeGoals(r.stats, teamB, r.worldCup.year, goalsB)
      nextField.push(winner)
    }
  }

  r.rounds.push({ type: roundName, matches: [englandMatch!] })
  r.field = nextField

  if (!englandMatch!.englandWon) {
    r.exitRound = roundName
    r.stage = 'done'
  } else if (r.knockoutQueue.length === 0) {
    r.exitRound = 'Winner'
    r.stage = 'done'
  } else if (ctx.realFixtures) {
    // England advanced — pin the NEXT round's opponent to the real one.
    applyRealFixture(r.field, r.worldCup.year, r.knockoutQueue[0])
  }
  return { run: r, match: englandMatch!, roundType: roundName }
}

export function runResult(run: TournamentRun): TournamentResult {
  return {
    rounds: run.rounds,
    exitRound: run.exitRound ?? 'Group',
    groupPosition: run.groupPosition,
  }
}
