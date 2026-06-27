// Unit primitives shared by the combat engine and the effect resolver. Kept in
// its own module so `effects` can transform units without importing `combat`
// (which would be a cycle). Pure: every function returns a new Unit.

import { triggerHpLossPassives } from "./passives";
import type { PassiveName } from "./passives";
import type { EnemyAction } from "./enemies";

export type Side = "player" | "enemy";

// The named statuses a unit can carry. Distinct from the unit's stat fields
// (hp/atk/blk): statuses are stackable, strippable, and reset between
// encounters, whereas direct stat mutations are permanent for the combat.
export type StatusName = "burn" | "tremors" | "twinkletoes" | "potential";

// A unit's live statuses as name -> stack count. A name absent from the bag has
// zero stacks; a present name always has a positive count.
export type StatusBag = Partial<Record<StatusName, number>>;

export interface Unit {
  id: string;
  name: string;
  side: Side;
  hp: number;
  maxHp: number;
  /** Damage dealt to every opponent on this unit's attack phase. */
  atk: number;
  /** Flat reduction applied per incoming damage instance; may be negative. */
  blk: number;
  /** Stackable buffs/debuffs; resets between encounters. */
  statuses: StatusBag;
  /** Always-on abilities that trigger on events (e.g. Rage). Enemies only. */
  passives?: PassiveName[];
  /** Fixed, ordered, looping action cycle performed on the Action phase. */
  actionCycle?: EnemyAction[];
  /** Index of the next action in `actionCycle`; wraps after the last step. */
  cycleIndex?: number;
}

// Reduce a unit's hp by one damage instance. Block is subtracted per instance
// and can go negative (increasing damage); net damage never heals, and hp
// never drops below 0.
export function applyDamage(unit: Unit, amount: number): Unit {
  const net = Math.max(0, amount - unit.blk);
  if (net <= 0) return unit;
  const damaged = { ...unit, hp: Math.max(0, unit.hp - net) };
  return triggerHpLossPassives(damaged);
}
