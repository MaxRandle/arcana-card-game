import { Unit } from "./units";
import {
  applyAction,
  resolveActionPhase,
  makeFastKnight,
  makeSlowKnight,
  makeBarbarian,
} from "./enemies";

function unit(overrides: Partial<Unit> & Pick<Unit, "id" | "side">): Unit {
  return {
    name: overrides.id,
    hp: 60,
    maxHp: 60,
    atk: 1,
    blk: 0,
    statuses: {},
    ...overrides,
  };
}

describe("applyAction", () => {
  it("Battle stance loses 3 block and gains 3 attack", () => {
    const after = applyAction(unit({ id: "k", side: "enemy", atk: 1, blk: 2 }), "battleStance");
    expect(after.atk).toBe(4);
    expect(after.blk).toBe(-1);
  });

  it("Defensive stance gains 3 block and loses 3 attack, atk floored at 0", () => {
    const after = applyAction(unit({ id: "k", side: "enemy", atk: 1, blk: 2 }), "defensiveStance");
    expect(after.atk).toBe(0); // 1 - 3, floored at 0
    expect(after.blk).toBe(5);
  });

  it("Blood tithe loses 1 hp", () => {
    const after = applyAction(unit({ id: "b", side: "enemy", hp: 60 }), "bloodTithe");
    expect(after.hp).toBe(59);
  });

  it("Blood tithe triggers Rage (+1 atk on hp loss)", () => {
    const after = applyAction(
      unit({ id: "b", side: "enemy", hp: 60, atk: 1, passives: ["rage"] }),
      "bloodTithe",
    );
    expect(after.hp).toBe(59);
    expect(after.atk).toBe(2);
  });

  it("None leaves the unit unchanged", () => {
    const before = unit({ id: "k", side: "enemy" });
    expect(applyAction(before, "none")).toEqual(before);
  });
});

describe("resolveActionPhase", () => {
  it("performs the action at the current cycle index and advances it", () => {
    const knight = makeFastKnight("k");
    const [after] = resolveActionPhase([knight]).filter((u) => u.id === "k");
    expect(after.atk).toBe(4); // battle stance: 1 + 3
    expect(after.blk).toBe(-1); // 2 - 3
    expect(after.cycleIndex).toBe(1);
  });

  it("wraps the cycle index after the last step", () => {
    let units = [makeBarbarian("b")]; // single-step cycle
    units = resolveActionPhase(units);
    expect(units[0].cycleIndex).toBe(0);
  });

  it("skips a None step but still advances the cycle", () => {
    const slow = { ...makeSlowKnight("s"), cycleIndex: 1 }; // step 2 = None
    const [after] = resolveActionPhase([slow]);
    expect(after.atk).toBe(1); // unchanged
    expect(after.blk).toBe(2);
    expect(after.cycleIndex).toBe(2);
  });

  it("leaves the player and non-cycle units alone", () => {
    const player = unit({ id: "p", side: "player" });
    const [after] = resolveActionPhase([player]);
    expect(after).toEqual(player);
  });

  it("acts on every living enemy independently", () => {
    const units = resolveActionPhase([makeFastKnight("a"), makeBarbarian("b")]);
    expect(units.find((u) => u.id === "a")!.atk).toBe(4); // battle stance
    expect(units.find((u) => u.id === "b")!.hp).toBe(59); // blood tithe
  });
});

describe("roster", () => {
  it("Fast knight matches the design stats and cycle", () => {
    const k = makeFastKnight("k");
    expect(k).toMatchObject({ name: "Fast knight", hp: 60, maxHp: 60, atk: 1, blk: 2 });
    expect(k.actionCycle).toEqual([
      "battleStance",
      "defensiveStance",
      "battleStance",
      "defensiveStance",
    ]);
  });

  it("Slow knight has a cycle with None steps", () => {
    const k = makeSlowKnight("k");
    expect(k).toMatchObject({ name: "Slow knight", hp: 60, atk: 1, blk: 2 });
    expect(k.actionCycle).toEqual([
      "battleStance",
      "none",
      "defensiveStance",
      "none",
    ]);
  });

  it("Barbarian has Rage and a Blood tithe cycle", () => {
    const b = makeBarbarian("b");
    expect(b).toMatchObject({ name: "Barbarian", hp: 60, atk: 1, blk: 0 });
    expect(b.passives).toEqual(["rage"]);
    expect(b.actionCycle).toEqual(["bloodTithe"]);
  });
});
