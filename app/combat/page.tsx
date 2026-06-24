"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { CombatScreen } from "@/components/CombatScreen";
import { usePersistedRun } from "@/components/use-persisted-run";
import { clearRun } from "@/utils/run-storage";
import { Unit, createCombat } from "@/utils/combat";
import { DEBUG_DECK, toInstances } from "@/utils/cards";

// Temporary "start combat" entry point. The real encounter/level flow (which
// enemy, with what stats) and real drafting arrive in slice 08; for now this
// drops the arcanist into a single demo fight, seeded with the debug deck, so
// the card-play loop is demoable end-to-end.

function makeArcanist(): Unit {
  return {
    id: "arcanist",
    name: "Arcanist",
    side: "player",
    hp: 100,
    maxHp: 100,
    atk: 1,
    blk: 0,
  };
}

function makeDemoEnemy(): Unit {
  return {
    id: "knight",
    name: "Knight",
    side: "enemy",
    hp: 20,
    maxHp: 20,
    atk: 3,
    blk: 0,
  };
}

export default function CombatPage() {
  const router = useRouter();
  const run = usePersistedRun();

  const initialState = useMemo(
    () =>
      createCombat(makeArcanist(), [makeDemoEnemy()], toInstances(DEBUG_DECK)),
    [],
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
      onWin={() => router.replace("/adventure")}
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
