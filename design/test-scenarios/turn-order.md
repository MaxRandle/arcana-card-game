# Turn order scenarios

### Player gains mana at the start of their turn

**GIVEN** The turn order is on the "mana phase"
**THEN** The player's mana indicator count increments by the expected amount
**AND** The turn order advances to the "draw phase"

### Player draws cards at the start of their turn

**GIVEN** The turn order is on the "draw phase"
**THEN** The expected number of cards are removed from the top of the deck
**AND** The expected number of cards are added to the player's hand
**AND** The turn order advances to the "play phase"

### Clicking the end turn button ends the player's turn

**GIVEN** The turn order is on the "play phase"
**WHEN** The player clicks the end turn button
**THEN** The turn order advances to the "attack phase"

### Player's character attacks upon the player's turn ending

**GIVEN** The turn order is on the "attack phase"
**THEN** The player's character performs an attack against the enemy
**AND** The turn order advances to the "enemy action phase"

### Enemies perform their action(s) at the start of their turn

**GIVEN** The "attack phase" is ending
**THEN** The turn order advances to the "Enemy action phase"
**AND** The enemies perform their actions

### Enemies attack the player at the end of their turn

**GIVEN** It is an enemy's turn
**WHEN** The enemy's turn ends
**THEN** The enemy performs an attack against the player's character

### The player's turn begins after the enemies turn has ended

**GIVEN** The enemy's turn has just ended
**WHEN** The turn order advances
**THEN** The player's turn phase begins
