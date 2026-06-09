import { MatchMoment, MatchResult, RatedPlayer } from '@/types'
import { Formation } from '@/types'
import { calculateTeamStrength } from './teamStrength'
import { getTeamRating } from '@/data/teamRatings'

// ─── Poisson sampling ─────────────────────────────────────────────────────────

function poissonSample(lambda: number): number {
  const L = Math.exp(-Math.max(0.1, lambda))
  let k = 0
  let p = 1
  do { k++; p *= Math.random() } while (p > L)
  return k - 1
}

// ─── Generic moment banks ────────────────────────────────────────────────────

const MISS_MOMENTS = [
  'blazed it over from close range',
  'put it wide when it seemed easier to score',
  'somehow hit the post from six yards',
  'the finish wasn\'t there today',
  'scuffed it straight at the keeper',
]

const SAVE_MOMENTS = [
  'the goalkeeper made a stunning save',
  'denied! An incredible stop kept them in it',
  'the keeper read it perfectly',
  'pushed it onto the bar and over',
]

const CHANCE_MOMENTS = [
  'a half-chance that came to nothing',
  'appealed for a penalty but the referee waved it away',
  'the ball fell kindly but the control let them down',
]

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function pickPlayerMoment(squad: (RatedPlayer | null)[], type: 'goal' | 'chance'): string {
  const eligible = squad.filter(Boolean) as RatedPlayer[]
  if (eligible.length === 0) return 'England scored'

  // Weight by rating for goal moments, any player for chance moments
  const pool = type === 'goal'
    ? eligible.filter(p => !['GK', 'CB', 'RB', 'LB'].includes(p.positions[0]))
    : eligible

  const player = pool[Math.floor(Math.random() * pool.length)] ?? eligible[0]
  const momentPool = player.moments

  if (momentPool && momentPool.length > 0) {
    return randomFrom(momentPool)
  }

  return type === 'goal'
    ? `${player.name} with the finish`
    : `${player.name} nearly got on the end of it`
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
  const oppRating = getTeamRating(opponent, wcYear)

  // Convert opponent rating to the same scale as our team strength
  const oppStrength = {
    overall: oppRating,
    attack: Math.round(oppRating * (0.85 + Math.random() * 0.3)),
    defense: Math.round(oppRating * (0.85 + Math.random() * 0.3)),
  }

  const engAttackLambda = Math.max(0.2,
    0.9 + (engStrength.attack - oppStrength.defense) * 0.025
  )
  const oppAttackLambda = Math.max(0.2,
    0.9 + (oppStrength.attack - engStrength.defense) * 0.025
  )

  let engGoals = poissonSample(engAttackLambda)
  let oppGoals = poissonSample(oppAttackLambda)

  const moments: MatchMoment[] = []
  let minute = 1

  // Generate narrative moments
  const numMoments = 2 + Math.floor(Math.random() * 3)

  for (let i = 0; i < numMoments; i++) {
    minute = Math.min(90, minute + 10 + Math.floor(Math.random() * 25))

    const roll = Math.random()

    if (roll < 0.35) {
      // England positive moment
      moments.push({
        minute,
        text: pickPlayerMoment(englandSquad, 'goal'),
        type: 'goal',
      })
    } else if (roll < 0.55) {
      // England miss
      const striker = (englandSquad.filter(Boolean) as RatedPlayer[])
        .find(p => ['ST', 'LW', 'RW'].includes(p.positions[0]))
      const missText = striker
        ? `${striker.name} ${randomFrom(MISS_MOMENTS)}`
        : `England ${randomFrom(MISS_MOMENTS)}`
      moments.push({ minute, text: missText, type: 'miss' })
    } else if (roll < 0.70) {
      // Save
      moments.push({ minute, text: randomFrom(SAVE_MOMENTS), type: 'save' })
    } else {
      // Chance
      moments.push({
        minute,
        text: pickPlayerMoment(englandSquad, 'chance'),
        type: 'chance',
      })
    }
  }

  // Inject a goal moment matching the scoreline
  if (engGoals > 0) {
    const goalMoment = pickPlayerMoment(englandSquad, 'goal')
    moments.splice(1, 0, {
      minute: 20 + Math.floor(Math.random() * 50),
      text: goalMoment,
      type: 'goal',
    })
  }
  if (engGoals === 0 && oppGoals > 0) {
    moments.push({
      minute: 30 + Math.floor(Math.random() * 40),
      text: `${opponent} took the lead — England need a response`,
      type: 'info',
    })
  }

  // Sort by minute
  moments.sort((a, b) => a.minute - b.minute)

  // Knockout draw → extra time + penalties
  let wentToPenalties = false
  let engPen: number | undefined
  let oppPen: number | undefined

  if (isKnockout && engGoals === oppGoals) {
    wentToPenalties = true

    // GK quality affects penalty save probability
    const gk = englandSquad.find(p => p?.positions[0] === 'GK') as RatedPlayer | undefined
    const gkFactor = gk ? gk.ratingAtYear / 90 : 0.8

    // England win on pens with probability based on GK + captain rating
    const captain = (englandSquad.filter(Boolean) as RatedPlayer[])
      .sort((a, b) => b.ratingAtYear - a.ratingAtYear)[0]
    const captainFactor = captain ? captain.ratingAtYear / 100 : 0.8

    const penWinProb = 0.38 + gkFactor * 0.12 + captainFactor * 0.10  // ~50-60%

    if (Math.random() < penWinProb) {
      engGoals += 1  // symbolic — penalties decided as side effect
      engPen = 4 + Math.floor(Math.random() * 2)
      oppPen = engPen - 1
    } else {
      oppGoals += 1
      oppPen = 4 + Math.floor(Math.random() * 2)
      engPen = oppPen - 1
    }

    moments.push({
      minute: 120,
      text: engGoals > oppGoals
        ? `England WIN on penalties! ${engPen}–${oppPen}. The nation erupts.`
        : `England LOSE on penalties. ${engPen}–${oppPen}. It never gets easier.`,
      type: 'info',
    })
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
