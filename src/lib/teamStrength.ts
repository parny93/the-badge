import { Formation, FormationSlot, RatedPlayer, TeamStrength } from '@/types'
import { analyzeChemistry, familiarity } from './chemistry'
import { Manager } from '@/data/managers'
import { isGoldenGeneration } from '@/data/playerTags'
import { displaySurname } from './names'

// Optional squad context: the gaffer, the armband and the bench all nudge
// the numbers the match sim consumes.
export interface StrengthContext {
  manager?: Manager
  captainId?: string | null
  bench?: (RatedPlayer | null)[]
}

// ─── Formation definitions ────────────────────────────────────────────────────
// Positions in order: GK, DEF×n, MID×n, ATT×n
// x = left-right % (0=left, 100=right, 50=centre)
// y = bottom-top % (10=near goal, 90=near opp goal)

export const FORMATIONS: Record<Formation, FormationSlot[]> = {
  '4-3-3': [
    { position: 'GK',  label: 'GK',  x: 50, y: 8 },
    { position: 'RB',  label: 'RB',  x: 82, y: 25 },
    { position: 'CB',  label: 'CB',  x: 62, y: 22 },
    { position: 'CB',  label: 'CB',  x: 38, y: 22 },
    { position: 'LB',  label: 'LB',  x: 18, y: 25 },
    { position: 'CM',  label: 'CM',  x: 72, y: 50 },
    { position: 'CDM', label: 'CDM', x: 50, y: 44 },
    { position: 'CM',  label: 'CM',  x: 28, y: 50 },
    { position: 'RW',  label: 'RW',  x: 82, y: 74 },
    { position: 'ST',  label: 'ST',  x: 50, y: 82 },
    { position: 'LW',  label: 'LW',  x: 18, y: 74 },
  ],
  '4-4-2': [
    { position: 'GK',  label: 'GK',  x: 50, y: 8 },
    { position: 'RB',  label: 'RB',  x: 82, y: 25 },
    { position: 'CB',  label: 'CB',  x: 62, y: 22 },
    { position: 'CB',  label: 'CB',  x: 38, y: 22 },
    { position: 'LB',  label: 'LB',  x: 18, y: 25 },
    { position: 'RM',  label: 'RM',  x: 85, y: 52 },
    { position: 'CM',  label: 'CM',  x: 62, y: 50 },
    { position: 'CM',  label: 'CM',  x: 38, y: 50 },
    { position: 'LM',  label: 'LM',  x: 15, y: 52 },
    { position: 'ST',  label: 'ST',  x: 62, y: 80 },
    { position: 'ST',  label: 'ST',  x: 38, y: 80 },
  ],
  '4-2-3-1': [
    { position: 'GK',  label: 'GK',  x: 50, y: 8 },
    { position: 'RB',  label: 'RB',  x: 82, y: 25 },
    { position: 'CB',  label: 'CB',  x: 62, y: 22 },
    { position: 'CB',  label: 'CB',  x: 38, y: 22 },
    { position: 'LB',  label: 'LB',  x: 18, y: 25 },
    { position: 'CDM', label: 'CDM', x: 62, y: 44 },
    { position: 'CDM', label: 'CDM', x: 38, y: 44 },
    { position: 'RW',  label: 'RW',  x: 80, y: 66 },
    { position: 'CAM', label: 'CAM', x: 50, y: 66 },
    { position: 'LW',  label: 'LW',  x: 20, y: 66 },
    { position: 'ST',  label: 'ST',  x: 50, y: 83 },
  ],
  '3-5-2': [
    { position: 'GK',  label: 'GK',  x: 50, y: 8 },
    { position: 'CB',  label: 'CB',  x: 72, y: 23 },
    { position: 'CB',  label: 'CB',  x: 50, y: 20 },
    { position: 'CB',  label: 'CB',  x: 28, y: 23 },
    { position: 'RM',  label: 'RM',  x: 88, y: 50 },
    { position: 'CM',  label: 'CM',  x: 68, y: 48 },
    { position: 'CDM', label: 'CDM', x: 50, y: 44 },
    { position: 'CM',  label: 'CM',  x: 32, y: 48 },
    { position: 'LM',  label: 'LM',  x: 12, y: 50 },
    { position: 'ST',  label: 'ST',  x: 62, y: 80 },
    { position: 'ST',  label: 'ST',  x: 38, y: 80 },
  ],
  '5-3-2': [
    { position: 'GK',  label: 'GK',  x: 50, y: 8 },
    { position: 'RB',  label: 'RB',  x: 88, y: 28 },
    { position: 'CB',  label: 'CB',  x: 70, y: 22 },
    { position: 'CB',  label: 'CB',  x: 50, y: 19 },
    { position: 'CB',  label: 'CB',  x: 30, y: 22 },
    { position: 'LB',  label: 'LB',  x: 12, y: 28 },
    { position: 'CM',  label: 'CM',  x: 68, y: 52 },
    { position: 'CDM', label: 'CDM', x: 50, y: 47 },
    { position: 'CM',  label: 'CM',  x: 32, y: 52 },
    { position: 'ST',  label: 'ST',  x: 62, y: 80 },
    { position: 'ST',  label: 'ST',  x: 38, y: 80 },
  ],
}

