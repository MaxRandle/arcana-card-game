// Arcana card pools — the draftable card ids grouped by elemental school.
// Derived from the catalog so a new card joins its pool automatically; Generic
// is never a draftable pool (its cards, e.g. Equilibrium, are seeded, not
// drafted — see issue 08).

import { Arcana, CARD_CATALOG } from "./cards";

// The five elemental schools, in canonical order. Generic is excluded.
export const DRAFTABLE_ARCANA: Arcana[] = [
  "air",
  "water",
  "earth",
  "fire",
  "lightning",
];

// Card ids belonging to a single arcana, in catalog order.
export function poolFor(arcana: Arcana): string[] {
  return Object.values(CARD_CATALOG)
    .filter((card) => card.arcana === arcana)
    .map((card) => card.cardId);
}

// The deduplicated union of several arcana pools (catalog cards never repeat
// across elemental pools, so this is a simple concatenation of distinct pools).
export function combinedPool(arcanas: Arcana[]): string[] {
  return arcanas.flatMap(poolFor);
}
