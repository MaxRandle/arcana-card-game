# Arcana

A browser-based rogue-like card-builder combat game. This glossary defines the
ubiquitous language of the game's domain.

## Language

### Arcanist
The player's Unit. The character who wields elemental Arcana magic.

### Unit
Any combatant in an encounter (the Arcanist or an Enemy).

### Arcana
An elemental school of magic (Air, Water, Earth, Fire, Lightning). Each Arcana
unlocks its own pool of cards.

### Mana
The Arcanist's primary resource for playing cards. The Arcanist starts a combat
with 1 mana and gains 2 during the Mana phase of every turn (turn 1's Play phase
therefore has 3 mana available). Mana carries over across turns within a combat,
has no upper limit, and resets between encounters.

### Draw phase
Draws 1 card by default each turn. Certain card effects increase the count.

### Block
A persistent unit stat: a flat, non-depleting modifier subtracted from each
incoming instance of *damage* (not from "lose hp" effects). Persists for the
whole combat — it does NOT reset each turn — and resets to default between
encounters. Can go negative, which increases incoming damage.

### Deck
The player's entire owned card collection for the run (its persistent identity).
In combat it is partitioned into locations — draw pile, hand, discard, and the
transient in-play card — which are positions within the Deck, not separate
collections. Effects that count "your cards" (e.g. Equilibrium) read the whole
Deck regardless of pile.

### Effect resolution
A card's semicolon-separated clauses resolve strictly left-to-right, each fully
before the next. A target-dependent clause whose target is already dead fizzles
silently. The played card moves to the discard only after all clauses resolve.

### Enemy intent telegraph
An enemy attacks (with current stats) BEFORE its Action resolves, so any
stat change an action makes only affects the enemy's NEXT turn — a built-in
one-turn telegraph. The enemy's action cycle and next action are never shown
directly; the player infers them by observing stat changes.

### Targeting mode
Every card has exactly one: **Untargeted** (effect is not unit-specific),
**Enemy units** (one enemy), **Player units** (one player unit), or **Any unit**
(player or enemy; the effect may branch on the chosen unit). Cards are played by
drag-to-target: targeted cards drag onto a unit's sprite (a targeting arrow is
drawn); untargeted cards drag onto the battlefield (no arrow).

### Battlefield
The screen region outside the hand. Releasing a dragged card here plays it.

### Per-turn effect resolution
Ongoing effects that act "per turn" resolve on the **owning unit's Effect
phase** (the Arcanist's on the player turn; an enemy's on the enemy turn).

### Burn
A stacking debuff dealing 1 damage per turn **per stack** on the owner's Effect
phase. Does not self-decay — persists until removed or combat ends.

### Tremors
A stacking buff: whenever the owning unit is *attacked*, deals a flat 2 damage
to all enemies (NOT scaled by stacks), triggering even if no damage is taken and
irrespective of turn phase. Loses 1 stack per turn (on the owner's Effect phase);
stacks govern only duration, not magnitude.

### Evade (Twinkletoes)
A buff granting a 25% chance, rolled per incoming attack, to negate that
attack's **attack damage** only. Does not affect elemental damage, Burn, or
"lose hp". An evaded attack still counts as an attack (e.g. still triggers
Tremors).

### Checkpoint
Run state is persisted to browser local storage only **between encounters**.
Live mid-combat state is not saved; refreshing mid-encounter restarts that
encounter from the last between-encounter checkpoint.

### Potential
A stacking debuff on an Enemy that acts purely as inert fuel — it has no
standalone per-turn effect. Certain Lightning cards read (and may consume)
Potential stacks to scale their power. Resets between encounters like other
debuffs. (Formerly mis-documented as "static"; that term is retired.)
