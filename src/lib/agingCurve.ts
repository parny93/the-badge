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
  const d = age - peakAge // negative = before peak, positive = after

  if (age < 16 || age > 41) return 0   // ineligible

  // Footballers hold a broad prime (roughly 25–31) and decline gently, not
  // off a cliff. The plateau runs from one year before nominal peak to three
  // years after, so a 30-year-old at the back end of his prime stays elite.
  let multiplier: number

  if (d <= -10) multiplier = 0.60      // a kid, years away
  else if (d <= -8) multiplier = 0.70
  else if (d <= -6) multiplier = 0.80
  else if (d <= -4) multiplier = 0.88
  else if (d <= -2) multiplier = 0.95  // knocking on the door
  else if (d <= 3) multiplier = 1.00   // prime plateau (−1 … +3)
  else if (d <= 5) multiplier = 0.96   // still excellent (e.g. Gerrard at 30)
  else if (d <= 7) multiplier = 0.90
  else if (d <= 9) multiplier = 0.82
  else if (d <= 11) multiplier = 0.73
  else multiplier = 0.64               // veteran twilight

  return Math.round(player.peakRating * multiplier)
}

export function getTrend(
  player: Player,
  wcYear: number
): RatedPlayer['trend'] {
  const age = wcYear - player.bornYear
  if (age < 16 || age > 41) return 'ineligible'

  const d = age - (player.peakYear - player.bornYear)

  if (d < -3) return 'rising'
  if (d <= 3) return 'peak'
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
