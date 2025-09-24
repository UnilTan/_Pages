#!/usr/bin/env python3
"""
Простой HTTP сервер для CryptoWatch MEXC (без email зависимости)
"""

import http.server
import socketserver
import os
import sys
from pathlib import Path

def start_simple_server(port=8000, host="localhost"):
    """Запуск простого HTTP сервера"""
    
    # Переходим в директорию website
    website_dir = Path(__file__).parent
    os.chdir(website_dir)
    
    print("================================================")
    print("    CryptoWatch MEXC - Простой Сервер")
    print("================================================")
    print()
    print(f"🚀 Запуск сервера на порту {port}...")
    print(f"📂 Корневая директория: {website_dir}")
    print(f"🌐 Сайт доступен: http://{host}:{port}")
    print()
    print("📝 Данные для входа:")
    print("   Логин: adm1n")
    print("   Пароль: adm1n")
    print()
    print("⚠️  ВНИМАНИЕ: Это простой сервер без API!")
    print("    Для полного функционала используйте:")
    print("    python auth_api.py")
    print()
    print("⏹️  Для остановки нажмите Ctrl+C")
    print("-" * 48)
    
    try:
        # Создаем простой HTTP сервер
        handler = http.server.SimpleHTTPRequestHandler
        
        with socketserver.TCPServer((host, port), handler) as httpd:
            httpd.serve_forever()
            
    except KeyboardInterrupt:
        print("\n🛑 Сервер остановлен")
    except OSError as e:
        if e.errno == 10048:  # Порт занят
            print(f"❌ Порт {port} уже используется!")
            print("💡 Попробуйте другой порт:")
            print(f"   python {sys.argv[0]} --port 8001")
        else:
            print(f"❌ Ошибка запуска: {e}")
    except Exception as e:
        print(f"❌ Неожиданная ошибка: {e}")

if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description="Простой HTTP сервер для CryptoWatch MEXC")
    parser.add_argument("--port", type=int, default=8000, help="Порт сервера (по умолчанию: 8000)")
    parser.add_argument("--host", default="localhost", help="Хост сервера (по умолчанию: localhost)")
    
    args = parser.parse_args()
    
    start_simple_server(args.port, args.host)
