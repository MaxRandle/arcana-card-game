# Statuses: buffs & debuffs

Status: ready-for-agent

## What to build

The buff/debuff status system and the cards that use it. Statuses are
stackable, always visible on units, and distinct from direct stat mutations
(which cannot be stripped).

- **Status model**: named statuses with stack counts on a unit. Removal operates
  on a whole status (clears all its stacks at once). Direct stat changes are not
  statuses and are immune to removal. Statuses reset between encounters.
- **Status behaviors**:
  - **Burn** (debuff): unit takes 1 damage per turn per stack, on its Effect phase.
  - **Tremors** (buff): whenever the unit is attacked, deal 2 damage to all
    enemies (does not scale with stacks); loses 1 stack per turn.
  - **Twinketoes** (buff): 25% chance to evade an attack (blockable attacks can be
    evaded), resulting in no damage taken.
  - **Potential** (debuff): tracked stacks that certain Lightning cards read.
- **Cards lit up**: Cinders (apply 1 burn), Conflagration (each burning enemy
  seeds 1 burn on another random enemy — snapshot at cast, no self-burn),
  Purging flame (deal 3; remove 1 random buff), Twinkletoes (gain buff), Tenacity
  (remove all debuffs), Tremors (gain 1 stack), Zap (deal 3; apply 1 potential),
  Humble guide (deal 1 damage per potential on target; does not consume it).

## Acceptance criteria

- [ ] Statuses stack, are visible, and reset between encounters
- [ ] Status removal clears whole statuses; direct stat mutations cannot be stripped
- [ ] Burn deals 1 dmg/turn/stack on the Effect phase
- [ ] Tremors deals 2 to all enemies when its unit is attacked and decays 1/turn
- [ ] Twinketoes evades ~25% of attacks (fully negating that instance)
- [ ] Potential is applied by Zap and read by Humble guide without being consumed
- [ ] Conflagration snapshots burning enemies and seeds one burn each on a different random enemy
- [ ] Purging flame removes one random buff after its damage
- [ ] Status engine + each behavior are tested modules with full unit coverage

## Blocked by

- 04-effect-resolution-core-vocabulary
