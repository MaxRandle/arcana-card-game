"use client";

import { useState } from "react";
import { RunState, ctaLabel } from "@/utils/run-state";
import { DeckView } from "./DeckView";

interface AdventureScreenProps {
  run: RunState;
  onRetire: () => void;
  onStartCombat: () => void;
}

export function AdventureScreen({
  run,
  onRetire,
  onStartCombat,
}: AdventureScreenProps) {
  const [deckOpen, setDeckOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <main className="relative flex min-h-full flex-1 flex-col items-center justify-end p-6">
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

      {/* Main CTA */}
      <button
        type="button"
        onClick={onStartCombat}
        className="mb-12 rounded-full bg-amber-600 px-10 py-4 text-lg font-semibold text-white shadow-lg hover:bg-amber-500"
      >
        {ctaLabel(run)}
      </button>

      {deckOpen && (
        <DeckView cards={run.deck} onClose={() => setDeckOpen(false)} />
      )}
    </main>
  );
}
