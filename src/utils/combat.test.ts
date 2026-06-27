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
    statuses: {},
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

describe("enemy action phase in the turn loop", () => {
  it("resolves the enemy's action after its attack, so the stat change hits next turn", () => {
    const arcanist = unit({ id: "arcanist", side: "player", atk: 1, hp: 100 });
    // Battle stance step: gains 3 atk. The enemy attacks with its current atk
    // (1) this turn; the stance only raises it for the following turn.
    const enemy = unit({
      id: "knight",
      side: "enemy",
      hp: 100,
      atk: 1,
      actionCycle: ["battleStance"],
      cycleIndex: 0,
    });

    const afterFirst = endTurn(createCombat(arcanist, [enemy]));
    // Attacked with 1 before the stance resolved.
    expect(afterFirst.units.find((u) => u.id === "arcanist")!.hp).toBe(99);
    // Stance applied for next turn: atk 1 -> 4, blk 0 -> -3, cycle wrapped.
    const stanced = afterFirst.units.find((u) => u.id === "knight")!;
    expect(stanced.atk).toBe(4);
    expect(stanced.cycleIndex).toBe(0);

    // Next turn the raised attack lands.
    const afterSecond = endTurn(afterFirst);
    expect(afterSecond.units.find((u) => u.id === "arcanist")!.hp).toBe(95); // 99 - 4
  });

  it("Barbarian's Blood tithe drains its hp and Rage raises its attack each turn", () => {
    const arcanist = unit({ id: "arcanist", side: "player", atk: 0, hp: 100 });
    const barbarian = unit({
      id: "barb",
      side: "enemy",
      hp: 60,
      atk: 1,
      passives: ["rage"],
      actionCycle: ["bloodTithe"],
      cycleIndex: 0,
    });

    const next = endTurn(createCombat(arcanist, [barbarian]));
    const after = next.units.find((u) => u.id === "barb")!;
    expect(after.hp).toBe(59); // Blood tithe
    expect(after.atk).toBe(2); // Rage from its own hp loss
  });
});

describe("statuses in the turn loop", () => {
  it("burns enemies on the enemy Effect phase", () => {
    const arcanist = unit({ id: "arcanist", side: "player", atk: 0, hp: 100 });
    const enemy = unit({ id: "knight", side: "enemy", hp: 10, atk: 0, statuses: { burn: 3 } });
    const next = endTurn(createCombat(arcanist, [enemy]));
    expect(next.units.find((u) => u.id === "knight")!.hp).toBe(7);
  });

  it("burns the arcanist on its own Effect phase next turn", () => {
    const arcanist = unit({ id: "arcanist", side: "player", atk: 0, hp: 100, statuses: { burn: 2 } });
    const enemy = unit({ id: "knight", side: "enemy", hp: 100, atk: 0 });
    const next = endTurn(createCombat(arcanist, [enemy]));
    expect(next.units.find((u) => u.id === "arcanist")!.hp).toBe(98);
  });

  it("loses when burn kills the arcanist on its Effect phase", () => {
    const arcanist = unit({ id: "arcanist", side: "player", atk: 0, hp: 2, statuses: { burn: 5 } });
    const enemy = unit({ id: "knight", side: "enemy", hp: 100, atk: 0 });
    const next = endTurn(createCombat(arcanist, [enemy]));
    expect(next.outcome).toBe("loss");
  });

  it("retaliates with Tremors when the arcanist is attacked", () => {
    const arcanist = unit({ id: "arcanist", side: "player", atk: 0, hp: 100, statuses: { tremors: 1 } });
    const a = unit({ id: "a", side: "enemy", hp: 10, atk: 1 });
    const b = unit({ id: "b", side: "enemy", hp: 10, atk: 1 });
    const next = endTurn(createCombat(arcanist, [a, b]));
    // Each enemy attack triggers a flat 2 to every enemy (two attackers => 4).
    expect(next.units.find((u) => u.id === "a")!.hp).toBe(6);
    expect(next.units.find((u) => u.id === "b")!.hp).toBe(6);
  });

  it("decays Tremors by one stack each turn", () => {
    const arcanist = unit({ id: "arcanist", side: "player", atk: 0, hp: 100, statuses: { tremors: 2 } });
    const enemy = unit({ id: "knight", side: "enemy", hp: 100, atk: 0 });
    const next = endTurn(createCombat(arcanist, [enemy]));
    expect(next.units.find((u) => u.id === "arcanist")!.statuses).toEqual({ tremors: 1 });
  });

  it("evades an attack while Twinkletoes is up and the roll is under 25%", () => {
    const arcanist = unit({ id: "arcanist", side: "player", atk: 0, hp: 100, statuses: { twinkletoes: 1 } });
    const enemy = unit({ id: "knight", side: "enemy", hp: 100, atk: 5 });
    const evadeRng = () => 0; // always under the 25% threshold
    const next = endTurn(createCombat(arcanist, [enemy], [], evadeRng), evadeRng);
    expect(next.units.find((u) => u.id === "arcanist")!.hp).toBe(100);
  });

  it("takes the hit when the evade roll fails", () => {
    const arcanist = unit({ id: "arcanist", side: "player", atk: 0, hp: 100, statuses: { twinkletoes: 1 } });
    const enemy = unit({ id: "knight", side: "enemy", hp: 100, atk: 5 });
    const next = endTurn(createCombat(arcanist, [enemy]), () => 0.99);
    expect(next.units.find((u) => u.id === "arcanist")!.hp).toBe(95);
  });
});

