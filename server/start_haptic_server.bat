@echo off
echo ======================================
echo   Virtual Gamepad Haptic Feedback
echo ======================================
echo.
echo Choose an option:
echo 1. Start Main Server (with haptic feedback)
echo 2. Start Test Server (haptic patterns only)
echo 3. View Implementation Summary
echo 4. Exit
echo.
set /p choice="Enter your choice (1-4): "

if "%choice%"=="1" (
    echo.
    echo Starting main gamepad server with haptic feedback...
    echo Connect your mobile app and enable haptics!
    echo.
    python gamepad_server.py
) else if "%choice%"=="2" (
    echo.
    echo Starting haptic test server...
    echo This will test various vibration patterns
    echo.
    python haptic_test_server.py
) else if "%choice%"=="3" (
    echo.
    echo Opening implementation summary...
    echo.
    type ..\HAPTIC_IMPLEMENTATION_COMPLETE.md
    echo.
    pause
) else if "%choice%"=="4" (
    echo.
    echo Goodbye!
    exit
) else (
    echo.
    echo Invalid choice. Please try again.
    pause
    goto start
)

:start
pause
