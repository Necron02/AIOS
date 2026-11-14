# ADR 0001: Modular Monolith Architecture

**Status:** Accepted  
**Date:** 2026-11-14  
**Supersedes:** None

---

## Context

NEXUS is a personal AI development environment running locally on Windows 11. It needs to manage projects, repositories, skills, MCP servers, applications, and filesystem locations with full audit trails. The system integrates with external tools (Git, GitHub, Claude Code CLI, Obsidian, local processes) but must remain functional without any cloud services or LLM APIs.

Key constraints:
- Single-user, local-first operation
- Must work without internet for core features
- Windows 11 target platform
- Small team (initially solo developer)
- Need to deliver value incrementally
- High-risk integrations (filesystem, process control, CLI) require careful boundaries

## Decision

We will build NEXUS as a **modular monolith** with:

1. **Single backend process** (FastAPI + Uvicorn)
2. **Single frontend application** (React + Vite)
3. **Single SQLite database** (with Alembic migrations)
4. **Domain-oriented modules** with explicit boundaries
5. **Adapter pattern** for all external system integrations
6. **No microservices, message queues, vector databases, or agent frameworks**

### Module Boundaries (Backend)

| Module | Responsibility | External Dependency |
|--------|----------------|---------------------|
| `core` | Settings, paths, logging, errors, security | None |
| `db` | SQLAlchemy base, sessions, migrations | SQLite |
| `domain` | Shared enums, IDs, value objects, events | None |
| `projects` | Project CRUD, Git adapter | Git CLI |
| `catalog` | Resource types, categories, tags, links, custom fields | None |
| `repositories` | GitHub URL parsing, REST API, README | GitHub REST API (httpx) |
| `skills` | Scanner, parser, install/update/uninstall | Filesystem, Git |
| `mcp` | CLI adapter, config parser, status normalizer | Claude Code CLI |
| `applications` | Process manager, health checks | psutil, subprocess |
| `discovery` | Scan roots, filesystem scan, Watchdog | Filesystem, Watchdog |
| `claude` | CLI detection, launcher, session records | Claude Code CLI |
| `activity` | Event append, outbox, queries | SQLite |
| `obsidian` | Markdown renderers, vault writer, sync worker | Filesystem |
| `api` | Versioned routers, DI wiring | FastAPI |

### Adapter Pattern

All external system interactions go through **adapters**:
- **Filesystem Adapter** — wraps `pathlib`, `watchdog`, exclusions
- **Git Adapter** — wraps Git CLI via argument arrays
- **GitHub Adapter** — wraps `httpx` with timeouts, retries
- **Claude CLI Adapter** — wraps `subprocess` with `cwd`, argument arrays
- **MCP CLI Adapter** — wraps `claude mcp` commands
- **Process Adapter** — wraps `psutil` + `subprocess`
- **Obsidian Adapter** — wraps atomic file writes, frontmatter, wiki links

Adapters are:
- **Testable** — can be replaced with fakes in tests
- **Explicit** — clear boundary between NEXUS logic and external systems
- **Safe** — enforce timeouts, validation, redaction

## Alternatives Considered

### Microservices
**Rejected:** Operational complexity (multiple processes, service discovery, network latency, distributed transactions) far exceeds needs for a single-user local app. No scaling requirement.

### Agent Framework (LangChain, AutoGPT, etc.)
**Rejected:** NEXUS is a management dashboard, not an autonomous agent. Adding an agent framework introduces unnecessary complexity, non-determinism, and LLM dependency for core features.

### Event-Driven Architecture (Message Broker)
**Rejected:** SQLite + append-only events + outbox pattern provides sufficient durability and ordering for a single-process app. No need for Redis/Kafka/RabbitMQ.

### Vector Database
**Rejected:** Full-text search in SQLite (FTS5) or simple LIKE queries suffice for metadata search. Semantic search not required for inventory management.

### Cloud Backend
**Rejected:** Local-first is a core principle. Cloud adds auth, sync, hosting costs, and internet dependency for no user benefit in MVP.

## Consequences

### Positive
- **Simple deployment** — one backend, one frontend, one DB file
- **Easy testing** — single process, in-memory DB for tests, fake adapters
- **Clear boundaries** — modules communicate via interfaces, not shared state
- **Incremental delivery** — can build one module at a time
- **Low operational burden** — no infra to manage
- **Windows-friendly** — single process, no container orchestration

### Negative
- **Single point of failure** — backend crash stops all features (mitigated by fast restart)
- **Scaling limited** — not designed for multi-user or high concurrency (accepted)
- **Module coupling risk** — must enforce boundaries via code review and tests

### Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Modules become tightly coupled | Enforce layering: routes → services → repositories/adapters; no cross-module imports except via domain |
| Adapter logic leaks into services | Keep adapters pure; services orchestrate only |
| Database becomes bottleneck | SQLite WAL mode + indexes; profile before optimizing |
| Frontend-backend version drift | Shared TypeScript/Pydantic types via code generation or manual sync |

## Implementation Notes

- Create modules **when their phase begins**, not all upfront
- Use dependency injection (FastAPI `Depends`) for DB sessions and adapters
- Define adapter interfaces in `domain/` for testability
- Keep `domain/` minimal — only truly shared types
- Add new modules for genuinely new domains, not for every feature

## Related Decisions

- ADR 0002: SQLite and Event Log
- ADR 0003: Obsidian as Projection

---

*This ADR captures the architectural style decision. Implementation details belong in `docs/ARCHITECTURE.md`.*