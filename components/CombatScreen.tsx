"use client";

// Thin renderer over the combat engine: paints the two units with always-on
// stats and drives the turn loop through `endTurn`. All combat logic lives in
// `@/utils/combat`; this layer only reflects state and reports the outcome.

import { useEffect, useState } from "react";
import Image from "next/image";
import { CombatState, Unit, endTurn } from "@/utils/combat";
import { ScreenBackground } from "@/ui/ScreenBackground";
import { DeckView } from "./DeckView";
import arcanistSprite from "@/assets/sprites/arcanist.png";
import knightSprite from "@/assets/sprites/knight.png";

interface CombatScreenProps {
  initialState: CombatState;
  deck: string[];
  onWin: () => void;
  onLoss: () => void;
}

export function CombatScreen({
  initialState,
  deck,
  onWin,
  onLoss,
}: CombatScreenProps) {
  const [state, setState] = useState(initialState);
  const [deckOpen, setDeckOpen] = useState(false);

  useEffect(() => {
    if (state.outcome === "win") onWin();
    else if (state.outcome === "loss") onLoss();
  }, [state.outcome, onWin, onLoss]);

  const arcanist = state.units.find((u) => u.side === "player");
  const enemies = state.units.filter((u) => u.side === "enemy");
  const decided = state.outcome !== "ongoing";

  return (
    <main className="relative flex min-h-full flex-1 flex-col p-6">
      <ScreenBackground />

      <button
        type="button"
        aria-label="View deck"
        onClick={() => setDeckOpen(true)}
        className="absolute right-4 top-4 rounded-md bg-black/50 px-3 py-2 text-2xl leading-none text-white hover:bg-black/70"
      >
        🂠
      </button>

      {/* Battlefield: arcanist on the left, enemies on the right. */}
      <div className="flex flex-1 items-center justify-between gap-8 px-4">
        {arcanist && <UnitView unit={arcanist} />}
        <div className="flex items-center gap-8">
          {enemies.map((enemy) => (
            <UnitView key={enemy.id} unit={enemy} />
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={() => setState(endTurn(state))}
        disabled={decided}
        className="mx-auto mb-8 rounded-full bg-amber-600 px-10 py-4 text-lg font-semibold text-white shadow-lg hover:bg-amber-500 disabled:opacity-50"
      >
        End turn
      </button>

      {deckOpen && <DeckView cards={deck} onClose={() => setDeckOpen(false)} />}
    </main>
  );
}

function UnitView({ unit }: { unit: Unit }) {
  const sprite = unit.side === "player" ? arcanistSprite : knightSprite;
  return (
    <div className="flex flex-col items-center gap-2">
      <Image
        src={sprite}
        alt={unit.name}
        width={200}
        height={300}
        className="h-auto w-40 drop-shadow-xl md:w-52"
      />
      <dl
        aria-label={`${unit.name} stats`}
        className="grid grid-cols-3 gap-x-3 rounded-md bg-black/60 px-4 py-2 text-center text-white"
      >
        <Stat label="HP" value={unit.hp} />
        <Stat label="ATK" value={unit.atk} />
        <Stat label="BLK" value={unit.blk} />
      </dl>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-white/60">{label}</dt>
      <dd className="text-lg font-semibold tabular-nums">{value}</dd>
    </div>
  );
}
