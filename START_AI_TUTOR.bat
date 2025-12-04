@echo off
echo ========================================
echo   Starting AI Tutor with Ollama
echo ========================================
echo.

REM Check if Ollama is running
echo Checking Ollama status...
curl -s http://localhost:11434/api/tags >nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo ERROR: Ollama is not running!
    echo Please start Ollama first:
    echo   1. Open Ollama app
    echo   OR
    echo   2. Run: ollama serve
    echo.
    pause
    exit /b 1
)

echo ✓ Ollama is running
echo.
echo Starting AI Tutor Server...
echo.

cd backend
node ollama-server.js

pause
