param(
    [Parameter(Mandatory = $true)]
    [string]$ServiceDir,

    [Parameter(Mandatory = $true)]
    [string]$MavenCmd
)

Set-Location $ServiceDir
& $MavenCmd 'spring-boot:run'
