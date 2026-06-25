// A single combat stat shown as a numeral inside a large shaped badge. Attack
// is a red spiked disc; Block is a blue shield. The shape is drawn with an
// inline SVG behind centred text — purely presentational.

import React, { forwardRef } from "react";
import { tv, type VariantProps } from "tailwind-variants";

// 12-point spiked disc, drawn in a 100×100 box. Alternating outer/inner radii
// give the aggressive "attack" silhouette.
const SPIKE_POINTS = Array.from({ length: 24 }, (_, i) => {
  const angle = (Math.PI / 12) * i - Math.PI / 2;
  const r = i % 2 === 0 ? 50 : 36;
  const x = 50 + r * Math.cos(angle);
  const y = 50 + r * Math.sin(angle);
  return `${x.toFixed(1)},${y.toFixed(1)}`;
}).join(" ");

const SHIELD_PATH = "M50 4 L92 18 V52 C92 78 72 92 50 98 C28 92 8 78 8 52 V18 Z";

const StatIndicatorStyles = tv({
  slots: {
    root: "relative inline-flex h-11 w-11 items-center justify-center",
    shape: "absolute inset-0 h-full w-full drop-shadow",
    value:
      "relative z-10 text-base font-bold tabular-nums text-white drop-shadow",
  },
  variants: {
    /**
     * @summary Which stat — selects the shape and palette.
     * @default "attack"
     */
    intent: {
      attack: { shape: "text-red-600" },
      block: { shape: "text-blue-600" },
    },
  },
  defaultVariants: {
    intent: "attack",
  },
});

type StatIndicatorVariants = VariantProps<typeof StatIndicatorStyles>;

export type StatIndicatorProps = Omit<
  React.ComponentPropsWithoutRef<"div">,
  keyof StatIndicatorVariants
> &
  Required<Pick<StatIndicatorVariants, "intent">> & {
    /** The stat value rendered inside the shape. */
    value: number;
  };

export const StatIndicator = forwardRef<HTMLDivElement, StatIndicatorProps>(
  ({ intent, value, className, ...props }, ref) => {
    const { root, shape, value: valueCls } = StatIndicatorStyles({ intent });
    const label = intent === "attack" ? "Attack" : "Block";

    return (
      <div
        ref={ref}
        aria-label={`${label} ${value}`}
        className={root({ className })}
        {...props}
      >
        <svg
          viewBox="0 0 100 100"
          aria-hidden
          className={shape()}
          fill="currentColor"
          stroke="rgba(0,0,0,0.35)"
          strokeWidth={4}
          strokeLinejoin="round"
        >
          {intent === "attack" ? (
            <polygon points={SPIKE_POINTS} />
          ) : (
            <path d={SHIELD_PATH} />
          )}
        </svg>
        <span className={valueCls()}>{value}</span>
      </div>
    );
  },
);

StatIndicator.displayName = "StatIndicator";
