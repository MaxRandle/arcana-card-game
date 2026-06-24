// Combat engine — the turn loop. Pure and UI-free: every function takes a
// state and returns a new one, so the screen is a thin renderer over this
// module. Deck pile mechanics live in `./deck`; this module orchestrates the
// phases (mana, draw, play, attack) over them.

import { DeckState, CardInstance, Rng, createDeckState, draw } from "./deck";
import { TargetingMode } from "./cards";

export type Side = "player" | "enemy";

const MANA_START = 1;
const MANA_PER_TURN = 2;
const DRAW_PER_TURN = 1;

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
}

export type Outcome = "ongoing" | "win" | "loss";

export interface CombatState {
  units: Unit[];
  /** Whose turn it is when combat is paused awaiting input (the Play phase). */
  turn: Side;
  outcome: Outcome;
  /** Arcanist mana available in the Play phase. Carries across turns, no cap. */
  mana: number;
  deck: DeckState;
}

// Reduce a unit's hp by one damage instance. Block is subtracted per instance
// and can go negative (increasing damage); net damage never heals, and hp
// never drops below 0.
export function applyDamage(unit: Unit, amount: number): Unit {
  const net = Math.max(0, amount - unit.blk);
  return { ...unit, hp: Math.max(0, unit.hp - net) };
}

export function createCombat(
  arcanist: Unit,
  enemies: Unit[],
  deckCards: CardInstance[] = [],
  rng: Rng = Math.random,
): CombatState {
  const base: CombatState = {
    units: [arcanist, ...enemies],
    turn: "player",
    outcome: "ongoing",
    mana: MANA_START,
    deck: createDeckState(deckCards, rng),
  };
  // Open turn 1 by running its Effect → Mana → Draw, landing in the Play phase.
  return beginPlayerTurn(base, rng);
}

// Run the player turn's opening phases (Effect → Mana → Draw) and pause in the
// Play phase. Effect is a no-op this slice. Mana gains MANA_PER_TURN, carrying
// the prior remainder; Draw draws one card.
function beginPlayerTurn(state: CombatState, rng: Rng): CombatState {
  return {
    ...state,
    turn: "player",
    mana: state.mana + MANA_PER_TURN,
    deck: draw(state.deck, DRAW_PER_TURN, rng),
  };
}

// Play a card from the hand at a target unit. Blocked (state unchanged) when
// the card is missing or mana is insufficient. The card moves through the
// in-play position while its effect resolves, then to the discard.
export function playCard(
  state: CombatState,
  instanceId: string,
  targetId: string,
): CombatState {
  if (state.outcome !== "ongoing") return state;

  const played = state.deck.hand.find((c) => c.instanceId === instanceId);
  if (!played || state.mana < played.card.cost) return state;

  const target = state.units.find((u) => u.id === targetId);
  if (!isLegalTarget(played.card.targeting, target)) return state;

  const deckInPlay: DeckState = {
    ...state.deck,
    hand: state.deck.hand.filter((c) => c.instanceId !== instanceId),
    inPlay: played,
  };

  // Resolve the effect: deal the card's damage to the living target, then prune
  // the dead. A target already gone fizzles silently.
  let units = state.units;
  if (units.some((u) => u.id === targetId && u.hp > 0)) {
    units = units
      .map((u) =>
        u.id === targetId && u.hp > 0 ? applyDamage(u, played.card.damage) : u,
      )
      .filter((u) => u.hp > 0);
  }

  // Discard only after resolution.
  const deck: DeckState = {
    ...deckInPlay,
    inPlay: null,
    discard: [...deckInPlay.discard, played],
  };

  return {
    ...state,
    units,
    deck,
    mana: state.mana - played.card.cost,
    outcome: outcomeOf(units),
  };
}

// End the Play phase: resolve the player's Attack phase, then the enemy turn
// (Effect → Attack → Action; only Attack does work here), then hand control
// back to the player. A no-op once combat is already decided.
export function endTurn(
  state: CombatState,
  rng: Rng = Math.random,
): CombatState {
  if (state.outcome !== "ongoing") return state;

  let units = resolveAttacks(state.units, "player");
  if (outcomeOf(units) !== "ongoing") {
    return { ...state, units, turn: "player", outcome: outcomeOf(units) };
  }

  units = resolveAttacks(units, "enemy");
  if (outcomeOf(units) !== "ongoing") {
    return { ...state, units, turn: "enemy", outcome: outcomeOf(units) };
  }

  // Hand control back to the player, running their next Mana/Draw phases.
  return beginPlayerTurn({ ...state, units, outcome: "ongoing" }, rng);
}

// Every living unit on the attacking side hits all living opponents for its
// atk. Death is instant and checked after each instance: a unit dropped to 0
// hp is removed immediately and forfeits any attack it had not yet made.
function resolveAttacks(units: Unit[], attackingSide: Side): Unit[] {
  let current = units;
  const attackerIds = current
    .filter((u) => u.side === attackingSide)
    .map((u) => u.id);

  for (const attackerId of attackerIds) {
    const attacker = living(current, attackerId);
    if (!attacker) continue; // killed before it could act — attack forfeited

    const targetIds = current
      .filter((u) => u.side !== attackingSide && u.hp > 0)
      .map((u) => u.id);

    for (const targetId of targetIds) {
      current = current.map((u) =>
        u.id === targetId && u.hp > 0 ? applyDamage(u, attacker.atk) : u,
      );
      current = current.filter((u) => u.hp > 0);
    }
  }

  return current;
}

// A card resolves only against a unit its targeting mode allows, so an
// enemy-only card cannot be dropped on a friendly unit. (Untargeted cards take
// no unit and arrive in a later slice.)
function isLegalTarget(
  targeting: TargetingMode,
  target: Unit | undefined,
): boolean {
  if (!target) return false;
  switch (targeting) {
    case "enemy":
      return target.side === "enemy";
    case "player":
      return target.side === "player";
    case "any":
      return true;
    case "untargeted":
      return false;
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
