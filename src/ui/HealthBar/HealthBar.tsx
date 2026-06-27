// Horizontal hitpoint bar: a filled track whose width tracks current / max hp,
// with the numeric ratio overlaid. Purely presentational — the clamp keeps a
// stray out-of-range value from overflowing the track.

import React, { forwardRef } from "react";
import { tv, type VariantProps } from "tailwind-variants";

const HealthBarStyles = tv({
  slots: {
    root: "relative h-4 w-full overflow-hidden rounded-full bg-black/60 ring-1 ring-white/20",
    fill: "h-full rounded-full bg-gradient-to-b transition-[width] duration-300",
    label:
      "absolute inset-0 flex items-center justify-center text-[10px] font-semibold tabular-nums text-white drop-shadow",
  },
  variants: {
    /**
     * @summary Fill colour, typically driven by how hurt the unit is.
     * @default "healthy"
     */
    tone: {
      healthy: { fill: "from-emerald-400 to-emerald-600" },
      hurt: { fill: "from-amber-400 to-amber-600" },
      critical: { fill: "from-red-500 to-red-700" },
    },
  },
  defaultVariants: {
    tone: "healthy",
  },
});

type HealthBarVariants = VariantProps<typeof HealthBarStyles>;

export type HealthBarProps = Omit<
  React.ComponentPropsWithoutRef<"div">,
  keyof HealthBarVariants
> &
  HealthBarVariants & {
    /** Current hitpoints. */
    value: number;
    /** Maximum hitpoints; the bar is full at this value. */
    max: number;
  };

export const HealthBar = forwardRef<HTMLDivElement, HealthBarProps>(
  ({ value, max, tone, className, ...props }, ref) => {
    const { root, fill, label } = HealthBarStyles({ tone });
    const pct = max > 0 ? Math.max(0, Math.min(1, value / max)) : 0;

    return (
      <div
        ref={ref}
        role="meter"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label="Hitpoints"
        className={root({ className })}
        {...props}
      >
        <div className={fill()} style={{ width: `${pct * 100}%` }} />
        <span className={label()}>
          {value}/{max}
        </span>
      </div>
    );
  },
);

HealthBar.displayName = "HealthBar";
