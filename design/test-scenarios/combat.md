# Combat scenarios

### At the start of combat the player is offered an opening draft

**GIVEN** A combat encounter is beginning
**THEN** The player is presented with a selection of 5 cards from their deck
**AND** The player can choose 3 cards
**AND** The selected cards are added to the hand
**AND** The discarded cards are shuffled into the deck

### Player gains mana at the start of their turn

**GIVEN** The players turn is starting
**WHEN** The turn order enters the "mana phase"
**THEN** The player's mana indicator count increments by the expected amount

### Player draws cards at the start of their turn

**GIVEN** The players turn is starting
**WHEN** The turn order enters the "draw phase"
**THEN** The expected number of cards are removed from the top of the deck
**AND** The expected number of cards are added to the player's hand

### Playing a card reduces the players mana by the expected amount

**GIVEN** The Turn order has advanced to the "play phase"
**AND** The player has sufficient mana to play a card
**WHEN** The player plays a card from their hand
**THEN** The player's mana indicator decreases by the card's mana cost

### Clicking the end turn button ends the player's turn

**GIVEN** It is the player's turn
**WHEN** The player clicks the end turn button
**THEN** The turn order advances to the "attack phase"

### Player's character attacks upon the player's turn ending

**GIVEN** It is the player's turn
**WHEN** The player's turn ends
**THEN** The player's character performs an attack against the enemy

### Enemies lose the expected amount of hp when attacked

**GIVEN** An enemy is in combat with the player
**WHEN** The turn order enters the "attack phase"
**THEN** The player's character attacks the enemy
**AND** The enemy's HP decreases by the expected attack damage amount

### The enemies turn begins after the player's turn has ended

**GIVEN** The "attack phase" is ending
**THEN** The turn order advances to the "Enemy action phase"

### Enemies attack the player at the end of their turn

**GIVEN** It is an enemy's turn
**WHEN** The enemy's turn ends
**THEN** The enemy performs an attack against the player's character

### The player's character loses the expected amount of hp when attacked

**GIVEN** The player's character is in combat
**WHEN** An enemy attacks the player's character
**THEN** The player character's HP decreases by the expected attack damage amount

### The player's turn begins after the enemies turn has ended

**GIVEN** The enemy's turn has just ended
**WHEN** The turn order advances
**THEN** The player's turn phase begins
