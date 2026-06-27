// Run progression — the state machine that ties combat to deck-building. Pure
// transitions over RunState: each returns the next checkpoint the caller
// persists (ADR-0001). The flow per level is:
//
//   arcana draft -> N card drafts (that arcana) -> [encounter -> reward draft] x4
//
// Completing a level heals 50% max HP; clearing the last level wins the run,
// arcanist death ends it.

import { Arcana } from "./cards";
import { Rng } from "./deck";
import { RunState, STARTING_HP } from "./run-state";
import { arcanaDraftOptions, cardDraftOptions } from "./drafts";
import { combinedPool, poolFor } from "./pools";
import { ENCOUNTERS_PER_LEVEL, TOTAL_LEVELS } from "./encounters";

export const LEVEL_ONE_DRAFTS = 6;
export const LATER_LEVEL_DRAFTS = 3;

function draftsForLevel(level: number): number {
  return level === 1 ? LEVEL_ONE_DRAFTS : LATER_LEVEL_DRAFTS;
}

// A new run: an empty deck seeded with one Equilibrium, opening on the first
// arcana draft.
export function createRun(rng: Rng = Math.random): RunState {
  return {
    deck: ["equilibrium"],
    hp: STARTING_HP,
    maxHp: STARTING_HP,
    level: 1,
    encounter: 1,
    unlockedArcana: [],
    permanentElementalDamage: 0,
    activity: { kind: "arcana-draft", offer: arcanaDraftOptions([], rng) },
  };
}

// Pick an arcana: unlock its pool and begin the level's card-draft batch from
// that pool.
export function pickArcana(
  run: RunState,
  arcana: Arcana,
  rng: Rng = Math.random,
): RunState {
  const unlockedArcana = [...run.unlockedArcana, arcana];
  return {
    ...run,
    unlockedArcana,
    activity: {
      kind: "card-draft",
      offer: cardDraftOptions(poolFor(arcana), rng),
      pool: [arcana],
      remaining: draftsForLevel(run.level),
      next: "encounter",
    },
  };
}

// Pick a card into the deck, then either roll the next offer in the batch or, on
// the batch's last pick, hand off to what comes next (the level's encounters, or
// advancing past a cleared encounter).
export function pickCard(
  run: RunState,
  cardId: string,
  rng: Rng = Math.random,
): RunState {
  if (run.activity.kind !== "card-draft") return run;
  const { pool, next } = run.activity;
  const deck = [...run.deck, cardId];
  const remaining = run.activity.remaining - 1;

  if (remaining > 0) {
    return {
      ...run,
      deck,
      activity: {
        ...run.activity,
        offer: cardDraftOptions(combinedPool(pool), rng),
        remaining,
      },
    };
  }

  const drafted = { ...run, deck };
  return next === "encounter"
    ? { ...drafted, activity: { kind: "encounter" } }
    : advance(drafted, rng);
}

// A won encounter: record the carried HP and Permanent total, then award a
// reward card draft from every unlocked pool.
export function resolveEncounterWin(
  run: RunState,
  result: { hp: number; permanentElementalDamage: number },
  rng: Rng = Math.random,
): RunState {
  return {
    ...run,
    hp: result.hp,
    permanentElementalDamage: result.permanentElementalDamage,
    activity: {
      kind: "card-draft",
      offer: cardDraftOptions(combinedPool(run.unlockedArcana), rng),
      pool: [...run.unlockedArcana],
      remaining: 1,
      next: "advance",
    },
  };
}

// Arcanist death ends the run.
export function resolveEncounterLoss(run: RunState): RunState {
  return { ...run, activity: { kind: "lost" } };
}

// Move past a just-cleared encounter (called once its reward draft is taken):
// step to the next encounter, or — on clearing the level's last encounter —
// heal 50% max HP and either start the next level's arcana draft or win the run.
function advance(run: RunState, rng: Rng): RunState {
  if (run.encounter < ENCOUNTERS_PER_LEVEL) {
    return {
      ...run,
      encounter: run.encounter + 1,
      activity: { kind: "encounter" },
    };
  }

  const hp = Math.min(run.maxHp, run.hp + Math.floor(run.maxHp / 2));
  if (run.level < TOTAL_LEVELS) {
    return {
      ...run,
      hp,
      level: run.level + 1,
      encounter: 1,
      activity: {
        kind: "arcana-draft",
        offer: arcanaDraftOptions(run.unlockedArcana, rng),
      },
    };
  }
  return { ...run, hp, activity: { kind: "won" } };
}
