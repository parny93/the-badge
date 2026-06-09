import {
  Player, Position, FormationSlot, ChemistryReport, ChemistryNote,
  ChemistryStyle, PlayerChemEntry, RatedPlayer,
} from '@/types'

// ─── Position coordinates (kept for familiarity() used by teamStrength.ts) ──

export const POS_COORDS: Record<Position, [number, number]> = {
  GK:  [50, 5],
  CB:  [50, 25], RB: [85, 28], LB: [15, 28],
  CDM: [50, 42], CM: [50, 55], CAM: [50, 68],
  RM:  [85, 55], LM: [15, 55],
  RW:  [85, 72], LW: [15, 72],
  ST:  [50, 85],
}

// familiarity() is still used by teamStrength.ts for phase contribution scaling
export function familiarity(player: Player, slot: Position): number {
  if (player.positions.includes(slot)) {
    return player.positions[0] === slot ? 1.0 : 0.95
  }
  const naturalIsGK = player.positions[0] === 'GK'
  if (naturalIsGK !== (slot === 'GK')) return 0.4
  const [ax, ay] = POS_COORDS[player.positions[0]]
  const [bx, by] = POS_COORDS[slot]
  const dist = Math.hypot(ax - bx, ay - by)
  return Math.max(0.65, Math.min(0.95, 1 - dist / 200))
}

// ─── FUT-style chemistry style derivation ────────────────────────────────────
// Derived from primary position + peak attributes. No per-player hand-tagging.

export function deriveChemistryStyle(player: Player): ChemistryStyle {
  const pos = player.positions[0]
  const a = player.peakAttributes

  // Goalkeepers
  if (pos === 'GK') return a.pace >= 58 ? 'SWEEPER_GK' : 'STOPPER_GK'

  // Centre-backs
  if (pos === 'CB') return a.pace >= 80 ? 'SHADOW' : 'ANCHOR'

  // Full-backs
  if (pos === 'RB' || pos === 'LB') return a.pace >= 78 ? 'SHADOW' : 'ANCHOR'

  // Defensive midfielder — always an anchor
  if (pos === 'CDM') return 'ANCHOR'

  // Central midfielder
  if (pos === 'CM') {
    if (a.defending >= 83) return 'ANCHOR'     // Rice, Hargreaves in CM
    if (a.passing >= 88) return 'MAESTRO'      // Scholes, Hoddle, Foden, Wilkins
    if (a.dribbling >= 85) return 'PLAYMAKER'  // Gascoigne, Wilshere
    if (a.physical >= 80) return 'ENGINE'      // Gerrard, Lampard, Robson, Henderson
    return 'ARCHITECT'                         // Carrick, Charlton B (lower energy, passing-focused)
  }

  // Attacking midfielder
  if (pos === 'CAM') {
    if (a.dribbling >= 85) return 'PLAYMAKER'  // Gascoigne, Bellingham
    if (a.passing >= 88) return 'MAESTRO'      // Hoddle
    return 'ARCHITECT'                         // Platt, Mount
  }

  // Wide midfielders / wingers
  if (pos === 'RM' || pos === 'LM' || pos === 'RW' || pos === 'LW') {
    if (a.passing >= 88) return 'ARCHITECT'    // Beckham — deliverer supreme
    if (a.pace >= 87) return 'CATALYST'        // Walcott, Sterling
    if (a.dribbling >= 85) return 'CREATIVE'   // Barnes, Waddle, Saka
    return 'CREATIVE'
  }

  // Strikers
  if (pos === 'ST') {
    // Pure pace merchants
    if (a.pace >= 88) return 'HUNTER'
    // Physical target men (powerful but not rapid and not clinical enough for SNIPER)
    if (a.physical >= 83 && a.shooting < 83 && a.pace < 82) return 'TARGET'
    // Clinical finishers (world-class shooting but not blazing pace)
    if (a.shooting >= 90 && a.pace < 86) return 'SNIPER'
    // Quick enough to be a running threat
    if (a.pace >= 82) return 'HUNTER'
    // Default: powerful complete striker
    return 'POWERHOUSE'
  }

  return 'ENGINE'
}

// ─── Per-player pip score ─────────────────────────────────────────────────────
// 3 pips = natural primary position
// 2 pips = tagged secondary position
// 1 pip  = adjacent group or close coordinate
// 0 pips = wrong side of the pitch or nowhere near

