@echo off
REM ============================================================
REM STOP ALL BACKEND SERVERS
REM ============================================================
REM This script stops all running backend servers
REM Kills processes on ports: 3001, 8002, 8003, 11434
REM ============================================================

setlocal enabledelayedexpansion

echo.
echo ============================================================
echo STOPPING ALL BACKEND SERVERS
echo ============================================================
echo.

REM Function to kill process on specific port
REM Usage: call :killPort PORT_NUMBER
:killPort
set port=%1
echo Stopping server on port %port%...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :%port%') do (
    taskkill /PID %%a /F >nul 2>&1
    if !errorlevel! equ 0 (
        echo   [OK] Port %port% - Process killed
    ) else (
        echo   [INFO] Port %port% - No process found
    )
)
goto :eof

REM Stop Main Backend Server (Port 3001)
echo [1/4] Stopping Main Backend Server (port 3001)...
call :killPort 3001
timeout /t 1 /nobreak

REM Stop Voice Server (Port 8002)
echo [2/4] Stopping Voice Server (port 8002)...
call :killPort 8002
timeout /t 1 /nobreak

REM Stop Whisper Voice Server (Port 8003)
echo [3/4] Stopping Whisper Voice Server (port 8003)...
call :killPort 8003
timeout /t 1 /nobreak

REM Stop Ollama (Port 11434)
echo [4/4] Stopping Ollama (port 11434)...
call :killPort 11434
timeout /t 1 /nobreak

REM Kill all Node processes as backup
echo.
echo Cleaning up any remaining Node processes...
taskkill /IM node.exe /F >nul 2>&1
if !errorlevel! equ 0 (
    echo   [OK] All Node processes terminated
) else (
    echo   [INFO] No Node processes found
)

echo.
echo ============================================================
echo ALL BACKEND SERVERS STOPPED
echo ============================================================
echo.
echo Verification:
echo   - Main Backend:        Stopped
echo   - Voice Server:        Stopped
echo   - Whisper Server:      Stopped
echo   - Ollama:              Stopped
echo.
echo To start all servers again, run: START_BACKEND_SERVERS.bat
echo.
echo ============================================================
echo.

pause
