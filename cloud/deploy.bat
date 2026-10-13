@echo off
chcp 65001 >nul
title Ledger key server
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo  Node.js is not installed. Install the LTS version from nodejs.org and run this again.
  start "" https://nodejs.org
  pause
  exit /b 1
)
echo  Installing the Cloudflare tool, this takes a minute the first time...
call npm install --no-audit --no-fund --loglevel=error
if errorlevel 1 (
  echo  npm install failed.
  pause
  exit /b 1
)
node setup.js %*
pause
