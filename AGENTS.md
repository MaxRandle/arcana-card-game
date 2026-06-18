# For agentic coding assistants

## Package documentation

### Next.js

**This is NOT the Next.js you know**

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

## Code style

- You will not create code abstractions.
- Simple, explicit, repeatable code is always preferred.
- You will favour composability.
- You will not create large multi-purpose files.
- Search for popular packages on npm to accomplish complex tasks, do not attempt hand-rolled solutions to common problems and requirements.

## Project source

Files are organised folders each with their own rules:

- `utils` - logic handling utility functions
- `ui` - simple static UI components that do not require unit tests
- `components` - complex components that require unit tests
- `app` - application pages

## Integration testing

The main way we verify the correctness of the game is with a comprehensive suite of playwright tests.

The current suite of tests are described in gherkin english in the `design/test-suite` folder. You will maintain a runnable playwright test for each test described in this folder.

## What Not To Do

- Do not make edits to any game design documents located in the `design` folder, these is for humans only.
- Do not put game logic inside UI scripts

## Working with the user

- The current state of the game build is described by the game design files in the `design` folder.
- The user will make changes to game design files, when prompted you will:
  - examine the git diff of the files
  - update the game code and files to match the design

## Project Lifecycle

Below outlines a 3 phase approach to building this project in 4 weeks, currently we are in phase 1.

### Phase 1 - Prototyping - week 1 & week 2

**We're not building a game, we're building a comprehensive test suite that describes the game we eventually want.**

During this phase we experiment and iterate, change our minds, change game features, explore systems and interactions, etc. The code changes frequently during this time so you will need to be mindful that code complexity balloons exponentially as we vibe code and rapidly prototype, the game may be buggy and unstable.

### Phase 2 - Rebuild - week 3

**Use our integration tests as a concrete build target to rebuild large chunks of the game from scratch.**

Phase 2 begins once we have decided concretely on MVP features of the game. Phase 2 aims to scrap the initial game implementation and then rebuild it into something production stable. This is why it is critically important to have 100% coverage on integration tests, and it is also important that our tests assert the desired output, and do not assume anything about the implementation, as implementation will change during this phase.

### Phase 3 - Polishing - week 4

**Tune and polish for MVP production release.**

Phase 3 begins once core game systems are fully operational and set in stone. This phase is about fixing bugs, tuning interactions, adding art & assets, and getting production stable.
