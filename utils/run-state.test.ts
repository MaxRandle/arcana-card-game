import {
  RUN_STATE_VERSION,
  STARTING_HP,
  createRun,
  ctaLabel,
  serializeRun,
  deserializeRun,
} from "./run-state";

describe("createRun", () => {
  it("starts with an empty deck", () => {
    expect(createRun().deck).toEqual([]);
  });

  it("starts at full starting HP", () => {
    const run = createRun();
    expect(run.hp).toBe(STARTING_HP);
    expect(run.maxHp).toBe(STARTING_HP);
  });

  it("starts at level 1, encounter 1, between encounters", () => {
    const run = createRun();
    expect(run.level).toBe(1);
    expect(run.encounter).toBe(1);
    expect(run.phase).toBe("between-encounters");
  });

  it("starts with no permanent elemental-damage bonus", () => {
    expect(createRun().permanentElementalDamage).toBe(0);
  });
});

describe("ctaLabel", () => {
  it("reads 'Next encounter' between encounters", () => {
    const run = { ...createRun(), phase: "between-encounters" as const };
    expect(ctaLabel(run)).toBe("Next encounter");
  });

  it("reads 'Next level' between levels", () => {
    const run = { ...createRun(), phase: "between-levels" as const };
    expect(ctaLabel(run)).toBe("Next level");
  });
});

describe("serializeRun / deserializeRun", () => {
  it("round-trips a run unchanged", () => {
    const run = createRun();
    expect(deserializeRun(serializeRun(run))).toEqual(run);
  });

  it("tags the serialized payload with the current version", () => {
    expect(JSON.parse(serializeRun(createRun())).version).toBe(
      RUN_STATE_VERSION,
    );
  });

  it("returns null for malformed JSON", () => {
    expect(deserializeRun("not json")).toBeNull();
  });

  it("returns null for a mismatched version", () => {
    const payload = JSON.stringify({ version: RUN_STATE_VERSION + 1 });
    expect(deserializeRun(payload)).toBeNull();
  });

  it("carries the permanent elemental-damage total across a round-trip", () => {
    const run = { ...createRun(), permanentElementalDamage: 3 };
    expect(deserializeRun(serializeRun(run))!.permanentElementalDamage).toBe(3);
  });

  it("returns null when required fields are missing", () => {
    const payload = JSON.stringify({ version: RUN_STATE_VERSION });
    expect(deserializeRun(payload)).toBeNull();
  });
});
