# NEXUS Security Model

**Status:** Planning baseline — revise only when implementation evidence requires it  
**Version:** V0.0 scaffold

---

## 1. Minimum Safeguards (from V0.1)

### 1.1 Network Binding
- Bind **only to `127.0.0.1`**; never default to `0.0.0.0`
- Document any deviation explicitly with user consent

### 1.2 Host/Origin Validation
- Validate `Host` and `Origin` headers on all requests
- Configure **narrow CORS origins** — only the local frontend origin
- A localhost service can still be targeted by a malicious website through browser behavior; do not rely on loopback binding alone

### 1.3 Request Token / CSRF Protection
- Use a per-install local request token or similarly appropriate browser-session protection for state-changing API requests
- Keep tokens out of URLs and logs

### 1.4 Path Validation
- Validate **every path on the backend** — UI validation is not a security boundary
- Canonicalize paths and verify they remain within approved roots
- Reject `..`, absolute paths embedded in archive members, alternate data streams, and archive symlink escapes

### 1.5 Subprocess Execution
- **Never use `shell=True`**
- Invoke executables with **argument arrays**, a validated working directory, timeout, and captured exit status
- Never pass user-controlled commands to `shell=True`

### 1.6 External Call Timeouts
- Add timeouts to all external CLI and HTTP calls
- Default: 30 seconds for CLI, 15 seconds for HTTP; configurable

### 1.7 Configuration Exposure
- Do not return raw config files where secrets may exist
- Return only sanitized, schema-validated data

### 1.8 Secret Redaction
- Redact **before storing** logs/events, not just before rendering the UI
- Never persist or export: `ANTHROPIC_API_KEY`, auth tokens, OAuth refresh tokens, GitHub PATs, arbitrary MCP secrets, passwords, `.env` values
- Store only environment variable **names** and a boolean `is_configured`

---

## 2. Filesystem Permissions

### 2.1 Explicit Scan Roots
- Use explicit scan roots and destination allowlists
- Do not crawl whole drives or follow symlinks/reparse points by default

### 2.2 Path Canonicalization
- Canonicalize destination and prove it remains under the approved root
- Use `Path.resolve()` and verify the result starts with the allowed root

### 2.3 Archive Safety
- Reject archive members with `../` or absolute paths
- Extract to staging directory first, validate all paths, then atomic move

### 2.4 Install Safety
- Preview and stage, validate, then atomically move into place
- If destination exists, show diff/backup plan; never overwrite silently
- Keep a backup or quarantine copy for rollback

