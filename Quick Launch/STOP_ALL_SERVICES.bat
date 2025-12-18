@echo off
REM Stop all running services

echo Stopping all services...
echo.

REM Kill Node processes (backend, voice, whisper)
echo Stopping Node.js services...
taskkill /F /IM node.exe

REM Kill Ollama
echo Stopping Ollama...
taskkill /F /IM ollama.exe

echo.
echo All services stopped!
pause