// Local copy of the role groups (mirrors playerPool.ts to avoid circular deps)
const ROLE_GROUPS: Position[][] = [
  ['CDM', 'CM', 'CAM'],
  ['RM', 'RW'],
  ['LM', 'LW'],
]

export function playerPips(player: Player, slot: Position): number {
  // Hard GK boundary
  const isGK = player.positions[0] === 'GK'
  if (isGK !== (slot === 'GK')) return 0

  // Natural primary position: 3 pips
  if (player.positions[0] === slot) return 3

  // Tagged secondary position: 2 pips
  if (player.positions.includes(slot)) return 2

  // Adjacent role group: 1 pip
  const group = ROLE_GROUPS.find(g => g.includes(slot))
  if (group && player.positions.some(p => group.includes(p))) return 1

  // Close coordinate neighbour: 1 pip
  const [ax, ay] = POS_COORDS[player.positions[0]]
  const [bx, by] = POS_COORDS[slot]
  if (Math.hypot(ax - bx, ay - by) <= 24) return 1

  return 0
}

// ─── Style labels & colours ───────────────────────────────────────────────────

export const STYLE_LABEL: Record<ChemistryStyle, string> = {
  ANCHOR:     'Anchor',
  SHADOW:     'Shadow',
  ENGINE:     'Engine',
  MAESTRO:    'Maestro',
  PLAYMAKER:  'Playmaker',
  ARCHITECT:  'Architect',
  CATALYST:   'Catalyst',
  CREATIVE:   'Creative',
  POWERHOUSE: 'Powerhouse',
  HUNTER:     'Hunter',
  SNIPER:     'Sniper',
  TARGET:     'Target',
  STOPPER_GK: 'Stopper',
  SWEEPER_GK: 'Sweeper',
}

export const STYLE_COLOUR: Record<ChemistryStyle, string> = {
  STOPPER_GK: 'text-slate-400',
  SWEEPER_GK: 'text-slate-300',
  ANCHOR:     'text-sky-400',
  SHADOW:     'text-cyan-400',
  ENGINE:     'text-orange-400',
  MAESTRO:    'text-violet-400',
  PLAYMAKER:  'text-purple-400',
  ARCHITECT:  'text-indigo-400',
  CATALYST:   'text-green-400',
  CREATIVE:   'text-emerald-400',
  POWERHOUSE: 'text-red-400',
  HUNTER:     'text-rose-400',
  SNIPER:     'text-yellow-400',
  TARGET:     'text-amber-500',
}

// ─── Team chemistry analysis ──────────────────────────────────────────────────
// FUT-inspired scoring model:
//   • Base (up to 76): sum of each player's pips / 33 (11 players × 3 max) × 76
//   • Three style synergy bonuses (up to +8 each = +24 max)
//   • Small modifiers for CB pace, world-class GK, etc.
// Perfect team = everyone in position (76) + all three synergies (24) = 100