### 2.5 Removal Safety
- Quarantine first; do not permanently delete by default
- Quarantine location: `%LOCALAPPDATA%\NEXUS\quarantine\`

---

## 3. Secrets Management

### 3.1 Never Persist or Export
- API keys, auth tokens, OAuth tokens, GitHub PATs, MCP secrets, passwords
- Full environment maps from launched processes
- Secret-bearing raw JSON configuration snapshots
- `.env` file contents

### 3.2 Safe Storage Pattern
- Store environment variable **names** only
- Store a boolean `is_configured` flag
- Let the actual consuming CLI read credentials from the user's existing environment/credential store (Windows Credential Manager, etc.)

### 3.3 Logging & Events
- Redact secrets in application logs
- Redact secrets in activity event payloads
- Redact secrets in Obsidian sync output
- Use a centralized redaction utility for all outputs

---

## 4. Process Control

### 4.1 Controlled Processes Only
- Only control processes **launched by NEXUS** unless the user explicitly chooses an external process and confirms it

### 4.2 PID Validation (Fingerprinting)
Before stopping a tracked process, verify:
- PID matches
- Process creation/start time matches recorded fingerprint
- Executable path matches
- Working directory matches

### 4.3 Port Ownership
- **Never infer that port ownership equals NEXUS ownership**
- Port checks are read-only
- Never kill a process merely because it is listening on a configured port

### 4.4 Graceful Termination
- Offer graceful stop first (SIGTERM / `CTRL_BREAK_EVENT` on Windows)
- Require a second explicit user choice for force termination (SIGKILL / `TerminateProcess`)
- Record action outcome and exit status

---

## 5. Skill and Repository Supply Chain

### 5.1 Untrusted Input
- A GitHub repository or downloaded skill is **untrusted input**

### 5.2 Inspection Before Install
- Inspect before install — show origin URL, commit/hash, and files to be installed
- **Never execute scripts** during preview or install
- Parse `SKILL.md` as text only

### 5.3 Path Validation
- Verify destination paths and reject symlink/path traversal cases
- Reject unexpected nested destination paths

### 5.4 Backup and Rollback
- Back up existing destination before install/update
- Allow rollback from backup/quarantine

### 5.5 No False Safety Claims
- Do not imply that a skill is safe merely because it contains a `SKILL.md` file
- Show provenance: source, hash, scan time, discovered vs. manual

---

## 6. Obsidian Sync Safety

### 6.1 Vault Validation
- Require a validated, configured vault path
- Normalize each output path and verify it remains inside the vault

### 6.2 Managed Files Only
- Write only within the dedicated `NEXUS/` folder by default
- Never overwrite an existing note unless it has the NEXUS ownership marker and matching `nexus_id`

### 6.3 Atomic Writes
- Use a temporary file plus atomic replace
- Preserve the old managed note if writing fails

### 6.4 Sanitization
- Sanitize filenames, wiki-link targets, YAML values, and Markdown content
- Guard against path traversal in generated paths

### 6.5 No Secret Export
- Never export secrets, environment variable values, access tokens, credentials, or private prompt content by default

---

## 7. Database Security

### 7.1 SQLite Configuration
- Enable foreign keys: `PRAGMA foreign_keys = ON`
- Use WAL mode for concurrency: `PRAGMA journal_mode = WAL`
- Set secure file permissions on DB file (Windows ACLs)

### 7.2 Migration Safety
- One Alembic migration per logical schema change
- Review generated scripts; do not trust autogenerate blindly
- Test upgrade from empty DB and from previous release DB
- Back up before migrations that may transform or remove data
- Avoid destructive migrations; prefer expand-and-contract

---

## 8. Frontend Security

### 8.1 No Secrets in Frontend
- Do not place secrets or private environment values in frontend state or logs
- API responses must not contain secrets

### 8.2 Input Validation
- Validate all user inputs on the backend
- Frontend validation is for UX only, not security

### 8.3 Content Security Policy
- Implement CSP headers for production builds
- Restrict inline scripts/styles where possible

---

## 9. Windows-Specific Considerations

### 9.1 Path Handling
- Use `pathlib.Path` for all path operations
- Handle long paths (`\\?\` prefix) where needed
- Case-insensitive comparisons on Windows

### 9.2 Process Management
- Use `psutil` for cross-platform process inspection
- On Windows: use `CREATE_NEW_PROCESS_GROUP` for clean termination
- Validate executable via `shutil.which()` or explicit path

### 9.3 Credential Storage
- Use Windows Credential Manager for optional GitHub tokens
- Never write secrets to `%LOCALAPPDATA%\NEXUS\`

### 9.4 File Permissions
- Set restrictive ACLs on runtime data directory
- Database, logs, backups: user-only read/write

---

## 10. Audit & Compliance

### 10.1 Activity Events
- Every meaningful state change creates an append-only event
- Events include: event type, resource ID, timestamp, actor, summary, redacted payload
- Events are immutable — corrections append new events

### 10.2 Security-Relevant Events
- `settings.updated` — config changes
- `skill.installed` / `skill.uninstalled` — supply chain actions
- `mcp.added` / `mcp.removed` — MCP configuration changes
- `application.started` / `application.stopped` — process control
- `filesystem.scan_started` — discovery actions
- `obsidian.sync_succeeded` / `obsidian.sync_failed` — data export

### 10.3 Log Retention
- Application logs: rotating, size-limited
- Activity events: permanent (append-only)
- Debug logs: opt-in, not default

---

## 11. Threat Model Summary

| Threat | Mitigation |
|--------|------------|
| Malicious website calls localhost API | Origin/Host validation + request token |
| Path traversal in uploads/installs | Canonicalization + root verification |
| Symlink/reparse escape | No follow by default; validate resolved path |
| Archive slip (zip slip) | Staging + path validation before move |
| PID reuse attack | Fingerprint (start time + exe + cwd) |
| Secret leakage | Redaction at source; never store values |
| Unauthorized process kill | PID validation + user confirmation |
| Config tampering | CLI-only mutations; verify after write |
| Supply chain compromise | Inspect before install; no script execution |
| Data exfiltration via Obsidian | Managed folder only; no secret export |
| DB corruption/migration loss | Backups + tested migrations + WAL mode |

---

## 12. Security Checklist for Each Phase

- [ ] No `shell=True` anywhere
- [ ] All paths validated on backend
- [ ] All external calls have timeouts
- [ ] No secrets in logs, events, DB, or API responses
- [ ] User confirmation for all mutations
- [ ] PID fingerprinting before process stop
- [ ] Quarantine before delete
- [ ] Staging + atomic move for installs
- [ ] Origin/Host validation on API
- [ ] Request token for state-changing requests
- [ ] CORS restricted to frontend origin
- [ ] Binding to 127.0.0.1 only