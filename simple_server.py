#!/usr/bin/env python3
"""
HTTP сервер с API для CryptoWatch MEXC
"""

import webbrowser
import os
import sys
from pathlib import Path

# Импортируем наш API сервер
try:
    from auth_api import start_auth_server
except ImportError:
    print("❌ Ошибка: Не найден модуль auth_api.py")
    print("Убедитесь, что файл auth_api.py находится в той же директории")
    sys.exit(1)

PORT = 8000
HOST = "localhost"

def main():
    """Запуск HTTP сервера с API"""
    
    # Проверяем, что мы в правильной директории
    current_dir = Path.cwd()
    
    # Если мы не в папке website, переходим в неё
    if not (current_dir / 'index.html').exists():
        if (current_dir / 'website' / 'index.html').exists():
            os.chdir(current_dir / 'website')
        else:
            print("❌ Ошибка: Не найден файл index.html")
            print("Убедитесь, что вы запускаете скрипт из корневой папки проекта или папки website")
            input("Нажмите Enter для выхода...")
            sys.exit(1)
    
    try:
        server_url = f"http://{HOST}:{PORT}"
        
        print("🚀 Запуск CryptoWatch MEXC сервера с API...")
        print(f"📂 Директория: {Path.cwd()}")
        print(f"🌐 Сервер запущен: {server_url}")
        print("📱 Сайт будет автоматически открыт в браузере")
        print("🔗 API доступно по адресу: {}/api/".format(server_url))
        print("⏹️  Для остановки нажмите Ctrl+C")
        print("-" * 60)
        
        # Автоматически открываем браузер
        try:
            webbrowser.open(server_url)
            print("✅ Браузер открыт автоматически")
        except Exception as e:
            print(f"⚠️  Не удалось открыть браузер: {e}")
            print(f"Откройте браузер вручную: {server_url}")
        
        print("-" * 60)
        print("🟢 Сервер работает с авторизацией...")
        
        # Запускаем сервер с API
        start_auth_server(PORT, HOST)
        
    except KeyboardInterrupt:
        print("\n🛑 Сервер остановлен")
        print("👋 Спасибо за использование CryptoWatch MEXC!")
        sys.exit(0)
    except Exception as e:
        print(f"❌ Ошибка запуска сервера: {e}")
        input("Нажмите Enter для выхода...")
        sys.exit(1)

if __name__ == "__main__":
    main()
