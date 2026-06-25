## Non-combat interface

## Home screen

This screen is displayed when the player initially launches the game.

- Background image
- "New adventure" button that starts a new run from the beginning with an empty deck

## Adventure screen

This screen is displayed when the player is in an adventure but is not currently in combat.

- Background image
- "View Deck" icon button in the top right corner
- Hamburger menu icon button in the top left corner with the following menu items:
  - Retire: Wipes the player's current run and returns the player to the Home screen
- Main CTA button with the following conditional text:
  - "Next encounter" (if the user is in between encounters)
  - "Next level" (if the user is in between levels)

## Combat interface layout

- Background image
- "View Deck" icon button in the top right corner
- Hamburger menu icon button in the top left corner with the following menu items:
  - Retire: Wipes the player's current run and returns the player to the Home screen
- Players arcanist character sprite is on the left facing right
- Enemy sprites are on the right facing left
- Players hand is in the bottom center of the screen
- Player Mana tracker in the bottom left
- The "End Turn" button is in the bottom right

## Card appearance

Cards have portrait rectangular shape with a title at the top, a mana const indicator at the top left, a portrait area for the cards splash art taking up about 1 3rd of the card's height, and a body text region taking up the lower majority of the card which describes the card's effect.

## Deck view

This presents as an overlay when the player clicks the "View deck" icon button.

Cards are displayed in a grid, 5 cards along the top, and wrapping to take up as many rows as needed to display all cards in the deck. The grid is large and floats in the center of the screen, scrolling if needed.

## Hand view

Cards in the hand are fanned out in a shallow bow with the cards in the centre positioned slightly higher than the ones on the edges, and slightly overlapping like how a person would hold multiple cards. This is very similar to the layout of existing games such as "Hearthstone" and "Slay the Spire 2".

## Unit state view

This displays under the unit sprite and tracks:

- Current hitpoints as a horizontal bar
- Attack & Block stat values
- passive abilities, buffs, & debuffs

Attack and Block are displayed as numerical values inside large indicators above the health bar. Attack is a red circular spiked shape, Block is a blue shield shape.

Passive abilities, buffs, & debuffs are displayed in the status bar below the hp bar. The status bar is a row of left-aligned icons that wraps around to the next row if there are too many. Passives are displayed as a grey square shape with enough room inside for a small icon which will be added later, buffs are the same but a green triangle pointing up, debuffs are a red triangle pointing down. Buffs and debuffs have a small stack counter floating at the top right corner of the icon.
