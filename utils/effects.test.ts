import { Effect, EffectState, resolveEffect, resolveEffects } from "./effects";
import { CardInstance, DeckState } from "./deck";
import { Unit } from "./units";
import { Card } from "./cards";

const noShuffle = () => 0.999999;

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

function card(cardId: string, arcana: Card["arcana"]): Card {
  return {
    cardId,
    title: cardId,
    cost: 1,
    body: "",
    targeting: "untargeted",
    effects: [],
    arcana,
  };
}

function instance(cardId: string, arcana: Card["arcana"]): CardInstance {
  return { instanceId: `${cardId}-x`, card: card(cardId, arcana) };
}

function emptyDeck(drawPile: CardInstance[] = []): DeckState {
  return { drawPile, hand: [], discard: [], inPlay: null };
}

function state(overrides: Partial<EffectState> = {}): EffectState {
  return {
    units: [
      unit({ id: "arcanist", side: "player" }),
      unit({ id: "knight", side: "enemy" }),
    ],
    mana: 0,
    deck: emptyDeck(),
    ...overrides,
  };
}

describe("damage", () => {
  it("deals damage to the targeted unit, applying its block", () => {
    const s = state({
      units: [
        unit({ id: "arcanist", side: "player" }),
        unit({ id: "knight", side: "enemy", hp: 10, blk: 1 }),
      ],
    });
    const next = resolveEffect(s, { kind: "damage", amount: 3 }, { targetId: "knight" }, noShuffle);
    expect(next.units.find((u) => u.id === "knight")!.hp).toBe(8); // 3 - 1 block
  });

  it("removes a unit killed by the damage", () => {
    const s = state({
      units: [
        unit({ id: "arcanist", side: "player" }),
        unit({ id: "knight", side: "enemy", hp: 2 }),
      ],
    });
    const next = resolveEffect(s, { kind: "damage", amount: 3 }, { targetId: "knight" }, noShuffle);
    expect(next.units.some((u) => u.id === "knight")).toBe(false);
  });

  it("fizzles silently when the target is already gone", () => {
    const s = state();
    const next = resolveEffect(s, { kind: "damage", amount: 3 }, { targetId: "ghost" }, noShuffle);
    expect(next).toBe(s);
  });
});

describe("loseHp", () => {
  it("ignores block and reduces the unit's hp", () => {
    const s = state({
      units: [unit({ id: "arcanist", side: "player", hp: 10, blk: 5 })],
    });
    const next = resolveEffect(s, { kind: "loseHp", amount: 3 }, { targetId: null }, noShuffle);
    expect(next.units.find((u) => u.id === "arcanist")!.hp).toBe(7);
  });

  it("defaults its target to the arcanist when untargeted", () => {
    const next = resolveEffect(state(), { kind: "loseHp", amount: 1 }, { targetId: null }, noShuffle);
    expect(next.units.find((u) => u.id === "arcanist")!.hp).toBe(9);
  });
});

describe("heal", () => {
  it("restores hp but not above maxHp", () => {
    const s = state({
      units: [unit({ id: "arcanist", side: "player", hp: 4, maxHp: 10 })],
    });
    const healed = resolveEffect(s, { kind: "heal", amount: 3 }, { targetId: "arcanist" }, noShuffle);
    expect(healed.units[0].hp).toBe(7);
    const capped = resolveEffect(s, { kind: "heal", amount: 100 }, { targetId: "arcanist" }, noShuffle);
    expect(capped.units[0].hp).toBe(10);
  });
});

describe("gainBlock / gainAttack", () => {
  it("adds block to the target", () => {
    const next = resolveEffect(state(), { kind: "gainBlock", amount: 2 }, { targetId: "arcanist" }, noShuffle);
    expect(next.units.find((u) => u.id === "arcanist")!.blk).toBe(2);
  });

  it("adds attack to the arcanist when untargeted", () => {
    const next = resolveEffect(state(), { kind: "gainAttack", amount: 1 }, { targetId: null }, noShuffle);
    expect(next.units.find((u) => u.id === "arcanist")!.atk).toBe(2);
  });
});

