import { Unit, applyDamage } from "./units";

function unit(overrides: Partial<Unit> & Pick<Unit, "id" | "side">): Unit {
  return {
    name: overrides.id,
    hp: 10,
    maxHp: 10,
    atk: 1,
    blk: 0,
    ...overrides,
  };
}

describe("applyDamage", () => {
  it("subtracts the target's block from the instance", () => {
    const target = unit({ id: "t", side: "enemy", hp: 10, blk: 2 });
    expect(applyDamage(target, 5).hp).toBe(7); // 5 - 2 block
  });

  it("treats negative block as bonus damage", () => {
    const target = unit({ id: "t", side: "enemy", hp: 10, blk: -3 });
    expect(applyDamage(target, 5).hp).toBe(2); // 5 + 3
  });

  it("never heals when block exceeds the incoming damage", () => {
    const target = unit({ id: "t", side: "enemy", hp: 10, blk: 9 });
    expect(applyDamage(target, 5).hp).toBe(10); // net floored at 0
  });

  it("clamps hp at 0 rather than going negative", () => {
    const target = unit({ id: "t", side: "enemy", hp: 3, blk: 0 });
    expect(applyDamage(target, 5).hp).toBe(0);
  });

  it("does not mutate the input unit", () => {
    const target = unit({ id: "t", side: "enemy", hp: 10 });
    applyDamage(target, 5);
    expect(target.hp).toBe(10);
  });
});
