@echo off
echo ========================================
echo Starting AI Voice System
echo ========================================
echo.

echo Checking Ollama...
ollama list
if errorlevel 1 (
    echo ERROR: Ollama not found! Please install from https://ollama.com/download
    pause
    exit
)

echo.
echo Starting Voice Server...
start "Voice Server" cmd /k "cd backend && node voice-server.js"

timeout /t 2 /nobreak >nul

echo.
echo ========================================
echo AI Voice System Started!
echo ========================================
echo.
echo Voice Server: http://localhost:3003
echo.
echo Press any key to stop all servers...
pause >nul

taskkill /FI "WINDOWTITLE eq Voice Server*" /T /F
echo Servers stopped.
