@echo off
echo ========================================
echo   Starting All Servers
echo ========================================
echo.

echo Starting AI Tutor Server (Ollama)...
start "AI Tutor Server" cmd /k "cd backend && node ollama-server.js"
timeout /t 2 /nobreak >nul

echo.
echo ========================================
echo   All Servers Started!
echo ========================================
echo.
echo ✅ AI Tutor Server - http://localhost:3003
echo.
echo Now run: npm run dev
echo.
echo Press any key to exit...
pause >nul
