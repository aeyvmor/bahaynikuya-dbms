@echo off
REM ============================================================
REM  Bahay ni Kuya - just RUN the app (Node + PostgreSQL must
REM  already be installed, e.g. by START-HERE.bat).
REM  No admin needed. Boots server + client and opens browser.
REM ============================================================
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0run-app.ps1"
pause
