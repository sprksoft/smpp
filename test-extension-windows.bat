@echo off
setlocal

where bun >nul 2>&1
if %errorlevel% neq 0 (
  echo Oeps, Bun staat nog niet op je pc.
  echo Installeer Bun eerst via: https://bun.sh/docs/installation
  exit /b 1
)

echo.
echo We beginnen met de dependencies installeren...
bun install --frozen-lockfile
if %errorlevel% neq 0 exit /b %errorlevel%

echo.
echo Mooi, nu controleren we de code (lint/format checks)...
bun run ci
if %errorlevel% neq 0 exit /b %errorlevel%

echo.
echo Daarna maken we de build van de extensie...
bun run build
if %errorlevel% neq 0 exit /b %errorlevel%

echo.
echo Klaar! Alles is goed doorlopen.
echo Je kan nu deze map laden als unpacked extensie:
echo %cd%\extension
echo In Chrome ga je naar: chrome://extensions
echo Zet Ontwikkelaarsmodus aan en klik op "Load unpacked".

exit /b 0
