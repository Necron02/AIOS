---
name: nexus-architecture
description: Apply NEXUS architecture, module boundaries, data ownership, and design-decision rules when planning or changing cross-cutting functionality.
user-invocable: true
---

# NEXUS Architecture Skill

Before proposing or implementing a cross-cutting change, inspect `CLAUDE.md`, `docs/ARCHITECTURE.md`, `docs/PRODUCT_REQUIREMENTS.md`, and the relevant code. Do not assume that the documents still match the implementation; report discrepancies.

## Product boundary
- NEXUS is a local-first management application, not an autonomous AI agent.
- It must remain useful without Claude Code or any LLM being active.
- Claude Code is an external CLI launched by the user; do not add an API client or copy authentication credentials into NEXUS.
- SQLite is the structured source of truth. Obsidian is a projection for human-readable knowledge and history.

## Architecture rules
- Prefer a modular monolith: FastAPI, React, SQLite, and explicit adapters.
- Keep API routes thin. Put business rules in services and external-system work behind adapters.
- Keep SQLAlchemy models, Pydantic API schemas, and frontend types separate.
- Do not create microservices, queues, vector stores, autonomous agents, or infrastructure without a demonstrated requirement.
- Add an abstraction only when it improves a real test boundary, isolates an external dependency, or supports a genuinely variable implementation.
- Keep user-defined categories, resource types, and relationships data-driven.

## Data and events
- Use stable UUIDs and UTC timestamps.
- Every meaningful state change must append an `activity_events` record in the same DB transaction as the change.
- Activity events are append-only. Correct mistakes with a new event; do not rewrite history.
- Never log or export tokens, passwords, environment variable values, OAuth material, `.env` contents, or other secrets.
- Use Alembic migrations for schema changes. Never silently recreate or delete a user's database.

## Change protocol
1. Inspect current implementation and tests before editing.
2. State the smallest design change that meets the requirement.
3. Identify affected modules, data model, API, UI, security risks, and migration needs.
4. Implement in small steps with tests.
5. Update the relevant docs and `docs/DEVELOPMENT_ROADMAP.md` only when the plan or behavior changed.
6. Report commands run, test results, assumptions, and known limitations.

Do not broaden a phase's scope. Ask for approval before a destructive change or a change that writes outside the repository.