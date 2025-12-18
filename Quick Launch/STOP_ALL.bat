@echo off
REM ============================================================
REM STOP EVERYTHING - FRONTEND + BACKEND
REM ============================================================
REM This script stops all frontend instances and backend servers
REM Frontend: Ports 8000-8004
REM Backend: Ports 3001, 8002, 8003, 11434
REM ============================================================

setlocal enabledelayedexpansion

echo.
echo ============================================================
echo STOPPING ALL SERVICES (FRONTEND + BACKEND)
echo ============================================================
echo.

REM Function to kill process on specific port
REM Usage: call :killPort PORT_NUMBER
:killPort
set port=%1
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :%port%') do (
    taskkill /PID %%a /F >nul 2>&1
    if !errorlevel! equ 0 (
        echo   [OK] Port %port% - Process killed
    ) else (
        echo   [INFO] Port %port% - No process found
    )
)
goto :eof

REM ============================================================
REM STOP BACKEND SERVERS
REM ============================================================
echo [BACKEND] Stopping backend servers...
echo.

echo [1/9] Stopping Main Backend Server (port 3001)...
call :killPort 3001
timeout /t 1 /nobreak

echo [2/9] Stopping Voice Server (port 8002)...
call :killPort 8002
timeout /t 1 /nobreak

echo [3/9] Stopping Whisper Voice Server (port 8003)...
call :killPort 8003
timeout /t 1 /nobreak

echo [4/9] Stopping Ollama (port 11434)...
call :killPort 11434
timeout /t 1 /nobreak

REM ============================================================
REM STOP FRONTEND INSTANCES
REM ============================================================
echo.
echo [FRONTEND] Stopping frontend instances...
echo.

echo [5/9] Stopping Frontend Instance 1 (port 8000)...
call :killPort 8000
timeout /t 1 /nobreak

echo [6/9] Stopping Frontend Instance 2 (port 8001)...
call :killPort 8001
timeout /t 1 /nobreak

echo [7/9] Stopping Frontend Instance 3 (port 8002)...
call :killPort 8002
timeout /t 1 /nobreak

echo [8/9] Stopping Frontend Instance 4 (port 8003)...
call :killPort 8003
timeout /t 1 /nobreak

echo [9/9] Stopping Frontend Instance 5 (port 8004)...
call :killPort 8004
timeout /t 1 /nobreak

REM ============================================================
REM CLEANUP
REM ============================================================
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
echo ALL SERVICES STOPPED
echo ============================================================
echo.
echo Stopped Services:
echo   - Main Backend (3001)
echo   - Voice Server (8002)
echo   - Whisper Server (8003)
echo   - Ollama (11434)
echo   - Frontend Instances (8000-8004)
echo.
echo To start all services again, run: START_ALL.bat
echo To start only backend, run: START_BACKEND_SERVERS.bat
echo.
echo ============================================================
echo.

pause
