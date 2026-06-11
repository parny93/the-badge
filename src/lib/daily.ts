import { Formation, WorldCupData } from '@/types'
import { WORLD_CUPS } from '@/data/worldCups'
import { EUROS } from '@/data/euros'
import { hashSeed } from './rng'

// ─── Daily Challenge ──────────────────────────────────────────────────────────
// One deterministic challenge per UTC day: same tournament, same formation,
// same wheel seed for every player worldwide. Resets at 00:00 UTC because the
// date key is derived from the UTC calendar date.

export interface DailyConfig {
  date: string            // YYYY-MM-DD (UTC)
  seed: number            // gameplay rng seed for the day
  worldCup: WorldCupData
  formation: Formation
}

export function utcDateKey(d = new Date()): string {
  return d.toISOString().slice(0, 10)
}

const FORMATION_CHOICES: Formation[] = ['4-3-3', '4-4-2', '4-2-3-1', '3-5-2', '5-3-2']

export function getDailyConfig(date = utcDateKey()): DailyConfig {
  const pool = [...WORLD_CUPS, ...EUROS]
  const worldCup = pool[hashSeed(`thebadge-tournament-${date}`) % pool.length]
  const formation = FORMATION_CHOICES[hashSeed(`thebadge-formation-${date}`) % FORMATION_CHOICES.length]
  return {
    date,
    seed: hashSeed(`thebadge-daily-${date}`),
    worldCup,
    formation,
  }
}

// ─── Local results & personal leaderboard ────────────────────────────────────
// Stored in localStorage. A global leaderboard needs a backend — deferred.

export interface DailyResult {
  date: string
  exit: string
  chem: number
  ovr: number
  era: string
  wonPens: number
  lostPens: number
  hard: boolean
  runId: string
}

const STORAGE_KEY = 'thebadge.daily.v1'

export function loadDailyResults(): Record<string, DailyResult> {
  if (typeof window === 'undefined') return {}
  try {
    return JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? '{}')
  } catch {
    return {}
  }
}

export function saveDailyResult(result: DailyResult): void {
  if (typeof window === 'undefined') return
  try {
    const all = loadDailyResults()
    // First finish of the day stands — no re-rolling a better daily.
    if (all[result.date]) return
    all[result.date] = result
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(all))
  } catch {}
}

const EXIT_RANK: Record<string, number> = {
  Group: 0, R32: 1, R16: 2, QF: 3, SF: 4, Final: 5, Winner: 6,
}

export const EXIT_LABEL: Record<string, string> = {
  Group: 'Group stage', R32: 'Round of 32', R16: 'Round of 16',
  QF: 'Quarter-final', SF: 'Semi-final', Final: 'Runners-up', Winner: 'WINNERS',
}

export interface PersonalBests {
  played: number
  bestExit: string | null
  bestChem: number
  bestEraSpan: number      // widest era spread in years
  shootoutsWon: number
}

export function personalBests(results: Record<string, DailyResult>): PersonalBests {
  const all = Object.values(results)
  let bestExit: string | null = null
  let bestChem = 0
  let bestEraSpan = 0
  let shootoutsWon = 0
  for (const r of all) {
    if (!bestExit || (EXIT_RANK[r.exit] ?? 0) > (EXIT_RANK[bestExit] ?? 0)) bestExit = r.exit
    if (r.chem > bestChem) bestChem = r.chem
    const m = r.era.match(/^(\d+)–(\d+)$/)
    if (m) bestEraSpan = Math.max(bestEraSpan, Number(m[2]) - Number(m[1]))
    shootoutsWon += r.wonPens
  }
  return { played: all.length, bestExit, bestChem, bestEraSpan, shootoutsWon }
}
