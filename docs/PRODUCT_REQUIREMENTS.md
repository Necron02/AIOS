# NEXUS Product Requirements

**Status:** Planning baseline — revise only when implementation evidence requires it  
**Version:** V0.0 scaffold

---

## 1. Product Principles

1. **Local-first:** The application, database, inventory, and ordinary management functions work locally. Internet access is only required for explicitly networked features such as GitHub metadata retrieval or remote MCP health checks.
2. **No LLM dependency:** Adding a repository, registering a project, reading a skill, viewing configuration, and starting a local application must not require Claude or another model.
3. **Observe before modifying:** Inventory and discovery are read-only initially. Every write to a user's filesystem or Claude Code configuration must be an explicit action with a preview and a result record.
4. **User-controlled roots:** Scan only directories the user has registered or explicitly approved. Never crawl the entire C: drive by default.
5. **Explain provenance:** Each discovered resource should show where it was found, when it was last scanned, and whether its information is discovered, user-entered, or inferred.
6. **Portable data:** The main database and configuration should be easy to back up. Obsidian output must remain readable without NEXUS.
7. **Modular, not overengineered:** Integrations are service adapters within one backend process. Use interfaces where there are genuinely different implementations or test boundaries.
8. **Recoverable changes:** Installations, configuration edits, and file moves should have previews, backups or staging, verification, and rollback where feasible.

---

## 2. User Roles and Operating Model

NEXUS is initially a **single-user desktop-local application**. Do not build a multi-user permission system, cloud sync, team accounts, or remote administration in the MVP. Still design clear service boundaries so authentication or multiple profiles could be added later without restructuring the entire app.

The user is the final approver for:
- Installing or updating a skill
- Removing a skill or MCP entry
- Modifying a Claude Code configuration
- Launching a custom command or desktop application for the first time
- Stopping a process tree
- Moving, overwriting, or deleting files
- Enabling filesystem monitoring for a new root

---

## 3. Functional Requirements

### A. Dashboard

Show live counts for projects, repositories, skills, MCP servers, registered applications, and running applications. Show recent events, failed health checks, stale scans, and items that need attention. Dashboard metrics must come from database queries, not hardcoded counters.

### B. Project Manager

- Register a project by selecting or entering an existing directory
- Create a project record with name, description, category, tags, notes, and optional GitHub association
- Allow multiple user-defined categories and tags
- Display canonical path, existence, Git repository state, current branch, dirty status, technologies detected, discovered skills, MCP associations, and linked applications
- Permit an optional launch action for a terminal / Claude Code session in the project directory
- Avoid claiming that a project was discovered automatically when it was actually manually registered

### C. Skills Manager

- Inventory global and project-level Claude Code skills
- Display `SKILL.md` path, name, description, frontmatter, source location, scope, hash, and last scan time
- Associate skills with their containing project and any known source repository
- Preview skill contents before installation
- Support installation into a selected global or project skill directory
- Support update by inspecting the proposed change before applying it
- Support uninstall by moving the selected skill into a NEXUS-managed backup/quarantine location first
- **Never execute scripts from a downloaded skill during inspection or installation**

### D. MCP Manager

- Inventory the supported Claude Code MCP scopes and configuration sources
- Show name, transport, command/arguments or URL, environment variable *names* (not secret values), scope, config source, and observed status
- Support add and remove through the installed Claude Code CLI where supported; verify the result by re-reading the CLI output/configuration
- Make a distinction between "configured", "connection reported healthy", "needs authentication", "failed", and "not checked"
- Do not edit Claude Code's internal `~/.claude.json` file directly. Use official CLI operations where available
- Treat enable/disable as a separate capability. If the installed CLI does not expose a stable safe command for a requested toggle, label the status honestly and defer direct mutation rather than editing undocumented internal state

### E. GitHub Repository Library

- Add a public repository from an HTTPS GitHub URL
- Normalize and validate the URL; reject unrelated hosts and malformed paths
- Retrieve metadata through GitHub's public REST API: canonical URL, owner, repo name, description, default branch, stars/forks when available, topics, license, and timestamps
- Retrieve README content and detect likely languages/technologies from GitHub metadata and repository files. Label heuristic detections as estimates
- Support categories, tags, notes, status (`Saved`, `To Explore`, `Installed`, `Currently Using`, `Archived`), and associations to projects, skills, and apps
- Handle API rate limits, network errors, deleted/private repositories, and README absence gracefully
- Do not require a GitHub token for the first public-repository workflow. Add optional token support later using OS credential storage, never plain text in the database

### F. Application Manager

- Register local web applications and desktop applications using a directory, executable, arguments, environment-variable references, and optional health-check configuration
- Keep executable and arguments separate; never build a shell command by concatenating untrusted strings
- Start, stop, and restart only processes started and tracked by NEXUS, or processes that the user explicitly selects and confirms
- Monitor PID, process start time, executable, working directory, configured port, and health status
- Support HTTP and TCP health checks. A successful TCP connection does not prove the application is fully healthy; show the check type
- Open a configured local URL in the default browser
- Support desktop applications that have no URL or health endpoint
- On restart of NEXUS, reconcile persisted PID records with the actual OS process using PID plus process fingerprint to avoid PID reuse mistakes
- **Never kill a process merely because it is listening on a configured port**

### G. System Explorer

- Display known Claude Code settings files, skill directories, agent directories, command directories, plugin locations, MCP config sources, project roots, Git repositories, and relevant developer tools
- Start read-only. Show exact path, discovered state, last modified timestamp, last scan, and whether the path exists
- Do not assume all users have the default Claude config path. Respect `CLAUDE_CONFIG_DIR` when present and provide a settings override
- Make unsupported or unknown locations visible as "not inspected" rather than "not installed"

### H. Obsidian Integration

- Allow the user to configure and validate a vault path
- Project meaningful NEXUS events to Markdown notes and chronological daily logs
- Use stable NEXUS IDs in YAML frontmatter and internal wiki links between notes
- Keep the SQLite activity event as the authoritative record
- Implement retryable, idempotent synchronization using an outbox table
- Do not overwrite arbitrary existing Obsidian notes. Only manage files carrying a NEXUS ownership marker or use a dedicated NEXUS folder
- Provide dry-run, pause, retry, and last-sync status

### I. Customization

- User-defined categories and tags
- Resource types stored in data, not hardcoded frontend enum values
- Typed built-in resource subtypes for projects, repositories, skills, MCP servers, and applications
- Custom field definitions and values for user extensions
- User-defined relationships between resources with labels such as `uses`, `derived_from`, `installed_from`, `belongs_to`, and `documented_by`
- Reusable task prompt templates with a title, body, target context, variables, and notes. NEXUS may open Claude Code with a prompt, but it must not silently execute the task

---

## 4. Non-Functional Requirements

- Single-user local operation; bind server to `127.0.0.1` by default
- No secret values in logs, event snapshots, Obsidian notes, or frontend responses
- Database migrations are explicit and tested
- Core services are testable without launching the frontend or invoking Claude Code
- UI should remain usable with hundreds or a few thousand resources
- Filesystem scans should be cancellable, incremental where possible, and visible to the user
- All long-running scans and process actions should report progress/state rather than block HTTP request handlers
- App startup should be predictable and provide actionable error messages
- Backups should include SQLite DB, application settings, and optionally NEXUS-owned Obsidian data; never bundle secrets unintentionally