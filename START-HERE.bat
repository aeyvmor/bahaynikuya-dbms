@echo off
REM ============================================================
REM  Bahay ni Kuya - one click setup + run (Windows)
REM  Double-click this file. It will ask for admin (needed to
REM  install Node + PostgreSQL), then set everything up and
REM  open the app in your browser.
REM ============================================================
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0setup-and-run.ps1"
echo.
echo (If a window closed unexpectedly, re-run this file.)
pause
