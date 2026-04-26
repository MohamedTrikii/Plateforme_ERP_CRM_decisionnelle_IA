###############################################################################
#  ERP Platform - Script de demarrage (developpement)
#  Lance : auth-service (8081) . core-service (8082) . api-gateway (8080)
#           ai-service (8000)   . frontend Angular    (4200)
#
#  Usage : .\start.ps1
#  Prerequis : Java 21+, Maven 3.9+, Node 20+, Python 3.12+, PostgreSQL
###############################################################################

# $ErrorActionPreference = "Stop" # Commente pour eviter les crashs sur stderr

# --- Couleurs ----------------------------------------------------------------
function Write-Title  ($msg) { Write-Host "`n==> $msg" -ForegroundColor Cyan }
function Write-Ok     ($msg) { Write-Host "  [OK]  $msg" -ForegroundColor Green }
function Write-Warn   ($msg) { Write-Host "  [!!]  $msg" -ForegroundColor Yellow }
function Write-Fail   ($msg) { Write-Host "  [ERR] $msg" -ForegroundColor Red }

# --- Repertoires de base -----------------------------------------------------
$root      = Split-Path -Parent $MyInvocation.MyCommand.Path
$backend   = Join-Path $root "backend"
$aiSvc     = Join-Path $root "ai-service"
$frontend  = Join-Path $root "frontend\erp-frontend"

# --- Verification des outils -------------------------------------------------
Write-Title "Verification des prerequis"

# Auto-detect modern Java if default is too old (Java 8) or missing
if ((& java -version 2>&1 | Select-String "1.8.0") -or -not (Get-Command java -ErrorAction SilentlyContinue)) {
    $modernJava = Get-ChildItem "C:\Program Files\Java\jdk-23\bin\java.exe", "C:\Program Files\Java\jdk-20\bin\java.exe" -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($modernJava) {
        $Env:JAVA_HOME = $modernJava.Directory.Parent.FullName
        $Env:Path = "$($modernJava.DirectoryName);$Env:Path"
        Write-Ok "Utilisation automatique de modern Java trouve dans : $($modernJava.FullName)"
    }
}

# Auto-detect Maven if missing
if (-not (Get-Command mvn -ErrorAction SilentlyContinue)) {
    $localMvn = Get-ChildItem "c:\PFA\tools\apache-maven-*\bin\mvn.cmd" -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($localMvn) {
        $Env:Path = "$($localMvn.DirectoryName);$Env:Path"
        Write-Ok "Utilisation automatique de Maven trouve dans : $($localMvn.FullName)"
    }
}

foreach ($tool in @("java","mvn","node","npm","python")) {
    if (Get-Command $tool -ErrorAction SilentlyContinue) {
        $oldEAP = $ErrorActionPreference
        $ErrorActionPreference = "SilentlyContinue"
        $vCmd = if ($tool -eq "java") { "-version" } else { "--version" }
        $version = $(& $tool $vCmd 2>&1 | Select-Object -First 1)
        $ErrorActionPreference = $oldEAP
        Write-Ok "$tool trouve  ($version)"
    } else {
        Write-Fail "$tool introuvable - installez-le puis relancez le script."
        exit 1
    }
}

# --- Fichier .env -------------------------------------------------------------
$envFile = Join-Path $root ".env"
if (-not (Test-Path $envFile)) {
    Write-Warn ".env introuvable - copie de .env.example"
    Copy-Item (Join-Path $root ".env.example") $envFile
    Write-Warn "Editez $envFile et renseignez JWT_SECRET avant de continuer."
    Start-Process notepad.exe $envFile
    Read-Host "Appuyez sur Entree une fois .env configure"
}

# Charger les variables d'environnement depuis .env
Get-Content $envFile | Where-Object { $_ -match "^\s*[^#]" } | ForEach-Object {
    $kv = $_ -split "=", 2
    if ($kv.Length -eq 2) {
        [System.Environment]::SetEnvironmentVariable($kv[0].Trim(), $kv[1].Trim(), "Process")
    }
}

