import { RatedPlayer } from '@/types'
import { hashSeed } from './rng'
import { displaySurname } from './names'

// ─── Link-ups & sparks ────────────────────────────────────────────────────────
// Some partnerships just work — documented over the years by the players
// themselves (Rooney loved playing off Heskey; Shearer and Sheringham were the
// SAS). When both are in your XI the link fires and the weaker man plays above
// himself. A few partnerships famously DIDN'T gel (Gerrard + Lampard) and cost
// a little. Sides with no documented link still occasionally get a random spark.

// ─── Random-spark toggle ──────────────────────────────────────────────────────
// The rare "bizarre unexpected link" (a random pairing that inexplicably works)
// is purely for fun. Set this to false to remove it entirely — documented
// link-ups (Rooney+Heskey etc.) are unaffected.
export const ENABLE_RANDOM_SPARK = true

export interface Spark {
  playerId: string     // who is affected (boosted, or the focus of a misfit)
  hero: string         // surname of the affected player
  partner: string      // surname of the linked teammate
  boost: number        // rating points (negative = a misfit that costs)
  note: string
  positive: boolean
  bizarre: boolean     // true = the rare random surprise (commentary notes it)
}

// Real, documented England partnerships. `note` references the actual quote /
// reputation. The WEAKER of the two is the one who's lifted (or dragged).
interface LinkDef { a: string; b: string; note: string; positive: boolean }

const LINKS: LinkDef[] = [
  { a: 'wayne_rooney', b: 'emile_heskey', positive: true,
    note: "Rooney always said it — he loved playing off big Emile. Heskey is doing all the dirty work and Rooney is flying." },
  { a: 'michael_owen', b: 'emile_heskey', positive: true,
    note: "Owen feeds off Heskey's hold-up play, just like at Liverpool — the runs and the knock-downs in perfect sync." },
  { a: 'alan_shearer', b: 'teddy_sheringham', positive: true,
    note: "The SAS — Shearer and Sheringham, the telepathy of Euro 96 is back. One drops, one spins in behind." },
  { a: 'gary_lineker', b: 'peter_beardsley', positive: true,
    note: "Beardsley does the graft, Lineker does the finishing — a partnership made in heaven, Italia '90 all over again." },
  { a: 'john_barnes', b: 'peter_beardsley', positive: true,
    note: "Barnes and Beardsley, the Anfield wing telepathy carried straight into an England shirt." },
  { a: 'glenn_hoddle', b: 'chris_waddle', positive: true,
    note: "Hoddle to Waddle — 'Diamond Lights' off the pitch, pure magic on it. The understanding is uncanny." },
  { a: 'geoff_hurst', b: 'martin_peters', positive: true,
    note: "Hurst and Peters — the West Ham academy partnership that won a World Cup, still finishing each other's moves." },
  { a: 'paul_gascoigne', b: 'gary_lineker', positive: true,
    note: "Gazza's vision and Lineker's movement — the Italia '90 axis, eyes closed." },
  { a: 'david_beckham', b: 'gary_neville', positive: true,
    note: "Neville overlaps, Beckham delivers — the Man Utd right side runs on pure instinct." },
  { a: 'tony_adams', b: 'martin_keown', positive: true,
    note: "Adams and Keown — the Arsenal back line that defends as one body. Nothing gets through." },
  { a: 'steven_gerrard', b: 'jamie_carragher', positive: true,
    note: "Gerrard and Carragher, Liverpool's spine — blind understanding, one covering as the other bursts forward." },
  { a: 'harry_kane', b: 'dele_alli', positive: true,
    note: "Kane and Dele — the Tottenham one-twos, played with their eyes shut." },
  { a: 'harry_kane', b: 'heung', positive: true, note: '' }, // (no Son in pool — placeholder, ignored)
  // The famous misfit.
  { a: 'steven_gerrard', b: 'frank_lampard', positive: false,
    note: "Gerrard and Lampard in the same midfield — brilliant apart, forever awkward together. England never did solve it." },
]

// Rare on purpose — roughly 1 in 18 sides finds a bizarre unexpected link.
const SPARK_CHANCE = 1 / 18

function seededRng(key: string) {
  let s = hashSeed(key) >>> 0
  return () => {
    s += 0x6d2b79f5
    let t = s
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function activeLinkups(squad: (RatedPlayer | null)[]): Spark[] {
  const xi = squad.filter((p): p is RatedPlayer => p !== null)
  if (xi.length < 6) return []
  const byId = new Map(xi.map(p => [p.id, p]))
  const out: Spark[] = []

  // Documented link-ups present in this XI.
  for (const link of LINKS) {
    const a = byId.get(link.a)
    const b = byId.get(link.b)
    if (!a || !b || !link.note) continue
    if (link.positive) {
      const weaker = a.ratingAtYear <= b.ratingAtYear ? a : b
      const stronger = weaker === a ? b : a
      const rng = seededRng(link.a + link.b)
      out.push({
        playerId: weaker.id,
        hero: displaySurname(weaker.name),
        partner: displaySurname(stronger.name),
        boost: 6 + Math.floor(rng() * 5),    // +6 … +10
        note: link.note,
        positive: true,
        bizarre: false,
      })
    } else {
      out.push({
        playerId: a.id,
        hero: displaySurname(a.name),
        partner: displaySurname(b.name),
        boost: -4,
        note: link.note,
        positive: false,
        bizarre: false,
      })
    }
  }

  // Cap documented positives at two, keep all negatives.
  const positives = out.filter(s => s.positive).slice(0, 2)
  const negatives = out.filter(s => !s.positive)
  const linked = [...positives, ...negatives]

  // No documented positive? A side still rarely finds a BIZARRE link — a
  // random pairing that inexplicably clicks. Gated by ENABLE_RANDOM_SPARK.
  if (ENABLE_RANDOM_SPARK && positives.length === 0) {
    const rng = seededRng('spark:' + xi.map(p => p.id).sort().join(','))
    if (rng() < SPARK_CHANCE) {
      const outfield = xi.filter(p => p.positions[0] !== 'GK').sort((x, y) => x.ratingAtYear - y.ratingAtYear)
      if (outfield.length >= 2) {
        const hero = outfield[Math.floor(rng() * Math.min(3, outfield.length))]
        const others = xi.filter(p => p.id !== hero.id).sort((x, y) => y.ratingAtYear - x.ratingAtYear)
        const partner = others[Math.floor(rng() * Math.min(3, others.length))]
        linked.push({
          playerId: hero.id,
          hero: displaySurname(hero.name),
          partner: displaySurname(partner.name),
          boost: 8 + Math.floor(rng() * 7),
          note: `Out of nowhere, ${displaySurname(hero.name)} and ${displaySurname(partner.name)} have struck up the most unlikely understanding — he's playing the game of his life`,
          positive: true,
          bizarre: true,
        })
      }
    }
  }

  return linked
}

// The lone bizarre spark in an XI, if any — for the odd in-match commentary.
export function bizarreSpark(squad: (RatedPlayer | null)[]): Spark | null {
  return activeLinkups(squad).find(s => s.bizarre) ?? null
}

// The single boost applied to a given player on the pitch (sum of any links).
export function boostForPlayer(squad: (RatedPlayer | null)[], playerId: string): number {
  return activeLinkups(squad)
    .filter(s => s.playerId === playerId && s.positive)
    .reduce((sum, s) => sum + s.boost, 0)
}
