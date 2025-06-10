# Virtual Gamepad Haptic Feedback Launcher
# PowerShell version for Windows

Write-Host "======================================" -ForegroundColor Cyan
Write-Host "   Virtual Gamepad Haptic Feedback" -ForegroundColor Yellow
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Choose an option:" -ForegroundColor White
Write-Host "1. Start Main Server (with haptic feedback)" -ForegroundColor Green
Write-Host "2. Start Test Server (haptic patterns only)" -ForegroundColor Blue
Write-Host "3. View Implementation Summary" -ForegroundColor Magenta
Write-Host "4. Install Dependencies" -ForegroundColor Yellow
Write-Host "5. Exit" -ForegroundColor Red
Write-Host ""

$choice = Read-Host "Enter your choice (1-5)"

switch ($choice) {
    "1" {
        Write-Host ""
        Write-Host "Starting main gamepad server with haptic feedback..." -ForegroundColor Green
        Write-Host "Connect your mobile app and enable haptics!" -ForegroundColor Yellow
        Write-Host ""
        python gamepad_server.py
    }
    "2" {
        Write-Host ""
        Write-Host "Starting haptic test server..." -ForegroundColor Blue
        Write-Host "This will test various vibration patterns" -ForegroundColor Yellow
        Write-Host ""
        python haptic_test_server.py
    }
    "3" {
        Write-Host ""
        Write-Host "Opening implementation summary..." -ForegroundColor Magenta
        Write-Host ""
        Get-Content "..\HAPTIC_IMPLEMENTATION_COMPLETE.md" | Write-Host
        Write-Host ""
        Read-Host "Press Enter to continue"
    }
    "4" {
        Write-Host ""
        Write-Host "Installing Python dependencies..." -ForegroundColor Yellow
        Write-Host ""
        pip install -r requirements.txt
        Write-Host ""
        Write-Host "Dependencies installed!" -ForegroundColor Green
        Read-Host "Press Enter to continue"
    }
    "5" {
        Write-Host ""
        Write-Host "Goodbye!" -ForegroundColor Green
        exit
    }
    default {
        Write-Host ""
        Write-Host "Invalid choice. Please try again." -ForegroundColor Red
        Read-Host "Press Enter to continue"
    }
}

Read-Host "Press Enter to exit"
