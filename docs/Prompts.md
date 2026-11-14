
# 6. Copy-ready Claude Code implementation prompts

Use one prompt per Claude Code session/phase. Start in the NEXUS repository root. Before each phase, make sure the previous phase is committed. The prompts are intentionally scoped; do not ask Claude Code to implement future phases early.

## Prompt 0 — V0.0: Initial folder structure, project documentation, and README files

```text
You are the senior engineer establishing the repository foundation for NEXUS, a Windows-first, local-first personal AI development environment.

Work in the CURRENT DIRECTORY. First inspect the directory and report existing files. Do not delete, overwrite, rename, or move existing user files. If this directory is not empty, preserve its contents and adapt the scaffold safely.

NEXUS product boundary:
- It is a local management dashboard, not an autonomous AI agent and not a replacement for Claude Code.
- It will use React + TypeScript + Vite + Tailwind on the frontend; Python + FastAPI + SQLAlchemy + SQLite + Alembic on the backend.
- It runs locally on Windows 11 and should not need a paid cloud service or LLM API for ordinary management tasks.
- It integrates with filesystem/Git/GitHub, the existing Claude Code CLI, Claude Code skills/MCP configuration, local apps/processes, and an optional Obsidian vault.
- SQLite is the structured source of truth. An append-only activity log is authoritative. Obsidian is a Markdown projection, not the database.
- Prefer a modular monolith. Do not introduce agents, microservices, Redis, vector databases, Kubernetes, or an LLM framework.

Before creating files, locate this planning document in the repository at either `docs/NEXUS_IMPLEMENTATION_BLUEPRINT.md` or `NEXUS_Implementation_Blueprint.md` in the repository root. Read its sections 3, 4.1, and 4.2. If the blueprint is not present, stop and report that it must be copied into the repository first; do not improvise the six skill specifications.

TASK: Create the initial repository skeleton and the project's core documentation only. Do not implement real product features, database models, API endpoints, UI pages, filesystem scanners, or process controls yet.

Create/adapt this structure:
- README.md
- CLAUDE.md
- .gitignore
- .env.example
- docs/PRODUCT_REQUIREMENTS.md
- docs/ARCHITECTURE.md
- docs/DATABASE_SCHEMA.md
- docs/DEVELOPMENT_ROADMAP.md
- docs/SECURITY_MODEL.md
- docs/WINDOWS_NOTES.md
- docs/USER_GUIDE.md (mark as planned where functionality does not exist)
- docs/ADR/0001-modular-monolith.md
- docs/ADR/0002-sqlite-and-event-log.md
- docs/ADR/0003-obsidian-as-projection.md
- backend/pyproject.toml and backend/src/nexus/__init__.py
- frontend/package.json and frontend/src/ placeholder structure
- scripts/dev.ps1, scripts/test.ps1, scripts/lint.ps1, scripts/backup.ps1 as clearly marked starter scripts or placeholders
- data/.gitkeep and logs/.gitkeep, with runtime data/log files ignored by Git
- .claude/skills/ with folders and complete SKILL.md files for:
  nexus-architecture, nexus-backend, nexus-frontend, nexus-local-integrations, nexus-obsidian-sync, nexus-testing-release

Important documentation requirements:
1. README.md must explain what NEXUS is/is not, the planned feature set, initial architecture, Windows prerequisites, planned dev commands (clearly mark commands not yet implemented), data location policy, security principles, current project status, and a concise roadmap.
2. CLAUDE.md must be a short persistent project instruction file. Include product boundary, architecture rules, Windows-first context, safe subprocess/filesystem rules, test expectations, docs to read first, and instructions to update progress after each phase. Do not copy the entire architecture document into it.
3. PRODUCT_REQUIREMENTS.md must include all primary areas: dashboard, projects, skills, MCP, GitHub library, application manager, system explorer, Obsidian, custom resource types, Claude Code CLI integration.
4. ARCHITECTURE.md must describe a modular monolith, domain modules, adapter boundaries, request/service/repository layering, and integration boundaries.
5. DATABASE_SCHEMA.md must propose stable resource IDs, projects/repositories/skills/MCP/apps, categories/tags/resource links/custom fields, append-only activity_events, outbox, process runs, and prompt templates. Mark it as a proposal, not implemented schema.
6. DEVELOPMENT_ROADMAP.md must contain V0.0 through V1.0 with phase goals, dependencies, and acceptance gates. Mark current status accurately.
7. SECURITY_MODEL.md must cover loopback binding, origin/host checks, no shell=True, user-approved filesystem roots, no secret logging, process PID validation, backups, and safe skill installation.
8. WINDOWS_NOTES.md must cover Windows paths, %LOCALAPPDATA%, Claude config path discovery, terminal launch considerations, and path-with-spaces testing.
9. ADRs should capture why the modular monolith, SQLite/event history, and Obsidian projection were chosen, including trade-offs.
10. Create the six `.claude/skills/*/SKILL.md` files by copying the complete specifications from section 4.2 of the blueprint. Preserve their frontmatter and full instruction bodies; do not replace them with placeholders or summaries. Keep each skill focused and accurate.

Repository quality:
- Use forward-compatible, boring defaults.
- Do not invent commands or claim a feature exists when it does not.
- Keep README and CLAUDE.md concise and link to detailed docs.
- Put secrets and local runtime data in .gitignore.
- Do not create a fake .env containing real credentials.
- Avoid adding unnecessary dependencies before implementation.

Before finishing:
- List every created/changed file.
- Check for broken relative links in Markdown if possible.
- Check .gitignore for local DBs, logs, backups, .env, virtual environments, node_modules, build outputs, and machine-specific config.
- Run only documentation/scaffold checks that are actually available; do not claim application tests passed.
- Do not commit. Report the recommended next action: review the documentation and then start V0.1.
```

## Prompt 1 — V0.1: Running foundation

```text
Implement NEXUS V0.1 only: a clean local development foundation. Read CLAUDE.md, README.md, docs/ARCHITECTURE.md, docs/SECURITY_MODEL.md, and the current roadmap first. Inspect the current tree and Git status before editing.

Scope:
1. Backend: create a FastAPI app under backend/src/nexus with `/api/health` and `/api/version` endpoints, typed settings, structured logging, SQLAlchemy 2.x engine/session setup for SQLite, Alembic initialization, and a minimal health check that confirms DB connectivity.
2. Frontend: create a React + TypeScript + Vite + Tailwind application with a polished but restrained NEXUS shell: sidebar navigation, header, responsive content area, dashboard placeholder, and a visible “features not implemented yet” state. Do not create fake data for metrics.
3. Development workflow: add scripts/dev.ps1 to run backend and frontend in separate PowerShell windows or processes with clear logs; add scripts/test.ps1 and scripts/lint.ps1 with real commands for tools that are actually configured. Provide clear setup instructions in README.
4. Tooling: configure Python formatting/linting/type checking and frontend lint/type-check scripts using lightweight dependencies. Pin compatible dependencies in project manifests and lockfiles where appropriate.
5. Tests: add backend tests for health endpoint and DB connectivity, frontend smoke/typecheck setup, and configuration loading tests.
6. Local security: bind FastAPI to 127.0.0.1, configure exact CORS origins for the local Vite dev server, validate host/origin behavior appropriately, and document the local browser security assumptions. Do not expose the server on 0.0.0.0.

Constraints:
- Do not implement projects, repositories, skills, MCP, process management, Obsidian, or filesystem discovery in this phase.
- Do not introduce Docker, Redis, Celery, vector databases, cloud services, or an LLM API.
- Runtime DB/logs belong under %LOCALAPPDATA%\\NEXUS by default, not in source control.
- Keep frontend and backend independent enough to run/test separately.

Acceptance criteria:
- Setup from a clean Windows 11 checkout is documented and works.
- Backend starts and `/api/health` returns a truthful status.
- Frontend starts and can call the health endpoint through the configured dev proxy.
- Alembic can create an empty DB; no business tables are required beyond a migration sanity check.
- Test, lint, and type-check commands are documented and run successfully.
- No secrets, local DBs, logs, or virtual environments are tracked.

Run the available checks. Report exact commands/results, files changed, any Windows-specific assumptions, and the next phase. Do not commit.
```

## Prompt 2 — V0.2: Resource catalog, categories, relationships, and project manager

```text
Implement NEXUS V0.2 only: the core resource catalog and useful project manager. Read CLAUDE.md and the architecture, schema, requirements, and security documents. Inspect the existing code and Git status first.

Backend requirements:
1. Implement SQLAlchemy models and Alembic migrations for resource_types, resources, projects, categories, tags, resource_tags, resource_links, activity_events, and settings. Use stable UUID IDs, UTC timestamps, SQLite foreign keys, and indexes.
2. Implement repository/service/API layers for project registration, list/detail/update/archive, categories, tags, resource search, and resource links.
3. Project registration must validate an existing directory, normalize the path, detect an existing registration, and store `source_kind=manual`. Do not scan the entire project yet.
4. Implement a basic Git adapter that reads repository root, remote URL, branch, and dirty status using safe Git CLI argument arrays with timeouts. A non-Git directory must still be a valid project.
5. Every meaningful mutation must append an activity event in the same transaction. Events are append-only. Redact path-sensitive or secret data where appropriate.
6. Add pagination/filtering to list endpoints. Keep categories, tags, resource types, and relationships data-driven.

Frontend requirements:
- Dashboard with real counts from API and recent activity.
- Projects list with search, category/tag filters, create/register form, status and Git badges.
- Project detail view with path, Git information, notes, tags, category, and linked resources area.
- Category and tag management screens or dialogs.
- Useful loading, empty, error, and success states.

Testing:
- Unit tests for Windows path normalization, duplicates, category/tag rules, relationship validation, and Git adapter failures.
- Integration tests with temporary directories and temporary SQLite DBs.
- Verify each write creates exactly one event and failed writes do not create success events.

Constraints:
- Do not add GitHub API, skill installation, MCP mutation, process management, Obsidian, or Watchdog yet.
- Never touch real user directories in tests.
- Do not hardcode the initial category list as a fixed enum. You may seed editable default categories on first launch.

Acceptance criteria:
- User can register, edit, search, categorize, tag, archive, and inspect projects.
- Dashboard counts and activity are database-backed.
- Project path and Git status are truthful and resilient to missing Git or inaccessible paths.
- Migrations work from a fresh DB and from the previous schema state.
- Tests and frontend checks pass.

Update docs where behavior/schema changed. Report migration, tests, security notes, and limitations. Do not commit.
```

## Prompt 3 — V0.3: GitHub repository library

```text
Implement NEXUS V0.3 only: the GitHub repository library. First inspect current code, migrations, API contracts, docs, and Git status.

Backend:
1. Add repository subtype persistence and migrations, linked to the shared resources table.
2. Implement strict GitHub URL parsing. Accept canonical public `https://github.com/{owner}/{repo}` URLs and safe common URL variants; reject non-GitHub hosts, credentials in URLs, malformed paths, and unexpected query/fragment data.
3. Use `httpx` with explicit timeouts and clear error handling to call GitHub's public REST API without requiring a token. Retrieve repository metadata and README content where available.
4. Store canonical URL, owner, repo, description, default branch, topics, license, counts/timestamps where available, README, fetched time, and metadata provenance. Never invent missing metadata.
5. Add statuses: Saved, To Explore, Installed, Currently Using, Archived. Keep status values data-driven or centrally validated.
6. Support links between repository resources and project/skill/application resources.
7. Handle rate limits, not-found/private repositories, deleted repositories, missing README, network failures, and API response changes. Show stale cached metadata when refresh fails.
8. Append activity events for add, refresh, status change, and relationship change.

Frontend:
- Add repository using a URL with a metadata preview before save.
- Repository library with search, status/category/tag filters, cards or table, details, README preview, refresh action, notes, and links to associated projects.
- Show clearly when technology detection is heuristic.

Testing:
- Mock GitHub API responses; do not depend on live network in normal test suite.
- Test URL validation, rate limit behavior, missing README, malformed responses, duplicate repo, stale metadata, and event creation.

Constraints:
- No Git clone/install in this phase.
- No GitHub token storage yet.
- Do not execute repository content or read arbitrary remote files beyond documented metadata/README endpoints.

Acceptance criteria:
- User can save a public repository by URL, inspect metadata/README, categorize/tag/note it, change status, link it to a project, and refresh it.
- API failures do not erase the last good metadata.
- Tests pass and the UI accurately represents missing/stale metadata.

Update README/user guide and report exact tests. Do not commit.
```

## Prompt 4 — V0.4: Read-only system explorer and environment discovery

```text
Implement NEXUS V0.4 only: read-only local environment discovery. Read CLAUDE.md, docs/SECURITY_MODEL.md, docs/WINDOWS_NOTES.md, and the current implementation first.

Design the discovery subsystem before writing it. It must scan only configured roots and known Claude Code locations. Never recursively crawl all drives.

Backend:
1. Add configurable allowed scan roots, exclusion patterns, scan_runs, discovery metadata, and last-scanned timestamps.
2. Implement a cancellable/manual filesystem scanner with progress/status records. Do not add Watchdog yet.
3. Detect Git repositories under approved roots without descending into excluded heavy folders or following symlinks/reparse points by default.
4. Discover Claude Code locations using the user's home directory and `CLAUDE_CONFIG_DIR` when set. Inventory supported locations, including user/project settings, global and project `.claude/skills`, legacy commands, agents, plugin directories where safely identifiable, project `.mcp.json`, and the Claude CLI executable.
5. For skills, parse `SKILL.md` frontmatter and content hash. Record path, scope, description, and provenance. A folder missing `SKILL.md` is not a valid skill.
6. For MCP, inventory supported config sources with secret-safe parsing. Read environment variable names only; do not display or store values. Use `claude mcp list` for status if the CLI is available and safe to invoke with a timeout; retain raw output only in a redacted diagnostic log if necessary.
7. Use clear states: found, missing, unreadable, unsupported, not scanned, and stale. Missing default paths must not imply an installation error.
8. Store discovery results separately from manually created/owned resources so a scan does not overwrite the user's notes or category assignment.

Frontend:
- System Explorer page showing discovered roots, scan controls, scan progress, errors, Claude Code locations, skills, MCP sources, repositories, and tools.
- Show exact file locations and provenance with copy-path action.
- Make it clear this phase is read-only.

Testing:
- Use temporary fixture directory trees and fake Claude CLI output.
- Test Windows paths with spaces, symlinks/reparse-point handling, excluded folders, unreadable files, malformed JSON, `CLAUDE_CONFIG_DIR`, duplicate skill names, and scan cancellation.

Constraints:
- No install, update, delete, or edit actions in this phase.
- Do not mutate Claude Code config files.
- Do not inspect `.env` file contents or secret values.

Acceptance criteria:
- User can approve roots, start/cancel a scan, and see discovered items with exact paths and scan status.
- Scan is bounded, resilient, and non-destructive.
- No global disk crawl and no secrets appear in logs, DB payloads, or UI.

Update Windows/security docs and report all supported/unsupported discovery sources. Do not commit.
```

## Prompt 5 — V0.5: Claude Code skills manager and safe installation

```text
Implement NEXUS V0.5 only: the Claude Code skills manager. Inspect the current discovery implementation and the current official Claude Code skill conventions before changing the installer. Read the local integration skill and security model.

Backend:
1. Upgrade skill inventory into first-class resources linked to source repositories and target projects.
2. Support skill destinations: user/global skill directory and a selected project's `.claude/skills/` directory. Detect configured Claude Code home/config paths instead of assuming one fixed home.
3. Add a GitHub URL import workflow that downloads/clones the selected repository content into a temporary staging area without running repository scripts. Inspect the tree and find valid `SKILL.md` files. Support repositories containing multiple skills by letting the user select one.
4. Parse and display `SKILL.md` frontmatter (`name`, `description`, and supported metadata) plus content preview. Treat README instructions as untrusted text.
5. Before installation show source, selected skill, destination, existing files, and overwrite/backup plan.
6. Install by copying only the selected skill directory to a staging folder, validate paths and required `SKILL.md`, calculate hashes, then atomically move into destination. Reject path traversal, archive traversal, symlink escapes, unexpected nested paths, and files outside the selected skill folder.
7. If destination exists, require an explicit update/replace action. Back up or quarantine old files. Provide rollback.
8. Uninstall by moving the skill into a NEXUS backup/quarantine folder first; never permanently delete by default.
9. Track source URL, origin commit/hash where available, installed path, installed hash, previous hash, and associated project.
10. Append activity events for preview, install, update, uninstall, and rollback. Do not store downloaded secrets or execute setup scripts.

Frontend:
- Skills inventory with global/project filters, search, source, path, description, associated projects, and hash/status.
- Add from GitHub URL, inspect skill tree/content, choose destination, and confirm install.
- Update diff/preview and uninstall/rollback flows.
- Clearly mark skills discovered externally versus installed through NEXUS.

Testing:
- Use local fixture repositories and temporary directories; tests must not write into the user's actual `.claude` directory.
- Test malicious paths, symlinks, duplicate names, multiple skills in one repository, invalid/missing SKILL.md, existing destinations, interrupted copy, rollback, and no-script-execution behavior.

Constraints:
- Do not modify Claude Code settings or MCP config.
- Do not run scripts from downloaded repos.
- Do not silently overwrite global skills.

Acceptance criteria:
- User can inspect a repository skill before install and install it to a selected supported location with backup and rollback.
- Inventory clearly identifies global versus project-level paths and associations.
- No unreviewed code is executed and no path escapes the approved destination.

Document the exact supported skill layout and update user docs. Do not commit.
```

## Prompt 6 — V0.6: MCP inventory and guarded management

```text
Implement NEXUS V0.6 only: MCP configuration inventory and safe add/remove operations for Claude Code. First verify current Claude Code CLI behavior and version on this machine. Read the official/current CLI documentation and inspect existing adapter/tests. Do not guess flags.

Backend:
1. Model MCP resources with scope, transport, source, command/arguments or URL, environment variable names, status, and last checked time.
2. Inventory user/global and project `.mcp.json` scopes supported by the installed Claude Code version. Make configuration-source limitations explicit.
3. Parse JSON safely and redact values. Persist only environment variable names and whether a value is configured; never persist actual values.
4. Implement a Claude CLI adapter with a fixed allowlist of subcommands such as `claude mcp list`, `get`, `add`, `add-json`, and `remove` only when supported by the installed version. Do not pass arbitrary user-supplied CLI flags.
5. Add operation previews and explicit confirmation before add/remove. Require a project path and scope for project-level actions.
6. After mutation, re-run inventory/status and verify the expected configuration change. Distinguish configured from connected/healthy.
7. Preserve a redacted before/after snapshot or supported rollback information for NEXUS-managed operations. Do not directly edit internal `~/.claude.json`.
8. Do not implement enable/disable by editing undocumented disabled-server lists. If the CLI has no supported safe toggle for the installed version, expose a clear “not supported by this manager” explanation and leave configuration unchanged.
9. Append activity events for add/remove/status-check and failed operations without recording credentials.

Frontend:
- MCP list with scope, transport, config source, command/URL, variable names, status, and last checked.
- Detail view with redacted configuration preview.
- Add server form supporting stdio and remote URL forms only when supported by the CLI.
- Confirm and verify remove/add flows.

Testing:
- Mock CLI executable/output; do not alter real Claude configuration in tests.
- Test malformed JSON, paths with spaces, CLI missing/timeout/non-zero exit, duplicate server, project-scope approval caveat, and secret redaction.

Constraints:
- No custom MCP client implementation.
- No direct writes to `~/.claude.json`.
- No secret display or storage.
- No automatic server startup for arbitrary commands.

Acceptance criteria:
- Inventory is accurate and scope-aware.
- Add/remove actions use documented CLI commands and are verified afterward.
- UI never claims a configured server is connected unless status evidence supports that claim.
- Unsupported toggle behavior is explained honestly.

Update docs and report the tested CLI version and supported commands. Do not commit.
```

## Prompt 7 — V0.7: Application manager and Claude Code launcher

```text
Implement NEXUS V0.7 only: application registration/process supervision and interactive Claude Code launching. Treat this as a high-risk Windows integration. Read `docs/SECURITY_MODEL.md`, `docs/WINDOWS_NOTES.md`, and the full local-integrations skill.

Application manager backend:
1. Add application resource subtype, launch configuration, health-check configuration, and process_runs persistence.
2. Support web and desktop app kinds. Store executable, arguments, working directory, URL, environment variable references, and health checks as structured fields.
3. Never accept an arbitrary shell string. Use executable plus an argument array and `shell=False`. Do not concatenate user input into PowerShell/cmd scripts.
4. Validate executable and working directory before launch. Show a launch preview and require user confirmation for newly registered commands.
5. Start and record the PID plus process start time, executable path, and working directory fingerprint.
6. Use `psutil` to reconcile process state. Guard against PID reuse by verifying the fingerprint before stopping.
7. Stop only a process launched/tracked by NEXUS or a process the user explicitly selected and confirmed. Try graceful termination first, then present a force-stop option after timeout. Never kill by port.
8. Implement HTTP and TCP health checks with bounded timeouts. Keep process state separate from health state.
9. On NEXUS restart, re-check persisted runs; mark stale/exited safely without assuming a process is still the same one.
10. Append events for registration, start, stop, restart, and health transitions.

Claude Code launcher:
1. Detect the existing `claude` executable using `shutil.which()` and allow a manual executable override.
2. Add “Open in Claude Code” to project detail. Launch in the selected project directory using `cwd` and an OS-appropriate interactive console strategy.
3. Optionally support an initial prompt shown to the user for review before launch. Use only documented CLI behavior confirmed against the installed version.
4. Do not use an API integration, do not read credentials, and never pass permission-bypass flags.
5. Do not build a fake chat UI. Claude's interactive terminal remains the user's terminal window.
6. Store only launch metadata and process result; do not store full prompt text unless the user explicitly opts in.

Frontend:
- Application list/detail, register/edit form, start/stop/restart controls, URL open button, PID/process state, health status, and recent activity.
- Show action progress and actionable error details.
- Add Claude Code availability badge and project launch action.

Testing:
- Use fake executables and temporary scripts; do not launch or stop actual user applications in tests.
- Test PID reuse/fingerprint mismatch, already-running process, timeout, child process stop, missing executable, invalid directory, no health URL, and Windows paths with spaces.
- Test Claude launcher command construction without starting a real interactive Claude session.

Acceptance criteria:
- User can register, launch, monitor, and stop a test app safely.
- NEXUS never kills a process just because it uses a port.
- User can open the installed Claude Code CLI from a selected project directory without any NEXUS API credentials.
- Process and health states are distinct and truthful.

Update docs and report Windows terminal behavior tested. Do not commit.
```

## Prompt 8 — V0.8: Append-only activity timeline and Obsidian synchronization

```text
Implement NEXUS V0.8 only: complete activity timeline and an idempotent Obsidian Markdown projection. Read the architecture, schema, security model, and the dedicated Obsidian skill before making changes.

Backend:
1. Audit existing service mutations and ensure every meaningful successful mutation appends an immutable `activity_events` row in the same DB transaction.
2. Add event query APIs with filtering by date, resource, event type, and pagination. Do not permit ordinary update/delete of events.
3. Add `obsidian_sync_outbox` and create outbox records in the same transaction as events when sync is enabled.
4. Add Obsidian vault settings and a validation endpoint. Require explicit user configuration and confirmation of the selected vault.
5. Render deterministic Markdown resource notes and daily activity notes with YAML frontmatter, stable `nexus_id`, `managed_by: NEXUS`, and Obsidian wiki links.
6. Write only in the dedicated `NEXUS/` folder by default. Validate that every normalized output path remains inside the vault. Never overwrite an unmanaged note.
7. Use temp-file + atomic-replace writes. Make retries idempotent by event UUID and stable resource ID. Keep a sync status and error record for each outbox item.
8. Support pause/resume, dry run, retry failed, and sync status. Pausing must preserve pending outbox items.
9. Redact secrets and avoid exporting `.env`, environment variable values, credentials, OAuth tokens, or private prompt bodies.
10. Add a startup/recovery routine that resumes eligible outbox work without duplicating notes or daily events.

Frontend:
- Activity timeline with filters, event detail, and resource links.
- Obsidian settings page to set/validate vault path, enable/pause sync, dry-run preview, see last sync, and retry failures.
- Show sync state and conflicts clearly.

Testing:
- Use a temporary vault only.
- Test idempotent repeated sync, duplicate event prevention, existing unmanaged file conflict, path traversal, Unicode names, vault missing/unavailable, partial write, pause/resume, retry, and redaction.
- Verify event rows are append-only from service/API behavior.

Constraints:
- Do not make Obsidian the source of truth.
- Do not sync arbitrary folders or copy full project source code into the vault.
- Do not overwrite non-NEXUS notes.

Acceptance criteria:
- Every supported meaningful event is searchable in NEXUS and projects to Obsidian when enabled.
- Sync is retryable and idempotent.
- A broken vault cannot corrupt the SQLite event history.
- The user can pause sync without losing events.

Update docs/user guide and report exactly which event types are projected. Do not commit.
```

## Prompt 9 — V0.9: Customization, reusable prompts, and UX polish

```text
Implement NEXUS V0.9 only: complete user customization and operational UX. Inspect the current schema and UI before adding anything; do not duplicate capabilities that already exist.

Scope:
1. Add user-defined resource types using the resource_types table. Built-in resource types should be seeded, not hardcoded as frontend-only enums.
2. Add custom field definitions and typed values for resource types: text, number, boolean, date, URL, single-select, multi-select. Validate values at the backend.
3. Add relationship type management so users can define relationship labels and connect resources without schema changes.
4. Add reusable task prompt templates with name, description, template body, target resource type, variables, and timestamps.
5. Add “Open in Claude Code with this prompt” only as a user-confirmed launch action. Preview fully rendered prompt; do not execute it silently or submit to an API.
6. Improve global search, filters, sorting, keyboard navigation, empty states, confirmation dialogs, toast/notification feedback, and responsive desktop layout.
7. Add settings for data directory display, scan roots/exclusions, Git executable if needed, Claude executable override, GitHub network behavior, and Obsidian vault.
8. Add export/import for NEXUS metadata in a versioned JSON format. Validate imported data and show a preview; do not import filesystem paths or secrets as executable settings.
9. Add backup and restore workflow for the SQLite DB. Verify restore against a separate temporary location before allowing replacement.

Testing:
- Test custom field types/validation, custom resource type registration, relationship constraints, prompt variable interpolation/escaping, export/import compatibility, backup/restore, and user settings.
- Check accessibility and all new UI error/empty states.

Constraints:
- Do not add a plugin marketplace, workflow engine, user scripting system, or arbitrary custom executable hooks.
- Do not allow custom field values to become shell commands.
- Do not silently overwrite existing backup/import files.

Acceptance criteria:
- User can create resource types, custom metadata fields, relationship labels, and reusable prompts without code changes.
- Prompt execution always remains an explicit CLI launch action.
- Backup/restore is documented and tested against a temporary database.
- Core flows remain usable without Claude Code or an Obsidian vault.

Update documentation and report migration/export compatibility. Do not commit.
```

## Prompt 10 — V1.0: Security hardening, reliability, and release readiness

```text
Prepare NEXUS for a V1.0 local release. This phase is a hardening and verification pass, not an excuse to add new major features. Read all docs, inspect every integration adapter, inspect Git status, and build a release checklist before editing.

Audit and improve:
1. Local web security: bind to 127.0.0.1, validate Host and Origin, allow only the local frontend origin, protect state-changing requests against cross-origin browser requests, and require an appropriate local session/token mechanism if the current design needs it. Document the threat model and residual risks.
2. Filesystem safety: root allowlists, path traversal protection, symlink/reparse-point policy, archive extraction checks, atomic writes, cancellation, and permission-error handling.
3. Process safety: argument-array launches, shell=False, PID fingerprint checks, graceful stop, force-stop confirmation, no kill-by-port behavior, and process reconciliation after restart.
4. Claude Code and MCP safety: no credential handling, no bypass-permission flags, documented CLI commands only, scope-aware inventory, secret redaction, and verified post-operation state.
5. GitHub safety: timeouts, rate limits, URL validation, response validation, and cached metadata behavior.
6. Obsidian safety: vault path containment, managed-note markers, idempotent sync, retry behavior, and conflict handling.
7. Database reliability: migrations, indexes, transaction boundaries, backup/restore, append-only event behavior, and corruption/error messaging.
8. Logging/privacy: redact tokens, env values, `.env` content, private prompt bodies, and sensitive config snapshots from API responses, logs, events, and Obsidian.
9. Dependency and supply-chain hygiene: review direct dependencies, lockfiles, license notices where applicable, and avoid adding unneeded packages.
10. Startup UX: one documented PowerShell command to launch NEXUS, health checks, clear log location, and useful error messages when ports/dependencies are unavailable.
11. Documentation: README install/run/backup/restore/troubleshooting, user guide, supported discovery paths, limitations, and release notes.

Validation:
- Run all backend tests, frontend tests, lint, type check, and production build.
- Run migrations from an empty database and the previous release DB.
- Run an integration smoke test using temporary directories, test SQLite DB, fake app processes, fake Claude CLI, and temporary Obsidian vault.
- Confirm no production test uses real user paths or real app processes.
- Inspect `git diff --check`, `git status`, tracked files, and secret patterns. Do not claim a security audit is comprehensive; document what was and was not tested.

Release acceptance criteria:
- Fresh Windows 11 setup steps are reproducible.
- Start, health check, stop, backup, and restore workflows are documented.
- No critical destructive workflow lacks confirmation and rollback/backup strategy.
- All known limitations are documented.
- Provide a release checklist and proposed semantic version/tag. Do not create a tag, publish, or commit without user approval.