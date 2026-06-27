import {
  CombatModifiers,
  applyRamp,
  createModifiers,
  effectiveCost,
  gainElementalDamage,
  gainManaPerTurn,
} from "./modifiers";
import { Card } from "./cards";

function card(overrides: Partial<Card> = {}): Card {
  return {
    cardId: "test",
    title: "Test",
    cost: 2,
    body: "",
    arcana: "generic",
    targeting: "untargeted",
    effects: [],
    ...overrides,
  };
}

describe("createModifiers", () => {
  it("starts empty with no permanent seed", () => {
    expect(createModifiers()).toEqual({
      ramp: {},
      manaPerTurn: 0,
      elementalDamage: 0,
      permanentElementalDamage: 0,
    });
  });

  it("seeds elemental damage from a permanent value carried by the run", () => {
    const m = createModifiers(2);
    expect(m.elementalDamage).toBe(2);
    expect(m.permanentElementalDamage).toBe(2);
  });
});

describe("effectiveCost", () => {
  it("is the base cost when the card has not ramped", () => {
    expect(effectiveCost(card({ cost: 2 }), "test-0", createModifiers())).toBe(2);
  });

  it("adds the accumulated ramp for that instance", () => {
    const m: CombatModifiers = { ...createModifiers(), ramp: { "test-0": 3 } };
    expect(effectiveCost(card({ cost: 2 }), "test-0", m)).toBe(5);
  });

  it("floors at 0 for negative ramp", () => {
    const m: CombatModifiers = { ...createModifiers(), ramp: { "test-0": -5 } };
    expect(effectiveCost(card({ cost: 2 }), "test-0", m)).toBe(0);
  });

  it("reads ramp per instance, so duplicates are independent", () => {
    const m: CombatModifiers = { ...createModifiers(), ramp: { "test-0": 3 } };
    expect(effectiveCost(card({ cost: 2 }), "test-1", m)).toBe(2);
  });
});

describe("applyRamp", () => {
  it("accumulates the card's ramp onto the instance counter", () => {
    const after = applyRamp(createModifiers(), card({ ramp: 1 }), "test-0");
    expect(after.ramp).toEqual({ "test-0": 1 });
    const twice = applyRamp(after, card({ ramp: 1 }), "test-0");
    expect(twice.ramp).toEqual({ "test-0": 2 });
  });

  it("ramps duplicates independently", () => {
    let m = applyRamp(createModifiers(), card({ ramp: 2 }), "test-0");
    m = applyRamp(m, card({ ramp: 2 }), "test-1");
    expect(m.ramp).toEqual({ "test-0": 2, "test-1": 2 });
  });

  it("is a no-op for a card without ramp", () => {
    const before = createModifiers();
    expect(applyRamp(before, card(), "test-0")).toBe(before);
  });

  it("does not mutate the input", () => {
    const before = createModifiers();
    applyRamp(before, card({ ramp: 1 }), "test-0");
    expect(before.ramp).toEqual({});
  });
});

describe("gainManaPerTurn", () => {
  it("stacks the per-turn mana bonus", () => {
    const m = gainManaPerTurn(gainManaPerTurn(createModifiers(), 1), 2);
    expect(m.manaPerTurn).toBe(3);
  });
});

describe("gainElementalDamage", () => {
  it("adds a non-permanent bonus without touching the permanent total", () => {
    const m = gainElementalDamage(createModifiers(), 1, false);
    expect(m.elementalDamage).toBe(1);
    expect(m.permanentElementalDamage).toBe(0);
  });

  it("adds a permanent bonus to both the live and permanent totals", () => {
    const m = gainElementalDamage(createModifiers(), 1, true);
    expect(m.elementalDamage).toBe(1);
    expect(m.permanentElementalDamage).toBe(1);
  });
});
