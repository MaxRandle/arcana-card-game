// A single status chip sitting under the health bar. Passives are grey squares,
// buffs green up-triangles, debuffs red down-triangles. The inner area is left
// open for a small glyph (added later); buffs and debuffs carry a stack counter
// in the top-right corner. Presentational only.

import React, { forwardRef } from "react";
import { tv, type VariantProps } from "tailwind-variants";

/** Category of status, driving the chip's shape and colour. */
export type StatusKind = "passive" | "buff" | "debuff";

/** A status to render: its category, an optional glyph, and an optional stack. */
export interface UnitStatus {
  kind: StatusKind;
  /** Accessible name, e.g. "Poison". */
  label?: string;
  /** Stack count shown in the corner badge (buffs/debuffs). */
  stacks?: number;
}

const StatusIconStyles = tv({
  slots: {
    root: "relative inline-flex h-7 w-7 items-center justify-center text-white",
    shape: "absolute inset-0 ring-1 ring-black/30",
    badge:
      "absolute -right-1 -top-1 z-10 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-black px-0.5 text-[9px] font-bold leading-none tabular-nums text-white",
  },
  variants: {
    /**
     * @summary Status category — selects shape (square / up / down) and colour.
     * @default "passive"
     */
    kind: {
      passive: { shape: "rounded-sm bg-zinc-500" },
      buff: {
        shape: "bg-emerald-500 [clip-path:polygon(50%_0,100%_100%,0_100%)]",
      },
      debuff: {
        shape: "bg-red-500 [clip-path:polygon(0_0,100%_0,50%_100%)]",
      },
    },
  },
  defaultVariants: {
    kind: "passive",
  },
});

type StatusIconVariants = VariantProps<typeof StatusIconStyles>;

export type StatusIconProps = Omit<
  React.ComponentPropsWithoutRef<"div">,
  keyof StatusIconVariants
> &
  Required<Pick<StatusIconVariants, "kind">> & {
    /** Stack count; rendered as a corner badge when greater than one. */
    stacks?: number;
    /** Accessible label for the status. */
    label?: string;
  };

export const StatusIcon = forwardRef<HTMLDivElement, StatusIconProps>(
  ({ kind, stacks, label, className, ...props }, ref) => {
    const { root, shape, badge } = StatusIconStyles({ kind });

    return (
      <div
        ref={ref}
        role="img"
        aria-label={label ?? kind}
        className={root({ className })}
        {...props}
      >
        <span aria-hidden className={shape()} />
        {stacks !== undefined && stacks > 1 && (
          <span className={badge()}>{stacks}</span>
        )}
      </div>
    );
  },
);

StatusIcon.displayName = "StatusIcon";
