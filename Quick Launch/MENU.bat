@echo off
REM ============================================================
REM INTERACTIVE MENU - QUICK LAUNCH
REM ============================================================
REM Main menu for easy access to all scripts
REM ============================================================

setlocal enabledelayedexpansion

:menu
cls
echo.
echo ============================================================
echo          E-LEARNING PLATFORM - QUICK LAUNCH MENU
echo ============================================================
echo.
echo Select an option:
echo.
echo   [1] Start Backend Servers Only
echo   [2] Stop Backend Servers
echo   [3] Start Everything (Frontend + Backend)
echo   [4] Stop Everything
echo   [5] Check Service Status
echo   [6] View Backend Commands
echo   [7] View Documentation
echo   [8] Exit
echo.
echo ============================================================
echo.

set /p choice="Enter your choice (1-8): "

if "%choice%"=="1" (
    echo.
    echo Starting backend servers...
    echo.
    call START_BACKEND_SERVERS.bat
    goto menu
)

if "%choice%"=="2" (
    echo.
    echo Stopping backend servers...
    echo.
    call STOP_BACKEND_SERVERS.bat
    goto menu
)

if "%choice%"=="3" (
    echo.
    echo Starting everything...
    echo.
    call START_ALL.bat
    goto menu
)

if "%choice%"=="4" (
    echo.
    echo Stopping everything...
    echo.
    call STOP_ALL.bat
    goto menu
)

if "%choice%"=="5" (
    echo.
    echo Checking service status...
    echo.
    call CHECK_SERVICES.bat
    goto menu
)

if "%choice%"=="6" (
    echo.
    echo Backend Commands:
    echo.
    type BACKEND_COMMANDS.txt
    echo.
    pause
    goto menu
)

if "%choice%"=="7" (
    echo.
    echo Opening documentation...
    echo.
    if exist README.md (
        start notepad README.md
    ) else (
        echo README.md not found
        pause
    )
    goto menu
)

if "%choice%"=="8" (
    echo.
    echo Goodbye!
    echo.
    exit /b 0
)

echo.
echo Invalid choice. Please try again.
echo.
pause
goto menu
