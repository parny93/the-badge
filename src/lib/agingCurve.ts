import { Player, RatedPlayer } from '@/types'
import { CAREER_RATINGS } from '@/data/careerRatings'

// ─── Career-curve interpolation ──────────────────────────────────────────────
//
// Interpolates linearly between waypoints in a player's careerRatings entry.
// Outside the defined range we apply a ±3-per-year decay/rise so that a retired
// player doesn't stay at 84 indefinitely, and a youngster's pre-data rating
// scales down naturally.

function interpolateCareerRating(
  curve: Record<number, number>,
  year: number,
): number {
  const years = Object.keys(curve)
    .map(Number)
    .sort((a, b) => a - b)

  if (years.length === 0) return 60

  const first = years[0]
  const last  = years[years.length - 1]

  // Before first waypoint — gently lower
  if (year <= first) {
    return Math.max(40, Math.round(curve[first] - (first - year) * 3))
  }

  // After last waypoint — gently decay
  if (year >= last) {
    return Math.max(40, Math.round(curve[last] - (year - last) * 3))
  }

  // Linear interpolation between surrounding waypoints
  const lo = years.filter(y => y <= year).at(-1)!
  const hi = years.find(y => y > year)!
  const t  = (year - lo) / (hi - lo)
  return Math.round(curve[lo] + t * (curve[hi] - curve[lo]))
}

// ─── Legacy age-based curve (fallback for players without career data) ────────
//
// Applied only when a player has no entry in CAREER_RATINGS. Estimates quality
// from the gap between the requested year and the player's documented peak year.

function legacyAgingCurveRating(player: Player, year: number): number {
  const age = year - player.bornYear
  if (age < 16 || age > 41) return 0

  const peakAge = player.peakYear - player.bornYear
  const d = age - peakAge

  let multiplier: number
  if (d <= -10)     multiplier = 0.60
  else if (d <= -8) multiplier = 0.70
  else if (d <= -6) multiplier = 0.80
  else if (d <= -4) multiplier = 0.88
  else if (d <= -2) multiplier = 0.95
  else if (d <=  3) multiplier = 1.00  // prime plateau
  else if (d <=  5) multiplier = 0.96
  else if (d <=  7) multiplier = 0.90
  else if (d <=  9) multiplier = 0.82
  else if (d <= 11) multiplier = 0.73
  else              multiplier = 0.64

  return Math.round(player.peakRating * multiplier)
}

// ─── Primary rating lookup ────────────────────────────────────────────────────

export function getRatingAtYear(player: Player, year: number): number {
  // 1. Career-ratings curve (interpolated between waypoints) — preferred source
  const curve = CAREER_RATINGS[player.id]
  if (curve && Object.keys(curve).length > 0) {
    return interpolateCareerRating(curve, year)
  }

  // 2. Legacy age-based curve — fallback for fringe / historical players
  return legacyAgingCurveRating(player, year)
}

// ─── Trend label helpers ──────────────────────────────────────────────────────

export function getTrend(player: Player, wcYear: number): RatedPlayer['trend'] {
  const age = wcYear - player.bornYear
  if (age < 16 || age > 41) return 'ineligible'

  const curve = CAREER_RATINGS[player.id]
  if (curve) {
    // Trend is determined by whether the rating is rising or falling
    const prev = interpolateCareerRating(curve, wcYear - 2)
    const curr = interpolateCareerRating(curve, wcYear)
    const diff = curr - prev
    if (diff > 2)  return 'rising'
    if (diff < -2) return 'declining'
    return 'peak'
  }

  // Fallback: age delta from documented peak
  const d = age - (player.peakYear - player.bornYear)
  if (d < -3) return 'rising'
  if (d <=  3) return 'peak'
  return 'declining'
}

// ─── Full RatedPlayer constructor ─────────────────────────────────────────────

export function ratePlayerForYear(
  player: Player,
  wcYear: number,
  prime: boolean,
): RatedPlayer {
  const ratingAtYear = prime ? player.peakRating : getRatingAtYear(player, wcYear)
  const trend        = prime ? 'peak' : getTrend(player, wcYear)
  const ageAtYear    = wcYear - player.bornYear

  return { ...player, ratingAtYear, trend, ageAtYear }
}

// ─── Display helpers ──────────────────────────────────────────────────────────

export const TREND_ARROW: Record<RatedPlayer['trend'], string> = {
  rising:     '↑',
  peak:       '★',
  declining:  '↓',
  ineligible: '✕',
}

export const TREND_COLOUR: Record<RatedPlayer['trend'], string> = {
  rising:     'text-emerald-400',
  peak:       'text-yellow-400',
  declining:  'text-orange-400',
  ineligible: 'text-slate-500',
}
