// Deck pile mechanics — the in-combat partitioning of the Deck into draw pile,
// hand, discard, and the transient in-play card (positions, not separate
// collections). Pure and UI-free: every function returns a new DeckState.

import { Card } from "./cards";

export interface CardInstance {
  /** Unique within a combat, so duplicates move between piles independently. */
  instanceId: string;
  card: Card;
}

export interface DeckState {
  drawPile: CardInstance[];
  hand: CardInstance[];
  discard: CardInstance[];
  /** The card mid-resolution; lands in the discard once its effect resolves. */
  inPlay: CardInstance | null;
}

export const HAND_CAP = 10;

export type Rng = () => number;

// Fisher-Yates. Returns a new array; never mutates the input.
export function shuffle<T>(items: T[], rng: Rng = Math.random): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function createDeckState(
  cards: CardInstance[],
  rng: Rng = Math.random,
): DeckState {
  return { drawPile: shuffle(cards, rng), hand: [], discard: [], inPlay: null };
}

// Draw a single card. A draw against an empty draw pile first reshuffles the
// discard in; if both piles are empty, or the hand is at cap, the draw is
// skipped (the same deck is returned).
export function drawOne(deck: DeckState, rng: Rng = Math.random): DeckState {
  if (deck.hand.length >= HAND_CAP) return deck;

  let drawPile = deck.drawPile;
  let discard = deck.discard;
  if (drawPile.length === 0) {
    if (discard.length === 0) return deck;
    drawPile = shuffle(discard, rng);
    discard = [];
  }

  const [top, ...rest] = drawPile;
  return { ...deck, drawPile: rest, discard, hand: [...deck.hand, top] };
}

// Draw `count` cards, resolving one at a time so each reshuffle/cap check sees
// the result of the previous draw.
export function draw(
  deck: DeckState,
  count: number,
  rng: Rng = Math.random,
): DeckState {
  let current = deck;
  for (let i = 0; i < count; i++) current = drawOne(current, rng);
  return current;
}
