// ─── Lifetime stats (all modes, this device) ─────────────────────────────────
// Backs the "Most shootouts won" leaderboard cut. Global ranking needs a
// backend — until then the record lives in localStorage.

export interface LifetimeStats {
  runs: number
  titles: number
  shootoutsWon: number
  shootoutsLost: number
}

const STORAGE_KEY = 'thebadge.lifetime.v1'

const EMPTY: LifetimeStats = { runs: 0, titles: 0, shootoutsWon: 0, shootoutsLost: 0 }

export function loadLifetimeStats(): LifetimeStats {
  if (typeof window === 'undefined') return EMPTY
  try {
    return { ...EMPTY, ...JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? '{}') }
  } catch {
    return EMPTY
  }
}

export function recordRunStats(run: { exit: string; wonPens: number; lostPens: number }): LifetimeStats {
  const stats = loadLifetimeStats()
  stats.runs += 1
  if (run.exit === 'Winner') stats.titles += 1
  stats.shootoutsWon += run.wonPens
  stats.shootoutsLost += run.lostPens
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(stats))
  } catch {}
  return stats
}
