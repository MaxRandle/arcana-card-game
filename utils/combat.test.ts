import {
  Unit,
  CombatState,
  createCombat,
  endTurn,
  playCard,
  applyDamage,
} from "./combat";
import { CardInstance } from "./deck";
import { Card } from "./cards";

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

const windshear: Card = {
  cardId: "windshear",
  title: "Windshear",
  cost: 1,
  body: "Deal 3 damage.",
  arcana: "air",
  targeting: "enemy",
  effects: [{ kind: "damage", amount: 3 }],
};

function instances(n: number, card: Card = windshear): CardInstance[] {
  return Array.from({ length: n }, (_, i) => ({
    instanceId: `c${i}`,
    card,
  }));
}

// Deterministic rng leaving Fisher-Yates order unchanged, so seeded decks draw
// predictably in tests.
const noShuffle = () => 0.999999;

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

  it("opens turn 1's Play phase with 3 mana (1 start + 2 Mana phase)", () => {
    const state = createCombat(
      unit({ id: "arcanist", side: "player" }),
      [unit({ id: "knight", side: "enemy" })],
      instances(5),
      noShuffle,
    );
    expect(state.mana).toBe(3);
  });

  it("draws one card into the hand on turn 1", () => {
    const state = createCombat(
      unit({ id: "arcanist", side: "player" }),
      [unit({ id: "knight", side: "enemy" })],
      instances(5),
      noShuffle,
    );
    expect(state.deck.hand).toHaveLength(1);
    expect(state.deck.drawPile).toHaveLength(4);
  });
});

describe("mana and draw across turns", () => {
  it("gains 2 mana each turn, carrying the unspent remainder", () => {
    const arcanist = unit({ id: "arcanist", side: "player", atk: 0, hp: 100 });
    const enemy = unit({ id: "knight", side: "enemy", hp: 100, atk: 0 });
    const turn1 = createCombat(arcanist, [enemy], instances(5), noShuffle);
    const turn2 = endTurn(turn1, noShuffle);
    expect(turn2.mana).toBe(5); // 3 carried + 2
  });

  it("draws another card each turn", () => {
    const arcanist = unit({ id: "arcanist", side: "player", atk: 0, hp: 100 });
    const enemy = unit({ id: "knight", side: "enemy", hp: 100, atk: 0 });
    const turn1 = createCombat(arcanist, [enemy], instances(5), noShuffle);
    const turn2 = endTurn(turn1, noShuffle);
    expect(turn2.deck.hand).toHaveLength(2);
  });
});

describe("playCard", () => {
  function setup() {
    const arcanist = unit({ id: "arcanist", side: "player", atk: 0, hp: 100 });
    const enemy = unit({ id: "knight", side: "enemy", hp: 10, blk: 0, atk: 0 });
    const state = createCombat(arcanist, [enemy], instances(3), noShuffle);
    const inHand = state.deck.hand[0].instanceId;
    return { state, inHand };
  }

  it("deals the card's damage to the targeted enemy", () => {
    const { state, inHand } = setup();
    const next = playCard(state, inHand, "knight");
    expect(next.units.find((u) => u.id === "knight")!.hp).toBe(7); // 10 - 3
  });

  it("spends the card's mana cost", () => {
    const { state, inHand } = setup();
    const next = playCard(state, inHand, "knight");
    expect(next.mana).toBe(2); // 3 - 1
  });

  it("moves the played card to the discard after resolving", () => {
    const { state, inHand } = setup();
    const next = playCard(state, inHand, "knight");
    expect(next.deck.hand.some((c) => c.instanceId === inHand)).toBe(false);
    expect(next.deck.discard.some((c) => c.instanceId === inHand)).toBe(true);
    expect(next.deck.inPlay).toBeNull();
  });

  it("is blocked when mana is insufficient", () => {
    const { state, inHand } = setup();
    const broke: CombatState = { ...state, mana: 0 };
    expect(playCard(broke, inHand, "knight")).toBe(broke);
  });

  it("is blocked when the target's side breaks the card's targeting mode", () => {
    const { state, inHand } = setup();
    // Windshear is enemy-targeted; dropping it on the arcanist must not play.
    expect(playCard(state, inHand, "arcanist")).toBe(state);
  });

  it("wins when the played card kills the last enemy", () => {
    const arcanist = unit({ id: "arcanist", side: "player", atk: 0, hp: 100 });
    const enemy = unit({ id: "knight", side: "enemy", hp: 3, blk: 0 });
    const state = createCombat(arcanist, [enemy], instances(3), noShuffle);
    const next = playCard(state, state.deck.hand[0].instanceId, "knight");
    expect(next.outcome).toBe("win");
  });

  it("does not mutate the input state", () => {
    const { state, inHand } = setup();
    const snapshot = JSON.parse(JSON.stringify(state));
    playCard(state, inHand, "knight");
    expect(state).toEqual(snapshot);
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
