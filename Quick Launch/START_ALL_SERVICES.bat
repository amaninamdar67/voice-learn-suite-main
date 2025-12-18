@echo off
REM Start 5 Frontend instances on ports 8000-8004

echo Starting 5 Frontend instances...
echo.

REM Frontend on port 8000
echo [1/5] Starting Frontend on port 8000...
start "Frontend 8000" cmd /k "npm run dev"
timeout /t 2 /nobreak

REM Frontend on port 8001
echo [2/5] Starting Frontend on port 8001...
start "Frontend 8001" cmd /k "npm run dev -- --port 8001"
timeout /t 2 /nobreak

REM Frontend on port 8002
echo [3/5] Starting Frontend on port 8002...
start "Frontend 8002" cmd /k "npm run dev -- --port 8002"
timeout /t 2 /nobreak

REM Frontend on port 8003
echo [4/5] Starting Frontend on port 8003...
start "Frontend 8003" cmd /k "npm run dev -- --port 8003"
timeout /t 2 /nobreak

REM Frontend on port 8004
echo [5/5] Starting Frontend on port 8004...
start "Frontend 8004" cmd /k "npm run dev -- --port 8004"

echo.
echo All 5 Frontend instances started!
echo Frontend 1: http://localhost:8000
echo Frontend 2: http://localhost:8001
echo Frontend 3: http://localhost:8002
echo Frontend 4: http://localhost:8003
echo Frontend 5: http://localhost:8004
echo.
pause
