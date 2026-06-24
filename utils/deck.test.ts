import {
  CardInstance,
  DeckState,
  HAND_CAP,
  createDeckState,
  draw,
  drawOne,
  shuffle,
} from "./deck";
import { Card } from "./cards";

const card: Card = {
  cardId: "windshear",
  title: "Windshear",
  cost: 1,
  body: "Deal 3 damage.",
  targeting: "enemy",
  damage: 3,
};

function instances(n: number): CardInstance[] {
  return Array.from({ length: n }, (_, i) => ({
    instanceId: `c${i}`,
    card,
  }));
}

// A deterministic rng that always picks the last remaining element, so
// Fisher-Yates leaves the array unchanged — keeps pile order predictable.
const noShuffle = () => 0.999999;

describe("shuffle", () => {
  it("keeps every element (a permutation)", () => {
    const items = [1, 2, 3, 4, 5];
    const result = shuffle(items, () => 0.5);
    expect([...result].sort()).toEqual(items);
  });

  it("does not mutate the input", () => {
    const items = [1, 2, 3];
    shuffle(items, () => 0.5);
    expect(items).toEqual([1, 2, 3]);
  });
});

describe("createDeckState", () => {
  it("puts all cards in the draw pile with empty hand, discard and no in-play", () => {
    const deck = createDeckState(instances(3), noShuffle);
    expect(deck.drawPile).toHaveLength(3);
    expect(deck.hand).toEqual([]);
    expect(deck.discard).toEqual([]);
    expect(deck.inPlay).toBeNull();
  });
});

describe("drawOne", () => {
  it("moves the top card from the draw pile to the hand", () => {
    const deck = createDeckState(instances(3), noShuffle);
    const next = drawOne(deck, noShuffle);
    expect(next.hand).toHaveLength(1);
    expect(next.drawPile).toHaveLength(2);
  });

  it("skips the draw when the hand is at cap", () => {
    const deck: DeckState = {
      drawPile: instances(1),
      hand: instances(HAND_CAP),
      discard: [],
      inPlay: null,
    };
    expect(drawOne(deck, noShuffle)).toBe(deck);
  });

  it("reshuffles the discard into an empty draw pile, then draws", () => {
    const deck: DeckState = {
      drawPile: [],
      hand: [],
      discard: instances(2),
      inPlay: null,
    };
    const next = drawOne(deck, noShuffle);
    expect(next.hand).toHaveLength(1);
    expect(next.drawPile).toHaveLength(1);
    expect(next.discard).toEqual([]);
  });

  it("skips the draw when both draw pile and discard are empty", () => {
    const deck: DeckState = {
      drawPile: [],
      hand: [],
      discard: [],
      inPlay: null,
    };
    expect(drawOne(deck, noShuffle)).toBe(deck);
  });

  it("does not mutate the input deck", () => {
    const deck = createDeckState(instances(2), noShuffle);
    const snapshot = JSON.parse(JSON.stringify(deck));
    drawOne(deck, noShuffle);
    expect(deck).toEqual(snapshot);
  });
});

describe("draw", () => {
  it("draws cards one at a time", () => {
    const deck = createDeckState(instances(5), noShuffle);
    const next = draw(deck, 3, noShuffle);
    expect(next.hand).toHaveLength(3);
    expect(next.drawPile).toHaveLength(2);
  });

  it("stops at the hand cap", () => {
    const deck = createDeckState(instances(12), noShuffle);
    const next = draw(deck, 12, noShuffle);
    expect(next.hand).toHaveLength(HAND_CAP);
  });
});
