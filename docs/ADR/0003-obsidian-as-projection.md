# ADR 0003: Obsidian as Projection, Not Primary Database

**Status:** Accepted  
**Date:** 2026-11-14  
**Supersedes:** None

---

## Context

NEXUS maintains a structured inventory of development resources with full audit trails. Users may want to view and navigate this information in Obsidian for:
- Human-readable project/repo/skill documentation
- Knowledge graph via wiki links
- Daily activity journals
- Offline access to project context
- Personal annotations alongside NEXUS data

Key constraints:
- SQLite is the **authoritative source of truth**
- Obsidian notes must remain readable without NEXUS
- Sync must be reliable, retryable, and idempotent
- Must not overwrite user's existing notes
- Must not export secrets

## Decision

**Obsidian is a read-only projection** of NEXUS data, synchronized via a transactional outbox pattern.

### Architecture

```
NEXUS SQLite (Source of Truth)
    │
    ├── resources, activity_events, etc.
    │
    └── obsidian_sync_outbox (transactional)
            │
            ▼
    Background Sync Worker
            │
            ▼
    Obsidian Vault (Projection)
            │
            ├── NEXUS/Dashboard.md
            ├── NEXUS/Projects/<slug>.md
            ├── NEXUS/Repositories/<owner>-<repo>.md
            ├── NEXUS/Skills/<slug>.md
            ├── NEXUS/MCP/<slug>.md
            ├── NEXUS/Applications/<slug>.md
            ├── NEXUS/Categories/<slug>.md
            ├── NEXUS/Activity/YYYY/MM/YYYY-MM-DD.md
            ├── NEXUS/Templates/
            └── NEXUS/Attachments/
```

### Ownership Marker

Every NEXUS-managed note includes YAML frontmatter:

```yaml
---
nexus_id: "<stable-resource-uuid>"
nexus_type: "project"  # or repository, skill, mcp, application, category
managed_by: "NEXUS"
created: "2026-11-13T00:00:00Z"
updated: "2026-11-13T00:00:00Z"
---
```

**Rules:**
- Only manage files with `managed_by: NEXUS` AND matching `nexus_id`
- Never overwrite a file without the marker (show conflict)
- Never overwrite a file with a different `nexus_id` (show conflict)

### Sync Flow (Outbox Pattern)

1. **Service layer** (in same DB transaction):
   - Updates resource (e.g., project)
   - Appends `activity_events` row
   - Inserts `obsidian_sync_outbox` row (if sync enabled)

2. **Background worker** (separate process/thread):
   - Polls `status = 'pending'` ordered by `next_attempt_at`
   - Renders deterministic Markdown from resource + event
   - Writes to temp file → atomic replace (`os.replace`)
   - Updates outbox row: `status = 'synced'`, `synced_at = now`
   - On failure: increment `attempt_count`, set `next_attempt_at` (exponential backoff), store `last_error`

3. **Idempotency**:
   - Daily log entries deduplicated by `event_id` (UUID)
   - Resource notes overwritten atomically (same content = no-op)
   - Retry safe: re-rendering produces identical output

### Vault Structure Details

```
NEXUS/
├── Dashboard.md                    # Summary with live counts (regenerated)
├── Projects/
│   └── my-project.md               # Project detail + links
├── Repositories/
│   └── owner-repo.md               # Repo metadata + README excerpt
├── Skills/
│   └── my-skill.md                 # Skill frontmatter + description
├── MCP/
│   └── server-name.md              # MCP config + status
├── Applications/
│   └── my-app.md                   # App config + process history
├── Categories/
│   └── backend.md                  # Category + linked resources
├── Activity/
│   └── 2026/11/2026-11-14.md       # Daily event journal
├── Templates/                      # User templates (not managed)
└── Attachments/                    # Optional, not managed
```

### Wiki Links

Cross-references use Obsidian wiki links:
- `[[Projects/my-project]]`
- `[[Repositories/owner-repo]]`
- `[[Skills/my-skill]]`

