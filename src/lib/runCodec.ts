import { Formation, GameMode, RatedPlayer, TournamentResult, WorldCupData } from '@/types'
import { ENGLAND_PLAYERS } from '@/data/players'

// ─── Shareable run payload ────────────────────────────────────────────────────
// A finished tournament run is encoded into the URL itself (base64url JSON) so
// /run/[runId] and the OG image route can render a result with no database.
// The runId IS the persistence layer. Keep fields short — they ship in URLs.

export interface RunPayload {
  v: 1
  mode: GameMode
  formation: Formation
  year: number
  comp: 'WorldCup' | 'Euro'
  exit: string            // 'Winner' | 'Final' | 'SF' | 'QF' | 'R16' | 'R32' | 'Group'
  chem: number            // badge chemistry score
  ovr: number             // team overall
  hard: boolean           // Hard Mode run
  wonPens: number         // shootouts won during the run
  lostPens: number        // shootouts lost during the run
  xi: string[]            // player ids in formation slot order
  captain?: string        // player id
  manager?: string        // manager id
  bench?: string[]        // bench player ids
  groupPos?: number
}

function toB64url(s: string): string {
  const bytes = new TextEncoder().encode(s)
  let bin = ''
  bytes.forEach(b => { bin += String.fromCharCode(b) })
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function fromB64url(s: string): string {
  const b64 = s.replace(/-/g, '+').replace(/_/g, '/')
  const bin = atob(b64)
  const bytes = Uint8Array.from(bin, c => c.charCodeAt(0))
  return new TextDecoder().decode(bytes)
}

export function encodeRun(payload: RunPayload): string {
  return toB64url(JSON.stringify(payload))
}

export function decodeRun(runId: string): RunPayload | null {
  try {
    const parsed = JSON.parse(fromB64url(decodeURIComponent(runId))) as RunPayload
    if (parsed.v !== 1) return null
    if (!Array.isArray(parsed.xi) || parsed.xi.length === 0) return null
    if (typeof parsed.year !== 'number' || typeof parsed.exit !== 'string') return null
    return parsed
  } catch {
    return null
  }
}

export function playersFromIds(ids: string[]): (RatedPlayer | null)[] {
  return ids.map(id => {
    const p = ENGLAND_PLAYERS.find(pl => pl.id === id)
    if (!p) return null
    return { ...p, ratingAtYear: p.peakRating, trend: 'peak' as const, ageAtYear: p.peakYear - p.bornYear }
  })
}

// ─── Derived display helpers (shared by ResultScreen, /run page, OG card) ────

export function shootoutRecord(result: TournamentResult): { won: number; lost: number } {
  let won = 0, lost = 0
  for (const round of result.rounds) {
    for (const m of round.matches) {
      if ((m.home === 'England' || m.away === 'England') && m.wentToPenalties) {
        if (m.englandWon) won++
        else lost++
      }
    }
  }
  return { won, lost }
}

export function eraSpread(squad: (RatedPlayer | null)[]): string {
  const years = squad.filter((p): p is RatedPlayer => p !== null).map(p => p.peakYear)
  if (years.length === 0) return '—'
  const min = Math.min(...years)
  const max = Math.max(...years)
  return min === max ? `${min}` : `${min}–${max}`
}

// The result line that headlines the card, e.g. "WINNERS — Euro 2024".
export function resultLine(run: Pick<RunPayload, 'exit' | 'year' | 'comp' | 'wonPens' | 'lostPens'>): string {
  const compName = run.comp === 'Euro' ? `Euro ${run.year}` : `World Cup ${run.year}`
  switch (run.exit) {
    case 'Winner': return `WINNERS — ${compName}`
    case 'Final':  return `RUNNERS-UP — ${compName}`
    case 'SF':     return `SEMI-FINAL — ${compName}`
    case 'QF':     return `QUARTER-FINAL — ${compName}`
    case 'R16':    return `ROUND OF 16 — ${compName}`
    case 'R32':    return `ROUND OF 32 — ${compName}`
    default:       return `GROUP STAGE — ${compName}`
  }
}

// The short, tweet-ready sting underneath the result.
export function tweetLine(run: Pick<RunPayload, 'exit' | 'comp' | 'wonPens' | 'lostPens'>): string {
  if (run.exit === 'Winner') {
    if (run.wonPens > 0) return 'Won it on pens. You read that right.'
    return run.comp === 'Euro' ? "They've only gone and done it." : 'It finally came home.'
  }
  if (run.lostPens > 0) return 'Out on pens. Again.'
  switch (run.exit) {
    case 'Final': return 'So close you could touch it.'
    case 'SF':    return 'Semi-final heartbreak. Tradition honoured.'
    case 'QF':    return 'Quarter-finals. The inquest begins.'
    case 'R16':   return 'An early flight home.'
    case 'R32':   return "Out before the wall chart was filled in."
    default:      return 'Out in the groups. The pub falls silent.'
  }
}
