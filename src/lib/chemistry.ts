import {
  Player, RatedPlayer, Position, PlayerRole, FormationSlot, ChemistryReport, ChemistryNote,
} from '@/types'

// ─── Role derivation ──────────────────────────────────────────────────────────
// We derive a footballing role from a player's primary position + attributes so
// we don't have to hand-tag every player. This drives the balance analysis.

export function deriveRole(player: Player): PlayerRole {
  const pos = player.positions[0]
  const a = player.peakAttributes

  switch (pos) {
    case 'GK': return 'GK'
    case 'RB':
    case 'LB': return 'FB'
    case 'CB': return 'CB'
    case 'CDM': return 'DM'
    case 'CM':
      if (a.defending >= 80) return 'DM'          // disciplined holder (Rice, Hargreaves)
      if (a.passing >= 87) return 'DLP'           // deep playmaker (Carrick, Scholes)
      return 'B2B'                                 // runner (Lampard, Gerrard, Robson)
    case 'CAM': return 'AP'
    case 'RM':
    case 'LM':
    case 'RW':
    case 'LW': return 'WIDE'
    case 'ST':
      if (a.physical >= 85) return 'TARGET'        // Shearer, Hurst, Heskey
      if (a.pace >= 88) return 'PACE'              // Owen, Rashford
      return 'POACHER'                             // Lineker, Greaves, Kane-ish
    default: return 'B2B'
  }
}

// ─── Position familiarity ─────────────────────────────────────────────────────
// Coordinate model: each position sits at (x,y) on the pitch. Familiarity falls
// off with distance from a player's natural position. Listed positions are full.

const POS_COORDS: Record<Position, [number, number]> = {
  GK:  [50, 5],
  CB:  [50, 25], RB: [85, 28], LB: [15, 28],
  CDM: [50, 42], CM: [50, 55], CAM: [50, 68],
  RM:  [85, 55], LM: [15, 55],
  RW:  [85, 72], LW: [15, 72],
  ST:  [50, 85],
}

export function familiarity(player: Player, slot: Position): number {
  // Listed as a natural position
  if (player.positions.includes(slot)) {
    return player.positions[0] === slot ? 1.0 : 0.95
  }
  // GK is a hard boundary — never play an outfielder in goal (or vice versa)
  const naturalIsGK = player.positions[0] === 'GK'
  if (naturalIsGK !== (slot === 'GK')) return 0.4

  const [ax, ay] = POS_COORDS[player.positions[0]]
  const [bx, by] = POS_COORDS[slot]
  const dist = Math.hypot(ax - bx, ay - by)
  // dist ~0 → 1.0, dist ~70 (opposite flank / line) → ~0.68
  return Math.max(0.65, Math.min(0.95, 1 - dist / 200))
}

// ─── Squad balance analysis ───────────────────────────────────────────────────

interface SlottedPlayer {
  player: RatedPlayer
  slot: FormationSlot
  role: PlayerRole
  fam: number
}

