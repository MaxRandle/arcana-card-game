import {
  DRAFTABLE_ARCANA,
  poolFor,
  combinedPool,
} from "./pools";
import { CARD_CATALOG } from "./cards";

describe("DRAFTABLE_ARCANA", () => {
  it("is the five elemental schools, excluding generic", () => {
    expect(DRAFTABLE_ARCANA).toEqual([
      "air",
      "water",
      "earth",
      "fire",
      "lightning",
    ]);
    expect(DRAFTABLE_ARCANA).not.toContain("generic");
  });
});

describe("poolFor", () => {
  it("returns every card of that arcana from the catalog", () => {
    const air = poolFor("air");
    expect(air).toEqual(
      Object.values(CARD_CATALOG)
        .filter((c) => c.arcana === "air")
        .map((c) => c.cardId),
    );
    // Spot-check a couple of known air cards.
    expect(air).toContain("windshear");
    expect(air).toContain("tenacity");
  });

  it("never includes generic cards in an elemental pool", () => {
    for (const arcana of DRAFTABLE_ARCANA) {
      expect(poolFor(arcana)).not.toContain("equilibrium");
    }
  });

  it("gives each draftable arcana a non-empty pool", () => {
    for (const arcana of DRAFTABLE_ARCANA) {
      expect(poolFor(arcana).length).toBeGreaterThanOrEqual(3);
    }
  });
});

describe("combinedPool", () => {
  it("unions the pools of several arcana with no duplicates", () => {
    const combined = combinedPool(["air", "water"]);
    expect(combined).toEqual([...poolFor("air"), ...poolFor("water")]);
    expect(new Set(combined).size).toBe(combined.length);
  });

  it("is empty for no arcana", () => {
    expect(combinedPool([])).toEqual([]);
  });
});
