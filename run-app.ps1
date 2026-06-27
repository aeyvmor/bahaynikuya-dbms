# ============================================================
#  Bahay ni Kuya - run the app only (no installs, no admin).
#  Assumes Node + PostgreSQL are already installed.
# ============================================================

$ErrorActionPreference = 'Stop'
$ProjectDir  = $PSScriptRoot
$DbName      = 'bahay_ni_kuya_db'
$DbUser      = 'bnk'
$DbPassword  = 'bnk_password'
$DbPort      = 5432
$ApiPort     = 4000
$WebPort     = 5173
$DatabaseUrl = "postgresql://$DbUser`:$DbPassword@localhost:$DbPort/$DbName`?schema=public"

function Info($m) { Write-Host "==> $m" -ForegroundColor Cyan }
function Ok($m)   { Write-Host "[OK] $m" -ForegroundColor Green }
function Warn($m) { Write-Host "[!]  $m" -ForegroundColor Yellow }

trap {
    Write-Host ''
    Write-Host 'SOMETHING WENT WRONG:' -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Yellow
    Read-Host 'Press Enter to close'
    exit 1
}

Set-Location $ProjectDir

# sanity: is Node available?
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    throw 'Node is not installed / not on PATH. Run START-HERE.bat first (it installs Node + PostgreSQL).'
}

# make sure the PostgreSQL service is running
$svc = Get-Service -Name 'postgresql*' -ErrorAction SilentlyContinue | Select-Object -First 1
if ($svc -and $svc.Status -ne 'Running') {
    Info "Starting PostgreSQL service ($($svc.Name))..."
    try { Start-Service $svc.Name } catch { Warn 'Could not start the PostgreSQL service automatically.' }
    Start-Sleep -Seconds 2
}

# make sure server/.env exists
$envPath = Join-Path $ProjectDir 'server\.env'
if (-not (Test-Path $envPath)) {
    Info 'Creating server\.env...'
    $jwt = 'dev-only-secret-' + ([guid]::NewGuid().ToString('N'))
@"
DATABASE_URL="$DatabaseUrl"
PORT=$ApiPort
JWT_SECRET="$jwt"
"@ | Set-Content -Path $envPath -Encoding utf8
    Ok 'Wrote server\.env'
}

# make sure dependencies are installed
if (-not (Test-Path (Join-Path $ProjectDir 'node_modules')) -or
    -not (Test-Path (Join-Path $ProjectDir 'server\node_modules')) -or
    -not (Test-Path (Join-Path $ProjectDir 'client\node_modules'))) {
    Info 'Installing dependencies (first run only)...'
    npm run install:all
    if ($LASTEXITCODE -ne 0) { throw 'npm install failed.' }
}

# make sure the schema + seed are applied (idempotent)
Info 'Applying database schema + seed (safe to repeat)...'
npm --prefix server run prisma:generate | Out-Null
npm --prefix server run prisma:deploy
if ($LASTEXITCODE -ne 0) {
    throw "Could not reach the database. Make sure PostgreSQL is running and the '$DbUser' role / '$DbName' database exist on port $DbPort."
}
npm --prefix server run seed
Ok 'Database ready'

# open the browser once the web server is listening
Start-Job -Name OpenBrowser -ScriptBlock {
    param($port)
    for ($i = 0; $i -lt 60; $i++) {
        try {
            $c = New-Object Net.Sockets.TcpClient
            $c.Connect('localhost', $port); $c.Close()
            Start-Process "http://localhost:$port"; break
        } catch { Start-Sleep -Seconds 1 }
    }
} -ArgumentList $WebPort | Out-Null

Write-Host ''
Write-Host '====================================================' -ForegroundColor Green
Write-Host "  Running. Browser opens at http://localhost:$WebPort" -ForegroundColor Green
Write-Host "  API at http://localhost:$ApiPort"                    -ForegroundColor Green
Write-Host '  Keep this window open. Ctrl+C to stop.'              -ForegroundColor Green
Write-Host '====================================================' -ForegroundColor Green
Write-Host ''

npm run dev
