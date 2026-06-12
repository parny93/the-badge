import { PlayerAttributes, Position, RatedPlayer } from '@/types'
import { familiarity } from './chemistry'

// ─── Effective rating in a position ───────────────────────────────────────────
// A player's pitch rating depends on where you play him. At his natural (or a
// tagged) position he shows his normal rating; out of position the number is
// derived from how his attributes suit the role — so Phil Foden at CDM reads
// low (no defending), even though he's an 89 at CAM.

// FIFA-style per-position attribute weights (sum to 1 each).
const POS_WEIGHTS: Record<Position, Partial<Record<keyof PlayerAttributes, number>>> = {
  GK:  { gk: 1 },
  CB:  { defending: 0.55, physical: 0.30, pace: 0.15 },
  RB:  { defending: 0.38, pace: 0.27, physical: 0.18, passing: 0.17 },
  LB:  { defending: 0.38, pace: 0.27, physical: 0.18, passing: 0.17 },
  CDM: { defending: 0.45, physical: 0.30, passing: 0.25 },
  CM:  { passing: 0.35, dribbling: 0.22, defending: 0.25, physical: 0.18 },
  CAM: { passing: 0.40, dribbling: 0.30, shooting: 0.30 },
  RM:  { pace: 0.30, dribbling: 0.30, passing: 0.25, shooting: 0.15 },
  LM:  { pace: 0.30, dribbling: 0.30, passing: 0.25, shooting: 0.15 },
  RW:  { pace: 0.30, dribbling: 0.35, shooting: 0.25, passing: 0.10 },
  LW:  { pace: 0.30, dribbling: 0.35, shooting: 0.25, passing: 0.10 },
  ST:  { shooting: 0.45, pace: 0.25, physical: 0.15, dribbling: 0.15 },
}

function attributeScore(attrs: PlayerAttributes, pos: Position): number {
  const w = POS_WEIGHTS[pos]
  let score = 0
  for (const [key, weight] of Object.entries(w)) {
    score += (attrs[key as keyof PlayerAttributes] ?? 0) * (weight as number)
  }
  return score
}

// The rating to SHOW for a player lined up at a given slot position.
export function ratingInPosition(player: RatedPlayer, pos: Position): number {
  // At his own (or a tagged secondary) position he plays to his rating.
  if (player.positions.includes(pos)) return player.ratingAtYear

  // Out of position: rate him on how his attributes serve the role, scaled to
  // his era form, with a small familiarity nudge for nearby positions.
  const ratio = player.ratingAtYear / Math.max(player.peakRating, 1)
  const fam = familiarity(player, pos)            // 0.4 (GK mismatch) … 0.95
  const raw = attributeScore(player.peakAttributes, pos) * ratio
  return Math.max(40, Math.round(raw * (0.85 + 0.15 * fam)))
}
