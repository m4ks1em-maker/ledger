@echo off
chcp 65001 >nul
title DotaTraker setup
cd /d "%~dp0"
echo.
echo  DotaTraker setup
echo  ------------
where node >nul 2>nul
if errorlevel 1 (
  echo  Node.js is not installed. Opening nodejs.org: install the LTS version, then run setup.bat again.
  start "" https://nodejs.org
  pause
  exit /b 1
)
echo  Downloading the replay engine from github.com/d3nd3/dota-report-timestamps ...
echo.
powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$ErrorActionPreference='Stop';" ^
  "$r=Invoke-RestMethod 'https://api.github.com/repos/d3nd3/dota-report-timestamps/releases/latest' -Headers @{'User-Agent'='ledger-setup'};" ^
  "$a=$r.assets | Where-Object { $_.name -like '*windows*.zip' } | Select-Object -First 1;" ^
  "if(-not $a){ throw 'No Windows release found' };" ^
  "$z=Join-Path $env:TEMP 'ledger-engine.zip'; Invoke-WebRequest $a.browser_download_url -OutFile $z;" ^
  "$d=Join-Path $env:TEMP 'ledger-engine'; if(Test-Path $d){ Remove-Item $d -Recurse -Force }; Expand-Archive $z $d;" ^
  "$root=(Get-ChildItem $d -Recurse -Filter server.exe | Select-Object -First 1).Directory.FullName;" ^
  "$e=Join-Path (Get-Location) 'engine'; New-Item -ItemType Directory -Force $e | Out-Null;" ^
  "Copy-Item (Join-Path $root 'server.exe'),(Join-Path $root 'bot.exe') $e -Force;" ^
  "if(Test-Path (Join-Path $root 'assets')){ Copy-Item (Join-Path $root 'assets') $e -Recurse -Force };" ^
  "Remove-Item $z,$d -Recurse -Force; Write-Host '  Engine installed.'"
if errorlevel 1 (
  echo.
  echo  Setup failed. Download the Windows release by hand from
  echo  https://github.com/d3nd3/dota-report-timestamps/releases
  echo  and put server.exe, bot.exe and the assets folder into the engine folder next to this file.
  pause
  exit /b 1
)
rem DotaTraker 1.x kept the engine next to this file; the engine folder replaces it
for %%f in (server.exe bot.exe) do if exist "%%f" del /q "%%f" >nul 2>nul
if exist "assets\portraits" rmdir /s /q "assets" >nul 2>nul
echo.
echo  Done. Now open start.bat
echo.
pause
