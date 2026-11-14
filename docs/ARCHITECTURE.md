# NEXUS Architecture

**Status:** Planning baseline — revise only when implementation evidence requires it  
**Version:** V0.0 scaffold

---

## 1. Architecture Overview

NEXUS is a **modular monolith** with domain-oriented modules. Run the API and frontend locally. During development, Vite serves the frontend and proxies `/api` to FastAPI. In a packaged release, FastAPI may serve the built frontend assets or a small local launcher may start both processes. Do not decide packaging until core features are stable.

```
Browser (127.0.0.1)
    |
    v
React + TypeScript + Vite + Tailwind
    | HTTP / JSON
    v
FastAPI routes (request validation, response schemas)
    |
    v
Application services / use cases
    |------------------|-------------------|-------------------|
    v                  v                   v                   v
SQLite repositories  Filesystem adapter   Claude CLI adapter  Process manager
(SQLAlchemy)         + Watchdog           + MCP CLI wrapper   + psutil
    |
    v
Activity event log + sync outbox
    |
    v
Obsidian projection adapter (Markdown files)
```

**Key principles:**
- Keep route handlers thin. Routes validate inputs and call services; services enforce business rules and write events; adapters talk to external systems.
- Avoid putting business logic into React components or direct SQL into API routes.
- Use dependency injection for DB sessions and external adapters so tests can replace them.

---

## 2. Backend Module Boundaries

| Module | Responsibility |
|--------|----------------|
| `core` | App settings, paths, logging, error types, security helpers |
| `db` | SQLAlchemy base, session factory, migrations, repository helpers |
| `domain` | Enums/constants only where stable, common IDs/value objects, event contracts |
| `projects` | Project service, project repository, Git adapter |
| `catalog` | Resource types, categories, tags, custom fields, resource relationships |
| `repositories` | GitHub URL parser, GitHub API adapter, README metadata extraction |
| `skills` | Scanner/parser, preview, safe install/update/uninstall workflows |
| `mcp` | Claude CLI adapter, config inventory parser, status normalizer |
| `applications` | Process manager, launch profiles, health checkers |
| `discovery` | Allowed scan roots, filesystem scan, Watchdog observer, exclusions |
| `claude` | CLI path discovery, launcher, safe argument builder, session records |
| `activity` | Append-only event service, outbox, event query APIs |
| `obsidian` | Note renderers, vault path validation, atomic writer, sync worker |
| `api` | Versioned routers and dependency wiring |

> Do not create all of these as empty packages in the first coding phase. Add modules when their phase begins.

---

## 3. Frontend Module Boundaries

| Module | Responsibility |
|--------|----------------|
| `app` | Router, layout, theme, global providers |
| `components` | Reusable buttons, dialogs, tables, badges, forms, empty states |
| `features/dashboard` | Dashboard page and widgets |
| `features/projects` | Project management UI |
| `features/repositories` | GitHub repository library UI |
| `features/skills` | Skills manager UI |
| `features/mcp` | MCP manager UI |
| `features/applications` | Application manager UI |
| `features/system-explorer` | System explorer UI |
| `features/activity` | Activity timeline UI |
| `features/settings` | Settings UI |
| `lib/api` | Typed API client, query cache, error handling |
| `lib/types` | Generated or manually maintained API types |

Prefer feature-level pages and components. Avoid one giant dashboard component with all business logic.

---

## 4. Layering Rules

### Backend Layers
1. **API Routes** (`api/`) — Validate requests, return response schemas. No business logic, no direct SQL.
2. **Services** (`projects/`, `skills/`, etc.) — Coordinate business rules, repositories, adapters, activity events.
3. **Repositories** — Encapsulate SQLAlchemy persistence queries.
4. **Adapters** — Encapsulate filesystem, Git, GitHub, Claude CLI, process, and Obsidian operations.
5. **Domain** — Shared enums, value objects, event contracts.

### Frontend Layers
1. **Pages/Features** — Compose components, call API via hooks.
2. **Components** — Reusable presentational components.
3. **API Layer** (`lib/api`) — Typed HTTP client, query caching, error handling.
4. **Types** (`lib/types`) — TypeScript interfaces matching API contracts.

---

## 5. Integration Boundaries

| External System | Adapter | Key Constraints |
|-----------------|---------|-----------------|
| Filesystem | `discovery/` + `skills/` | User-approved roots only; no symlinks; staged writes |
| Git | `projects/` | Git CLI via argument arrays; read-only conveniences via GitPython |
| GitHub REST API | `repositories/` | `httpx` with timeouts; no token required for public repos |
| Claude Code CLI | `claude/` + `mcp/` | `subprocess` with `cwd`; argument arrays; no `shell=True` |
| Local Processes | `applications/` | `psutil` for PID validation; fingerprint before stop |
| Obsidian Vault | `obsidian/` | Atomic writes; ownership markers; outbox for retries |

---

## 6. Data Flow Patterns

### Read Path
```
UI → API Route → Service → Repository → SQLite
                    ↘ Adapter → External System (GitHub, FS, CLI)
```

### Write Path (with Event)
```
UI → API Route → Service → Repository (DB change)
                    → Activity Service (append event)
                    → Outbox (if Obsidian sync enabled)
                    → Adapter (external mutation, if any)
```

### Background Workers
- Filesystem scan (cancellable, incremental, progress reporting)
- Obsidian sync worker (polls outbox, retries with backoff)
- Process health checks (periodic, non-blocking)

---

## 7. Configuration

- **Pydantic Settings** for validated configuration
- Environment variables with `.env.example` template
- Runtime data in `%LOCALAPPDATA%\NEXUS\`
- User-configurable: vault path, scan roots, Claude executable override

---

## 8. Error Handling

- Structured error responses with correct HTTP status codes
- Timeouts on all external calls (CLI, HTTP, DB)
- Actionable error messages for startup and runtime failures
- Never leak secrets or internal stack traces to frontend

---

## 9. Testing Strategy

- Unit tests: pure functions, validators, parsers, command builders
- Integration tests: API + temp SQLite, migrations, event/outbox transactions
- Contract tests: fake CLI outputs, GitHub API fixtures, temp Obsidian vault
- Frontend tests: component behavior, forms, filters, dialogs, error states
- Manual smoke tests: Windows terminal launch, actual CLI, process lifecycle

---

## 10. Future Extensibility Points

- Authentication/multi-profile (service boundary exists in `core/`)
- Additional adapter implementations (interfaces in `domain/`)
- Custom resource types (data-driven in `catalog/`)
- Webhook/event streaming (outbox pattern in `activity/`)