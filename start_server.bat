@echo off
chcp 65001 >nul
title CryptoWatch MEXC - Local Server

echo.
echo ================================================
echo     CryptoWatch MEXC - Local Server
echo ================================================
echo.

REM Check Python installation
python --version >nul 2>&1
if errorlevel 1 (
    echo Python not found!
    echo Install Python from https://python.org
    echo.
    pause
    exit /b 1
)

echo Python found:
python --version

REM Check if required files exist
if not exist "simple_server.py" (
    echo Error: simple_server.py not found!
    echo Make sure you are running this from the website folder
    pause
    exit /b 1
)

if not exist "index.html" (
    echo Error: index.html not found!
    echo Make sure you are running this from the website folder
    pause
    exit /b 1
)

echo.
echo Starting server...
echo Server will be available at: http://localhost:8000
echo Browser will open automatically
echo Press Ctrl+C to stop the server
echo.

python simple_server.py

echo.
echo Server stopped
pause