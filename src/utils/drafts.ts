// Drafting offers — the random selections presented to the player. Pure: each
// offer is a function of the current unlock state and an injectable RNG, so the
// caller can persist the rolled offer to the checkpoint and reproduce it on a
// refresh (see issue 08 / ADR-0001).

import { Arcana } from "./cards";
import { Rng, shuffle } from "./deck";
import { DRAFTABLE_ARCANA } from "./pools";

export const ARCANA_DRAFT_SIZE = 3;
export const CARD_DRAFT_SIZE = 3;

// Offer up to 3 not-yet-unlocked arcana; once fewer than 3 remain, offer only
// what is left (and nothing once every arcana is unlocked).
export function arcanaDraftOptions(
  unlocked: Arcana[],
  rng: Rng = Math.random,
): Arcana[] {
  const remaining = DRAFTABLE_ARCANA.filter((a) => !unlocked.includes(a));
  return shuffle(remaining, rng).slice(0, ARCANA_DRAFT_SIZE);
}

// Offer 3 distinct cards from the pool (the whole pool if it holds fewer than
// 3). Distinctness is by position, so a pool listing a card once cannot offer it
// twice in one draft.
export function cardDraftOptions(
  pool: string[],
  rng: Rng = Math.random,
): string[] {
  return shuffle(pool, rng).slice(0, CARD_DRAFT_SIZE);
}
