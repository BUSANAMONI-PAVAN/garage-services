@echo off
setlocal EnableExtensions
cd /d "%~dp0"

if /I "%~1"=="--help" goto :help

if not exist ".env" (
  echo [WARN] .env file not found.
  if exist ".env.example" (
    echo        Copy .env.example to .env and set JAVA_DB_URL / JAVA_DB_USER.
  ) else (
    echo        Create .env with JAVA_DB_URL / JAVA_DB_USER at minimum.
  )
)

echo Starting Garage Services desktop app...
echo This starts the Java Swing UI and does not use localhost:5000.
set "MAVEN_USER_HOME=%CD%\.m2"
set "MAVEN_REPO=%CD%\.m2\repository"
call .\mvnw.cmd -Dmaven.repo.local="%MAVEN_REPO%" -DskipTests compile exec:java
set "EXIT_CODE=%ERRORLEVEL%"

if not "%EXIT_CODE%"=="0" (
  echo.
  echo Desktop app failed to start. Verify:
  echo   1. Java 17+ is installed
  echo   2. MySQL is running
  echo   3. JAVA_DB_URL and JAVA_DB_USER are set in .env
  echo   4. Tables are created from sql\setup.sql
)

exit /b %EXIT_CODE%

:help
echo Usage: run-desktop.cmd
echo Launches the Java Swing desktop application.
exit /b 0
