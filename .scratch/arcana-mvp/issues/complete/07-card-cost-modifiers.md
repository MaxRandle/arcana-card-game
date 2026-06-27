# Card cost modifiers: Ramp, per-turn mana, Permanent & elemental-damage bonus

Status: done

## What to build

The card-cost and ongoing-modifier mechanics, and the cards that use them.

- **Ramp x**: each time the card is played its cost increases by x mana until end
  of combat (x may be negative). Duplicates ramp independently. Effective cost
  floors at 0 (never negative); cost resets to base at combat end.
- **Permanent keyword**: an effect tagged Permanent survives the combat-end reset
  and persists for the rest of the run (persisted via the run checkpoint).
- **Per-turn mana modifier**: "gain N additional mana per turn" stacks into the
  Mana phase for the rest of combat.
- **Elemental-damage bonus**: Spirit energy increases elemental damage the
  arcanist deals by 1 (applies to damage-dealing card effects).
- **Cards lit up**: Endurance (Ramp 1; gain 1 block), Temporal energy (Ramp 2;
  gain 1 additional mana per turn), Spirit energy (+1 elemental damage),
  plus correct cost display/reset for any ramped card.

Note: these per-combat modifiers reset between encounters unless marked
Permanent; ensure the reset hooks into the same combat-end path as stats/statuses.

## Acceptance criteria

- [x] Ramp increases a card's cost by x on each play, floored at 0, per-copy independent, reset at combat end
- [x] Displayed mana cost reflects current ramped cost
- [x] "Gain N additional mana per turn" stacks into the Mana phase for the rest of combat
- [x] Spirit energy adds +1 to elemental damage dealt
- [x] Permanent effects survive combat-end reset and persist for the run via the checkpoint
- [x] Non-permanent cost/mana/damage modifiers reset between encounters
- [x] Cost-modifier and ongoing-modifier logic are tested modules with full unit coverage

## Blocked by

- 04-effect-resolution-core-vocabulary
