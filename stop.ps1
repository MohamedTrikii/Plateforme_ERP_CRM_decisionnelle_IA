###############################################################################
#  ERP Platform – Script d'arrêt
#  Termine tous les processus Java (Spring Boot) et le serveur Angular.
#
#  Usage : .\stop.ps1
###############################################################################

$ErrorActionPreference = "SilentlyContinue"

function Write-Title ($msg) { Write-Host "`n==> $msg" -ForegroundColor Cyan }
function Write-Ok    ($msg) { Write-Host "  [OK]  $msg" -ForegroundColor Green }

Write-Title "Arrêt des services ERP"

# ─── Spring Boot (Java) ───────────────────────────────────────────────────────
$javaPids = Get-Process java -ErrorAction SilentlyContinue
if ($javaPids) {
    $javaPids | ForEach-Object {
        Write-Ok "Arrêt du processus Java PID $($_.Id)"
        $_ | Stop-Process -Force
    }
} else {
    Write-Host "  Aucun processus Java en cours." -ForegroundColor DarkGray
}

# ─── Python / Uvicorn (ai-service) ───────────────────────────────────────────
$pyPids = Get-Process python -ErrorAction SilentlyContinue
if ($pyPids) {
    $pyPids | ForEach-Object {
        Write-Ok "Arrêt du processus Python PID $($_.Id)"
        $_ | Stop-Process -Force
    }
} else {
    Write-Host "  Aucun processus Python en cours." -ForegroundColor DarkGray
}

# ─── Node.js (Angular dev server) ────────────────────────────────────────────
$nodePids = Get-Process node -ErrorAction SilentlyContinue
if ($nodePids) {
    $nodePids | ForEach-Object {
        Write-Ok "Arrêt du processus Node PID $($_.Id)"
        $_ | Stop-Process -Force
    }
} else {
    Write-Host "  Aucun processus Node en cours." -ForegroundColor DarkGray
}

Write-Host ""
Write-Host "  Tous les services ont été arrêtés." -ForegroundColor Green
