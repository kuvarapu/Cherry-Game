Write-Host "🍒 Starting Cherry Game... 🍒" -ForegroundColor Magenta
Write-Host ""

# Function to check if port is in use
function Test-Port {
    param($Port)
    try {
        $connection = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
        return $connection -ne $null
    }
    catch {
        return $false
    }
}

# Start Backend Server
Write-Host "Starting Backend Server (Port 4000)..." -ForegroundColor Cyan
if (Test-Port 4000) {
    Write-Host "Port 4000 is already in use. Stopping existing process..." -ForegroundColor Yellow
    Get-Process | Where-Object {$_.ProcessName -eq "node"} | Stop-Process -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 2
}

Start-Process -FilePath "cmd" -ArgumentList "/k", "cd backend && node server.js" -WindowStyle Normal
Write-Host "Backend server started!" -ForegroundColor Green

# Wait for backend to start
Write-Host "Waiting for backend to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Check if backend is running
if (Test-Port 4000) {
    Write-Host "Backend server is running on port 4000" -ForegroundColor Green
} else {
    Write-Host "Warning: Backend server may not have started properly" -ForegroundColor Yellow
}

# Start Frontend Server
Write-Host "Starting Frontend Server (Port 3000)..." -ForegroundColor Cyan
if (Test-Port 3000) {
    Write-Host "Port 3000 is already in use. Stopping existing process..." -ForegroundColor Yellow
    Get-Process | Where-Object {$_.ProcessName -eq "node"} | Stop-Process -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 2
}

Start-Process -FilePath "cmd" -ArgumentList "/k", "cd frontend && npm start" -WindowStyle Normal
Write-Host "Frontend server started!" -ForegroundColor Green

Write-Host ""
Write-Host "🎮 Game servers are starting..." -ForegroundColor Green
Write-Host "Backend: http://localhost:4000" -ForegroundColor Cyan
Write-Host "Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host ""
Write-Host "The game will open in your browser automatically." -ForegroundColor Yellow
Write-Host "Press Ctrl+C to stop the servers when done." -ForegroundColor Yellow

# Keep the script running to show status
try {
    while ($true) {
        $backendStatus = if (Test-Port 4000) { "Running" } else { "Stopped" }
        $frontendStatus = if (Test-Port 3000) { "Running" } else { "Stopped" }
        
        Write-Host "`rBackend: $backendStatus | Frontend: $frontendStatus" -NoNewline -ForegroundColor Gray
        Start-Sleep -Seconds 5
    }
}
catch {
    Write-Host ""
    Write-Host "Stopping servers..." -ForegroundColor Yellow
    Get-Process | Where-Object {$_.ProcessName -eq "node"} | Stop-Process -Force -ErrorAction SilentlyContinue
    Write-Host "Servers stopped." -ForegroundColor Green
}
