<#
.SYNOPSIS
    Run NEXUS test suite (backend + frontend)
.DESCRIPTION
    V0.1 implementation — runs all automated tests.
.NOTES
    Phase: V0.1
#>

Write-Host "NEXUS Test Suite" -ForegroundColor Cyan
Write-Host "================" -ForegroundColor Cyan
Write-Host ""

$allPassed = $true

# Backend tests
Write-Host "Running backend tests..." -ForegroundColor Gray
cd backend
$backendResult = uv run pytest -v 2>&1
$backendExit = $LASTEXITCODE
Write-Host $backendResult
if ($backendExit -ne 0) {
    Write-Host "Backend tests FAILED" -ForegroundColor Red
    $allPassed = $false
} else {
    Write-Host "Backend tests PASSED" -ForegroundColor Green
}
cd ..

Write-Host ""

# Frontend tests
Write-Host "Running frontend tests..." -ForegroundColor Gray
cd frontend
$frontendResult = npm run test -- --run 2>&1
$frontendExit = $LASTEXITCODE
Write-Host $frontendResult
if ($frontendExit -ne 0) {
    Write-Host "Frontend tests FAILED" -ForegroundColor Red
    $allPassed = $false
} else {
    Write-Host "Frontend tests PASSED" -ForegroundColor Green
}
cd ..

Write-Host ""
Write-Host "====================" -ForegroundColor Cyan
if ($allPassed) {
    Write-Host "ALL TESTS PASSED" -ForegroundColor Green
    exit 0
} else {
    Write-Host "SOME TESTS FAILED" -ForegroundColor Red
    exit 1
}