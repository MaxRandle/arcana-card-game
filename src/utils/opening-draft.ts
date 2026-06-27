// The opening draft — at combat start the player is shown 5 cards from the deck
// and keeps 3; the unkept 2 return to the deck and the remainder is shuffled
// into the draw pile (design/test-scenarios/combat.md). Pure: the offer and the
// resulting DeckState are functions of the deck and an injectable RNG.

import { CardInstance, DeckState, Rng, shuffle } from "./deck";

export const OPENING_OFFER_SIZE = 5;
export const OPENING_KEEP_SIZE = 3;

// How many cards the player keeps from this offer — the keep size, or the whole
// offer if it holds fewer.
export function keepTarget(offered: CardInstance[]): number {
  return Math.min(OPENING_KEEP_SIZE, offered.length);
}

// Toggle a card in/out of the keep selection: remove it if already kept,
// otherwise add it unless the keep target is already met (the cap holds).
export function toggleKeep(
  selected: string[],
  instanceId: string,
  target: number,
): string[] {
  if (selected.includes(instanceId)) {
    return selected.filter((id) => id !== instanceId);
  }
  return selected.length >= target ? selected : [...selected, instanceId];
}

// Split the deck into the 5 offered cards (the whole deck if it holds fewer) and
// the rest, which sit aside until the keep choice shuffles them into the draw.
export function openingOffer(
  cards: CardInstance[],
  rng: Rng = Math.random,
): { offered: CardInstance[]; rest: CardInstance[] } {
  const shuffled = shuffle(cards, rng);
  return {
    offered: shuffled.slice(0, OPENING_OFFER_SIZE),
    rest: shuffled.slice(OPENING_OFFER_SIZE),
  };
}

// Build the combat-start DeckState: the kept offered cards form the opening
// hand; every other card (unkept offers plus the rest) is shuffled into the
// draw pile.
export function buildOpeningDeck(
  offered: CardInstance[],
  rest: CardInstance[],
  keptIds: string[],
  rng: Rng = Math.random,
): DeckState {
  const kept = new Set(keptIds);
  const hand = offered.filter((c) => kept.has(c.instanceId));
  const unkept = offered.filter((c) => !kept.has(c.instanceId));
  return {
    hand,
    drawPile: shuffle([...unkept, ...rest], rng),
    discard: [],
    inPlay: null,
  };
}
