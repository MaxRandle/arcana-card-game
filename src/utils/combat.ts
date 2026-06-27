// Combat engine — the turn loop. Pure and UI-free: every function takes a
// state and returns a new one, so the screen is a thin renderer over this
// module. Deck pile mechanics live in `./deck`; this module orchestrates the
// phases (mana, draw, play, attack) over them.

import { DeckState, CardInstance, Rng, createDeckState, draw } from "./deck";
import { TargetingMode } from "./cards";
import { Side, Unit, applyDamage } from "./units";
import { resolveEffects } from "./effects";
import {
  CombatModifiers,
  applyRamp,
  createModifiers,
  effectiveCost,
} from "./modifiers";
import {
  resolveStatusEffectPhase,
  resolveTremorsRetaliation,
  rollEvade,
} from "./statuses";
import { resolveActionPhase } from "./enemies";

// Re-exported so existing combat consumers keep importing unit primitives from
// here; their canonical home is `./units`.
export type { Side, Unit };
export { applyDamage };

const MANA_START = 1;
const MANA_PER_TURN = 2;
const DRAW_PER_TURN = 1;

export type Outcome = "ongoing" | "win" | "loss";

export interface CombatState {
  units: Unit[];
  /** Whose turn it is when combat is paused awaiting input (the Play phase). */
  turn: Side;
  outcome: Outcome;
  /** Arcanist mana available in the Play phase. Carries across turns, no cap. */
  mana: number;
  deck: DeckState;
  /** Per-combat cost and ongoing modifiers (ramp, mana/turn, elemental dmg). */
  modifiers: CombatModifiers;
}

export function createCombat(
  arcanist: Unit,
  enemies: Unit[],
  deckCards: CardInstance[] = [],
  rng: Rng = Math.random,
  // The run's Permanent elemental-damage total, seeded back in so Permanent
  // bonuses earned in earlier encounters still apply.
  permanentElementalDamage = 0,
): CombatState {
  return beginCombat(
    arcanist,
    enemies,
    createDeckState(deckCards, rng),
    rng,
    permanentElementalDamage,
  );
}

// Begin combat from an already-partitioned DeckState — used by the opening
// draft, which decides the opening hand before combat starts (the rest of the
// deck is the supplied draw pile).
export function beginCombat(
  arcanist: Unit,
  enemies: Unit[],
  deck: DeckState,
  rng: Rng = Math.random,
  permanentElementalDamage = 0,
): CombatState {
  const base: CombatState = {
    units: [arcanist, ...enemies],
    turn: "player",
    outcome: "ongoing",
    mana: MANA_START,
    deck,
    modifiers: createModifiers(permanentElementalDamage),
  };
  // Turn 1 has no statuses to tick (they reset to empty between encounters), so
  // its opening skips the Effect phase and runs only Mana → Draw.
  return manaAndDraw(base, rng);
}

// Run the player turn's opening phases (Effect → Mana → Draw) and pause in the
// Play phase. The Effect phase ticks the arcanist's statuses (burn damage,
// tremors decay) and can end the combat before Mana/Draw run.
function beginPlayerTurn(state: CombatState, rng: Rng): CombatState {
  const units = resolveStatusEffectPhase(state.units, "player");
  const outcome = outcomeOf(units);
  if (outcome !== "ongoing") return { ...state, units, turn: "player", outcome };

  return manaAndDraw({ ...state, units }, rng);
}

// Mana gains MANA_PER_TURN, carrying the prior remainder; Draw draws one card.
// Pauses in the player's Play phase.
function manaAndDraw(state: CombatState, rng: Rng): CombatState {
  return {
    ...state,
    turn: "player",
    mana: state.mana + MANA_PER_TURN + state.modifiers.manaPerTurn,
    deck: draw(state.deck, DRAW_PER_TURN, rng),
  };
}

// Play a card from the hand at a target (a unit id, or null for an untargeted
// card). Blocked (state unchanged) when the card is missing, mana is
// insufficient, or the target breaks the card's targeting mode. The card moves
// to the in-play position while its clauses resolve left-to-right, then to the
// discard — so it cannot be redrawn by its own draw effect.
export function playCard(
  state: CombatState,
  instanceId: string,
  targetId: string | null,
  rng: Rng = Math.random,
): CombatState {
  if (state.outcome !== "ongoing") return state;

  const played = state.deck.hand.find((c) => c.instanceId === instanceId);
  if (!played) return state;
  const cost = effectiveCost(played.card, instanceId, state.modifiers);
  if (state.mana < cost) return state;
  if (!isLegalTarget(played.card.targeting, targetId, state.units)) return state;

  const deckInPlay: DeckState = {
    ...state.deck,
    hand: state.deck.hand.filter((c) => c.instanceId !== instanceId),
    inPlay: played,
  };

  const resolved = resolveEffects(
    {
      units: state.units,
      mana: state.mana,
      deck: deckInPlay,
      modifiers: state.modifiers,
    },
    played.card.effects,
    { targetId },
    rng,
  );

  // Discard only after every clause has resolved.
  const deck: DeckState = {
    ...resolved.deck,
    inPlay: null,
    discard: [...resolved.deck.discard, played],
  };

  return {
    ...state,
    units: resolved.units,
    deck,
    mana: resolved.mana - cost,
    // Ramp this instance after the play, so the next play of this copy costs more.
    modifiers: applyRamp(resolved.modifiers, played.card, instanceId),
    outcome: outcomeOf(resolved.units),
  };
}