describe("gainMana", () => {
  it("increases mana", () => {
    const next = resolveEffect(state({ mana: 2 }), { kind: "gainMana", amount: 1 }, { targetId: null }, noShuffle);
    expect(next.mana).toBe(3);
  });
});

describe("draw", () => {
  it("draws the given number of cards", () => {
    const s = state({ deck: emptyDeck([instance("a", "air"), instance("b", "fire")]) });
    const next = resolveEffect(s, { kind: "draw", amount: 2 }, { targetId: null }, noShuffle);
    expect(next.deck.hand).toHaveLength(2);
  });
});

describe("drawPerArcana", () => {
  it("draws one card per distinct arcana in the whole deck, excluding generic", () => {
    const deck: DeckState = {
      drawPile: [instance("a", "air"), instance("b", "fire"), instance("c", "air")],
      hand: [instance("d", "water")],
      discard: [instance("e", "generic")],
      inPlay: null,
    };
    // distinct arcana: air, fire, water = 3 (generic excluded)
    const next = resolveEffect(state({ deck }), { kind: "drawPerArcana" }, { targetId: null }, noShuffle);
    expect(next.deck.hand.length - 1).toBe(3); // started with 1 in hand
  });
});

describe("splash", () => {
  it("deals the main amount to the target and the splash amount to other enemies", () => {
    const s = state({
      units: [
        unit({ id: "arcanist", side: "player" }),
        unit({ id: "a", side: "enemy", hp: 10 }),
        unit({ id: "b", side: "enemy", hp: 10 }),
      ],
    });
    const next = resolveEffect(s, { kind: "splash", target: 4, others: 2 }, { targetId: "a" }, noShuffle);
    expect(next.units.find((u) => u.id === "a")!.hp).toBe(6); // 10 - 4
    expect(next.units.find((u) => u.id === "b")!.hp).toBe(8); // 10 - 2
  });
});

describe("either", () => {
  const ebb: Effect = {
    kind: "either",
    enemy: [{ kind: "damage", amount: 3 }],
    player: [{ kind: "heal", amount: 3 }],
  };

  it("takes the enemy branch when an enemy is targeted", () => {
    const s = state({
      units: [
        unit({ id: "arcanist", side: "player", hp: 5 }),
        unit({ id: "knight", side: "enemy", hp: 10 }),
      ],
    });
    const next = resolveEffect(s, ebb, { targetId: "knight" }, noShuffle);
    expect(next.units.find((u) => u.id === "knight")!.hp).toBe(7);
  });

  it("takes the player branch when a player unit is targeted", () => {
    const s = state({
      units: [unit({ id: "arcanist", side: "player", hp: 5, maxHp: 10 })],
    });
    const next = resolveEffect(s, ebb, { targetId: "arcanist" }, noShuffle);
    expect(next.units.find((u) => u.id === "arcanist")!.hp).toBe(8);
  });
});

describe("applyStatus", () => {
  it("adds stacks of a status to the target", () => {
    const s = state();
    const next = resolveEffect(
      s,
      { kind: "applyStatus", status: "burn", amount: 1 },
      { targetId: "knight" },
      noShuffle,
    );
    expect(next.units.find((u) => u.id === "knight")!.statuses).toEqual({ burn: 1 });
  });

  it("defaults to the arcanist for an untargeted clause", () => {
    const next = resolveEffect(
      state(),
      { kind: "applyStatus", status: "twinkletoes", amount: 1 },
      { targetId: null },
      noShuffle,
    );
    expect(next.units.find((u) => u.id === "arcanist")!.statuses).toEqual({
      twinkletoes: 1,
    });
  });
});

describe("removeRandomBuff", () => {
  it("strips one buff after standing in a clause sequence", () => {
    const s = state({
      units: [
        unit({ id: "arcanist", side: "player" }),
        unit({ id: "knight", side: "enemy", hp: 10, statuses: { tremors: 1, burn: 2 } }),
      ],
    });
    const next = resolveEffect(s, { kind: "removeRandomBuff" }, { targetId: "knight" }, () => 0);
    expect(next.units.find((u) => u.id === "knight")!.statuses).toEqual({ burn: 2 });
  });
});

