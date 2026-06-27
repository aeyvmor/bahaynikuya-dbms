@echo off
REM ============================================================
REM  Resets the PostgreSQL 'postgres' superuser password to
REM  'postgres' AND creates the app's 'bnk' role + database.
REM  Use this when FIX-DB says the postgres password is wrong.
REM  Requires admin (it will prompt).
REM ============================================================
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0reset-pg.ps1"
pause
