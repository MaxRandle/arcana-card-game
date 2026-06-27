// The effect-resolution engine and the primitive effect vocabulary. Each
// primitive is a small, composable transform over the slice of combat state it
// touches (units, mana, deck). The resolver walks a card's clauses strictly
// left-to-right, each fully before the next, so order-dependent cards (e.g.
// "lose 1 hp; gain 1 mana") behave deterministically. Pure and UI-free.

import { DeckState, Rng, draw } from "./deck";
import { StatusName, Unit, applyDamage } from "./units";
import { triggerHpLossPassives } from "./passives";
import {
  CombatModifiers,
  gainElementalDamage,
  gainManaPerTurn,
} from "./modifiers";
import {
  addStatus,
  removeAllDebuffs,
  removeRandomBuff,
  statusStacks,
} from "./statuses";

// The portion of combat state an effect may read or rewrite. `CombatState`
// satisfies this shape, so the combat engine resolves effects in place.
export interface EffectState {
  units: Unit[];
  mana: number;
  deck: DeckState;
  /** Per-combat cost and ongoing modifiers (ramp, mana/turn, elemental dmg). */
  modifiers: CombatModifiers;
}

// The target chosen when the card was played: a unit id, or null for an
// untargeted card (unit-affecting clauses then default to the arcanist).
export interface EffectContext {
  targetId: string | null;
}

export type Effect =
  // Dealt to the target; block applies and may kill.
  | { kind: "damage"; amount: number }
  // Reduces the target's hp directly; ignores block.
  | { kind: "loseHp"; amount: number }
  // Restores the target's hp, capped at maxHp.
  | { kind: "heal"; amount: number }
  | { kind: "gainBlock"; amount: number }
  | { kind: "gainAttack"; amount: number }
  | { kind: "gainMana"; amount: number }
  | { kind: "draw"; amount: number }
  // Equilibrium: draw one card per distinct arcana in the whole deck.
  | { kind: "drawPerArcana" }
  // Splash: `target` damage to the target, `others` to every other enemy.
  | { kind: "splash"; target: number; others: number }
  // Any-unit cards (e.g. Ebb & flow): branch on the targeted side.
  | { kind: "either"; enemy: Effect[]; player: Effect[] }
  // Add stacks of a buff/debuff to the target.
  | { kind: "applyStatus"; status: StatusName; amount: number }
  // Strip one random buff from the target (Purging flame).
  | { kind: "removeRandomBuff" }
  // Strip every debuff from the target (Tenacity).
  | { kind: "removeAllDebuffs" }
  // Deal `perStack` damage per stack of `status` on the target, leaving the
  // status in place (Humble guide reads Potential without consuming it).
  | { kind: "damagePerStatus"; status: StatusName; perStack: number }
  // Conflagration: each burning enemy seeds 1 burn onto another random enemy.
  | { kind: "seedBurn" }
  // Temporal energy: gain N additional mana on every Mana phase this combat.
  | { kind: "gainManaPerTurn"; amount: number }
  // Spirit energy: raise the elemental damage dealt. `permanent` survives the
  // combat-end reset and persists for the run (the Permanent keyword).
  | { kind: "gainElementalDamage"; amount: number; permanent: boolean };

export function resolveEffects(
  state: EffectState,
  effects: Effect[],
  ctx: EffectContext,
  rng: Rng,
): EffectState {
  let current = state;
  for (const effect of effects) current = resolveEffect(current, effect, ctx, rng);
  return current;
}

