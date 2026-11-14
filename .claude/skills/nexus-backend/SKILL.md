---
name: nexus-backend
description: Build or modify NEXUS FastAPI endpoints, SQLAlchemy models, service logic, migrations, and backend tests using the project's conventions.
user-invocable: true
---

# NEXUS Backend Skill

Read `CLAUDE.md`, `docs/ARCHITECTURE.md`, and the relevant backend modules before changing code.

## Layering
- API routers validate requests and return response schemas; they do not contain business logic or direct SQL queries.
- Services coordinate business rules, repositories, adapters, and activity events.
- Repositories encapsulate SQLAlchemy persistence queries.
- Adapters encapsulate filesystem, Git, GitHub, Claude CLI, process, and Obsidian operations.
- Use dependency injection for DB sessions and external adapters so tests can replace them.

## Python conventions
- Use type hints for public functions and Pydantic models at API boundaries.
- Use SQLAlchemy 2.x typed mappings and a single session lifecycle per request/task.
- Use Alembic for every schema change. Review generated migrations before accepting them.
- Use UTC-aware timestamps and stable IDs.
- Validate and normalize Windows paths. Treat paths as user data, not trusted shell fragments.
- Use `subprocess` with argument arrays and `shell=False`; never pass user-controlled commands to `shell=True`.
- Add timeouts to network and CLI subprocess calls. Return structured, actionable errors.
- Redact secrets before logging and before creating activity payloads.

## API conventions
- Keep request and response schemas explicit.
- Use consistent error responses and correct HTTP status codes.
- Add pagination to list endpoints that may grow.
- Avoid returning raw ORM objects or raw configuration files.
- Make long scans and external operations visible as jobs/status records rather than holding a request open.

## Required tests
- Unit-test service rules and path/URL validation.
- Integration-test repository persistence and event creation with a temporary SQLite DB.
- Test failure paths: missing directories, permission errors, timeouts, malformed config, network failure, and duplicate resources.
- Verify that a failed external action does not create a false success event.

Do not add infrastructure or dependencies without a concrete need. Never delete or reset a user's local database as part of tests.