import {
  createRun,
  pickArcana,
  pickCard,
  resolveEncounterWin,
  resolveEncounterLoss,
  LEVEL_ONE_DRAFTS,
  LATER_LEVEL_DRAFTS,
} from "./progression";
import { ENCOUNTERS_PER_LEVEL } from "./encounters";
import { STARTING_HP, RunState, RunActivity } from "./run-state";

const rng = () => 0;

// Drive a card-draft batch to completion by always picking the first offer.
function pickThroughDrafts(run: RunState): RunState {
  let current = run;
  while (current.activity.kind === "card-draft") {
    current = pickCard(current, current.activity.offer[0], rng);
  }
  return current;
}

describe("createRun", () => {
  it("seeds an empty-but-Equilibrium deck at full HP", () => {
    const run = createRun(rng);
    expect(run.deck).toEqual(["equilibrium"]);
    expect(run.hp).toBe(STARTING_HP);
    expect(run.maxHp).toBe(STARTING_HP);
    expect(run.level).toBe(1);
    expect(run.encounter).toBe(1);
    expect(run.unlockedArcana).toEqual([]);
  });

  it("opens on an arcana draft offering 3", () => {
    const activity = createRun(rng).activity as Extract<
      RunActivity,
      { kind: "arcana-draft" }
    >;
    expect(activity.kind).toBe("arcana-draft");
    expect(activity.offer).toHaveLength(3);
  });
});

describe("pickArcana", () => {
  it("unlocks the picked arcana and starts the level's card drafts", () => {
    const run = pickArcana(createRun(rng), "fire", rng);
    expect(run.unlockedArcana).toEqual(["fire"]);
    const activity = run.activity as Extract<RunActivity, { kind: "card-draft" }>;
    expect(activity.kind).toBe("card-draft");
    expect(activity.remaining).toBe(LEVEL_ONE_DRAFTS);
    expect(activity.pool).toEqual(["fire"]);
    expect(activity.next).toBe("encounter");
    // The offer is drawn from the picked arcana's pool only.
    expect(activity.offer.length).toBeGreaterThan(0);
  });

  it("grants 6 drafts on level 1 and 3 on later levels", () => {
    expect(LEVEL_ONE_DRAFTS).toBe(6);
    expect(LATER_LEVEL_DRAFTS).toBe(3);
  });
});

describe("pickCard during the level draft batch", () => {
  it("adds the card and counts the batch down", () => {
    const run = pickArcana(createRun(rng), "fire", rng);
    const after = pickCard(run, run.activity.kind === "card-draft" ? run.activity.offer[0] : "", rng);
    expect(after.deck).toContain("equilibrium");
    expect(after.deck.length).toBe(2);
    const activity = after.activity as Extract<RunActivity, { kind: "card-draft" }>;
    expect(activity.remaining).toBe(LEVEL_ONE_DRAFTS - 1);
  });

  it("ends the batch on an encounter after all level drafts", () => {
    const run = pickThroughDrafts(pickArcana(createRun(rng), "fire", rng));
    expect(run.activity.kind).toBe("encounter");
    // 1 Equilibrium + 6 drafted cards.
    expect(run.deck.length).toBe(1 + LEVEL_ONE_DRAFTS);
  });
});

describe("post-encounter reward draft", () => {
  function reachFirstEncounter(): RunState {
    return pickThroughDrafts(pickArcana(createRun(rng), "fire", rng));
  }

  it("awards a reward draft from all unlocked pools on a win", () => {
    const run = resolveEncounterWin(
      reachFirstEncounter(),
      { hp: 80, permanentElementalDamage: 2 },
      rng,
    );
    expect(run.hp).toBe(80);
    expect(run.permanentElementalDamage).toBe(2);
    const activity = run.activity as Extract<RunActivity, { kind: "card-draft" }>;
    expect(activity.kind).toBe("card-draft");
    expect(activity.remaining).toBe(1);
    expect(activity.next).toBe("advance");
    expect(activity.pool).toEqual(["fire"]);
  });

  it("advances to the next encounter after the reward pick", () => {
    let run = resolveEncounterWin(
      reachFirstEncounter(),
      { hp: 80, permanentElementalDamage: 0 },
      rng,
    );
    run = pickCard(run, (run.activity as { offer: string[] }).offer[0], rng);
    expect(run.activity.kind).toBe("encounter");
    expect(run.encounter).toBe(2);
    expect(run.level).toBe(1);
  });
});

describe("level completion & run end", () => {
  // Win every encounter of level 1, taking the first reward each time.
  function clearLevelOne(startHp: number): RunState {
    let run = pickThroughDrafts(pickArcana(createRun(rng), "fire", rng));
    for (let e = 0; e < ENCOUNTERS_PER_LEVEL; e++) {
      run = resolveEncounterWin(run, { hp: startHp, permanentElementalDamage: 0 }, rng);
      run = pickCard(run, (run.activity as { offer: string[] }).offer[0], rng);
    }
    return run;
  }

  it("heals 50% of max HP on completing a level and wins the run", () => {
    const run = clearLevelOne(40);
    // Only level 1 exists, so clearing it wins; the heal still applies.
    expect(run.activity.kind).toBe("won");
    expect(run.hp).toBe(40 + Math.floor(STARTING_HP / 2));
  });

  it("never heals above max HP", () => {
    const run = clearLevelOne(90);
    expect(run.hp).toBe(STARTING_HP);
  });
});

describe("resolveEncounterLoss", () => {
  it("ends the run as lost", () => {
    const run = resolveEncounterLoss(createRun(rng));
    expect(run.activity.kind).toBe("lost");
  });
});
