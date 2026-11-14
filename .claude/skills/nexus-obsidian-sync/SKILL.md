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