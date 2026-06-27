param(
    [switch]$RunOnly,
    [switch]$SetupOnly,
    [switch]$ResetDatabase,
    [switch]$NoBrowser,
    [switch]$NoPause
)

# ============================================================
#  Bahay ni Kuya - one-script Windows setup + run
#  Fresh PC path:
#    1. Double-click START-HERE.bat
#    2. Approve the admin prompt if Node/PostgreSQL must be installed
#    3. Wait for the browser to open
# ============================================================

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest
if (Test-Path variable:PSNativeCommandUseErrorActionPreference) {
    $PSNativeCommandUseErrorActionPreference = $false
}

$ProjectDir  = $PSScriptRoot
$DbName      = 'bahay_ni_kuya_db'
$DbUser      = 'bnk'
$DbPassword  = 'bnk_password'
$DbPort      = 5432
$SuperPass   = 'postgres'
$ApiPort     = 4000
$WebPort     = 5173
$DbHost      = '127.0.0.1'
$DatabaseUrl = "postgresql://$DbUser`:$DbPassword@$DbHost`:$DbPort/$DbName`?schema=public"
$script:PsqlPath = $null

function Info([string]$message) { Write-Host "==> $message" -ForegroundColor Cyan }
function Ok([string]$message)   { Write-Host "[OK] $message" -ForegroundColor Green }
function Warn([string]$message) { Write-Host "[!]  $message" -ForegroundColor Yellow }

trap {
    Write-Host ''
    Write-Host '====================================================' -ForegroundColor Red
    Write-Host '  SETUP STOPPED - something went wrong.'              -ForegroundColor Red
    Write-Host '====================================================' -ForegroundColor Red
    Write-Host ''
    Write-Host $_.Exception.Message -ForegroundColor Yellow
    Write-Host ''
    Write-Host 'If you need help, send the yellow error text above.' -ForegroundColor Yellow
    if (-not $NoPause) {
        Read-Host 'Press Enter to close' | Out-Null
    }
    exit 1
}

function Have([string]$command) {
    return [bool](Get-Command $command -ErrorAction SilentlyContinue)
}

function Test-Admin {
    $me = New-Object Security.Principal.WindowsPrincipal([Security.Principal.WindowsIdentity]::GetCurrent())
    return $me.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
}

