# ============================================================
#  Bahay ni Kuya - automated setup + run (clean Windows PC)
#  Installs Node + PostgreSQL if missing, creates the database,
#  seeds it, launches the API + web client, and opens the
#  browser. No Docker required.
# ============================================================

$ErrorActionPreference = 'Stop'

# --- config (matches the app's expectations) ---------------
$ProjectDir   = $PSScriptRoot
$DbName       = 'bahay_ni_kuya_db'
$DbUser       = 'bnk'
$DbPassword   = 'bnk_password'
$DbPort       = 5432                       # native Postgres default
$SuperPass    = 'postgres'                 # superuser pw we set during install
$ApiPort      = 4000
$WebPort      = 5173
$DatabaseUrl  = "postgresql://$DbUser`:$DbPassword@localhost:$DbPort/$DbName`?schema=public"

function Info($m)  { Write-Host "==> $m" -ForegroundColor Cyan }
function Ok($m)    { Write-Host "[OK] $m" -ForegroundColor Green }
function Warn($m)  { Write-Host "[!]  $m" -ForegroundColor Yellow }

# --- 1. make sure we are running as Administrator ----------
$me = New-Object Security.Principal.WindowsPrincipal([Security.Principal.WindowsIdentity]::GetCurrent())
if (-not $me.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
    Info 'Requesting administrator rights (needed to install Node + PostgreSQL)...'
    Start-Process powershell -Verb RunAs -ArgumentList @(
        '-NoProfile','-ExecutionPolicy','Bypass','-File',"`"$PSCommandPath`""
    )
    return
}

Set-Location $ProjectDir
Write-Host ''
Write-Host '====================================================' -ForegroundColor Magenta
Write-Host '  Bahay ni Kuya - setting up. This can take a few'    -ForegroundColor Magenta
Write-Host '  minutes the first time. Leave this window open.'    -ForegroundColor Magenta
Write-Host '====================================================' -ForegroundColor Magenta
Write-Host ''

# --- keep the window open and show WHICH step failed --------
trap {
    Write-Host ''
    Write-Host '====================================================' -ForegroundColor Red
    Write-Host '  SETUP STOPPED - something went wrong.'              -ForegroundColor Red
    Write-Host '====================================================' -ForegroundColor Red
    Write-Host ''
    Write-Host $_.Exception.Message -ForegroundColor Yellow
    Write-Host ''
    Write-Host 'Copy the yellow text above and send it over.'        -ForegroundColor Yellow
    Read-Host 'Press Enter to close'
    exit 1
}

# --- helper: reload PATH so freshly installed tools resolve -
function Sync-Path {
    $m = [Environment]::GetEnvironmentVariable('Path','Machine')
    $u = [Environment]::GetEnvironmentVariable('Path','User')
    $env:Path = "$m;$u"
}

function Have($cmd) { [bool](Get-Command $cmd -ErrorAction SilentlyContinue) }

# --- 2. winget present? ------------------------------------
if (-not (Have 'winget')) {
    Warn 'winget (App Installer) was not found.'
    Warn 'Please install "App Installer" from the Microsoft Store, then re-run START-HERE.bat.'
    Read-Host 'Press Enter to exit'
    return
}

# --- 3. Node.js --------------------------------------------
if (Have 'node') {
    Ok "Node already installed ($(node -v))"
} else {
    Info 'Installing Node.js LTS...'
    winget install -e --id OpenJS.NodeJS.LTS --accept-source-agreements --accept-package-agreements --silent
    Sync-Path
    if (-not (Have 'node')) { throw 'Node install finished but "node" is still not on PATH. Try restarting the PC and re-running.' }
    Ok "Node installed ($(node -v))"
}

# --- 4. PostgreSQL -----------------------------------------
function Find-Psql {
    $hit = Get-ChildItem 'C:\Program Files\PostgreSQL\*\bin\psql.exe' -ErrorAction SilentlyContinue |
           Sort-Object FullName -Descending | Select-Object -First 1
    if ($hit) { return $hit.FullName }
    if (Have 'psql') { return 'psql' }
    return $null
}

$psql = Find-Psql
if ($psql) {
    Ok 'PostgreSQL already installed'
} else {
    Info 'Installing PostgreSQL 16 (this is the big one)...'
    winget install -e --id PostgreSQL.PostgreSQL.16 --accept-source-agreements --accept-package-agreements --silent `
        --override "--mode unattended --unattendedmodeui none --superpassword `"$SuperPass`" --serverport $DbPort --enable-components server,commandlinetools"
    Sync-Path
    Start-Sleep -Seconds 3
    $psql = Find-Psql
    if (-not $psql) { throw 'PostgreSQL install finished but psql.exe was not found. Try restarting the PC and re-running.' }
    Ok 'PostgreSQL installed'
}

# make sure the service is running
$svc = Get-Service -Name 'postgresql*' -ErrorAction SilentlyContinue | Select-Object -First 1
if ($svc -and $svc.Status -ne 'Running') {
    Info "Starting PostgreSQL service ($($svc.Name))..."
    Start-Service $svc.Name
    Start-Sleep -Seconds 3
}

# --- 5. create app role + database (idempotent) ------------
Info 'Creating database and user (if they do not exist yet)...'
$env:PGPASSWORD = $SuperPass
$createRole = "SELECT 'CREATE ROLE $DbUser LOGIN PASSWORD ''$DbPassword'' CREATEDB' WHERE NOT EXISTS (SELECT FROM pg_roles WHERE rolname='$DbUser')\gexec"
$createDb   = "SELECT 'CREATE DATABASE $DbName OWNER $DbUser' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname='$DbName')\gexec"
& $psql -h localhost -p $DbPort -U postgres -d postgres -v ON_ERROR_STOP=1 -c $createRole
& $psql -h localhost -p $DbPort -U postgres -d postgres -v ON_ERROR_STOP=1 -c $createDb
Remove-Item Env:\PGPASSWORD
Ok 'Database ready'

# --- 6. write server/.env ----------------------------------
$envPath = Join-Path $ProjectDir 'server\.env'
$jwt = 'dev-only-secret-please-change-' + ([guid]::NewGuid().ToString('N'))
@"
DATABASE_URL="$DatabaseUrl"
PORT=$ApiPort
JWT_SECRET="$jwt"
"@ | Set-Content -Path $envPath -Encoding utf8
Ok "Wrote server\.env"

# --- 7. install dependencies -------------------------------
Info 'Installing project dependencies (npm)...'
npm run install:all
if ($LASTEXITCODE -ne 0) { throw 'npm install failed.' }
Ok 'Dependencies installed'

# --- 8. prisma generate + migrate + seed -------------------
Info 'Setting up the database schema and seed data...'
npm --prefix server run prisma:generate
if ($LASTEXITCODE -ne 0) { throw 'prisma generate failed.' }
npm --prefix server run prisma:deploy
if ($LASTEXITCODE -ne 0) { throw 'prisma migrate deploy failed.' }
npm --prefix server run seed
if ($LASTEXITCODE -ne 0) { Warn 'Seeding reported an error (data may already exist) - continuing.' }
Ok 'Database schema + seed ready'

# --- 9. open the browser once the web server is up ---------
Info 'Starting the app...'
Start-Job -Name OpenBrowser -ScriptBlock {
    param($port)
    for ($i = 0; $i -lt 60; $i++) {
        try {
            $c = New-Object Net.Sockets.TcpClient
            $c.Connect('localhost', $port)
            $c.Close()
            Start-Process "http://localhost:$port"
            break
        } catch { Start-Sleep -Seconds 1 }
    }
} -ArgumentList $WebPort | Out-Null

Write-Host ''
Write-Host '====================================================' -ForegroundColor Green
Write-Host "  All set! The app will open at http://localhost:$WebPort"  -ForegroundColor Green
Write-Host "  API runs on http://localhost:$ApiPort"                     -ForegroundColor Green
Write-Host ''
Write-Host '  Keep this window open while testing.'               -ForegroundColor Green
Write-Host '  Close it (or press Ctrl+C) to stop the app.'        -ForegroundColor Green
Write-Host '====================================================' -ForegroundColor Green
Write-Host ''

# --- 10. run server + client (blocks here) -----------------
npm run dev
