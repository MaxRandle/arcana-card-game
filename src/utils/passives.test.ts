import { Unit } from "./units";
import { triggerHpLossPassives, PASSIVE_LABEL } from "./passives";

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

describe("triggerHpLossPassives", () => {
  it("grants +1 atk to a Rage unit on hp loss", () => {
    const raging = unit({ id: "barb", side: "enemy", atk: 1, passives: ["rage"] });
    expect(triggerHpLossPassives(raging).atk).toBe(2);
  });

  it("adds only 1 atk per loss instance, regardless of hp lost", () => {
    const raging = unit({ id: "barb", side: "enemy", atk: 5, passives: ["rage"] });
    expect(triggerHpLossPassives(raging).atk).toBe(6);
  });

  it("leaves a unit without Rage unchanged", () => {
    const plain = unit({ id: "knight", side: "enemy", atk: 1 });
    expect(triggerHpLossPassives(plain)).toEqual(plain);
  });

  it("has a display label for Rage", () => {
    expect(PASSIVE_LABEL.rage).toBe("Rage");
  });
});
