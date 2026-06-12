import { RatedPlayer } from '@/types'
import { oppScorer, oppCreator } from '@/data/opponentStars'
import { displaySurname } from './names'
import { rand } from './rng'

// ─── Tournament stats ─────────────────────────────────────────────────────────
// A golden-boot race built up as the whole tournament simulates — England's
// matches AND the matches on the other side of the bracket. Goals are
// attributed to real named players (Lewandowski, Mbappé…) so the leaderboard
// reads like the real thing, including the heartbreak of a top scorer whose
// nation goes out.

export interface ScorerTally {
  name: string
  nation: string
  goals: number
  assists: number
}

export interface TournamentStats {
  scorers: ScorerTally[]
}

export function createStats(): TournamentStats {
  return { scorers: [] }
}

function bump(stats: TournamentStats, name: string, nation: string, goals: number, assists: number): void {
  let row = stats.scorers.find(s => s.name === name && s.nation === nation)
  if (!row) {
    row = { name, nation, goals: 0, assists: 0 }
    stats.scorers.push(row)
  }
  row.goals += goals
  row.assists += assists
}

// Attribute a nation's goals in a match to its star forwards/mids. ~45% of
// goals get a creator credited with an assist.
export function attributeGoals(stats: TournamentStats, nation: string, year: number, goals: number): void {
  for (let i = 0; i < goals; i++) {
    const scorer = oppScorer(nation, year)
    if (scorer) bump(stats, scorer, nation, 1, 0)
    if (rand() < 0.45) {
      const creator = oppCreator(nation, year)
      if (creator && creator !== scorer) bump(stats, creator, nation, 0, 1)
    }
  }
}

// England's own goals go to the XI's attackers (so the Three Lions can top the
// charts too). Surnames only, to match the rest of the UI.
export function attributeEnglandGoals(stats: TournamentStats, squad: (RatedPlayer | null)[], goals: number): void {
  const attackers = (squad.filter(Boolean) as RatedPlayer[])
    .filter(p => !['GK', 'CB', 'RB', 'LB', 'CDM'].includes(p.positions[0]))
  const pool = attackers.length > 0 ? attackers : (squad.filter(Boolean) as RatedPlayer[])
  if (pool.length === 0) return
  for (let i = 0; i < goals; i++) {
    const scorer = pool[Math.floor(rand() * pool.length)]
    bump(stats, displaySurname(scorer.name), 'England', 1, 0)
    if (rand() < 0.45) {
      const creator = pool[Math.floor(rand() * pool.length)]
      if (creator.id !== scorer.id) bump(stats, displaySurname(creator.name), 'England', 0, 1)
    }
  }
}

export function topScorers(stats: TournamentStats, n: number): ScorerTally[] {
  return [...stats.scorers]
    .sort((a, b) => b.goals - a.goals || b.assists - a.assists)
    .filter(s => s.goals > 0)
    .slice(0, n)
}

export function topAssists(stats: TournamentStats, n: number): ScorerTally[] {
  return [...stats.scorers]
    .sort((a, b) => b.assists - a.assists || b.goals - a.goals)
    .filter(s => s.assists > 0)
    .slice(0, n)
}
