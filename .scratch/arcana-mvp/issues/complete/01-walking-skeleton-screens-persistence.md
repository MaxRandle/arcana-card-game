# Walking skeleton: screens, navigation & run persistence

Status: ready-for-agent

## What to build

The non-combat app shell and the run-persistence backbone everything else
hangs off. A player can start a run from the Home screen, land on the Adventure
screen, open an (empty) Deck view, and retire back to Home. Run state lives in
browser local storage and survives a refresh between encounters (per
ADR-0001 — only between-encounter state is persisted).

- **Home screen**: background image + "New adventure" button that starts a fresh
  run with an empty Deck and routes to the Adventure screen.
- **Adventure screen**: background, "View Deck" icon button (top right),
  hamburger menu (top left) with a "Retire" item, and a main CTA whose label is
  "Next encounter" / "Next level" depending on run position (stub the position
  for now — no combat exists yet).
- **Deck view**: overlay opened from the View Deck button; renders owned cards in
  a grid (5 across, wrapping, scrolls if needed). Empty for now.
- **Retire**: wipes the run from local storage and returns to Home.
- **Run state** (a serializable module, logic out of the UI): tracks deck
  composition, HP, permanent changes, and level/encounter position; saved to and
  loaded from local storage. A refresh on the Adventure screen restores the run.

Keep the persisted run-state shape small and stable — it is the checkpoint the
later progression slice (08) writes to.

## Acceptance criteria

- [ ] Home screen renders with a working "New adventure" button
- [ ] Starting a new adventure creates a run with an empty deck and shows the Adventure screen
- [ ] Adventure screen shows the View Deck button, hamburger menu with Retire, and the conditional main CTA
- [ ] Deck view overlay opens, renders an (empty) responsive grid, and closes
- [ ] Run state persists to local storage and is restored after a browser refresh on the Adventure screen
- [ ] Retire wipes the persisted run and returns to Home
- [ ] Run-state logic lives in a tested module separate from the UI, with full unit coverage

## Blocked by

- None - can start immediately