export function resolveEffect(
  state: EffectState,
  effect: Effect,
  ctx: EffectContext,
  rng: Rng,
): EffectState {
  switch (effect.kind) {
    case "damage":
      return mapTarget(state, ctx, (u) =>
        applyDamage(u, withElementalBonus(effect.amount, state)),
      );
    case "loseHp":
      return mapTarget(state, ctx, (u) =>
        effect.amount > 0
          ? triggerHpLossPassives({ ...u, hp: Math.max(0, u.hp - effect.amount) })
          : u,
      );
    case "heal":
      return mapTarget(state, ctx, (u) => ({
        ...u,
        hp: Math.min(u.maxHp, u.hp + effect.amount),
      }));
    case "gainBlock":
      return mapTarget(state, ctx, (u) => ({ ...u, blk: u.blk + effect.amount }));
    case "gainAttack":
      return mapTarget(state, ctx, (u) => ({ ...u, atk: u.atk + effect.amount }));
    case "gainMana":
      return { ...state, mana: state.mana + effect.amount };
    case "draw":
      return { ...state, deck: draw(state.deck, effect.amount, rng) };
    case "drawPerArcana":
      return { ...state, deck: draw(state.deck, distinctArcana(state.deck), rng) };
    case "splash":
      return resolveSplash(
        state,
        ctx,
        withElementalBonus(effect.target, state),
        withElementalBonus(effect.others, state),
      );
    case "either": {
      const target = state.units.find((u) => u.id === ctx.targetId);
      if (!target) return state; // target gone — fizzle silently
      const branch = target.side === "enemy" ? effect.enemy : effect.player;
      return resolveEffects(state, branch, ctx, rng);
    }
    case "applyStatus":
      return mapTarget(state, ctx, (u) => ({
        ...u,
        statuses: addStatus(u.statuses, effect.status, effect.amount),
      }));
    case "removeRandomBuff":
      return mapTarget(state, ctx, (u) => ({
        ...u,
        statuses: removeRandomBuff(u.statuses, rng),
      }));
    case "removeAllDebuffs":
      return mapTarget(state, ctx, (u) => ({
        ...u,
        statuses: removeAllDebuffs(u.statuses),
      }));
    case "damagePerStatus":
      return mapTarget(state, ctx, (u) => {
        const base = statusStacks(u.statuses, effect.status) * effect.perStack;
        // No stacks means the card deals no damage — the elemental bonus has
        // nothing to amplify, so it never conjures damage from nothing.
        return base > 0 ? applyDamage(u, withElementalBonus(base, state)) : u;
      });
    case "seedBurn":
      return resolveSeedBurn(state, rng);
    case "gainManaPerTurn":
      return { ...state, modifiers: gainManaPerTurn(state.modifiers, effect.amount) };
    case "gainElementalDamage":
      return {
        ...state,
        modifiers: gainElementalDamage(
          state.modifiers,
          effect.amount,
          effect.permanent,
        ),
      };
  }
}

// Add the combat's elemental-damage bonus to a positive damage amount.
function withElementalBonus(amount: number, state: EffectState): number {
  return amount + state.modifiers.elementalDamage;
}

// Conflagration. Snapshots the burning enemies at cast, then each seeds 1 burn
// onto a different random enemy (chosen from the same snapshot, so a freshly
// seeded enemy is never itself a source and no enemy burns itself).
function resolveSeedBurn(state: EffectState, rng: Rng): EffectState {
  const enemies = state.units.filter((u) => u.side === "enemy" && u.hp > 0);
  const burning = enemies.filter((u) => statusStacks(u.statuses, "burn") > 0);

  const seeds: Record<string, number> = {};
  for (const source of burning) {
    const others = enemies.filter((e) => e.id !== source.id);
    if (others.length === 0) continue;
    const pick = others[Math.floor(rng() * others.length)];
    seeds[pick.id] = (seeds[pick.id] ?? 0) + 1;
  }

  const units = state.units.map((u) =>
    seeds[u.id]
      ? { ...u, statuses: addStatus(u.statuses, "burn", seeds[u.id]) }
      : u,
  );
  return { ...state, units };
}

// Apply a unit transform to the chosen target, then prune any unit it killed. A
// missing or already-dead target fizzles silently (state returned unchanged).
// An untargeted clause acts on the arcanist (self-targeting cards).
function mapTarget(
  state: EffectState,
  ctx: EffectContext,
  transform: (unit: Unit) => Unit,
): EffectState {
  const targetId = ctx.targetId ?? arcanistId(state);
  if (!state.units.some((u) => u.id === targetId && u.hp > 0)) return state;
  const units = state.units
    .map((u) => (u.id === targetId && u.hp > 0 ? transform(u) : u))
    .filter((u) => u.hp > 0);
  return { ...state, units };
}

function resolveSplash(
  state: EffectState,
  ctx: EffectContext,
  toTarget: number,
  toOthers: number,
): EffectState {
  const units = state.units
    .map((u) => {
      if (u.hp <= 0) return u;
      if (u.id === ctx.targetId) return applyDamage(u, toTarget);
      if (u.side === "enemy") return applyDamage(u, toOthers);
      return u;
    })
    .filter((u) => u.hp > 0);
  return { ...state, units };
}

function arcanistId(state: EffectState): string | undefined {
  return state.units.find((u) => u.side === "player")?.id;
}

// Distinct arcana across the whole deck (every pile plus the in-play card),
// excluding Generic, which is not an arcana.
function distinctArcana(deck: DeckState): number {
  const all = [
    ...deck.drawPile,
    ...deck.hand,
    ...deck.discard,
    ...(deck.inPlay ? [deck.inPlay] : []),
  ];
  const arcana = new Set(
    all.map((c) => c.card.arcana).filter((a) => a !== "generic"),
  );
  return arcana.size;
}
