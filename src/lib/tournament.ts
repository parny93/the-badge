import { WorldCupData, TournamentResult, TournamentRound, KnockoutRound, RatedPlayer } from '@/types'
import { Formation } from '@/types'
import { simulateMatch } from './matchSimulator'
import { Manager } from '@/data/managers'
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
}

function runGroup(
  group: { name: string; teams: string[] },
  wcYear: number,
  englandSquad: (RatedPlayer | null)[],
  englandFormation: Formation,
  ctx: TournamentContext
): { standings: GroupTeam[]; englandMatches: import('@/types').MatchResult[] } {
  const teams = group.teams
  const standings: GroupTeam[] = teams.map(name => ({
    name, played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, points: 0,
  }))

  const englandMatches: import('@/types').MatchResult[] = []

  // Play all group matches
  for (let i = 0; i < teams.length; i++) {
    for (let j = i + 1; j < teams.length; j++) {
      const teamA = teams[i]
      const teamB = teams[j]
      const isEnglandMatch = teamA === 'England' || teamB === 'England'

      let goalsA: number, goalsB: number
      let matchResult: import('@/types').MatchResult | null = null

      if (isEnglandMatch) {
        const opponent = teamA === 'England' ? teamB : teamA
        matchResult = simulateMatch({
          englandSquad,
          englandFormation,
          opponent,
          wcYear,
          isKnockout: false,
          ...ctx,
        })
        if (teamA === 'England') {
          goalsA = matchResult.homeGoals
          goalsB = matchResult.awayGoals
        } else {
          goalsA = matchResult.awayGoals
          goalsB = matchResult.homeGoals
        }
        englandMatches.push(matchResult)
      } else {
        ;[goalsA, goalsB] = simGroupMatch(teamA, teamB, wcYear)
      }

      // Update standings
      const sA = standings.find(s => s.name === teamA)!
      const sB = standings.find(s => s.name === teamB)!
      sA.played++; sB.played++
      sA.gf += goalsA; sA.ga += goalsB
      sB.gf += goalsB; sB.ga += goalsA

      if (goalsA > goalsB) {
        sA.won++; sA.points += 3; sB.lost++
      } else if (goalsA < goalsB) {
        sB.won++; sB.points += 3; sA.lost++
      } else {
        sA.drawn++; sA.points++
        sB.drawn++; sB.points++
      }
    }
  }

  standings.sort((a, b) =>
    b.points - a.points ||
    (b.gf - b.ga) - (a.gf - a.ga) ||
    b.gf - a.gf
  )

  return { standings, englandMatches }
}

// ─── Knockout simulation ──────────────────────────────────────────────────────

function simKnockoutOpponent(teamA: string, teamB: string, wcYear: number): string {
  const ratingA = getTeamRating(teamA, wcYear)
  const ratingB = getTeamRating(teamB, wcYear)
  const diff = (ratingA - ratingB) * 0.025
  const winProbA = 1 / (1 + Math.exp(-diff * 2))

  const goalsA = poissonSample(Math.max(0.2, 1.0 + diff))
  const goalsB = poissonSample(Math.max(0.2, 1.0 - diff))

  if (goalsA !== goalsB) return goalsA > goalsB ? teamA : teamB
  // Penalties
  return rand() < winProbA ? teamA : teamB
}

// ─── Full tournament ──────────────────────────────────────────────────────────

