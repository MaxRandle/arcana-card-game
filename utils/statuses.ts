// The status engine — the buff/debuff vocabulary layered over the bare unit
// stats. A status is named, stackable, and strippable as a whole (removal clears
// every stack at once), unlike the direct stat mutations in `units`, which are
// permanent for the combat. Pure and UI-free: every function returns new data.
//
// Two layers live here: bag operations (read/add/remove stacks on one unit's
// `StatusBag`) and battlefield behaviors (burn/tremors over a list of units).
// Behaviors lean on `units` for damage; `units` never imports back, so there is
// no cycle.

import { Rng } from "./deck";
import { Side, StatusBag, StatusName, Unit, applyDamage } from "./units";

export type StatusKind = "buff" | "debuff";

// Whether each status is a boon or a bane — drives the chip colour in the UI and
// the buff/debuff partition that Purging flame and Tenacity strip.
export const STATUS_KIND: Record<StatusName, StatusKind> = {
  burn: "debuff",
  tremors: "buff",
  twinkletoes: "buff",
  potential: "debuff",
};

// Display names for the status chips.
export const STATUS_LABEL: Record<StatusName, string> = {
  burn: "Burn",
  tremors: "Tremors",
  twinkletoes: "Twinkletoes",
  potential: "Potential",
};

const EVADE_CHANCE = 0.25;
const TREMORS_DAMAGE = 2;

// A status flattened for rendering: its display name, buff/debuff category, and
// stack count. The view layer maps this onto its chip component.
export interface StatusEntry {
  name: StatusName;
  label: string;
  kind: StatusKind;
  stacks: number;
}

// The unit's live statuses as an ordered list, ready for the status bar. Skips
// any status that has decayed to zero (and so is absent from the bag).
export function statusList(bag: StatusBag): StatusEntry[] {
  return (Object.keys(bag) as StatusName[])
    .filter((name) => statusStacks(bag, name) > 0)
    .map((name) => ({
      name,
      label: STATUS_LABEL[name],
      kind: STATUS_KIND[name],
      stacks: statusStacks(bag, name),
    }));
}

// --- Bag operations: stacks on a single unit's status bag ---

export function statusStacks(bag: StatusBag, name: StatusName): number {
  return bag[name] ?? 0;
}

// Add `amount` stacks, accumulating onto any already present.
export function addStatus(
  bag: StatusBag,
  name: StatusName,
  amount: number,
): StatusBag {
  return { ...bag, [name]: statusStacks(bag, name) + amount };
}

// Clear a whole status — every stack at once. The mechanic removal operates on.
export function removeStatus(bag: StatusBag, name: StatusName): StatusBag {
  const next = { ...bag };
  delete next[name];
  return next;
}

// Drop one stack; clearing the status entirely once it would hit zero.
export function decayStatus(bag: StatusBag, name: StatusName): StatusBag {
  const remaining = statusStacks(bag, name) - 1;
  if (remaining <= 0) return removeStatus(bag, name);
  return { ...bag, [name]: remaining };
}

function names(bag: StatusBag): StatusName[] {
  return Object.keys(bag) as StatusName[];
}

// Tenacity: strip every debuff, leaving buffs intact.
export function removeAllDebuffs(bag: StatusBag): StatusBag {
  let next = bag;
  for (const name of names(bag)) {
    if (STATUS_KIND[name] === "debuff") next = removeStatus(next, name);
  }
  return next;
}

// Purging flame: strip one random buff whole. A no-op when no buff is present.
export function removeRandomBuff(bag: StatusBag, rng: Rng): StatusBag {
  const buffs = names(bag).filter((n) => STATUS_KIND[n] === "buff");
  if (buffs.length === 0) return bag;
  const chosen = buffs[Math.floor(rng() * buffs.length)];
  return removeStatus(bag, chosen);
}

// --- Battlefield behaviors: status effects over a list of units ---

// The owner's Effect phase: every unit on `side` takes its burn damage (1 per
// stack, as a single blockable instance) and loses one tremors stack. Burn does
// not self-decay. Units the burn kills are pruned.
export function resolveStatusEffectPhase(units: Unit[], side: Side): Unit[] {
  return units
    .map((unit) => {
      if (unit.side !== side || unit.hp <= 0) return unit;
      const burned = applyDamage(unit, statusStacks(unit.statuses, "burn"));
      return { ...burned, statuses: decayStatus(burned.statuses, "tremors") };
    })
    .filter((u) => u.hp > 0);
}

// Tremors retaliation: when a unit carrying tremors is attacked, it deals a flat
// 2 (not scaled by stacks) to every unit on the opposite side. Triggers even if
// the attack dealt no damage; the caller invokes this once per attack instance.
export function resolveTremorsRetaliation(
  units: Unit[],
  attackedId: string,
): Unit[] {
  const owner = units.find((u) => u.id === attackedId);
  if (!owner || statusStacks(owner.statuses, "tremors") <= 0) return units;
  return units
    .map((u) =>
      u.side !== owner.side && u.hp > 0 ? applyDamage(u, TREMORS_DAMAGE) : u,
    )
    .filter((u) => u.hp > 0);
}

// Twinkletoes evade: a 25% chance, rolled per incoming attack, to negate that
// attack's damage entirely. Only the attack phase consults this.
export function rollEvade(defender: Unit, rng: Rng): boolean {
  if (statusStacks(defender.statuses, "twinkletoes") <= 0) return false;
  return rng() < EVADE_CHANCE;
}
