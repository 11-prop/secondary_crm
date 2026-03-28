[CmdletBinding()]
param(
    [string]$EnvFile = ".env.deploy",
    [string]$ComposeFile = "docker-compose.external-db.yml",
    [switch]$SkipComposeUp
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Write-Section {
    param([string]$Message)

    Write-Host ""
    Write-Host "== $Message ==" -ForegroundColor Cyan
}

function Read-Value {
    param(
        [string]$Prompt,
        [string]$Default = ""
    )

    $suffix = if ([string]::IsNullOrWhiteSpace($Default)) { "" } else { " [$Default]" }
    $value = Read-Host "$Prompt$suffix"
    if ([string]::IsNullOrWhiteSpace($value)) {
        return $Default
    }

    return $value.Trim()
}

function Read-RequiredValue {
    param(
        [string]$Prompt,
        [string]$Default = ""
    )

    while ($true) {
        $value = Read-Value -Prompt $Prompt -Default $Default
        if (-not [string]::IsNullOrWhiteSpace($value)) {
            return $value
        }

        Write-Host "A value is required." -ForegroundColor Yellow
    }
}

function Read-SecretValue {
    param([string]$Prompt)

    while ($true) {
        $secureValue = Read-Host -Prompt $Prompt -AsSecureString
        $bstr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secureValue)

        try {
            $plainValue = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($bstr)
        }
        finally {
            if ($bstr -ne [IntPtr]::Zero) {
                [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($bstr)
            }
        }

        if (-not [string]::IsNullOrWhiteSpace($plainValue)) {
            return $plainValue
        }

        Write-Host "A value is required." -ForegroundColor Yellow
    }
}

function Confirm-Action {
    param(
        [string]$Prompt,
        [bool]$DefaultYes = $true
    )

    $hint = if ($DefaultYes) { "Y/n" } else { "y/N" }
    $value = Read-Host "$Prompt [$hint]"

    if ([string]::IsNullOrWhiteSpace($value)) {
        return $DefaultYes
    }

    return $value.Trim().ToLowerInvariant() -in @("y", "yes")
}

function Invoke-DockerCommand {
    param([string[]]$Arguments)

    $output = & docker @Arguments 2>&1
    if ($LASTEXITCODE -ne 0) {
        throw "docker $($Arguments -join ' ') failed.`n$output"
    }

    return $output
}

function Get-RunningPostgresContainers {
    $containers = Invoke-DockerCommand -Arguments @("ps", "--format", "{{.Names}}|{{.Image}}")
    return @(
        $containers |
            Where-Object { $_ -match "\|" } |
            ForEach-Object {
                $parts = $_.Split("|", 2)
                [PSCustomObject]@{
                    Name  = $parts[0]
                    Image = $parts[1]
                }
            } |
            Where-Object { $_.Image -match "postgres" }
    )
}

function Get-ContainerInfo {
    param([string]$ContainerName)

    $inspectJson = Invoke-DockerCommand -Arguments @("inspect", $ContainerName)
    return (($inspectJson -join [Environment]::NewLine) | ConvertFrom-Json)[0]
}

function Get-ContainerEnvMap {
    param($ContainerInfo)

    $envMap = @{}
    foreach ($entry in $ContainerInfo.Config.Env) {
        $separatorIndex = $entry.IndexOf("=")
        if ($separatorIndex -lt 1) {
            continue
        }

        $key = $entry.Substring(0, $separatorIndex)
        $value = $entry.Substring($separatorIndex + 1)
        $envMap[$key] = $value
    }

    return $envMap
}

function Select-ExternalNetwork {
    param($ContainerInfo)

    $networkNames = @(
        $ContainerInfo.NetworkSettings.Networks.PSObject.Properties.Name |
            Where-Object { $_ -notin @("bridge", "host", "none") }
    )

    if (-not $networkNames) {
        throw "The Postgres container is not attached to a user-defined Docker network. Attach it to one before deploying this app."
    }

    if ($networkNames.Count -eq 1) {
        Write-Host "Using Docker network: $($networkNames[0])" -ForegroundColor Green
        return $networkNames[0]
    }

    Write-Host "Select the Docker network this stack should join:"
    for ($index = 0; $index -lt $networkNames.Count; $index++) {
        Write-Host "[$($index + 1)] $($networkNames[$index])"
    }

    while ($true) {
        $selection = Read-Host "Enter the network number"
        $parsedValue = 0
        if ([int]::TryParse($selection, [ref]$parsedValue)) {
            if ($parsedValue -ge 1 -and $parsedValue -le $networkNames.Count) {
                return $networkNames[$parsedValue - 1]
            }
        }

        Write-Host "Enter a valid number from the list." -ForegroundColor Yellow
    }
}

function New-RandomSecret {
    param([int]$ByteLength = 48)

    $buffer = New-Object byte[] $ByteLength
    [System.Security.Cryptography.RandomNumberGenerator]::Fill($buffer)

    $secret = [Convert]::ToBase64String($buffer)
    $secret = $secret.TrimEnd("=")
    $secret = $secret.Replace("+", "A").Replace("/", "B")
    return $secret
}

function Assert-DatabaseName {
    param([string]$DatabaseName)

    if ($DatabaseName -notmatch "^[A-Za-z_][A-Za-z0-9_]*$") {
        throw "Database names must start with a letter or underscore and contain only letters, numbers, or underscores."
    }
}

function Test-DatabaseExists {
    param(
        [string]$ContainerName,
        [string]$PostgresUser,
        [string]$PostgresPassword,
        [string]$AdminDatabase,
        [string]$TargetDatabase
    )

    $result = Invoke-DockerCommand -Arguments @(
        "exec",
        "-e", "PGPASSWORD=$PostgresPassword",
        $ContainerName,
        "psql",
        "-v", "ON_ERROR_STOP=1",
        "-U", $PostgresUser,
        "-d", $AdminDatabase,
        "-tAc", "SELECT 1 FROM pg_database WHERE datname = '$TargetDatabase';"
    )

    return (($result -join "").Trim() -eq "1")
}

function New-DatabaseIfMissing {
    param(
        [string]$ContainerName,
        [string]$PostgresUser,
        [string]$PostgresPassword,
        [string]$AdminDatabase,
        [string]$TargetDatabase
    )

    Assert-DatabaseName -DatabaseName $TargetDatabase

    if (Test-DatabaseExists -ContainerName $ContainerName -PostgresUser $PostgresUser -PostgresPassword $PostgresPassword -AdminDatabase $AdminDatabase -TargetDatabase $TargetDatabase) {
        Write-Host "Database '$TargetDatabase' already exists." -ForegroundColor Green
        return
    }

    Write-Host "Creating database '$TargetDatabase' in container '$ContainerName'..." -ForegroundColor Yellow

    Invoke-DockerCommand -Arguments @(
        "exec",
        "-e", "PGPASSWORD=$PostgresPassword",
        $ContainerName,
        "psql",
        "-v", "ON_ERROR_STOP=1",
        "-U", $PostgresUser,
        "-d", $AdminDatabase,
        "-c", "CREATE DATABASE ""$TargetDatabase"";"
    ) | Out-Null

    Write-Host "Database '$TargetDatabase' created." -ForegroundColor Green
}

function Escape-EnvValue {
    param([string]$Value)

    return ($Value -replace "`r", "" -replace "`n", "")
}

Write-Section "Checking prerequisites"

try {
    Invoke-DockerCommand -Arguments @("version") | Out-Null
}
catch {
    throw "Docker is required and must be available in PATH. $($_.Exception.Message)"
}

$projectRoot = Split-Path -Parent $PSScriptRoot
$composePath = Join-Path $projectRoot $ComposeFile
$envPath = Join-Path $projectRoot $EnvFile

if (-not (Test-Path -LiteralPath $composePath)) {
    throw "Compose file not found: $composePath"
}

$postgresContainers = Get-RunningPostgresContainers
if (-not $postgresContainers) {
    throw "No running Postgres containers were detected. Start the shared Postgres container first."
}

Write-Section "Shared Postgres container"
Write-Host "Detected running Postgres containers:"
foreach ($container in $postgresContainers) {
    Write-Host " - $($container.Name) ($($container.Image))"
}

$defaultContainer = $postgresContainers[0].Name
$postgresContainerName = Read-RequiredValue -Prompt "Postgres container name" -Default $defaultContainer
$containerInfo = Get-ContainerInfo -ContainerName $postgresContainerName
$containerEnv = Get-ContainerEnvMap -ContainerInfo $containerInfo
$externalNetwork = Select-ExternalNetwork -ContainerInfo $containerInfo
$databaseHost = $containerInfo.Name.TrimStart("/")
$databasePort = "5432"

$detectedUser = if ($containerEnv.ContainsKey("POSTGRES_USER")) { $containerEnv["POSTGRES_USER"] } else { "postgres" }
$detectedAdminDatabase = if ($containerEnv.ContainsKey("POSTGRES_DB")) { $containerEnv["POSTGRES_DB"] } else { "postgres" }

Write-Section "Database connection"
$postgresUser = Read-RequiredValue -Prompt "Postgres user" -Default $detectedUser
$postgresPassword = Read-SecretValue -Prompt "Postgres password"
$adminDatabase = Read-RequiredValue -Prompt "Admin database for provisioning" -Default $detectedAdminDatabase
$targetDatabase = Read-RequiredValue -Prompt "Database name for SecondaryCRM" -Default "secondary_crm"

New-DatabaseIfMissing -ContainerName $postgresContainerName -PostgresUser $postgresUser -PostgresPassword $postgresPassword -AdminDatabase $adminDatabase -TargetDatabase $targetDatabase

Write-Section "App configuration"
$frontendPort = Read-RequiredValue -Prompt "Frontend host port" -Default "4173"
$backendPort = Read-RequiredValue -Prompt "Backend host port" -Default "8000"
$frontendUrl = Read-RequiredValue -Prompt "Frontend public URL" -Default "http://localhost:$frontendPort"
$apiBaseUrl = Read-RequiredValue -Prompt "Frontend API base URL" -Default "/api"
$adminName = Read-RequiredValue -Prompt "Bootstrap admin name" -Default "System Administrator"
$adminEmail = Read-RequiredValue -Prompt "Bootstrap admin email" -Default "admin@example.com"
$adminPassword = Read-SecretValue -Prompt "Bootstrap admin password"
$backupSchedule = Read-RequiredValue -Prompt "Backup schedule (cron)" -Default "0 2 * * *"
$backupRetentionDays = Read-RequiredValue -Prompt "Backup retention in days" -Default "14"
$timezone = Read-RequiredValue -Prompt "Backup timezone" -Default "Asia/Karachi"
$secretKey = Read-Value -Prompt "Secret key (leave blank to generate one)" -Default ""

if ([string]::IsNullOrWhiteSpace($secretKey)) {
    $secretKey = New-RandomSecret
    Write-Host "Generated a new SECRET_KEY." -ForegroundColor Green
}

$envContent = @(
    "POSTGRES_USER=$(Escape-EnvValue -Value $postgresUser)"
    "POSTGRES_PASSWORD=$(Escape-EnvValue -Value $postgresPassword)"
    "POSTGRES_DB=$(Escape-EnvValue -Value $targetDatabase)"
    "DATABASE_HOST=$(Escape-EnvValue -Value $databaseHost)"
    "DATABASE_PORT=$(Escape-EnvValue -Value $databasePort)"
    "EXTERNAL_POSTGRES_NETWORK=$(Escape-EnvValue -Value $externalNetwork)"
    "FRONTEND_URL=$(Escape-EnvValue -Value $frontendUrl)"
    "VITE_API_BASE_URL=$(Escape-EnvValue -Value $apiBaseUrl)"
    "BACKEND_PORT=$(Escape-EnvValue -Value $backendPort)"
    "FRONTEND_PORT=$(Escape-EnvValue -Value $frontendPort)"
    "SECRET_KEY=$(Escape-EnvValue -Value $secretKey)"
    "DEFAULT_ADMIN_EMAIL=$(Escape-EnvValue -Value $adminEmail)"
    "DEFAULT_ADMIN_PASSWORD=$(Escape-EnvValue -Value $adminPassword)"
    "DEFAULT_ADMIN_NAME=$(Escape-EnvValue -Value $adminName)"
    "BACKUP_SCHEDULE=$(Escape-EnvValue -Value $backupSchedule)"
    "BACKUP_RETENTION_DAYS=$(Escape-EnvValue -Value $backupRetentionDays)"
    "TZ=$(Escape-EnvValue -Value $timezone)"
) -join [Environment]::NewLine

Write-Section "Review"
Write-Host "Postgres container : $postgresContainerName"
Write-Host "Docker network     : $externalNetwork"
Write-Host "Database host      : $databaseHost"
Write-Host "Database name      : $targetDatabase"
Write-Host "Frontend URL       : $frontendUrl"
Write-Host "Frontend port      : $frontendPort"
Write-Host "Backend port       : $backendPort"
Write-Host "Env file           : $envPath"

if (-not (Confirm-Action -Prompt "Write the deployment env file and continue?" -DefaultYes $true)) {
    throw "Deployment cancelled."
}

Set-Content -LiteralPath $envPath -Value $envContent -Encoding ASCII
Write-Host "Wrote deployment env file to $envPath" -ForegroundColor Green

if ($SkipComposeUp) {
    Write-Section "Done"
    Write-Host "Skipping docker compose up because -SkipComposeUp was supplied."
    Write-Host "Run: docker compose --env-file $EnvFile -f $ComposeFile up --build -d"
    exit 0
}

Write-Section "Starting the stack"
Push-Location $projectRoot
try {
    Invoke-DockerCommand -Arguments @(
        "compose",
        "--env-file", $EnvFile,
        "-f", $ComposeFile,
        "up",
        "--build",
        "-d"
    ) | Out-Null
}
finally {
    Pop-Location
}

Write-Section "Deployment complete"
Write-Host "Frontend: $frontendUrl"
Write-Host "Backend : http://localhost:$backendPort/api/health"
Write-Host "Bootstrap admin email: $adminEmail"
Write-Host "The admin password is the value you entered during setup."
