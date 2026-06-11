import { MatchMoment, MatchResult, RatedPlayer } from '@/types'
import { Formation } from '@/types'
import { calculateTeamStrength } from './teamStrength'
import { Manager } from '@/data/managers'
import { penaltyRating } from '@/data/playerTags'
import { ENGLAND_PLAYERS } from '@/data/players'
import { displaySurname } from './names'
import { rand } from './rng'
import { getTeamRating } from '@/data/teamRatings'
import { atmosphereDeck } from '@/data/tournamentLore'

// VAR was only introduced at a World Cup in 2018. Before that, no monitors,
// no offside lines — just the referee, the linesman, and an argument.
const VAR_FROM_YEAR = 2018

// ─── Helpers ──────────────────────────────────────────────────────────────────

function poissonSample(lambda: number): number {
  const L = Math.exp(-Math.max(0.1, lambda))
  let k = 0, p = 1
  do { k++; p *= rand() } while (p > L)
  return k - 1
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(rand() * arr.length)]
}

function spread(n: number, max = 93): number[] {
  const mins: number[] = []
  let cursor = 3 + Math.floor(rand() * 12)
  for (let i = 0; i < n; i++) {
    cursor = Math.min(max, cursor + 6 + Math.floor(rand() * 18))
    mins.push(cursor)
  }
  return mins
}

// ─── Moment banks ─────────────────────────────────────────────────────────────

const MISS = [
  'blazed it over from six yards — Gazza did that and it hurt more',
  'dragged it wide when the nation had already started celebrating',
  'scuffed it straight at the keeper — the agony is almost comedic',
  'the finish just wasn\'t there — keepers could retire against England',
  'somehow found the only way not to score from that position',
  'hit the side-netting — the Three Lions look to the heavens',
  'fired straight at the goalkeeper. Again. England being England.',
]

const POST = [
  'thundered it off the crossbar — this is what England do to us',
  'rattled the post — inches away from something beautiful',
  'struck the upright — Alf Ramsey would have looked away',
  'the woodwork was the only thing stopping England — for once',
  'cannoned off the post — this could be one of those nights',
  'the crossbar trembled — it is NOT going in for England today',
]

const SAVE = [
  'an absolutely stunning save — the goalkeeper has denied England again',
  'tipped it onto the bar with one outstretched hand — world class',
  'the keeper read it and smothered it — England cannot believe it',
  'full stretch — fingertips keep it out. Sixty years of hurt continue.',
  'a point-blank stop that Banks himself would have applauded',
  'the keeper flew across goal. Nothing was getting past him today.',
  'unbelievable reflexes — England deserve more from this',
]

const CHANCE = [
  'the first touch let them down — the ghost of Waddle\'s missed penalty haunted him',
  'a glancing header went agonisingly wide',
  'burst in behind but lost his footing at the critical moment',
  'the through ball was perfect but the offside flag cuts it off — England groan',
  'whipped the cross in but no one could reach the far post',
  'a thunderous shot deflected just over — this could have been the one',
  'England poured forward but couldn\'t find the final ball',
]

const CARD_ENG = [
  'a reckless challenge — the referee has no choice. RED CARD. TEN MEN.',
  'yellow card for dissent — Bobby Moore would never have done that',
  'a cynical professional foul — booked. The manager buries his face.',
  'he\'s been shown red — England must dig deep now, just like Italia \'90',
  'yellow card — he\'ll know better than that. Won\'t he.',
]

const CARD_OPP = [
  'the opposition are reduced to ten men — England have a chance now',
  'red card for the opponent — a reckless lunge right in front of the referee',
  'a cynical foul — the referee reaches for red. England surge forward.',
  'yellow card for simulation — the crowd let him know exactly what they think',
  'ten men now — just like 1998, England must make their advantage count',
]

const VAR = [
  'VAR is checking... Wembley holds its breath',
  'the referee is being called to the monitor — the whole country stops',
  'a long VAR review — Gareth Southgate once said decisions go against England. Not today?',
  'VAR checks for handball... the nation stares at their phones',
]

