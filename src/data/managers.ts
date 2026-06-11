// ─── England managers ─────────────────────────────────────────────────────────
// Each manager grants a small chemistry/strength modifier flavoured to their
// actual tactical reputation. Applied in teamStrength + matchSimulator.

export interface Manager {
  id: string
  name: string
  tenure: string         // years in charge, for flavour
  tactic: string         // one-line tactical identity shown on the pick screen
  chemBonus: number      // flat badge-chemistry points
  attackMod: number      // applied to attack score
  defenseMod: number     // applied to defense score
  knockoutBoost?: number // extra attack+defense in knockout rounds
  penaltyBoost?: number  // shootout win-probability nudge (England's scar tissue)
  starBias?: boolean     // Sven: best player gets +2 effective rating flavour
}

export const MANAGERS: Manager[] = [
  {
    id: 'ramsey', name: 'Alf Ramsey', tenure: '1963–74',
    tactic: 'The Wingless Wonders — defensive solidity above all',
    chemBonus: 2, attackMod: 0, defenseMod: 4,
  },
  {
    id: 'robson', name: 'Bobby Robson', tenure: '1982–90',
    tactic: 'Adaptable, beloved, big-tournament pedigree',
    chemBonus: 3, attackMod: 2, defenseMod: 1, knockoutBoost: 1,
  },
  {
    id: 'taylor', name: 'Graham Taylor', tenure: '1990–93',
    tactic: 'Long ball, hard running — do not like that',
    chemBonus: 0, attackMod: 1, defenseMod: -1,
  },
  {
    id: 'venables', name: 'Terry Venables', tenure: '1994–96',
    tactic: 'The Christmas tree — clever shapes, home-soil swagger',
    chemBonus: 4, attackMod: 2, defenseMod: 0,
  },
  {
    id: 'hoddle', name: 'Glenn Hoddle', tenure: '1996–99',
    tactic: 'Technique-first, wing-backs, faith in flair',
    chemBonus: 2, attackMod: 3, defenseMod: -1,
  },
  {
    id: 'keegan', name: 'Kevin Keegan', tenure: '1999–2000',
    tactic: 'All-out attack, tactics optional',
    chemBonus: 1, attackMod: 4, defenseMod: -3,
  },
  {
    id: 'eriksson', name: 'Sven-Göran Eriksson', tenure: '2001–06',
    tactic: 'Pragmatic 4-4-2 built around the stars',
    chemBonus: 2, attackMod: 2, defenseMod: 1, starBias: true,
  },
  {
    id: 'mcclaren', name: 'Steve McClaren', tenure: '2006–07',
    tactic: 'The wally with the brolly — hope it stays dry',
    chemBonus: 0, attackMod: 0, defenseMod: 0,
  },
  {
    id: 'capello', name: 'Fabio Capello', tenure: '2008–12',
    tactic: 'Iron discipline, joyless efficiency',
    chemBonus: 1, attackMod: 0, defenseMod: 3,
  },
  {
    id: 'hodgson', name: 'Roy Hodgson', tenure: '2012–16',
    tactic: 'Two banks of four, well-organised, low ceiling',
    chemBonus: 1, attackMod: -1, defenseMod: 3,
  },
  {
    id: 'allardyce', name: 'Sam Allardyce', tenure: '2016 (1 game)',
    tactic: 'Set pieces and a pint of wine — 100% win record',
    chemBonus: 2, attackMod: 0, defenseMod: 2,
  },
  {
    id: 'southgate', name: 'Gareth Southgate', tenure: '2016–24',
    tactic: 'Waistcoat calm — knockout rounds finally winnable',
    chemBonus: 3, attackMod: 0, defenseMod: 2, knockoutBoost: 2, penaltyBoost: 0.08,
  },
  {
    id: 'tuchel', name: 'Thomas Tuchel', tenure: '2025–',
    tactic: 'High press, ruthless rotations, German efficiency',
    chemBonus: 2, attackMod: 3, defenseMod: 1,
  },
]

export function getManager(id: string): Manager | undefined {
  return MANAGERS.find(m => m.id === id)
}
