# NEXUS — Personal AI Development Environment

A local-first management dashboard for developers. NEXUS catalogs and manages projects, repositories, skills, MCP servers, applications, and filesystem locations with full audit trails — all running locally on Windows 11.

## What NEXUS Is

- A **management and inventory application** for your development environment
- **Local-first** — works without internet; no cloud backend required for core features
- **No LLM dependency** — adding projects, registering skills, viewing config, and starting apps work without Claude or any model
- **Modular monolith** — one FastAPI backend, one React frontend, one SQLite database
- **Claude Code integration** — launches the existing `claude` CLI as an external process; does not call the Claude API or manage credentials

## What NEXUS Is Not

- ❌ An autonomous AI agent or coding assistant
- ❌ A replacement for Claude Code
- ❌ A cloud service or multi-user platform
- ❌ An LLM framework or vector database

## Planned Feature Set

| Area | Description |
|------|-------------|
| **Dashboard** | Live counts, recent events, failed health checks, stale scans |
| **Project Manager** | Register projects, categories, tags, Git state, launch Claude Code |
| **Skills Manager** | Inventory, preview, install, update, uninstall with staging/backups |
| **MCP Manager** | Inventory scopes, status, guarded CLI-based add/remove |
| **GitHub Library** | Add public repos, fetch metadata/README, categorize, link to projects |
| **Application Manager** | Register local apps, start/stop/health-check, PID tracking |
| **System Explorer** | Read-only inventory of Claude config, skills, MCP, Git repos |
| **Obsidian Sync** | Append-only event projection to Markdown with wiki links |
| **Customization** | User-defined categories, tags, resource types, fields, relationships, prompt templates |

## Initial Architecture

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

## Windows Prerequisites

- **Windows 11** (target platform)
- **Python 3.11+** for backend
- **Node.js 18+** for frontend
- **Git** for version control
- **Claude Code CLI** (`claude` in PATH) for integration features
- **Obsidian** (optional) for knowledge vault sync

## Data Location Policy

- **Runtime database, logs, backups**: `%LOCALAPPDATA%\NEXUS\` (not in Git)
- **Vault and project paths**: User-configurable
- **Source repository**: Contains only code, docs, and scaffold

## Security Principles

- Bind only to `127.0.0.1` — never `0.0.0.0`
- Validate Host/Origin headers; narrow CORS
- No `shell=True` — use argument arrays only
- No secrets in DB, logs, events, or Obsidian
- User-approved filesystem roots only
- PID + fingerprint validation before process control
- Quarantine before delete; staging + atomic moves for installs

## Development Commands

> ⚠️ **Not yet implemented** — these are planned commands for V0.1+

```powershell
# Start development servers (frontend + backend)
.\scripts\dev.ps1

# Run tests
.\scripts\test.ps1

# Lint and format
.\scripts\lint.ps1

# Backup runtime data
.\scripts\backup.ps1
```

## Project Status

| Phase | Status | Description |
|-------|--------|-------------|
| **V0.0** | 🟡 In Progress | Repository bootstrap, documentation, skills scaffold |
| V0.1 | ⏳ Planned | Running foundation: FastAPI + React + SQLite + health endpoint |
| V0.2 | ⏳ Planned | Resource catalog, project manager, dashboard counts, activity |
| V0.3 | ⏳ Planned | GitHub repository library |
| V0.4 | ⏳ Planned | System explorer, read-only discovery |
| V0.5 | ⏳ Planned | Skills manager (preview/install/update/uninstall) |
| V0.6 | ⏳ Planned | MCP manager |
| V0.7 | ⏳ Planned | Application manager + Claude launcher |
| V0.8 | ⏳ Planned | Activity timeline + Obsidian sync |
| V0.9 | ⏳ Planned | Customization (custom types, fields, templates) |
| V1.0 | ⏳ Planned | Security hardening, backup, packaging |

## Documentation

- [Product Requirements](docs/PRODUCT_REQUIREMENTS.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Database Schema](docs/DATABASE_SCHEMA.md)
- [Development Roadmap](docs/DEVELOPMENT_ROADMAP.md)
- [Security Model](docs/SECURITY_MODEL.md)
- [Windows Notes](docs/WINDOWS_NOTES.md)
- [User Guide](docs/USER_GUIDE.md)
- [ADR 0001: Modular Monolith](docs/ADR/0001-modular-monolith.md)
- [ADR 0002: SQLite and Event Log](docs/ADR/0002-sqlite-and-event-log.md)
- [ADR 0003: Obsidian as Projection](docs/ADR/0003-obsidian-as-projection.md)

## License

MIT — see [LICENSE](LICENSE) (to be added).