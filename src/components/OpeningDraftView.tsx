"use client";

// The opening draft, shown once at the start of an encounter: 5 cards from the
// deck, of which the player keeps 3 for the opening hand. The unkept cards and
// the rest of the deck are shuffled into the draw pile. Selection/keep logic
// lives in `@/utils/opening-draft`; this layer only handles the toggle UI.

import { useMemo, useState } from "react";
import { Rng } from "@/utils/deck";
import { toInstances } from "@/utils/cards";
import {
  openingOffer,
  buildOpeningDeck,
  keepTarget,
  toggleKeep,
} from "@/utils/opening-draft";
import { DeckState } from "@/utils/deck";
import { CardView } from "@/ui/CardView";

interface OpeningDraftViewProps {
  /** The run's deck (card ids) to draw the opening offer from. */
  deck: string[];
  /** Receives the combat-start DeckState once the player confirms their keep. */
  onConfirm: (deck: DeckState) => void;
  /** Injectable for deterministic offers in tests. */
  rng?: Rng;
}

export function OpeningDraftView({
  deck,
  onConfirm,
  rng = Math.random,
}: OpeningDraftViewProps) {
  // Roll the offer once; it must not re-roll as the player toggles selections.
  const { offered, rest } = useMemo(
    () => openingOffer(toInstances(deck), rng),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );
  const target = keepTarget(offered);
  const [selected, setSelected] = useState<string[]>([]);

  function toggle(instanceId: string) {
    setSelected((current) => toggleKeep(current, instanceId, target));
  }

  return (
    <main className="flex min-h-full flex-1 flex-col items-center justify-center gap-6 p-6">
      <h2 className="text-2xl font-semibold text-white">
        Keep {target} for your opening hand{" "}
        <span className="text-base font-normal text-white/70">
          ({selected.length}/{target})
        </span>
      </h2>
      <ul aria-label="Opening draft" className="flex flex-wrap justify-center gap-4">
        {offered.map((instance) => {
          const isSelected = selected.includes(instance.instanceId);
          return (
            <li key={instance.instanceId}>
              <button
                type="button"
                aria-label={`Keep ${instance.card.title}`}
                aria-pressed={isSelected}
                onClick={() => toggle(instance.instanceId)}
                className={`block h-56 w-40 rounded-lg transition-transform ${
                  isSelected ? "-translate-y-3 ring-4 ring-amber-400" : ""
                }`}
              >
                <CardView card={instance.card} />
              </button>
            </li>
          );
        })}
      </ul>
      <button
        type="button"
        disabled={selected.length !== target}
        onClick={() => onConfirm(buildOpeningDeck(offered, rest, selected, rng))}
        className="rounded-full bg-amber-600 px-10 py-4 text-lg font-semibold text-white shadow-lg hover:bg-amber-500 disabled:opacity-50"
      >
        Begin combat
      </button>
    </main>
  );
}
