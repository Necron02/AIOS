# NEXUS Windows Notes

**Status:** Planning baseline — revise only when implementation evidence requires it  
**Version:** V0.0 scaffold

---

## 1. Path Handling

### 1.1 Pathlib Throughout
- Use `pathlib.Path` for all path operations — never string concatenation
- `Path.resolve()` normalizes `..`, symlinks (if followed), and returns absolute path
- On Windows, `resolve()` does **not** expand `\\?\` long-path prefix automatically

### 1.2 Long Paths (>260 chars)
- Windows 10/11 supports long paths if enabled (Group Policy or registry)
- Use `\\?\` prefix for paths exceeding 260 characters: `Path(r"\\?\C:\very\long\path")`
- Python 3.6+ handles this transparently in most `pathlib` operations
- Test with paths > 260 chars in integration tests

### 1.3 Case Sensitivity
- Windows filesystem is **case-insensitive but case-preserving**
- Comparisons: use `.lower()` or `str.casefold()` for equality checks
- Store paths in original case for display; normalize for comparison

### 1.4 Path Separators
- `Path` handles `/` and `\` correctly
- Use `/` operator: `Path("C:/Users") / "name"` — works cross-platform
- Avoid `os.path.join`; prefer `Path` methods

### 1.5 UNC Paths
- Support network paths: `\\server\share\path`
- `Path("\\\\server\\share\\path")` works with `pathlib`
- Validate accessibility before scanning

---

## 2. Runtime Data Location

### 2.1 Standard Location
```
%LOCALAPPDATA%\NEXUS\
├── nexus.db              # SQLite database
├── nexus.db-wal          # WAL file
├── nexus.db-shm          # SHM file
├── logs/
│   └── nexus.log         # Application logs (rotating)
├── backups/
│   └── *.bak             # Backup archives
├── quarantine/
│   └── ...               # Uninstalled skills, removed files
├── skills-backup/
│   └── ...               # Skill rollback backups
└── config.json           # Local settings (non-secret)
```

### 2.2 Accessing in Code
```python
import os
from pathlib import Path

def get_data_dir() -> Path:
    # Allow override via env for testing/portability
    override = os.environ.get("NEXUS_DATA_DIR")
    if override:
        return Path(override).expanduser().resolve()
    return Path(os.environ["LOCALAPPDATA"]) / "NEXUS"
```

### 2.3 Directory Creation
- Create on first run with appropriate permissions
- Use `mkdir(parents=True, exist_ok=True)`
- Set restrictive ACLs if possible (user-only)

---

## 3. Claude Code Configuration Discovery

### 3.1 Standard Locations
| Scope | Path |
|-------|------|
| User (global) | `%USERPROFILE%\.claude\` |
| User (custom) | `%CLAUDE_CONFIG_DIR%` (if set) |
| Project | `<project-root>\.claude\` |
| Project (local) | `<project-root>\.claude\settings.local.json` |

### 3.2 Discovery Logic
```python
def find_claude_config_dirs() -> list[Path]:
    dirs = []
    
    # 1. CLAUDE_CONFIG_DIR override (highest priority)
    if config_dir := os.environ.get("CLAUDE_CONFIG_DIR"):
        dirs.append(Path(config_dir).expanduser().resolve())
    
    # 2. Default user config
    default_user = Path.home() / ".claude"
    if default_user.exists():
        dirs.append(default_user)
    
    return dirs
```

### 3.3 Settings Files to Inventory
- `settings.json` — user settings
- `settings.local.json` — machine-specific settings
- `skills/` — directory of installed skills
- `agents/` — custom agents
- `commands/` — custom slash commands
- `mcp.json` — MCP server configuration (project scope)

### 3.4 Respecting `CLAUDE_CONFIG_DIR`
- If set, **only** use that directory for user-level config
- Do not fall back to `~/.claude` when `CLAUDE_CONFIG_DIR` is explicitly set
- Document this behavior for users

---

## 4. Terminal / Console Launch

### 4.1 Launching Claude Code Interactively
- Use `subprocess.Popen` with argument array, `shell=False`
- On Windows, open in new console window:
  ```python
  subprocess.Popen(
      ["claude", "--some-flag"],
      cwd=project_dir,
      creationflags=subprocess.CREATE_NEW_CONSOLE
  )
  ```
- For "print" mode (non-interactive), capture stdout/stderr

### 4.2 Detecting `claude` Executable
```python
import shutil

