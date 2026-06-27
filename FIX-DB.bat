@echo off
REM ============================================================
REM  Repairs the database role/login the app needs.
REM  Run this if you get: "Authentication failed ... role bnk".
REM ============================================================
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0fix-db.ps1"
pause
