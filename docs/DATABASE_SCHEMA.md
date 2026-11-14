# NEXUS Database Schema

**Status:** Proposal — not implemented  
**Version:** V0.0 scaffold

---

## 1. Design Principles

- **UUIDs** (stored as strings initially for simplicity) as stable IDs
- **UTC ISO timestamps** for all datetime fields
- **SQLite foreign keys enabled** for every connection (`PRAGMA foreign_keys = ON`)
- **Alembic migrations** from the first persistent schema
- **Soft deletion** for resources where historical references matter
- **Append-only activity events** — never update or delete old events
- **JSON only for variable metadata** — do not turn every attribute into opaque JSON
- **Unique constraints** on normalized paths and canonical GitHub URLs
- **Redacted event payloads** — no secrets, env values, tokens, or full config snapshots

---

## 2. Core Tables

### 2.1 Resource Types & Resources (Polymorphic Identity)

```sql
-- Resource types: built-in + user-defined
CREATE TABLE resource_types (
    id TEXT PRIMARY KEY,              -- UUID
    key TEXT NOT NULL UNIQUE,         -- e.g., "project", "repository", "skill"
    label TEXT NOT NULL,              -- Human-readable label
    is_builtin INTEGER NOT NULL DEFAULT 0,  -- 1 = system type, 0 = user-defined
    created_at TEXT NOT NULL          -- UTC ISO
);

-- Central identity for every resource
CREATE TABLE resources (
    id TEXT PRIMARY KEY,                      -- UUID
    resource_type_id TEXT NOT NULL,           -- FK → resource_types.id
    name TEXT NOT NULL,
    description TEXT,
    status TEXT,                              -- e.g., "active", "archived", "error"
    source_kind TEXT NOT NULL,                -- "manual", "discovered", "github", "imported", "system"
    source_path TEXT,                         -- Original path/URL for provenance
    created_at TEXT NOT NULL,                 -- UTC ISO
    updated_at TEXT NOT NULL,                 -- UTC ISO
    deleted_at TEXT,                          -- Soft delete timestamp
    FOREIGN KEY (resource_type_id) REFERENCES resource_types(id)
);

CREATE INDEX idx_resources_type ON resources(resource_type_id);
CREATE INDEX idx_resources_name ON resources(name);
CREATE INDEX idx_resources_status ON resources(status);
CREATE INDEX idx_resources_source_path ON resources(source_path);
```

### 2.2 Domain-Specific Tables