const PENS_BUILD = [
  'the whistle blows for full time — we\'re going to penalties. The nation braces itself.',
  'extra time couldn\'t separate them. It comes down to spot-kicks. It always does for England.',
  'one hundred and twenty minutes of football and still level — penalties. Again.',
  'thirty years of penalty heartbreak — Pearce, Waddle, Batty — could this be different?',
]

const PEN_ENG_SCORE = [
  'steps up — drives it into the bottom corner. SCORED. England breathe again.',
  'sends the keeper the wrong way — SCORED. Pure composure.',
  'pauses, picks his spot — top corner. Goalkeeper rooted. SCORED.',
  'cool as you like, right down the middle. SCORED. The nation roars.',
  'smashes it — keeper dives but it\'s in off the post. SCORED!',
]

const PEN_ENG_MISS = [
  'hits the post — the nation groans. Not again. Please, not again.',
  'the keeper gets down and SAVES IT — England\'s tournament in the balance',
  'blazes it over the bar — echoes of Waddle in Turin, 1990',
  'the keeper dives the right way — saved. Gareth Southgate watches from the dugout.',
  'stutters in the run-up — the keeper guesses right. England\'s heartbreak continues.',
]

const PEN_OPP_SCORE = [
  'the opponent converts — we are level in the shootout',
  'no hesitation, no nerves — they score. England need the next one.',
  'keeper went the right way but not far enough — they score',
]

const PEN_OPP_SAVE = [
  'the keeper dives to his left and SAVES IT — absolute pandemonium',
  'pushed onto the post by the keeper — England have a foothold now',
  'the keeper guesses right — SAVED — England have the advantage!',
  'brilliant save from the keeper — now England must make it count',
]

// ─── Player moment text ───────────────────────────────────────────────────────

function englandGoalMoment(squad: (RatedPlayer | null)[]): string {
  const attackers = (squad.filter(Boolean) as RatedPlayer[])
    .filter(p => !['GK', 'CB', 'RB', 'LB', 'CDM'].includes(p.positions[0]))
  const player = attackers.length > 0 ? pick(attackers) : (squad.filter(Boolean) as RatedPlayer[])[0]
  if (!player) return 'England score!'
  const moment = player.moments?.length ? pick(player.moments) : `${displaySurname(player.name)} gets the goal`
  return moment
}

function englandSaveMoment(squad: (RatedPlayer | null)[]): string {
  const gk = (squad.filter(Boolean) as RatedPlayer[]).find(p => p.positions[0] === 'GK')
  const base = pick(SAVE)
  return gk ? `${displaySurname(gk.name)} — ${base}` : base
}

// A RANDOM attacker each time — .find() used to hand every miss, woodwork
// rattle and chance to the same first-in-formation forward all game long.
function randomAttacker(
  squad: (RatedPlayer | null)[],
  positions: string[]
): RatedPlayer | undefined {
  const candidates = (squad.filter(Boolean) as RatedPlayer[])
    .filter(p => positions.includes(p.positions[0]))
  return candidates.length > 0 ? pick(candidates) : undefined
}

// Lore lines that name a player read wrong when he isn't on the pitch
// ("Bellingham carries England's hopes" while Bellingham wasn't drafted).
// Case-sensitive word match against the full player pool's surnames.
const KNOWN_SURNAMES = [...new Set(ENGLAND_PLAYERS.map(p => displaySurname(p.name)))]

function atmosphereFitsSquad(line: string, squad: (RatedPlayer | null)[]): boolean {
  const squadSurnames = new Set(
    (squad.filter(Boolean) as RatedPlayer[]).map(p => displaySurname(p.name))
  )
  for (const surname of KNOWN_SURNAMES) {
    if (squadSurnames.has(surname)) continue
    if (new RegExp(`\\b${surname}\\b`).test(line)) return false
  }
  return true
}

// ─── Core match simulation ────────────────────────────────────────────────────

export interface SimMatchInput {
  englandSquad: (RatedPlayer | null)[]
  englandFormation: Formation
  opponent: string
  wcYear: number
  isKnockout: boolean
  manager?: Manager
  captainId?: string | null
  bench?: (RatedPlayer | null)[]
}

