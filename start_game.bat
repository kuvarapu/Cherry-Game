@echo off
echo Starting Cherry Game...
echo.

echo Starting Backend Server (Port 4000)...
start "Backend Server" cmd /k "cd backend && node server.js"

echo Waiting for backend to start...
timeout /t 3 /nobreak > nul

echo Starting Frontend Server (Port 3000)...
start "Frontend Server" cmd /k "cd frontend && npm start"

echo.
echo Game servers are starting...
echo Backend: http://localhost:4000
echo Frontend: http://localhost:3000
echo.
echo The game will open in your browser automatically.
echo Press any key to close this window.
pause > nul
