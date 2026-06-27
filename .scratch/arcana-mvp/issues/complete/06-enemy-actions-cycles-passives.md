# Enemy actions, action cycles & passives

Status: ready-for-agent

## What to build

The enemy action phase, fixed action cycles, passive abilities, and
multi-enemy combat — making the full level-1 enemy roster behave correctly.

- **Action phase**: on its Action phase an enemy performs exactly one action from
  its fixed, ordered, looping action cycle ("None" = skip; wraps after the last
  step).
- **Intent telegraph ordering**: the enemy attacks (with current stats) on its
  Attack phase BEFORE its Action resolves, so a stat-changing action only affects
  its NEXT turn. The cycle and next action are never shown — the player infers
  them from stat changes (visible state).
- **Stance actions**: Battle stance (lose 3 block, gain 3 attack), Defensive
  stance (gain 3 block, lose 3 attack), with atk floored at 0.
- **Passive abilities**: trigger on an event regardless of turn phase. Barbarian:
  Blood tithe action (lose 1 hp each turn) + Rage passive (gain 1 attack each time
  it loses hp).
- **Multi-enemy**: encounters with multiple enemies; a unit's attack hits all
  opponents; targeting/fizzle already handled by slice 04.
- **Enemy roster**: Fast knight, Slow knight (cycle with None steps), Barbarian,
  each with the stats and cycles from the design.

## Acceptance criteria

- [ ] Enemies perform one action per Action phase from a looping cycle, with "None" skipping
- [ ] An enemy attacks before its action resolves, so stat changes only affect its next turn
- [ ] Battle/Defensive stances mutate atk/blk correctly with atk floored at 0
- [ ] Barbarian's Rage grants +1 atk on each hp loss, including from its own Blood tithe
- [ ] Multi-enemy encounters work; attacks hit all opponents; dead enemies are removed instantly
- [ ] Fast knight, Slow knight, and Barbarian match their design stats and cycles
- [ ] Action-cycle and passive logic are tested modules with full unit coverage

## Blocked by

- 04-effect-resolution-core-vocabulary
