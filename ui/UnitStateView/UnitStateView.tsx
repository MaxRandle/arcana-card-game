// Composes the unit's combat readout shown under its sprite: the Attack/Block
// indicators on top, the health bar beneath them, and the wrapping status bar
// below. Stateless and decoupled from the combat engine — callers pass plain
// values, so the same view serves the player and every enemy.

import React, { forwardRef } from "react";
import { tv } from "tailwind-variants";

import { HealthBar } from "@/ui/HealthBar";
import { StatIndicator } from "@/ui/StatIndicator";
import { StatusBar, StatusIcon, UnitStatus } from "@/ui/StatusIcon";

const UnitStateViewStyles = tv({
  base: "flex w-44 flex-col items-center gap-1",
});

export type UnitStateViewProps = React.ComponentPropsWithoutRef<"div"> & {
  /** Current hitpoints. */
  hp: number;
  /** Maximum hitpoints. */
  maxHp: number;
  /** Attack stat shown in the red spiked indicator. */
  atk: number;
  /** Block stat shown in the blue shield indicator. */
  blk: number;
  /** Passive abilities, buffs, and debuffs to list in the status bar. */
  statuses?: UnitStatus[];
};

export const UnitStateView = forwardRef<HTMLDivElement, UnitStateViewProps>(
  ({ hp, maxHp, atk, blk, statuses = [], className, ...props }, ref) => {
    const tone =
      hp <= maxHp * 0.25 ? "critical" : hp <= maxHp * 0.5 ? "hurt" : "healthy";

    return (
      <div ref={ref} className={UnitStateViewStyles({ className })} {...props}>
        <div className="flex items-end gap-2">
          <StatIndicator intent="attack" value={atk} />
          <StatIndicator intent="block" value={blk} />
        </div>
        <HealthBar value={hp} max={maxHp} tone={tone} />
        {statuses.length > 0 && (
          <StatusBar>
            {statuses.map((status, i) => (
              <StatusIcon
                key={`${status.kind}-${status.label ?? i}`}
                kind={status.kind}
                stacks={status.stacks}
                label={status.label}
              />
            ))}
          </StatusBar>
        )}
      </div>
    );
  },
);

UnitStateView.displayName = "UnitStateView";
