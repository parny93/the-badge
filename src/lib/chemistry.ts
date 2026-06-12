import {
  Player, Position, FormationSlot, ChemistryReport, ChemistryNote,
  ChemistryStyle, PlayerChemEntry, RatedPlayer,
} from '@/types'
import { displaySurname } from './names'
import { clubOf } from '@/data/playerClubs'
import { activeLinkups } from './spark'

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
  if (pos === 'GK') return a.pace >= 58 ? 'LIBERO' : 'GUARDIAN'

  // Centre-backs
  if (pos === 'CB') return a.pace >= 80 ? 'RAZOR' : 'SENTINEL'

  // Full-backs
  if (pos === 'RB' || pos === 'LB') return a.pace >= 78 ? 'RAZOR' : 'SENTINEL'

  // Defensive midfielder — always a sentinel
  if (pos === 'CDM') return 'SENTINEL'

  // Central midfielder
  if (pos === 'CM') {
    if (a.defending >= 83) return 'SENTINEL'    // Rice, Hargreaves in CM
    if (a.passing >= 88) return 'CONDUCTOR'     // Scholes, Hoddle, Foden, Wilkins
    if (a.dribbling >= 85) return 'WIZARD'      // Gascoigne, Wilshere
    if (a.physical >= 80) return 'DYNAMO'       // Gerrard, Lampard, Robson, Henderson
    return 'SCHEMER'                            // Carrick, Charlton B (lower energy, passing-focused)
  }

  // Attacking midfielder
  if (pos === 'CAM') {
    if (a.dribbling >= 85) return 'WIZARD'      // Gascoigne, Bellingham
    if (a.passing >= 88) return 'CONDUCTOR'     // Hoddle
    return 'SCHEMER'                            // Platt, Mount
  }

  // Wide midfielders / wingers
  if (pos === 'RM' || pos === 'LM' || pos === 'RW' || pos === 'LW') {
    if (a.passing >= 88) return 'SCHEMER'       // Beckham — deliverer supreme
    if (a.pace >= 87) return 'ROCKET'           // Walcott, Sterling
    if (a.dribbling >= 85) return 'ARTIST'      // Barnes, Waddle, Saka
    return 'ARTIST'
  }

  // Strikers
  if (pos === 'ST') {
    // Pure pace merchants
    if (a.pace >= 88) return 'RAPTOR'
    // Physical target men (powerful but not rapid and not clinical)
    if (a.physical >= 83 && a.shooting < 83 && a.pace < 82) return 'TOWER'
    // Clinical finishers (world-class shooting but not blazing pace)
    if (a.shooting >= 90 && a.pace < 86) return 'MARKSMAN'
    // Quick enough to be a running threat
    if (a.pace >= 82) return 'RAPTOR'
    // Default: powerful complete striker
    return 'COLOSSUS'
  }

  return 'DYNAMO'
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
  SENTINEL:   'Sentinel',
  RAZOR:      'Razor',
  DYNAMO:     'Dynamo',
  CONDUCTOR:  'Conductor',
  WIZARD:     'Wizard',
  SCHEMER:    'Schemer',
  ROCKET:     'Rocket',
  ARTIST:     'Artist',
  COLOSSUS:   'Colossus',
  RAPTOR:     'Raptor',
  MARKSMAN:   'Marksman',
  TOWER:      'Tower',
  GUARDIAN:   'Guardian',
  LIBERO:     'Libero',
}

export const STYLE_COLOUR: Record<ChemistryStyle, string> = {
  GUARDIAN:   'text-slate-400',
  LIBERO:     'text-slate-300',
  SENTINEL:   'text-sky-400',
  RAZOR:      'text-cyan-400',
  DYNAMO:     'text-orange-400',
  CONDUCTOR:  'text-violet-400',
  WIZARD:     'text-purple-400',
  SCHEMER:    'text-indigo-400',
  ROCKET:     'text-green-400',
  ARTIST:     'text-emerald-400',
  COLOSSUS:   'text-red-400',
  RAPTOR:     'text-rose-400',
  MARKSMAN:   'text-yellow-400',
  TOWER:      'text-amber-500',
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
    const surname = displaySurname(sp.player.name)
    notes.push({
      type: 'bad',
      text: sp.pips === 0
        ? `${surname} is completely out of position at ${sp.slot.label}`
        : `${surname} is a stretch at ${sp.slot.label} — only 1 pip`,
    })
  }

  // ── 3. Club link-ups ───────────────────────────────────────────────────────
  // Real club blocs gel: the '66 West Ham trio, the Class of '92, the Chelsea
  // and Liverpool spines, this City side. The bigger the bloc, the bigger the
  // bonus — and a settled spine tightens the whole team.
  let bonus = 0
  const clubCounts = new Map<string, number>()
  for (const sp of filled) {
    const club = clubOf(sp.player.id)
    if (club) clubCounts.set(club, (clubCounts.get(club) ?? 0) + 1)
  }
  let clubBonus = 0
  const blocs = [...clubCounts.entries()].filter(([, n]) => n >= 2).sort((a, b) => b[1] - a[1])
  for (const [club, n] of blocs) {
    const blocBonus = n === 2 ? 4 : n === 3 ? 9 : n === 4 ? 14 : 18
    clubBonus += blocBonus
    defenseMod += Math.min(4, n - 1)
    attackMod += Math.min(3, n - 1)
    notes.push({
      type: 'good',
      text: n >= 4
        ? `A ${club} core of ${n} — they could play this in their sleep`
        : `${n} ${club} teammates linking up — the understanding shows`,
    })
  }
  // Cap the club contribution so it complements, not replaces, position fit.
  bonus += Math.min(24, clubBonus)

  // ── Link-ups & sparks — documented partnerships and the odd random spark ────
  for (const link of activeLinkups(squad)) {
    if (link.positive) {
      bonus += Math.round(link.boost * 0.35)
      attackMod += 2
      defenseMod += 1
    } else {
      bonus += link.boost            // negative — a misfit costs
      attackMod -= 1
    }
    notes.push({ type: link.positive ? 'good' : 'bad', text: link.note })
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
    const surname = displaySurname(gk.player.name)
    notes.push({ type: 'good', text: `${surname} between the sticks — opponents will need to be perfect` })
    bonus += 2
  }

  const score = Math.max(35, Math.min(100, Math.round(rawScore + bonus)))

  if (notes.length === 0) {
    notes.push({ type: 'info', text: 'A sensible, well-balanced selection' })
  }

  // ── Per-player chem data ──────────────────────────────────────────────────
  const players: PlayerChemEntry[] = filled.map(sp => ({
    playerId: sp.player.id,
    name: sp.player.name,
    pips: sp.pips,
    style: sp.style,
    club: clubOf(sp.player.id),
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
