# Deck-building progression: drafts, levels, encounters & rewards

Status: ready-for-agent

## What to build

The full run loop that ties combat to deck-building: arcana/card drafts, the
opening draft, level structure, encounter sequencing, rewards, and run
completion — replacing the debug-seed entry point with the real flow (the debug
seed stays available for isolated combat testing).

- **Run start**: empty deck seeded with one Equilibrium (generic). Generic cards
  are not drafted.
- **Arcana draft**: offers 3 random arcana, player picks 1, unlocking that
  arcana's card pool. Picked arcana never reappear; when fewer than 3 unpicked
  remain, offer only what's left.
- **Card draft**: offers 3 random cards (no duplicate within one draft), player
  picks 1 into the deck. Cards can recur across drafts.
- **Level flow**: arcana draft → N card drafts (from that arcana's pool) → 4
  encounters. Level 1 grants 6 card drafts; subsequent levels grant 3.
  Completing a level heals the arcanist 50% of max HP.
- **Opening draft**: at combat start show 5 cards from the deck; player keeps 3 in
  the opening hand; the other 2 return to the deck; the rest is shuffled into the
  draw pile.
- **Post-encounter reward**: after each encounter, a card draft pulling from the
  combined pools of all unlocked arcana.
- **Run end**: completing all levels wins the run; arcanist death ends it.
- **Persistence**: between-encounter checkpoint (HP, deck, permanent changes,
  level/encounter position) writes to the slice-01 run state; mid-combat refresh
  restarts the encounter from the checkpoint (ADR-0001). The Adventure CTA shows
  "Next encounter"/"Next level" from real position; Deck view shows the real deck.
- Uses the real level-1 encounter compositions and the enemy roster from slice 06.

## Acceptance criteria

- [ ] New run seeds an empty deck with one Equilibrium
- [ ] Arcana draft offers 3 (or remaining), picking unlocks a pool and removes the arcana from future drafts
- [ ] Card draft offers 3 with no in-draft duplicates; pick adds to the deck
- [ ] Level 1 gives 6 card drafts; later levels give 3; level completion heals 50% max HP
- [ ] Opening draft (5 → keep 3) sets the opening hand; remaining 2 return and the rest shuffles into the draw pile
- [ ] Each encounter awards a card draft from all unlocked arcana pools
- [ ] Real level-1 encounters run in sequence with the correct enemy compositions
- [ ] Run completes on clearing all levels and ends on arcanist death
- [ ] Checkpoint persists between encounters and a mid-combat refresh restarts the encounter from it
- [ ] Adventure CTA and Deck view reflect real run state
- [ ] Drafting and progression logic are tested modules with full unit coverage

## Blocked by

- 06-enemy-actions-cycles-passives
- (transitively 04-effect-resolution-core-vocabulary; also relies on 05 and 07 for full card coverage)