function Restart-Elevated([string]$reason) {
    if (Test-Admin) { return }

    Info "Requesting administrator rights ($reason)..."
    $args = @('-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', "`"$PSCommandPath`"")
    if ($RunOnly)       { $args += '-RunOnly' }
    if ($SetupOnly)     { $args += '-SetupOnly' }
    if ($ResetDatabase) { $args += '-ResetDatabase' }
    if ($NoBrowser)     { $args += '-NoBrowser' }
    if ($NoPause)       { $args += '-NoPause' }

    Start-Process -FilePath 'powershell' -Verb RunAs -ArgumentList $args | Out-Null
    exit 0
}

function Sync-Path {
    $machine = [Environment]::GetEnvironmentVariable('Path', 'Machine')
    $user = [Environment]::GetEnvironmentVariable('Path', 'User')
    $env:Path = "$machine;$user"
}

function Ensure-Winget {
    if (Have 'winget') { return }
    throw 'winget was not found. Install "App Installer" from the Microsoft Store, then run START-HERE.bat again.'
}

function Test-PortOpen([int]$port) {
    $client = $null
    try {
        $client = New-Object Net.Sockets.TcpClient
        $iar = $client.BeginConnect('127.0.0.1', $port, $null, $null)
        if (-not $iar.AsyncWaitHandle.WaitOne(400, $false)) { return $false }
        $client.EndConnect($iar)
        return $true
    } catch {
        return $false
    } finally {
        if ($client) { $client.Close() }
    }
}

function Assert-PortFree([int]$port, [string]$name) {
    if (Test-PortOpen $port) {
        throw "$name port $port is already in use. Close the other app using it, then run this script again."
    }
}

function Find-Psql {
    $hit = Get-ChildItem 'C:\Program Files\PostgreSQL\*\bin\psql.exe' -ErrorAction SilentlyContinue |
        Sort-Object FullName -Descending |
        Select-Object -First 1
    if ($hit) { return $hit.FullName }

    $cmd = Get-Command 'psql' -ErrorAction SilentlyContinue
    if ($cmd) { return $cmd.Source }

    return $null
}

function Find-PgIsReady {
    if ($script:PsqlPath -and $script:PsqlPath -ne 'psql') {
        $candidate = Join-Path (Split-Path $script:PsqlPath -Parent) 'pg_isready.exe'
        if (Test-Path $candidate) { return $candidate }
    }

    $cmd = Get-Command 'pg_isready' -ErrorAction SilentlyContinue
    if ($cmd) { return $cmd.Source }

    return $null
}

function Ensure-Node([switch]$AllowInstall) {
    if ((Have 'node') -and (Have 'npm')) {
        Ok "Node ready ($(node -v))"
        return
    }

    if (-not $AllowInstall) {
        throw 'Node.js/npm is missing. Run START-HERE.bat for the full setup.'
    }

    Restart-Elevated 'needed to install Node.js'
    Ensure-Winget

    Info 'Installing Node.js LTS...'
    winget install -e --id OpenJS.NodeJS.LTS --accept-source-agreements --accept-package-agreements --silent
    if ($LASTEXITCODE -ne 0) { throw 'Node.js install failed.' }

    Sync-Path
    if (-not ((Have 'node') -and (Have 'npm'))) {
        throw 'Node.js installed, but node/npm are still not on PATH. Restart Windows, then run START-HERE.bat again.'
    }

    Ok "Node installed ($(node -v))"
}

function Ensure-Postgres([switch]$AllowInstall) {
    $script:PsqlPath = Find-Psql

    if (-not $script:PsqlPath) {
        if (-not $AllowInstall) {
            throw 'PostgreSQL tools are missing. Run START-HERE.bat for the full setup.'
        }

        if (Test-PortOpen $DbPort) {
            throw "Port $DbPort is already in use, but psql.exe was not found. Install PostgreSQL tools or free the port, then rerun."
        }

        Restart-Elevated 'needed to install PostgreSQL'
        Ensure-Winget

        Info 'Installing PostgreSQL 16...'
        winget install -e --id PostgreSQL.PostgreSQL.16 --accept-source-agreements --accept-package-agreements --silent `
            --override "--mode unattended --unattendedmodeui none --superpassword `"$SuperPass`" --serverport $DbPort --enable-components server,commandlinetools"
        if ($LASTEXITCODE -ne 0) { throw 'PostgreSQL install failed.' }

        Sync-Path
        Start-Sleep -Seconds 3
        $script:PsqlPath = Find-Psql
        if (-not $script:PsqlPath) {
            throw 'PostgreSQL installed, but psql.exe was not found. Restart Windows, then run START-HERE.bat again.'
        }
    }

    Ok "PostgreSQL tools ready ($script:PsqlPath)"

    $svc = Get-Service -Name 'postgresql*' -ErrorAction SilentlyContinue |
        Sort-Object Name -Descending |
        Select-Object -First 1

    if ($svc) {
        if ($svc.Status -ne 'Running') {
            if (-not (Test-Admin) -and $AllowInstall) {
                Restart-Elevated 'needed to start PostgreSQL'
            }

            Info "Starting PostgreSQL service ($($svc.Name))..."
            Start-Service $svc.Name
            Start-Sleep -Seconds 3
        }
    } else {
        Warn 'No PostgreSQL Windows service was found; assuming PostgreSQL is managed externally.'
    }
}

function Wait-ForPostgres {
    $readyTool = Find-PgIsReady

    Info "Waiting for PostgreSQL on $DbHost`:$DbPort..."
    for ($i = 0; $i -lt 60; $i++) {
        if ($readyTool) {
            & $readyTool -h $DbHost -p $DbPort | Out-Null
            if ($LASTEXITCODE -eq 0) {
                Ok 'PostgreSQL is accepting connections'
                return
            }
        } elseif (Test-PortOpen $DbPort) {
            Ok 'PostgreSQL port is open'
            return
        }

        Start-Sleep -Seconds 1
    }

    throw "PostgreSQL did not become ready on $DbHost`:$DbPort."
}

function Invoke-Psql([string]$password, [string[]]$arguments, [switch]$Quiet) {
    $oldPassword = [Environment]::GetEnvironmentVariable('PGPASSWORD', 'Process')
    try {
        $env:PGPASSWORD = $password
        if ($Quiet) {
            & $script:PsqlPath @arguments *> $null
        } else {
            & $script:PsqlPath @arguments
        }
        return $LASTEXITCODE
    } finally {
        if ($null -eq $oldPassword) {
            Remove-Item Env:\PGPASSWORD -ErrorAction SilentlyContinue
        } else {
            $env:PGPASSWORD = $oldPassword
        }
    }
}

function Test-AppDatabase {
    if (-not $script:PsqlPath) { return $false }

    try {
        $exitCode = Invoke-Psql $DbPassword @(
            '-h', $DbHost,
            '-p', "$DbPort",
            '-U', $DbUser,
            '-d', $DbName,
            '-v', 'ON_ERROR_STOP=1',
            '-c', 'select 1;'
        ) -Quiet
        return ($exitCode -eq 0)
    } catch {
        return $false
    }
}

function Ensure-Database {
    if (Test-AppDatabase) {
        Ok "Database '$DbName' already ready"
        return
    }

    Info "Creating/repairing database '$DbName' and role '$DbUser'..."

    $sql = @"
DO `$`$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = '$DbUser') THEN
    CREATE ROLE $DbUser LOGIN PASSWORD '$DbPassword' CREATEDB;
  ELSE
    ALTER ROLE $DbUser LOGIN PASSWORD '$DbPassword' CREATEDB;
  END IF;
END
`$`$;
SELECT 'CREATE DATABASE $DbName OWNER $DbUser'
  WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = '$DbName')\gexec