```sql
-- Projects
CREATE TABLE projects (
    resource_id TEXT PRIMARY KEY,             -- FK → resources.id
    directory_path TEXT NOT NULL,             -- Canonical absolute path
    git_remote_url TEXT,                      -- Optional GitHub/Git remote
    category_id TEXT,                         -- FK → categories.id
    last_scanned_at TEXT,                     -- UTC ISO
    notes TEXT,
    FOREIGN KEY (resource_id) REFERENCES resources(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id)
);

CREATE UNIQUE INDEX idx_projects_path ON projects(directory_path);

-- GitHub Repositories
CREATE TABLE repositories (
    resource_id TEXT PRIMARY KEY,             -- FK → resources.id
    github_url TEXT NOT NULL UNIQUE,          -- Canonical HTTPS URL
    owner TEXT NOT NULL,
    repo_name TEXT NOT NULL,
    default_branch TEXT,
    readme_text TEXT,
    metadata_json TEXT,                       -- JSON: stars, forks, topics, license, timestamps
    last_fetched_at TEXT,                     -- UTC ISO
    FOREIGN KEY (resource_id) REFERENCES resources(id) ON DELETE CASCADE
);

CREATE INDEX idx_repositories_owner_repo ON repositories(owner, repo_name);

-- Skills
CREATE TABLE skills (
    resource_id TEXT PRIMARY KEY,             -- FK → resources.id
    skill_name TEXT NOT NULL,
    scope TEXT NOT NULL,                      -- "global", "project"
    skill_directory TEXT NOT NULL,            -- Containing directory
    skill_md_path TEXT NOT NULL,              -- Path to SKILL.md
    frontmatter_json TEXT,                    -- Parsed frontmatter
    content_hash TEXT NOT NULL,               -- SHA256 of SKILL.md content
    origin_repo_id TEXT,                      -- FK → repositories.resource_id (optional)
    last_scanned_at TEXT,                     -- UTC ISO
    FOREIGN KEY (resource_id) REFERENCES resources(id) ON DELETE CASCADE,
    FOREIGN KEY (origin_repo_id) REFERENCES repositories(resource_id)
);

CREATE INDEX idx_skills_scope ON skills(scope);
CREATE INDEX idx_skills_hash ON skills(content_hash);

-- MCP Servers
CREATE TABLE mcp_servers (
    resource_id TEXT PRIMARY KEY,             -- FK → resources.id
    scope TEXT NOT NULL,                      -- "user", "project", "local"
    transport TEXT NOT NULL,                  -- "stdio", "sse", "http"
    config_source TEXT NOT NULL,              -- Source file/path
    command TEXT,                             -- For stdio transport
    args_json TEXT,                           -- JSON array of arguments
    url TEXT,                                 -- For sse/http transport
    env_var_names_json TEXT,                  -- JSON array of env var NAMES only
    reported_status TEXT,                     -- "configured", "healthy", "needs_auth", "failed", "not_checked"
    last_checked_at TEXT,                     -- UTC ISO
    FOREIGN KEY (resource_id) REFERENCES resources(id) ON DELETE CASCADE
);

-- Applications
CREATE TABLE applications (
    resource_id TEXT PRIMARY KEY,             -- FK → resources.id
    working_directory TEXT NOT NULL,
    executable TEXT NOT NULL,                 -- Absolute path or command name
    args_json TEXT,                           -- JSON array of arguments
    app_kind TEXT NOT NULL,                   -- "web", "desktop", "service"
    url TEXT,                                 -- Local URL for web apps
    health_check_json TEXT,                   -- JSON: type, endpoint, interval, timeout
    enabled INTEGER NOT NULL DEFAULT 1,       -- 1 = enabled, 0 = disabled
    FOREIGN KEY (resource_id) REFERENCES resources(id) ON DELETE CASCADE
);
```

### 2.3 Categorization & Relationships

```sql
-- Categories (user-managed)
CREATE TABLE categories (
    id TEXT PRIMARY KEY,                      -- UUID
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    color TEXT,                               -- Hex color for UI
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL                  -- UTC ISO
);

-- Tags (user-managed)
CREATE TABLE tags (
    id TEXT PRIMARY KEY,                      -- UUID
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    created_at TEXT NOT NULL                  -- UTC ISO
);

-- Resource ↔ Tags (many-to-many)
CREATE TABLE resource_tags (
    resource_id TEXT NOT NULL,                -- FK → resources.id
    tag_id TEXT NOT NULL,                     -- FK → tags.id
    PRIMARY KEY (resource_id, tag_id),
    FOREIGN KEY (resource_id) REFERENCES resources(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);

-- Resource ↔ Resource relationships (user-defined, labeled)
CREATE TABLE resource_links (
    id TEXT PRIMARY KEY,                      -- UUID
    source_resource_id TEXT NOT NULL,         -- FK → resources.id
    target_resource_id TEXT NOT NULL,         -- FK → resources.id
    relation_type TEXT NOT NULL,              -- "uses", "derived_from", "installed_from", "belongs_to", "documented_by", etc.
    created_at TEXT NOT NULL,                 -- UTC ISO
    FOREIGN KEY (source_resource_id) REFERENCES resources(id) ON DELETE CASCADE,
    FOREIGN KEY (target_resource_id) REFERENCES resources(id) ON DELETE CASCADE
);

CREATE INDEX idx_resource_links_source ON resource_links(source_resource_id);
CREATE INDEX idx_resource_links_target ON resource_links(target_resource_id);
CREATE INDEX idx_resource_links_type ON resource_links(relation_type);
```

### 2.4 Custom Fields

