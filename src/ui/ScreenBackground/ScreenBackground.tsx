import React, { forwardRef } from "react";
import Image from "next/image";
import { tv, type VariantProps } from "tailwind-variants";

import background from "@/assets/backgrounds/victorian-cobblestone.png";

const ScreenBackgroundStyles = tv({
  base: "fixed inset-0 -z-10",
  variants: {
    /**
     * @summary Dims the plate so foreground content reads more clearly.
     * @default "none"
     */
    tint: {
      none: "",
      dim: "after:absolute after:inset-0 after:bg-black/40",
    },
  },
  defaultVariants: {
    tint: "none",
  },
});

type ScreenBackgroundVariants = VariantProps<typeof ScreenBackgroundStyles>;

export type ScreenBackgroundProps = React.ComponentPropsWithoutRef<"div"> &
  ScreenBackgroundVariants;

// Full-bleed background plate every screen sits on top of. Rendered once in the
// root layout and fixed to the viewport, so it stays mounted across route
// changes instead of reloading on each navigation.
export const ScreenBackground = forwardRef<HTMLDivElement, ScreenBackgroundProps>(
  ({ tint, className, ...props }, ref) => (
    <div ref={ref} className={ScreenBackgroundStyles({ tint, className })} {...props}>
      <Image
        src={background}
        alt=""
        aria-hidden
        fill
        priority
        placeholder="blur"
        sizes="100vw"
        className="object-cover"
      />
    </div>
  ),
);

ScreenBackground.displayName = "ScreenBackground";
