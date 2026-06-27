"use client";

// Wraps an element so that hovering (or focusing) it reveals a small label
// bubble. By default the bubble's top-left corner anchors to the element and it
// grows down and to the right; if a left anchor would run it off the right edge
// of the screen it flips to anchor its top-right corner instead (growing down
// and to the left). Visibility is pure CSS (a named group hover/focus); only the
// flip needs a measurement on hover.

import React, { useRef, useState } from "react";
import { tv } from "tailwind-variants";

const TooltipStyles = tv({
  slots: {
    root: "group/tooltip relative inline-flex",
    bubble:
      "pointer-events-none absolute top-full z-50 mt-1 w-40 rounded bg-black/90 px-2 py-1 text-left text-white opacity-0 shadow-lg transition-opacity group-hover/tooltip:opacity-100 group-focus-within/tooltip:opacity-100",
    name: "block text-xs font-semibold",
    description: "mt-0.5 block text-[11px] font-normal leading-tight text-white/80",
  },
  variants: {
    /**
     * @summary Which corner the bubble is anchored to (and grows away from).
     * @default "left"
     */
    side: {
      left: { bubble: "left-0" },
      right: { bubble: "right-0" },
    },
  },
  defaultVariants: { side: "left" },
});

export type TooltipProps = React.ComponentPropsWithoutRef<"span"> & {
  /** Bold heading shown at the top of the bubble. */
  label: string;
  /** Optional rules text shown under the heading. */
  description?: string;
};

export function Tooltip({
  label,
  description,
  children,
  className,
  ...props
}: TooltipProps) {
  const rootRef = useRef<HTMLSpanElement>(null);
  const bubbleRef = useRef<HTMLSpanElement>(null);
  const [side, setSide] = useState<"left" | "right">("left");

  // On reveal, anchor to the top-left unless the bubble (a fixed width, laid out
  // even while hidden) would spill past the right edge — then flip to top-right.
  function place() {
    const root = rootRef.current;
    const bubble = bubbleRef.current;
    if (!root || !bubble) return;
    const { left } = root.getBoundingClientRect();
    setSide(left + bubble.offsetWidth > window.innerWidth ? "right" : "left");
  }

  const styles = TooltipStyles({ side });
  return (
    <span
      ref={rootRef}
      className={styles.root({ className })}
      onPointerEnter={place}
      onFocusCapture={place}
      {...props}
    >
      {children}
      <span ref={bubbleRef} role="tooltip" className={styles.bubble()}>
        <span className={styles.name()}>{label}</span>
        {description && (
          <span className={styles.description()}>{description}</span>
        )}
      </span>
    </span>
  );
}
