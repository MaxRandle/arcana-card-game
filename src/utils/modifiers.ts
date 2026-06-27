// Per-combat cost and ongoing modifiers — the state that the Ramp keyword and
// the "additional mana per turn" / elemental-damage cards write into. Combat
// scoped: a fresh `CombatModifiers` is built per encounter, so everything here
// resets between fights. The one exception is `permanentElementalDamage`, the
// running total of Permanent elemental-damage bonuses, which the run checkpoint
// carries forward and seeds back in via `createModifiers`. Pure and UI-free.

import { Card } from "./cards";

export interface CombatModifiers {
  /** Accumulated ramp per card instance id; an absent id means 0. */
  ramp: Record<string, number>;
  /** Extra mana added during each Mana phase for the rest of combat. */
  manaPerTurn: number;
  /** Bonus added to each damage-dealing card effect this combat. */
  elementalDamage: number;
  /** The Permanent slice of `elementalDamage`, persisted via the checkpoint. */
  permanentElementalDamage: number;
}

// Build a fresh set of combat modifiers, seeding the elemental-damage bonus from
// the Permanent total carried by the run.
export function createModifiers(permanentElementalDamage = 0): CombatModifiers {
  return {
    ramp: {},
    manaPerTurn: 0,
    elementalDamage: permanentElementalDamage,
    permanentElementalDamage,
  };
}

// The cost to play this instance right now: base cost plus its accumulated ramp,
// floored at 0 (a card never costs negative mana).
export function effectiveCost(
  card: Card,
  instanceId: string,
  modifiers: CombatModifiers,
): number {
  return Math.max(0, card.cost + (modifiers.ramp[instanceId] ?? 0));
}

// Accumulate the card's ramp onto its instance counter. A no-op (same reference)
// for a card without the keyword, so duplicates ramp independently by id.
export function applyRamp(
  modifiers: CombatModifiers,
  card: Card,
  instanceId: string,
): CombatModifiers {
  const ramp = card.ramp ?? 0;
  if (ramp === 0) return modifiers;
  return {
    ...modifiers,
    ramp: {
      ...modifiers.ramp,
      [instanceId]: (modifiers.ramp[instanceId] ?? 0) + ramp,
    },
  };
}

export function gainManaPerTurn(
  modifiers: CombatModifiers,
  amount: number,
): CombatModifiers {
  return { ...modifiers, manaPerTurn: modifiers.manaPerTurn + amount };
}

// Raise the elemental-damage bonus; a Permanent gain also grows the persisted
// total so it survives the combat-end reset.
export function gainElementalDamage(
  modifiers: CombatModifiers,
  amount: number,
  permanent: boolean,
): CombatModifiers {
  return {
    ...modifiers,
    elementalDamage: modifiers.elementalDamage + amount,
    permanentElementalDamage:
      modifiers.permanentElementalDamage + (permanent ? amount : 0),
  };
}
