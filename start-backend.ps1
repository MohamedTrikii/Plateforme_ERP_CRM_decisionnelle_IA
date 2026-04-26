###############################################################################
#  ERP Platform – Démarrage backend uniquement
#  Lance PostgreSQL check + auth-service + core-service + api-gateway + ai-service
#
#  Usage : .\start-backend.ps1
###############################################################################

$ErrorActionPreference = "Stop"

$root    = Split-Path -Parent $MyInvocation.MyCommand.Path
$backend = Join-Path $root "backend"
$aiSvc   = Join-Path $root "ai-service"

function Write-Title ($msg) { Write-Host "`n==> $msg" -ForegroundColor Cyan }
function Write-Ok    ($msg) { Write-Host "  [OK]  $msg" -ForegroundColor Green }
function Write-Fail  ($msg) { Write-Host "  [ERR] $msg" -ForegroundColor Red }

# ─── Charger .env ────────────────────────────────────────────────────────────
$envFile = Join-Path $root ".env"
if (Test-Path $envFile) {
    Get-Content $envFile | Where-Object { $_ -match "^\s*[^#]" } | ForEach-Object {
        $kv = $_ -split "=", 2
        if ($kv.Length -eq 2) {
            [System.Environment]::SetEnvironmentVariable($kv[0].Trim(), $kv[1].Trim(), "Process")
        }
    }
    Write-Ok ".env chargé."
} else {
    Write-Fail ".env introuvable – lancez d'abord start.ps1 pour le créer."
    exit 1
}

# ─── Vérification PostgreSQL ─────────────────────────────────────────────────
Write-Title "Vérification PostgreSQL"
try {
    $null = & psql -U $env:POSTGRES_USER -c "\l" 2>&1
    Write-Ok "PostgreSQL accessible."
} catch {
    Write-Host "  PostgreSQL inaccessible – vérifiez qu'il tourne sur le port 5432." -ForegroundColor Yellow
}

# ─── Build Maven ─────────────────────────────────────────────────────────────
Write-Title "Compilation Maven"
Push-Location $backend
mvn clean package -DskipTests -q
Write-Ok "Build terminé."
Pop-Location

# ─── Démarrage des microservices ─────────────────────────────────────────────
Write-Title "Lancement des microservices Spring Boot"

foreach ($svc in @(
    @{ Name = "auth-service (8081)"; Dir = "auth-service" },
    @{ Name = "core-service (8082)"; Dir = "core-service" },
    @{ Name = "api-gateway  (8080)"; Dir = "api-gateway"  }
)) {
    $dir = Join-Path $backend $svc.Dir
    Write-Ok "Démarrage $($svc.Name)…"
    Start-Process powershell.exe `
        -ArgumentList "-NoExit", "-Command",
        "cd '$dir'; `$Host.UI.RawUI.WindowTitle = '$($svc.Name)'; mvn spring-boot:run"
    Start-Sleep -Seconds 1
}

# ─── ai-service ──────────────────────────────────────────────────────────────
Write-Title "Lancement du service IA"
$venv    = Join-Path $aiSvc ".venv"
$pip     = Join-Path $venv "Scripts\pip.exe"
$uvicorn = Join-Path $venv "Scripts\uvicorn.exe"

if (-not (Test-Path $venv)) {
    python -m venv $venv
    & $pip install -r (Join-Path $aiSvc "requirements.txt") -q
}

Start-Process powershell.exe `
    -ArgumentList "-NoExit", "-Command",
    "cd '$aiSvc'; `$Host.UI.RawUI.WindowTitle = 'ai-service (8000)'; & '$uvicorn' main:app --host 0.0.0.0 --port 8000 --reload"

Write-Host ""
Write-Host "  Services backend démarrés :" -ForegroundColor White
Write-Host "  API Gateway  -> http://localhost:8080/api/v1" -ForegroundColor Cyan
Write-Host "  auth-service -> http://localhost:8081/actuator/health" -ForegroundColor Cyan
Write-Host "  core-service -> http://localhost:8082/actuator/health" -ForegroundColor Cyan
Write-Host "  ai-service   -> http://localhost:8000/docs" -ForegroundColor Cyan
