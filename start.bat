@echo off
title Ledger - keep this window open
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js not found. Install the LTS version from https://nodejs.org and run this again.
  pause
  exit /b 1
)
if not exist "server.exe" (
  echo The replay engine is missing. Run setup.bat first.
  pause
  exit /b 1
)
rem clean up engines left over from a previous run, then start them hidden
taskkill /f /im server.exe >nul 2>nul
taskkill /f /im bot.exe >nul 2>nul
rem keep the raw engine port closed to other computers (needs admin rights, silently skipped otherwise)
netsh advfirewall firewall show rule name="Ledger8081" >nul 2>nul || netsh advfirewall firewall add rule name="Ledger8081" dir=in action=block protocol=TCP localport=8081 >nul 2>nul
set BOT_PORT=8082
powershell -NoProfile -Command "Start-Process -WindowStyle Hidden -FilePath '.\bot.exe'"
timeout /t 2 /nobreak >nul
powershell -NoProfile -Command "Start-Process -WindowStyle Hidden -FilePath '.\server.exe'"
timeout /t 2 /nobreak >nul
start "" http://localhost:8080
cls
node gate\gate.js
taskkill /f /im server.exe >nul 2>nul
taskkill /f /im bot.exe >nul 2>nul
pause
