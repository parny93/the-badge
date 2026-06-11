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
