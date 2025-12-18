@echo off
REM ============================================================
REM START EVERYTHING - FRONTEND + BACKEND
REM ============================================================
REM This script starts all frontend instances and all backend servers
REM Frontend: 5 instances on ports 8000-8004
REM Backend: 4 servers on ports 3001, 8002, 8003, 11434
REM ============================================================

setlocal enabledelayedexpansion

REM Get the project root directory
cd /d "%~dp0.."

echo.
echo ============================================================
echo STARTING ALL SERVICES (FRONTEND + BACKEND)
echo ============================================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

REM ============================================================
REM START BACKEND SERVERS
REM ============================================================
echo.
echo [BACKEND] Starting backend servers...
echo.

REM Start Main Backend Server (Port 3001)
echo [1/7] Starting Main Backend Server on port 3001...
start "Main Backend Server (3001)" cmd /k "cd backend && node server.js"
timeout /t 2 /nobreak

REM Start Voice Server (Port 8002)
echo [2/7] Starting Voice Server on port 8002...
start "Voice Server (8002)" cmd /k "cd backend && node voice-server.js"
timeout /t 2 /nobreak

REM Start Whisper Voice Server (Port 8003)
echo [3/7] Starting Whisper Voice Server on port 8003...
start "Whisper Voice Server (8003)" cmd /k "cd backend && node whisper-voice-server.js"
timeout /t 2 /nobreak

REM Start Ollama (Port 11434)
echo [4/7] Starting Ollama on port 11434...
where ollama >nul 2>nul
if %errorlevel% equ 0 (
    start "Ollama (11434)" cmd /k "ollama serve"
) else (
    echo SKIPPED: Ollama not found
)

REM ============================================================
REM START FRONTEND INSTANCES
REM ============================================================
echo.
echo [FRONTEND] Starting frontend instances...
echo.

REM Start Frontend Instance 1 (Port 8000)
echo [5/7] Starting Frontend Instance 1 on port 8000...
start "Frontend Instance 1 (8000)" cmd /k "npm run dev -- --port 8000"
timeout /t 3 /nobreak

REM Start Frontend Instance 2 (Port 8001)
echo [6/7] Starting Frontend Instance 2 on port 8001...
start "Frontend Instance 2 (8001)" cmd /k "npm run dev -- --port 8001"
timeout /t 3 /nobreak

REM Start Frontend Instance 3 (Port 8002) - Note: May conflict with Voice Server
echo [7/7] Starting Frontend Instance 3 on port 8002...
start "Frontend Instance 3 (8002)" cmd /k "npm run dev -- --port 8002"

echo.
echo ============================================================
echo ALL SERVICES STARTED
echo ============================================================
echo.
echo BACKEND SERVERS:
echo   - Main Backend:        http://localhost:3001
echo   - Voice Server:        http://localhost:8002
echo   - Whisper Server:      http://localhost:8003
echo   - Ollama:              http://localhost:11434
echo.
echo FRONTEND INSTANCES:
echo   - Instance 1:          http://localhost:8000
echo   - Instance 2:          http://localhost:8001
echo   - Instance 3:          http://localhost:8002 (may conflict)
echo.
echo NOTE: Frontend instances 4 & 5 (ports 8003-8004) not started
echo       to avoid conflicts with backend servers
echo.
echo To stop all services, run: STOP_ALL.bat
echo.
echo ============================================================
echo.

pause