// ─── Team strength calculation ────────────────────────────────────────────────
// Each player contributes to a phase (attack / midfield / defence) weighted by:
//   - their attributes for that phase
//   - their effective rating at the chosen year (ratingAtYear / peak ratio)
//   - position familiarity (penalty for being played out of position)
// Chemistry then nudges the attack & defence numbers that the match sim consumes.

interface Slotted { player: RatedPlayer; slot: FormationSlot }

export function calculateTeamStrength(
  squad: (RatedPlayer | null)[],
  formation: Formation,
  ctx: StrengthContext = {}
): TeamStrength {
  const slots = FORMATIONS[formation]
  const rated: Slotted[] = squad
    .map((p, i) => ({ player: p, slot: slots[i] }))
    .filter((r): r is Slotted => r.player !== null)

  const gkScore = (() => {
    const gk = rated.find(r => r.slot.position === 'GK')?.player
    if (!gk) return 60
    return gk.peakAttributes.gk ?? gk.ratingAtYear
  })()

  // Per-player contribution for a phase, scaled by year-rating and familiarity.
  const contribution = (
    sp: Slotted,
    weight: (p: RatedPlayer) => number
  ): number => {
    const base = weight(sp.player)
    const ratio = sp.player.ratingAtYear / Math.max(sp.player.peakRating, 1)
    const fam = familiarity(sp.player, sp.slot.position)
    return base * ratio * fam
  }

  const phaseAvg = (
    group: Slotted[],
    weight: (p: RatedPlayer) => number
  ): number =>
    group.length === 0
      ? 60
      : Math.round(group.reduce((s, sp) => s + contribution(sp, weight), 0) / group.length)

  const defGroup = rated.filter(r => ['RB', 'CB', 'LB'].includes(r.slot.position))
  const midGroup = rated.filter(r => ['CDM', 'CM', 'CAM', 'RM', 'LM'].includes(r.slot.position))
  const attGroup = rated.filter(r => ['RW', 'LW', 'ST'].includes(r.slot.position))

  const rawDef = phaseAvg(defGroup, p =>
    p.peakAttributes.defending * 0.5 + p.peakAttributes.physical * 0.3 + p.peakAttributes.pace * 0.2)
  const midfield = phaseAvg(midGroup, p =>
    p.peakAttributes.passing * 0.4 + p.peakAttributes.dribbling * 0.3 + p.peakAttributes.defending * 0.3)
  const rawAtt = phaseAvg(attGroup, p =>
    p.peakAttributes.shooting * 0.5 + p.peakAttributes.pace * 0.3 + p.peakAttributes.dribbling * 0.2)

  // Chemistry & balance analysis
  const chemistry = analyzeChemistry(squad, slots)

  let attack  = rawAtt + chemistry.attackMod
  let defense = rawDef * 0.7 + gkScore * 0.3 + chemistry.defenseMod
  let chemScore = chemistry.score

  // ── Tactical balance — bad combinations sink good players ────────────────
  // Getting out of the group should be the base expectation; these are the
  // self-inflicted wounds that change that.
  const centralMids = chemistry.players.filter(p => ['CDM', 'CM', 'CAM'].includes(p.slotLabel))

  // No shield in front of the back four (no CDM slot, no destroyer/runner in
  // central midfield): organised opposition will play through England.
  const hasShield = centralMids.some(p =>
    p.slotLabel === 'CDM' || p.style === 'SENTINEL' || p.style === 'DYNAMO'
  )
  if (centralMids.length > 0 && !hasShield) {
    defense -= 5
    chemScore -= 4
    chemistry.notes.push({
      type: 'bad',
      text: 'Nobody minding the house in midfield — organised sides will cut straight through',
    })
  }

  // The Gascoigne + Scholes problem: two or more central mids who are ALL
  // craft and no graft. Beautiful on the ball, chaos off it.
  if (centralMids.length >= 2 && centralMids.every(p => ['CONDUCTOR', 'WIZARD', 'SCHEMER'].includes(p.style))) {
    defense -= 3
    chemistry.notes.push({
      type: 'bad',
      text: 'All craft, no graft through the middle — a wonderful midfield to watch lose the ball',
    })
  }

  // Lone-striker weak link: a limited No 9 caps the whole system.
  const stSlots = rated.filter(r => r.slot.position === 'ST')
  if (stSlots.length === 1 && stSlots[0].player.ratingAtYear < 80) {
    attack -= 3
    chemistry.notes.push({
      type: 'bad',
      text: `${displaySurname(stSlots[0].player.name)} is isolated up front — the system lives and dies on his finishing`,
    })
  }

  // ── Manager bump — flavoured to the gaffer's real tactics ────────────────
  if (ctx.manager) {
    attack += ctx.manager.attackMod
    defense += ctx.manager.defenseMod
    chemScore += ctx.manager.chemBonus
    chemistry.notes.push({ type: 'info', text: `${ctx.manager.name}: ${ctx.manager.tactic}` })
  }

  // ── Captain's armband — worth one rating point of leadership ─────────────
  const captain = ctx.captainId
    ? rated.find(r => r.player.id === ctx.captainId)?.player
    : undefined
  if (captain) {
    chemistry.notes.push({
      type: 'good',
      text: `${displaySurname(captain.name)} wears the armband — he leads England out`,
    })
  }

  // ── Golden Generation easter egg — the landing-page challenge, recognised ─
  const goldenCount = rated.filter(r => isGoldenGeneration(r.player.id)).length
  if (goldenCount >= 8) {
    chemistry.notes.push({
      type: 'info',
      text: 'The Golden Generation rides again — surely THIS time it works',
    })
  }

  // ── Bench depth — a strong squad survives a long tournament ──────────────
  const benchPlayers = (ctx.bench ?? []).filter((p): p is RatedPlayer => p !== null)
  if (benchPlayers.length >= 5) {
    const avg = benchPlayers.reduce((s, p) => s + p.ratingAtYear, 0) / benchPlayers.length
    if (avg >= 82) {
      chemScore += 2
      chemistry.notes.push({ type: 'good', text: 'Serious depth on the bench — fresh legs win knockouts' })
    }
  }

  chemistry.score = Math.max(35, Math.min(100, Math.round(chemScore)))
  const attackR  = Math.round(attack)
  const defenseR = Math.round(defense)
  // The captain's armband is worth exactly one rating point on the overall.
  const overall  = Math.round(attackR * 0.4 + midfield * 0.3 + defenseR * 0.3) + (captain ? 1 : 0)

  return { overall, attack: attackR, midfield, defense: defenseR, chemistry }
}
