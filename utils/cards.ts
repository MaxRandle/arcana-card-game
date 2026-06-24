// Card definitions and the debug deck. Pure reference data: a Card describes a
// playable card's static identity (title, cost, targeting, and — for this slice
// — a single damage effect). Richer effect vocabulary arrives in slice 04.

import { CardInstance } from "./deck";

export type TargetingMode = "untargeted" | "enemy" | "player" | "any";

export interface Card {
  cardId: string;
  title: string;
  /** Mana spent to play the card. */
  cost: number;
  /** Rules text shown in the card body. */
  body: string;
  targeting: TargetingMode;
  /** Damage dealt to the chosen target on play. The only effect this slice supports. */
  damage: number;
}

export const CARD_CATALOG: Record<string, Card> = {
  windshear: {
    cardId: "windshear",
    title: "Windshear",
    cost: 1,
    body: "Deal 3 damage.",
    targeting: "enemy",
    damage: 3,
  },
};

export function cardOf(cardId: string): Card {
  const card = CARD_CATALOG[cardId];
  if (!card) throw new Error(`Unknown card: ${cardId}`);
  return card;
}

// A fixed deck seeded into combat so the card-play loop is demoable in
// isolation. Stays in permanently as a dev-only testing harness; real drafting
// arrives in slice 08.
export const DEBUG_DECK: string[] = [
  "windshear",
  "windshear",
  "windshear",
  "windshear",
  "windshear",
  "windshear",
  "windshear",
  "windshear",
];

// Build unique card instances from a list of card ids, so a deck may hold
// duplicates that move between piles independently.
export function toInstances(cardIds: string[]): CardInstance[] {
  return cardIds.map((cardId, i) => ({
    instanceId: `${cardId}-${i}`,
    card: cardOf(cardId),
  }));
}
