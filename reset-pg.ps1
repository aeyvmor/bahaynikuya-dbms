# ============================================================
#  Reset the PostgreSQL superuser password and set up the app's
#  role + database, by temporarily enabling 'trust' auth.
#  Requires Administrator (to edit pg_hba.conf + restart svc).
# ============================================================

$ErrorActionPreference = 'Stop'
$DbName     = 'bahay_ni_kuya_db'
$DbUser     = 'bnk'
$DbPassword = 'bnk_password'
$SuperPass  = 'postgres'
$DbPort     = 5432

function Info($m) { Write-Host "==> $m" -ForegroundColor Cyan }
function Ok($m)   { Write-Host "[OK] $m" -ForegroundColor Green }

# --- elevate if needed -------------------------------------
$me = New-Object Security.Principal.WindowsPrincipal([Security.Principal.WindowsIdentity]::GetCurrent())
if (-not $me.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
    Info 'Requesting administrator rights...'
    Start-Process powershell -Verb RunAs -ArgumentList @(
        '-NoProfile','-ExecutionPolicy','Bypass','-File',"`"$PSCommandPath`""
    )
    return
}

trap {
    Write-Host ''
    Write-Host 'RESET FAILED:' -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Yellow
    Read-Host 'Press Enter to close'
    exit 1
}

# --- locate the install ------------------------------------
$binDir = Get-ChildItem 'C:\Program Files\PostgreSQL\*\bin\psql.exe' -ErrorAction SilentlyContinue |
          Sort-Object FullName -Descending | Select-Object -First 1 | ForEach-Object { $_.DirectoryName }
if (-not $binDir) { throw 'Could not find a PostgreSQL install under C:\Program Files\PostgreSQL.' }
$psql = Join-Path $binDir 'psql.exe'

$hba = Get-ChildItem 'C:\Program Files\PostgreSQL\*\data\pg_hba.conf' -ErrorAction SilentlyContinue |
       Sort-Object FullName -Descending | Select-Object -First 1 | ForEach-Object FullName
if (-not $hba) { throw 'Could not find pg_hba.conf (the PostgreSQL data folder).' }

$svc = Get-Service -Name 'postgresql*' -ErrorAction SilentlyContinue | Select-Object -First 1
if (-not $svc) { throw 'Could not find the PostgreSQL Windows service.' }

Info "Using: $psql"
Info "Config: $hba"
Info "Service: $($svc.Name)"

# --- back up pg_hba.conf, switch to trust auth -------------
$backup = "$hba.bnk-backup"
Copy-Item $hba $backup -Force
Ok "Backed up pg_hba.conf -> $backup"

$lines = Get-Content $hba
$patched = foreach ($line in $lines) {
    if ($line -match '^\s*#' -or $line -match '^\s*$') { $line }
    elseif ($line -match '^\s*(local|host|hostssl|hostnossl)\s') {
        # replace the final auth-method token with 'trust'
        $line -replace '(scram-sha-256|md5|password|peer|ident|gss|sspi|cert)\s*$', 'trust'
    } else { $line }
}
Set-Content -Path $hba -Value $patched -Encoding ascii
Info 'Switched to temporary trust auth.'

try {
    Restart-Service $svc.Name
    Start-Sleep -Seconds 3

    $sql = @"
ALTER ROLE postgres WITH PASSWORD '$SuperPass';
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
    $tmp = Join-Path $env:TEMP 'bnk_reset.sql'
    $sql | Set-Content -Path $tmp -Encoding utf8

    Info 'Resetting passwords and creating role + database...'
    & $psql -h localhost -p $DbPort -U postgres -d postgres -v ON_ERROR_STOP=1 -f $tmp
    $code = $LASTEXITCODE
    Remove-Item $tmp -ErrorAction SilentlyContinue
    if ($code -ne 0) { throw 'psql reported an error while applying the fix.' }
}
finally {
    # --- always restore the original auth config ----------
    Copy-Item $backup $hba -Force
    Restart-Service $svc.Name
    Start-Sleep -Seconds 2
    Info 'Restored original pg_hba.conf and restarted PostgreSQL.'
}

Ok 'Done!'
Write-Host ''
Write-Host "  postgres superuser password is now:  postgres"  -ForegroundColor Green
Write-Host "  app role '$DbUser' / database '$DbName' are ready." -ForegroundColor Green
Write-Host ''
Write-Host '  Now double-click RUN-APP.bat to start the app.'  -ForegroundColor Green
Write-Host ''
