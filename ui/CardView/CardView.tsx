// Static visual for a single card: cost pip (top-left), title, a splash-art
// area (~1/3 height), and the body text below. Purely presentational — drag and
// play behaviour lives in the combat screen.

import React, { forwardRef } from "react";
import { tv, type VariantProps } from "tailwind-variants";

import { Arcana, Card } from "@/utils/cards";

const CardViewStyles = tv({
  slots: {
    root: "relative flex h-full w-full flex-col rounded-lg border bg-zinc-800 text-white shadow-lg select-none",
    pip: "absolute -left-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full text-sm font-bold tabular-nums",
    splash: "mx-2 mt-1 h-1/3 rounded bg-gradient-to-b",
  },
  variants: {
    /**
     * @summary Elemental school driving the card's border and splash palette.
     * @default "generic"
     */
    arcana: {
      air: {
        root: "border-sky-300/40",
        pip: "bg-sky-700",
        splash: "from-sky-400/40 to-cyan-300/30",
      },
      water: {
        root: "border-blue-300/40",
        pip: "bg-blue-700",
        splash: "from-blue-500/40 to-cyan-400/30",
      },
      earth: {
        root: "border-emerald-300/40",
        pip: "bg-emerald-700",
        splash: "from-emerald-500/40 to-lime-400/30",
      },
      fire: {
        root: "border-orange-300/40",
        pip: "bg-orange-700",
        splash: "from-orange-500/40 to-red-500/30",
      },
      lightning: {
        root: "border-violet-300/40",
        pip: "bg-violet-700",
        splash: "from-violet-500/40 to-fuchsia-400/30",
      },
      generic: {
        root: "border-amber-300/40",
        pip: "bg-sky-700",
        splash: "from-indigo-500/40 to-fuchsia-500/30",
      },
    },
  },
  defaultVariants: {
    arcana: "generic",
  },
});

type CardViewVariants = VariantProps<typeof CardViewStyles>;

export type CardViewProps = Omit<
  React.ComponentPropsWithoutRef<"div">,
  keyof CardViewVariants
> & {
  /** The card to render. Its `arcana` drives the palette. */
  card: Card;
  /** Cost shown in the pip; defaults to the card's base cost. Lets the combat
   *  screen show a ramped card's current effective cost. */
  cost?: number;
};

export const CardView = forwardRef<HTMLDivElement, CardViewProps>(
  ({ card, cost, className, ...props }, ref) => {
    const { root, pip, splash } = CardViewStyles({
      arcana: card.arcana as Arcana,
    });

    return (
      <div ref={ref} className={root({ className })} {...props}>
        <span className={pip()}>{cost ?? card.cost}</span>
        <div className="px-2 pt-2">
          <h3 className="text-center text-sm font-semibold">{card.title}</h3>
        </div>
        <div className={splash()} />
        <p className="flex-1 px-2 py-2 text-center text-xs leading-snug text-white/90">
          {card.body}
        </p>
      </div>
    );
  },
);

CardView.displayName = "CardView";
