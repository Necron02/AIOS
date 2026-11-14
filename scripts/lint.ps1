<#
.SYNOPSIS
    Run NEXUS linting and formatting (backend + frontend)
.DESCRIPTION
    V0.0 scaffold — NOT YET IMPLEMENTED.
    This script will run all linting and formatting checks.
.NOTES
    Phase: V0.1 (planned)
#>

Write-Host "NEXUS Lint & Format" -ForegroundColor Cyan
Write-Host "===================" -ForegroundColor Cyan
Write-Host ""
Write-Host "⚠️  NOT YET IMPLEMENTED — V0.1 scaffold" -ForegroundColor Yellow
Write-Host ""

Write-Host "Planned commands for V0.1:" -ForegroundColor Gray
Write-Host "  Backend:  cd backend && uv run ruff check . && uv run ruff format --check . && uv run mypy ." -ForegroundColor Gray
Write-Host "  Frontend: cd frontend && npm run lint && npm run format --check && npm run typecheck" -ForegroundColor Gray