"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { CombatScreen } from "@/components/CombatScreen";
import { usePersistedRun } from "@/components/use-persisted-run";
import { clearRun } from "@/utils/run-storage";
import { Unit, createCombat } from "@/utils/combat";

// Temporary "start combat" entry point. The real encounter/level flow (which
// enemy, with what stats) arrives in slice 08; for now this drops the arcanist
// into a single demo fight so the turn loop is demoable end-to-end. The dummy
// enemy is deliberately beatable with the arcanist's bare atk of 1.

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
    hp: 3,
    maxHp: 3,
    atk: 5,
    blk: 0,
  };
}

export default function CombatPage() {
  const router = useRouter();
  const run = usePersistedRun();

  const initialState = useMemo(
    () => createCombat(makeArcanist(), [makeDemoEnemy()]),
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
    />
  );
}
