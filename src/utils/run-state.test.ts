import {
  RUN_STATE_VERSION,
  RunState,
  ctaLabel,
  serializeRun,
  deserializeRun,
} from "./run-state";
import { createRun } from "./progression";

const rng = () => 0;

describe("ctaLabel", () => {
  it("reads 'Next encounter' on a level's encounters", () => {
    const run: RunState = { ...createRun(rng), level: 1, encounter: 1 };
    expect(ctaLabel(run)).toBe("Next encounter");
  });

  it("reads 'Next level' on a fresh level's first encounter", () => {
    const run: RunState = { ...createRun(rng), level: 2, encounter: 1 };
    expect(ctaLabel(run)).toBe("Next level");
  });
});

describe("serializeRun / deserializeRun", () => {
  it("round-trips a run unchanged", () => {
    const run = createRun(rng);
    expect(deserializeRun(serializeRun(run))).toEqual(run);
  });

  it("round-trips a card-draft activity unchanged", () => {
    const run: RunState = {
      ...createRun(rng),
      unlockedArcana: ["fire"],
      activity: {
        kind: "card-draft",
        offer: ["cinders", "rock"],
        pool: ["fire"],
        remaining: 3,
        next: "advance",
      },
    };
    expect(deserializeRun(serializeRun(run))).toEqual(run);
  });

  it("tags the serialized payload with the current version", () => {
    expect(JSON.parse(serializeRun(createRun(rng))).version).toBe(
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
    const run = { ...createRun(rng), permanentElementalDamage: 3 };
    expect(deserializeRun(serializeRun(run))!.permanentElementalDamage).toBe(3);
  });

  it("returns null when required fields are missing", () => {
    const payload = JSON.stringify({ version: RUN_STATE_VERSION });
    expect(deserializeRun(payload)).toBeNull();
  });

  it("returns null for an unknown activity kind", () => {
    const run = { ...createRun(rng), activity: { kind: "bogus" } };
    const payload = JSON.stringify({ version: RUN_STATE_VERSION, ...run });
    expect(deserializeRun(payload)).toBeNull();
  });
});
