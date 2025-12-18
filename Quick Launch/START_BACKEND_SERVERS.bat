@echo off
REM ============================================================
REM AUTO START ALL BACKEND SERVERS
REM ============================================================
REM This script starts all required backend servers in separate windows
REM Servers: Main (3001), Voice (8002), Whisper (8003), Ollama (11434)
REM ============================================================

setlocal enabledelayedexpansion

REM Get the project root directory
cd /d "%~dp0.."

echo.
echo ============================================================
echo STARTING ALL BACKEND SERVERS
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

REM Check if Ollama is installed
where ollama >nul 2>nul
if %errorlevel% neq 0 (
    echo WARNING: Ollama is not installed or not in PATH
    echo Ollama server will not start
    echo Install from: https://ollama.ai/
    echo.
)

REM Start Main Backend Server (Port 3001)
echo [1/4] Starting Main Backend Server on port 3001...
start "Main Backend Server (3001)" cmd /k "cd backend && node server.js"
timeout /t 2 /nobreak

REM Start Voice Server (Port 8002)
echo [2/4] Starting Voice Server on port 8002...
start "Voice Server (8002)" cmd /k "cd backend && node voice-server.js"
timeout /t 2 /nobreak

REM Start Whisper Voice Server (Port 8003)
echo [3/4] Starting Whisper Voice Server on port 8003...
start "Whisper Voice Server (8003)" cmd /k "cd backend && node whisper-voice-server.js"
timeout /t 2 /nobreak

REM Start Ollama (Port 11434)
echo [4/4] Starting Ollama on port 11434...
where ollama >nul 2>nul
if %errorlevel% equ 0 (
    start "Ollama (11434)" cmd /k "ollama serve"
) else (
    echo SKIPPED: Ollama not found
)

echo.
echo ============================================================
echo ALL BACKEND SERVERS STARTED
echo ============================================================
echo.
echo Server Status:
echo   - Main Backend:        http://localhost:3001
echo   - Voice Server:        http://localhost:8002
echo   - Whisper Server:      http://localhost:8003
echo   - Ollama:              http://localhost:11434
echo.
echo To stop all servers, run: STOP_BACKEND_SERVERS.bat
echo Or close each terminal window individually
echo.
echo ============================================================
echo.

pause
