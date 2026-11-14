<#
.SYNOPSIS
    Backup NEXUS runtime data (database, settings, optional Obsidian data)
.DESCRIPTION
    V0.0 scaffold — NOT YET IMPLEMENTED.
    This script will create a backup archive of runtime data.
.NOTES
    Phase: V1.0 (planned)
    NEVER includes secrets, tokens, or credentials
#>

Write-Host "NEXUS Backup" -ForegroundColor Cyan
Write-Host "============" -ForegroundColor Cyan
Write-Host ""
Write-Host "⚠️  NOT YET IMPLEMENTED — V1.0 scaffold" -ForegroundColor Yellow
Write-Host ""

$backupDir = "$env:LOCALAPPDATA\NEXUS\backups"
$dataDir = "$env:LOCALAPPDATA\NEXUS"
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$backupName = "nexus-backup-$timestamp.zip"

Write-Host "Planned backup contents for V1.0:" -ForegroundColor Gray
Write-Host "  - $dataDir\nexus.db (SQLite database)" -ForegroundColor Gray
Write-Host "  - $dataDir\config.json (local settings)" -ForegroundColor Gray
Write-Host "  - $dataDir\logs\*.log (application logs, optional)" -ForegroundColor Gray
Write-Host "  - NEXUS-owned Obsidian data (optional, user-enabled)" -ForegroundColor Gray
Write-Host ""
Write-Host "Excluded (NEVER backed up):" -ForegroundColor Red
Write-Host "  - GitHub tokens, API keys, MCP secrets" -ForegroundColor Red
Write-Host "  - .env files" -ForegroundColor Red
Write-Host "  - Full process environment dumps" -ForegroundColor Red
Write-Host ""
Write-Host "Output: $backupDir\$backupName" -ForegroundColor Gray