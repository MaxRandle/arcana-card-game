"use client";

// The between-encounter drafting picker. Renders the run's current draft offer —
// an arcana draft (pick a school to unlock its pool) or a card draft (pick a
// card into the deck) — and reports the choice. All offer/pool logic lives in
// the run state; this layer only reflects the offer and reports the pick.

import { Arcana, cardOf } from "@/utils/cards";
import { RunActivity } from "@/utils/run-state";
import { CardView } from "@/ui/CardView";

const ARCANA_LABEL: Record<Arcana, string> = {
  air: "Air",
  water: "Water",
  earth: "Earth",
  fire: "Fire",
  lightning: "Lightning",
  generic: "Generic",
};

type DraftActivity = Extract<
  RunActivity,
  { kind: "arcana-draft" } | { kind: "card-draft" }
>;

interface DraftViewProps {
  activity: DraftActivity;
  onPickArcana: (arcana: Arcana) => void;
  onPickCard: (cardId: string) => void;
}

export function DraftView({
  activity,
  onPickArcana,
  onPickCard,
}: DraftViewProps) {
  if (activity.kind === "arcana-draft") {
    return (
      <section aria-label="Arcana draft" className="flex flex-col items-center gap-6">
        <h2 className="text-2xl font-semibold text-white">Choose an arcana</h2>
        <ul className="flex flex-wrap justify-center gap-4">
          {activity.offer.map((arcana) => (
            <li key={arcana}>
              <button
                type="button"
                onClick={() => onPickArcana(arcana)}
                className="rounded-xl bg-amber-600 px-8 py-6 text-xl font-semibold text-white shadow-lg hover:bg-amber-500"
              >
                {ARCANA_LABEL[arcana]}
              </button>
            </li>
          ))}
        </ul>
      </section>
    );
  }

  return (
    <section aria-label="Card draft" className="flex flex-col items-center gap-6">
      <h2 className="text-2xl font-semibold text-white">
        Choose a card{" "}
        <span className="text-base font-normal text-white/70">
          ({activity.remaining} left)
        </span>
      </h2>
      <ul className="flex flex-wrap justify-center gap-4">
        {activity.offer.map((cardId) => (
          <li key={cardId}>
            <button
              type="button"
              aria-label={`Pick ${cardOf(cardId).title}`}
              onClick={() => onPickCard(cardId)}
              className="block h-56 w-40 rounded-lg transition-transform hover:-translate-y-2 focus:-translate-y-2"
            >
              <CardView card={cardOf(cardId)} />
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
