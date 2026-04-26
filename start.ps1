###############################################################################
#  ERP Platform – Script de démarrage (développement)
#  Lance : auth-service (8081) · core-service (8082) · api-gateway (8080)
#           ai-service (8000)   · frontend Angular    (4200)
#
#  Usage : .\start.ps1
#  Prérequis : Java 21+, Maven 3.9+, Node 20+, Python 3.12+, PostgreSQL
###############################################################################

$ErrorActionPreference = "Stop"

# ─── Couleurs ────────────────────────────────────────────────────────────────
function Write-Title  ($msg) { Write-Host "`n==> $msg" -ForegroundColor Cyan }
function Write-Ok     ($msg) { Write-Host "  [OK]  $msg" -ForegroundColor Green }
function Write-Warn   ($msg) { Write-Host "  [!!]  $msg" -ForegroundColor Yellow }
function Write-Fail   ($msg) { Write-Host "  [ERR] $msg" -ForegroundColor Red }

# ─── Répertoires de base ─────────────────────────────────────────────────────
$root      = Split-Path -Parent $MyInvocation.MyCommand.Path
$backend   = Join-Path $root "backend"
$aiSvc     = Join-Path $root "ai-service"
$frontend  = Join-Path $root "frontend\erp-frontend"

# ─── Vérification des outils ─────────────────────────────────────────────────
Write-Title "Vérification des prérequis"

foreach ($tool in @("java","mvn","node","npm","python")) {
    if (Get-Command $tool -ErrorAction SilentlyContinue) {
        Write-Ok "$tool trouvé  ($(& $tool --version 2>&1 | Select-Object -First 1))"
    } else {
        Write-Fail "$tool introuvable – installez-le puis relancez le script."
        exit 1
    }
}

# ─── Fichier .env ─────────────────────────────────────────────────────────────
$envFile = Join-Path $root ".env"
if (-not (Test-Path $envFile)) {
    Write-Warn ".env introuvable – copie de .env.example"
    Copy-Item (Join-Path $root ".env.example") $envFile
    Write-Warn "Éditez $envFile et renseignez JWT_SECRET avant de continuer."
    Start-Process notepad.exe $envFile
    Read-Host "Appuyez sur Entrée une fois .env configuré"
}

# Charger les variables d'environnement depuis .env
Get-Content $envFile | Where-Object { $_ -match "^\s*[^#]" } | ForEach-Object {
    $kv = $_ -split "=", 2
    if ($kv.Length -eq 2) {
        [System.Environment]::SetEnvironmentVariable($kv[0].Trim(), $kv[1].Trim(), "Process")
    }
}

# ─── Helper : ouvrir un nouveau terminal PowerShell ──────────────────────────
function Start-Service {
    param (
        [string] $Name,
        [string] $WorkDir,
        [string] $Command,
        [string] $Color = "DarkBlue"
    )
    Write-Ok "Démarrage de $Name dans une nouvelle fenêtre…"
    Start-Process powershell.exe -ArgumentList `
        "-NoExit", "-Command",
        "cd '$WorkDir'; `$Host.UI.RawUI.WindowTitle = '$Name'; $Command" `
        -WindowStyle Normal
    Start-Sleep -Seconds 2
}

# ─── 1. Maven build (compile une seule fois) ──────────────────────────────────
Write-Title "Compilation Maven (backend)"
Push-Location $backend
try {
    mvn clean package -DskipTests -q
    Write-Ok "Build Maven terminé."
} catch {
    Write-Fail "Build Maven échoué – vérifiez les erreurs ci-dessus."
    exit 1
} finally {
    Pop-Location
}

# ─── 2. auth-service ──────────────────────────────────────────────────────────
Write-Title "Lancement des microservices Spring Boot"
Start-Service `
    -Name     "auth-service (8081)" `
    -WorkDir  (Join-Path $backend "auth-service") `
    -Command  "mvn spring-boot:run"

# ─── 3. core-service ──────────────────────────────────────────────────────────
Start-Service `
    -Name     "core-service (8082)" `
    -WorkDir  (Join-Path $backend "core-service") `
    -Command  "mvn spring-boot:run"

# ─── 4. api-gateway ───────────────────────────────────────────────────────────
Start-Service `
    -Name     "api-gateway (8080)" `
    -WorkDir  (Join-Path $backend "api-gateway") `
    -Command  "mvn spring-boot:run"

# ─── 5. ai-service (Python) ───────────────────────────────────────────────────
Write-Title "Lancement du service IA (Python)"

# Créer / activer un virtualenv si nécessaire
$venv = Join-Path $aiSvc ".venv"
if (-not (Test-Path $venv)) {
    Write-Ok "Création du virtualenv Python…"
    python -m venv $venv
}

$pip    = Join-Path $venv "Scripts\pip.exe"
$uvicorn = Join-Path $venv "Scripts\uvicorn.exe"

Write-Ok "Installation des dépendances Python…"
& $pip install -r (Join-Path $aiSvc "requirements.txt") -q

Start-Service `
    -Name     "ai-service (8000)" `
    -WorkDir  $aiSvc `
    -Command  "& '$uvicorn' main:app --host 0.0.0.0 --port 8000 --reload"

# ─── 6. Frontend Angular ──────────────────────────────────────────────────────
Write-Title "Lancement du frontend Angular (4200)"

if (-not (Test-Path (Join-Path $frontend "node_modules"))) {
    Write-Ok "Installation des dépendances npm…"
    Push-Location $frontend
    npm install --legacy-peer-deps
    Pop-Location
}

Start-Service `
    -Name     "frontend Angular (4200)" `
    -WorkDir  $frontend `
    -Command  "npm start"

# ─── Résumé ──────────────────────────────────────────────────────────────────
Write-Title "Tous les services sont en cours de démarrage"
Write-Host ""
Write-Host "  Service          URL" -ForegroundColor White
Write-Host "  ───────────────────────────────────────────────" -ForegroundColor DarkGray
Write-Host "  API Gateway    -> http://localhost:8080/api/v1"   -ForegroundColor Cyan
Write-Host "  auth-service   -> http://localhost:8081"          -ForegroundColor Cyan
Write-Host "  core-service   -> http://localhost:8082"          -ForegroundColor Cyan
Write-Host "  ai-service     -> http://localhost:8000/docs"     -ForegroundColor Cyan
Write-Host "  Frontend       -> http://localhost:4200"          -ForegroundColor Green
Write-Host ""
Write-Host "  Identifiants par défaut : admin / Admin@1234 (tenant: default)" -ForegroundColor Yellow
Write-Host ""
Write-Host "  Pour arrêter tous les services : .\stop.ps1" -ForegroundColor DarkGray