ALTER DATABASE $DbName OWNER TO $DbUser;
GRANT ALL PRIVILEGES ON DATABASE $DbName TO $DbUser;
"@

    $tmp = Join-Path $env:TEMP 'bnk_setup_database.sql'
    $sql | Set-Content -Path $tmp -Encoding utf8

    $exitCode = 0
    try {
        try {
            $exitCode = Invoke-Psql $SuperPass @(
                '-h', $DbHost,
                '-p', "$DbPort",
                '-U', 'postgres',
                '-d', 'postgres',
                '-v', 'ON_ERROR_STOP=1',
                '-f', $tmp
            ) -Quiet
        } catch {
            $exitCode = 1
        }
    } finally {
        Remove-Item $tmp -ErrorAction SilentlyContinue
    }

    if ($exitCode -ne 0) {
        throw "Could not create the database as postgres. On a fresh script-installed PostgreSQL, the password is '$SuperPass'. If this PC already had PostgreSQL, update the postgres password or use pgAdmin/psql to create the '$DbUser' role and '$DbName' database."
    }

    if (-not (Test-AppDatabase)) {
        Warn "Database setup finished, but '$DbUser' still failed the quiet connection test."
        Warn 'Running the same test again with PostgreSQL output visible...'
        Invoke-Psql $DbPassword @(
            '-h', $DbHost,
            '-p', "$DbPort",
            '-U', $DbUser,
            '-d', $DbName,
            '-v', 'ON_ERROR_STOP=1',
            '-c', 'select current_user, current_database();'
        ) | Out-Null
        throw "Database setup finished, but the app user '$DbUser' still cannot connect."
    }

    Ok 'Database role and database are ready'
}

