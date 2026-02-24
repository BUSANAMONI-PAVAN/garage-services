@echo off
setlocal EnableExtensions EnableDelayedExpansion
cd /d "%~dp0"

set "TARGET_PORT=5000"
set "PORT_FILE=.server-port"
set "PID_FILE=.server-pid"

del /q "%PORT_FILE%" 2>nul

set "MANAGED_PID="
if exist "%PID_FILE%" (
  set /p MANAGED_PID=<"%PID_FILE%" 2>nul
  if defined MANAGED_PID (
    echo Stopping managed server PID !MANAGED_PID!...
    taskkill /PID !MANAGED_PID! /F >nul 2>&1
    if errorlevel 1 (
      echo Managed PID !MANAGED_PID! could not be stopped or is already stopped.
    ) else (
      timeout /t 1 /nobreak >nul
    )
  )
  del /q "%PID_FILE%" 2>nul
)

call :find_port_pid %TARGET_PORT%
if defined PORT_PID (
  echo Port %TARGET_PORT% is already in use by PID !PORT_PID!.
  echo Run stop-project.cmd or stop that process, then retry.
  exit /b 1
)

for /f %%T in ('powershell -NoProfile -Command "Get-Date -Format yyyyMMdd-HHmmss"') do set "STAMP=%%T"
set "LOG_FILE=.server-%STAMP%.log"
> ".server-log" echo %LOG_FILE%

start "" /b cmd /c "node api-server.js > %LOG_FILE% 2>&1"

set "STARTED_PORT="
for /f %%P in ('powershell -NoProfile -Command "$p='.server-port'; $deadline=(Get-Date).AddSeconds(20); while((Get-Date)-lt $deadline){ if(Test-Path $p){ $v=(Get-Content $p -Raw).Trim(); if($v){ Write-Output $v; exit 0 } }; Start-Sleep -Milliseconds 500 }; exit 1"') do set "STARTED_PORT=%%P"

if not defined STARTED_PORT (
  echo Server did not start within 20 seconds.
  echo Check !LOG_FILE! for errors.
  exit /b 1
)

if not "!STARTED_PORT!"=="%TARGET_PORT%" (
  echo Unexpected port reported: !STARTED_PORT!. Expected %TARGET_PORT%.
  echo Check !LOG_FILE! for errors.
  exit /b 1
)

powershell -NoProfile -Command "try { $r=Invoke-WebRequest -UseBasicParsing ('http://localhost:%TARGET_PORT%/') -TimeoutSec 5; if($r.StatusCode -eq 200){ exit 0 } else { Write-Host ('Unexpected status: ' + $r.StatusCode); exit 1 } } catch { Write-Host $_.Exception.Message; exit 1 }"
if errorlevel 1 (
  echo Local health check failed on http://localhost:%TARGET_PORT%/
  echo Check !LOG_FILE! for details.
  exit /b 1
)

echo Server started on http://localhost:%TARGET_PORT%
echo Open this URL in browser: http://localhost:%TARGET_PORT%
echo If browser still fails, run: type !LOG_FILE!
exit /b 0

:find_port_pid
set "PORT_PID="
for /f "tokens=5" %%P in ('netstat -ano ^| findstr /R /C:":%~1 .*LISTENING"') do (
  if not "%%P"=="0" (
    set "PORT_PID=%%P"
    goto :eof
  )
)
goto :eof
