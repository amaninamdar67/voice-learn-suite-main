@echo off
echo ========================================
echo   Starting Whisper Voice Navigation
echo ========================================
echo.

REM Check if Whisper exists
if not exist "C:\Users\Downloads\whisper-bin-x64\Release\main.exe" (
    echo ERROR: Whisper not found!
    echo Please download from: https://github.com/ggerganov/whisper.cpp/releases
    echo Extract to: C:\Users\Downloads\whisper-bin-x64\
    pause
    exit /b 1
)

REM Check if model exists (you have ggml-tiny.bin!)
if not exist "C:\Users\Downloads\whisper-bin-x64\Release\models\ggml-tiny.bin" (
    echo ERROR: Whisper model not found!
    echo Expected: C:\Users\Downloads\whisper-bin-x64\Release\models\ggml-tiny.bin
    pause
    exit /b 1
)

echo ✓ Whisper found
echo ✓ Model found
echo.
echo Starting Whisper Voice Server...
echo.

cd backend
node whisper-voice-server.js

pause
