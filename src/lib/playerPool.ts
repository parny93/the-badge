import { Player, Position, RatedPlayer } from '@/types'
import { ENGLAND_PLAYERS } from '@/data/players'
import { ratePlayerForYear } from './agingCurve'

// International availability overrides for players who retired early / late from
// England, where the simple age window would be wrong. Otherwise we assume a
// player could realistically be picked from age 17 to 35.
const INTL_OVERRIDES: Record<string, { from?: number; to?: number }> = {
  paul_scholes: { to: 2004 },     // retired from England 2004
  paul_gascoigne: { to: 1998 },   // last cap 1998
  jimmy_greaves: { to: 1967 },
  ledley_king: { to: 2010 },      // injuries curtailed his career
  michael_carrick: { to: 2015 },
  owen_hargreaves: { to: 2008 },  // injuries
  wayne_rooney: { to: 2016 },
  steven_gerrard: { to: 2014 },
  frank_lampard: { to: 2014 },
  david_beckham: { to: 2009 },
  michael_owen: { to: 2008 },
  peter_shilton: { to: 1990 },    // played to Italia '90 aged 40
  ray_clemence: { to: 1983 },
  gordon_banks: { to: 1972 },     // car crash ended his career
  david_james: { to: 2010 },
  gary_lineker: { to: 1992 },     // retired after Euro 92
  alan_shearer: { to: 2000 },     // retired from England after Euro 2000
}

export function eligibleYears(player: Player): { from: number; to: number } {
  const o = INTL_OVERRIDES[player.id] ?? {}
  return {
    from: o.from ?? player.bornYear + 17,
    to: o.to ?? player.bornYear + 35,
  }
}

export function isEligibleInYear(player: Player, year: number): boolean {
  const { from, to } = eligibleYears(player)
  return year >= from && year <= to
}

// Players can only be picked in a position they actually played. We allow
// interchange ONLY within tight, realistic role groups (a central midfielder
// covers CDM/CM/CAM; a winger covers his side) — never a centre-back at wing
// or a striker in defence. Everything else must be an explicit tagged position.
const ROLE_GROUPS: Position[][] = [
  ['CDM', 'CM', 'CAM'],   // central midfield interchange
  ['RM', 'RW'],           // right flank
  ['LM', 'LW'],           // left flank
]

export function canPlaySlot(player: Player, slot: Position): boolean {
  if (player.positions.includes(slot)) return true
  const group = ROLE_GROUPS.find(g => g.includes(slot))
  if (!group) return false // GK, CB, RB, LB, ST: must be explicitly tagged
  return player.positions.some(p => group.includes(p))
}

interface PoolOptions {
  slot: Position
  year: number
  prime: boolean        // true = prime ratings (draft/alltime), false = year-rated
  managerEligibility: boolean  // true = restrict to players active that year
  exclude: string[]     // already-picked player ids
}

export function getEligiblePool(opts: PoolOptions): RatedPlayer[] {
  const { slot, year, prime, managerEligibility, exclude } = opts

  const build = (floor: number, slack: number) => ENGLAND_PLAYERS.filter(p => {
    if (exclude.includes(p.id)) return false
    if (!canPlaySlot(p, slot)) return false
    if (managerEligibility) {
      const { from, to } = eligibleYears(p)
      if (year < from - slack || year > to + slack) return false
    }
    if (!prime) {
      const rated = ratePlayerForYear(p, year, false)
      if (rated.ratingAtYear < floor) return false
    }
    return true
  })

  // Guarantee a non-empty pool for every position in every year: relax the
  // rating floor first, then widen the eligibility window as a last resort.
  let pool = build(60, 0)
  if (pool.length === 0) pool = build(45, 0)
  if (pool.length === 0) pool = build(40, 6)

  return pool
    .map(p => ratePlayerForYear(p, year, prime))
    .sort((a, b) => b.ratingAtYear - a.ratingAtYear)
}

// Full draft pool (all positions) for the wheel — prime ratings, all-time.
export function getDraftPool(exclude: string[], prime = true, year = 9999): RatedPlayer[] {
  return ENGLAND_PLAYERS
    .filter(p => !exclude.includes(p.id))
    .map(p => ratePlayerForYear(p, year, prime))
}
