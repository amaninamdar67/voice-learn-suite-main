@echo off
REM ============================================================
REM CHECK SERVICE STATUS
REM ============================================================
REM This script checks which services are currently running
REM ============================================================

setlocal enabledelayedexpansion

echo.
echo ============================================================
echo SERVICE STATUS CHECK
echo ============================================================
echo.

REM Function to check if port is in use
REM Usage: call :checkPort PORT_NUMBER SERVICE_NAME
:checkPort
set port=%1
set service=%2
for /f "tokens=5" %%a in ('netstat -ano 2^>nul ^| findstr :%port%') do (
    echo [RUNNING] %service% on port %port% (PID: %%a)
    goto :eof
)
echo [STOPPED] %service% on port %port%
goto :eof

REM ============================================================
REM CHECK BACKEND SERVICES
REM ============================================================
echo BACKEND SERVICES:
echo.
call :checkPort 3001 "Main Backend Server"
call :checkPort 8002 "Voice Server"
call :checkPort 8003 "Whisper Voice Server"
call :checkPort 11434 "Ollama"

REM ============================================================
REM CHECK FRONTEND SERVICES
REM ============================================================
echo.
echo FRONTEND INSTANCES:
echo.
call :checkPort 8000 "Frontend Instance 1"
call :checkPort 8001 "Frontend Instance 2"
call :checkPort 8002 "Frontend Instance 3"
call :checkPort 8003 "Frontend Instance 4"
call :checkPort 8004 "Frontend Instance 5"

REM ============================================================
REM CHECK NODE PROCESSES
REM ============================================================
echo.
echo NODE PROCESSES:
echo.
tasklist /FI "IMAGENAME eq node.exe" 2>nul
if %errorlevel% neq 0 (
    echo No Node processes found
)

REM ============================================================
REM SUMMARY
REM ============================================================
echo.
echo ============================================================
echo QUICK ACTIONS:
echo.
echo To start backend:  START_BACKEND_SERVERS.bat
echo To stop backend:   STOP_BACKEND_SERVERS.bat
echo To start all:      START_ALL.bat
echo To stop all:       STOP_ALL.bat
echo.
echo ============================================================
echo.

pause
