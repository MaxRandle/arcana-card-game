// Combat engine — the attack-only tracer for the turn loop. Pure and
// UI-free: every function takes a state and returns a new one, so the screen
// is a thin renderer over this module. Later slices (mana, draw, play, enemy
// actions) extend the no-op phases noted in `endTurn`.

export type Side = "player" | "enemy";

export interface Unit {
  id: string;
  name: string;
  side: Side;
  hp: number;
  maxHp: number;
  /** Damage dealt to every opponent on this unit's attack phase. */
  atk: number;
  /** Flat reduction applied per incoming damage instance; may be negative. */
  blk: number;
}

export type Outcome = "ongoing" | "win" | "loss";

export interface CombatState {
  units: Unit[];
  /** Whose turn it is when combat is paused awaiting input (the Play phase). */
  turn: Side;
  outcome: Outcome;
}

// Reduce a unit's hp by one damage instance. Block is subtracted per instance
// and can go negative (increasing damage); net damage never heals, and hp
// never drops below 0.
export function applyDamage(unit: Unit, amount: number): Unit {
  const net = Math.max(0, amount - unit.blk);
  return { ...unit, hp: Math.max(0, unit.hp - net) };
}

export function createCombat(arcanist: Unit, enemies: Unit[]): CombatState {
  // Player turn opens with Effect → Mana → Draw → Play; all no-ops this slice,
  // so combat simply waits on the Play phase for End turn.
  return { units: [arcanist, ...enemies], turn: "player", outcome: "ongoing" };
}

// End the Play phase: resolve the player's Attack phase, then the enemy turn
// (Effect → Attack → Action; only Attack does work here), then hand control
// back to the player. A no-op once combat is already decided.
export function endTurn(state: CombatState): CombatState {
  if (state.outcome !== "ongoing") return state;

  let units = resolveAttacks(state.units, "player");
  if (outcomeOf(units) !== "ongoing") {
    return { units, turn: "player", outcome: outcomeOf(units) };
  }

  units = resolveAttacks(units, "enemy");
  if (outcomeOf(units) !== "ongoing") {
    return { units, turn: "enemy", outcome: outcomeOf(units) };
  }

  return { units, turn: "player", outcome: "ongoing" };
}

// Every living unit on the attacking side hits all living opponents for its
// atk. Death is instant and checked after each instance: a unit dropped to 0
// hp is removed immediately and forfeits any attack it had not yet made.
function resolveAttacks(units: Unit[], attackingSide: Side): Unit[] {
  let current = units;
  const attackerIds = current
    .filter((u) => u.side === attackingSide)
    .map((u) => u.id);

  for (const attackerId of attackerIds) {
    const attacker = living(current, attackerId);
    if (!attacker) continue; // killed before it could act — attack forfeited

    const targetIds = current
      .filter((u) => u.side !== attackingSide && u.hp > 0)
      .map((u) => u.id);

    for (const targetId of targetIds) {
      current = current.map((u) =>
        u.id === targetId && u.hp > 0 ? applyDamage(u, attacker.atk) : u,
      );
      current = current.filter((u) => u.hp > 0);
    }
  }

  return current;
}

function living(units: Unit[], id: string): Unit | undefined {
  return units.find((u) => u.id === id && u.hp > 0);
}

function outcomeOf(units: Unit[]): Outcome {
  const playerAlive = units.some((u) => u.side === "player" && u.hp > 0);
  const enemyAlive = units.some((u) => u.side === "enemy" && u.hp > 0);
  if (!playerAlive) return "loss";
  if (!enemyAlive) return "win";
  return "ongoing";
}
