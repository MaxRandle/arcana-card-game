# Combat walking skeleton (attack-only loop)

Status: ready-for-agent

## What to build

The combat engine core and combat screen, with no cards yet — just the
turn-phase machine and attacking. This is the tracer that proves units, stats,
damage, and the win/loss loop end-to-end.

- **Combat screen**: background, View Deck button, arcanist sprite on the left
  (facing right), a single enemy sprite on the right (facing left), with each
  unit's hp/atk/blk always visible.
- **Unit & stat model** (tested engine module, no UI logic): every unit has hp,
  atk, blk. Damage application subtracts the target's block per incoming
  instance; block can go negative (increasing damage). HP checked after every
  individual damage instance; a unit at 0 hp is removed instantly, forfeiting any
  pending attack/action.
- **Turn-phase machine**: player turn (Effect → Mana → Draw → Play → Attack) and
  enemy turn (Effect → Attack → Action). For this slice the Mana/Draw/Play and
  enemy Action phases are no-ops; only the Attack phases do work. A unit attacks
  all opponents for its atk value on its attack phase.
- **End turn** button ends the Play phase and advances through the player attack
  phase into the enemy turn and back.
- **Win/loss**: all enemies dead → win → return to Adventure; arcanist dead →
  loss → Home.

Wire this to a temporary "start combat" entry point (e.g. the Adventure CTA) so
it is demoable; the real encounter/level flow arrives in slice 08.

## Acceptance criteria

- [ ] Combat screen renders arcanist + one enemy with live hp/atk/blk stats
- [ ] End turn advances player attack → enemy turn → back to the player
- [ ] Attacking deals atk damage reduced by the target's block (negative block increases damage)
- [ ] Death is instant and checked after each damage instance; a dead unit forfeits its pending attack
- [ ] Defeating the enemy wins (→ Adventure); arcanist death loses (→ Home)
- [ ] Combat engine is a tested module independent of the UI, with full unit coverage

## Blocked by

- 01-walking-skeleton-screens-persistence
