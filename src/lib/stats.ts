import { ENGLAND_PLAYERS } from '@/data/players'
import { WORLD_CUPS } from '@/data/worldCups'
import { EUROS } from '@/data/euros'

// ─── Single source of truth for every count surfaced in the UI / meta tags ───
// Derived from the data files so they can never drift from reality again.
// If you add a player or a tournament, every stat on the site updates itself.

export const PLAYER_COUNT = ENGLAND_PLAYERS.length

export const WC_COUNT = WORLD_CUPS.length
export const WC_FIRST_YEAR = Math.min(...WORLD_CUPS.map(wc => wc.year))
export const WC_LAST_YEAR = Math.max(...WORLD_CUPS.map(wc => wc.year))

// England first ENTERED the European Championship in 1968 (we did not enter
// 1960 or 1964). Those two are still playable as counterfactual wildcards,
// but they are excluded from every count we publish.
export const ENTERED_EUROS = EUROS.filter(e => e.englandEntered !== false)
export const EURO_COUNT = ENTERED_EUROS.length
export const EURO_FIRST_YEAR = Math.min(...ENTERED_EUROS.map(e => e.year))
export const EURO_LAST_YEAR = Math.max(...ENTERED_EUROS.map(e => e.year))

export const FORMATION_COUNT = 5
