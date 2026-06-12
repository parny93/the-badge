import { KnockoutRound } from '@/types'

// ─── Iconic scripted moments ──────────────────────────────────────────────────
// Real moments that stick in fans' minds, coded to fire when you play that
// nation in that year (and round, where it's specific). Goal moments count
// toward the real scoreline — so the Hand of God really does put Argentina
// ahead, but a good enough England can still outscore them.

export type IconicKind = 'opp-goal' | 'eng-goal' | 'opp-red' | 'eng-red' | 'info'

export interface IconicMoment {
  minute: number
  text: string
  kind: IconicKind
}

interface IconicMatch {
  year: number
  opponent: string
  round?: 'Group' | KnockoutRound   // omit = any match vs this nation that year
  moments: IconicMoment[]
}

const ICONIC: IconicMatch[] = [
  // 1966 World Cup Final — England's finest hour.
  {
    year: 1966, opponent: 'West Germany', round: 'Final',
    moments: [
      { minute: 78, text: "Hurst's shot crashes down off the bar — did it cross the line? The linesman says YES. England lead.", kind: 'eng-goal' },
      { minute: 90, text: '"Some people are on the pitch, they think it\'s all over..." Hurst smashes the fourth. "It is now!" A hat-trick in the final.', kind: 'eng-goal' },
    ],
  },
  // 1970 World Cup — Gordon Banks' save from Pelé.
  {
    year: 1970, opponent: 'Brazil',
    moments: [
      { minute: 27, text: 'Pelé meets the cross and heads it down — and Banks, somehow, claws it over the bar. The greatest save the game has ever seen.', kind: 'info' },
    ],
  },
  // 1986 World Cup QF — the Hand of God, and the Goal of the Century.
  {
    year: 1986, opponent: 'Argentina',
    moments: [
      { minute: 51, text: 'Maradona rises with Shilton and punches it past him — the referee gives it! The Hand of God. England are furious.', kind: 'opp-goal' },
      { minute: 55, text: 'Maradona picks it up inside his own half, beats one, two, three, four, and rolls it in. The Goal of the Century. Sheer genius.', kind: 'opp-goal' },
    ],
  },
  // 1990 World Cup SF — Gazza's tears.
  {
    year: 1990, opponent: 'West Germany', round: 'SF',
    moments: [
      { minute: 62, text: "Gascoigne lunges in and is booked — and the tears come. He'd miss the final. Lineker turns to the bench: 'have a word'.", kind: 'info' },
    ],
  },
  // 1996 Euro SF — so nearly the golden goal.
  {
    year: 1996, opponent: 'Germany', round: 'SF',
    moments: [
      { minute: 96, text: 'Gascoigne stretches every sinew at the far post — studs sliding past the ball by inches. Wembley screams, then groans.', kind: 'info' },
    ],
  },
  // 1998 World Cup R16 — Owen's wondergoal and Beckham's red.
  {
    year: 1998, opponent: 'Argentina',
    moments: [
      { minute: 16, text: 'Owen collects it on halfway, surges past two, and lashes it in off the bar. An 18-year-old announces himself to the world.', kind: 'eng-goal' },
      { minute: 47, text: 'Simeone leaves one on Beckham — and Beckham flicks his boot out at him. The referee shows RED. England down to ten.', kind: 'eng-red' },
    ],
  },
  // 2004 Euro QF — the disallowed Campbell goal vs Portugal.
  {
    year: 2004, opponent: 'Portugal', round: 'QF',
    moments: [
      { minute: 90, text: "Campbell heads home what looks like the winner — but it's chalked off for a phantom foul. England cannot believe it.", kind: 'info' },
    ],
  },
  // 2006 World Cup — Rooney's red, the Ronaldo wink (if you face Portugal).
  {
    year: 2006, opponent: 'Portugal',
    moments: [
      { minute: 62, text: 'Rooney tangles with Carvalho and stamps down — RED CARD. In the background, Ronaldo winks to the bench.', kind: 'eng-red' },
    ],
  },
  // 2006 World Cup hypothetical final vs France — Zidane's headbutt.
  {
    year: 2006, opponent: 'France', round: 'Final',
    moments: [
      { minute: 110, text: 'Words are exchanged — and Zidane turns and headbutts the England man square in the chest. RED CARD. He walks off past the trophy, his career over.', kind: 'opp-red' },
    ],
  },
  // 2018 World Cup — the penalty shootout hoodoo finally broken (vs Colombia).
  {
    year: 2018, opponent: 'Colombia',
    moments: [
      { minute: 119, text: "It's going to penalties — but this is a different England. Pickford and the dossier are ready.", kind: 'info' },
    ],
  },
  // Euro 2020 Final vs Italy — Shaw's early thunderbolt at Wembley.
  {
    year: 2020, opponent: 'Italy', round: 'Final',
    moments: [
      { minute: 2, text: 'Luke Shaw lashes it in off the post after two minutes — the fastest goal in a Euros final. Wembley simply erupts.', kind: 'eng-goal' },
    ],
  },
  // Euro 2024 R16 vs Slovakia — Bellingham's overhead kick rescue.
  {
    year: 2024, opponent: 'Slovakia',
    moments: [
      { minute: 95, text: 'Last seconds, England staring at the exit — Bellingham, overhead kick, into the net! He has saved the tournament from nowhere.', kind: 'eng-goal' },
    ],
  },
  // Euro 2024 Final vs Spain — Palmer on, the late equaliser chase.
  {
    year: 2024, opponent: 'Spain', round: 'Final',
    moments: [
      { minute: 73, text: "Palmer, on as a sub, sweeps it into the bottom corner — England are level in the final! Game on, just like Berlin.", kind: 'eng-goal' },
    ],
  },
]

export function iconicFor(year: number, opponent: string, round: 'Group' | KnockoutRound): IconicMoment[] {
  return ICONIC
    .filter(m => m.year === year && m.opponent === opponent && (m.round === undefined || m.round === round))
    .flatMap(m => m.moments)
}
