# NEXUS — Personal AI Development Environment
## Implementation Blueprint for Claude Code

**Document type:** Product specification, architecture decision record, staged build plan, and copy-ready implementation prompts  
**Target:** Windows 11, localhost, local-first  
**Architecture style:** Modular monolith  
**Primary coding environment:** Existing Claude Code CLI installation  
**Status:** Planning baseline — revise decisions only when implementation evidence requires it

---

# 0. Executive recommendation

Build NEXUS as a **local-first modular monolith**: one FastAPI backend, one React frontend, one SQLite database, and a small set of explicit integration adapters. Do not start with microservices, an agent framework, a vector database, a message broker, or a cloud backend.

NEXUS is a **management and inventory application**, not an autonomous agent. It should work without an LLM. Its primary job is to maintain a dependable, searchable model of projects, repositories, skills, MCP servers, applications, filesystem locations, and their relationships. Claude Code is launched as an external CLI process when requested; NEXUS does not call the Claude API or manage Claude credentials.

The most important architectural boundary is:

- **NEXUS database:** authoritative structured state and append-only activity history.
- **Filesystem / Git / Claude Code configuration:** external systems that NEXUS observes and, only in specific workflows, changes through guarded adapters.
- **Obsidian:** human-readable projection and knowledge graph, never the primary database.
- **Claude Code:** user's separate coding assistant and execution environment, not a runtime dependency of NEXUS.

Deliver useful value early. The first working version should let the user register projects and repositories, browse them, search them, and see activity. Add system discovery and potentially destructive integrations later, after the foundation and audit trail are proven.

## Recommended baseline stack

| Layer | Recommendation | Reason |
|---|---|---|
| Frontend | React + TypeScript + Vite + Tailwind CSS | Familiar ecosystem, fast local development, strong typing |
| UI components | Accessible component primitives such as shadcn/ui or Radix-based components | Consistent, reusable controls; do not make a large UI kit a hard dependency |
| Backend | Python + FastAPI + Pydantic | Good fit for Windows/process/filesystem integrations and typed HTTP APIs |
| Persistence | SQLite + SQLAlchemy 2.x + Alembic | Lightweight, local, transactional, migration-friendly |
| Validation/config | Pydantic Settings; strict request/response schemas | Keep configuration and API boundaries validated |
| Filesystem monitoring | Watchdog, introduced only after manual scans work | Event-based updates without continuous full-disk crawling |
| Process monitoring | `subprocess` + `psutil` | Native process lifecycle and safe PID validation |
| Git | Git CLI through argument arrays; optionally GitPython for read-only conveniences | Git CLI is already installed in many developer setups and avoids an extra abstraction |
| GitHub | GitHub REST API through `httpx` | Public repository metadata can be retrieved without an LLM or paid service |
| Markdown | Python standard library plus a small frontmatter parser only if needed | Obsidian notes are ordinary Markdown files |
| Claude Code | Existing `claude` executable, launched with `subprocess` and a selected `cwd` | Preserves the user's existing account/provider configuration |
| Local server | Uvicorn | Directly supported by FastAPI |

Use current stable compatible versions when implementing; pin versions in lockfiles. Do not copy version numbers from this planning document.

---

# 1. Product requirements

## 1.1 Product principles

1. **Local-first:** the application, database, inventory, and ordinary management functions work locally. Internet access is only required for explicitly networked features such as GitHub metadata retrieval or remote MCP health checks.
2. **No LLM dependency:** adding a repository, registering a project, reading a skill, viewing configuration, and starting a local application must not require Claude or another model.
3. **Observe before modifying:** inventory and discovery are read-only initially. Every write to a user's filesystem or Claude Code configuration must be an explicit action with a preview and a result record.
4. **User-controlled roots:** scan only directories the user has registered or explicitly approved. Never crawl the entire C: drive by default.
5. **Explain provenance:** each discovered resource should show where it was found, when it was last scanned, and whether its information is discovered, user-entered, or inferred.
6. **Portable data:** the main database and configuration should be easy to back up. Obsidian output must remain readable without NEXUS.
7. **Modular, not overengineered:** integrations are service adapters within one backend process. Use interfaces where there are genuinely different implementations or test boundaries.
8. **Recoverable changes:** installations, configuration edits, and file moves should have previews, backups or staging, verification, and rollback where feasible.

## 1.2 User roles and operating model

NEXUS is initially a single-user desktop-local application. Do not build a multi-user permission system, cloud sync, team accounts, or remote administration in the MVP. Still design clear service boundaries so authentication or multiple profiles could be added later without restructuring the entire app.

The user is the final approver for:
- Installing or updating a skill.
- Removing a skill or MCP entry.
- Modifying a Claude Code configuration.
- Launching a custom command or desktop application for the first time.
- Stopping a process tree.
- Moving, overwriting, or deleting files.
- Enabling filesystem monitoring for a new root.

## 1.3 Functional requirements

### A. Dashboard

Show live counts for projects, repositories, skills, MCP servers, registered applications, and running applications. Show recent events, failed health checks, stale scans, and items that need attention. Dashboard metrics must come from database queries, not hardcoded counters.

### B. Project manager

- Register a project by selecting or entering an existing directory.
- Create a project record with name, description, category, tags, notes, and optional GitHub association.
- Allow multiple user-defined categories and tags.
- Display canonical path, existence, Git repository state, current branch, dirty status, technologies detected, discovered skills, MCP associations, and linked applications.
- Permit an optional launch action for a terminal / Claude Code session in the project directory.
- Avoid claiming that a project was discovered automatically when it was actually manually registered.

### C. Skills manager

- Inventory global and project-level Claude Code skills.
- Display `SKILL.md` path, name, description, frontmatter, source location, scope, hash, and last scan time.
- Associate skills with their containing project and any known source repository.
- Preview skill contents before installation.
- Support installation into a selected global or project skill directory.
- Support update by inspecting the proposed change before applying it.
- Support uninstall by moving the selected skill into a NEXUS-managed backup/quarantine location first.
- Never execute scripts from a downloaded skill during inspection or installation.

