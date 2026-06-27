// Row of status chips below the health bar. Wraps to additional rows when there
// are more chips than fit on one line.

import React, { forwardRef } from "react";
import { tv } from "tailwind-variants";

const StatusBarStyles = tv({
  base: "group/status-bar flex flex-wrap content-start gap-1",
});

export type StatusBarProps = React.ComponentPropsWithoutRef<"div">;

export const StatusBar = forwardRef<HTMLDivElement, StatusBarProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      aria-label="Statuses"
      className={StatusBarStyles({ className })}
      {...props}
    />
  ),
);

StatusBar.displayName = "StatusBar";