// End the Play phase: resolve the player's Attack phase, then the enemy turn
// (Effect → Attack → Action), then hand control back to the player. The enemy
// attacks with its current stats BEFORE its Action resolves, so a stance change
// only affects its next turn. A no-op once combat is already decided.
export function endTurn(
  state: CombatState,
  rng: Rng = Math.random,
): CombatState {
  if (state.outcome !== "ongoing") return state;

  let units = resolveAttacks(state.units, "player", rng);
  if (outcomeOf(units) !== "ongoing") {
    return { ...state, units, turn: "player", outcome: outcomeOf(units) };
  }

  // Enemy turn opens with its Effect phase (burn ticks, tremors decay).
  units = resolveStatusEffectPhase(units, "enemy");
  if (outcomeOf(units) !== "ongoing") {
    return { ...state, units, turn: "enemy", outcome: outcomeOf(units) };
  }

  units = resolveAttacks(units, "enemy", rng);
  if (outcomeOf(units) !== "ongoing") {
    return { ...state, units, turn: "enemy", outcome: outcomeOf(units) };
  }

  // Enemy Action phase: each enemy steps its action cycle (stances, tithe).
  units = resolveActionPhase(units);
  if (outcomeOf(units) !== "ongoing") {
    return { ...state, units, turn: "enemy", outcome: outcomeOf(units) };
  }

  // Hand control back to the player, running their next Mana/Draw phases.
  return beginPlayerTurn({ ...state, units, outcome: "ongoing" }, rng);
}

// Every living unit on the attacking side hits all living opponents for its
// atk. Death is instant and checked after each instance: a unit dropped to 0 hp
// is removed immediately and forfeits any attack it had not yet made. Each
// instance consults the target's statuses: Twinkletoes may evade it (negating
// the damage), and Tremors retaliates whether or not the damage landed — which
// can itself kill the attacker mid-swing.
function resolveAttacks(
  units: Unit[],
  attackingSide: Side,
  rng: Rng,
): Unit[] {
  let current = units;
  const attackerIds = current
    .filter((u) => u.side === attackingSide)
    .map((u) => u.id);

  for (const attackerId of attackerIds) {
    const targetIds = current
      .filter((u) => u.side !== attackingSide && u.hp > 0)
      .map((u) => u.id);

    for (const targetId of targetIds) {
      const attacker = living(current, attackerId);
      if (!attacker) break; // killed (e.g. by Tremors) — forfeit the rest
      if (!living(current, targetId)) continue; // target already gone

      if (!rollEvade(current.find((u) => u.id === targetId)!, rng)) {
        current = current
          .map((u) =>
            u.id === targetId && u.hp > 0 ? applyDamage(u, attacker.atk) : u,
          )
          .filter((u) => u.hp > 0);
      }
      // An attack — evaded or not — still triggers the target's Tremors.
      current = resolveTremorsRetaliation(current, targetId);
    }
  }

  return current;
}

// A card resolves only against a target its targeting mode allows: an
// enemy-only card cannot be dropped on a friendly unit, and an untargeted card
// is played onto the battlefield (no unit, so targetId must be null).
function isLegalTarget(
  targeting: TargetingMode,
  targetId: string | null,
  units: Unit[],
): boolean {
  if (targeting === "untargeted") return targetId === null;
  const target = units.find((u) => u.id === targetId);
  if (!target) return false;
  switch (targeting) {
    case "enemy":
      return target.side === "enemy";
    case "player":
      return target.side === "player";
    case "any":
      return true;
  }
}

function living(units: Unit[], id: string): Unit | undefined {
  return units.find((u) => u.id === id && u.hp > 0);
}

function outcomeOf(units: Unit[]): Outcome {
  const playerAlive = units.some((u) => u.side === "player" && u.hp > 0);
  const enemyAlive = units.some((u) => u.side === "enemy" && u.hp > 0);
  if (!playerAlive) return "loss";
  if (!enemyAlive) return "win";
  return "ongoing";
}
