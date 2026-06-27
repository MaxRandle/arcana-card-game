# For agentic coding assistants

## Package documentation

### Next.js

**This is NOT the Next.js you know**

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

## Code Hygiene

- You will not create code abstractions
- Simple, explicit, repeatable code is always preferred
- You will favour composability
- Do not create large multi-purpose files
- Use gold standard NPM packages instead of hand-rolled solutions
- Keep logic out of the UI layer

## Test driven development

- Full unit test coverage of each module is expected
- You should use TDD with a Red-Green-Refactor approach, create the unit test before implementing the module
- Use Jest and RTL

## Project source

Files are organised into folders, each with their own rules:

- `utils` - logic handling utility functions
- `ui` - simple, atomic, static, UI components that do not require unit tests
- `components` - complex components that require unit tests
- `app` - application pages

## Integration testing

The main way we verify the correctness of the game is with a comprehensive suite of playwright tests.

The current suite of tests are described in gherkin english in the `design/test-suite` folder. You will maintain a runnable playwright test for each test described in this folder.

## What not to do

Do not make edits to any files located in the `design` folder, these are for humans only and off limits to agents.

## User communication preferences

When reporting information to the user, be extremely concise and sacrifice grammar for the sake of concision.

## Working with the user

The workflow outline is as follows:

1. The user will make changes to files in the `design` folder describing the changes they want to make to the project.
2. You will examine the git diff to gain an understanding of new or changing requirements.
3. The user will commence an alignment session with the `/grill-with-docs` skill.
4. The user will invoke the `/to-prd` skill to create a "Product Requirement Document".
5. The user will invoke the `/to-issues` skill to create actionable issues.
6. The user will invoke the `/implement` skill to prompt you to action the issues.

## Agent skills

### Issue tracker

Issues are tracked as local markdown files under `.scratch/`. See `docs/agents/issue-tracker.md`.

### Triage labels

Default label vocabulary (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`). See `docs/agents/triage-labels.md`.

### Domain docs

Single-context — one `CONTEXT.md` + `docs/adr/` at the repo root. See `docs/agents/domain.md`.
