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
// the pool with fringe players never floods the wheel).
export const TIER_SHARES: Record<DifficultyLevel, Record<DraftTier, number>> = {
  easy:   { elite: 18, solid: 70, joker: 12 },
  normal: { elite: 13, solid: 69, joker: 18 },
  hard:   { elite: 10, solid: 66, joker: 24 },
}

// ── The golden run ────────────────────────────────────────────────────────────
// Roughly 1 in 17 drafts, the wheel quietly runs hot for the whole draft:
// legends keep coming and a genuine superstar XI is on. Never announced —
// players just notice, screenshot it, and don't quite believe it.
export const GOLDEN_RUN_CHANCE = 1 / 17

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
