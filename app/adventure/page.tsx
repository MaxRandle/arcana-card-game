"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AdventureScreen } from "@/components/AdventureScreen";
import { usePersistedRun } from "@/components/use-persisted-run";
import { clearRun } from "@/utils/run-storage";

export default function AdventurePage() {
  const router = useRouter();
  const run = usePersistedRun();

  // A resolved-but-absent run (null, not undefined) means there's nothing to
  // adventure in, so head home.
  useEffect(() => {
    if (run === null) router.replace("/");
  }, [run, router]);

  function retire() {
    clearRun();
    router.replace("/");
  }

  // undefined: still resolving on the client. null: redirecting home.
  if (!run) return null;

  return (
    <AdventureScreen
      run={run}
      onRetire={retire}
      onStartCombat={() => router.push("/combat")}
    />
  );
}
