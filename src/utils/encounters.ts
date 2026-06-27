// Level and encounter compositions — the fixed enemy line-ups the run steps
// through (design/levels/level-1.md). Pure reference data plus a builder that
// stamps each unit in an encounter with a unique id. Replaces the debug fight
// in the combat entry point (issue 08).

import type { Unit } from "./units";
import { makeFastKnight, makeSlowKnight, makeBarbarian } from "./enemies";

export const ENCOUNTERS_PER_LEVEL = 4;

// The enemy makers keyed by a short composition token.
const ENEMY_MAKERS: Record<string, (id: string) => Unit> = {
  fast: makeFastKnight,
  slow: makeSlowKnight,
  barbarian: makeBarbarian,
};

// Each level is its 4 encounters; each encounter is the enemy tokens it fields.
const LEVELS: string[][][] = [
  // Level 1
  [
    ["slow", "fast"],
    ["slow", "fast"],
    ["slow", "slow", "fast"],
    ["slow", "slow", "fast", "fast"],
  ],
];

export const TOTAL_LEVELS = LEVELS.length;

// Build the enemies for a 1-based level/encounter, each with a unique id so
// duplicate enemy types remain independently addressable in combat.
export function makeEncounter(level: number, encounter: number): Unit[] {
  const composition = LEVELS[level - 1]?.[encounter - 1];
  if (!composition) {
    throw new Error(`No encounter ${encounter} in level ${level}`);
  }
  return composition.map((token, i) => {
    const make = ENEMY_MAKERS[token];
    if (!make) throw new Error(`Unknown enemy token: ${token}`);
    return make(`${token}-${i}`);
  });
}
