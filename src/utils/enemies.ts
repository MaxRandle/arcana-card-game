// The enemy roster and its behaviour: the fixed action cycle each enemy steps
// through and the stance/tithe actions those steps perform. Pure and UI-free.
// Actions and cycles are self-contained transforms over the acting unit, so the
// combat engine drives the Action phase by calling `resolveActionPhase`.
//
// Imports the `Unit` type and the Rage trigger; `units` imports only the
// `EnemyAction` type back (erased at compile time), so there is no runtime cycle.

import type { Unit } from "./units";
import { triggerHpLossPassives } from "./passives";

// The actions an enemy can take on its Action phase. "none" is an explicit
// skip step in a cycle (the enemy does nothing that turn).
export type EnemyAction =
  | "battleStance"
  | "defensiveStance"
  | "bloodTithe"
  | "none";

const STANCE_SHIFT = 3;

// Display names for the action — used by tests and any future intent readout.
export const ACTION_LABEL: Record<EnemyAction, string> = {
  battleStance: "Battle stance",
  defensiveStance: "Defensive stance",
  bloodTithe: "Blood tithe",
  none: "None",
};

// Apply one action to the acting unit, returning the updated unit. Actions only
// touch the unit performing them (stances mutate its own atk/blk; Blood tithe
// drains its own hp). atk is floored at 0; blk may go negative.
export function applyAction(unit: Unit, action: EnemyAction): Unit {
  switch (action) {
    case "battleStance":
      return {
        ...unit,
        blk: unit.blk - STANCE_SHIFT,
        atk: Math.max(0, unit.atk + STANCE_SHIFT),
      };
    case "defensiveStance":
      return {
        ...unit,
        blk: unit.blk + STANCE_SHIFT,
        atk: Math.max(0, unit.atk - STANCE_SHIFT),
      };
    case "bloodTithe":
      // A direct hp loss (not damage, so block is ignored); it still triggers
      // on-hp-loss passives such as the Barbarian's own Rage.
      return triggerHpLossPassives({ ...unit, hp: Math.max(0, unit.hp - 1) });
    case "none":
      return unit;
  }
}

// The Action phase: every living enemy performs its current cycle step, then
// advances (wrapping after the last). Units the action kills are pruned.
export function resolveActionPhase(units: Unit[]): Unit[] {
  return units
    .map((unit) => {
      if (unit.side !== "enemy" || unit.hp <= 0 || !unit.actionCycle?.length) {
        return unit;
      }
      const index = unit.cycleIndex ?? 0;
      const acted = applyAction(unit, unit.actionCycle[index]);
      return { ...acted, cycleIndex: (index + 1) % unit.actionCycle.length };
    })
    .filter((u) => u.hp > 0);
}

// --- Roster (see design/units/enemies.md) ---

function makeEnemy(
  id: string,
  name: string,
  stats: Pick<Unit, "hp" | "atk" | "blk">,
  actionCycle: EnemyAction[],
  passives?: Unit["passives"],
): Unit {
  return {
    id,
    name,
    side: "enemy",
    hp: stats.hp,
    maxHp: stats.hp,
    atk: stats.atk,
    blk: stats.blk,
    statuses: {},
    actionCycle,
    cycleIndex: 0,
    ...(passives ? { passives } : {}),
  };
}

export function makeFastKnight(id: string): Unit {
  return makeEnemy(id, "Fast knight", { hp: 60, atk: 1, blk: 2 }, [
    "battleStance",
    "defensiveStance",
    "battleStance",
    "defensiveStance",
  ]);
}

export function makeSlowKnight(id: string): Unit {
  return makeEnemy(id, "Slow knight", { hp: 60, atk: 1, blk: 2 }, [
    "battleStance",
    "none",
    "defensiveStance",
    "none",
  ]);
}

export function makeBarbarian(id: string): Unit {
  return makeEnemy(
    id,
    "Barbarian",
    { hp: 60, atk: 1, blk: 0 },
    ["bloodTithe"],
    ["rage"],
  );
}
