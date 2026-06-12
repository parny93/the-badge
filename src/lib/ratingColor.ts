import { ENGLAND_PLAYERS } from '@/data/players'

// ─── Rating colour system ─────────────────────────────────────────────────────
// The game's top 10 players (by peak) are ICONS — they glow gold like an icon
// pull in FUT. Everyone else is coloured on a single gradient: bright green for
// the best, fading through orange for bang-average, down to red for the worst.

// The 10th-highest peak rating in the pool is the icon cut-off (currently 91).
export const ICON_THRESHOLD: number = (() => {
  const peaks = ENGLAND_PLAYERS.map(p => p.peakRating).sort((a, b) => b - a)
  return peaks[9] ?? 90
})()

export function isIcon(peakRating: number): boolean {
  return peakRating >= ICON_THRESHOLD
}

// Smooth green→orange→red gradient for non-icon ratings. Two linear segments so
// ~72 reads orange (average) rather than yellow-green.
export function ratingColor(rating: number): string {
  const r = Math.max(50, Math.min(89, rating))
  const hue = r <= 72
    ? ((r - 50) / 22) * 35           // 50 red → 72 orange
    : 35 + ((r - 72) / 17) * 85      // 72 orange → 89 green
  return `hsl(${Math.round(hue)}, 82%, 56%)`
}

// Gold used for icon players — matches the amber brand accent.
export const ICON_GOLD = '#fbbf24'

// One call for any rating cell. `peakRating` decides icon status (a legend is a
// legend regardless of the year shown); `shown` is the number actually rendered.
export function ratingStyle(peakRating: number, shown: number): {
  color: string
  textShadow?: string
  icon: boolean
} {
  if (isIcon(peakRating)) {
    return { color: ICON_GOLD, textShadow: '0 0 10px rgba(251,191,36,0.7)', icon: true }
  }
  return { color: ratingColor(shown), icon: false }
}
