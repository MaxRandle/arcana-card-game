import {
  ARCANA_DRAFT_SIZE,
  CARD_DRAFT_SIZE,
  arcanaDraftOptions,
  cardDraftOptions,
} from "./drafts";
import { DRAFTABLE_ARCANA } from "./pools";
import { Arcana } from "./cards";

// A deterministic RNG cycling through fixed values so selections are stable.
function seq(values: number[]) {
  let i = 0;
  return () => values[i++ % values.length];
}

describe("arcanaDraftOptions", () => {
  it("offers 3 arcana when nothing is unlocked", () => {
    const offer = arcanaDraftOptions([], () => 0);
    expect(offer).toHaveLength(ARCANA_DRAFT_SIZE);
  });

  it("never offers an already-unlocked arcana", () => {
    const offer = arcanaDraftOptions(
      ["air", "water"] as Arcana[],
      seq([0.1, 0.5, 0.9]),
    );
    expect(offer).not.toContain("air");
    expect(offer).not.toContain("water");
  });

  it("offers only what remains when fewer than 3 are unpicked", () => {
    const unlocked: Arcana[] = ["air", "water", "earth"];
    const offer = arcanaDraftOptions(unlocked, () => 0);
    expect(offer).toHaveLength(2);
    expect(offer.sort()).toEqual(["fire", "lightning"]);
  });

  it("offers nothing once all arcana are unlocked", () => {
    expect(arcanaDraftOptions([...DRAFTABLE_ARCANA], () => 0)).toEqual([]);
  });

  it("only ever offers draftable arcana", () => {
    const offer = arcanaDraftOptions([], seq([0.2, 0.7, 0.4]));
    for (const arcana of offer) expect(DRAFTABLE_ARCANA).toContain(arcana);
  });
});

describe("cardDraftOptions", () => {
  const pool = ["a", "b", "c", "d", "e"];

  it("offers 3 cards", () => {
    expect(cardDraftOptions(pool, () => 0)).toHaveLength(CARD_DRAFT_SIZE);
  });

  it("has no duplicate within a single draft", () => {
    const offer = cardDraftOptions(pool, seq([0.1, 0.9, 0.5, 0.3]));
    expect(new Set(offer).size).toBe(offer.length);
  });

  it("only offers cards from the pool", () => {
    const offer = cardDraftOptions(pool, seq([0.8, 0.2, 0.6]));
    for (const card of offer) expect(pool).toContain(card);
  });

  it("offers the whole pool when it has fewer than 3 cards", () => {
    expect(cardDraftOptions(["x", "y"], () => 0).sort()).toEqual(["x", "y"]);
  });
});
