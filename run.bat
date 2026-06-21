@echo off
REM ZENITH ZERO — One-Click Execution Script for Windows
REM Purpose: Install dependencies and start development server
REM Usage: Double-click this file or run: run.bat

setlocal EnableDelayedExpansion
title ZENITH ZERO - Starting...

echo.
echo  ^+---------------------------------------------------^+
echo  ^|        ZENITH ZERO - Identity Intelligence        ^|
echo  ^|      Enterprise Banking Security Platform         ^|
echo  ^+---------------------------------------------------^+
echo.

:: Check Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js not found.
    echo         Download from: https://nodejs.org
    pause
    exit /b 1
)
for /f "tokens=*" %%i in ('node --version') do set NODE_VER=%%i
echo [OK] Node.js !NODE_VER! detected

:: Install dependencies
echo.
echo [->] Installing frontend dependencies...
call npm install --silent
if errorlevel 1 (
    echo [ERROR] npm install failed. Check your internet connection.
    pause
    exit /b 1
)
echo [OK] Dependencies ready

:: Check .env
if not exist ".env" (
    echo [ERROR] .env file missing. It should be in the project root.
    pause
    exit /b 1
)
echo [OK] Environment configuration found

:: Start dev server
echo.
echo [->] Starting Zenith Zero...
echo.
echo   URL: http://localhost:5173
echo.
echo   Demo Credentials:
echo     Admin   -^> admin@bharatsecurebank.in / SecureBank@123
echo     Analyst -^> analyst@bharatsecurebank.in / SecureBank@123
echo     Auditor -^> auditor@bharatsecurebank.in / SecureBank@123
echo.
echo   Press Ctrl+C to stop
echo.

:: Open browser after delay
start /b cmd /c "timeout /t 4 /nobreak >nul && start http://localhost:5173"

call npm run dev
pause
