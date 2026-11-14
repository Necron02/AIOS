<#
.SYNOPSIS
    Start NEXUS development servers (backend + frontend)
.DESCRIPTION
    V0.0 scaffold — NOT YET IMPLEMENTED.
    This script will start both FastAPI backend and Vite frontend in development mode.
.NOTES
    Phase: V0.1 (planned)
    Requirements: Python 3.11+, Node.js 18+, dependencies installed
#>

Write-Host "NEXUS Development Server" -ForegroundColor Cyan
Write-Host "=========================" -ForegroundColor Cyan
Write-Host ""
Write-Host "⚠️  NOT YET IMPLEMENTED — V0.1 scaffold" -ForegroundColor Yellow
Write-Host ""

# Planned implementation for V0.1:
# 1. Check prerequisites (Python, Node, dependencies)
# 2. Start backend: uvicorn nexus.main:app --reload --host 127.0.0.1 --port 8000
# 3. Start frontend: npm run dev (Vite on port 5173 with proxy)
# 4. Handle Ctrl+C to stop both processes

Write-Host "Planned commands for V0.1:" -ForegroundColor Gray
Write-Host "  Backend:  cd backend && uv run uvicorn nexus.main:app --reload --host 127.0.0.1 --port 8000" -ForegroundColor Gray
Write-Host "  Frontend: cd frontend && npm run dev" -ForegroundColor Gray
Write-Host ""
Write-Host "Data directory: $env:LOCALAPPDATA\NEXUS\" -ForegroundColor Gray