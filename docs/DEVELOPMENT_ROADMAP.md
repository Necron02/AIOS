# NEXUS Development Roadmap

**Status:** V0.0 scaffold — documentation only  
**Last Updated:** 2026-11-14

---

## Version Overview

| Version | Focus | Status | Target |
|---------|-------|--------|--------|
| **V0.0** | Repository bootstrap & documentation | 🟡 In Progress | Week 1 |
| V0.1 | Running foundation | ⏳ Planned | Week 2 |
| V0.2 | Resource catalog & project manager | ⏳ Planned | Week 3 |
| V0.3 | GitHub repository library | ⏳ Planned | Week 4 |
| V0.4 | System explorer & read-only inventory | ⏳ Planned | Week 5 |
| V0.5 | Skills manager | ⏳ Planned | Week 6 |
| V0.6 | MCP manager | ⏳ Planned | Week 7 |
| V0.7 | Application manager & Claude launcher | ⏳ Planned | Week 8 |
| V0.8 | Activity timeline & Obsidian sync | ⏳ Planned | Week 9 |
| V0.9 | Customization & operational polish | ⏳ Planned | Week 10 |
| V1.0 | Security, reliability, backup, packaging | ⏳ Planned | Week 11+ |

---

## Global Completion Gate (Every Version)

A phase is complete **only when**:

1. ✅ Acceptance criteria below are met
2. ✅ Relevant automated tests pass
3. ✅ No secrets or user data committed
4. ✅ UI has loading, empty, success, and error states for new flows
5. ✅ `README.md`, `CLAUDE.md`, architecture docs, or roadmap updated if behavior changed
4. ✅ Validation commands run and actual results reported
5. ✅ Git commit created **only after user reviews diff and confirms**

---

## V0.0 — Repository Bootstrap & Documentation 🟡 IN PROGRESS

**Goal:** Create scaffold, docs, and skills so the project is ready for V0.1 implementation.

### Deliverables
- [x] Repository structure per `docs/ARCHITECTURE.md` section 3
- [x] `README.md` — project overview, architecture, roadmap, commands (marked not implemented)
- [x] `CLAUDE.md` — persistent project instructions
- [x] `.gitignore` — excludes DB, logs, backups, .env, venv, node_modules, build outputs
- [x] `.env.example` — template with no real credentials
- [x] `docs/PRODUCT_REQUIREMENTS.md` — all functional areas documented
- [x] `docs/ARCHITECTURE.md` — modular monolith, modules, adapters, layering
- [x] `docs/DATABASE_SCHEMA.md` — proposal with all tables, indexes, event types
- [x] `docs/DEVELOPMENT_ROADMAP.md` — this file with accurate status
- [x] `docs/SECURITY_MODEL.md` — loopback, origin checks, no shell, path validation, PID validation, secrets
- [x] `docs/WINDOWS_NOTES.md` — paths, LOCALAPPDATA, Claude config, terminal launch, spaces
- [x] `docs/USER_GUIDE.md` — marked as planned where functionality doesn't exist
- [x] `docs/ADR/0001-modular-monolith.md` — why modular monolith, trade-offs
- [x] `docs/ADR/0002-sqlite-and-event-log.md` — why SQLite + append-only events
- [x] `docs/ADR/0003-obsidian-as-projection.md` — why Obsidian as projection, not DB
- [x] `backend/pyproject.toml` — minimal config
- [x] `backend/src/nexus/__init__.py` — package marker
- [x] `frontend/package.json` — minimal config with Vite, React, TypeScript, Tailwind
- [x] `frontend/src/` — placeholder structure (app, components, features, lib)
- [x] `scripts/dev.ps1`, `scripts/test.ps1`, `scripts/lint.ps1`, `scripts/backup.ps1` — starter placeholders
- [x] `data/.gitkeep`, `logs/.gitkeep` — runtime dirs ignored
- [x] `.claude/skills/*/SKILL.md` — all 6 skills with full spec from blueprint

### Dependencies
- None (foundational)

### Acceptance Criteria
- [x] All files created per structure above
- [x] No broken relative links in Markdown
- [x] `.gitignore` covers all runtime artifacts
- [x] Skills preserve exact frontmatter and body from blueprint section 4.2
- [x] Documentation marked accurately (proposal, scaffold, not implemented)

### Blockers
- None

---

## V0.1 — Running Foundation ⏳ PLANNED

**Goal:** FastAPI + React shell, SQLite, migrations, health endpoint, scripts, test baseline.

