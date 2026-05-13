###############################################################################
#  ERP Platform – Démarrage frontend uniquement
#  Utile quand le backend est déjà lancé ou tourne via Docker.
#
#  Usage : .\start-frontend.ps1
###############################################################################

$ErrorActionPreference = "Stop"

$root     = Split-Path -Parent $MyInvocation.MyCommand.Path
$frontend = Join-Path $root "frontend"

$npmCmd = (Get-Command npm -ErrorAction SilentlyContinue).Source
if (-not $npmCmd) {
    $npmCmd = "npm"
}

Write-Host "`n==> Frontend Angular" -ForegroundColor Cyan

if (-not (Test-Path (Join-Path $frontend "node_modules"))) {
    Write-Host "  Installation des dépendances npm…" -ForegroundColor Yellow
    Push-Location $frontend
    npm install --legacy-peer-deps
    Pop-Location
}

Write-Host "  Démarrage sur http://localhost:4200`n" -ForegroundColor Green
Set-Location $frontend
& $npmCmd start -- --host 0.0.0.0 --port 4200
