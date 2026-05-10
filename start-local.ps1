# ERP local dev startup
# Starts: auth-service (8081), core-service (8082), api-gateway (8083), ai-service (8000), frontend (4200)

$ErrorActionPreference = 'Stop'

function Write-Title($msg) { Write-Host "`n==> $msg" -ForegroundColor Cyan }
function Write-Ok($msg) { Write-Host "  [OK] $msg" -ForegroundColor Green }
function Write-Warn($msg) { Write-Host "  [!!] $msg" -ForegroundColor Yellow }
function Write-Fail($msg) { Write-Host "  [ERR] $msg" -ForegroundColor Red }

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$backend = Join-Path $root 'backend'
$aiSvc = Join-Path $root 'ai-service'
$frontend = Join-Path $root 'frontend'
$mvn = Join-Path $root 'tools\apache-maven-3.9.9\bin\mvn.cmd'

if (-not (Test-Path $mvn)) {
    Write-Fail "Maven not found at $mvn"
    exit 1
}

$envFile = Join-Path $root '.env'
if (-not (Test-Path $envFile)) {
    Write-Fail '.env not found. Create it first.'
    exit 1
}

Write-Title 'Load .env'
Get-Content $envFile | Where-Object { $_ -match '^\s*[A-Za-z_][A-Za-z0-9_]*=' } | ForEach-Object {
    $k, $v = $_.Split('=', 2)
    Set-Item -Path ('Env:' + $k.Trim()) -Value $v.Trim()
}
if (-not $env:DB_USERNAME -and $env:POSTGRES_USER) { $env:DB_USERNAME = $env:POSTGRES_USER }
if (-not $env:DB_PASSWORD -and $env:POSTGRES_PASSWORD) { $env:DB_PASSWORD = $env:POSTGRES_PASSWORD }
Write-Ok '.env loaded'

Write-Title 'Ensure PostgreSQL container is up'
try {
    Push-Location $root
    docker compose up -d postgres | Out-Null
    Pop-Location
    Write-Ok 'postgres is up (docker)'
} catch {
    Write-Warn 'docker compose up -d postgres failed. Continue if postgres is already running.'
}

function Start-WindowService {
    param(
        [string]$Title,
        [string]$WorkDir,
        [string]$Command
    )

    $safeWorkDir = $WorkDir.Replace("'", "''")
    $psCmd = "Set-Location -Path '{0}'; {1}" -f $safeWorkDir, $Command

    Start-Process powershell.exe -ArgumentList '-NoExit', '-Command', $psCmd | Out-Null
    Write-Ok "$Title started"
    Start-Sleep -Milliseconds 700
}

Write-Title 'Start backend services'
$javaScript = Join-Path $root 'start-service-java.ps1'
$dirAuth    = Join-Path $backend 'auth-service'
$dirCore    = Join-Path $backend 'core-service'
$dirGateway = Join-Path $backend 'api-gateway'
$cmdAuth    = [string]::Join(' ', @("& '$javaScript'", "-ServiceDir '$dirAuth'", "-MavenCmd '$mvn'"))
$cmdCore    = [string]::Join(' ', @("& '$javaScript'", "-ServiceDir '$dirCore'", "-MavenCmd '$mvn'"))
$cmdGateway = [string]::Join(' ', @("& '$javaScript'", "-ServiceDir '$dirGateway'", "-MavenCmd '$mvn'"))
Start-WindowService -Title 'auth-service (8081)' -WorkDir $dirAuth    -Command $cmdAuth
Start-WindowService -Title 'core-service (8082)' -WorkDir $dirCore    -Command $cmdCore
Start-WindowService -Title 'api-gateway (8083)'  -WorkDir $dirGateway -Command $cmdGateway

Write-Title 'Start ai-service'
$venvPython = Join-Path $aiSvc '.venv\Scripts\python.exe'
if (-not (Test-Path $venvPython)) {
    Write-Fail "Python venv not found: $venvPython"
    exit 1
}
$uvicornTarget = 'main' + ':' + 'app'
Start-WindowService -Title 'ai-service (8000)' -WorkDir $aiSvc -Command ("& '$venvPython' -m uvicorn $uvicornTarget --host 0.0.0.0 --port 8000")

Write-Title 'Start frontend'
Start-WindowService -Title 'frontend (4200)' -WorkDir $frontend -Command 'npm run start -- --host 0.0.0.0 --port 4200'

Write-Host "`nServices are starting:" -ForegroundColor White
Write-Host '  auth-service -> http://localhost:8081' -ForegroundColor Cyan
Write-Host '  core-service -> http://localhost:8082' -ForegroundColor Cyan
Write-Host '  api-gateway  -> http://localhost:8083' -ForegroundColor Cyan
Write-Host '  ai-service   -> http://localhost:8000/docs' -ForegroundColor Cyan
Write-Host '  frontend     -> http://localhost:4200' -ForegroundColor Green
Write-Host "`nDefault login: admin / Admin@1234" -ForegroundColor Yellow
Write-Host 'Use .\stop.ps1 to stop all local services.' -ForegroundColor DarkGray
