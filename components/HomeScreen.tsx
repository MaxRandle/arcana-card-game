"use client";

import { ScreenBackground } from "@/ui/ScreenBackground";

interface HomeScreenProps {
  onNewAdventure: () => void;
}

export function HomeScreen({ onNewAdventure }: HomeScreenProps) {
  return (
    <main className="relative flex min-h-full flex-1 flex-col items-center justify-center p-6">
      <ScreenBackground />

      <h1 className="mb-12 text-5xl font-bold tracking-tight text-white drop-shadow-lg">
        Arcana
      </h1>

      <button
        type="button"
        onClick={onNewAdventure}
        className="rounded-full bg-amber-600 px-10 py-4 text-lg font-semibold text-white shadow-lg hover:bg-amber-500"
      >
        New adventure
      </button>
    </main>
  );
}