export function simulateMatch(input: SimMatchInput): MatchResult {
  const { englandSquad, englandFormation, opponent, wcYear, isKnockout, manager, captainId, bench } = input

  const engStrength = calculateTeamStrength(englandSquad, englandFormation, { manager, captainId, bench })
  // Tournament-knockout specialists (Southgate, Robson) raise their game
  // when it's win-or-go-home.
  if (isKnockout && manager?.knockoutBoost) {
    engStrength.attack += manager.knockoutBoost
    engStrength.defense += manager.knockoutBoost
  }
  const oppRating   = getTeamRating(opponent, wcYear)

  const oppStrength = {
    attack:  Math.round(oppRating * (0.85 + rand() * 0.30)),
    defense: Math.round(oppRating * (0.85 + rand() * 0.30)),
  }

  const engLambda = Math.max(0.2, 0.9 + (engStrength.attack - oppStrength.defense) * 0.025)
  const oppLambda = Math.max(0.2, 0.9 + (oppStrength.attack - engStrength.defense) * 0.025)

  let engGoals = poissonSample(engLambda)
  let oppGoals = poissonSample(oppLambda)

  // ── Tournament atmosphere — era/host flavour woven into the feed ────────────
  // A shuffled deck so a single match never repeats the same line twice, with
  // lines naming players who aren't in this squad filtered out.
  const atmoDeck = atmosphereDeck(wcYear).filter(line => atmosphereFitsSquad(line, englandSquad))
  let atmoCursor = 0
  const nextAtmo = (): string | null =>
    atmoCursor < atmoDeck.length ? atmoDeck[atmoCursor++] : null

  // ── Build moment timeline ──────────────────────────────────────────────────
  const moments: MatchMoment[] = []

  // Allocate minute slots for the total event count (5-9 moments)
  const totalMoments = 5 + Math.floor(rand() * 5)
  const minutes = spread(totalMoments)

  // Reserve slots for actual goals
  const engGoalSlots: number[] = []
  const oppGoalSlots: number[] = []

  for (let i = 0; i < engGoals; i++) {
    engGoalSlots.push(8 + Math.floor(rand() * 80))
  }
  for (let i = 0; i < oppGoals; i++) {
    oppGoalSlots.push(8 + Math.floor(rand() * 80))
  }

  // Add England goal moments
  for (const min of engGoalSlots) {
    moments.push({
      minute: min,
      text: englandGoalMoment(englandSquad),
      type: 'goal',
      team: 'england',
    })
  }

  // Add opponent goal moments
  const OPP_GOAL_LINES = [
    `${opponent} find the net — England must respond now`,
    `${opponent} score — this is a setback, but England have been here before`,
    `${opponent} go ahead — the Three Lions need to dig deep`,
    `${opponent} punish England — a reminder this won't be easy`,
    `${opponent} with a clinical finish — England chasing the game`,
  ]
  for (const min of oppGoalSlots) {
    moments.push({
      minute: min,
      text: OPP_GOAL_LINES[Math.floor(rand() * OPP_GOAL_LINES.length)],
      type: 'goal',
      team: 'opponent',
    })
  }

  // Fill in atmospheric / drama moments at allocated minutes
  // avoid exact duplicates with goal minutes
  const usedMins = new Set([...engGoalSlots, ...oppGoalSlots])

  for (const min of minutes) {
    if (usedMins.has(min)) continue
    usedMins.add(min)

    const roll = rand()

    if (roll < 0.20) {
      // Big save
      moments.push({ minute: min, text: englandSaveMoment(englandSquad), type: 'save' })
    } else if (roll < 0.38) {
      // Miss
      const fwd = randomAttacker(englandSquad, ['ST', 'LW', 'RW', 'CAM', 'RM', 'LM'])
      const surname = fwd ? displaySurname(fwd.name) : 'England'
      moments.push({ minute: min, text: `${surname} ${pick(MISS)}`, type: 'miss' })
    } else if (roll < 0.52) {
      // Hit the post / bar
      const fwd2 = randomAttacker(englandSquad, ['ST', 'LW', 'RW', 'CAM', 'RM', 'LM'])
      const surname2 = fwd2 ? displaySurname(fwd2.name) : 'England'
      moments.push({ minute: min, text: `${surname2} ${pick(POST)}`, type: 'post' })
    } else if (roll < 0.62) {
      // Red or yellow card
      const cardRoll = rand()
      if (cardRoll < 0.15) {
        // Red card for England (uncommon, dramatic)
        moments.push({ minute: min, text: pick(CARD_ENG), type: 'card', team: 'england' })
      } else if (cardRoll < 0.40) {
        // Red card for opponent
        moments.push({ minute: min, text: pick(CARD_OPP), type: 'card', team: 'opponent' })
      } else {
        // Yellow (less dramatic, still notable)
        moments.push({ minute: min, text: 'a yellow card shown — passions running high', type: 'card' })
      }
    } else if (roll < 0.72) {
      // Era-appropriate atmosphere — VAR only in the modern game; before that,
      // a nostalgic scene-setter pulled from the tournament's lore.
      const atmo = nextAtmo()
      if (wcYear >= VAR_FROM_YEAR && rand() < 0.5) {
        moments.push({ minute: min, text: pick(VAR), type: 'info' })
      } else if (atmo) {
        moments.push({ minute: min, text: atmo, type: 'info' })
      } else if (wcYear >= VAR_FROM_YEAR) {
        moments.push({ minute: min, text: pick(VAR), type: 'info' })
      } else {
        // Fall through to a chance if we've exhausted the atmosphere deck.
        const fwd0 = randomAttacker(englandSquad, ['ST', 'LW', 'RW', 'CAM', 'RM', 'LM'])
        const s0 = fwd0 ? displaySurname(fwd0.name) : null
        moments.push({ minute: min, text: s0 ? `${s0} — ${pick(CHANCE)}` : pick(CHANCE), type: 'chance' })
      }
    } else {
      // Chance / atmosphere
      const fwd3 = randomAttacker(englandSquad, ['ST', 'LW', 'RW', 'CAM', 'RM', 'LM'])
      const surname3 = fwd3 ? displaySurname(fwd3.name) : null
      const text = surname3 ? `${surname3} — ${pick(CHANCE)}` : pick(CHANCE)
      moments.push({ minute: min, text, type: 'chance' })
    }
  }

  // Sometimes open with a nostalgic scene-setter when the feed didn't surface
  // one — but not every match; a line a game wore thin fast.
  if (atmoCursor === 0 && atmoDeck.length > 0 && rand() < 0.4) {
    moments.push({ minute: 1 + Math.floor(rand() * 88), text: atmoDeck[0], type: 'info' })
  }

  // Sort by minute
  moments.sort((a, b) => a.minute - b.minute)

  // ── Knockout draw → extra time + penalty shootout ──────────────────────────
  let wentToPenalties = false
  let engPen: number | undefined
  let oppPen: number | undefined

  if (isKnockout && engGoals === oppGoals) {
    wentToPenalties = true

    moments.push({ minute: 120, text: pick(PENS_BUILD), type: 'info' })

    // Penalty shootout simulation — each kick is a moment
    const gk = englandSquad.find(p => p?.positions[0] === 'GK') as RatedPlayer | undefined
    const gkFactor   = gk   ? gk.ratingAtYear   / 90  : 0.80
    // The actual armband holder steadies the shootout; falls back to the
    // best-rated player when no captain was named.
    const captain    = (captainId
      ? englandSquad.find(p => p?.id === captainId)
      : undefined) ?? (englandSquad.filter(Boolean) as RatedPlayer[])
      .sort((a, b) => b.ratingAtYear - a.ratingAtYear)[0]
    const capFactor  = captain ? captain.ratingAtYear / 100 : 0.80

    // Takers step up in penalty-rating order — the derived blend of goal
    // threat per cap, shooting and the known-takers list.
    const rankedTakers = (englandSquad.filter(Boolean) as RatedPlayer[])
      .filter(p => p.positions[0] !== 'GK')
      .sort((a, b) => penaltyRating(b) - penaltyRating(a))
    const top5 = rankedTakers.slice(0, 5)
    const avgPen = top5.length > 0
      ? top5.reduce((s, p) => s + penaltyRating(p), 0) / top5.length
      : 70

    // Conversion driven by the takers' penalty ratings, the captain's calm
    // and the gaffer's preparation; the keeper makes opponents miss.
    const engConvert = Math.min(0.92,
      0.60 + (avgPen / 100) * 0.18 + capFactor * 0.04 + (manager?.penaltyBoost ?? 0))
    const oppConvert = 0.72 - gkFactor * 0.06

    // ── Honest shootout: kick by kick, best of five, then sudden death. ─────
    // The score, the commentary and the winner all come from the SAME kicks —
    // no more "England won 2-1 but it went to pens".
    let engPenGoals = 0
    let oppPenGoals = 0
    let minute = 121
    let round = 0

    const engKick = (taker: RatedPlayer | undefined): void => {
      const scored = rand() < engConvert
      if (scored) engPenGoals++
      const surname = taker ? displaySurname(taker.name) : 'England'
      moments.push({
        minute: minute++,
        text: `${surname} ${scored ? pick(PEN_ENG_SCORE) : pick(PEN_ENG_MISS)}`,
        type: 'penalty',
        team: 'england',
      })
    }
    const oppKick = (): void => {
      const scored = rand() < oppConvert
      if (scored) oppPenGoals++
      moments.push({
        minute: minute++,
        text: scored ? pick(PEN_OPP_SCORE) : `${opponent} — ${pick(PEN_OPP_SAVE)}`,
        type: 'penalty',
        team: 'opponent',
      })
    }

    // Best of five — stop early once one side can no longer be caught.
    while (round < 5) {
      const engRemaining = 5 - round - 1
      const oppRemaining = 5 - round
      engKick(top5[round % top5.length])
      if (engPenGoals > oppPenGoals + oppRemaining || oppPenGoals > engPenGoals + engRemaining) break
      oppKick()
      round++
      if (engPenGoals > oppPenGoals + (5 - round) || oppPenGoals > engPenGoals + (5 - round)) break
    }

    // Sudden death — pairs of kicks until someone blinks. A marathon (6+
    // extra rounds, vanishingly rare) is settled decisively by one forced
    // round so the shootout always ends.
    let sudden = 0
    while (engPenGoals === oppPenGoals) {
      const taker = rankedTakers[(5 + sudden) % Math.max(1, rankedTakers.length)]
      if (sudden >= 6) {
        const surname = taker ? displaySurname(taker.name) : 'England'
        if (rand() < 0.5 + (manager?.penaltyBoost ?? 0)) {
          engPenGoals++
          moments.push({ minute: minute++, text: `${surname} ${pick(PEN_ENG_SCORE)}`, type: 'penalty', team: 'england' })
          moments.push({ minute: minute++, text: `${opponent} — ${pick(PEN_OPP_SAVE)}`, type: 'penalty', team: 'opponent' })
        } else {
          oppPenGoals++
          moments.push({ minute: minute++, text: `${surname} ${pick(PEN_ENG_MISS)}`, type: 'penalty', team: 'england' })
          moments.push({ minute: minute++, text: pick(PEN_OPP_SCORE), type: 'penalty', team: 'opponent' })
        }
        break
      }
      engKick(taker)
      oppKick()
      sudden++
    }

    engPen = engPenGoals
    oppPen = oppPenGoals
  }

  return {
    home: 'England',
    away: opponent,
    homeGoals: engGoals,
    awayGoals: oppGoals,
    homePenalties: engPen,
    awayPenalties: oppPen,
    wentToPenalties,
    moments,
    // After a shootout the 120-minute score stays level — the pens decide it.
    englandWon: wentToPenalties ? (engPen ?? 0) > (oppPen ?? 0) : engGoals > oppGoals,
  }
}
