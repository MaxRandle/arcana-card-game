import {
  OPENING_OFFER_SIZE,
  OPENING_KEEP_SIZE,
  openingOffer,
  buildOpeningDeck,
  keepTarget,
  toggleKeep,
} from "./opening-draft";
import { toInstances } from "./cards";

const DECK = [
  "windshear",
  "rock",
  "cinders",
  "zap",
  "splash",
  "tremors",
  "endurance",
];

describe("openingOffer", () => {
  it("offers 5 cards and leaves the rest", () => {
    const { offered, rest } = openingOffer(toInstances(DECK), () => 0);
    expect(offered).toHaveLength(OPENING_OFFER_SIZE);
    expect(rest).toHaveLength(DECK.length - OPENING_OFFER_SIZE);
  });

  it("partitions the deck without dropping or duplicating cards", () => {
    const instances = toInstances(DECK);
    const { offered, rest } = openingOffer(instances, () => 0);
    const ids = [...offered, ...rest].map((c) => c.instanceId).sort();
    expect(ids).toEqual(instances.map((c) => c.instanceId).sort());
  });

  it("offers the whole deck when it holds fewer than 5 cards", () => {
    const instances = toInstances(["windshear", "rock"]);
    const { offered, rest } = openingOffer(instances, () => 0);
    expect(offered).toHaveLength(2);
    expect(rest).toHaveLength(0);
  });
});

describe("keepTarget", () => {
  it("is the keep size for a full offer", () => {
    expect(keepTarget(toInstances(DECK).slice(0, OPENING_OFFER_SIZE))).toBe(
      OPENING_KEEP_SIZE,
    );
  });

  it("is the whole offer when it holds fewer than the keep size", () => {
    expect(keepTarget(toInstances(["windshear", "rock"]))).toBe(2);
  });
});

describe("toggleKeep", () => {
  it("adds an unkept card", () => {
    expect(toggleKeep([], "a", 3)).toEqual(["a"]);
  });

  it("removes an already-kept card", () => {
    expect(toggleKeep(["a", "b"], "a", 3)).toEqual(["b"]);
  });

  it("refuses to add past the target", () => {
    expect(toggleKeep(["a", "b", "c"], "d", 3)).toEqual(["a", "b", "c"]);
  });

  it("still removes when at the target", () => {
    expect(toggleKeep(["a", "b", "c"], "b", 3)).toEqual(["a", "c"]);
  });
});

describe("buildOpeningDeck", () => {
  it("keeps the chosen cards in the opening hand", () => {
    const { offered, rest } = openingOffer(toInstances(DECK), () => 0);
    const kept = offered.slice(0, OPENING_KEEP_SIZE).map((c) => c.instanceId);
    const deck = buildOpeningDeck(offered, rest, kept, () => 0);
    expect(deck.hand.map((c) => c.instanceId).sort()).toEqual([...kept].sort());
  });

  it("shuffles the unkept offered cards and the rest into the draw pile", () => {
    const { offered, rest } = openingOffer(toInstances(DECK), () => 0);
    const kept = offered.slice(0, OPENING_KEEP_SIZE).map((c) => c.instanceId);
    const deck = buildOpeningDeck(offered, rest, kept, () => 0);
    expect(deck.drawPile).toHaveLength(DECK.length - OPENING_KEEP_SIZE);
    expect(deck.discard).toEqual([]);
    expect(deck.inPlay).toBeNull();
  });

  it("places every non-kept card into the draw pile (no losses)", () => {
    const instances = toInstances(DECK);
    const { offered, rest } = openingOffer(instances, () => 0);
    const kept = offered.slice(0, OPENING_KEEP_SIZE).map((c) => c.instanceId);
    const deck = buildOpeningDeck(offered, rest, kept, () => 0);
    const all = [...deck.hand, ...deck.drawPile].map((c) => c.instanceId).sort();
    expect(all).toEqual(instances.map((c) => c.instanceId).sort());
  });
});
