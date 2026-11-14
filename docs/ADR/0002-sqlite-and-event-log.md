# ADR 0002: SQLite and Append-Only Event Log

**Status:** Accepted  
**Date:** 2026-11-14  
**Supersedes:** None

---

## Context

NEXUS needs a durable, local data store for:
- Structured resources (projects, repositories, skills, MCP servers, applications)
- Categorization (categories, tags, custom fields, relationships)
- Operational data (scan runs, process runs, Claude sessions)
- **Audit trail** of all meaningful changes

Requirements:
- Local-only, no external database server
- Transactional integrity for multi-table writes
- Schema migration support
- Append-only audit log that never loses history
- Portable — single file backup
- Works on Windows without additional services

## Decision

Use **SQLite** as the primary database with:
1. **SQLAlchemy 2.x** for ORM and type-safe queries
2. **Alembic** for explicit, versioned migrations
3. **Append-only `activity_events` table** as the authoritative audit trail
4. **Transactional outbox** (`obsidian_sync_outbox`) for reliable projections

### Why SQLite

| Factor | Assessment |
|--------|------------|
| Local-first | ✅ Single file, no server |
| Transactions | ✅ Full ACID |
| Migrations | ✅ Alembic support |
| Concurrency | ✅ WAL mode handles readers/writers |
| Portability | ✅ Single file, cross-platform |
| Windows | ✅ Native support, no install |
| Backup | ✅ Copy file or `.backup` command |
| Size limits | ✅ Handles millions of rows for our use case |

### Why Append-Only Events

| Requirement | Solution |
|-------------|----------|
| Audit trail | Every mutation → event in same transaction |
| Debugging | Replay events to reconstruct state |
| Projections | Outbox feeds Obsidian sync, future projections |
| Corrections | Append compensating event; never rewrite history |
| Compliance | Immutable record of all changes |

### Event Contract

```sql
CREATE TABLE activity_events (
    id TEXT PRIMARY KEY,              -- UUID
    event_type TEXT NOT NULL,         -- "project.registered", etc.
    resource_id TEXT,                 -- FK to resources (nullable)
    occurred_at TEXT NOT NULL,        -- UTC ISO
    actor TEXT NOT NULL,              -- "user", "system", "cli", "sync"
    summary TEXT NOT NULL,            -- Human-readable
    payload_json TEXT,                -- Redacted snapshot
    schema_version INTEGER DEFAULT 1
);
```

**Rules:**
- Events are **immutable** — never UPDATE or DELETE
- Corrections = new event with `event_type` like `project.corrected`
- Payloads **redacted at write time** — no secrets, env values, tokens
- `schema_version` enables future payload evolution

### Outbox Pattern for Projections

```sql
CREATE TABLE obsidian_sync_outbox (
    id TEXT PRIMARY KEY,
    event_id TEXT NOT NULL UNIQUE,    -- FK to activity_events
    target_path TEXT NOT NULL,        -- Relative path in vault
    status TEXT NOT NULL DEFAULT 'pending',  -- pending/synced/failed/paused
    attempt_count INTEGER DEFAULT 0,
    next_attempt_at TEXT,             -- For exponential backoff
    last_error TEXT,
    synced_at TEXT
);
```

**Flow:**
1. Service writes resource change + `activity_events` + `obsidian_sync_outbox` in **one transaction**
2. Background worker polls `status = 'pending'`
3. Renders Markdown → atomic write to vault
4. Marks outbox row `synced` or records error + schedules retry

## Alternatives Considered

### PostgreSQL / MySQL
**Rejected:** Requires external server, install, service management. Violates local-first principle. Overkill for single-user local app.

### Plain JSON Files
**Rejected:** No transactions, no concurrent access safety, no migration tooling, no query language. Hard to maintain referential integrity across files.

### Event Store (EventStoreDB, etc.)
**Rejected:** Additional infrastructure. SQLite + outbox gives us event sourcing benefits without extra dependency.

### Writing Directly to Obsidian (No SQLite)
**Rejected:** Obsidian is a Markdown viewer, not a database. No queries, no transactions, no referential integrity, no schema evolution. Files can be edited externally causing drift.

### Mutable Status Columns Only
**Rejected:** Loses history. Can't answer "when did this change?" or "what was the previous value?" or replay for debugging.

## Consequences

### Positive
- **Zero infrastructure** — single `.db` file in `%LOCALAPPDATA%\NEXUS\`
- **Full history** — every change traceable via `activity_events`
- **Reliable projections** — outbox guarantees at-least-once delivery to Obsidian
- **Testable** — in-memory SQLite for fast unit/integration tests
- **Backup = copy file** — trivial disaster recovery
- **Schema evolution** — Alembic migrations are explicit and reviewable

### Negative
- **Single writer** — SQLite locks on write (mitigated: low concurrency, WAL mode)
- **No horizontal scaling** — accepted for local single-user app
- **Event table grows unbounded** — mitigation: retention policy in V1.0+, partitioning by date if needed
- **Manual migration review required** — Alembic autogenerate can miss things

### Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Event table grows too large | Add partitioning by year in V1.0; archive old events to separate DB |
| Migration breaks user data | Test upgrade from empty + previous version; backup before migrate |
| Out-of-order events | `occurred_at` + UUID v7 (time-ordered) for sorting |
| Payload schema drift | `schema_version` field; versioned parsers |
| Secrets in payload | Centralized redaction utility; unit tests for redaction |

## Implementation Notes

- Enable WAL mode: `PRAGMA journal_mode = WAL;`
- Enable foreign keys: `PRAGMA foreign_keys = ON;`
- Use UUID v7 (time-ordered) for event IDs for natural sorting
- Redaction utility: recursive JSON walker that removes keys matching secret patterns
- Outbox worker: exponential backoff (1m, 2m, 4m, 8m, max 1h), max retries = 10
- Daily log deduplication: use event UUID as key in daily Markdown file

## Related Decisions

- ADR 0001: Modular Monolith (database lives in single backend process)
- ADR 0003: Obsidian as Projection (consumes outbox)

---

*This ADR captures the data storage and audit trail decision. Schema details in `docs/DATABASE_SCHEMA.md`.*