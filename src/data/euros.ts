import { WorldCupData } from '@/types'

// All UEFA European Championships 1960–2024.
// For years England didn't qualify we insert England as a wildcard (same approach as World Cups).
// 4-team Euros (1960–1976): modelled as 1 group of 4, top 2 play the Final.
// 8-team Euros (1980–1992): 2 groups of 4, top 2 each → SF → Final.
// 16-team Euros (1996–2012): 4 groups of 4, top 2 each → QF → SF → Final.
// 24-team Euros (2016–2024): 6 groups of 4, top 3 each → R16 → QF → SF → Final.

export const EUROS: WorldCupData[] = [
  // ── 4-team era ────────────────────────────────────────────────────────────
  {
    year: 1960,
    host: 'France',
    historicalWinner: 'USSR',
    format: 'euro-4-team',
    competition: 'Euro',
    englandQualified: false, // didn't qualify — wildcard entry
    englandGroup: 'Group 1',
    groups: [
      // France (host, finished 4th) replaced by England
      { name: 'Group 1', teams: ['USSR', 'Yugoslavia', 'Czechoslovakia', 'England'] },
    ],
  },
  {
    year: 1964,
    host: 'Spain',
    historicalWinner: 'Spain',
    format: 'euro-4-team',
    competition: 'Euro',
    englandQualified: false, // didn't qualify — wildcard entry
    englandGroup: 'Group 1',
    groups: [
      // Denmark (4th place) replaced by England
      { name: 'Group 1', teams: ['Spain', 'USSR', 'Hungary', 'England'] },
    ],
  },
  {
    year: 1968,
    host: 'Italy',
    historicalWinner: 'Italy',
    format: 'euro-4-team',
    competition: 'Euro',
    englandQualified: true, // participated — finished 3rd (beat USSR in play-off)
    englandGroup: 'Group 1',
    groups: [
      { name: 'Group 1', teams: ['Italy', 'Yugoslavia', 'England', 'USSR'] },
    ],
  },
  {
    year: 1972,
    host: 'Belgium',
    historicalWinner: 'West Germany',
    format: 'euro-4-team',
    competition: 'Euro',
    englandQualified: false, // didn't qualify — wildcard entry
    englandGroup: 'Group 1',
    groups: [
      // Hungary (4th place) replaced by England
      { name: 'Group 1', teams: ['West Germany', 'USSR', 'Belgium', 'England'] },
    ],
  },
  {
    year: 1976,
    host: 'Yugoslavia',
    historicalWinner: 'Czechoslovakia',
    format: 'euro-4-team',
    competition: 'Euro',
    englandQualified: false, // didn't qualify — wildcard entry
    englandGroup: 'Group 1',
    groups: [
      // Yugoslavia (host, 4th) replaced by England
      { name: 'Group 1', teams: ['Czechoslovakia', 'West Germany', 'Netherlands', 'England'] },
    ],
  },

  // ── 8-team era ────────────────────────────────────────────────────────────
  {
    year: 1980,
    host: 'Italy',
    historicalWinner: 'West Germany',
    format: 'euro-8-team',
    competition: 'Euro',
    englandQualified: true, // participated — group stage exit (3rd in group behind Belgium & Italy)
    englandGroup: 'Group 2',
    groups: [
      { name: 'Group 1', teams: ['West Germany', 'Czechoslovakia', 'Netherlands', 'Greece'] },
      { name: 'Group 2', teams: ['Belgium', 'England', 'Spain', 'Italy'] },
    ],
  },
  {
    year: 1984,
    host: 'France',
    historicalWinner: 'France',
    format: 'euro-8-team',
    competition: 'Euro',
    englandQualified: false, // didn't qualify — wildcard entry
    englandGroup: 'Group 2',
    groups: [
      { name: 'Group 1', teams: ['France', 'Denmark', 'Belgium', 'Yugoslavia'] },
      // Romania replaced by England
      { name: 'Group 2', teams: ['Spain', 'Portugal', 'West Germany', 'England'] },
    ],
  },
  {
    year: 1988,
    host: 'West Germany',
    historicalWinner: 'Netherlands',
    format: 'euro-8-team',
    competition: 'Euro',
    englandQualified: true, // participated — last in group (3 defeats)
    englandGroup: 'Group 2',
    groups: [
      { name: 'Group 1', teams: ['West Germany', 'Italy', 'Spain', 'Denmark'] },
      { name: 'Group 2', teams: ['USSR', 'Netherlands', 'England', 'Republic of Ireland'] },
    ],
  },
  {
    year: 1992,
    host: 'Sweden',
    historicalWinner: 'Denmark',
    format: 'euro-8-team',
    competition: 'Euro',
    englandQualified: true, // participated — group stage exit (1 draw, 1 draw, 1 loss)
    englandGroup: 'Group 1',
    groups: [
      // Group 1 actual: Sweden, Denmark, England, France
      { name: 'Group 1', teams: ['France', 'England', 'Sweden', 'Denmark'] },
      { name: 'Group 2', teams: ['Netherlands', 'Germany', 'CIS', 'Scotland'] },
    ],
  },

  // ── 16-team era ───────────────────────────────────────────────────────────
  {
    year: 1996,
    host: 'England',
    historicalWinner: 'Germany',
    format: 'euro-16-team',
    competition: 'Euro',
    englandQualified: true, // host — reached Semi-Final (lost to Germany on pens — Southgate)
    englandGroup: 'Group A',
    groups: [
      { name: 'Group A', teams: ['England', 'Netherlands', 'Scotland', 'Switzerland'] },
      { name: 'Group B', teams: ['France', 'Spain', 'Bulgaria', 'Romania'] },
      { name: 'Group C', teams: ['Germany', 'Italy', 'Czech Republic', 'Russia'] },
      { name: 'Group D', teams: ['Denmark', 'Portugal', 'Croatia', 'Turkey'] },
    ],
  },
  {
    year: 2000,
    host: 'Belgium / Netherlands',
    historicalWinner: 'France',
    format: 'euro-16-team',
    competition: 'Euro',
    englandQualified: true, // participated — group stage exit (1W 0D 2L, Group D 3rd)
    englandGroup: 'Group D',
    groups: [
      { name: 'Group A', teams: ['France', 'Czech Republic', 'Denmark', 'Netherlands'] },
      { name: 'Group B', teams: ['Belgium', 'Sweden', 'Turkey', 'Italy'] },
      { name: 'Group C', teams: ['Spain', 'Norway', 'Yugoslavia', 'Slovenia'] },
      { name: 'Group D', teams: ['Romania', 'Portugal', 'England', 'Germany'] },
    ],
  },
  {
    year: 2004,
    host: 'Portugal',
    historicalWinner: 'Greece',
    format: 'euro-16-team',
    competition: 'Euro',
    englandQualified: true, // participated — QF exit (lost to Portugal on pens)
    englandGroup: 'Group B',
    groups: [
      { name: 'Group A', teams: ['Portugal', 'Greece', 'Spain', 'Russia'] },
      { name: 'Group B', teams: ['France', 'England', 'Croatia', 'Switzerland'] },
      { name: 'Group C', teams: ['Denmark', 'Italy', 'Sweden', 'Bulgaria'] },
      { name: 'Group D', teams: ['Czech Republic', 'Latvia', 'Netherlands', 'Germany'] },
    ],
  },
  {
    year: 2008,
    host: 'Austria / Switzerland',
    historicalWinner: 'Spain',
    format: 'euro-16-team',
    competition: 'Euro',
    englandQualified: false, // didn't qualify — wildcard entry
    englandGroup: 'Group B',
    groups: [
      { name: 'Group A', teams: ['Portugal', 'Turkey', 'Czech Republic', 'Switzerland'] },
      // Austria (host, weak) replaced by England
      { name: 'Group B', teams: ['England', 'Croatia', 'Germany', 'Poland'] },
      { name: 'Group C', teams: ['Netherlands', 'Italy', 'Romania', 'France'] },
      { name: 'Group D', teams: ['Spain', 'Russia', 'Greece', 'Sweden'] },
    ],
  },
  {
    year: 2012,
    host: 'Poland / Ukraine',
    historicalWinner: 'Spain',
    format: 'euro-16-team',
    competition: 'Euro',
    englandQualified: true, // participated — QF exit (lost to Italy on pens)
    englandGroup: 'Group D',
    groups: [
      { name: 'Group A', teams: ['Poland', 'Greece', 'Russia', 'Czech Republic'] },
      { name: 'Group B', teams: ['Netherlands', 'Denmark', 'Germany', 'Portugal'] },
      { name: 'Group C', teams: ['Spain', 'Italy', 'Republic of Ireland', 'Croatia'] },
      { name: 'Group D', teams: ['France', 'England', 'Ukraine', 'Sweden'] },
    ],
  },

  // ── 24-team era ───────────────────────────────────────────────────────────
  {
    year: 2016,
    host: 'France',
    historicalWinner: 'Portugal',
    format: 'euro-24-team',
    competition: 'Euro',
    englandQualified: true, // participated — R16 exit (lost to Iceland 1-2)
    englandGroup: 'Group B',
    groups: [
      { name: 'Group A', teams: ['France', 'Switzerland', 'Albania', 'Romania'] },
      { name: 'Group B', teams: ['England', 'Wales', 'Slovakia', 'Russia'] },
      { name: 'Group C', teams: ['Germany', 'Poland', 'Northern Ireland', 'Ukraine'] },
      { name: 'Group D', teams: ['Spain', 'Croatia', 'Czech Republic', 'Turkey'] },
      { name: 'Group E', teams: ['Belgium', 'Republic of Ireland', 'Italy', 'Sweden'] },
      { name: 'Group F', teams: ['Hungary', 'Iceland', 'Portugal', 'Austria'] },
    ],
  },
  {
    year: 2020,  // played in 2021 due to COVID-19
    host: 'Pan-European (Final at Wembley)',
    historicalWinner: 'Italy',
    format: 'euro-24-team',
    competition: 'Euro',
    englandQualified: true, // host of final — reached the Final (lost to Italy on pens)
    englandGroup: 'Group D',
    groups: [
      { name: 'Group A', teams: ['Turkey', 'Italy', 'Wales', 'Switzerland'] },
      { name: 'Group B', teams: ['Denmark', 'Finland', 'Belgium', 'Russia'] },
      { name: 'Group C', teams: ['Netherlands', 'Ukraine', 'Austria', 'North Macedonia'] },
      { name: 'Group D', teams: ['England', 'Croatia', 'Scotland', 'Czech Republic'] },
      { name: 'Group E', teams: ['Spain', 'Sweden', 'Poland', 'Slovakia'] },
      { name: 'Group F', teams: ['Hungary', 'Portugal', 'France', 'Germany'] },
    ],
  },
  {
    year: 2024,
    host: 'Germany',
    historicalWinner: 'Spain',
    format: 'euro-24-team',
    competition: 'Euro',
    englandQualified: true, // participated — reached the Final (lost to Spain 1-2)
    englandGroup: 'Group C',
    groups: [
      { name: 'Group A', teams: ['Germany', 'Scotland', 'Hungary', 'Switzerland'] },
      { name: 'Group B', teams: ['Spain', 'Croatia', 'Italy', 'Albania'] },
      { name: 'Group C', teams: ['England', 'Serbia', 'Denmark', 'Slovenia'] },
      { name: 'Group D', teams: ['Poland', 'Netherlands', 'Austria', 'France'] },
      { name: 'Group E', teams: ['Belgium', 'Slovakia', 'Romania', 'Ukraine'] },
      { name: 'Group F', teams: ['Turkey', 'Georgia', 'Portugal', 'Czech Republic'] },
    ],
  },
]
