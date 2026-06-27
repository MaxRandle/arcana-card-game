import {
  ENCOUNTERS_PER_LEVEL,
  TOTAL_LEVELS,
  makeEncounter,
} from "./encounters";

describe("level structure", () => {
  it("has 4 encounters per level", () => {
    expect(ENCOUNTERS_PER_LEVEL).toBe(4);
  });

  it("defines at least one level", () => {
    expect(TOTAL_LEVELS).toBeGreaterThanOrEqual(1);
  });
});

describe("makeEncounter (level 1)", () => {
  it("encounter 1 is a slow + fast knight", () => {
    const names = makeEncounter(1, 1).map((u) => u.name);
    expect(names).toEqual(["Slow knight", "Fast knight"]);
  });

  it("encounter 3 is two slow + one fast knight", () => {
    const names = makeEncounter(1, 3).map((u) => u.name);
    expect(names).toEqual(["Slow knight", "Slow knight", "Fast knight"]);
  });

  it("encounter 4 is two slow + two fast knights", () => {
    const names = makeEncounter(1, 4).map((u) => u.name);
    expect(names).toEqual([
      "Slow knight",
      "Slow knight",
      "Fast knight",
      "Fast knight",
    ]);
  });

  it("gives every unit in an encounter a unique id", () => {
    const ids = makeEncounter(1, 4).map((u) => u.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("builds enemies at full hp", () => {
    for (const unit of makeEncounter(1, 4)) {
      expect(unit.hp).toBe(unit.maxHp);
      expect(unit.side).toBe("enemy");
    }
  });
});