def find_claude_executable() -> Path | None:
    # 1. Check user override
    if override := os.environ.get("CLAUDE_EXECUTABLE_PATH"):
        p = Path(override).expanduser().resolve()
        if p.exists():
            return p
    
    # 2. Check PATH
    if found := shutil.which("claude"):
        return Path(found).resolve()
    
    # 3. Common install locations (Windows)
    for candidate in [
        Path(os.environ["LOCALAPPDATA"]) / "Programs" / "Claude" / "claude.exe",
        Path(os.environ["PROGRAMFILES"]) / "Claude" / "claude.exe",
        Path(os.environ["PROGRAMFILES(X86)"]) / "Claude" / "claude.exe",
    ]:
        if candidate.exists():
            return candidate
    
    return None
```

### 4.3 CLI Version Verification
- Run `claude --version` on startup
- Parse version; warn if below minimum supported
- Cache flags/commands per version (CLI flags can evolve)

---

## 5. Process Management on Windows

### 5.1 PID + Fingerprint Validation
```python
import psutil

def validate_process(pid: int, fingerprint: dict) -> bool:
    try:
        proc = psutil.Process(pid)
        # Check creation time (boot-relative on Windows)
        if proc.create_time() != fingerprint["create_time"]:
            return False
        # Check executable path (case-insensitive)
        if proc.exe().lower() != fingerprint["exe"].lower():
            return False
        # Check working directory
        if proc.cwd().lower() != fingerprint["cwd"].lower():
            return False
        return True
    except (psutil.NoSuchProcess, psutil.AccessDenied):
        return False
```

### 5.2 Graceful Termination
```python
def stop_process_gracefully(pid: int, timeout: float = 10.0) -> bool:
    try:
        proc = psutil.Process(pid)
        # Windows: CTRL_BREAK_EVENT to process group
        proc.send_signal(signal.CTRL_BREAK_EVENT)
        proc.wait(timeout=timeout)
        return True
    except (psutil.NoSuchProcess, psutil.TimeoutExpired):
        return False

def force_stop_process(pid: int) -> bool:
    try:
        proc = psutil.Process(pid)
        proc.kill()  # TerminateProcess on Windows
        return True
    except psutil.NoSuchProcess:
        return False
```

### 5.3 Process Groups
- Use `creationflags=subprocess.CREATE_NEW_PROCESS_GROUP` when launching
- Allows sending `CTRL_BREAK_EVENT` to the entire tree
- For apps that spawn children, document that tree may differ

---

## 6. Filesystem Scanning Considerations

### 6.1 Default Exclusions (Windows)
```python
DEFAULT_EXCLUSIONS = {
    # Version control
    ".git/objects",
    ".git/refs",
    # Node.js
    "node_modules",
    ".pnp",
    ".pnp.js",
    # Python
    ".venv",
    "venv",
    "__pycache__",
    "*.pyc",
    ".pytest_cache",
    ".mypy_cache",
    ".ruff_cache",
    # Build outputs
    "dist",
    "build",
    "out",
    ".next",
    ".nuxt",
    "target",
    # IDE
    ".vs",
    ".idea",
    ".vscode",
    # Cache/temp
    ".cache",
    "tmp",
    "temp",
    "*.tmp",
    "*.log",
    # OS
    "Thumbs.db",
    "Desktop.ini",
    "$RECYCLE.BIN",
    "System Volume Information",
}
```

### 6.2 Reparse Points / Symlinks
- **Do not follow** by default
- Use `os.path.islink()` / `path.is_symlink()` to detect
- On Windows: check for reparse points via `win32file` if needed
- User can opt-in per root

### 6.3 Permissions & Access Errors
- Handle `PermissionError` gracefully — log and continue
- Some directories (System Volume Information) are inaccessible
- Record errors in `scan_runs.errors_json` for review

---

## 7. Testing with Windows Paths

### 7.1 Required Test Cases
| Test Case | Description |
|-----------|-------------|
| Path with spaces | `C:\Users\My Documents\Project` |
| Unicode path | `C:\Users\用户\项目` |
| Long path (>260) | `C:\very\long\...` |
| UNC path | `\\server\share\project` |
| Drive root | `C:\` |
| Relative path resolution | `..\..\project` |
| Symlink to outside root | Should be rejected |
| Junction point | Windows directory junction |
| Case variations | `Project` vs `project` vs `PROJECT` |

### 7.2 Temporary Directories in Tests
```python
import tempfile
from pathlib import Path

