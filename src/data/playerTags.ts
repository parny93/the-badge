import { Player } from '@/types'

// ─── Player tags ──────────────────────────────────────────────────────────────
// Derived/curated metadata layered over ENGLAND_PLAYERS without touching the
// core data shape. Era and penalty ratings are derived; Golden Generation and
// known takers are curated lists.
//
// Deferred (needs the scraping pipeline + a database): per-player clubs and
// managers-played-under junction tables. Source order when that lands:
// 11v11.com squad pages → Wikipedia tournament squads → englandfootballonline.

// The 2002–2010 core, broadly drawn.
export const GOLDEN_GENERATION = new Set<string>([
  'david_beckham', 'paul_scholes', 'steven_gerrard', 'frank_lampard',
  'michael_owen', 'wayne_rooney', 'rio_ferdinand', 'john_terry',
  'sol_campbell', 'ashley_cole', 'gary_neville', 'joe_cole',
  'owen_hargreaves', 'emile_heskey', 'david_james', 'michael_carrick',
  'peter_crouch', 'jermain_defoe', 'paul_robinson', 'glen_johnson',
  'wayne_bridge', 'ledley_king',
])

export function isGoldenGeneration(playerId: string): boolean {
  return GOLDEN_GENERATION.has(playerId)
}

// Recognised England penalty takers across the eras (first-choice or
// prominent shootout volunteers).
export const KNOWN_PK_TAKERS = new Set<string>([
  'alf_ramsey_player', 'ron_flowers', 'francis_lee', 'kevin_keegan',
  'gary_lineker', 'stuart_pearce', 'alan_shearer', 'david_beckham',
  'frank_lampard', 'steven_gerrard', 'wayne_rooney', 'harry_kane',
  'cole_palmer', 'jimmy_greaves', 'michael_owen', 'teddy_sheringham',
  // Club-football penalty royalty
  'matt_le_tissier',  // 47 of 48 for Southampton
  'steve_bruce',      // 11 pens from centre-half in 1990-91 alone
])

// Penalty rating proxy: goal threat per cap + a curated-taker bonus.
// Outfielders land roughly 55–90; keepers sit low (they save them instead).
export function penaltyRating(player: Player): number {
  if (player.positions[0] === 'GK') return 40
  const goalsPerCap = player.caps > 0 ? player.goals / player.caps : 0
  let rating = 58 + Math.min(22, Math.round(goalsPerCap * 45)) + Math.round((player.peakAttributes.shooting - 70) * 0.2)
  if (KNOWN_PK_TAKERS.has(player.id)) rating += 12
  return Math.max(40, Math.min(95, rating))
}

// Era label from a player's peak — used for tagging and card copy.
export function eraOf(player: Player): string {
  const decade = Math.floor(player.peakYear / 10) * 10
  return `${decade}s`
}
