#!/usr/bin/env python3
"""
Обновление админа в существующей базе данных
"""

import os
import sys

def update_admin():
    """Обновление админа без удаления базы"""
    print("🔧 Обновление админ аккаунта...")
    
    try:
        from database import UserDatabase
        
        # Подключаемся к существующей базе
        db = UserDatabase()
        
        import sqlite3
        
        # Прямое подключение к базе
        with sqlite3.connect(db.db_path) as conn:
            cursor = conn.cursor()
            
            # Проверяем есть ли админ с таким email
            cursor.execute("SELECT id FROM users WHERE email = ?", ('adm1n@cryptowatch.com',))
            admin = cursor.fetchone()
            
            if admin:
                # Обновляем существующего админа
                print("👤 Обновление существующего админа...")
                cursor.execute(
                    "UPDATE users SET is_verified = 1 WHERE email = ?",
                    ('adm1n@cryptowatch.com',)
                )
                print("✅ Админ помечен как верифицированный")
            else:
                # Удаляем старого админа если есть
                print("🗑️ Удаление старых админов...")
                cursor.execute("DELETE FROM users WHERE email = ? OR email = ?", ('adm1n', 'adm1n@cryptowatch.com'))
                
                # Создаем нового админа
                print("👤 Создание нового админа...")
                result = db.create_user(
                    username='adm1n',
                    email='adm1n@cryptowatch.com',
                    password='adm1n'
                )
                
                if result['success']:
                    # Помечаем как верифицированного
                    cursor.execute(
                        "UPDATE users SET is_verified = 1 WHERE email = ?",
                        ('adm1n@cryptowatch.com',)
                    )
                    print("✅ Новый админ создан и верифицирован")
            
            conn.commit()
        
        print("\n🔑 Данные для входа:")
        print("   Email: adm1n@cryptowatch.com")
        print("   Пароль: adm1n")
        print("   Статус: Верифицирован ✅")
        print("\n🚀 Теперь можно войти в систему!")
        return True
        
    except Exception as e:
        print(f"❌ Ошибка: {e}")
        return False

if __name__ == "__main__":
    print("🚀 CryptoWatch MEXC - Обновление Админ Аккаунта")
    print("=" * 50)
    
    success = update_admin()
    
    if success:
        print("\n🎯 ГОТОВО! Админ аккаунт обновлен.")
        print("💡 Теперь можно войти без email верификации")
    else:
        print("\n❌ Не удалось обновить админ аккаунт!")
        sys.exit(1)
