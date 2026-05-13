param(
    [Parameter(Mandatory = $true)]
    [string]$ServiceDir,

    [Parameter(Mandatory = $true)]
    [string]$MavenCmd
)

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$envFile = Join-Path $root '.env'

if (Test-Path $envFile) {
    Get-Content $envFile | Where-Object { $_ -match '^\s*[A-Za-z_][A-Za-z0-9_]*=' } | ForEach-Object {
        $k, $v = $_.Split('=', 2)
        Set-Item -Path ("Env:" + $k.Trim()) -Value $v.Trim()
    }
}

# Keep datasource variables deterministic even if the terminal has stale values.
if ($env:POSTGRES_USER) {
    $env:DB_USERNAME = $env:POSTGRES_USER
}
if ($env:POSTGRES_PASSWORD) {
    $env:DB_PASSWORD = $env:POSTGRES_PASSWORD
}
if (-not $env:DB_PORT) {
    $env:DB_PORT = '5432'
}

Set-Location $ServiceDir
& $MavenCmd 'spring-boot:run'
