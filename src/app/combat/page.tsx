"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { CombatScreen } from "@/components/CombatScreen";
import { usePersistedRun } from "@/components/use-persisted-run";
import { clearRun, saveRun } from "@/utils/run-storage";
import { Unit, createCombat } from "@/utils/combat";
import { makeFastKnight, makeBarbarian } from "@/utils/enemies";
import { DEBUG_DECK, toInstances } from "@/utils/cards";

// Temporary "start combat" entry point. The real encounter/level flow (which
// enemy, with what stats) and real drafting arrive in slice 08; for now this
// drops the arcanist into a multi-enemy demo fight against the level-1 roster,
// seeded with the debug deck, so the full combat loop is demoable end-to-end.

function makeArcanist(): Unit {
  return {
    id: "arcanist",
    name: "Arcanist",
    side: "player",
    hp: 100,
    maxHp: 100,
    atk: 1,
    blk: 0,
    statuses: {},
  };
}

export default function CombatPage() {
  const router = useRouter();
  const run = usePersistedRun();

  // Seed the fight with the run's Permanent elemental-damage total so bonuses
  // earned in earlier encounters still apply.
  const permanentElementalDamage = run?.permanentElementalDamage ?? 0;
  const initialState = useMemo(
    () =>
      createCombat(
        makeArcanist(),
        [makeFastKnight("fast-knight"), makeBarbarian("barbarian")],
        toInstances(DEBUG_DECK),
        Math.random,
        permanentElementalDamage,
      ),
    [permanentElementalDamage],
  );

  // No run means nothing to fight in — head home.
  useEffect(() => {
    if (run === null) router.replace("/");
  }, [run, router]);

  if (!run) return null;

  return (
    <CombatScreen
      initialState={initialState}
      deck={run.deck}
      onWin={(permanentElementalDamage) => {
        // Persist any Permanent bonuses earned this fight to the checkpoint.
        saveRun({ ...run, permanentElementalDamage });
        router.replace("/adventure");
      }}
      onLoss={() => {
        clearRun();
        router.replace("/");
      }}
      onRetire={() => {
        clearRun();
        router.replace("/");
      }}
    />
  );
}
