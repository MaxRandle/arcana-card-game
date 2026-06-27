// Serializable run state — the between-encounter checkpoint everything else
// hangs off (see ADR-0001). Keep this shape small and stable: it is the
// contract the later progression slice writes to. No UI concerns here.

export const RUN_STATE_VERSION = 2;
export const STARTING_HP = 100;

export type RunPhase = "between-encounters" | "between-levels";

export interface RunState {
  /** Owned card ids — the run's deck. Empty until cards are acquired. */
  deck: string[];
  /** Current HP, carried across encounters. */
  hp: number;
  /** Max HP, including permanent changes earned during the run. */
  maxHp: number;
  /** 1-based current level. */
  level: number;
  /** 1-based encounter within the current level. */
  encounter: number;
  /** Where the player sits between fights. */
  phase: RunPhase;
  /**
   * Running total of Permanent elemental-damage bonuses earned this run. Seeded
   * back into each combat so Permanent effects persist across encounters.
   */
  permanentElementalDamage: number;
}

export function createRun(): RunState {
  return {
    deck: [],
    hp: STARTING_HP,
    maxHp: STARTING_HP,
    level: 1,
    encounter: 1,
    phase: "between-encounters",
    permanentElementalDamage: 0,
  };
}

export function ctaLabel(run: RunState): string {
  return run.phase === "between-levels" ? "Next level" : "Next encounter";
}

export function serializeRun(run: RunState): string {
  return JSON.stringify({ version: RUN_STATE_VERSION, ...run });
}

export function deserializeRun(raw: string): RunState | null {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }
  if (!isVersionedRun(parsed)) return null;
  const { deck, hp, maxHp, level, encounter, phase, permanentElementalDamage } =
    parsed;
  return {
    deck,
    hp,
    maxHp,
    level,
    encounter,
    phase,
    permanentElementalDamage,
  };
}

type VersionedRun = RunState & { version: number };

function isVersionedRun(value: unknown): value is VersionedRun {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    v.version === RUN_STATE_VERSION &&
    Array.isArray(v.deck) &&
    v.deck.every((c) => typeof c === "string") &&
    typeof v.hp === "number" &&
    typeof v.maxHp === "number" &&
    typeof v.level === "number" &&
    typeof v.encounter === "number" &&
    (v.phase === "between-encounters" || v.phase === "between-levels") &&
    typeof v.permanentElementalDamage === "number"
  );
}
