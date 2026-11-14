# NEXUS User Guide

**Status:** Planned — functionality does not exist yet  
**Version:** V0.0 scaffold

> ⚠️ **This guide describes planned functionality.** None of the features below are implemented in V0.0. This document will be updated as each version is delivered.

---

## 1. Getting Started (V0.1+)

### 1.1 Prerequisites
- Windows 11
- Python 3.11+
- Node.js 18+
- Git
- Claude Code CLI (`claude` in PATH)

### 1.2 Installation (Planned)
```powershell
# Clone repository
git clone <repo-url> NEXUS
cd NEXUS

# Run development setup (V0.1+)
.\scripts\dev.ps1
```

### 1.3 First Run
1. Backend starts on `http://127.0.0.1:8000`
2. Frontend starts on `http://127.0.0.1:5173`
3. Open frontend URL in browser
4. Configure data directory (defaults to `%LOCALAPPDATA%\NEXUS\`)
5. Optional: Configure Obsidian vault path
6. Optional: Configure GitHub token for higher API limits

---

## 2. Dashboard (V0.2+)

The dashboard shows live counts from the database:
- Projects, repositories, skills, MCP servers, applications
- Running applications
- Recent activity events
- Failed health checks
- Stale scans
- Items needing attention

---

## 3. Project Manager (V0.2+)

### 3.1 Register a Project
1. Click "Add Project"
2. Select or enter an existing directory
3. Fill in: name, description, category, tags, notes
4. Optional: Link to GitHub repository
5. Save — creates activity event

### 3.2 Project Details
View canonical path, Git state (branch, dirty), discovered skills, MCP associations, linked applications, technologies detected.

### 3.3 Launch Claude Code
Click "Open in Claude" to launch a terminal with `claude` in the project directory.

---

## 4. GitHub Repository Library (V0.3+)

### 4.1 Add a Repository
1. Click "Add Repository"
2. Paste a public GitHub HTTPS URL
3. NEXUS fetches: metadata, README, languages, topics, license
4. Assign categories, tags, status, notes
5. Link to projects, skills, applications

### 4.2 Repository Statuses
- **Saved** — Bookmarked for later
- **To Explore** — Planning to investigate
- **Installed** — Cloned locally
- **Currently Using** — Active development
- **Archived** — No longer active

### 4.3 Refresh
Click "Refresh" to re-fetch metadata from GitHub (preserves local notes/links).

---

## 5. System Explorer (V0.4+)

### 5.1 Scan Roots
Add directories to scan. NEXUS discovers:
- Claude Code settings files
- Skill directories (global + project)
- Agent directories
- Command directories
- Plugin locations
- MCP config sources
- Project roots
- Git repositories

### 5.2 Read-Only Inventory
View exact path, existence, last modified, last scanned, provenance (discovered/manual/system). Unknown locations show "not inspected".

---

## 6. Skills Manager (V0.5+)

### 6.1 Preview
Click any skill to view `SKILL.md` content, frontmatter, source, hash — **before** installing.

### 6.2 Install
1. Select skill → "Install"
2. Choose target: global or project skill directory
3. Review staged files
4. Confirm → atomic install with backup

### 6.3 Update
1. Select installed skill → "Update"
2. Review diff of proposed changes
3. Confirm → backup → atomic replace

### 6.4 Uninstall
1. Select skill → "Uninstall"
2. Moves to quarantine (`%LOCALAPPDATA%\NEXUS\quarantine\`)
3. Activity event recorded
4. Rollback available from quarantine

---

## 7. MCP Manager (V0.6+)

### 7.1 Inventory
View all MCP servers across scopes:
- User (global)
- Project (`.mcp.json`)
- Local (where supported)

### 7.2 Details
Name, transport, command/args or URL, environment variable **names only**, scope, config source, status.

### 7.3 Status Values
- **Configured** — In config, not verified
- **Healthy** — Connection reported healthy
- **Needs Auth** — Requires authentication
- **Failed** — Connection failed
- **Not Checked** — Never verified

### 7.4 Add/Remove
Uses `claude mcp add/remove` CLI commands with review dialog. Verifies result by re-reading config.

---

## 8. Application Manager (V0.7+)

### 8.1 Register an Application
- Working directory
- Executable (path or command)
- Arguments (array, not shell string)
- Environment variable references
- Kind: web / desktop / service
- URL (for web apps)
- Health check config (HTTP/TCP, endpoint, interval, timeout)

### 8.2 Process Control
- **Start** — Spawns process, records PID + fingerprint
- **Stop** — Graceful (SIGTERM) → force after timeout
- **Restart** — Stop + start
- **Health** — HTTP/TCP checks; shows check type
- **Open URL** — Opens web app in default browser

### 8.3 Safety
- Only controls NEXUS-launched processes (or user-confirmed external)
- PID + fingerprint validation before stop
- Never kills by port alone
- Reconciles on NEXUS restart

---

## 9. Activity Timeline (V0.8+)

Chronological log of all meaningful events:
- Filter by type, resource, date range
- Searchable
- Shows actor (user/system/cli/sync), summary, payload
- Immutable — corrections append new events

---

## 10. Obsidian Sync (V0.8+)

### 10.1 Configuration
Set vault path in Settings. NEXUS validates accessibility.

### 10.2 Vault Structure
```
NEXUS/
├── Dashboard.md
├── Projects/<slug>.md
├── Repositories/<owner>-<repo>.md
├── Skills/<slug>.md
├── MCP/<slug>.md
├── Applications/<slug>.md
├── Categories/<slug>.md
├── Activity/YYYY/MM/YYYY-MM-DD.md
├── Templates/
└── Attachments/
```

### 10.3 Features
- YAML frontmatter with `nexus_id`, `nexus_type`, `managed_by: NEXUS`
- Wiki links between notes: `[[Projects/my-project]]`
- Dry-run, pause, retry, last-sync status
- Never overwrites unmanaged notes
- Idempotent retries (event UUID deduplication)

---

## 11. Customization (V0.9+)

### 11.1 Categories & Tags
Create, edit, reorder, color-code categories. Tags are free-form.

### 11.2 Custom Resource Types
Define new resource types beyond built-ins (project, repository, skill, mcp, application).

### 11.3 Custom Fields
Per resource type: string, number, boolean, select, multiselect, date fields.

### 11.4 Relationships
Link resources with typed relations: `uses`, `derived_from`, `installed_from`, `belongs_to`, `documented_by`.

### 11.5 Prompt Templates
Reusable templates with variables. Render → preview → launch Claude with prompt.

---

## 12. Settings (V0.1+)

- Vault path
- Scan roots
- Claude executable override
- Sync toggle
- Log level
- GitHub token (stored in Windows Credential Manager)

---

## 13. Backup & Restore (V1.0+)

### 13.1 Backup
Creates archive with:
- SQLite database
- Application settings
- NEXUS-owned Obsidian data (optional)
- **Never** includes secrets

### 13.2 Restore
Documented procedure to restore on clean machine.

---

## 14. Troubleshooting (Planned)

| Issue | Resolution |
|-------|------------|
| Backend won't start | Check port 8000 free, Python 3.11+, `%LOCALAPPDATA%\NEXUS\` writable |
| Frontend won't start | Check port 5173 free, Node 18+, run `npm install` |
| Claude not found | Install Claude Code CLI, ensure in PATH, or set `CLAUDE_EXECUTABLE_PATH` |
| Scan fails | Check permissions, exclusions, path validity |
| Sync fails | Verify vault path, permissions, disk space |
| DB migration fails | Restore from backup, check Alembic logs |

---

## 15. Keyboard Shortcuts (Planned)

| Shortcut | Action |
|----------|--------|
| `Ctrl+K` | Global search |
| `Ctrl+N` | New project/repository/skill |
| `Ctrl+Shift+P` | Command palette |
| `Esc` | Close dialog/sidebar |
| `?` | Show help |

---

## 16. Data Location

| Data | Location |
|------|----------|
| Database | `%LOCALAPPDATA%\NEXUS\nexus.db` |
| Logs | `%LOCALAPPDATA%\NEXUS\logs\` |
| Backups | `%LOCALAPPDATA%\NEXUS\backups\` |
| Quarantine | `%LOCALAPPDATA%\NEXUS\quarantine\` |
| Skill backups | `%LOCALAPPDATA%\NEXUS\skills-backup\` |
| Config | `%LOCALAPPDATA%\NEXUS\config.json` |

---

## 17. Privacy & Security

- **Local-first** — no data leaves your machine unless you use GitHub API or remote MCP
- **No secrets stored** — only env var names; values read from your environment
- **Audit trail** — every change logged in activity events
- **You control** — scan roots, install targets, process control, sync

---

## 18. Support & Feedback

- GitHub Issues: [repository]/issues
- Documentation: This guide + `docs/` folder
- Architecture: `docs/ARCHITECTURE.md`
- Security: `docs/SECURITY_MODEL.md`

---

*This guide will be expanded as features are implemented. Check `docs/DEVELOPMENT_ROADMAP.md` for current version status.*