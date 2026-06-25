// Card definitions and the debug deck. Pure reference data: a Card describes a
// playable card's static identity — title, cost, arcana, targeting, and the
// list of effect clauses it resolves left-to-right when played. The effect
// vocabulary lives in `./effects`.

import { CardInstance } from "./deck";
import { Effect } from "./effects";

export type TargetingMode = "untargeted" | "enemy" | "player" | "any";

// An elemental school. Generic is not an arcana (it never counts toward
// Equilibrium), but is modelled here so every card carries exactly one value.
export type Arcana =
  | "air"
  | "water"
  | "earth"
  | "fire"
  | "lightning"
  | "generic";

export interface Card {
  cardId: string;
  title: string;
  /** Mana spent to play the card. */
  cost: number;
  /** Rules text shown in the card body. */
  body: string;
  arcana: Arcana;
  targeting: TargetingMode;
  /** Clauses resolved strictly left-to-right when the card is played. */
  effects: Effect[];
}

export const CARD_CATALOG: Record<string, Card> = {
  windshear: {
    cardId: "windshear",
    title: "Windshear",
    cost: 1,
    body: "Deal 3 damage.",
    arcana: "air",
    targeting: "enemy",
    effects: [{ kind: "damage", amount: 3 }],
  },
  rock: {
    cardId: "rock",
    title: "Rock",
    cost: 1,
    body: "Deal 3 damage.",
    arcana: "earth",
    targeting: "enemy",
    effects: [{ kind: "damage", amount: 3 }],
  },
  "purging-flame": {
    cardId: "purging-flame",
    title: "Purging flame",
    cost: 1,
    body: "Deal 3 damage; remove 1 random buff from the target.",
    arcana: "fire",
    targeting: "enemy",
    effects: [{ kind: "damage", amount: 3 }, { kind: "removeRandomBuff" }],
  },
  cinders: {
    cardId: "cinders",
    title: "Cinders",
    cost: 1,
    body: "Inflict 1 stack of burn.",
    arcana: "fire",
    targeting: "enemy",
    effects: [{ kind: "applyStatus", status: "burn", amount: 1 }],
  },
  conflagration: {
    cardId: "conflagration",
    title: "Conflagration",
    cost: 2,
    body: "Each burning enemy seeds another random enemy with 1 stack of burn.",
    arcana: "fire",
    targeting: "untargeted",
    effects: [{ kind: "seedBurn" }],
  },
  twinkletoes: {
    cardId: "twinkletoes",
    title: "Twinkletoes",
    cost: 3,
    body: "Gain the Twinkletoes buff.",
    arcana: "air",
    targeting: "player",
    effects: [{ kind: "applyStatus", status: "twinkletoes", amount: 1 }],
  },
  tenacity: {
    cardId: "tenacity",
    title: "Tenacity",
    cost: 1,
    body: "Remove all debuffs.",
    arcana: "air",
    targeting: "player",
    effects: [{ kind: "removeAllDebuffs" }],
  },
  tremors: {
    cardId: "tremors",
    title: "Tremors",
    cost: 2,
    body: "Gain 1 stack of Tremors.",
    arcana: "earth",
    targeting: "player",
    effects: [{ kind: "applyStatus", status: "tremors", amount: 1 }],
  },
  zap: {
    cardId: "zap",
    title: "Zap",
    cost: 1,
    body: "Deal 3 damage; apply 1 potential.",
    arcana: "lightning",
    targeting: "enemy",
    effects: [
      { kind: "damage", amount: 3 },
      { kind: "applyStatus", status: "potential", amount: 1 },
    ],
  },
  "humble-guide": {
    cardId: "humble-guide",
    title: "Humble guide",
    cost: 2,
    body: "Deal 1 damage for each potential on the target.",
    arcana: "lightning",
    targeting: "enemy",
    effects: [{ kind: "damagePerStatus", status: "potential", perStack: 1 }],
  },
  splash: {
    cardId: "splash",
    title: "Splash",
    cost: 2,
    body: "Deal 4 damage to the target, deal 2 damage to all other enemies.",
    arcana: "water",
    targeting: "enemy",
    effects: [{ kind: "splash", target: 4, others: 2 }],
  },
  "ebb-and-flow": {
    cardId: "ebb-and-flow",
    title: "Ebb & flow",
    cost: 1,
    body: "Deal 3 damage to an enemy, or heal 3 hp to your arcanist.",
    arcana: "water",
    targeting: "any",
    effects: [
      {
        kind: "either",
        enemy: [{ kind: "damage", amount: 3 }],
        player: [{ kind: "heal", amount: 3 }],
      },
    ],
  },
  "vital-energy": {
    cardId: "vital-energy",
    title: "Vital energy",
    cost: 0,
    body: "Lose 1 hp; gain 1 mana.",
    arcana: "fire",
    targeting: "untargeted",
    effects: [
      { kind: "loseHp", amount: 1 },
      { kind: "gainMana", amount: 1 },
    ],
  },
  "physical-energy": {
    cardId: "physical-energy",
    title: "Physical energy",
    cost: 2,
    body: "Gain 1 attack.",
    arcana: "earth",
    targeting: "untargeted",
    effects: [{ kind: "gainAttack", amount: 1 }],
  },
  "mental-energy": {
    cardId: "mental-energy",
    title: "Mental energy",
    cost: 1,
    body: "Draw 2 cards.",
    arcana: "lightning",
    targeting: "untargeted",
    effects: [{ kind: "draw", amount: 2 }],
  },
  equilibrium: {
    cardId: "equilibrium",
    title: "Equilibrium",
    cost: 1,
    body: "Draw one card per unique arcana you have.",
    arcana: "generic",
    targeting: "untargeted",
    effects: [{ kind: "drawPerArcana" }],
  },
};

export function cardOf(cardId: string): Card {
  const card = CARD_CATALOG[cardId];
  if (!card) throw new Error(`Unknown card: ${cardId}`);
  return card;
}

// A fixed deck seeded into combat so the card-play loop is demoable in
// isolation. Stays in permanently as a dev-only testing harness; real drafting
// arrives in slice 08. Spans every arcana so Equilibrium has work to do.
export const DEBUG_DECK: string[] = [
  "windshear",
  "rock",
  "purging-flame",
  "splash",
  "ebb-and-flow",
  "vital-energy",
  "physical-energy",
  "mental-energy",
  "equilibrium",
  "cinders",
  "conflagration",
  "twinkletoes",
  "tenacity",
  "tremors",
  "zap",
  "humble-guide",
];

// Build unique card instances from a list of card ids, so a deck may hold
// duplicates that move between piles independently.
export function toInstances(cardIds: string[]): CardInstance[] {
  return cardIds.map((cardId, i) => ({
    instanceId: `${cardId}-${i}`,
    card: cardOf(cardId),
  }));
}
