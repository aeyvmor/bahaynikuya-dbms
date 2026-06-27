# ============================================================
#  Create / repair the 'bnk' role + 'bahay_ni_kuya_db' database
#  so the app can authenticate. Connects as the postgres
#  superuser (it will ask for that password).
# ============================================================

$ErrorActionPreference = 'Stop'
$DbName     = 'bahay_ni_kuya_db'
$DbUser     = 'bnk'
$DbPassword = 'bnk_password'
$DbPort     = 5432

function Info($m) { Write-Host "==> $m" -ForegroundColor Cyan }
function Ok($m)   { Write-Host "[OK] $m" -ForegroundColor Green }

# locate psql
$psql = Get-ChildItem 'C:\Program Files\PostgreSQL\*\bin\psql.exe' -ErrorAction SilentlyContinue |
        Sort-Object FullName -Descending | Select-Object -First 1 | ForEach-Object FullName
if (-not $psql) { if (Get-Command psql -ErrorAction SilentlyContinue) { $psql = 'psql' } }
if (-not $psql) {
    Write-Host 'Could not find psql.exe. Is PostgreSQL installed?' -ForegroundColor Red
    Read-Host 'Press Enter to close'; exit 1
}

Write-Host ''
Write-Host 'Enter the password for the PostgreSQL superuser (user: postgres).' -ForegroundColor Yellow
Write-Host 'This is the password set when PostgreSQL was installed.'           -ForegroundColor Yellow
Write-Host '(If the auto-installer set it, it is most likely:  postgres )'     -ForegroundColor Yellow
$secure = Read-Host 'postgres password' -AsSecureString
$bstr   = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
$env:PGPASSWORD = [Runtime.InteropServices.Marshal]::PtrToStringAuto($bstr)
[Runtime.InteropServices.Marshal]::ZeroFreeBSTR($bstr)

# create-or-update the role (sets password either way), then the database
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

$tmp = Join-Path $env:TEMP 'bnk_fixdb.sql'
$sql | Set-Content -Path $tmp -Encoding utf8

Info 'Repairing role + database...'
& $psql -h localhost -p $DbPort -U postgres -d postgres -v ON_ERROR_STOP=1 -f $tmp
$code = $LASTEXITCODE
Remove-Item $tmp -ErrorAction SilentlyContinue
Remove-Item Env:\PGPASSWORD -ErrorAction SilentlyContinue

if ($code -ne 0) {
    Write-Host ''
    Write-Host 'Failed - most likely the postgres password was wrong.' -ForegroundColor Red
    Write-Host 'Re-run FIX-DB.bat and try the correct password.'        -ForegroundColor Red
    Read-Host 'Press Enter to close'; exit 1
}

Ok "Role '$DbUser' and database '$DbName' are ready."
Write-Host ''
Write-Host 'Now double-click RUN-APP.bat to start the app.' -ForegroundColor Green
Write-Host ''
