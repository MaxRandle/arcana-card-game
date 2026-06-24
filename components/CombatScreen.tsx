"use client";

// Thin renderer over the combat engine: paints the two units with always-on
// stats, the fanned hand, and the mana indicator, and drives the turn loop
// through `endTurn`/`playCard`. All combat logic lives in `@/utils/combat`;
// this layer only reflects state, handles drag-to-target, and reports outcome.

import { useEffect, useState } from "react";
import Image from "next/image";
import { CombatState, Unit, endTurn, playCard } from "@/utils/combat";
import { CardInstance, Rng } from "@/utils/deck";
import { CardView } from "@/ui/CardView";
import { DeckView } from "./DeckView";
import arcanistSprite from "@/assets/sprites/arcanist.png";
import knightSprite from "@/assets/sprites/knight.png";

interface CombatScreenProps {
  initialState: CombatState;
  deck: string[];
  onWin: () => void;
  onLoss: () => void;
  /** Wipes the run and returns to Home (the menu's Retire action). */
  onRetire: () => void;
  /** Injectable for deterministic draws in tests. */
  rng?: Rng;
}

interface Pointer {
  x: number;
  y: number;
}

export function CombatScreen({
  initialState,
  deck,
  onWin,
  onLoss,
  onRetire,
  rng = Math.random,
}: CombatScreenProps) {
  const [state, setState] = useState(initialState);
  const [deckOpen, setDeckOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [dragging, setDragging] = useState<string | null>(null);
  const [pointer, setPointer] = useState<Pointer | null>(null);
  // Where the held card sits in the hand — the targeting arrow's anchor.
  const [origin, setOrigin] = useState<Pointer | null>(null);

  useEffect(() => {
    if (state.outcome === "win") onWin();
    else if (state.outcome === "loss") onLoss();
  }, [state.outcome, onWin, onLoss]);

  // While a card is held, track the cursor (for the arrow / floating card) and
  // cancel the drag if the player releases anywhere but a valid target.
  useEffect(() => {
    if (dragging === null) return;
    const onMove = (e: PointerEvent) =>
      setPointer({ x: e.clientX, y: e.clientY });
    const onUp = cancelDrag;
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [dragging]);

  const arcanist = state.units.find((u) => u.side === "player");
  const enemies = state.units.filter((u) => u.side === "enemy");
  const decided = state.outcome !== "ongoing";

  function startDrag(instanceId: string, e: React.PointerEvent) {
    const rect = e.currentTarget.getBoundingClientRect();
    setOrigin({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
    setDragging(instanceId);
    setPointer({ x: e.clientX, y: e.clientY });
  }

  function cancelDrag() {
    setDragging(null);
    setPointer(null);
    setOrigin(null);
  }

  function dropOn(unit: Unit) {
    if (dragging === null) return;
    setState((s) => playCard(s, dragging, unit.id));
    cancelDrag();
  }

  const heldCard = dragging
    ? state.deck.hand.find((c) => c.instanceId === dragging)
    : undefined;
  // Targeted cards stay lifted in the hand and draw an arrow to the cursor;
  // untargeted cards float above the hand following the cursor (no arrow).
  const heldTargeted = heldCard
    ? heldCard.card.targeting !== "untargeted"
    : false;

  return (
    <main className="relative flex min-h-full flex-1 flex-col overflow-hidden p-6">
      {/* Top-left hamburger menu */}
      <div className="absolute left-4 top-4 z-30">
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

      <button
        type="button"
        aria-label="View deck"
        onClick={() => setDeckOpen(true)}
        className="absolute right-4 top-4 rounded-md bg-black/50 px-3 py-2 text-2xl leading-none text-white hover:bg-black/70"
      >
        🂠
      </button>

      <div
        aria-label="Mana"
        className="absolute bottom-6 left-6 z-30 flex items-center gap-2 rounded-md bg-sky-900/70 px-3 py-2 text-white"
      >
        <span aria-hidden className="text-xl leading-none">
          💧
        </span>
        <span className="text-lg font-semibold tabular-nums">{state.mana}</span>
      </div>

      {/* Battlefield: arcanist on the left, enemies on the right. */}
      <div className="flex flex-1 items-center justify-between gap-8 px-4">
        {arcanist && <UnitView unit={arcanist} onDrop={dropOn} />}
        <div className="flex items-center gap-8">
          {enemies.map((enemy) => (
            <UnitView key={enemy.id} unit={enemy} onDrop={dropOn} />
          ))}
        </div>
      </div>

      <Hand
        cards={state.deck.hand}
        dragging={dragging}
        draggingTargeted={heldTargeted}
        onGrab={startDrag}
      />

      <button
        type="button"
        onClick={() => setState(endTurn(state, rng))}
        disabled={decided}
        className="absolute bottom-8 right-6 z-30 rounded-full bg-amber-600 px-8 py-4 text-lg font-semibold text-white shadow-lg hover:bg-amber-500 disabled:opacity-50"
      >
        End turn
      </button>

      {/* Targeted: the card stays lifted in the hand; only an arrow follows the
          cursor. Untargeted: the card floats above the hand, no arrow. */}
      {heldCard && pointer && heldTargeted && origin && (
        <svg className="pointer-events-none fixed inset-0 z-40 h-full w-full">
          <line
            x1={origin.x}
            y1={origin.y}
            x2={pointer.x}
            y2={pointer.y}
            stroke="#fbbf24"
            strokeWidth={4}
            strokeDasharray="8 6"
          />
        </svg>
      )}
      {heldCard && pointer && !heldTargeted && (
        <div
          className="pointer-events-none fixed z-50 h-44 w-32 -translate-x-1/2 -translate-y-1/2"
          style={{ left: pointer.x, top: pointer.y }}
        >
          <CardView card={heldCard.card} />
        </div>
      )}

      {deckOpen && <DeckView cards={deck} onClose={() => setDeckOpen(false)} />}
    </main>
  );
}

function Hand({
  cards,
  dragging,
  draggingTargeted,
  onGrab,
}: {
  cards: CardInstance[];
  dragging: string | null;
  /** True when the held card is targeted (it stays lifted, not floated away). */
  draggingTargeted: boolean;
  onGrab: (instanceId: string, e: React.PointerEvent) => void;
}) {
  return (
    <ul
      aria-label="Hand"
      className="pointer-events-none absolute bottom-2 left-1/2 z-30 flex -translate-x-1/2 justify-center"
    >
      {cards.map((c, i) => {
        const offset = i - (cards.length - 1) / 2;
        const held = dragging === c.instanceId;
        // A held targeted card rises in place; a held untargeted card is hidden
        // here because it floats above the hand following the cursor instead.
        const lifted = held && draggingTargeted;
        const hidden = held && !draggingTargeted;
        const rotate = lifted ? 0 : offset * 4;
        // Arrange the hand as a shallow bow: edge cards sit lower than the
        // centre ones (a parabola in the card's distance from centre).
        const arc = lifted ? 0 : offset * offset * 0.18;
        const lift = (lifted ? -2.5 : 0) + arc;
        return (
          <li
            key={c.instanceId}
            role="button"
            tabIndex={0}
            aria-label={`Play ${c.card.title}`}
            onPointerDown={(e) => onGrab(c.instanceId, e)}
            style={{
              transform: `translateX(${offset * 1.5}rem) translateY(${lift}rem) rotate(${rotate}deg)`,
              visibility: hidden ? "hidden" : "visible",
            }}
            className="pointer-events-auto -mx-6 h-44 w-32 origin-bottom cursor-grab transition-transform hover:-translate-y-4 active:cursor-grabbing"
          >
            <CardView card={c.card} />
          </li>
        );
      })}
    </ul>
  );
}

function UnitView({
  unit,
  onDrop,
}: {
  unit: Unit;
  onDrop: (unit: Unit) => void;
}) {
  const sprite = unit.side === "player" ? arcanistSprite : knightSprite;
  return (
    <div
      aria-label={`${unit.name} target`}
      onPointerUp={() => onDrop(unit)}
      className="flex flex-col items-center gap-2"
    >
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
