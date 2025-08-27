Write-Host "Starting Cherry Game..." -ForegroundColor Green
Write-Host ""

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "Node.js version: $nodeVersion" -ForegroundColor Cyan
} catch {
    Write-Host "Error: Node.js is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install Node.js from: https://nodejs.org/" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

# Check if MongoDB is running (optional)
try {
    $mongoTest = Test-NetConnection -ComputerName localhost -Port 27017 -InformationLevel Quiet
    if ($mongoTest) {
        Write-Host "MongoDB is running on port 27017" -ForegroundColor Green
    } else {
        Write-Host "Warning: MongoDB is not running on port 27017" -ForegroundColor Yellow
        Write-Host "The game will not work without MongoDB. Please start MongoDB or install it." -ForegroundColor Yellow
    }
} catch {
    Write-Host "Warning: Could not check MongoDB status" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Starting Backend Server..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\backend'; npm start" -WindowStyle Normal

Write-Host "Starting Frontend..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\frontend'; npm start" -WindowStyle Normal

Write-Host ""
Write-Host "Both services are starting..." -ForegroundColor Green
Write-Host "Backend will be available at: http://localhost:4000" -ForegroundColor White
Write-Host "Frontend will be available at: http://localhost:3000" -ForegroundColor White
Write-Host ""
Write-Host "Press Enter to exit this window..." -ForegroundColor Yellow
Read-Host
