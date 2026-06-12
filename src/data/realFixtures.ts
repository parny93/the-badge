import { KnockoutRound } from '@/types'

// ─── Real historical knockout fixtures ────────────────────────────────────────
// England's ACTUAL knockout opponents, round by round, for each tournament
// they reached the knockouts. With "Real fixtures" on, you face these instead
// of a random draw — so France really do await in the 2022 quarter-final, and
// the road to a Euro 2020 or 2024 final ends against Italy / Spain.
//
// Group fixtures are already historical (the groups in worldCups.ts / euros.ts
// are the real ones), so only the knockout path needs pinning. Years not listed
// (wildcards, group-stage exits, tournaments yet to be played) fall back to the
// seeded simulation.

const REAL_PATH: Record<number, Partial<Record<KnockoutRound, string>>> = {
  // ── World Cups ──
  1954: { QF: 'Uruguay' },
  1962: { QF: 'Brazil' },
  1966: { QF: 'Argentina', SF: 'Portugal', Final: 'West Germany' },   // champions
  1970: { QF: 'West Germany' },
  1986: { QF: 'Argentina' },                                          // Hand of God
  1990: { R16: 'Belgium', QF: 'Cameroon', SF: 'West Germany' },       // out on pens
  1998: { R16: 'Argentina' },                                         // out on pens
  2002: { R16: 'Denmark', QF: 'Brazil' },
  2006: { R16: 'Ecuador', QF: 'Portugal' },                          // out on pens
  2010: { R16: 'Germany' },                                           // the 4-1, Lampard's ghost goal
  2018: { R16: 'Colombia', QF: 'Sweden', SF: 'Croatia' },
  2022: { R16: 'Senegal', QF: 'France' },                            // Kane over the bar
  // ── European Championships ──
  1996: { QF: 'Spain', SF: 'Germany' },                              // Southgate's penalty
  2004: { QF: 'Portugal' },
  2012: { QF: 'Italy' },
  2016: { R16: 'Iceland' },                                           // the one that hurt
  2020: { R16: 'Germany', QF: 'Ukraine', SF: 'Denmark', Final: 'Italy' },   // Wembley heartbreak
  2024: { R16: 'Slovakia', QF: 'Switzerland', SF: 'Netherlands', Final: 'Spain' },
}

export function hasRealPath(year: number): boolean {
  return year in REAL_PATH
}

export function getRealOpponent(year: number, round: KnockoutRound): string | null {
  return REAL_PATH[year]?.[round] ?? null
}
