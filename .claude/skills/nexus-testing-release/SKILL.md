---
name: nexus-testing-release
description: Investigate bugs, add or run NEXUS tests, validate migrations, prepare safe Git commits, and perform release checks.
user-invocable: true
---

# NEXUS Testing and Release Skill

Read `CLAUDE.md`, `docs/DEVELOPMENT_ROADMAP.md`, and the relevant test/config files before acting.

## Bug workflow
1. Reproduce the issue or write a failing regression test.
2. Inspect the smallest relevant code path and logs; do not guess.
3. Identify the root cause, not just the visible symptom.
4. Make the smallest fix that preserves existing behavior.
5. Run focused tests, then the full available suite for the affected layer.
6. Report remaining uncertainty and untested cases.

## Test rules
- Never delete or weaken tests merely to make a build pass.
- Never use the user's real NEXUS DB, Obsidian vault, project directories, or live Claude configuration in automated tests.
- Use temporary directories, temporary SQLite DBs, fake executables, and mocks.
- Test normal behavior and failure paths, especially timeouts, permission errors, cancellation, duplicate operations, and rollback.
- Migrations must be tested from an empty DB and from the previous schema version.

## Git rules
- Inspect `git status` and the diff before modifying or committing.
- Do not stage unrelated user files.
- Do not commit secrets, local DBs, logs, backups, `.env`, or machine-specific config.
- Use a small, descriptive commit message. Do not amend or force-push unless explicitly requested.
- Do not create a release tag until the user confirms the milestone and all release checks pass.

## Completion report
State files changed, behavior added, tests and commands run, pass/fail results, migration impact, security considerations, known limitations, and suggested next task. Never claim a test passed if it was not run.