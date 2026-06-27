import { Side, Unit } from "./units";
import {
  STATUS_KIND,
  addStatus,
  decayStatus,
  removeAllDebuffs,
  removeRandomBuff,
  removeStatus,
  resolveStatusEffectPhase,
  resolveTremorsRetaliation,
  rollEvade,
  statusList,
  statusStacks,
} from "./statuses";

function unit(overrides: Partial<Unit> & Pick<Unit, "id" | "side">): Unit {
  return {
    name: overrides.id,
    hp: 10,
    maxHp: 10,
    atk: 1,
    blk: 0,
    statuses: {},
    ...overrides,
  };
}

describe("bag operations", () => {
  it("reads stacks, treating an absent status as zero", () => {
    expect(statusStacks({ burn: 3 }, "burn")).toBe(3);
    expect(statusStacks({}, "burn")).toBe(0);
  });

  it("adds stacks, accumulating onto an existing count", () => {
    expect(addStatus({}, "burn", 1)).toEqual({ burn: 1 });
    expect(addStatus({ burn: 2 }, "burn", 1)).toEqual({ burn: 3 });
  });

  it("removes a whole status, clearing every stack at once", () => {
    expect(removeStatus({ burn: 5, tremors: 1 }, "burn")).toEqual({ tremors: 1 });
  });

  it("decays a status by one, dropping it entirely at zero", () => {
    expect(decayStatus({ tremors: 2 }, "tremors")).toEqual({ tremors: 1 });
    expect(decayStatus({ tremors: 1 }, "tremors")).toEqual({});
  });

  it("removes all debuffs but leaves buffs untouched", () => {
    const bag = { burn: 3, potential: 2, tremors: 1, twinkletoes: 1 };
    expect(removeAllDebuffs(bag)).toEqual({ tremors: 1, twinkletoes: 1 });
  });

  it("removes one random buff, leaving debuffs untouched", () => {
    // rng 0 selects the first buff in name order (tremors before twinkletoes).
    expect(removeRandomBuff({ tremors: 1, twinkletoes: 1, burn: 2 }, () => 0)).toEqual({
      twinkletoes: 1,
      burn: 2,
    });
    // rng near 1 selects the last buff.
    expect(
      removeRandomBuff({ tremors: 1, twinkletoes: 1, burn: 2 }, () => 0.99),
    ).toEqual({ tremors: 1, burn: 2 });
  });

  it("leaves the bag unchanged when removing a random buff with none present", () => {
    expect(removeRandomBuff({ burn: 2 }, () => 0)).toEqual({ burn: 2 });
  });

  it("classifies each status as buff or debuff", () => {
    expect(STATUS_KIND.burn).toBe("debuff");
    expect(STATUS_KIND.potential).toBe("debuff");
    expect(STATUS_KIND.tremors).toBe("buff");
    expect(STATUS_KIND.twinkletoes).toBe("buff");
  });
});

describe("statusList", () => {
  it("flattens the bag into labelled, categorised entries", () => {
    expect(statusList({ burn: 2, tremors: 1 })).toEqual([
      { name: "burn", label: "Burn", kind: "debuff", stacks: 2 },
      { name: "tremors", label: "Tremors", kind: "buff", stacks: 1 },
    ]);
  });

  it("is empty for a unit with no statuses", () => {
    expect(statusList({})).toEqual([]);
  });
});

describe("resolveStatusEffectPhase", () => {
  it("deals 1 burn damage per stack to each owner on the side", () => {
    const units = [
      unit({ id: "a", side: "player" }),
      unit({ id: "k", side: "enemy", hp: 10, statuses: { burn: 3 } }),
    ];
    const next = resolveStatusEffectPhase(units, "enemy");
    expect(next.find((u) => u.id === "k")!.hp).toBe(7);
  });

  it("applies block to the burn instance", () => {
    const units = [unit({ id: "k", side: "enemy", hp: 10, blk: 1, statuses: { burn: 3 } })];
    expect(resolveStatusEffectPhase(units, "enemy")[0].hp).toBe(8); // 3 - 1 block
  });

  it("prunes a unit that burn kills", () => {
    const units = [
      unit({ id: "a", side: "player" }),
      unit({ id: "k", side: "enemy", hp: 2, statuses: { burn: 5 } }),
    ];
    const next = resolveStatusEffectPhase(units, "enemy");
    expect(next.find((u) => u.id === "k")).toBeUndefined();
  });

  it("decays tremors by one stack but never self-decays burn", () => {
    const units = [unit({ id: "a", side: "player", statuses: { tremors: 2, burn: 3 } })];
    const next = resolveStatusEffectPhase(units, "player")[0];
    expect(next.statuses).toEqual({ tremors: 1, burn: 3 });
  });

  it("ignores units on the other side", () => {
    const units = [unit({ id: "k", side: "enemy", hp: 10, statuses: { burn: 3 } })];
    expect(resolveStatusEffectPhase(units, "player")[0].hp).toBe(10);
  });
});

describe("resolveTremorsRetaliation", () => {
  function battlefield(): Unit[] {
    return [
      unit({ id: "a", side: "player", hp: 10, statuses: { tremors: 1 } }),
      unit({ id: "k1", side: "enemy", hp: 10 }),
      unit({ id: "k2", side: "enemy", hp: 10 }),
    ];
  }

  it("deals a flat 2 to all units opposite the attacked owner", () => {
    const next = resolveTremorsRetaliation(battlefield(), "a");
    expect(next.find((u) => u.id === "k1")!.hp).toBe(8);
    expect(next.find((u) => u.id === "k2")!.hp).toBe(8);
  });

  it("does not scale with stacks", () => {
    const units = battlefield();
    units[0].statuses = { tremors: 5 };
    const next = resolveTremorsRetaliation(units, "a");
    expect(next.find((u) => u.id === "k1")!.hp).toBe(8);
  });

  it("is a no-op when the attacked unit has no tremors", () => {
    const units = battlefield();
    units[0].statuses = {};
    expect(resolveTremorsRetaliation(units, "a")).toEqual(units);
  });

  it("prunes units the retaliation kills", () => {
    const units = battlefield();
    units[1].hp = 2;
    const next = resolveTremorsRetaliation(units, "a");
    expect(next.find((u) => u.id === "k1")).toBeUndefined();
  });
});

describe("rollEvade", () => {
  const dancer = (s: Side = "player") =>
    unit({ id: "d", side: s, statuses: { twinkletoes: 1 } });

  it("evades when the roll lands under 25%", () => {
    expect(rollEvade(dancer(), () => 0.24)).toBe(true);
  });

  it("does not evade at or above 25%", () => {
    expect(rollEvade(dancer(), () => 0.25)).toBe(false);
  });

  it("never evades without the twinkletoes buff", () => {
    expect(rollEvade(unit({ id: "d", side: "player" }), () => 0)).toBe(false);
  });
});
