import { rand } from '@/lib/rng'

// ─── Random easter eggs ───────────────────────────────────────────────────────
// Rare (roughly 1-in-200) moments tied to a nation and the era a particular
// character was around. Unlike the scripted iconic moments (which always fire),
// these are pure lottery flavour — when one lands, you remember it.

export type EggKind = 'info' | 'opp-red'

interface EasterEgg {
  nation: string
  from: number
  to: number
  chance: number      // probability per match
  kind: EggKind
  text: string
}

const EGGS: EasterEgg[] = [
  // Luis Suárez, Uruguay — the bite.
  {
    nation: 'Uruguay', from: 2010, to: 2019, chance: 1 / 200, kind: 'info',
    text: "Hang on — it looked like Suárez just bit someone there. Surely not. Surely NOT. The replays are... oh dear.",
  },
  // Josip Šimunić, Croatia — the referee who lost count of the yellows.
  {
    nation: 'Croatia', from: 2006, to: 2014, chance: 1 / 200, kind: 'opp-red',
    text: "Šimunić is shown a yellow — but we're CERTAIN he's already been booked! The referee's lost count entirely... eventually he gets his marching orders. Farcical.",
  },
  // Rivaldo, Brazil 2002 — the face-clutch.
  {
    nation: 'Brazil', from: 1998, to: 2002, chance: 1 / 220, kind: 'info',
    text: 'Rivaldo collapses clutching his FACE — and the ball clearly hit his thigh. Theatrical doesn\'t cover it.',
  },
  // René Higuita, Colombia — the scorpion kick.
  {
    nation: 'Colombia', from: 1990, to: 1999, chance: 1 / 200, kind: 'info',
    text: 'Higuita launches into a scorpion-kick clearance — heels over his own head! Why? Because he can. The keeper is showing off again.',
  },
  // Simone Zaza, Italy — the penalty run-up.
  {
    nation: 'Italy', from: 2014, to: 2018, chance: 1 / 230, kind: 'info',
    text: "Zaza's run-up is a series of tiny bunny-hops... and he skies it into the stands. What on earth was that?",
  },
  // France 2010 — the training-ground mutiny.
  {
    nation: 'France', from: 2010, to: 2010, chance: 1 / 160, kind: 'info',
    text: 'Word filters out of the France camp — the players have refused to train. The bus door stays shut. Total chaos behind the scenes.',
  },
  // Nicklas Bendtner, Denmark — the lucky pants.
  {
    nation: 'Denmark', from: 2012, to: 2012, chance: 1 / 220, kind: 'info',
    text: "Bendtner peels down his shorts to flash a bookmaker's name on his waistband — booked, and fined a small fortune for it.",
  },
  // Roger Milla, Cameroon 1990 — the corner-flag dance.
  {
    nation: 'Cameroon', from: 1990, to: 1994, chance: 1 / 180, kind: 'info',
    text: 'Milla shimmies over to the corner flag and dances — the wiggle that defined a World Cup. Thirty-eight years old and loving it.',
  },
  // El Hadji Diouf, Senegal — the spat.
  {
    nation: 'Senegal', from: 2002, to: 2008, chance: 1 / 240, kind: 'info',
    text: 'Diouf has a word, then a gesture, then... the referee is not impressed by what just left his mouth. Pure pantomime villain.',
  },
  // Brazil 2002 vs anyone — Ronaldinho's audacity.
  {
    nation: 'Brazil', from: 2002, to: 2002, chance: 1 / 240, kind: 'info',
    text: "Ronaldinho looks up from forty yards, spots the keeper off his line, and very nearly lobs him for the cheek of it. The grin says it all.",
  },
]

export interface EasterEggHit {
  kind: EggKind
  text: string
}

// Roll each applicable egg for this match; returns those that landed.
export function rollEasterEggs(nation: string, year: number): EasterEggHit[] {
  return EGGS
    .filter(e => e.nation === nation && year >= e.from && year <= e.to && rand() < e.chance)
    .map(e => ({ kind: e.kind, text: e.text }))
}
