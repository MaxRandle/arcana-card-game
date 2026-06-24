"use client";

// Overlay listing the run's owned cards in a 5-across, wrapping, scrolling
// grid. Reused later by the combat screen's View Deck button.

interface DeckViewProps {
  cards: string[];
  onClose: () => void;
}

export function DeckView({ cards, onClose }: DeckViewProps) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Deck"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-8"
    >
      <div className="flex max-h-full w-full max-w-4xl flex-col rounded-xl bg-zinc-900 text-zinc-50 shadow-2xl">
        <header className="flex items-center justify-between border-b border-white/10 px-6 py-4">
          <h2 className="text-xl font-semibold">Deck</h2>
          <button
            type="button"
            aria-label="Close deck"
            onClick={onClose}
            className="rounded-full px-3 py-1 text-2xl leading-none hover:bg-white/10"
          >
            ×
          </button>
        </header>

        <div className="overflow-y-auto p-6">
          {cards.length === 0 ? (
            <p className="py-16 text-center text-zinc-400">
              No cards yet — win encounters to build your deck.
            </p>
          ) : (
            <ul className="grid grid-cols-5 gap-4">
              {cards.map((card, i) => (
                <li
                  key={`${card}-${i}`}
                  className="aspect-[2/3] rounded-lg bg-zinc-800 p-2"
                >
                  {card}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
