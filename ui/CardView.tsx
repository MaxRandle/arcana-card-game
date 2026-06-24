// Static visual for a single card: cost pip (top-left), title, a splash-art
// area (~1/3 height), and the body text below. Purely presentational — drag and
// play behaviour lives in the combat screen.

import { Card } from "@/utils/cards";

export function CardView({ card }: { card: Card }) {
  return (
    <div className="flex h-full w-full flex-col overflow-hidden rounded-lg border border-amber-300/40 bg-zinc-800 text-white shadow-lg select-none">
      <div className="relative px-2 pt-2">
        <span className="absolute left-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-sky-700 text-sm font-bold tabular-nums">
          {card.cost}
        </span>
        <h3 className="text-center text-sm font-semibold">{card.title}</h3>
      </div>
      <div className="mx-2 mt-1 h-1/3 rounded bg-gradient-to-b from-indigo-500/40 to-fuchsia-500/30" />
      <p className="flex-1 px-2 py-2 text-center text-xs leading-snug text-white/90">
        {card.body}
      </p>
    </div>
  );
}
