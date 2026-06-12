import { DifficultyLevel, RatedPlayer } from '@/types'
import { rand } from './rng'

// ─── Draft wheel weighting ───────────────────────────────────────────────────
// The wheel is not uniform. Most cards should be good-but-not-elite, with
// legends rare and the fringe "jokers" an occasional gut-punch — close enough
// to a great team to keep you spinning, short enough to share the pain.
//
// Tiers by peak rating (pool currently ~33 elite / ~80 solid / ~116 joker):
//   elite  ≥ 88 — Shearer, Scholes, Moore, Kane…
//   solid  82–87 — proper internationals
//   joker  < 82 — the Wayne Bridge / Phil Neville stratum

export type DraftTier = 'elite' | 'solid' | 'joker'

export function draftTier(p: RatedPlayer): DraftTier {
  if (p.peakRating >= 88) return 'elite'
  if (p.peakRating >= 82) return 'solid'
  return 'joker'
}

// Share of CARDS each tier gets (normalised by tier population, so flooding
// the pool with fringe players never floods the wheel). Tuned so a typical
// run lands 1–2 elite names, a good core, and a couple of jokers.
export const TIER_SHARES: Record<DifficultyLevel, Record<DraftTier, number>> = {
  easy:   { elite: 7, solid: 73, joker: 20 },
  normal: { elite: 5, solid: 71, joker: 24 },
  hard:   { elite: 4, solid: 67, joker: 29 },
}

// ── Special runs ──────────────────────────────────────────────────────────────
// Decided silently on the first spin of a draft; never announced.
//
// SILVER (~1 in 12): the wheel runs warm — 2–3 legends and a strong core, a
// genuinely competitive side that can win a tournament but will still have to
// earn it against peak opposition.
//
// GOLDEN (~1 in 100): the truly viral one. Legends nearly every spin; the
// full superstar XI is on. When it happens, that's the screenshot.
export type RunState = 'base' | 'silver' | 'golden'

export const GOLDEN_RUN_CHANCE = 1 / 100
export const SILVER_RUN_CHANCE = 1 / 12

export function rollRunState(roll: number): RunState {
  if (roll < GOLDEN_RUN_CHANCE) return 'golden'
  if (roll < GOLDEN_RUN_CHANCE + SILVER_RUN_CHANCE) return 'silver'
  return 'base'
}

export const SILVER_SHARES: Record<DraftTier, number> = {
  elite: 13,
  solid: 82,
  joker: 5,
}

export const GOLDEN_SHARES: Record<DraftTier, number> = {
  elite: 60,
  solid: 36,
  joker: 4,
}

// Weighted sample WITHOUT replacement. Per-player weight = tier share divided
// by that tier's population in the current pool, so the configured shares hold
// regardless of how many players each tier contains. Uses the seeded rng so
// Daily Challenge draws stay identical for everyone.
export function weightedDraw(
  pool: RatedPlayer[],
  n: number,
  shares: Record<DraftTier, number>
): RatedPlayer[] {
  const count: Record<DraftTier, number> = { elite: 0, solid: 0, joker: 0 }
  for (const p of pool) count[draftTier(p)]++

  const cand = [...pool]
  const out: RatedPlayer[] = []
  while (out.length < n && cand.length > 0) {
    const weights = cand.map(p => shares[draftTier(p)] / Math.max(1, count[draftTier(p)]))
    const total = weights.reduce((s, w) => s + w, 0)
    let roll = rand() * total
    let idx = cand.length - 1
    for (let i = 0; i < cand.length; i++) {
      roll -= weights[i]
      if (roll <= 0) { idx = i; break }
    }
    out.push(cand[idx])
    cand.splice(idx, 1)
  }
  return out
}