describe("card cost modifiers", () => {
  const endurance: Card = {
    cardId: "endurance",
    title: "Endurance",
    cost: 2,
    body: "Ramp 1; gain 1 block.",
    arcana: "earth",
    targeting: "player",
    ramp: 1,
    effects: [{ kind: "gainBlock", amount: 1 }],
  };

  function withHand(cards: CardInstance[], mana = 10): CombatState {
    const base = createCombat(
      unit({ id: "arcanist", side: "player" }),
      [unit({ id: "knight", side: "enemy" })],
      [],
      noShuffle,
    );
    return {
      ...base,
      mana,
      deck: { ...base.deck, hand: cards },
    };
  }

  it("raises a ramped card's cost by x on each play", () => {
    const state = withHand([{ instanceId: "e0", card: endurance }], 10);
    const after = playCard(state, "e0", "arcanist", noShuffle);
    // First play charges the base cost of 2.
    expect(after.mana).toBe(8);
    expect(after.modifiers.ramp).toEqual({ e0: 1 });
  });

  it("charges the ramped cost on the second play of the same copy", () => {
    let state = withHand(
      [
        { instanceId: "e0", card: endurance },
        { instanceId: "e0b", card: endurance },
      ],
      10,
    );
    // Replay the same instance by re-adding it to hand after the first play.
    state = playCard(state, "e0", "arcanist", noShuffle);
    state = { ...state, deck: { ...state.deck, hand: [{ instanceId: "e0", card: endurance }] } };
    const after = playCard(state, "e0", "arcanist", noShuffle);
    // Second play of e0 costs 2 + 1 = 3.
    expect(after.mana).toBe(8 - 3);
  });

  it("ramps duplicates independently", () => {
    let state = withHand(
      [
        { instanceId: "e0", card: endurance },
        { instanceId: "e1", card: endurance },
      ],
      10,
    );
    state = playCard(state, "e0", "arcanist", noShuffle);
    const after = playCard(state, "e1", "arcanist", noShuffle);
    expect(after.modifiers.ramp).toEqual({ e0: 1, e1: 1 });
  });

  it("blocks a play it cannot pay for once ramped past the mana on hand", () => {
    let state = withHand([{ instanceId: "e0", card: endurance }], 2);
    state = playCard(state, "e0", "arcanist", noShuffle); // mana now 0
    state = { ...state, mana: 2, deck: { ...state.deck, hand: [{ instanceId: "e0", card: endurance }] } };
    // Effective cost is now 3 > 2 mana: the play is blocked (state unchanged).
    expect(playCard(state, "e0", "arcanist", noShuffle)).toBe(state);
  });
});

describe("additional mana per turn", () => {
  const temporal: Card = {
    cardId: "temporal",
    title: "Temporal energy",
    cost: 0,
    body: "Gain 1 additional mana per turn.",
    arcana: "water",
    targeting: "untargeted",
    effects: [{ kind: "gainManaPerTurn", amount: 1 }],
  };

  it("stacks into every later Mana phase", () => {
    const base = createCombat(
      unit({ id: "arcanist", side: "player" }),
      [unit({ id: "knight", side: "enemy", hp: 100 })],
      [],
      noShuffle,
    );
    let state: CombatState = { ...base, mana: 5, deck: { ...base.deck, hand: [{ instanceId: "t0", card: temporal }] } };
    state = playCard(state, "t0", null, noShuffle);
    const manaBefore = state.mana;
    state = endTurn(state, noShuffle);
    // Next turn's Mana phase gives the usual 2 plus the 1 additional.
    expect(state.mana).toBe(manaBefore + 3);
  });
});

describe("elemental damage bonus", () => {
  const spirit: Card = {
    cardId: "spirit",
    title: "Spirit energy",
    cost: 0,
    body: "Increase elemental damage by 1.",
    arcana: "air",
    targeting: "player",
    effects: [{ kind: "gainElementalDamage", amount: 1, permanent: true }],
  };

  it("adds to damage cards and tracks the permanent total for the checkpoint", () => {
    const base = createCombat(
      unit({ id: "arcanist", side: "player" }),
      [unit({ id: "knight", side: "enemy", hp: 20 })],
      [],
      noShuffle,
    );
    let state: CombatState = {
      ...base,
      mana: 10,
      deck: {
        ...base.deck,
        hand: [
          { instanceId: "s0", card: spirit },
          { instanceId: "w0", card: windshear },
        ],
      },
    };
    state = playCard(state, "s0", "arcanist", noShuffle);
    expect(state.modifiers.permanentElementalDamage).toBe(1);
    state = playCard(state, "w0", "knight", noShuffle);
    // Windshear's 3 damage becomes 4 with the +1 elemental bonus.
    expect(state.units.find((u) => u.id === "knight")!.hp).toBe(16);
  });

  it("seeds the bonus from the run's permanent total", () => {
    const state = createCombat(
      unit({ id: "arcanist", side: "player" }),
      [unit({ id: "knight", side: "enemy" })],
      [],
      noShuffle,
      2,
    );
    expect(state.modifiers.elementalDamage).toBe(2);
  });
});