### D. MCP manager

- Inventory the supported Claude Code MCP scopes and configuration sources.
- Show name, transport, command/arguments or URL, environment variable *names* (not secret values), scope, config source, and observed status.
- Support add and remove through the installed Claude Code CLI where supported; verify the result by re-reading the CLI output/configuration.
- Make a distinction between “configured”, “connection reported healthy”, “needs authentication”, “failed”, and “not checked”.
- Do not edit Claude Code's internal `~/.claude.json` file directly. Use official CLI operations where available.
- Treat enable/disable as a separate capability. If the installed CLI does not expose a stable safe command for a requested toggle, label the status honestly and defer direct mutation rather than editing undocumented internal state.

### E. GitHub repository library

- Add a public repository from an HTTPS GitHub URL.
- Normalize and validate the URL; reject unrelated hosts and malformed paths.
- Retrieve metadata through GitHub's public REST API: canonical URL, owner, repo name, description, default branch, stars/forks when available, topics, license, and timestamps.
- Retrieve README content and detect likely languages/technologies from GitHub metadata and repository files. Label heuristic detections as estimates.
- Support categories, tags, notes, status (`Saved`, `To Explore`, `Installed`, `Currently Using`, `Archived`), and associations to projects, skills, and apps.
- Handle API rate limits, network errors, deleted/private repositories, and README absence gracefully.
- Do not require a GitHub token for the first public-repository workflow. Add optional token support later using OS credential storage, never plain text in the database.

### F. Application manager

- Register local web applications and desktop applications using a directory, executable, arguments, environment-variable references, and optional health-check configuration.
- Keep executable and arguments separate; never build a shell command by concatenating untrusted strings.
- Start, stop, and restart only processes started and tracked by NEXUS, or processes that the user explicitly selects and confirms.
- Monitor PID, process start time, executable, working directory, configured port, and health status.
- Support HTTP and TCP health checks. A successful TCP connection does not prove the application is fully healthy; show the check type.
- Open a configured local URL in the default browser.
- Support desktop applications that have no URL or health endpoint.
- On restart of NEXUS, reconcile persisted PID records with the actual OS process using PID plus process fingerprint to avoid PID reuse mistakes.
- Never kill a process merely because it is listening on a configured port.

### G. System explorer

- Display known Claude Code settings files, skill directories, agent directories, command directories, plugin locations, MCP config sources, project roots, Git repositories, and relevant developer tools.
- Start read-only. Show exact path, discovered state, last modified timestamp, last scan, and whether the path exists.
- Do not assume all users have the default Claude config path. Respect `CLAUDE_CONFIG_DIR` when present and provide a settings override.
- Make unsupported or unknown locations visible as “not inspected” rather than “not installed”.

### H. Obsidian integration

- Allow the user to configure and validate a vault path.
- Project meaningful NEXUS events to Markdown notes and chronological daily logs.
- Use stable NEXUS IDs in YAML frontmatter and internal wiki links between notes.
- Keep the SQLite activity event as the authoritative record.
- Implement retryable, idempotent synchronization using an outbox table.
- Do not overwrite arbitrary existing Obsidian notes. Only manage files carrying a NEXUS ownership marker or use a dedicated NEXUS folder.
- Provide dry-run, pause, retry, and last-sync status.

### I. Customization

- User-defined categories and tags.
- Resource types stored in data, not hardcoded frontend enum values.
- Typed built-in resource subtypes for projects, repositories, skills, MCP servers, and applications.
- Custom field definitions and values for user extensions.
- User-defined relationships between resources with labels such as `uses`, `derived_from`, `installed_from`, `belongs_to`, and `documented_by`.
- Reusable task prompt templates with a title, body, target context, variables, and notes. NEXUS may open Claude Code with a prompt, but it must not silently execute the task.

## 1.4 Non-functional requirements

- Single-user local operation; bind server to `127.0.0.1` by default.
- No secret values in logs, event snapshots, Obsidian notes, or frontend responses.
- Database migrations are explicit and tested.
- Core services are testable without launching the frontend or invoking Claude Code.
- UI should remain usable with hundreds or a few thousand resources.
- Filesystem scans should be cancellable, incremental where possible, and visible to the user.
- All long-running scans and process actions should report progress/state rather than block HTTP request handlers.
- App startup should be predictable and provide actionable error messages.
- Backups should include SQLite DB, application settings, and optionally NEXUS-owned Obsidian data; never bundle secrets unintentionally.

---

# 2. Recommended architecture

## 2.1 Architecture overview

Use a **modular monolith** with domain-oriented modules. Run the API and frontend locally. During development, Vite serves the frontend and proxies `/api` to FastAPI. In a packaged release, FastAPI may serve the built frontend assets or a small local launcher may start both processes. Do not decide packaging until core features are stable.

