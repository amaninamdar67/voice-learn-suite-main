@echo off
echo.
echo ========================================
echo   AI TUTOR QUICK START
echo ========================================
echo.
echo Starting Ollama server...
echo.

REM Check if Ollama is installed
where ollama >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Ollama is not installed or not in PATH
    echo.
    echo Download Ollama from: https://ollama.ai
    echo.
    pause
    exit /b 1
)

REM Start Ollama
ollama serve

REM If Ollama exits, show message
echo.
echo Ollama server stopped.
pause
