"use client";

import { useRouter } from "next/navigation";
import { HomeScreen } from "@/components/HomeScreen";
import { createRun } from "@/utils/run-state";
import { saveRun } from "@/utils/run-storage";

export default function HomePage() {
  const router = useRouter();

  function startAdventure() {
    saveRun(createRun());
    router.push("/adventure");
  }

  return <HomeScreen onNewAdventure={startAdventure} />;
}