```text
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

Keep route handlers thin. Routes validate inputs and call services; services enforce business rules and write events; adapters talk to external systems. Avoid putting business logic into React components or direct SQL into API routes.

## 2.2 Suggested backend module boundaries

- `core`: app settings, paths, logging, error types, security helpers.
- `db`: SQLAlchemy base, session factory, migrations, repository helpers.
- `domain`: enums/constants only where stable, common IDs/value objects, event contracts.
- `projects`: project service, project repository, Git adapter.
- `catalog`: resource types, categories, tags, custom fields, resource relationships.
- `repositories`: GitHub URL parser, GitHub API adapter, README metadata extraction.
- `skills`: scanner/parser, preview, safe install/update/uninstall workflows.
- `mcp`: Claude CLI adapter, config inventory parser, status normalizer.
- `applications`: process manager, launch profiles, health checkers.
- `discovery`: allowed scan roots, filesystem scan, Watchdog observer, exclusions.
- `claude`: CLI path discovery, launcher, safe argument builder, session records.
- `activity`: append-only event service, outbox, event query APIs.
- `obsidian`: note renderers, vault path validation, atomic writer, sync worker.
- `api`: versioned routers and dependency wiring.

Do not create all of these as empty packages in the first coding phase. Add modules when their phase begins.

## 2.3 Frontend module boundaries

- `app`: router, layout, theme, global providers.
- `components`: reusable buttons, dialogs, tables, badges, forms, empty states.
- `features/dashboard`
- `features/projects`
- `features/repositories`
- `features/skills`
- `features/mcp`
- `features/applications`
- `features/system-explorer`
- `features/activity`
- `features/settings`
- `lib/api`: typed API client, query cache, error handling.
- `lib/types`: generated or manually maintained API types.

Prefer feature-level pages and components. Avoid one giant dashboard component with all business logic.

## 2.4 Database schema recommendation

Use UUIDs (stored as strings initially for simplicity) as stable IDs. Store timestamps in UTC ISO format. SQLite foreign keys must be enabled for every connection. Use Alembic from the first persistent schema.

### Core tables

| Table | Key columns / purpose |
|---|---|
| `resource_types` | `id`, `key`, `label`, `is_builtin`, `created_at`; supports custom resource types |
| `resources` | `id`, `resource_type_id`, `name`, `description`, `status`, `source_kind`, `source_path`, `created_at`, `updated_at`, `deleted_at`; common searchable identity |
| `projects` | `resource_id` PK/FK, `directory_path`, `git_remote_url`, `category_id`, `last_scanned_at`, `notes` |
| `repositories` | `resource_id` PK/FK, `github_url`, `owner`, `repo_name`, `default_branch`, `readme_text`, `metadata_json`, `last_fetched_at` |
| `skills` | `resource_id` PK/FK, `skill_name`, `scope`, `skill_directory`, `skill_md_path`, `frontmatter_json`, `content_hash`, `origin_repo_id`, `last_scanned_at` |
| `mcp_servers` | `resource_id` PK/FK, `scope`, `transport`, `config_source`, `command`, `args_json`, `url`, `env_var_names_json`, `reported_status`, `last_checked_at` |
| `applications` | `resource_id` PK/FK, `working_directory`, `executable`, `args_json`, `app_kind`, `url`, `health_check_json`, `enabled` |
| `categories` | `id`, `name`, `slug`, `color`, `sort_order`, `created_at`; user-managed |
| `tags` | `id`, `name`, `slug`, `created_at` |
| `resource_tags` | `resource_id`, `tag_id`; unique pair |
| `resource_links` | `id`, `source_resource_id`, `target_resource_id`, `relation_type`, `created_at`; both sides FK to resources |
| `custom_field_definitions` | `id`, `resource_type_id`, `field_key`, `label`, `field_type`, `required`, `options_json` |
| `custom_field_values` | `resource_id`, `field_definition_id`, `value_json`; unique pair |
| `settings` | `key`, `value_json`, `updated_at`; no credentials or secret values |
| `activity_events` | `id`, `event_type`, `resource_id` nullable, `occurred_at`, `actor`, `summary`, `payload_json`, `schema_version`; append-only |
| `obsidian_sync_outbox` | `id`, `event_id`, `target_path`, `status`, `attempt_count`, `next_attempt_at`, `last_error`, `synced_at`; reliable retry |
| `scan_runs` | `id`, `root_path`, `started_at`, `finished_at`, `status`, `items_seen`, `errors_json` |
| `process_runs` | `id`, `application_id`, `pid`, `process_started_at`, `executable_fingerprint`, `working_directory`, `started_at`, `stopped_at`, `status`, `exit_code` |
| `claude_sessions` | `id`, `project_id`, `pid`, `started_at`, `stopped_at`, `working_directory`, `launch_mode`, `status`; do not store credentials or full private prompts unless user opts in |
| `prompt_templates` | `id`, `name`, `description`, `template_body`, `target_type`, `variables_json`, `created_at`, `updated_at` |

### Data modelling notes

- The `resources` table gives every built-in and custom resource a stable identity. Domain-specific tables hold fields requiring validation or indexes. `resource_links` allows arbitrary relationships without hardcoding a column for every possible pairing.
- `source_kind` should distinguish `manual`, `discovered`, `github`, `imported`, and `system`.
- Use soft deletion for resources where historical references matter. Append an event for each delete/archive action.
- Add indexes on resource type, name, status, normalized path, GitHub URL, timestamps, event type, and relationship endpoints.
- Normalize filesystem paths using `Path.resolve()` where possible, but retain the display path the user supplied. Windows comparisons should be case-insensitive.
- Store JSON only for variable metadata. Do not turn every relational attribute into one opaque JSON document.
- Enforce unique normalized paths and canonical GitHub URLs at the service/database level.
- Event payloads must be redacted and versioned. Do not include environment variable values, tokens, API keys, `.env` contents, OAuth tokens, or full config snapshots by default.

## 2.5 Activity event contract

Every meaningful change should create an event in the same SQLite transaction as the business update. Suggested event types:

- `project.registered`, `project.updated`, `project.archived`
- `repository.added`, `repository.refreshed`, `repository.status_changed`
- `skill.discovered`, `skill.installed`, `skill.updated`, `skill.uninstalled`
- `mcp.discovered`, `mcp.added`, `mcp.removed`, `mcp.status_checked`
- `application.registered`, `application.started`, `application.stopped`, `application.health_changed`
- `filesystem.scan_started`, `filesystem.scan_completed`, `filesystem.scan_failed`
- `claude.session_started`, `claude.session_exited`
- `settings.updated`, `obsidian.sync_succeeded`, `obsidian.sync_failed`

An event is an immutable fact, not a mutable status row. For a correction, append a new event. Never update or delete old events in ordinary application flows. Store a compact safe snapshot of changed fields where useful.

## 2.6 Obsidian synchronization pattern

Use a transactional outbox:

1. A service updates a resource and appends an `activity_events` row in one DB transaction.
2. The same transaction inserts an `obsidian_sync_outbox` row if sync is enabled.
3. A background worker fetches pending outbox rows.
4. It renders a deterministic Markdown note or daily event entry.
5. It writes to a path inside the validated vault using a temporary file followed by atomic replace.
6. It marks the outbox row synced, or records a retryable error.

Suggested vault structure:

```text
NEXUS/
  Dashboard.md
  Projects/<project-slug>.md
  Repositories/<owner>-<repo>.md
  Skills/<skill-slug>.md
  MCP/<server-slug>.md
  Applications/<app-slug>.md
  Categories/<category-slug>.md
  Activity/YYYY/MM/YYYY-MM-DD.md
  Templates/
  Attachments/       # optional; do not copy source code here
