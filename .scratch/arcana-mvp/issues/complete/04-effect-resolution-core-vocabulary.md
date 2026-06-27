# Effect resolution engine & core effect vocabulary

Status: ready-for-agent

## What to build

The general effect-resolution engine plus the primitive effect vocabulary, so
the majority of non-status cards across all five arcana become playable.

- **Clause resolution**: a card's semicolon-separated clauses resolve strictly
  left-to-right, each fully before the next. A target-dependent clause whose
  target is already dead fizzles silently. The played card moves to discard only
  after all clauses resolve (so it cannot be redrawn by its own draw effect).
- **Targeting modes**: untargeted, enemy units, player units, any unit. Untargeted
  cards are played by dragging onto the battlefield (no arrow); targeted cards
  keep the arrow from slice 03. "Any unit" cards (e.g. Ebb & flow) choose
  behavior by which side is targeted.
- **Effect primitives** (each a small, composable, tested unit): deal N damage
  (elemental, block applies), heal N hp, gain N block, gain N attack, gain N
  mana, lose N hp (ignores block), draw N cards, "deal X to target / Y to all
  other enemies" (Splash), conditional/either clauses (Ebb & flow).
- **Cards lit up by this slice**: Windshear, Rock, Purging flame's damage, Splash,
  Ebb & flow, Vital energy (lose 1 hp; gain 1 mana), Physical energy (gain 1 atk),
  Mental energy (draw 2), Equilibrium's draw (count distinct arcana in deck;
  Generic does not count). Status-applying clauses arrive in slice 05.

## Acceptance criteria

- [x] Semicolon clauses resolve left-to-right, each fully before the next
- [x] A clause targeting an already-dead unit fizzles silently without aborting the card
- [x] Card moves to discard only after all clauses resolve (cannot self-redraw)
- [x] All four targeting modes work, including untargeted drag-to-battlefield (no arrow)
- [x] "Any unit" cards branch on the targeted side
- [x] Damage applies block; "lose hp" ignores block; heal/gain-block/gain-atk/gain-mana/draw all resolve correctly
- [x] Equilibrium draws one card per distinct arcana in the deck (Generic excluded)
- [x] Effect primitives and the resolver are tested modules with full unit coverage

## Blocked by

- 03-mana-draw-play-damage-card