```sql
-- Custom field definitions (per resource type)
CREATE TABLE custom_field_definitions (
    id TEXT PRIMARY KEY,                      -- UUID
    resource_type_id TEXT NOT NULL,           -- FK → resource_types.id
    field_key TEXT NOT NULL,                  -- Machine key (e.g., "tech_stack")
    label TEXT NOT NULL,                      -- Human label
    field_type TEXT NOT NULL,                 -- "string", "number", "boolean", "select", "multiselect", "date"
    required INTEGER NOT NULL DEFAULT 0,
    options_json TEXT,                        -- For select/multiselect: JSON array of options
    FOREIGN KEY (resource_type_id) REFERENCES resource_types(id) ON DELETE CASCADE
);

CREATE UNIQUE INDEX idx_custom_field_def_type_key ON custom_field_definitions(resource_type_id, field_key);

-- Custom field values (per resource)
CREATE TABLE custom_field_values (
    resource_id TEXT NOT NULL,                -- FK → resources.id
    field_definition_id TEXT NOT NULL,        -- FK → custom_field_definitions.id
    value_json TEXT NOT NULL,                 -- JSON value matching field_type
    PRIMARY KEY (resource_id, field_definition_id),
    FOREIGN KEY (resource_id) REFERENCES resources(id) ON DELETE CASCADE,
    FOREIGN KEY (field_definition_id) REFERENCES custom_field_definitions(id) ON DELETE CASCADE
);
```

### 2.5 Settings

```sql
-- Application settings (no secrets!)
CREATE TABLE settings (
    key TEXT PRIMARY KEY,
    value_json TEXT NOT NULL,                 -- JSON value
    updated_at TEXT NOT NULL                  -- UTC ISO
);
```

### 2.6 Activity Events (Append-Only)

```sql
CREATE TABLE activity_events (
    id TEXT PRIMARY KEY,                      -- UUID
    event_type TEXT NOT NULL,                 -- e.g., "project.registered", "skill.installed"
    resource_id TEXT,                         -- FK → resources.id (nullable for system events)
    occurred_at TEXT NOT NULL,                -- UTC ISO
    actor TEXT NOT NULL,                      -- "user", "system", "cli", "sync"
    summary TEXT NOT NULL,                    -- Human-readable one-liner
    payload_json TEXT,                        -- Redacted snapshot of changed fields
    schema_version INTEGER NOT NULL DEFAULT 1
);

CREATE INDEX idx_activity_events_type ON activity_events(event_type);
CREATE INDEX idx_activity_events_resource ON activity_events(resource_id);
CREATE INDEX idx_activity_events_occurred ON activity_events(occurred_at);
```

#### Event Types (Initial Set)
| Event Type | Description |
|------------|-------------|
| `project.registered` | New project added |
| `project.updated` | Project metadata changed |
| `project.archived` | Project soft-deleted |
| `repository.added` | GitHub repo added to library |
| `repository.refreshed` | Metadata re-fetched from GitHub |
| `repository.status_changed` | Status field updated |
| `skill.discovered` | Skill found during scan |
| `skill.installed` | Skill installed to skill directory |
| `skill.updated` | Skill updated |
| `skill.uninstalled` | Skill moved to quarantine |
| `mcp.discovered` | MCP server found in config |
| `mcp.added` | MCP server added via CLI |
| `mcp.removed` | MCP server removed via CLI |
| `mcp.status_checked` | Health check performed |
| `application.registered` | New app registered |
| `application.started` | App process launched |
| `application.stopped` | App process stopped |
| `application.health_changed` | Health status transition |
| `filesystem.scan_started` | Scan job began |
| `filesystem.scan_completed` | Scan job finished |
| `filesystem.scan_failed` | Scan job errored |
| `claude.session_started` | Claude CLI session launched |
| `claude.session_exited` | Claude CLI session ended |
| `settings.updated` | Settings changed |
| `obsidian.sync_succeeded` | Outbox item synced |
| `obsidian.sync_failed` | Outbox item failed |

---

### 2.7 Obsidian Sync Outbox