function Write-ServerEnv {
    $envPath = Join-Path $ProjectDir 'server\.env'
    $jwt = $null

    if (Test-Path $envPath) {
        foreach ($line in Get-Content $envPath) {
            if ($line -match '^\s*JWT_SECRET\s*=\s*(.+)\s*$') {
                $jwt = $Matches[1].Trim().Trim('"')
                break
            }
        }
    }

    if (-not $jwt) {
        $jwt = 'dev-only-secret-' + ([guid]::NewGuid().ToString('N'))
    }

    @"
DATABASE_URL="$DatabaseUrl"
PORT=$ApiPort
JWT_SECRET="$jwt"
"@ | Set-Content -Path $envPath -Encoding utf8

    Ok 'server\.env ready'
}

function Ensure-Dependencies([switch]$Force) {
    $missing =
        -not (Test-Path (Join-Path $ProjectDir 'node_modules')) -or
        -not (Test-Path (Join-Path $ProjectDir 'server\node_modules')) -or
        -not (Test-Path (Join-Path $ProjectDir 'client\node_modules'))

    if (-not $Force -and -not $missing) {
        Ok 'Dependencies already installed'
        return
    }

    Info 'Installing project dependencies...'
    npm run install:all
    if ($LASTEXITCODE -ne 0) { throw 'npm dependency install failed.' }
    Ok 'Dependencies installed'
}

function Invoke-PrismaSetup {
    Info 'Generating Prisma client...'
    npm --prefix server run prisma:generate
    if ($LASTEXITCODE -ne 0) { throw 'Prisma client generation failed.' }

    Info 'Applying database migrations...'
    npm --prefix server run prisma:deploy
    if ($LASTEXITCODE -ne 0) { throw 'Prisma migration failed.' }

    if ($ResetDatabase) {
        Info 'Resetting sample data...'
        npm --prefix server run seed:reset
    } else {
        Info 'Seeding sample data if the database is empty...'
        npm --prefix server run seed
    }

    if ($LASTEXITCODE -ne 0) { throw 'Database seed failed.' }
    Ok 'Database schema and sample data are ready'
}

function Open-BrowserWhenReady {
    if ($NoBrowser) { return }

    Start-Job -Name 'BNKOpenBrowser' -ScriptBlock {
        param($port)
        for ($i = 0; $i -lt 60; $i++) {
            try {
                $client = New-Object Net.Sockets.TcpClient
                $client.Connect('localhost', $port)
                $client.Close()
                Start-Process "http://localhost:$port"
                break
            } catch {
                Start-Sleep -Seconds 1
            }
        }
    } -ArgumentList $WebPort | Out-Null
}

function Start-App {
    Assert-PortFree $ApiPort 'API'
    Assert-PortFree $WebPort 'Web client'

    Open-BrowserWhenReady

    Write-Host ''
    Write-Host '====================================================' -ForegroundColor Green
    Write-Host "  Ready. Web app: http://localhost:$WebPort"          -ForegroundColor Green
    Write-Host "  API:           http://localhost:$ApiPort"           -ForegroundColor Green
    Write-Host ''                                                           -ForegroundColor Green
    Write-Host '  Login: admin@bahaynikuya.com / admin123'          -ForegroundColor Green
    Write-Host '  Keep this window open. Press Ctrl+C to stop.'     -ForegroundColor Green
    Write-Host '====================================================' -ForegroundColor Green
    Write-Host ''

    npm run dev
}

Set-Location $ProjectDir

Write-Host ''
Write-Host '====================================================' -ForegroundColor Magenta
Write-Host '  Bahay ni Kuya setup'                              -ForegroundColor Magenta
Write-Host '====================================================' -ForegroundColor Magenta
Write-Host ''

Ensure-Node -AllowInstall:(!$RunOnly)
Ensure-Postgres -AllowInstall:(!$RunOnly)
Wait-ForPostgres
Ensure-Database
Write-ServerEnv
Ensure-Dependencies -Force:(!$RunOnly)
Invoke-PrismaSetup

if ($SetupOnly) {
    Ok 'Setup complete. Run RUN-APP.bat when you want to start the app.'
    if (-not $NoPause) {
        Read-Host 'Press Enter to close' | Out-Null
    }
    exit 0
}

Start-App
