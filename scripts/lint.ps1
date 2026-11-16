<#
.SYNOPSIS
    Run NEXUS linting and formatting (backend + frontend)
.DESCRIPTION
    V0.1 implementation — runs all linting and formatting checks.
.NOTES
    Phase: V0.1
#>

Write-Host "NEXUS Lint & Format" -ForegroundColor Cyan
Write-Host "===================" -ForegroundColor Cyan
Write-Host ""

$allPassed = $true

# Backend lint
Write-Host "Running backend lint (ruff)..." -ForegroundColor Gray
cd backend
$ruffCheck = uv run ruff check . 2>&1
$ruffCheckExit = $LASTEXITCODE
Write-Host $ruffCheck
if ($ruffCheckExit -ne 0) {
    Write-Host "Ruff check FAILED" -ForegroundColor Red
    $allPassed = $false
} else {
    Write-Host "Ruff check PASSED" -ForegroundColor Green
}

Write-Host ""
Write-Host "Running backend format check (ruff format)..." -ForegroundColor Gray
$ruffFormat = uv run ruff format --check . 2>&1
$ruffFormatExit = $LASTEXITCODE
Write-Host $ruffFormat
if ($ruffFormatExit -ne 0) {
    Write-Host "Ruff format check FAILED" -ForegroundColor Red
    $allPassed = $false
} else {
    Write-Host "Ruff format check PASSED" -ForegroundColor Green
}

Write-Host ""
Write-Host "Running backend type check (mypy)..." -ForegroundColor Gray
$mypyResult = uv run mypy . 2>&1
$mypyExit = $LASTEXITCODE
Write-Host $mypyResult
if ($mypyExit -ne 0) {
    Write-Host "Mypy type check FAILED" -ForegroundColor Red
    $allPassed = $false
} else {
    Write-Host "Mypy type check PASSED" -ForegroundColor Green
}
cd ..

Write-Host ""
Write-Host "----------------------------------------" -ForegroundColor Gray
Write-Host ""

# Frontend lint
Write-Host "Running frontend lint (eslint)..." -ForegroundColor Gray
cd frontend
$eslintResult = npm run lint 2>&1
$eslintExit = $LASTEXITCODE
Write-Host $eslintResult
if ($eslintExit -ne 0) {
    Write-Host "ESLint FAILED" -ForegroundColor Red
    $allPassed = $false
} else {
    Write-Host "ESLint PASSED" -ForegroundColor Green
}

Write-Host ""
Write-Host "Running frontend format check (prettier)..." -ForegroundColor Gray
$prettierResult = npm run format -- --check 2>&1
$prettierExit = $LASTEXITCODE
Write-Host $prettierResult
if ($prettierExit -ne 0) {
    Write-Host "Prettier format check FAILED" -ForegroundColor Red
    $allPassed = $false
} else {
    Write-Host "Prettier format check PASSED" -ForegroundColor Green
}

Write-Host ""
Write-Host "Running frontend type check (tsc)..." -ForegroundColor Gray
$tscResult = npm run typecheck 2>&1
$tscExit = $LASTEXITCODE
Write-Host $tscResult
if ($tscExit -ne 0) {
    Write-Host "TypeScript type check FAILED" -ForegroundColor Red
    $allPassed = $false
} else {
    Write-Host "TypeScript type check PASSED" -ForegroundColor Green
}
cd ..

Write-Host ""
Write-Host "====================" -ForegroundColor Cyan
if ($allPassed) {
    Write-Host "ALL LINT CHECKS PASSED" -ForegroundColor Green
    exit 0
} else {
    Write-Host "SOME LINT CHECKS FAILED" -ForegroundColor Red
    exit 1
}