# --- Helper : ouvrir un nouveau terminal PowerShell --------------------------
function Start-Service {
    param (
        [string] $Name,
        [string] $WorkDir,
        [string] $Command,
        [string] $Color = "DarkBlue"
    )
    Write-Ok "Demarrage de $Name dans une nouvelle fenetre..."
    Start-Process powershell.exe -ArgumentList `
        "-NoExit", "-Command",
        "cd '$WorkDir'; `$Host.UI.RawUI.WindowTitle = '$Name'; $Command" `
        -WindowStyle Normal
    Start-Sleep -Seconds 2
}

# --- 1. Maven build (compile une seule fois) ----------------------------------
Write-Title "Compilation Maven (backend)"
Push-Location $backend
try {
    mvn clean package -DskipTests -q
    Write-Ok "Build Maven termine."
} catch {
    Write-Fail "Build Maven echoue - verifiez les erreurs ci-dessus."
    exit 1
} finally {
    Pop-Location
}

# --- 2. auth-service ----------------------------------------------------------
Write-Title "Lancement des microservices Spring Boot"
Start-Service `
    -Name     "auth-service (8081)" `
    -WorkDir  (Join-Path $backend "auth-service") `
    -Command  "mvn spring-boot:run"

# --- 3. core-service ----------------------------------------------------------
Start-Service `
    -Name     "core-service (8082)" `
    -WorkDir  (Join-Path $backend "core-service") `
    -Command  "mvn spring-boot:run"

# --- 4. api-gateway -----------------------------------------------------------
Start-Service `
    -Name     "api-gateway (8083)" `
    -WorkDir  (Join-Path $backend "api-gateway") `
    -Command  "mvn spring-boot:run"

# --- 5. ai-service (Python) ---------------------------------------------------
Write-Title "Lancement du service IA (Python)"

# Creer / activer un virtualenv si necessaire
$venv = Join-Path $aiSvc ".venv"
if (-not (Test-Path $venv)) {
    Write-Ok "Creation du virtualenv Python..."
    python -m venv $venv
}

$pip    = Join-Path $venv "Scripts\pip.exe"
$uvicorn = Join-Path $venv "Scripts\uvicorn.exe"

Write-Ok "Installation des dependances Python..."
& $pip install -r (Join-Path $aiSvc "requirements.txt") -q

Start-Service `
    -Name     "ai-service (8000)" `
    -WorkDir  $aiSvc `
    -Command  "& '$uvicorn' main:app --host 0.0.0.0 --port 8000 --reload"

# --- 6. Frontend Angular ------------------------------------------------------
Write-Title "Lancement du frontend Angular (4200)"

if (-not (Test-Path (Join-Path $frontend "node_modules"))) {
    Write-Ok "Installation des dependances npm..."
    Push-Location $frontend
    npm install --legacy-peer-deps
    Pop-Location
}

Start-Service `
    -Name     "frontend Angular (4200)" `
    -WorkDir  $frontend `
    -Command  "npm start"

# --- Resume ------------------------------------------------------------------
Write-Title "Tous les services sont en cours de demarrage"
Write-Host ""
Write-Host "  Service          URL" -ForegroundColor White
Write-Host "  -----------------------------------------------" -ForegroundColor DarkGray
Write-Host "  API Gateway    -> http://localhost:8083/api/v1"   -ForegroundColor Cyan
Write-Host "  auth-service   -> http://localhost:8081"          -ForegroundColor Cyan
Write-Host "  core-service   -> http://localhost:8082"          -ForegroundColor Cyan
Write-Host "  ai-service     -> http://localhost:8000/docs"     -ForegroundColor Cyan
Write-Host "  Frontend       -> http://localhost:4200"          -ForegroundColor Green
Write-Host ""
Write-Host "  Identifiants par defaut : admin / Admin@1234 (tenant: default)" -ForegroundColor Yellow
Write-Host ""
Write-Host "  Pour arreter tous les services : .\stop.ps1" -ForegroundColor DarkGray
