@echo off
title MCGG Lineup Lab - Launcher
echo ========================================================
echo       ⚔️ MCGG Lineup Lab (Full-Stack Dev Server) ⚔️
echo ========================================================
echo.
echo Starting Backend API on http://localhost:3001 ...
start "MCGG Backend (Port 3001)" cmd /k "cd /d "%~dp0backend" && npm run dev"

timeout /t 2 /nobreak >nul

echo Starting Frontend on http://localhost:5173 ...
start "MCGG Frontend (Port 5173)" cmd /k "cd /d "%~dp0frontend" && npm run dev"

echo.
echo ✅ Both servers started!
echo Frontend: http://localhost:5173
echo Backend API: http://localhost:3001/api
echo Admin Credentials: admin@mcgg.local / admin123
echo.
pause
