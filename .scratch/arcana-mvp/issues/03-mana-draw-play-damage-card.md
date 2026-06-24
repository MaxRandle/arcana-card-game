# Mana, draw & playing a targeted damage card

Status: ready-for-agent

## What to build

The card-play tracer: mana, the deck piles, drawing, the fanned hand UI, and
playing one targeted damage card by drag-to-target. Uses a hard-coded debug
deck (this debug-seed mechanism stays in permanently for testing combat in
isolation — real drafting arrives in slice 08).

- **Deck locations**: the Deck is partitioned into draw pile, hand, discard, and
  the transient in-play card (positions, not separate collections).
- **Mana phase**: arcanist starts combat with 1 mana, gains 2 each Mana phase
  (so turn 1's Play phase has 3). Mana carries across turns, no upper limit.
- **Draw phase**: draws 1 card; draws resolve one at a time; skipped if the draw
  pile is empty (after attempting reshuffle) or the hand is full (cap 10).
- **Reshuffle**: when a draw is attempted with an empty draw pile and a non-empty
  discard, the discard is shuffled into the draw pile, then the draw proceeds.
- **Hand UI**: cards fanned and slightly overlapping in the bottom center. Each
  card shows title, mana cost (top left), splash-art area (~1/3 height), and body
  text (lower majority).
- **Drag-to-target play**: mouse down on a card, drag; the card floats above the
  hand. A targeted card draws a targeting arrow to a unit sprite and plays when
  released over that unit. Playing spends mana (blocked if insufficient).
- **One damage card** (e.g. Windshear — "Deal 3 damage", enemy-targeted) resolves
  its damage, then the card moves to the discard only after resolution.

Debug deck = a fixed set seeded into the run for these slices; surface it behind
a dev-only entry point.

## Acceptance criteria

- [ ] Mana starts at 1 and increases by 2 each Mana phase, carrying across turns with no cap
- [ ] Draw phase draws one card; draws skip on full hand (cap 10) or empty piles
- [ ] Empty draw pile with non-empty discard reshuffles, then the draw proceeds
- [ ] Hand renders fanned cards with title, cost, art area, and body text
- [ ] A targeted damage card can be dragged onto an enemy (with targeting arrow) and played, spending mana
- [ ] Insufficient mana prevents play
- [ ] Played card moves to discard only after its effect resolves
- [ ] Deck/pile/mana/draw logic is a tested module separate from the UI, with full unit coverage

## Blocked by

- 02-combat-walking-skeleton
