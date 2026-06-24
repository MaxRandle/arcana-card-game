# Arcana

A browser-based rogue-like card-builder game.

## Genre

Arcana is a rogue-like turn-based card-based combat game where the player controls a character called an Arcanist, someone who wields elemental magic of the Arcana. Players build a deck of cards which are played in combat to cast elemental spells in battle against variety or enemy encounters.

## Card mechanics

### Deck

The set of all cards collected in the current run.

### Hand

The set of cards currently available to play. Maximum capacity of 10.

### Draw pile

The pile of cards that the player takes from when new cards are added to the player's hand.

### Card draw

A card is removed from the draw pile and added to the hand. Draws resolve one card at a time. Draws are skipped if there are no cards to draw, or if the player's hand is full. Remaining draws in a multi-draw effect are also skipped (no cards lost, no penalty).

### Discard pile

When cards are played they are are sent to the discard pile. A played card is sent to the discard pile only after its effect fully resolves, so it cannot be redrawn by its own draw effect. During the time after a card has been played but before it's effect has been fully resolved, it is not considered to be part of the hand, or the discard pile.

### Shuffling

When the player attempts to draw a card and the draw pile is empty and the discard pile is not empty, the entire discard pile is shuffled and sent to the draw pile. The draw then proceeds as normal

### Opening draft

At the start of combat the player is shown 5 cards from their deck of which they will choose 3 to have in their opening hand. The remaining two cards that were not selected are returned to the player's deck. The remaining deck becomes is shuffled and sent to the draw pile.

## Units

### Unit

Any combatant in an encounter.

### Arcanist

The player's Unit.

### Enemy

An opponent Unit. An encounter has one or more.

### Visible unit state

Buffs, Debuffs, Stats (atk, blk, hp), and passive abilities of all units are always visible.

### Invisible unit state

The action cycle and the enemy's _next_ action are hidden.

### Enemy action / action cycle

On its action phase an enemy performs exactly one **action** from its fixed,
ordered **action cycle** (a "None" entry means skip). The cycle loops
indefinitely - after the last step it wraps to the first.

### Passive ability

Triggers on an event irrespective of turn order. (E.g. Barbarian gains 1 atk whenever it takes damage) rather than on a cycle step.

## Combat

Combat is a battle between the player and an one or more enemies. Combat is turn based with the player taking the first turn. Combat ends when either the player dies resulting in a loss, or all enemies have been defeated resulting in a win.

### Mana

The players primary resource. Mana is used to play cards, cards have an associated mana cost. Mana carries over across turns. Players start out with 1 mana and gain 2 mana every turn, there is no limit to how much mana a player can have.

### Damage types

- Elemental damage: Damage originating from card effects
- Attack damage: Damage resulting from the unit attacking and dictated by the attack stat

### Buffs & Debuffs

A buff is a beneficial ongoing effect on a unit. A debuff is a detrimental ongoing effect on a unit. Direct stat mutations are not buffs/debuffs and cannot be stripped by removal effects. Removal operates on whole statuses, clearing a status removes all its stacks at once

## Unit Stats

A Stat is a numeric property belonging to a unit. There are 3 core stats that every unit has:

- Hitpoints (hp): How much damage the unit can take before dying

Stats reset to their default value at the start of each combat, unless a Permanent effect has altered the default for the duration of the run.

### Attack (atk)

Units deal damage equal to their attack stat value to **all** opponents on their attack phase. Lower bound of 0, cannot be negative.

### Blocking

A flat, non-depleting modifier applied to each incoming instance of damage.Damage received by attacked units is reduced by that unit's block stat value.

Block reduces hp lost via "damage", this could be from attacking units or card effects. It has no effect on hp lost via effects that specify "Lose hp".

Block **can go negative** which **increases** each incoming instance by that amount.

### Hitpoints (hp)

The amount of damage a Unit can sustain before it dies.

### Death

Death occurs when a unit reaches 0 HP. Death is instant for all units, HP is checked after every individual damage instance. A unit with 0 HP is removed immediately, forfeiting any pending action or attack.

### Turn order

A turn is divided into a sequence of named phases. Combat events happen on specific phases. The turn order starts on the players turn.

Player turn:

1. Effect phase - Any effects on the player trigger, buffs, debuffs, etc.
2. Mana phase - Player gains mana
3. Draw phase - Player draws a card(s) from the deck
4. Play phase - Player may play cards
5. Attack phase - Players character attacks

The Play phase ends when the user clicks the "End turn" button.

Enemy turn:

1. Enemy effect phase - Any effects on the unit trigger, buffs, debuffs, etc.
2. Enemy attack phase - Enemy unit(s) attack
3. Enemy action phase - Enemy performs a unique action

## Gameplay progression & Deck-building

### Arcana

An elemental school of magic (one of: Air, Water, Earth, Fire, Lightning;
more to come). Each Arcana unlocks its own pool of cards.

### Arcana draft

The game presents the player with 3 randomly chosen arcana, the player may select only one. This unlocks the associated arcanas unique pool of cards for future card drafts. Arcanas that the player chooses from a draft **cannot** appear in subsequent arcana drafts. When fewer than 3 unpicked Arcana remain, the draft offers only what remains

### Card draft

The game presents the player with 3 randomly chosen cards, the player may select only one. The selected card is added to the players deck. Cards that the player chooses from a draft **can** appear in subsequent card drafts but not but twice in the same draft.

### Generic cards

Cards belonging to no Arcana. These are not drafted and have special ways to acquire them.

The list of generic cards is as follows:

- Equilibrium - The player's deck is seeded with one copy at the start of the run.

### Run / Adventure

A single playthrough from an empty Deck through all levels, ending in death or completion. Retiring abandons the run. A run is completed when a player dies or defeats all levels.

Run state is saved between encounters to browser local storage. Run progress should survive a browser refresh, current encounter progress should not.

### Encounters

Encounters are the main combat gameplay element. The player battles one or multiple enemies in turn-based combat. Enemies have simple actions and attacks while the player plays cards. After each encounter the player is rewarded with a card draft that pulls from the collective card pools of all unlocked arcana.

### Level

A segment of a run.

The player receives an arcana draft, then 3 card drafts exclusively from that arcana's card pool. Then they must fight 4 encounters to complete the level.

The level 1 Arcana draft yields 6 card drafts rather than the usual 3. Subsequent arcana drafts yield the usual amount of card drafts

Completing a level heals the arcanist for 50% of their maximum HP.

## State persistence

Some run state persists across encounters within a run:

- Hitpoints
- Deck composition
- Permanent stat changes
- Permanent card changes

Some run state is reset between encounters:

- Mana
- Attack / Block
- Effects that alter card cost or effect (unless specified as permanent)
- Buffs / Debuffs

## Targeting modes

Cards have one of the following targeting mode:

- Untargeted: Card effect is not unit-specific.
- Enemy units: Can only target enemy units.
- Player units: Can only target player units.
- Any unit: Can target player or enemy units.

### Controls

Cards are played by drag-to-target mouse gestures. The player mouses over a card and clicks down and drags, the card is only played when the mouse click is released with the players mouse outside of the hand region on the screen (the screen region outside of the hand is referred to as the battlefield).

**Targeted cards**:

When targeting a unit with a card, the player drags the card onto the unit's visible sprite in the encounter view. The card visibly floats above the hand and a targeting arrow is drawn from the card to the unit's sprite for visual indication of which unit the card will target.

**Untargeted cards**:

When playing a card with no target the player drags the card onto the battlefield. The card visibly floats above the hand but no targeting arrow is drawn.