### Deliverables
- [ ] FastAPI app with `/health` endpoint
- [ ] SQLAlchemy 2.x + Alembic initialized
- [ ] Initial migration creating core tables (`resource_types`, `resources`, `settings`, `activity_events`, `obsidian_sync_outbox`)
- [ ] React + Vite + TypeScript + Tailwind scaffold
- [ ] Vite proxy `/api` → FastAPI in dev
- [ ] `scripts/dev.ps1` starts both servers
- [ ] `scripts/test.ps1` runs backend + frontend tests
- [ ] `scripts/lint.ps1` runs ruff/mypy + eslint/prettier
- [ ] Pydantic Settings for config
- [ ] CORS + Host/Origin validation middleware
- [ ] Request logging + structured error responses

### Dependencies
- V0.0 complete

### Acceptance Criteria
- [ ] `.\scripts\dev.ps1` starts backend on `http://127.0.0.1:8000` and frontend on `http://127.0.0.1:5173`
- [ ] `GET /health` returns `{ "status": "ok", "version": "0.1.0" }`
- [ ] SQLite DB created at `%LOCALAPPDATA%\NEXUS\nexus.db`
- [ ] Alembic `upgrade head` works from empty DB
- [ ] Frontend shows "NEXUS" title and health status from API
- [ ] Backend tests pass (pytest)
- [ ] Frontend tests pass (vitest)
- [ ] Lint passes (ruff, mypy, eslint, prettier)

### Blockers
- V0.0 must be complete and reviewed

---

## V0.2 — Resource Catalog & Project Manager ⏳ PLANNED

**Goal:** Categories, tags, relationships, projects, search, dashboard counts, activity events.

### Deliverables
- [ ] Resource type registry (built-in + user-defined)
- [ ] Category CRUD + ordering + colors
- [ ] Tag CRUD
- [ ] Resource link CRUD (typed relationships)
- [ ] Custom field definitions + values
- [ ] Project register/update/archive API + UI
- [ ] Project list with filters, search, pagination
- [ ] Project detail: path, Git state, branch, dirty, categories, tags, links
- [ ] Dashboard: live counts from DB queries
- [ ] Activity event append on all mutations
- [ ] Basic UI layout: nav, project list, project detail, dashboard

### Dependencies
- V0.1 complete

### Acceptance Criteria
- [ ] Create project via UI → appears in list with correct counts
- [ ] Edit project → activity event recorded
- [ ] Archive project → soft delete, event recorded
- [ ] Categories/tags work across resource types
- [ ] Resource links create bidirectional navigation
- [ ] Dashboard counts match DB queries exactly
- [ ] Search filters projects by name, path, category, tag
- [ ] All forms have validation, loading, error, empty states

### Blockers
- V0.1 foundation must be stable

---

## V0.3 — GitHub Repository Library ⏳ PLANNED

**Goal:** Add/refresh public repos, README and metadata, statuses, links to projects.

### Deliverables
- [ ] GitHub URL validation + normalization
- [ ] Public REST API adapter (`httpx`) with timeout + retry
- [ ] Repository add: fetch metadata, README, detect languages/topics
- [ ] Repository list with status: `Saved`, `To Explore`, `Installed`, `Currently Using`, `Archived`
- [ ] Repository detail: metadata, README preview, links to projects/skills/apps
- [ ] Refresh action: re-fetch metadata, preserve local notes/links
- [ ] Rate limit handling + graceful degradation
- [ ] No token required for public repos; optional token via OS credential store

### Dependencies
- V0.2 complete (needs resource catalog, categories, tags, links)

### Acceptance Criteria
- [ ] Add public repo by URL → metadata stored, README cached
- [ ] Refresh updates metadata without losing local data
- [ ] Status field editable with defined enum values
- [ ] Links to projects/skills/apps bidirectional
- [ ] Handles 404, rate limit, network error gracefully
- [ ] Heuristic language detection labeled as estimate

### Blockers
- V0.2 resource catalog needed for categorization

---

## V0.4 — System Explorer & Read-Only Inventory ⏳ PLANNED

**Goal:** Approved roots, Claude Code directories/config inventory, skill and MCP discovery.

### Deliverables
- [ ] Scan root management (add/remove/validate)
- [ ] Manual scan trigger with progress + cancellation
- [ ] Discovery: Claude settings files, skill dirs, agent dirs, command dirs, plugin locations, MCP config sources, project roots, Git repos
- [ ] Respect `CLAUDE_CONFIG_DIR` override
- [ ] Show exact path, existence, last modified, last scanned, provenance
- [ ] "Not inspected" vs "not installed" distinction
- [ ] Default exclusions: `.git/objects`, `node_modules`, `.venv`, `venv`, `dist`, `build`, `__pycache__`, `.next`, cache/temp
- [ ] No symlink/reparse following by default
- [ ] Scan results persisted; errors don't fail entire scan

