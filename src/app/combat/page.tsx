"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CombatScreen } from "@/components/CombatScreen";
import { OpeningDraftView } from "@/components/OpeningDraftView";
import { usePersistedRun } from "@/components/use-persisted-run";
import { clearRun, saveRun } from "@/utils/run-storage";
import { CombatState, Unit, beginCombat } from "@/utils/combat";
import { DeckState } from "@/utils/deck";
import { makeEncounter } from "@/utils/encounters";
import { resolveEncounterWin, resolveEncounterLoss } from "@/utils/progression";

function makeArcanist(hp: number, maxHp: number): Unit {
  return {
    id: "arcanist",
    name: "Arcanist",
    side: "player",
    hp,
    maxHp,
    atk: 1,
    blk: 0,
    statuses: {},
  };
}

export default function CombatPage() {
  const router = useRouter();
  const run = usePersistedRun();
  // The combat begins only once the opening draft sets the opening hand; until
  // then we show the draft. A mid-combat refresh discards this and restarts the
  // encounter from the checkpoint (ADR-0001).
  const [combat, setCombat] = useState<CombatState | null>(null);

  // The enemy line-up for the run's real position.
  const enemies = useMemo(
    () => (run ? makeEncounter(run.level, run.encounter) : []),
    [run],
  );

  // No run, or the run isn't sitting on an encounter — head back to adventure.
  useEffect(() => {
    if (run === null) router.replace("/");
    else if (run && run.activity.kind !== "encounter") router.replace("/adventure");
  }, [run, router]);

  if (!run || run.activity.kind !== "encounter") return null;

  if (combat === null) {
    return (
      <OpeningDraftView
        deck={run.deck}
        onConfirm={(deck: DeckState) =>
          setCombat(
            beginCombat(
              makeArcanist(run.hp, run.maxHp),
              enemies,
              deck,
              Math.random,
              run.permanentElementalDamage,
            ),
          )
        }
      />
    );
  }

  return (
    <CombatScreen
      initialState={combat}
      deck={run.deck}
      onWin={(result) => {
        saveRun(resolveEncounterWin(run, result));
        router.replace("/adventure");
      }}
      onLoss={() => {
        saveRun(resolveEncounterLoss(run));
        router.replace("/adventure");
      }}
      onRetire={() => {
        clearRun();
        router.replace("/");
      }}
    />
  );
}
