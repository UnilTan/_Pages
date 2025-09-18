@echo off
chcp 65001 >nul
title CryptoWatch MEXC - Локальный Сервер

echo.
echo ================================================
echo     CryptoWatch MEXC - Локальный Сервер
echo ================================================
echo.

REM Проверяем наличие Python
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python не найден!
    echo Установите Python с https://python.org
    echo.
    pause
    exit /b 1
)

REM Запускаем сервер
echo 🚀 Запуск сервера...
echo.
python simple_server.py

echo.
echo 👋 Сервер остановлен
pause