Slug generation: lowercase, spaces → hyphens, remove special chars, Unicode normalized.

### Conflict Handling

| Scenario | Action |
|----------|--------|
| Target path exists, no NEXUS marker | **Stop** — show conflict, user chooses: skip / rename / overwrite with backup |
| Target path exists, different `nexus_id` | **Stop** — show conflict, likely user moved/renamed; user resolves |
| Target path exists, matching `nexus_id` | **Proceed** — atomic overwrite (normal update) |
| Target path missing | **Create** — normal write |

### What NOT to Sync

- Secrets (API keys, tokens, passwords, env values)
- Full process environment maps
- Raw config snapshots (`.claude.json`, `.mcp.json`)
- Private prompt content (unless user explicitly opts in)
- Binary files / large attachments

### User Controls

- Enable/disable sync per vault
- Dry-run mode (show what would change)
- Pause/resume sync
- Manual sync trigger
- Last sync status + error display
- Configure vault path (validated on save)

## Alternatives Considered

### Obsidian as Primary Database
**Rejected:** Markdown files lack transactions, referential integrity, queries, schema evolution, and concurrent access safety. Editing a note doesn't propagate back to NEXUS.

### Bidirectional Sync (Edit in Obsidian → NEXUS)
**Rejected:** Complex conflict resolution, parsing ambiguity, security risk (user could inject malicious frontmatter). NEXUS remains write authority; Obsidian is read-only view.

### Direct SQLite-to-Markdown on Every Read
**Rejected:** Performance (re-rendering on every view), no offline access, no Obsidian graph features. Outbox + background worker decouples write latency from read.

### Separate Export Command (Manual)
**Rejected:** Users forget to run it; data gets stale. Automatic outbox keeps projection current with minimal latency.

### Symlink / Junction to Vault
**Rejected:** Platform-specific, breaks if vault moves, doesn't solve conflict detection or ownership.

## Consequences

### Positive
- **SQLite remains authoritative** — single source of truth
- **Obsidian works standalone** — notes readable without NEXUS
- **Reliable sync** — outbox guarantees at-least-once, idempotent
- **User safety** — conflicts detected, no silent overwrites
- **Audit trail preserved** — daily logs append-only, event UUID deduplication
- **Extensible** — new projection targets (Notion, Logseq, HTML) reuse outbox

### Negative
- **Eventual consistency** — vault lags behind DB by seconds/minutes
- **Background worker needed** — additional process to manage
- **Conflict resolution manual** — user must resolve (acceptable for personal tool)

### Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Vault path invalid/moved | Validate on config save; show clear error in UI |
| Disk full / permission error | Retry with backoff; alert user after max retries |
| Concurrent NEXUS instances | Single-user app; lock file in data dir if needed |
| Markdown rendering drift | Deterministic renderer; version in frontmatter |
| Large vault sync slow | Incremental (outbox only processes new/changed); pagination |

## Implementation Notes

- Renderer: pure Python, no external deps (stdlib + `yaml` for frontmatter)
- Atomic write: `tempfile.NamedTemporaryFile` + `os.replace()`
- Slugify: `unicodedata.normalize('NFKD', s).encode('ascii', 'ignore').decode().lower()` + regex
- Daily log: append to `YYYY-MM-DD.md` with event UUID as HTML comment for deduplication
- Worker: run in same process (thread) for V0.8; separate process if needed later
- Config: `settings` table keys `obsidian.enabled`, `obsidian.vault_path`, `obsidian.dry_run`

## Related Decisions

- ADR 0001: Modular Monolith (outbox worker runs in backend process)
- ADR 0002: SQLite and Event Log (outbox table, activity_events source)

---

*This ADR captures the Obsidian integration strategy. Implementation details in `docs/ARCHITECTURE.md` section 2.6 and `docs/DATABASE_SCHEMA.md` section 2.7.*