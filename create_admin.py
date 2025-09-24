#!/usr/bin/env python3
"""
Создание админ аккаунта для CryptoWatch MEXC
"""

import os
import sys
from datetime import datetime

def create_admin_account():
    """Создание админского аккаунта"""
    print("🔧 Создание админ аккаунта...")
    
    try:
        # Импортируем модули базы данных
        from database import UserDatabase
        
        # Инициализируем базу данных
        print("📀 Инициализация базы данных...")
        db = UserDatabase()
        
        # Данные админа
        admin_data = {
            'username': 'adm1n',
            'email': 'adm1n@cryptowatch.com',  # Правильный формат email
            'password': 'adm1n'
        }
        
        print("👤 Создание админ пользователя...")
        print(f"   Логин: {admin_data['username']}")
        print(f"   Email: {admin_data['email']}")
        print(f"   Пароль: {admin_data['password']}")
        
        # Добавляем в базу
        result = db.create_user(
            username=admin_data['username'],
            email=admin_data['email'],
            password=admin_data['password']
        )
        
        if result['success']:
            print("✅ Админ аккаунт успешно создан!")
            print("\n🔑 Данные для входа:")
            print("   Email: adm1n@cryptowatch.com")
            print("   Пароль: adm1n")
            print("\n🚀 Теперь можно войти в систему!")
            return True
        else:
            if "UNIQUE constraint failed" in str(result.get('error', '')):
                print("⚠️ Админ аккаунт уже существует!")
                print("\n🔑 Данные для входа:")
                print("   Email: adm1n@cryptowatch.com")
                print("   Пароль: adm1n")
                return True
            else:
                print(f"❌ Ошибка создания аккаунта: {result['error']}")
                return False
                
    except Exception as e:
        print(f"❌ Критическая ошибка: {e}")
        print("\n🔧 Проверьте:")
        print("1. Наличие файла database.py")
        print("2. Права на запись в директорию")
        print("3. Корректность структуры БД")
        return False

def main():
    """Основная функция"""
    print("🚀 CryptoWatch MEXC - Создание Админ Аккаунта")
    print("=" * 50)
    
    success = create_admin_account()
    
    if success:
        print("\n🎯 ГОТОВО! Админ аккаунт создан.")
        print("💡 Теперь можно запускать сервер и входить в систему")
        print("🌐 python auth_api.py")
    else:
        print("\n❌ Не удалось создать админ аккаунт!")
        sys.exit(1)

if __name__ == "__main__":
    # Переходим в директорию со скриптом
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    main()
