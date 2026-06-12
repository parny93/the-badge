import { MatchResult, RatedPlayer } from '@/types'
import { displaySurname } from './names'
import { rand } from './rng'

// ─── Injuries & suspensions ───────────────────────────────────────────────────
// Rare enough to feel like cruel luck, not an injury simulator. Roughly one
// fitness scare every ~14 matches and a red card every ~40.

export const INJURY_CHANCE = 0.07
export const RED_CARD_CHANCE = 0.025

export interface AvailabilityEvent {
  playerId: string
  name: string
  type: 'injury' | 'red'
  minute: number
  games: number          // matches the player will MISS
  text: string
}

const INJURY_KINDS = [
  'pulls up clutching a hamstring',
  'limps off after a heavy challenge',
  'rolls an ankle and cannot continue',
  'feels a groin strain and signals to the bench',
  'lands awkwardly and the physio shakes his head',
]

function missText(games: number): string {
  return games === 1 ? "He's out of the next match." : `He's out of the next ${games} matches.`
}

export function rollAvailabilityEvents(squad: (RatedPlayer | null)[]): AvailabilityEvent[] {
  const starters = squad.filter(Boolean) as RatedPlayer[]
  if (starters.length === 0) return []
  const events: AvailabilityEvent[] = []

  if (rand() < INJURY_CHANCE) {
    const p = starters[Math.floor(rand() * starters.length)]
    const sev = rand()
    const games = sev < 0.5 ? 1 : sev < 0.85 ? 2 : 3
    const minute = 10 + Math.floor(rand() * 75)
    const kind = INJURY_KINDS[Math.floor(rand() * INJURY_KINDS.length)]
    events.push({
      playerId: p.id,
      name: p.name,
      type: 'injury',
      minute,
      games,
      text: `${displaySurname(p.name)} ${kind} (${minute}'). ${missText(games)}`,
    })
  }

  if (rand() < RED_CARD_CHANCE) {
    const candidates = starters.filter(p => !events.some(e => e.playerId === p.id))
    if (candidates.length > 0) {
      const p = candidates[Math.floor(rand() * candidates.length)]
      const violent = rand() < 0.25
      const games = violent ? 2 : 1
      const minute = 20 + Math.floor(rand() * 68)
      events.push({
        playerId: p.id,
        name: p.name,
        type: 'red',
        minute,
        games,
        text: violent
          ? `${displaySurname(p.name)} sees RED for a dreadful lunge (${minute}') — a two-match ban.`
          : `${displaySurname(p.name)} is shown a second yellow (${minute}') — an early bath and a one-match suspension.`,
      })
    }
  }

  return events
}

// Weave the events into the match feed at their minute.
export function injectEventMoments(match: MatchResult, events: AvailabilityEvent[]): void {
  for (const e of events) {
    match.moments.push({
      minute: e.minute,
      text: e.text,
      type: e.type === 'red' ? 'card' : 'info',
      team: 'england',
    })
  }
  match.moments.sort((a, b) => a.minute - b.minute)
}