```

Every managed note should include YAML frontmatter similar to:

```yaml
---
nexus_id: "<stable-resource-uuid>"
nexus_type: "project"
managed_by: "NEXUS"
created: "2026-11-13T00:00:00Z"
updated: "2026-11-13T00:00:00Z"
---
```

Link resources with Obsidian wiki links, for example `[[Repositories/owner-repo]]`. Sanitize slugs and guard against path traversal. If a target note already exists without the NEXUS marker, do not overwrite it. Show a conflict and let the user select a safe alternate path.

## 2.7 Filesystem discovery design

- Start with user-added scan roots. Do not recursively scan the entire disk.
- First run: manual scan, show summary, let user review exclusions.
- Later: Watchdog observer only for approved roots; debounce event bursts and coalesce changes.
- Ignore by default: `.git/objects`, `node_modules`, `.venv`, `venv`, `dist`, `build`, `__pycache__`, `.next`, cache/temp folders, and user-defined patterns.
- Do not follow symlinks or Windows reparse points by default.
- Avoid reading file contents except known metadata files such as `README.md`, `pyproject.toml`, `package.json`, `.claude/skills/*/SKILL.md`, `.mcp.json`, and supported settings paths.
- Put scan work in a worker/thread pool or explicit background-task service. Expose scan status and cancellation.
- Persist scan results and errors so one inaccessible folder does not fail the entire scan.

## 2.8 Claude Code integration design

- Detect `claude` with `shutil.which()` and allow a user override for the executable path.
- To open an interactive session, launch the CLI with `cwd=<selected project directory>` and an OS-appropriate console/window strategy. Use an argument list, never `shell=True`.
- If a prompt is included, use the CLI's documented initial-prompt behavior; require a user click and display the exact prompt before launching.
- Avoid relying on a private API or creating an Anthropic client. Do not read or store Claude authentication credentials.
- Keep the CLI invocation builder isolated and unit-tested. Validate behavior against the version installed on the user's Windows machine because CLI flags can evolve.
- Do not use `--dangerously-skip-permissions` or equivalent bypass flags.
- Capture process metadata and exit status where possible; interactive terminal I/O remains in the terminal window, not in a fake NEXUS chat panel.

## 2.9 MCP integration design

Treat MCP as Claude Code configuration inventory plus a controlled CLI adapter, not as a custom MCP client. Support at least:

- User/global scope configuration discovered through supported Claude CLI output and known config paths.
- Project scope via `.mcp.json`.
- Local scope where the current CLI supports it.
- Status from `claude mcp list` / `claude mcp get` where available.

Never reveal environment variable values. For commands that mutate configuration, show a review dialog with scope, server name, transport, command/URL, argument list, and env var names. Use `subprocess.run([...], shell=False)` and verify success afterward. Preserve original config files before any supported write if the CLI itself does not provide rollback.

## 2.10 Application process model

The process manager is a controlled supervisor, not a general-purpose task runner.

- Store executable and arguments separately.
- Resolve executable paths and verify working directory before launch.
- Do not interpolate commands into PowerShell or `cmd.exe` strings.
- Record the returned PID and a fingerprint: process start time, executable path, and working directory.
- Use `psutil` to verify a PID still represents the launched process before terminating it.
- Stop only the tracked process tree after an explicit user action. Use graceful termination first, then offer force-stop only after timeout.
- Port checks are read-only. Never kill by port automatically.
- For an app that manages its own child processes, document that the process tree may differ and provide a manual stop fallback.

---

# 3. Repository / project directory structure

Create the structure incrementally. Phase 0 creates the skeleton and documentation; later phases fill each module.

```text
NEXUS/
├── README.md
├── CLAUDE.md
├── .gitignore
├── .env.example
├── pyproject.toml                 # optional root tooling config, if chosen
├── docs/
│   ├── PRODUCT_REQUIREMENTS.md
│   ├── ARCHITECTURE.md
│   ├── DATABASE_SCHEMA.md
│   ├── DEVELOPMENT_ROADMAP.md
│   ├── SECURITY_MODEL.md
│   ├── WINDOWS_NOTES.md
│   ├── USER_GUIDE.md
│   └── ADR/
│       ├── 0001-modular-monolith.md
│       ├── 0002-sqlite-and-event-log.md
│       └── 0003-obsidian-as-projection.md
├── backend/
│   ├── pyproject.toml
│   ├── alembic.ini
│   ├── alembic/
│   │   └── versions/
│   ├── src/
│   │   └── nexus/
│   │       ├── __init__.py
│   │       ├── main.py
│   │       ├── api/
│   │       ├── core/
│   │       ├── db/
│   │       ├── domain/
│   │       ├── projects/
│   │       ├── catalog/
│   │       ├── repositories/
│   │       ├── skills/
│   │       ├── mcp/
│   │       ├── applications/
│   │       ├── discovery/
│   │       ├── claude/
│   │       ├── activity/
│   │       └── obsidian/
│   └── tests/
│       ├── unit/
│       ├── integration/
│       └── fixtures/
├── frontend/
│   ├── package.json
│   ├── index.html
│   ├── vite.config.ts
│   ├── tsconfig.json
│   └── src/
│       ├── app/
│       ├── components/
│       ├── features/
│       │   ├── dashboard/
│       │   ├── projects/
│       │   ├── repositories/
│       │   ├── skills/
│       │   ├── mcp/
│       │   ├── applications/
│       │   ├── system-explorer/
│       │   ├── activity/
│       │   └── settings/
│       ├── lib/
│       └── styles/
├── scripts/
│   ├── dev.ps1
│   ├── test.ps1
│   ├── lint.ps1
│   └── backup.ps1
├── data/
│   └── .gitkeep                 # runtime DB should be outside source control
├── logs/
│   └── .gitkeep                 # runtime logs should be ignored
└── .claude/
    └── skills/
        ├── nexus-architecture/SKILL.md
        ├── nexus-backend/SKILL.md
        ├── nexus-frontend/SKILL.md
        ├── nexus-local-integrations/SKILL.md
        ├── nexus-obsidian-sync/SKILL.md
        └── nexus-testing-release/SKILL.md
```

The backend package layout above is a target map, not a requirement to generate empty modules all at once. Prefer creating a module when a feature starts.

## Runtime data location

Do not store the live database inside the Git repository by default. Use a dedicated per-user application data directory, e.g. `%LOCALAPPDATA%\NEXUS\` for database, logs, backups, and local config. Keep vault and project paths user-configurable. Make the location visible in Settings and provide a backup/export action.

---

# 4. Claude Code skills, agents, hooks, and commands

## 4.1 Which skills are worth creating?

Create six focused project skills. They are useful because they encode repeatable project-specific standards that Claude Code should apply across multiple phases. Keep `CLAUDE.md` short and always relevant; put task procedures in skills so their full bodies load only when invoked.

| Skill | When to invoke | Recommendation |
|---|---|---|
| `nexus-architecture` | Any change affecting module boundaries, data ownership, API contracts, or cross-cutting design | Essential |
| `nexus-backend` | FastAPI, SQLAlchemy, migrations, domain services, API endpoints | Essential |
| `nexus-frontend` | React pages, components, API state, UI flows | Essential |
| `nexus-local-integrations` | Windows paths, discovery, Git, Claude CLI, MCP CLI, subprocesses, installs | Essential; highest-risk area |
| `nexus-obsidian-sync` | Markdown projection, vault writes, outbox, wiki links | Add when Obsidian phase begins |
| `nexus-testing-release` | Tests, bug investigation, migrations, release checks, commits | Essential |

No separate frontend-design, FastAPI, SQLAlchemy, or GitHub skill is needed initially. The custom skills above should be enough. Consider upstream marketplace skills only if a specific recurring task justifies them; verify their provenance before installation.

## 4.2 Complete skill files

### `.claude/skills/nexus-architecture/SKILL.md`

```markdown
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
```

### `.claude/skills/nexus-backend/SKILL.md`

```markdown
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
```

### `.claude/skills/nexus-frontend/SKILL.md`

```markdown
---
name: nexus-frontend
description: Build or modify NEXUS React and TypeScript pages, reusable components, forms, tables, dialogs, and API integration.
user-invocable: true
---

# NEXUS Frontend Skill

Inspect the existing frontend structure and API contracts before changing UI code. Keep the design coherent with the current application rather than introducing a second design system.

## UX principles
- NEXUS is a desktop-first localhost control panel. Optimize for clear navigation, dense but readable information, and fast resource lookup.
- Prefer useful empty states, loading states, error states, status badges, search, filters, and clear action feedback.
- Every destructive or external side-effect action must have a review/confirmation step that explains exactly what will change.
- Show source/provenance and last-scanned time for discovered information.
- Distinguish configured, discovered, running, healthy, stale, and failed states; do not use one ambiguous status label.
- Do not use decorative counters or mock data in production pages.

## React and TypeScript rules
- Use feature folders and small components. Avoid giant pages and deeply nested conditional rendering.
- Keep API calls in the shared API layer or feature query hooks, not scattered through presentational components.
- Type API request/response data. Do not use `any` to bypass a missing contract.
- Reuse form validation schemas and backend constraints where practical.
- Handle loading, empty, validation, network, and server-error states.
- Keep component state local unless multiple views genuinely share it.
- Ensure keyboard navigation, visible focus, semantic labels, and accessible dialogs.
- Do not place secrets or private environment values in frontend state or logs.

## Completion checks
- Run formatter, lint, typecheck, and frontend tests available in the repo.
- Verify narrow and wide desktop layouts and long file paths.
- Check that actions display pending/success/failure feedback and refresh the affected data.
- Update relevant screenshots/docs only when requested or when UI behavior changed materially.
```

### `.claude/skills/nexus-local-integrations/SKILL.md`

```markdown
---
name: nexus-local-integrations
description: Safely inspect or modify Windows filesystem state, Git repositories, Claude Code skills/configuration, MCP servers, local processes, and external CLI tools.
user-invocable: true
---

# NEXUS Local Integrations Skill

This skill covers high-risk boundaries between NEXUS and the user's computer. Read `docs/SECURITY_MODEL.md` and the relevant adapter before changing anything.

## Safety defaults
- Inventory is read-only by default. A user action must explicitly authorize every install, update, removal, launch, stop, or config change.
- Restrict scans to user-approved roots. Do not crawl whole drives or follow symlinks/reparse points by default.
- Never use `shell=True`. Invoke executables with an argument list, a validated working directory, timeout, and captured exit status.
- Never kill a process by port. Validate PID, process start time, executable, and working directory before stopping a tracked process.
- Never store secrets in SQLite, logs, Obsidian, events, or API responses. Store only environment variable names.
- Do not directly edit undocumented Claude Code internal files such as `~/.claude.json`. Prefer documented CLI commands and verify after mutation.

## Filesystem and skill installation
- Resolve all destination paths and verify they remain inside the selected allowed root.
- Reject path traversal, archive traversal, suspicious symlinks, and unexpected nested destination paths.
- Inspect `SKILL.md` as text. Do not execute scripts contained in a downloaded repository.
- Install into a staging directory, validate the required files, then atomically move into place.
- If the destination exists, show a diff/backup plan; never overwrite silently.
- Keep a backup or quarantine copy for rollback and append an activity event.

## Claude Code CLI
- Detect `claude` with `shutil.which()` or a user-configured executable path.
- Launch interactive sessions with the selected project as `cwd`; use the user's installed CLI/account/provider configuration.
- Do not pass permission-bypass flags. Do not construct shell strings from project paths or prompts.
- Keep CLI flags in one adapter and verify them against the installed CLI version.

## MCP
- Inventory the supported scopes and sources. A project `.mcp.json` is distinct from user-level MCP configuration.
- For add/remove, use documented `claude mcp` CLI commands where supported, with explicit user confirmation.
- Display command/URL and environment variable names, never secret values.
- Re-read configuration and status after each operation; do not assume a zero exit code means the server connected.
- If a requested enable/disable operation has no supported safe interface, explain the limitation and do not edit undocumented internal state.

## Validation
- Test adapters with temporary directories, fake executables, stub CLI output, and mocked process tables.
- Include Windows paths with spaces, Unicode, long paths, missing files, permission errors, and cancelled operations.
- Always report which files/configs/processes were touched and which actions were skipped.
```

### `.claude/skills/nexus-obsidian-sync/SKILL.md`

```markdown
---
name: nexus-obsidian-sync
description: Implement or debug NEXUS activity projection into an Obsidian vault, including Markdown notes, YAML frontmatter, wiki links, and outbox retries.
user-invocable: true
---

# NEXUS Obsidian Sync Skill

Read `docs/ARCHITECTURE.md`, `docs/DATABASE_SCHEMA.md`, and the current Obsidian adapter before changing synchronization behavior.

## Source of truth
- SQLite resources and append-only `activity_events` are authoritative.
- Obsidian is a human-readable projection. Editing a note does not automatically mutate NEXUS state.
- Use `obsidian_sync_outbox` to make projection retryable and idempotent.

## File safety
- Require a validated, configured vault path.
- Normalize each output path and verify it remains inside the vault.
- Write only within the dedicated `NEXUS/` folder by default.
- Never overwrite an existing note unless it has the NEXUS ownership marker and matching `nexus_id`.
- Use a temporary file plus atomic replace. Preserve the old managed note if writing fails.
- Sanitize filenames, wiki-link targets, YAML values, and Markdown content.
- Never export secrets, environment variable values, access tokens, credentials, or private prompt content by default.

## Idempotency and history
- Every managed resource note contains stable `nexus_id`, `nexus_type`, and `managed_by: NEXUS` frontmatter.
- A retry must not duplicate the same event in the daily log. Use the event UUID as the deduplication key.
- Preserve append-only event history. Do not rewrite historical event entries to reflect a later state.
- Use deterministic paths and safe Obsidian wiki links.
- Store sync errors and retry metadata in the outbox; do not silently discard failures.

## Testing
- Test dry-run output, existing unmanaged files, matching managed files, path traversal, Unicode names, duplicate retries, vault unavailability, and partial writes.
- Use a temporary vault in tests. Never point automated tests at the user's real vault.
- Verify that pausing sync prevents writes while preserving pending outbox items.
```

### `.claude/skills/nexus-testing-release/SKILL.md`

```markdown
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
```

## 4.3 Agents, hooks, and commands

### Custom agents
Do **not** create custom agents initially. NEXUS is small enough for one Claude Code session to inspect and implement each bounded phase. Add a read-only reviewer agent later only if code review becomes repetitive and can be isolated from file-writing tasks. Parallel agents can create conflicting migrations and inconsistent contracts, so they are not an MVP requirement.

### Hooks
Do not add hooks in Phase 0. Hooks are useful only after the commands and checks are stable. Later, consider a small `PostToolUse` hook to run formatting on changed Python/TypeScript files or a `Stop` hook that reminds Claude to run the project validation script. Hooks should not perform destructive cleanup or mutate user-level Claude settings. Keep hook scripts inside this repository and document how to disable them.

### Commands
Claude Code custom commands have been consolidated into skills. A user-invocable skill can provide a slash command. After the test scripts exist, add a `/nexus-verify` skill that runs the documented local validation workflow and reports results. This is optional; do not create multiple one-line skills that simply wrap a command.

---

# 5. Version-wise development roadmap

Build in the order below. Each version is useful on its own; later versions expand integration capabilities without invalidating the earlier core.

| Version | Focus | Deliverable |
|---|---|---|
| V0.0 | Repository bootstrap and documentation | Folder structure, README, CLAUDE.md, architecture/security docs, skills |
| V0.1 | Running foundation | FastAPI + React shell, SQLite, migrations, health endpoint, scripts, test baseline |
| V0.2 | Resource catalog and project manager | Categories, tags, relationships, projects, search, dashboard counts, activity events |
| V0.3 | GitHub repository library | Add/refresh public repos, README and metadata, statuses, links to projects |
| V0.4 | System explorer and read-only inventory | Approved roots, Claude Code directories/config inventory, skill and MCP discovery |
| V0.5 | Skills manager | Preview, install, update, uninstall with staging, backups, and audit events |
| V0.6 | MCP manager | Read-only detail and status, guarded CLI-based add/remove, verification |
| V0.7 | Application manager and Claude launcher | Register/start/stop/health-check local apps; open Claude CLI in a project |
| V0.8 | Activity timeline and Obsidian sync | Append-only event log, outbox, deterministic Markdown projection |
| V0.9 | Customization and operational polish | Custom resource types/fields, prompt templates, settings, scan controls, UX polish |
| V1.0 | Security, reliability, backup, packaging | Hardening, restore test, startup/backup scripts, release checklist |

## Global completion gate for every version

A phase is complete only when:
1. Acceptance criteria below are met.
2. The relevant automated tests pass.
3. No secrets or user data have been committed.
4. The UI has loading, empty, success, and error states for new flows.
5. `README.md`, `CLAUDE.md`, architecture docs, or roadmap are updated if behavior or conventions changed.
6. Claude Code reports exactly which validation commands it ran and their actual results.
7. A Git commit is created only after the user reviews the diff and confirms the phase is complete.


# 7. Security and permission model

NEXUS has access to the user's source folders, local processes, and developer configuration. Treat it as a privileged local utility, not a harmless dashboard.

## 7.1 Minimum safeguards from V0.1

- Bind only to `127.0.0.1`; never default to `0.0.0.0`.
- Validate Host and Origin headers and configure narrow CORS origins. A localhost service can still be targeted by a malicious website through browser behavior, so do not rely on loopback binding alone.
- Use a per-install local request token or similarly appropriate browser-session protection for state-changing API requests. Keep it out of URLs and logs.
- Validate every path on the backend. UI validation is not a security boundary.
- Do not use `shell=True`; use fixed executable plus argument arrays.
- Add timeouts to external CLI and HTTP calls.
- Do not return raw config files where secrets may exist.
- Redact before storing logs/events, not just before rendering the UI.

## 7.2 Filesystem permissions

- Use explicit scan roots and destination allowlists.
- Do not follow symlinks/reparse points by default.
- Canonicalize destination and prove it remains under the approved root.
- Reject `..`, absolute paths embedded in archive members, alternate data streams where relevant, and archive symlink escapes.
- For installs, preview and stage, validate, then atomically move.
- For removal, quarantine first; do not permanently delete by default.

## 7.3 Secrets

Never persist or export:
- `ANTHROPIC_API_KEY`, auth tokens, OAuth refresh tokens, GitHub PATs, arbitrary MCP secrets, passwords, or values from `.env` files.
- Full environment maps from launched processes.
- Secret-bearing raw JSON configuration snapshots.

Store environment variable names and a boolean like `is_configured`; let the actual consuming CLI read credentials from the user's existing environment/credential store.

## 7.4 Process control

- Only control processes launched by NEXUS unless the user explicitly chooses an external process and confirms it.
- Match PID, creation time, executable, and working directory before stop.
- Never infer that port ownership equals NEXUS ownership.
- Offer graceful stop first; require a second explicit choice for force termination.
- Record action outcome and exit status.

## 7.5 Skill and repository supply chain

- A GitHub repository is untrusted input.
- Inspect before install. Never execute scripts during preview/install.
- Verify destination paths and reject symlink/path traversal cases.
- Show origin URL, commit/hash, and files to be installed.
- Back up existing destination and allow rollback.
- Do not imply that a skill is safe merely because it contains a `SKILL.md` file.

---

# 8. Git, commits, and versioning strategy

## 8.1 Branching

For a solo project, keep branching simple:
- `main`: latest known-good working state.
- `feature/<short-name>` only for changes large enough to isolate; otherwise small commits on `main` are acceptable.

Do not add GitFlow or release branches.

## 8.2 Commit convention

Use short conventional prefixes:
- `chore: bootstrap NEXUS repository`
- `feat(projects): register and categorize projects`
- `feat(github): add repository metadata preview`
- `fix(skills): reject archive path traversal`
- `test(mcp): cover CLI timeout handling`
- `docs: update Windows setup instructions`

Commit after each completed phase, not after every individual file. Inspect staged files before committing. Never include local DB, logs, backups, `.env`, `.venv`, `node_modules`, build outputs, or machine-specific settings.

## 8.3 Tags and milestones

Use semantic versions for usable milestones:
- `v0.1.0` running foundation
- `v0.2.0` projects/catalog
- `v0.3.0` repository library
- `v0.4.0` system explorer
- `v0.5.0` skills manager
- `v0.6.0` MCP manager
- `v0.7.0` applications/Claude launcher
- `v0.8.0` activity/Obsidian
- `v0.9.0` customization
- `v1.0.0` release baseline

Tags are optional until there is a reliable release. Never create tags or push without the user's approval.

## 8.4 Database migrations

- One Alembic migration per logical schema change.
- Review generated scripts; do not trust autogenerate blindly.
- Test upgrade from empty DB and previous release DB.
- Back up before migrations that may transform or remove data.
- Avoid destructive migrations. Prefer expand-and-contract changes and deprecate old columns before removal.

---

# 9. Maintaining context across Claude Code sessions

Claude Code should be able to reorient itself from repository files rather than relying on a long chat transcript.

## 9.1 Keep these files current

- `CLAUDE.md`: short permanent project rules and file map.
- `docs/DEVELOPMENT_ROADMAP.md`: phase status, completed items, next phase, known blockers.
- `docs/ARCHITECTURE.md`: current module boundaries and important data flow.
- `docs/DATABASE_SCHEMA.md`: current tables and relationships, not just the initial proposal.
- `docs/SECURITY_MODEL.md`: current permissions and integration safeguards.
- `CHANGELOG.md` or release notes: user-visible changes by milestone.

## 9.2 Start-of-session prompt

Paste this at the start of a fresh session when not using one of the phase prompts:

```text
Before making changes, re-establish project context from the repository itself.
1. Run `pwd` and `git status --short`.
2. Read `CLAUDE.md`.
3. Read the current `docs/DEVELOPMENT_ROADMAP.md` status and the relevant architecture/security docs.
4. Inspect the latest commits and the files relevant to the task.
5. Run the smallest relevant baseline tests before editing if practical.
6. Summarize the current implemented state, uncommitted changes, relevant constraints, and proposed smallest next step.
Do not assume an earlier chat is authoritative. The repository is the source of project context. Do not overwrite unrelated user changes.
```

## 9.3 End-of-session handoff prompt

```text
Before ending this work session:
1. Summarize the user-visible behavior implemented and files changed.
2. Record exact tests, lint, typecheck, migration, and build commands run with actual results.
3. Update DEVELOPMENT_ROADMAP.md with completed work, partial work, known issues, and the next bounded task.
4. Update architecture/schema/security docs if implementation changed them.
5. Identify any unfinished work or migration risks. Do not hide failures.
6. Inspect git diff and git status. Do not commit unless I explicitly approve.
7. Write a short `docs/SESSION_HANDOFF.md` entry only if work is substantial; avoid creating a new handoff file for every tiny fix.
```

## 9.4 Context size discipline

- Keep `CLAUDE.md` concise; avoid putting the entire product spec into always-loaded context.
- Invoke a custom skill only when its domain is relevant.
- Use one version prompt at a time.
- Ask Claude Code to inspect existing implementation before editing, not regenerate files wholesale.
- Prefer small commits and explicit tests over one enormous implementation session.
- If context is running low, ask Claude Code to update roadmap and handoff notes before compaction or session restart.

---

# 10. Testing strategy

## 10.1 Test pyramid

- **Unit tests:** path validation, URL parsing, skill frontmatter parsing, service rules, event redaction, command construction, status normalization.
- **Integration tests:** API + temporary SQLite DB, migrations, event/outbox transactions, filesystem adapter with temp directories, Git adapter with fixture repos.
- **Contract tests:** fake `claude` executable outputs and subprocess timeouts; GitHub API fixtures; Obsidian temporary vault.
- **Frontend tests:** component and feature behavior for forms, filters, confirmation dialogs, errors, and empty states.
- **Manual smoke tests:** Windows terminal launch, actual Claude CLI detection, process lifecycle, actual Obsidian vault configuration, and actual browser navigation.

## 10.2 Required safety regression cases

1. A project path containing spaces and Unicode.
2. A directory disappearing between scan and open.
3. A symlink/reparse point pointing outside an approved root.
4. A malicious archive member using `../` or an absolute path.
5. A downloaded skill with scripts that must never execute.
6. A malformed `.mcp.json` and an MCP entry containing secret environment variables.
7. A Claude CLI timeout or missing executable.
8. A process PID reused by another process.
9. An unrelated process listening on the configured app port.
10. An Obsidian note that exists but is not managed by NEXUS.
11. A repeated outbox retry that must not duplicate activity.
12. A failed GitHub refresh that must not erase cached metadata.
13. A DB migration interrupted or attempted on a copied DB.
14. A malicious browser Origin attempting to call state-changing localhost endpoints.

## 10.3 Definition of done for a feature

A feature is done only when:
- Backend behavior and API contract are implemented.
- UI provides clear normal and failure flows.
- Tests cover the main success path and significant failure/safety paths.
- Activity event behavior is implemented for meaningful mutations.
- No secret values leak through logs, API, events, or Obsidian.
- Docs and roadmap reflect the real implementation.
- A user can understand how to reverse a change where reversal is applicable.

---

# 11. Practical first-week execution order

1. Create the intended NEXUS repository directory and copy this document into it as `docs/NEXUS_IMPLEMENTATION_BLUEPRINT.md` (create `docs/` first if needed). Then run **Prompt 0** from the repository root. Review the created docs and skill files manually.
2. Initialize Git and commit the scaffold only after reviewing the file list and `.gitignore`.
3. Run **Prompt 1** and make sure backend/frontend start independently on Windows 11.
4. Complete **Prompt 2** before adding external integrations. This gives NEXUS real data and activity history.
5. Continue one version at a time. Do not skip the read-only discovery phase before adding installers and config mutation.

The critical sequencing principle is: **catalog first → observe second → modify external systems third → synchronize knowledge last.**

---

# 12. Current documentation references

The following official documentation is relevant to the Claude Code integration design. Recheck it when implementing because CLI flags, config locations, and extension formats can change.

- [Claude Code CLI reference](https://code.claude.com/docs/en/cli-reference) — interactive launch, initial prompts, print mode, CLI commands and flags.
- [Claude Code skills](https://code.claude.com/docs/en/skills) — `SKILL.md`, frontmatter, skill scope, invocation, supporting files, and skill discovery.
- [Claude Code settings](https://code.claude.com/docs/en/settings) — user/project/project-local settings locations, precedence, and `CLAUDE_CONFIG_DIR` behavior.
- [Claude Code MCP](https://code.claude.com/docs/en/mcp) — MCP scopes, `.mcp.json`, user scope, server status, and `claude mcp` management commands.
- [Claude Code hooks](https://code.claude.com/docs/en/hooks) — hook events and implementation details; hooks are intentionally deferred until the workflow is stable.
- [Claude Code Windows setup](https://code.claude.com/docs/en/setup) — Windows support and shell requirements.

**Planning note:** This blueprint deliberately avoids assuming undocumented Claude Code internal file schemas or unsupported MCP enable/disable commands. Confirm the installed CLI version and test every mutation in a disposable configuration before enabling it against the user's real setup.

---

# Final architectural decision summary

- Start with a modular monolith; no autonomous agents or cloud backend.
- Use SQLite for NEXUS state and append-only activity events.
- Use an outbox for idempotent Obsidian projection.
- Use explicit adapters for filesystem, Git, GitHub, Claude CLI, MCP CLI, process control, and Obsidian.
- Make system discovery read-only before adding installers or configuration mutations.
- Use the Claude Code CLI through `subprocess` with `cwd` and safe argument arrays; do not use a separate Claude API integration.
- Create six focused Claude Code skills; do not create custom agents initially.
- Add hooks only after the test/lint workflow is stable.
- Build one version at a time using the independent prompts above, and keep repository docs as the source of context across sessions.
