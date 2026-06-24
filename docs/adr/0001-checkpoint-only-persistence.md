# Checkpoint-only persistence (no live combat save)

We persist run state to browser local storage **only between encounters**, not
during combat. A refresh mid-encounter restarts that encounter from the last
between-encounter checkpoint (deck, HP, and run progress restored; opening draft
re-rolls). We chose this because serializing live combat state — partial clause
resolution, targeting in progress, RNG seeds, transient buffs/effects — is
substantially more complex and error-prone than checkpointing the small, stable
between-encounter state, and the design only requires that run *progress* survive
a refresh.

## Status

accepted

## Consequences

- Persisted state is small and stable: HP, deck composition, permanent stat/card
  changes, and level/encounter position.
- A mid-combat refresh costs the player their current encounter's progress; this
  is an accepted trade-off, not a bug.
- If seamless mid-combat resume is ever required, the combat engine's entire
  runtime state would need to become deterministically serializable (including
  RNG) — a meaningful re-architecture, hence recording the decision now.
