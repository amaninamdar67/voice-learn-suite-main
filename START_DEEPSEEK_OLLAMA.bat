@echo off
echo ========================================
echo Starting DeepSeek-R1:1.5B with Ollama
echo ========================================
echo.
echo Checking if Ollama is installed...
ollama --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Ollama is not installed!
    echo Please download and install Ollama from: https://ollama.ai
    echo.
    pause
    exit /b 1
)
echo Ollama is installed!
echo.
echo Pulling DeepSeek-R1:1.5B model (if not already downloaded)...
ollama pull deepseek-r1:1.5b
echo.
echo ========================================
echo Starting Ollama service on port 11434
echo ========================================
echo.
echo The AI Tutor will now be available at:
echo http://localhost:11434
echo.
echo Keep this window open while using the AI Tutor!
echo Press Ctrl+C to stop the service.
echo.
ollama serve
