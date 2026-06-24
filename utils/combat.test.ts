import {
  Unit,
  CombatState,
  createCombat,
  endTurn,
  applyDamage,
} from "./combat";

function unit(overrides: Partial<Unit> & Pick<Unit, "id" | "side">): Unit {
  return {
    name: overrides.name ?? overrides.id,
    hp: 10,
    maxHp: 10,
    atk: 1,
    blk: 0,
    ...overrides,
  };
}

describe("applyDamage", () => {
  it("subtracts the target's block from each instance", () => {
    const target = unit({ id: "t", side: "enemy", hp: 10, blk: 2 });
    expect(applyDamage(target, 5).hp).toBe(7); // 5 - 2 block
  });

  it("treats negative block as bonus damage", () => {
    const target = unit({ id: "t", side: "enemy", hp: 10, blk: -3 });
    expect(applyDamage(target, 5).hp).toBe(2); // 5 + 3
  });

  it("never heals when block exceeds the incoming damage", () => {
    const target = unit({ id: "t", side: "enemy", hp: 10, blk: 9 });
    expect(applyDamage(target, 5).hp).toBe(10); // net damage floored at 0
  });

  it("clamps hp at 0 rather than going negative", () => {
    const target = unit({ id: "t", side: "enemy", hp: 3, blk: 0 });
    expect(applyDamage(target, 5).hp).toBe(0);
  });
});

describe("createCombat", () => {
  it("starts ongoing on the player's turn with all units present", () => {
    const arcanist = unit({ id: "arcanist", side: "player" });
    const enemy = unit({ id: "knight", side: "enemy" });
    const state = createCombat(arcanist, [enemy]);
    expect(state.outcome).toBe("ongoing");
    expect(state.turn).toBe("player");
    expect(state.units).toHaveLength(2);
  });
});

describe("endTurn", () => {
  it("has the arcanist attack every enemy, reduced by block", () => {
    const arcanist = unit({ id: "arcanist", side: "player", atk: 4, hp: 100 });
    const a = unit({ id: "a", side: "enemy", hp: 10, blk: 1 });
    const b = unit({ id: "b", side: "enemy", hp: 10, blk: 0 });
    const next = endTurn(createCombat(arcanist, [a, b]));
    // both enemies survive and counter-attack the arcanist
    expect(next.units.find((u) => u.id === "a")!.hp).toBe(7); // 4 - 1
    expect(next.units.find((u) => u.id === "b")!.hp).toBe(6); // 4 - 0
  });

  it("lets surviving enemies attack the arcanist back", () => {
    const arcanist = unit({ id: "arcanist", side: "player", atk: 1, hp: 100 });
    const enemy = unit({ id: "knight", side: "enemy", hp: 100, atk: 3 });
    const next = endTurn(createCombat(arcanist, [enemy]));
    expect(next.units.find((u) => u.id === "arcanist")!.hp).toBe(97);
  });

  it("wins when the arcanist's attack kills the last enemy", () => {
    const arcanist = unit({ id: "arcanist", side: "player", atk: 10, hp: 100 });
    const enemy = unit({ id: "knight", side: "enemy", hp: 5 });
    const next = endTurn(createCombat(arcanist, [enemy]));
    expect(next.outcome).toBe("win");
    expect(next.units.some((u) => u.side === "enemy")).toBe(false);
  });

  it("a dead enemy forfeits its counter-attack", () => {
    const arcanist = unit({ id: "arcanist", side: "player", atk: 10, hp: 100 });
    const enemy = unit({ id: "knight", side: "enemy", hp: 5, atk: 50 });
    const next = endTurn(createCombat(arcanist, [enemy]));
    expect(next.outcome).toBe("win");
    expect(next.units.find((u) => u.id === "arcanist")!.hp).toBe(100);
  });

  it("loses when the enemy attack kills the arcanist", () => {
    const arcanist = unit({ id: "arcanist", side: "player", atk: 1, hp: 3 });
    const enemy = unit({ id: "knight", side: "enemy", hp: 100, atk: 50 });
    const next = endTurn(createCombat(arcanist, [enemy]));
    expect(next.outcome).toBe("loss");
  });

  it("is a no-op once combat is already decided", () => {
    const arcanist = unit({ id: "arcanist", side: "player", atk: 10, hp: 100 });
    const enemy = unit({ id: "knight", side: "enemy", hp: 5 });
    const won = endTurn(createCombat(arcanist, [enemy]));
    expect(endTurn(won)).toEqual(won);
  });

  it("does not mutate the input state", () => {
    const arcanist = unit({ id: "arcanist", side: "player", atk: 2, hp: 100 });
    const enemy = unit({ id: "knight", side: "enemy", hp: 10 });
    const state: CombatState = createCombat(arcanist, [enemy]);
    const snapshot = JSON.parse(JSON.stringify(state));
    endTurn(state);
    expect(state).toEqual(snapshot);
  });
});