export function runTournament(
  worldCup: WorldCupData,
  englandSquad: (RatedPlayer | null)[],
  englandFormation: Formation,
  ctx: TournamentContext = {}
): TournamentResult {
  const rounds: TournamentRound[] = []

  // ── Group stage ──────────────────────────────────────────────────────────
  const englandGroupData = worldCup.groups.find(g => g.name === worldCup.englandGroup)!
  const allGroupResults: { groupName: string; standings: GroupTeam[] }[] = []

  // Run all groups
  const allEnglandGroupMatches: import('@/types').MatchResult[] = []
  let englandGroupPosition = 4

  for (const group of worldCup.groups) {
    if (group.name === worldCup.englandGroup) {
      const { standings, englandMatches } = runGroup(group, worldCup.year, englandSquad, englandFormation, ctx)
      allEnglandGroupMatches.push(...englandMatches)
      englandGroupPosition = standings.findIndex(s => s.name === 'England') + 1
      allGroupResults.push({ groupName: group.name, standings })
    } else {
      // Simulate other groups without England
      const standings: GroupTeam[] = group.teams.map(name => ({
        name, played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, points: 0,
      }))
      const teams = group.teams
      for (let i = 0; i < teams.length; i++) {
        for (let j = i + 1; j < teams.length; j++) {
          const [gA, gB] = simGroupMatch(teams[i], teams[j], worldCup.year)
          const sA = standings.find(s => s.name === teams[i])!
          const sB = standings.find(s => s.name === teams[j])!
          sA.played++; sB.played++
          sA.gf += gA; sA.ga += gB; sB.gf += gB; sB.ga += gA
          if (gA > gB) { sA.won++; sA.points += 3; sB.lost++ }
          else if (gA < gB) { sB.won++; sB.points += 3; sA.lost++ }
          else { sA.drawn++; sA.points++; sB.drawn++; sB.points++ }
        }
      }
      standings.sort((a, b) => b.points - a.points || (b.gf-b.ga) - (a.gf-a.ga) || b.gf - a.gf)
      allGroupResults.push({ groupName: group.name, standings })
    }
  }

  rounds.push({
    type: 'Group',
    matches: allEnglandGroupMatches,
  })

  // Did England qualify?
  // euro-24-team and 48-team WC both take top 3 from each group
  const qualifyThreshold =
    worldCup.format === '48-team' || worldCup.format === 'euro-24-team' ? 3 : 2
  if (englandGroupPosition > qualifyThreshold) {
    return {
      rounds,
      exitRound: 'Group',
      groupPosition: englandGroupPosition,
    }
  }

  // ── Knockout stage ───────────────────────────────────────────────────────
  const knockoutRounds = KNOCKOUT_ROUNDS[worldCup.format] as KnockoutRound[]

  // Build initial knockout bracket — group winners/runners-up
  // For simplicity we create a pool of qualified teams sorted by strength
  let qualifiedTeams: string[] = ['England']
  for (const gr of allGroupResults) {
    const topN = gr.standings.slice(0, qualifyThreshold).map(s => s.name)
    topN.forEach(t => { if (t !== 'England' && !qualifiedTeams.includes(t)) qualifiedTeams.push(t) })
  }
  // Pad to power of 2 if needed
  while (qualifiedTeams.length < getExpectedKOSize(worldCup.format)) {
    qualifiedTeams.push('Unknown')
  }
  qualifiedTeams = qualifiedTeams.slice(0, getExpectedKOSize(worldCup.format))

  let currentRound = qualifiedTeams

  for (const roundName of knockoutRounds) {
    const matchResults: import('@/types').MatchResult[] = []
    const nextRound: string[] = []

    for (let i = 0; i < currentRound.length; i += 2) {
      const teamA = currentRound[i]
      const teamB = currentRound[i + 1] ?? 'Unknown'

      if (teamA === 'England' || teamB === 'England') {
        const opponent = teamA === 'England' ? teamB : teamA
        const result = simulateMatch({
          englandSquad,
          englandFormation,
          opponent: opponent === 'Unknown' ? 'Rest of the World' : opponent,
          wcYear: worldCup.year,
          isKnockout: true,
          ...ctx,
        })
        matchResults.push(result)
        nextRound.push(result.englandWon ? 'England' : opponent)

        if (!result.englandWon) {
          rounds.push({ type: roundName, matches: matchResults })
          return { rounds, exitRound: roundName }
        }
      } else {
        const winner = teamA === 'Unknown' || teamB === 'Unknown'
          ? teamA === 'Unknown' ? teamB : teamA
          : simKnockoutOpponent(teamA, teamB, worldCup.year)
        nextRound.push(winner)
      }
    }

    rounds.push({ type: roundName, matches: matchResults })
    currentRound = nextRound
  }

  // If we're still here, England won!
  return { rounds, exitRound: 'Winner' }
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
}

function sortStandings(s: GroupTeam[]): void {
  s.sort((a, b) =>
    b.points - a.points ||
    (b.gf - b.ga) - (a.gf - a.ga) ||
    b.gf - a.gf
  )
}

export function createTournamentRun(worldCup: WorldCupData): TournamentRun {
  const group = worldCup.groups.find(g => g.name === worldCup.englandGroup)!
  const standings: GroupTeam[] = group.teams.map(name => ({
    name, played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, points: 0,
  }))

  // Pre-play the fixtures that don't involve England (in England's group).
  const others = group.teams.filter(t => t !== 'England')
  for (let i = 0; i < others.length; i++) {
    for (let j = i + 1; j < others.length; j++) {
      const [gA, gB] = simGroupMatch(others[i], others[j], worldCup.year)
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
  }

  if (r.stage === 'group') {
    const opponent = r.englandFixtures[r.groupMatchesPlayed]
    const match = simulateMatch({
      englandSquad: squad, englandFormation: formation,
      opponent, wcYear: r.worldCup.year, isKnockout: false, ...ctx,
    })
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
        // Build the knockout field, England first (mirrors the one-shot engine).
        let field: string[] = ['England']
        const allGroups = [
          { groupName: r.worldCup.englandGroup, standings: r.standings },
          ...r.otherGroups,
        ]
        for (const g of allGroups) {
          for (const t of g.standings.slice(0, threshold)) {
            if (t.name !== 'England' && !field.includes(t.name)) field.push(t.name)
          }
        }
        const size = getExpectedKOSize(r.worldCup.format)
        while (field.length < size) field.push('Unknown')
        r.field = field.slice(0, size)
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
        wcYear: r.worldCup.year, isKnockout: true, ...ctx,
      })
      nextField.push(englandMatch.englandWon ? 'England' : opponent)
    } else {
      const winner = teamA === 'Unknown' || teamB === 'Unknown'
        ? (teamA === 'Unknown' ? teamB : teamA)
        : simKnockoutOpponent(teamA, teamB, r.worldCup.year)
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
