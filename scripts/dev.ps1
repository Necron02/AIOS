<#
.SYNOPSIS
    Start NEXUS development servers (backend + frontend)
.DESCRIPTION
    V0.1 implementation — starts FastAPI backend and Vite frontend in development mode.
    Opens two separate PowerShell windows for clear log separation.
.NOTES
    Phase: V0.1
    Requirements: Python 3.11+, Node.js 18+, dependencies installed
#>

param(
    [switch]$NoNewWindow = $false
)

Write-Host "NEXUS Development Server" -ForegroundColor Cyan
Write-Host "=========================" -ForegroundColor Cyan
Write-Host ""

# Check prerequisites
Write-Host "Checking prerequisites..." -ForegroundColor Gray

$pythonOk = $false
$nodeOk = $false
$uvOk = $false

try {
    $pythonVersion = python --version 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  Python: $pythonVersion" -ForegroundColor Green
        $pythonOk = $true
    }
} catch {
    Write-Host "  Python: NOT FOUND" -ForegroundColor Red
}

try {
    $nodeVersion = node --version 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  Node.js: $nodeVersion" -ForegroundColor Green
        $nodeOk = $true
    }
} catch {
    Write-Host "  Node.js: NOT FOUND" -ForegroundColor Red
}

try {
    $uvVersion = uv --version 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  uv: $uvVersion" -ForegroundColor Green
        $uvOk = $true
    }
} catch {
    Write-Host "  uv: NOT FOUND (will use pip)" -ForegroundColor Yellow
}

if (-not $pythonOk -or -not $nodeOk) {
    Write-Host ""
    Write-Host "Missing prerequisites. Please install Python 3.11+ and Node.js 18+" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Ensure backend dependencies
Write-Host "Installing/updating backend dependencies..." -ForegroundColor Gray
cd backend
if ($uvOk) {
    uv sync --frozen 2>&1 | Out-Null
} else {
    pip install -e . 2>&1 | Out-Null
}
if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to install backend dependencies" -ForegroundColor Red
    exit 1
}
cd ..

# Ensure frontend dependencies
Write-Host "Installing/updating frontend dependencies..." -ForegroundColor Gray
cd frontend
npm ci 2>&1 | Out-Null
if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to install frontend dependencies" -ForegroundColor Red
    exit 1
}
cd ..

Write-Host ""
Write-Host "Starting development servers..." -ForegroundColor Green
Write-Host ""

# Data directory
$dataDir = [Environment]::ExpandEnvironmentVariables("%LOCALAPPDATA%\NEXUS")
if (-not (Test-Path $dataDir)) {
    New-Item -ItemType Directory -Path $dataDir -Force | Out-Null
}
Write-Host "Data directory: $dataDir" -ForegroundColor Gray

$backendScript = {
    cd backend
    Write-Host "=== BACKEND (FastAPI) ===" -ForegroundColor Cyan
    Write-Host "Starting on http://127.0.0.1:8000" -ForegroundColor Gray
    Write-Host "API docs: http://127.0.0.1:8000/docs" -ForegroundColor Gray
    Write-Host ""
    $env:PYTHONPATH = "src"
    uv run uvicorn nexus.main:app --reload --host 127.0.0.1 --port 8000 --log-level info
}

$frontendScript = {
    cd frontend
    Write-Host "=== FRONTEND (Vite) ===" -ForegroundColor Cyan
    Write-Host "Starting on http://127.0.0.1:5173" -ForegroundColor Gray
    Write-Host "Proxy: /api -> http://127.0.0.1:8000" -ForegroundColor Gray
    Write-Host ""
    npm run dev
}

if ($NoNewWindow) {
    # Run in background jobs (same window)
    Write-Host "Running in current window (use Ctrl+C to stop both)..." -ForegroundColor Yellow
    Write-Host ""

    $backendJob = Start-Job -ScriptBlock $backendScript
    $frontendJob = Start-Job -ScriptBlock $frontendScript

    try {
        # Wait for both jobs
        Wait-Job $backendJob, $frontendJob -Timeout 1 -ErrorAction SilentlyContinue
        while ($true) {
            Start-Sleep -Seconds 1
        }
    } finally {
        Stop-Job $backendJob, $frontendJob -ErrorAction SilentlyContinue
        Remove-Job $backendJob, $frontendJob -ErrorAction SilentlyContinue
    }
} else {
    # Open in separate windows
    Write-Host "Opening separate PowerShell windows for backend and frontend..." -ForegroundColor Gray

    $backendCmd = "cd '" + (Resolve-Path backend).Path + "'; $env:PYTHONPATH='src'; uv run uvicorn nexus.main:app --reload --host 127.0.0.1 --port 8000 --log-level info"
    $frontendCmd = "cd '" + (Resolve-Path frontend).Path + "'; npm run dev"

    Start-Process powershell.exe -ArgumentList "-NoExit", "-Command", $backendCmd
    Start-Process powershell.exe -ArgumentList "-NoExit", "-Command", $frontendCmd

    Write-Host ""
    Write-Host "Backend and frontend started in separate windows." -ForegroundColor Green
    Write-Host "Press any key to exit this launcher..." -ForegroundColor Gray
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
}