describe("removeAllDebuffs", () => {
  it("strips every debuff from the target, keeping buffs", () => {
    const s = state({
      units: [
        unit({ id: "arcanist", side: "player", statuses: { burn: 3, tremors: 1 } }),
      ],
    });
    const next = resolveEffect(s, { kind: "removeAllDebuffs" }, { targetId: "arcanist" }, noShuffle);
    expect(next.units.find((u) => u.id === "arcanist")!.statuses).toEqual({ tremors: 1 });
  });
});

describe("damagePerStatus", () => {
  it("deals damage scaled by the target's stacks without consuming them", () => {
    const s = state({
      units: [
        unit({ id: "arcanist", side: "player" }),
        unit({ id: "knight", side: "enemy", hp: 10, statuses: { potential: 3 } }),
      ],
    });
    const next = resolveEffect(
      s,
      { kind: "damagePerStatus", status: "potential", perStack: 1 },
      { targetId: "knight" },
      noShuffle,
    );
    const knight = next.units.find((u) => u.id === "knight")!;
    expect(knight.hp).toBe(7); // 10 - 3
    expect(knight.statuses).toEqual({ potential: 3 }); // not consumed
  });
});

describe("seedBurn", () => {
  it("snapshots burning enemies and seeds one burn each on a different random enemy", () => {
    const s = state({
      units: [
        unit({ id: "arcanist", side: "player" }),
        unit({ id: "a", side: "enemy", hp: 10, statuses: { burn: 1 } }),
        unit({ id: "b", side: "enemy", hp: 10 }),
      ],
    });
    // Only `a` is burning; with one other enemy it must seed `b`.
    const next = resolveEffect(s, { kind: "seedBurn" }, { targetId: null }, () => 0);
    expect(next.units.find((u) => u.id === "b")!.statuses).toEqual({ burn: 1 });
    expect(next.units.find((u) => u.id === "a")!.statuses).toEqual({ burn: 1 });
  });

  it("seeds from every burning enemy in the cast-time snapshot", () => {
    const s = state({
      units: [
        unit({ id: "arcanist", side: "player" }),
        unit({ id: "a", side: "enemy", hp: 10, statuses: { burn: 1 } }),
        unit({ id: "b", side: "enemy", hp: 10, statuses: { burn: 1 } }),
        unit({ id: "c", side: "enemy", hp: 10 }),
      ],
    });
    // rng 0 makes each source pick the first of its "others" list (in id order,
    // excluding itself): a -> b, b -> a, c is not a source. b and a each gain 1.
    const next = resolveEffect(s, { kind: "seedBurn" }, { targetId: null }, () => 0);
    expect(next.units.find((u) => u.id === "a")!.statuses).toEqual({ burn: 2 });
    expect(next.units.find((u) => u.id === "b")!.statuses).toEqual({ burn: 2 });
    expect(next.units.find((u) => u.id === "c")!.statuses).toEqual({});
  });

  it("never seeds an enemy onto itself", () => {
    const s = state({
      units: [
        unit({ id: "arcanist", side: "player" }),
        unit({ id: "a", side: "enemy", hp: 10, statuses: { burn: 1 } }),
      ],
    });
    // The lone burning enemy has no other enemy to seed — no change.
    const next = resolveEffect(s, { kind: "seedBurn" }, { targetId: null }, () => 0);
    expect(next.units.find((u) => u.id === "a")!.statuses).toEqual({ burn: 1 });
  });
});

describe("resolveEffects", () => {
  it("resolves clauses left-to-right, each fully before the next", () => {
    const next = resolveEffects(
      state({ mana: 0, units: [unit({ id: "arcanist", side: "player", hp: 10 })] }),
      [
        { kind: "loseHp", amount: 1 },
        { kind: "gainMana", amount: 1 },
      ],
      { targetId: null },
      noShuffle,
    );
    expect(next.units.find((u) => u.id === "arcanist")!.hp).toBe(9);
    expect(next.mana).toBe(1);
  });
});
