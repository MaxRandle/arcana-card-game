// Passive abilities — effects that trigger on an event irrespective of turn
// phase, unlike actions (which fire on a cycle step). Pure and UI-free: each
// function takes a unit and returns a new one. Kept separate from `units` so
// the damage primitive can fire passives without owning their definitions;
// `units` imports the trigger, this module imports only the `Unit` type back.

import type { Unit } from "./units";

export type PassiveName = "rage";

// Display names for the passive chips in the always-on unit readout.
export const PASSIVE_LABEL: Record<PassiveName, string> = {
  rage: "Rage",
};

// Rules text shown in the passive tooltip, under the display name.
export const PASSIVE_DESCRIPTION: Record<PassiveName, string> = {
  rage: "Gains 1 attack each time it loses hp.",
};

// A passive flattened for the always-on unit readout: its display label and a
// fixed "passive" category (the grey chip). The view maps this onto its chip.
export interface PassiveEntry {
  name: PassiveName;
  label: string;
  description: string;
  kind: "passive";
}

// The unit's passives as an ordered list for the status bar.
export function passiveList(passives: PassiveName[] = []): PassiveEntry[] {
  return passives.map((name) => ({
    name,
    label: PASSIVE_LABEL[name],
    description: PASSIVE_DESCRIPTION[name],
    kind: "passive",
  }));
}

// Fire every on-hp-loss passive the unit carries. Called once per hp-loss
// instance (not per hp point), so a single damage instance grants Rage exactly
// +1 atk however much hp it removed.
export function triggerHpLossPassives(unit: Unit): Unit {
  if (!unit.passives?.includes("rage")) return unit;
  return { ...unit, atk: unit.atk + 1 };
}
