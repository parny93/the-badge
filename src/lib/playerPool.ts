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

// Can a player operate in a given slot position (natural or a reasonable shift)?
export function canPlaySlot(player: Player, slot: Position): boolean {
  if (player.positions.includes(slot)) return true
  const related: Record<Position, Position[]> = {
    GK: [],
    RB: ['RM', 'CB', 'RW'],
    LB: ['LM', 'CB', 'LW'],
    CB: ['RB', 'LB', 'CDM'],
    CDM: ['CM', 'CB'],
    CM: ['CDM', 'CAM'],
    CAM: ['CM', 'RW', 'LW', 'ST'],
    RM: ['RW', 'RB', 'CM'],
    LM: ['LW', 'LB', 'CM'],
    RW: ['RM', 'CAM', 'ST', 'LW'],
    LW: ['LM', 'CAM', 'ST', 'RW'],
    ST: ['CAM', 'RW', 'LW'],
  }
  return (related[slot] ?? []).some(p => player.positions.includes(p))
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

  const pool = ENGLAND_PLAYERS.filter(p => {
    if (exclude.includes(p.id)) return false
    if (!canPlaySlot(p, slot)) return false
    if (managerEligibility && !isEligibleInYear(p, year)) return false
    if (!prime) {
      const rated = ratePlayerForYear(p, year, false)
      if (rated.ratingAtYear < 60) return false
    }
    return true
  })

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