def test_with_temp_dir():
    with tempfile.TemporaryDirectory() as tmp:
        base = Path(tmp)
        # Create test structure
        (base / "Project With Spaces").mkdir()
        (base / "プロジェクト").mkdir()
        # Test path handling
```

---

## 8. Environment Variables

### 8.1 NEXUS-Specific
| Variable | Purpose | Default |
|----------|---------|---------|
| `NEXUS_DATA_DIR` | Override data directory | `%LOCALAPPDATA%\NEXUS` |
| `NEXUS_DB_PATH` | Override DB path | `<data_dir>\nexus.db` |
| `NEXUS_LOG_LEVEL` | Log level | `INFO` |
| `CLAUDE_EXECUTABLE_PATH` | Override claude path | Auto-detect |
| `CLAUDE_CONFIG_DIR` | Override Claude config | Respect if set |
| `OBSIDIAN_VAULT_PATH` | Vault location | User-configured |
| `GITHUB_TOKEN` | GitHub API token | Optional, from Credential Manager |

### 8.2 Reading in Code
```python
import os

def get_env(key: str, default: str = "") -> str:
    return os.environ.get(key, default)
```

---

## 9. Packaging Considerations (Future)

### 9.1 Single-Folder Distribution
- PyInstaller or similar for backend
- Frontend built to static files, served by FastAPI
- Launcher script starts both processes

### 9.2 Installer (Future)
- NSIS or WiX for Windows installer
- Creates `%LOCALAPPDATA%\NEXUS\` with ACLs
- Registers uninstaller
- Start Menu shortcut

### 9.3 Auto-Update (Future)
- Check GitHub releases
- Download and verify signature
- Backup before update
- Rollback on failure

---

## 10. Common Pitfalls to Avoid

| Pitfall | Solution |
|---------|----------|
| String path concatenation | Use `pathlib.Path` exclusively |
| Assuming forward slashes fail | `Path` handles both; use `/` operator |
| Ignoring `CLAUDE_CONFIG_DIR` | Check env var first |
| Following symlinks by default | Opt-in only |
| `shell=True` in subprocess | Always `shell=False`, argument arrays |
| PID reuse not detected | Fingerprint: create_time + exe + cwd |
| Killing by port | Never; validate ownership first |
| Secrets in `.env` committed | `.gitignore` + `.env.example` only |
| Hardcoded `C:\Users` | Use `Path.home()` or `os.environ["USERPROFILE"]` |
| Case-sensitive comparisons | Use `.lower()` or `.casefold()` on Windows |

---

## 11. References

- [Python pathlib docs](https://docs.python.org/3/library/pathlib.html)
- [psutil docs](https://psutil.readthedocs.io/)
- [Windows long paths](https://learn.microsoft.com/en-us/windows/win32/fileio/maximum-file-path-limitation)
- [Claude Code Windows setup](https://code.claude.com/docs/en/setup)
- [Windows Credential Manager](https://learn.microsoft.com/en-us/windows/security/identity-protection/credential-manager/credential-manager)