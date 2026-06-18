# Arcana

A browser-based rogue-like card-builder game.

## Genre

Arcana is a rogue-like turn-based card-based combat game where the player controls a character called an Arcanist, someone who wields elemental magic of the Arcana. Players build a deck of cards which are played in combat to cast elemental spells in battle against variety or enemy encounters.

## The Arcana

There are 5 "first-order" Arcana, or "primary" arcana:

- Wind
- Water
- Earth
- Fire
- Lightning

There are also 10 "second-order" or "derived" arcana which thematically are combinations of the primary arcana:

- Ice - Wind + Water
- Sand - Wind + Earth
- Blaze - Wind + Fire
- Plasma - Wind + Lightning
- Mud - Water + Earth
- Vapour - Water + Fire
- Storm - Water + Lightning
- Lava - Fire + Earth
- Metal - Lightning + Earth
- Chaos - Fire + Lightning

Each arcana unlocks a unique pool of cards.

## Deck building

### Arcana draft

The game presents the player with 3 randomly chosen arcana, the player may select only one. This unlocks the associated arcanas unique pool of cards for future card drafts. Arcanas that the player chooses from a draft **cannot** appear in subsequent arcana drafts.

### Card draft

The game presents the player with 3 randomly chosen cards, the player may select only one. The selected card is added to the players deck. Cards that the player chooses from a draft **can** appear in subsequent card drafts but but twice in the same draft.

### Encounters

Encounters are the main combat gameplay element. The player battles one or multiple enemies in turn-based combat. Enemies have simple actions and attacks while the player plays cards. After each encounter the play is awarded with a card draft.

### Levels

There are 4 levels containing 4 encounters each. At the start of each level the player is given an arcana draft followed by a number of card drafts exclusively from that arcanas pool.

After the players first arcana draft, the users is given 6 card drafts. After subsequent arcana drafts, the user is given 3 card drafts.

## Combat

Combat is a battle between the player and an one or more enemies. Combat is turn based with the player taking the first turn. Players and enemies have hitpoints and can be killed. Combat ends when either the player dies resulting in a loss, or all enemies have been defeated resulting in a win.

### Resource mechanics

The players primary resource is mana. Mana is used to play cards, cards have an associated mana cost. Mana carries over across turns. Players start out with 3 mana and gain 2 mana every turn, there is no limit to how much mana a player can have.

### Card mechanics

At the start of combat the player is shown 5 cards of which they will choose 3 to have in their opening hand. The remaining two cards that were not selected are shuffled into the player's deck.

The player draws 1 card per turn.

After a card is played in combat, it is reshuffled into the deck.

If the deck is empty during the draw phase of the player's turn, no card is drawn.

The players hand has a maximum capacity of 10 cards. If the players hand is full no cards can be drawn.

### Stats

There are numerous stats but the most important stats that every unit has are are:

- Attack (atk): controls how much damage the unit will deal to opponents at the end of its turn
- Block (blk): reduces all instances of incoming damage by a flat amount
- Hitpoints (hp): How much damage the unit can take before dying

By default the players character has 1 atk, 0 blk, and 100 hp.

### Attacking

Both the player character and enemies have an attack damage value. At the end of their respective turns, player characters and enemies wll deal damage equal to their attack damage value to ALL opponents.

### Turn order

Combat starts on the player's turn

Player turn:

1. Mana phase - Player gains mana
2. Draw phase - Player draws card(s) from the deck
3. Play phase - Player may play cards
4. Attack phase - Players character attacks

The Play phase ends when the user clicks the "End turn" button.

Enemy turn:

1. Enemy performs a unique action
2. Enemy character(s) attack

### Enemy actions

Enemies can perform unique actions on their turn. They might cast a spell, they might change their stats, they might summon allies, they might change the player's stats, etc... these actions are typically unique to each type of enemy.

## Game Interface

### Combat screen

A background image is visible, the players character sprite is on the left facing right, the enemy sprites are on the right facing left.

The players hand is in the bottom center of the screen with the cards fanned out and slightly overlapping like how a person would hold multiple cards. This is very similar to the layout of existing games such as "Hearthstone" and "Slay the Spire 2".

### Card appearance

Cards have a title at the top, a mana const indicator at the top left, a portrait area for the cards splash art taking up about 1 3rd of the card's height, and a body text region taking up the lower majority of the card which describes the card's effect.