export function analyzeChemistry(
  squad: (RatedPlayer | null)[],
  slots: FormationSlot[]
): ChemistryReport {
  const filled: SlottedPlayer[] = []
  squad.forEach((p, i) => {
    if (p) filled.push({
      player: p,
      slot: slots[i],
      role: deriveRole(p),
      fam: familiarity(p, slots[i].position),
    })
  })

  const notes: ChemistryNote[] = []
  let score = 100
  let attackMod = 0
  let defenseMod = 0

  // ── 1. Out-of-position players ──────────────────────────────────────────
  for (const sp of filled) {
    if (sp.fam < 0.9) {
      const severity = (1 - sp.fam)
      const surname = sp.player.name.split(' ').pop()
      notes.push({
        type: 'bad',
        text: `${surname} is out of position at ${sp.slot.label} — not his game`,
      })
      score -= Math.round(severity * 40)
      // Out-of-position hurts the relevant phase
      const grp = sp.slot.position
      if (['RW', 'LW', 'ST'].includes(grp)) attackMod -= Math.round(severity * 22)
      else if (['CB', 'RB', 'LB', 'CDM'].includes(grp)) defenseMod -= Math.round(severity * 22)
    }
  }

  // ── 2. Midfield balance — the Lampard–Gerrard problem ────────────────────
  const centralMids = filled.filter(sp =>
    ['CDM', 'CM', 'CAM'].includes(sp.slot.position)
  )
  if (centralMids.length >= 3) {
    // A true anchor screens the back four. A deep playmaker controls but does NOT
    // do that defensive job — which is exactly why Scholes behind Lampard & Gerrard
    // still left England exposed.
    // Anchor = a player who actually does the destroyer's job (by role), not just
    // whoever happens to occupy the CDM slot. A playmaker parked at CDM is not an anchor.
    const anchors = centralMids.filter(sp => sp.role === 'DM')
    const deepCreators = centralMids.filter(sp => sp.role === 'DLP')
    const runners = centralMids.filter(sp => sp.role === 'B2B' || sp.role === 'AP')

    if (anchors.length === 0 && runners.length >= 2) {
      if (deepCreators.length === 0) {
        notes.push({
          type: 'bad',
          text: 'No holding midfielder — you\'ll be overrun in transition. (Ask Sven about Lampard & Gerrard.)',
        })
        score -= 30
        defenseMod -= 11
      } else {
        notes.push({
          type: 'bad',
          text: 'Loads of quality, but no destroyer to protect the back four — it never worked for Sven either',
        })
        score -= 22
        defenseMod -= 8
      }
    } else if (anchors.length >= 1) {
      const distinctRoles = new Set(centralMids.map(sp => sp.role)).size
      if (distinctRoles >= 3) {
        notes.push({ type: 'good', text: 'Balanced midfield — anchor, creator and runner all covered' })
        score += 6
        attackMod += 3
        defenseMod += 3
      } else {
        notes.push({ type: 'good', text: 'Midfield has a solid base to build from' })
        score += 3
      }
    }
  }

  // ── 3. Pace at the back ──────────────────────────────────────────────────
  const cbs = filled.filter(sp => sp.slot.position === 'CB')
  if (cbs.length >= 2) {
    const slow = cbs.filter(sp => sp.player.peakAttributes.pace < 64)
    if (slow.length === cbs.length) {
      notes.push({ type: 'bad', text: 'Slow centre-back pairing — vulnerable to pace in behind' })
      score -= 6
      defenseMod -= 5
    } else if (cbs.every(sp => sp.player.peakAttributes.pace >= 75)) {
      notes.push({ type: 'good', text: 'Quick, mobile centre-backs — can defend a high line' })
      score += 3
      defenseMod += 3
    }
  }

  // ── 4. Attacking outlet ──────────────────────────────────────────────────
  const forwards = filled.filter(sp => ['ST', 'RW', 'LW'].includes(sp.slot.position))
  const hasTarget = forwards.some(sp => sp.role === 'TARGET')
  const hasPace = forwards.some(sp => sp.role === 'PACE' || sp.player.peakAttributes.pace >= 85)
  if (forwards.length > 0 && hasTarget && hasPace) {
    notes.push({ type: 'good', text: 'Strike force has both a focal point and pace in behind' })
    score += 4
    attackMod += 3
  } else if (forwards.length >= 2 && !hasPace) {
    notes.push({ type: 'info', text: 'No real pace up top — you\'ll need to break teams down patiently' })
  }

  // ── 5. Goalkeeper present? ────────────────────────────────────────────────
  const gk = filled.find(sp => sp.slot.position === 'GK')
  if (gk && (gk.player.peakAttributes.gk ?? 0) >= 90) {
    notes.push({ type: 'good', text: `${gk.player.name.split(' ').pop()} is a world-class keeper — pens hold no fear` })
    score += 2
  }

  score = Math.max(35, Math.min(100, Math.round(score)))

  if (notes.length === 0) {
    notes.push({ type: 'info', text: 'A sensible, well-balanced selection' })
  }

  return { score, notes, attackMod, defenseMod }
}

export const CHEM_LABEL = (score: number): string =>
  score >= 90 ? 'Perfect Understanding' :
  score >= 80 ? 'Strong Chemistry' :
  score >= 68 ? 'Workable' :
  score >= 55 ? 'Disjointed' :
  'No Chemistry'
