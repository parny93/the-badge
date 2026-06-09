import { MatchMoment, MatchResult, RatedPlayer } from '@/types'
import { Formation } from '@/types'
import { calculateTeamStrength } from './teamStrength'
import { getTeamRating } from '@/data/teamRatings'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function poissonSample(lambda: number): number {
  const L = Math.exp(-Math.max(0.1, lambda))
  let k = 0, p = 1
  do { k++; p *= Math.random() } while (p > L)
  return k - 1
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function spread(n: number, max = 93): number[] {
  const mins: number[] = []
  let cursor = 3 + Math.floor(Math.random() * 12)
  for (let i = 0; i < n; i++) {
    cursor = Math.min(max, cursor + 6 + Math.floor(Math.random() * 18))
    mins.push(cursor)
  }
  return mins
}

// ─── Moment banks ─────────────────────────────────────────────────────────────

const MISS = [
  'blazed it over from six yards — he won\'t believe it',
  'put it wide when it seemed easier to score',
  'the finish just wasn\'t there — keeper could have walked it',
  'scuffed it straight at the keeper — agony',
  'dragged it wide at the far post',
  'smashed it over from the penalty spot — the crowd gasps',
]

const POST = [
  'thundered it off the crossbar — the woodwork saves them',
  'rattled the post and it stays out — inches away',
  'struck the upright — agonisingly close',
  'the bar came to their rescue — that was going in',
  'cannoned off the post and out — sheer bad luck',
]

const SAVE = [
  'the goalkeeper made an absolutely stunning save',
  'tipped it onto the bar with one hand — world class',
  'the keeper read it perfectly and smothered it',
  'full stretch — fingertips keep it out',
  'the keeper flew across goal — nothing was getting past him tonight',
  'a point-blank stop — somehow he got a hand to it',
]

const CHANCE = [
  'the ball fell kindly but the first touch let them down',
  'a glancing header went just wide',
  'burst in behind but couldn\'t keep his feet',
  'whipped the cross in but no one could reach it',
  'the through ball was perfect but the offside flag cuts it off',
]

const CARD_ENG = [
  'reckless challenge — the referee has no choice. Red card. TEN MEN.',
  'yellow card for dissent — he\'ll need to calm down',
  'a yellow for a cynical foul — booked',
  'he\'s been shown red — England must dig deep',
]

const CARD_OPP = [
  'the opposition reduced to ten men — advantage England',
  'red card for the opponent — England have a man advantage now',
  'a reckless lunge — the referee reaches for red',
  'yellow card for simulation — the crowd boo',
]

const VAR = [
  'VAR is checking... the stadium falls silent',
  'the referee is being called to the monitor by VAR',
  'a long delay while VAR reviews the incident',
]

const PENS_BUILD = [
  'the referee blows — it\'s going to penalties',
  'extra time couldn\'t separate them — the shootout beckons',
  'one hundred and twenty minutes and still level — penalties decide it',
]

const PEN_ENG_SCORE = [
  'steps up and drives it into the bottom corner — SCORED',
  'sends the keeper the wrong way — SCORED',
  'pauses, picks his spot — top corner. SCORED.',
  'cool as you like, straight down the middle — SCORED',
]

const PEN_ENG_MISS = [
  'hits the post — the nation groans',
  'the keeper gets down low and saves it — disaster',
  'blazes it over the bar — sheer horror',
  'the keeper dives the right way — saved',
]

const PEN_OPP_SCORE = [
  'the opponent converts — level in the shootout',
  'they equalise from the spot',
  'no mistake — scores their penalty',
]

const PEN_OPP_SAVE = [
  'the keeper dives to his left and SAVES IT — pandemonium',
  'pushed onto the post by the keeper — England advance',
  'the keeper guesses right — SAVED — England have the advantage',
]

// ─── Player moment text ───────────────────────────────────────────────────────

function englandGoalMoment(squad: (RatedPlayer | null)[]): string {
  const attackers = (squad.filter(Boolean) as RatedPlayer[])
    .filter(p => !['GK', 'CB', 'RB', 'LB', 'CDM'].includes(p.positions[0]))
  const player = attackers.length > 0 ? pick(attackers) : (squad.filter(Boolean) as RatedPlayer[])[0]
  if (!player) return 'England score!'
  const moment = player.moments?.length ? pick(player.moments) : `${player.name.split(' ').at(-1)} gets the goal`
  return moment
}

function englandSaveMoment(squad: (RatedPlayer | null)[]): string {
  const gk = (squad.filter(Boolean) as RatedPlayer[]).find(p => p.positions[0] === 'GK')
  const base = pick(SAVE)
  return gk ? `${gk.name.split(' ').at(-1)} — ${base}` : base
}

// ─── Core match simulation ────────────────────────────────────────────────────

export interface SimMatchInput {
  englandSquad: (RatedPlayer | null)[]
  englandFormation: Formation
  opponent: string
  wcYear: number
  isKnockout: boolean
}

export function simulateMatch(input: SimMatchInput): MatchResult {
  const { englandSquad, englandFormation, opponent, wcYear, isKnockout } = input

  const engStrength = calculateTeamStrength(englandSquad, englandFormation)
  const oppRating   = getTeamRating(opponent, wcYear)

  const oppStrength = {
    attack:  Math.round(oppRating * (0.85 + Math.random() * 0.30)),
    defense: Math.round(oppRating * (0.85 + Math.random() * 0.30)),
  }

  const engLambda = Math.max(0.2, 0.9 + (engStrength.attack - oppStrength.defense) * 0.025)
  const oppLambda = Math.max(0.2, 0.9 + (oppStrength.attack - engStrength.defense) * 0.025)

  let engGoals = poissonSample(engLambda)
  let oppGoals = poissonSample(oppLambda)

  // ── Build moment timeline ──────────────────────────────────────────────────
  const moments: MatchMoment[] = []

  // Allocate minute slots for the total event count (5-9 moments)
  const totalMoments = 5 + Math.floor(Math.random() * 5)
  const minutes = spread(totalMoments)

  // Reserve slots for actual goals
  const engGoalSlots: number[] = []
  const oppGoalSlots: number[] = []

  for (let i = 0; i < engGoals; i++) {
    engGoalSlots.push(8 + Math.floor(Math.random() * 80))
  }
  for (let i = 0; i < oppGoals; i++) {
    oppGoalSlots.push(8 + Math.floor(Math.random() * 80))
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
  for (const min of oppGoalSlots) {
    moments.push({
      minute: min,
      text: `${opponent} find the net — England need a response`,
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

    const roll = Math.random()

    if (roll < 0.20) {
      // Big save
      moments.push({ minute: min, text: englandSaveMoment(englandSquad), type: 'save' })
    } else if (roll < 0.38) {
      // Miss
      const fwd = (englandSquad.filter(Boolean) as RatedPlayer[])
        .find(p => ['ST', 'LW', 'RW', 'CAM'].includes(p.positions[0]))
      const surname = fwd?.name.split(' ').at(-1) ?? 'England'
      moments.push({ minute: min, text: `${surname} ${pick(MISS)}`, type: 'miss' })
    } else if (roll < 0.52) {
      // Hit the post / bar
      const fwd2 = (englandSquad.filter(Boolean) as RatedPlayer[])
        .find(p => ['ST', 'LW', 'RW'].includes(p.positions[0]))
      const surname2 = fwd2?.name.split(' ').at(-1) ?? 'England'
      moments.push({ minute: min, text: `${surname2} ${pick(POST)}`, type: 'post' })
    } else if (roll < 0.62) {
      // Red or yellow card
      const cardRoll = Math.random()
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
      // VAR check
      moments.push({ minute: min, text: pick(VAR), type: 'info' })
    } else {
      // Chance / atmosphere
      const fwd3 = (englandSquad.filter(Boolean) as RatedPlayer[])
        .find(p => ['ST', 'LW', 'RW', 'CAM'].includes(p.positions[0]))
      const surname3 = fwd3?.name.split(' ').at(-1)
      const text = surname3 ? `${surname3} — ${pick(CHANCE)}` : pick(CHANCE)
      moments.push({ minute: min, text, type: 'chance' })
    }
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
    const captain    = (englandSquad.filter(Boolean) as RatedPlayer[])
      .sort((a, b) => b.ratingAtYear - a.ratingAtYear)[0]
    const capFactor  = captain ? captain.ratingAtYear / 100 : 0.80
    const penWinProb = 0.38 + gkFactor * 0.12 + capFactor * 0.10

    const engWinsPens = Math.random() < penWinProb

    // Simulate 5 kicks each, sudden death if tied
    const engScored: boolean[] = []
    const oppScored: boolean[] = []

    // England takers have a ~76% conversion rate; boosted by captain quality
    const engConvert = 0.72 + capFactor * 0.08
    // Opponent conversion rate similar but boosted/penalised by GK
    const oppConvert = 0.72 - gkFactor * 0.06

    // Force the final outcome but make the kicks dramatic
    for (let k = 0; k < 5; k++) {
      const eScored = k < 4 ? Math.random() < engConvert : engWinsPens ? true : Math.random() < engConvert
      const oScored = k < 4 ? Math.random() < oppConvert : !engWinsPens ? true : Math.random() < oppConvert
      engScored.push(eScored)
      oppScored.push(oScored)
    }

    // Generate kick moments
    const takers = (englandSquad.filter(Boolean) as RatedPlayer[])
      .filter(p => p.positions[0] !== 'GK')
      .slice(0, 5)

    for (let k = 0; k < 5; k++) {
      const taker = takers[k]
      const surname = taker?.name.split(' ').at(-1) ?? 'England'
      const eText = engScored[k]
        ? `${surname} ${pick(PEN_ENG_SCORE)}`
        : `${surname} ${pick(PEN_ENG_MISS)}`
      moments.push({ minute: 121 + k * 2, text: eText, type: 'penalty', team: 'england' })

      const oText = oppScored[k] ? pick(PEN_OPP_SCORE) : `${opponent} — ${pick(PEN_OPP_SAVE)}`
      moments.push({ minute: 122 + k * 2, text: oText, type: 'penalty', team: 'opponent' })
    }

    // Final scores
    const engPenGoals = engScored.filter(Boolean).length
    const oppPenGoals = oppScored.filter(Boolean).length
    const diff = engWinsPens ? Math.max(1, engPenGoals - oppPenGoals) : Math.max(1, oppPenGoals - engPenGoals)

    if (engWinsPens) {
      engPen = Math.min(5, 3 + Math.floor(Math.random() * 2))
      oppPen = engPen - diff
      engGoals += 1
    } else {
      oppPen = Math.min(5, 3 + Math.floor(Math.random() * 2))
      engPen  = oppPen - diff
      oppGoals += 1
    }
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
    englandWon: engGoals > oppGoals,
  }
}