interface SlottedPlayer {
  player: RatedPlayer
  slot: FormationSlot
  style: ChemistryStyle
  pips: number
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
      style: deriveChemistryStyle(p),
      pips: playerPips(p, slots[i].position),
    })
  })

  const notes: ChemistryNote[] = []
  let attackMod = 0
  let defenseMod = 0

  // ── 1. Per-player pip base score ───────────────────────────────────────────
  const totalPips = filled.reduce((sum, sp) => sum + sp.pips, 0)
  const rawScore = (totalPips / 33) * 76   // 33 = 11 players × 3 pips max

  // ── 2. Out-of-position notes (no hard penalty — pips already reflect it) ──
  const oop = filled.filter(sp => sp.pips <= 1)
  for (const sp of oop) {
    const surname = sp.player.name.split(' ').pop()!
    notes.push({
      type: 'bad',
      text: sp.pips === 0
        ? `${surname} is completely out of position at ${sp.slot.label}`
        : `${surname} is a stretch at ${sp.slot.label} — only 1 pip`,
    })
  }

  // ── 3. Style synergy bonuses ───────────────────────────────────────────────
  let bonus = 0

  // Synergy A: Defensive foundation (+8)
  // At least one ANCHOR or SHADOW in the defensive block (CB/FB/CDM)
  const hasDefenderAnchor = filled.some(sp =>
    ['CB', 'RB', 'LB'].includes(sp.slot.position) &&
    (sp.style === 'ANCHOR' || sp.style === 'SHADOW')
  )
  const hasMidAnchor = filled.some(sp =>
    sp.slot.position === 'CDM' ||
    (sp.slot.position === 'CM' && sp.style === 'ANCHOR')
  )
  if (hasDefenderAnchor && hasMidAnchor) {
    bonus += 8
    defenseMod += 5
    notes.push({ type: 'good', text: 'Defensive anchor locked in — the back four is well protected' })
  } else if (hasDefenderAnchor || hasMidAnchor) {
    bonus += 4
    defenseMod += 2
  }

  // Synergy B: Creative midfield (+8)
  const centralMids = filled.filter(sp =>
    ['CDM', 'CM', 'CAM'].includes(sp.slot.position)
  )
  const hasCreativeMid = centralMids.some(sp =>
    ['MAESTRO', 'ARCHITECT', 'PLAYMAKER'].includes(sp.style)
  )
  const hasWorkerMid = centralMids.some(sp =>
    ['ENGINE', 'ANCHOR'].includes(sp.style)
  )
  if (hasCreativeMid && hasWorkerMid) {
    bonus += 8
    attackMod += 3
    defenseMod += 2
    notes.push({ type: 'good', text: 'Balanced midfield — craft and graft in equal measure' })
  } else if (hasCreativeMid) {
    bonus += 4
    attackMod += 2
    notes.push({ type: 'good', text: 'Creative midfielder pulling the strings — this team can unlock anyone' })
  } else if (centralMids.length >= 2 && !hasCreativeMid) {
    notes.push({
      type: 'info',
      text: 'All runners in midfield — dangerous going forward, but exposed when you turn the ball over',
    })
  }

  // Synergy C: Forward threat (+8)
  const attackers = filled.filter(sp =>
    ['ST', 'RW', 'LW', 'RM', 'LM'].includes(sp.slot.position)
  )
  const hasPaceAttack = attackers.some(sp =>
    sp.style === 'HUNTER' || sp.style === 'CATALYST'
  )
  const hasFocalAttack = attackers.some(sp =>
    sp.style === 'POWERHOUSE' || sp.style === 'TARGET' || sp.style === 'SNIPER'
  )
  if (hasPaceAttack && hasFocalAttack) {
    bonus += 8
    attackMod += 5
    notes.push({ type: 'good', text: 'Strike force has focal point and pace in behind — defenders face a nightmare' })
  } else if (hasPaceAttack || hasFocalAttack) {
    bonus += 4
    attackMod += 2
  }

  // ── 4. CB pace check ──────────────────────────────────────────────────────
  const cbs = filled.filter(sp => sp.slot.position === 'CB')
  if (cbs.length >= 2) {
    const avgPace = cbs.reduce((s, sp) => s + sp.player.peakAttributes.pace, 0) / cbs.length
    if (avgPace < 64) {
      notes.push({ type: 'bad', text: 'Slow centre-back pairing — one ball in behind and they\'re in trouble' })
      bonus -= 4
      defenseMod -= 4
    } else if (avgPace >= 78) {
      notes.push({ type: 'good', text: 'Quick, mobile CBs — confident playing a high line' })
      defenseMod += 2
    }
  }

  // ── 5. World-class goalkeeper ─────────────────────────────────────────────
  const gk = filled.find(sp => sp.slot.position === 'GK')
  if (gk && (gk.player.peakAttributes.gk ?? 0) >= 90) {
    const surname = gk.player.name.split(' ').pop()!
    notes.push({ type: 'good', text: `${surname} between the sticks — opponents will need to be perfect` })
    bonus += 2
  }

  const score = Math.max(35, Math.min(100, Math.round(rawScore + bonus)))

  if (notes.length === 0) {
    notes.push({ type: 'info', text: 'A sensible, well-balanced selection' })
  }

  // ── Per-player chem data (FUT-style) ──────────────────────────────────────
  const players: PlayerChemEntry[] = filled.map(sp => ({
    playerId: sp.player.id,
    name: sp.player.name,
    pips: sp.pips,
    style: sp.style,
    slotLabel: sp.slot.label,
  }))

  return { score, notes, attackMod, defenseMod, players }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

export const CHEM_LABEL = (score: number): string =>
  score >= 90 ? 'Perfect Understanding' :
  score >= 80 ? 'Strong Chemistry' :
  score >= 68 ? 'Workable' :
  score >= 55 ? 'Disjointed' :
  'No Chemistry'
