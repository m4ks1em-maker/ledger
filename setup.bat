@echo off
title Ledger setup
cd /d "%~dp0"
echo.
echo  Downloading the replay engine (d3nd3/dota-report-timestamps, MIT licence)...
echo.
powershell -NoProfile -ExecutionPolicy Bypass -Command "$ErrorActionPreference='Stop'; $r=Invoke-RestMethod 'https://api.github.com/repos/d3nd3/dota-report-timestamps/releases/latest' -Headers @{'User-Agent'='ledger-setup'}; $a=$r.assets | Where-Object { $_.name -like '*windows*.zip' } | Select-Object -First 1; if(-not $a){ throw 'No Windows release found' }; $z=Join-Path $env:TEMP 'ledger-engine.zip'; Invoke-WebRequest $a.browser_download_url -OutFile $z; $d=Join-Path $env:TEMP 'ledger-engine'; if(Test-Path $d){ Remove-Item $d -Recurse -Force }; Expand-Archive $z $d; $root=(Get-ChildItem $d -Recurse -Filter server.exe | Select-Object -First 1).Directory.FullName; Copy-Item (Join-Path $root 'server.exe'),(Join-Path $root 'bot.exe') . -Force; if(Test-Path (Join-Path $root 'assets')){ Copy-Item (Join-Path $root 'assets') . -Recurse -Force }; Remove-Item $z,$d -Recurse -Force; Write-Host 'Done.'"
if errorlevel 1 (
  echo.
  echo  Setup failed. Download the Windows release by hand from
  echo  https://github.com/d3nd3/dota-report-timestamps/releases
  echo  and copy server.exe, bot.exe and the assets folder next to this file.
  pause
  exit /b 1
)
echo.
echo  Engine installed. Now run start.bat
pause
