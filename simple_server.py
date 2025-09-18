#!/usr/bin/env python3
"""
Простой HTTP сервер для CryptoWatch MEXC
"""

import http.server
import socketserver
import webbrowser
import os
import sys
from pathlib import Path

PORT = 8000
HOST = "localhost"

def main():
    """Запуск простого HTTP сервера"""
    
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
        # Создаем простой HTTP сервер
        handler = http.server.SimpleHTTPRequestHandler
        
        with socketserver.TCPServer((HOST, PORT), handler) as httpd:
            server_url = f"http://{HOST}:{PORT}"
            
            print("🚀 Запуск CryptoWatch MEXC сервера...")
            print(f"📂 Директория: {Path.cwd()}")
            print(f"🌐 Сервер запущен: {server_url}")
            print("📱 Сайт будет автоматически открыт в браузере")
            print("⏹️  Для остановки нажмите Ctrl+C")
            print("-" * 50)
            
            # Автоматически открываем браузер
            try:
                webbrowser.open(server_url)
                print("✅ Браузер открыт автоматически")
            except Exception as e:
                print(f"⚠️  Не удалось открыть браузер: {e}")
                print(f"Откройте браузер вручную: {server_url}")
            
            print("-" * 50)
            print("🟢 Сервер работает...")
            
            # Запускаем сервер
            httpd.serve_forever()
            
    except OSError as e:
        if e.errno == 10048:  # Windows: Address already in use
            print(f"❌ Ошибка: Порт {PORT} уже используется")
            print("Закройте другие приложения или измените порт")
        else:
            print(f"❌ Ошибка при запуске сервера: {e}")
        input("Нажмите Enter для выхода...")
        sys.exit(1)
    except KeyboardInterrupt:
        print("\n🛑 Сервер остановлен")
        print("👋 Спасибо за использование CryptoWatch MEXC!")
        sys.exit(0)
    except Exception as e:
        print(f"❌ Неожиданная ошибка: {e}")
        input("Нажмите Enter для выхода...")
        sys.exit(1)

if __name__ == "__main__":
    main()
