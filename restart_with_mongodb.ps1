Write-Host "🔄 Restarting Cherry Game with MongoDB Atlas..." -ForegroundColor Green
Write-Host ""

# Check if config file exists
if (Test-Path "backend\config.js") {
    Write-Host "✅ Config file found" -ForegroundColor Green
} else {
    Write-Host "❌ Config file not found. Please create backend\config.js first." -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""
Write-Host "🚀 Starting Backend Server..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\backend'; npm start" -WindowStyle Normal

Write-Host "🚀 Starting Frontend..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\frontend'; npm start" -WindowStyle Normal

Write-Host ""
Write-Host "✅ Both services are starting..." -ForegroundColor Green
Write-Host "🌐 Frontend: http://localhost:3000" -ForegroundColor White
Write-Host "🔧 Backend: http://localhost:4000" -ForegroundColor White
Write-Host ""
Write-Host "📝 Make sure you've updated backend\config.js with your MongoDB Atlas connection string!" -ForegroundColor Yellow
Write-Host ""
Write-Host "Press Enter to exit this window..." -ForegroundColor Yellow
Read-Host
