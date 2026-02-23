@echo off
setlocal EnableExtensions EnableDelayedExpansion
cd /d "%~dp0"

set "TARGET_PORT=5000"
set "STOPPED_ANY="
set "STOPPED_PID="
set "MANAGED_PID="

if exist ".server-pid" (
  set /p MANAGED_PID=<".server-pid" 2>nul
  if defined MANAGED_PID (
    taskkill /PID !MANAGED_PID! /F >nul 2>&1
    if errorlevel 1 (
      echo Could not stop managed PID !MANAGED_PID!. It may already be stopped.
    ) else (
      echo Stopped managed server PID !MANAGED_PID!.
      set "STOPPED_ANY=1"
      set "STOPPED_PID=!MANAGED_PID!"
    )
  )
)

call :find_port_pid %TARGET_PORT%
if defined PORT_PID (
  if /I not "!PORT_PID!"=="!STOPPED_PID!" (
    taskkill /PID !PORT_PID! /F >nul 2>&1
    if errorlevel 1 (
      echo Could not stop PID !PORT_PID! listening on port %TARGET_PORT%.
    ) else (
      echo Stopped PID !PORT_PID! listening on port %TARGET_PORT%.
      set "STOPPED_ANY=1"
    )
  )
)

if not defined STOPPED_ANY (
  if defined PORT_PID (
    echo Port %TARGET_PORT% is still in use by PID !PORT_PID!. Try running terminal as administrator.
  ) else (
    echo No running server PID found on port %TARGET_PORT%. Server may already be stopped.
  )
)

del /q ".server-port" ".server-pid" 2>nul
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
