// Serializable run state — the between-encounter checkpoint everything else
// hangs off (see ADR-0001). Keep this shape small and stable: it is the
// contract the progression logic (./progression) writes to. No UI concerns and
// no transition logic here — only the type, the current activity, and
// (de)serialization.

import { Arcana } from "./cards";

export const RUN_STATE_VERSION = 3;
export const STARTING_HP = 100;

// What the player must do next. Drafts carry their rolled offer so a refresh
// reproduces the same choices (ADR-0001). A card-draft's `pool` is the arcana it
// draws from, `remaining` how many picks are left in the batch, and `next` what
// happens when the batch empties: start the level's encounters, or advance past
// the just-cleared encounter (a post-encounter reward draft).
export type RunActivity =
  | { kind: "arcana-draft"; offer: Arcana[] }
  | {
      kind: "card-draft";
      offer: string[];
      pool: Arcana[];
      remaining: number;
      next: "encounter" | "advance";
    }
  | { kind: "encounter" }
  | { kind: "won" }
  | { kind: "lost" };

export interface RunState {
  /** Owned card ids — the run's deck. */
  deck: string[];
  /** Current HP, carried across encounters. */
  hp: number;
  /** Max HP, including permanent changes earned during the run. */
  maxHp: number;
  /** 1-based current level. */
  level: number;
  /** 1-based encounter within the current level. */
  encounter: number;
  /** Arcana whose pools the player has unlocked, in pick order. */
  unlockedArcana: Arcana[];
  /**
   * Running total of Permanent elemental-damage bonuses earned this run. Seeded
   * back into each combat so Permanent effects persist across encounters.
   */
  permanentElementalDamage: number;
  /** What the player does next between fights. */
  activity: RunActivity;
}

// The Adventure CTA label, read from real position: a fresh level's first
// encounter reads "Next level", every other encounter "Next encounter".
export function ctaLabel(run: RunState): string {
  return run.encounter === 1 && run.level > 1 ? "Next level" : "Next encounter";
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
  const {
    deck,
    hp,
    maxHp,
    level,
    encounter,
    unlockedArcana,
    permanentElementalDamage,
    activity,
  } = parsed;
  return {
    deck,
    hp,
    maxHp,
    level,
    encounter,
    unlockedArcana,
    permanentElementalDamage,
    activity,
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
    Array.isArray(v.unlockedArcana) &&
    v.unlockedArcana.every((a) => typeof a === "string") &&
    typeof v.permanentElementalDamage === "number" &&
    isActivity(v.activity)
  );
}

function isActivity(value: unknown): value is RunActivity {
  if (typeof value !== "object" || value === null) return false;
  const a = value as Record<string, unknown>;
  switch (a.kind) {
    case "arcana-draft":
      return Array.isArray(a.offer);
    case "card-draft":
      return (
        Array.isArray(a.offer) &&
        Array.isArray(a.pool) &&
        typeof a.remaining === "number" &&
        (a.next === "encounter" || a.next === "advance")
      );
    case "encounter":
    case "won":
    case "lost":
      return true;
    default:
      return false;
  }
}