### Dependencies
- V0.2 complete (needs projects, catalog for associations)

### Acceptance Criteria
- [ ] Add scan root → validated, stored
- [ ] Manual scan runs → shows summary, persists results
- [ ] Discovered skills appear with path, frontmatter, hash, scope
- [ ] Discovered MCP entries show transport, command/URL, env var names, scope
- [ ] Git repos detected with branch, dirty status
- [ ] Unknown locations show "not inspected"
- [ ] Cancellable scan with progress UI

### Blockers
- V0.2 project/catalog foundation

---

## V0.5 — Skills Manager ⏳ PLANNED

**Goal:** Preview, install, update, uninstall with staging, backups, audit events.

### Deliverables
- [ ] Skill preview: show `SKILL.md` content, frontmatter, source, hash
- [ ] Install: select target dir (global/project), stage → validate → atomic move
- [ ] Update: diff preview → confirm → backup → atomic replace
- [ ] Uninstall: move to NEXUS quarantine → event recorded → rollback option
- [ ] Never execute scripts during preview/install
- [ ] Path traversal + symlink protection
- [ ] Backup/quarantine location in `%LOCALAPPDATA%\NEXUS\skills-backup\`
- [ ] Associate installed skill with source repo (if known)

### Dependencies
- V0.4 complete (needs discovered skills inventory)

### Acceptance Criteria
- [ ] Preview shows full skill content before install
- [ ] Install validates `SKILL.md` exists, stages, atomically moves
- [ ] Update shows unified diff before applying
- [ ] Uninstall moves to quarantine, not permanent delete
- [ ] Rollback restores from quarantine
- [ ] All actions create activity events with payloads
- [ ] Path traversal attempts rejected

### Blockers
- V0.4 discovery must work

---

## V0.6 — MCP Manager ⏳ PLANNED

**Goal:** Read-only detail and status, guarded CLI-based add/remove, verification.

### Deliverables
- [ ] Inventory all scopes: user, project (`.mcp.json`), local
- [ ] Show: name, transport, command/args or URL, env var names (not values), scope, config source, status
- [ ] Status: `configured`, `healthy`, `needs_auth`, `failed`, `not_checked`
- [ ] Add via `claude mcp add` (where CLI supports) with review dialog
- [ ] Remove via `claude mcp remove` with confirmation
- [ ] Re-read config after mutation; verify result
- [ ] No direct edit of `~/.claude.json`
- [ ] Enable/disable: only if CLI exposes safe command; otherwise label limitation honestly

### Dependencies
- V0.4 complete (needs MCP discovery)

### Acceptance Criteria
- [ ] MCP list matches `claude mcp list` output
- [ ] Add shows review dialog with all params before executing
- [ ] Remove confirms before executing
- [ ] Post-mutation verification re-reads CLI/config
- [ ] Env var values never displayed or stored
- [ ] Unsupported enable/disable shows honest status

### Blockers
- V0.4 discovery; Claude CLI adapter from V0.1

---

## V0.7 — Application Manager & Claude Launcher ⏳ PLANNED

**Goal:** Register/start/stop/health-check local apps; open Claude CLI in a project.

### Deliverables
- [ ] App registration: working dir, executable, args (array), env var refs, kind, URL, health check config
- [ ] Start: spawn process, record PID + fingerprint (start time, exe path, cwd)
- [ ] Stop: graceful → force after timeout; validate PID + fingerprint before kill
- [ ] Restart: stop + start
- [ ] Health checks: HTTP + TCP; show check type; never kill by port
- [ ] Open local URL in default browser
- [ ] Desktop apps without URL/health supported
- [ ] On NEXUS restart: reconcile PID records with OS processes
- [ ] Launch Claude Code: detect `claude` via `shutil.which()` or override; `cwd=project dir`; argument array; no permission-bypass flags; show prompt before launch

### Dependencies
- V0.2 complete (projects for Claude launch context)
- V0.1 process manager foundation

### Acceptance Criteria
- [ ] Start web app → PID recorded, health check runs, URL opens
- [ ] Stop → graceful SIGTERM, then force if needed
- [ ] Restart preserves config, new PID recorded
- [ ] PID reuse detected via fingerprint (start time + exe + cwd)
- [ ] Port check read-only; unrelated process on port not killed
- [ ] Claude launch opens terminal in project dir with correct CLI
- [ ] All process actions create activity events

### Blockers
- V0.2 projects; V0.1 core + process adapter

---

## V0.8 — Activity Timeline & Obsidian Sync ⏳ PLANNED

**Goal:** Append-only event log, outbox, deterministic Markdown projection.

### Deliverables
- [ ] Activity event query API (filter by type, resource, date range, pagination)
- [ ] UI timeline: chronological, grouped by day, searchable
- [ ] Obsidian vault path validation + config
- [ ] Outbox worker: polls pending, renders Markdown, atomic write, marks synced/failed
- [ ] Vault structure: `NEXUS/` with Projects/, Repositories/, Skills/, MCP/, Applications/, Categories/, Activity/YYYY/MM/DD.md, Templates/
- [ ] Frontmatter: `nexus_id`, `nexus_type`, `managed_by: NEXUS`, timestamps
- [ ] Wiki links between notes: `[[Projects/my-project]]`
- [ ] Dry-run, pause, retry, last-sync status
- [ ] Never overwrite unmanaged notes; conflict detection
- [ ] Idempotent: retry doesn't duplicate daily log entries (event UUID dedup)

### Dependencies
- V0.2+ activity events from all prior phases
- V0.1 outbox table

### Acceptance Criteria
- [ ] Timeline shows all events with correct provenance
- [ ] Sync enabled → outbox populated on each event
- [ ] Worker syncs → notes appear in vault with correct frontmatter
- [ ] Wiki links resolve between managed notes
- [ ] Dry-run shows what would be written
- [ ] Pause prevents writes, preserves pending
- [ ] Retry with backoff on failure
- [ ] Conflict: existing unmanaged note → user chooses alternate path

### Blockers
- Activity events from V0.2-V0.7 must be implemented

---

## V0.9 — Customization & Operational Polish ⏳ PLANNED

**Goal:** Custom resource types/fields, prompt templates, settings, scan controls, UX polish.

### Deliverables
- [ ] Custom resource type CRUD (extends `resource_types`)
- [ ] Custom field definitions per resource type
- [ ] Prompt template CRUD: name, description, body, target type, variables
- [ ] Launch Claude with template: render variables → show prompt → confirm → launch
- [ ] Settings UI: vault path, scan roots, Claude executable, sync toggle, log level
- [ ] Scan controls: schedule, exclusions, incremental toggle
- [ ] UX: keyboard nav, focus visible, accessible dialogs, dense tables, long paths
- [ ] Empty/loading/error states everywhere
- [ ] Performance: usable with 1000+ resources

### Dependencies
- V0.2 catalog foundation; V0.8 activity for templates context

### Acceptance Criteria
- [ ] Create custom resource type → appears in catalog, supports fields/links
- [ ] Custom fields work in UI forms
- [ ] Prompt template renders variables, launches Claude with result
- [ ] Settings persist, validated, affect behavior
- [ ] Scan scheduling works (if implemented)
- [ ] All UI meets accessibility basics

### Blockers
- V0.2 catalog; V0.7 Claude launcher

---

## V1.0 — Security, Reliability, Backup, Packaging ⏳ PLANNED

**Goal:** Hardening, restore test, startup/backup scripts, release checklist.

### Deliverables
- [ ] Security audit: loopback binding, origin/host checks, CORS, no shell=True, path validation, PID validation, secret redaction
- [ ] Backup script: DB + settings + NEXUS-owned Obsidian data (no secrets)
- [ ] Restore test: documented + verified
- [ ] Startup script: checks DB, migrations, config, launches both processes
- [ ] Packaging: single-folder distribution or installer (decide after V0.9)
- [ ] Release checklist: tests, lint, migration test, backup test, security scan
- [ ] CHANGELOG.md with user-visible changes
- [ ] Version tag `v1.0.0` after user approval

### Dependencies
- All prior versions complete

### Acceptance Criteria
- [ ] Security model documented and verified
- [ ] Backup creates restorable archive
- [ ] Restore test passes on clean machine
- [ ] Startup script handles missing DB, pending migrations, config errors
- [ ] Release checklist completed
- [ ] No secrets in any artifact

### Blockers
- All prior versions

---

## Current Status Summary

| Area | Status |
|------|--------|
| Documentation scaffold | 🟡 In Progress (V0.0) |
| Backend foundation | ⏳ Not started |
| Frontend foundation | ⏳ Not started |
| Database/migrations | ⏳ Not started |
| Project/Resource catalog | ⏳ Not started |
| GitHub integration | ⏳ Not started |
| Filesystem discovery | ⏳ Not started |
| Skills management | ⏳ Not started |
| MCP management | ⏳ Not started |
| Application management | ⏳ Not started |
| Activity timeline | ⏳ Not started |
| Obsidian sync | ⏳ Not started |
| Customization | ⏳ Not started |
| Security/Backup/Packaging | ⏳ Not started |

---

## Next Action

**Review all V0.0 documentation and skill files for accuracy.** Then begin V0.1 implementation per the acceptance criteria above.