@echo off
chcp 65001 >nul
title DotaTraker - keep this window open
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo  Node.js is not installed. Install the LTS version from nodejs.org and open start.bat again.
  start "" https://nodejs.org
  pause
  exit /b 1
)
if not exist "engine\server.exe" (
  if exist "server.exe" (
    echo  Moving the replay engine into the engine folder...
    mkdir engine >nul 2>nul
    move /y server.exe engine\ >nul
    if exist bot.exe move /y bot.exe engine\ >nul
    if exist assets xcopy /e /i /q /y assets engine\assets >nul
  ) else (
    echo  The replay engine is missing. Open setup.bat first.
    pause
    exit /b 1
  )
)
rem stop engines left over from a previous run: only the ones from this folder
powershell -NoProfile -Command "Get-Process server,bot -ErrorAction SilentlyContinue | Where-Object { $_.Path -and $_.Path.StartsWith('%~dp0engine\', [StringComparison]::OrdinalIgnoreCase) } | Stop-Process -Force" >nul 2>nul
rem keep the raw engine port closed to other computers (needs admin rights, silently skipped otherwise)
netsh advfirewall firewall show rule name="Ledger8081" >nul 2>nul || netsh advfirewall firewall add rule name="Ledger8081" dir=in action=block protocol=TCP localport=8081 >nul 2>nul
set DOTATRAKER_LOOP=1
cls
:run
node gate\gate.js
if %errorlevel%==75 (
  echo  Updated. Starting DotaTraker again...
  set LEDGER_OPEN=0
  goto run
)
echo.
echo  DotaTraker stopped.
pause
