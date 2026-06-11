import { Player, Position, RatedPlayer } from '@/types'
import { ENGLAND_PLAYERS } from '@/data/players'
import { ratePlayerForYear } from './agingCurve'

// International availability overrides for players who retired early / late from
// England, where the simple age window would be wrong. Otherwise we assume a
// player could realistically be picked from age 17 to 35.
const INTL_OVERRIDES: Record<string, { from?: number; to?: number }> = {
  paul_scholes:     { to: 2004 },  // voluntarily retired from England after Euro 2004
  paul_gascoigne:   { to: 1998 },  // last cap 1998
  jimmy_greaves:    { to: 1967 },
  ledley_king:      { to: 2010 },  // injuries curtailed career
  michael_carrick:  { to: 2015 },
  owen_hargreaves:  { to: 2008 },  // injuries ended career
  wayne_rooney:     { to: 2016 },
  steven_gerrard:   { to: 2014 },
  frank_lampard:    { to: 2014 },
  david_beckham:    { to: 2009 },  // last cap May 2009
  michael_owen:     { to: 2008 },  // last cap Nov 2008; post-injury decline
  peter_shilton:    { to: 1990 },  // played to Italia '90 aged 40
  ray_clemence:     { to: 1983 },
  gordon_banks:     { to: 1972 },  // car crash ended career
  david_james:      { to: 2010 },
  gary_lineker:     { to: 1992 },  // retired after Euro 92
  alan_shearer:     { to: 2000 },  // retired from England after Euro 2000
  // Players whose age window (bornYear+35) is too generous:
  gary_neville:     { to: 2006 },  // last tournament WC 2006; retired from England Feb 2007
  david_seaman:     { to: 2002 },  // last cap Sep 2002; Ronaldinho ended England career
  sol_campbell:     { to: 2006 },  // last meaningful tournament; drifted out 2007
  emile_heskey:     { to: 2010 },  // retired from England after 2010 WC
  // New players
  bobby_charlton:   { to: 1970 },  // last cap 1970 WC; retired from England
  martin_chivers:   { to: 1974 },  // last cap 1974
  darren_anderton:  { to: 2001 },  // last cap 2001
  graeme_le_saux:   { to: 2000 },  // last cap 2000 after Euro 2000
  robbie_fowler:    { to: 2002 },  // last cap 2002
  andy_cole:        { to: 2002 },  // last cap 2002
  martin_keown:     { to: 2002 },  // last cap 2002
  wayne_bridge:     { to: 2010 },  // withdrew from 2010 WC squad
  jack_wilshere:    { to: 2016 },  // injuries effectively ended international career
  james_milner:     { to: 2016 },  // last cap 2016
  theo_walcott:     { to: 2018 },  // last cap 2018
  jamie_vardy:      { to: 2021 },  // retired from international football after Euro 2020
  // Stuart Pearce's last cap was 1999 (37) — outlasted default age-35 cutoff
  stuart_pearce:    { to: 1999 },
  // 1960s full-backs
  jimmy_armfield:   { to: 1966 },  // England's captain at 1966 WC; last cap 1966
  george_cohen:     { to: 1969 },  // World Cup winner; last cap 1969
  keith_newton:     { to: 1971 },  // 1970 WC; retired 1971
  ray_wilson:       { to: 1968 },  // World Cup winner; car crash ended career
  // 1970–80s full-backs
  terry_cooper:     { to: 1975 },  // last cap 1975
  mick_mills:       { to: 1982 },  // played both flanks; last England tournament 1982
  phil_neal:        { to: 1983 },  // last cap 1983
  kenny_sansom:     { to: 1988 },  // 86 caps; last cap 1988
  // 1986–94 defenders
  paul_parker:      { to: 1999 },  // last cap 1994, extended for game coverage
  mark_wright:      { to: 1996 },  // last cap 1996
  phil_jagielka:    { to: 2017 },  // last cap 2017
  // 2000s–2010s defenders
  leighton_baines:  { to: 2015 },  // last cap 2015
  danny_rose:       { to: 2019 },  // last cap 2019
  // 2018–2022 CB window
  tyrone_mings:     { from: 2019, to: 2022 },
  eric_dier:        { from: 2015 },  // CB/CDM role from 2015
  // 2020s generation
  marc_guehi:       { from: 2021 },
  dominic_calvert_lewin: { from: 2019 },
  ollie_watkins:    { from: 2020 },
  // Era-gap players (secondary additions)
  norman_hunter:    { to: 1978 },  // last cap 1974; extended slightly for coverage
  michael_keane:    { from: 2017, to: 2019 },
  levi_colwill:     { from: 2022 },
  tony_dorigo:      { to: 1994 },  // last cap 1994
  wes_brown:        { from: 2001, to: 2010 },
  peter_bonetti:    { to: 1974 },  // backup to Banks; extended for GK coverage
  callum_wilson:    { from: 2018, to: 2023 },
  tammy_abraham:    { from: 2020 },
  // 1966–1978 era strikers
  francis_lee:      { from: 1966, to: 1972 },  // 27 caps 1968–1972; available from 1966 (22yo, Man City pro)
  mick_channon:     { from: 1972, to: 1978 },  // 46 caps 1972–1977; extended to 1978
  // Fix Kyle Walker's window — played at 2026 WC
  kyle_walker:      { to: 2026 },
  // 1960s–70s wingers
  peter_thompson:   { from: 1963, to: 1970 },  // 16 England caps 1964–1970
  ian_callaghan:    { from: 1963, to: 1977 },  // 4 caps; 1966 WC squad + 1977 recall
  peter_barnes:     { from: 1977, to: 1982 },  // 22 caps 1977–1982; PFA Young Player of Year 1976
  // Added historical wide players — flank depth for the 1960s–80s
  john_connelly:    { from: 1960, to: 1969 },  // 20 caps; 1962 & 1966 WC squads (two-footed flyer)
  terry_paine:      { from: 1961, to: 1969 },  // 19 caps; 1966 WC squad; Southampton crossing king
  george_eastham:   { from: 1960, to: 1969 },  // 19 caps; 1966 WC squad; Arsenal schemer
  dave_thomas:      { from: 1974, to: 1979 },  // 8 caps mid-70s; QPR's flying left-sider
  tony_morley:      { from: 1980, to: 1984 },  // 6 caps; Aston Villa European Cup winner
  trevor_steven:    { from: 1985, to: 1992 },  // 36 caps; 1986 & 1990 WC; Euro 88
  steve_hodge:      { from: 1986, to: 1991 },  // 24 caps; 1986 & 1990 WC
  // ── Pre-1966 era (1950–1962 World Cups) ──
  stanley_matthews: { from: 1946, to: 1957 },  // post-war window; England career ran to 42
  tom_finney:       { from: 1946, to: 1958 },
  billy_wright:     { from: 1946, to: 1959 },  // first man to 100 caps
  alf_ramsey_player:{ from: 1948, to: 1953 },  // the Hungary defeats ended his England career
  neil_franklin:    { from: 1946, to: 1950 },  // Bogotá move ended England career pre-1950 WC
  wilf_mannion:     { from: 1946, to: 1951 },
  stan_mortensen:   { from: 1947, to: 1953 },
  jackie_milburn:   { from: 1948, to: 1955 },
  bert_williams:    { from: 1949, to: 1955 },
  gil_merrick:      { from: 1951, to: 1954 },
  jimmy_dickinson:  { from: 1949, to: 1956 },
  duncan_edwards:   { from: 1955, to: 1957 },  // Munich, February 1958
  tommy_taylor:     { from: 1953, to: 1957 },  // Munich
  roger_byrne:      { from: 1954, to: 1957 },  // Munich
  colin_mcdonald:   { from: 1957, to: 1959 },
  bryan_douglas:    { from: 1957, to: 1963 },
  johnny_haynes:    { from: 1954, to: 1962 },  // car crash ended England career
  ron_flowers:      { from: 1955, to: 1966 },  // in the 1966 winning squad
  ron_springett:    { from: 1959, to: 1966 },
  bobby_smith:      { from: 1960, to: 1963 },
  gerry_hitchens:   { from: 1961, to: 1962 },
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

// Bench pool — non-positional apart from the GK/outfield split.
export function getBenchPool(opts: {
  gk: boolean
  year: number
  prime: boolean
  managerEligibility: boolean
  exclude: string[]
}): RatedPlayer[] {
  return ENGLAND_PLAYERS
    .filter(p => {
      if (opts.exclude.includes(p.id)) return false
      if ((p.positions[0] === 'GK') !== opts.gk) return false
      if (opts.managerEligibility) {
        const { from, to } = eligibleYears(p)
        if (opts.year < from || opts.year > to) return false
      }
      return true
    })
    .map(p => ratePlayerForYear(p, opts.year, opts.prime))
    .sort((a, b) => b.ratingAtYear - a.ratingAtYear)
}
