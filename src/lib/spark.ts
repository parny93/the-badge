import { RatedPlayer } from '@/types'
import { hashSeed } from './rng'
import { displaySurname } from './names'

// ─── Spark link-ups ───────────────────────────────────────────────────────────
// Occasionally an unlikely partnership just clicks and a limited player plays
// the game of his life. Deterministic from the XI (so it's stable while you
// look at the squad and doesn't flicker), but varies as you change personnel —
// roughly one in seven sides has a spark.

export interface Spark {
  playerId: string
  partner: string      // surname of the teammate he's clicked with
  hero: string         // surname of the overperformer
  boost: number        // rating points added to the hero
}

const SPARK_CHANCE = 1 / 7

export function sparkFor(squad: (RatedPlayer | null)[]): Spark | null {
  const xi = squad.filter((p): p is RatedPlayer => p !== null)
  if (xi.length < 6) return null

  // Deterministic generator seeded by the (order-independent) set of players.
  let s = hashSeed(xi.map(p => p.id).sort().join(',')) >>> 0
  const next = () => {
    s += 0x6d2b79f5
    let t = s
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }

  if (next() >= SPARK_CHANCE) return null

  // The hero is one of the three weakest outfielders; the partner is a strong
  // teammate he's struck something up with.
  const outfield = xi.filter(p => p.positions[0] !== 'GK').sort((a, b) => a.ratingAtYear - b.ratingAtYear)
  if (outfield.length < 2) return null
  const hero = outfield[Math.floor(next() * Math.min(3, outfield.length))]
  const others = xi.filter(p => p.id !== hero.id).sort((a, b) => b.ratingAtYear - a.ratingAtYear)
  const partner = others[Math.floor(next() * Math.min(3, others.length))]
  const boost = 8 + Math.floor(next() * 7)   // +8 … +14

  return {
    playerId: hero.id,
    hero: displaySurname(hero.name),
    partner: displaySurname(partner.name),
    boost,
  }
}
