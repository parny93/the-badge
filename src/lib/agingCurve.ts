import { Player, RatedPlayer } from '@/types'

/**
 * Returns a player's effective rating at a given World Cup year.
 * Uses an age-based curve relative to the player's peak year.
 * In prime mode, always returns peakRating.
 */
export function getRatingAtYear(player: Player, wcYear: number): number {
  // Check for manual override first (e.g. Rooney's fractured foot 2006)
  if (player.ratingOverrides?.[wcYear] !== undefined) {
    return player.ratingOverrides[wcYear]
  }

  const age = wcYear - player.bornYear
  const peakAge = player.peakYear - player.bornYear
  const ageDelta = age - peakAge // negative = before peak, positive = after

  if (age < 15 || age > 42) return 0   // ineligible

  let multiplier: number

  if (ageDelta < -9) multiplier = 0.60  // very young — raw talent
  else if (ageDelta < -7) multiplier = 0.68
  else if (ageDelta < -5) multiplier = 0.76
  else if (ageDelta < -3) multiplier = 0.84
  else if (ageDelta < -1) multiplier = 0.92
  else if (ageDelta <= 1) multiplier = 1.00  // peak window
  else if (ageDelta <= 3) multiplier = 0.93
  else if (ageDelta <= 5) multiplier = 0.84
  else if (ageDelta <= 7) multiplier = 0.74
  else if (ageDelta <= 9) multiplier = 0.65
  else multiplier = 0.58  // deep decline

  return Math.round(player.peakRating * multiplier)
}

export function getTrend(
  player: Player,
  wcYear: number
): RatedPlayer['trend'] {
  const age = wcYear - player.bornYear
  if (age < 15 || age > 42) return 'ineligible'

  const ageDelta = age - (player.peakYear - player.bornYear)

  if (ageDelta < -3) return 'rising'
  if (ageDelta <= 2) return 'peak'
  return 'declining'
}

/**
 * Converts a Player into a RatedPlayer for a given WC year.
 * In prime mode, always uses peak rating.
 */
export function ratePlayerForYear(
  player: Player,
  wcYear: number,
  prime: boolean
): RatedPlayer {
  const ratingAtYear = prime ? player.peakRating : getRatingAtYear(player, wcYear)
  const trend = prime ? 'peak' : getTrend(player, wcYear)
  const ageAtYear = wcYear - player.bornYear

  return {
    ...player,
    ratingAtYear,
    trend,
    ageAtYear,
  }
}

export const TREND_ARROW: Record<RatedPlayer['trend'], string> = {
  rising: '↑',
  peak: '★',
  declining: '↓',
  ineligible: '✕',
}

export const TREND_COLOUR: Record<RatedPlayer['trend'], string> = {
  rising: 'text-emerald-400',
  peak: 'text-yellow-400',
  declining: 'text-orange-400',
  ineligible: 'text-slate-500',
}
