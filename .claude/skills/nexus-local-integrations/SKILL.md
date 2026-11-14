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