```sql
CREATE TABLE obsidian_sync_outbox (
    id TEXT PRIMARY KEY,                      -- UUID
    event_id TEXT NOT NULL UNIQUE,            -- FK → activity_events.id
    target_path TEXT NOT NULL,                -- Relative path inside vault
    status TEXT NOT NULL DEFAULT 'pending',   -- "pending", "synced", "failed", "paused"
    attempt_count INTEGER NOT NULL DEFAULT 0,
    next_attempt_at TEXT,                     -- UTC ISO for retry scheduling
    last_error TEXT,                          -- Error message for failed attempts
    synced_at TEXT,                           -- UTC ISO when successfully synced
    FOREIGN KEY (event_id) REFERENCES activity_events(id) ON DELETE CASCADE
);

CREATE INDEX idx_outbox_status ON obsidian_sync_outbox(status);
CREATE INDEX idx_outbox_next_attempt ON obsidian_sync_outbox(next_attempt_at);
```

---

### 2.8 Operational Tables

```sql
-- Filesystem scan runs
CREATE TABLE scan_runs (
    id TEXT PRIMARY KEY,                      -- UUID
    root_path TEXT NOT NULL,
    started_at TEXT NOT NULL,                 -- UTC ISO
    finished_at TEXT,                         -- UTC ISO
    status TEXT NOT NULL,                     -- "running", "completed", "failed", "cancelled"
    items_seen INTEGER NOT NULL DEFAULT 0,
    errors_json TEXT                          -- JSON array of error objects
);

-- Process runs (tracked by NEXUS)
CREATE TABLE process_runs (
    id TEXT PRIMARY KEY,                      -- UUID
    application_id TEXT NOT NULL,             -- FK → applications.resource_id
    pid INTEGER NOT NULL,
    process_started_at TEXT NOT NULL,         -- Process creation time (UTC ISO)
    executable_fingerprint TEXT NOT NULL,     -- Executable path + hash for PID reuse detection
    working_directory TEXT NOT NULL,
    started_at TEXT NOT NULL,                 -- NEXUS launch time (UTC ISO)
    stopped_at TEXT,                          -- UTC ISO
    status TEXT NOT NULL,                     -- "running", "stopped", "crashed", "unknown"
    exit_code INTEGER,
    FOREIGN KEY (application_id) REFERENCES applications(resource_id) ON DELETE CASCADE
);

CREATE INDEX idx_process_runs_app ON process_runs(application_id);
CREATE INDEX idx_process_runs_pid ON process_runs(pid);

-- Claude Code sessions
CREATE TABLE claude_sessions (
    id TEXT PRIMARY KEY,                      -- UUID
    project_id TEXT,                          -- FK → projects.resource_id (nullable)
    pid INTEGER,
    started_at TEXT NOT NULL,                 -- UTC ISO
    stopped_at TEXT,                          -- UTC ISO
    working_directory TEXT NOT NULL,
    launch_mode TEXT NOT NULL,                -- "interactive", "print", "prompt"
    status TEXT NOT NULL,                     -- "running", "exited", "crashed"
    FOREIGN KEY (project_id) REFERENCES projects(resource_id)
);

-- Prompt templates
CREATE TABLE prompt_templates (
    id TEXT PRIMARY KEY,                      -- UUID
    name TEXT NOT NULL,
    description TEXT,
    template_body TEXT NOT NULL,              -- Template with {{variables}}
    target_type TEXT,                         -- "project", "repository", "skill", etc.
    variables_json TEXT,                      -- JSON schema of variables
    created_at TEXT NOT NULL,                 -- UTC ISO
    updated_at TEXT NOT NULL                  -- UTC ISO
);
```

---

## 3. Migration Strategy

- One Alembic migration per logical schema change
- Review generated scripts; do not trust autogenerate blindly
- Test upgrade from empty DB and from previous release DB
- Back up before migrations that may transform or remove data
- Avoid destructive migrations. Prefer expand-and-contract and deprecate before removal

---

## 4. Indexing Strategy

| Table | Indexes |
|-------|---------|
| `resources` | type, name, status, source_path |
| `projects` | directory_path (unique) |
| `repositories` | owner+repo_name, github_url (unique) |
| `skills` | scope, content_hash |
| `resource_links` | source, target, relation_type |
| `activity_events` | event_type, resource_id, occurred_at |
| `obsidian_sync_outbox` | status, next_attempt_at |
| `process_runs` | application_id, pid |

---

## 5. Notes on Windows Path Handling

- Normalize using `Path.resolve()` where possible
- Retain user-supplied display path
- Comparisons: case-insensitive on Windows
- Store as UTF-8 text in SQLite