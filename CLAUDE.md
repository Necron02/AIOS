# CLAUDE.md — NEXUS Project Instructions

## Product Boundary

- NEXUS is a **local management dashboard**, not an autonomous AI agent and not a replacement for Claude Code.
- It must remain useful **without Claude Code or any LLM** being active.
- Claude Code is an **external CLI** launched by the user; do not add an API client or copy authentication credentials into NEXUS.
- SQLite is the **structured source of truth**. Obsidian is a projection for human-readable knowledge and history.

## Architecture Rules

- **Modular monolith**: FastAPI, React, SQLite, and explicit adapters.
- Keep **API routes thin** — business rules in services, external-system work behind adapters.
- Keep **SQLAlchemy models, Pydantic API schemas, and frontend types separate**.
- Do not create microservices, queues, vector stores, autonomous agents, or infrastructure without a demonstrated requirement.
- Add an abstraction only when it improves a real test boundary, isolates an external dependency, or supports a genuinely variable implementation.
- Keep user-defined categories, resource types, and relationships **data-driven**.

## Windows-First Context

- Target platform: **Windows 11**, localhost, local-first
- Runtime data: `%LOCALAPPDATA%\NEXUS\` (database, logs, backups, local config)
- Path handling: validate and normalize Windows paths; treat paths as user data, not trusted shell fragments
- Use `subprocess` with **argument arrays** and `shell=False`; never pass user-controlled commands to `shell=True`
- Terminal launch: use OS-appropriate console/window strategy for `claude` CLI

## Safe Subprocess/Filesystem Rules

- Inventory is **read-only by default**. Every write requires explicit user action with preview.
- Restrict scans to **user-approved roots**. Do not crawl whole drives or follow symlinks/reparse points by default.
- Reject path traversal, archive traversal, suspicious symlinks, unexpected nested destination paths.
- For installs: stage, validate, then atomically move. Keep backup/quarantine for rollback.
- Never execute scripts from a downloaded skill during inspection or installation.
- Never kill a process by port. Validate PID, process start time, executable, and working directory before stopping.

## Test Expectations

- **Unit tests**: path validation, URL parsing, skill frontmatter parsing, service rules, event redaction, command construction, status normalization.
- **Integration tests**: API + temporary SQLite DB, migrations, event/outbox transactions, filesystem adapter with temp directories, Git adapter with fixture repos.
- **Contract tests**: fake `claude` executable outputs and subprocess timeouts; GitHub API fixtures; Obsidian temporary vault.
- Never use the user's real NEXUS DB, Obsidian vault, project directories, or live Claude configuration in automated tests.
- Test normal behavior and failure paths: timeouts, permission errors, cancellation, duplicate operations, rollback.

## Documentation to Read First

1. `docs/ARCHITECTURE.md` — current module boundaries and data flow
2. `docs/PRODUCT_REQUIREMENTS.md` — functional requirements
3. `docs/DATABASE_SCHEMA.md` — current tables and relationships
4. `docs/SECURITY_MODEL.md` — current permissions and integration safeguards
5. `docs/DEVELOPMENT_ROADMAP.md` — phase status, completed items, next phase, blockers

## Progress Update Protocol

After each phase:
1. Update `docs/DEVELOPMENT_ROADMAP.md` with completed work, partial work, known issues, and next bounded task.
2. Update `docs/ARCHITECTURE.md`, `docs/DATABASE_SCHEMA.md`, `docs/SECURITY_MODEL.md` if implementation changed them.
3. Record exact tests, lint, typecheck, migration, and build commands run with actual results.
4. Do not commit unless explicitly approved. Inspect `git diff` and `git status` first.

## Skills Available

Invoke these project-specific skills when their domain is relevant:
- `nexus-architecture` — cross-cutting design decisions
- `nexus-backend` — FastAPI, SQLAlchemy, migrations, services
- `nexus-frontend` — React, TypeScript, UI components
- `nexus-local-integrations` — FS, Git, CLI, processes (highest risk)
- `nexus-obsidian-sync` — Markdown projection, outbox, wiki links
- `nexus-testing-release` — tests, bugs, migrations, releases

## Current Phase

**V0.0** — Repository bootstrap and documentation scaffold. No product features implemented yet.