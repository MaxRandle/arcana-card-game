"use client";

import { useState } from "react";
import { Arcana } from "@/utils/cards";
import { RunState, ctaLabel } from "@/utils/run-state";
import { DeckView } from "./DeckView";
import { DraftView } from "./DraftView";

interface AdventureScreenProps {
  run: RunState;
  onRetire: () => void;
  onStartCombat: () => void;
  onPickArcana: (arcana: Arcana) => void;
  onPickCard: (cardId: string) => void;
  /** Ends the run (return Home) from a won/lost screen. */
  onFinish: () => void;
}

export function AdventureScreen({
  run,
  onRetire,
  onStartCombat,
  onPickArcana,
  onPickCard,
  onFinish,
}: AdventureScreenProps) {
  const [deckOpen, setDeckOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <main className="relative flex min-h-full flex-1 flex-col items-center justify-center p-6">
      {/* Top-left hamburger menu */}
      <div className="absolute left-4 top-4">
        <button
          type="button"
          aria-label="Menu"
          aria-haspopup="menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
          className="rounded-md bg-black/50 px-3 py-2 text-2xl leading-none text-white hover:bg-black/70"
        >
          ☰
        </button>
        {menuOpen && (
          <ul
            role="menu"
            className="absolute left-0 mt-2 min-w-40 overflow-hidden rounded-md bg-zinc-900 text-white shadow-xl"
          >
            <li role="none">
              <button
                type="button"
                role="menuitem"
                onClick={onRetire}
                className="block w-full px-4 py-2 text-left hover:bg-white/10"
              >
                Retire
              </button>
            </li>
          </ul>
        )}
      </div>

      {/* Top-right View Deck button */}
      <button
        type="button"
        aria-label="View deck"
        onClick={() => setDeckOpen(true)}
        className="absolute right-4 top-4 rounded-md bg-black/50 px-3 py-2 text-2xl leading-none text-white hover:bg-black/70"
      >
        🂠
      </button>

      <Activity
        run={run}
        onStartCombat={onStartCombat}
        onPickArcana={onPickArcana}
        onPickCard={onPickCard}
        onFinish={onFinish}
      />

      {deckOpen && (
        <DeckView cards={run.deck} onClose={() => setDeckOpen(false)} />
      )}
    </main>
  );
}

function Activity({
  run,
  onStartCombat,
  onPickArcana,
  onPickCard,
  onFinish,
}: {
  run: RunState;
  onStartCombat: () => void;
  onPickArcana: (arcana: Arcana) => void;
  onPickCard: (cardId: string) => void;
  onFinish: () => void;
}) {
  const { activity } = run;

  if (activity.kind === "arcana-draft" || activity.kind === "card-draft") {
    return (
      <DraftView
        activity={activity}
        onPickArcana={onPickArcana}
        onPickCard={onPickCard}
      />
    );
  }

  if (activity.kind === "won" || activity.kind === "lost") {
    const won = activity.kind === "won";
    return (
      <div className="flex flex-col items-center gap-6">
        <h2 className="text-3xl font-semibold text-white">
          {won ? "Run complete!" : "You have fallen"}
        </h2>
        <button
          type="button"
          onClick={onFinish}
          className="rounded-full bg-amber-600 px-10 py-4 text-lg font-semibold text-white shadow-lg hover:bg-amber-500"
        >
          Return home
        </button>
      </div>
    );
  }

  // activity.kind === "encounter"
  return (
    <button
      type="button"
      onClick={onStartCombat}
      className="rounded-full bg-amber-600 px-10 py-4 text-lg font-semibold text-white shadow-lg hover:bg-amber-500"
    >
      {ctaLabel(run)}
    </button>
  );
}
