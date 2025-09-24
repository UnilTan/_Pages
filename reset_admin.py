#!/usr/bin/env python3
"""
Сброс и пересоздание админ аккаунта
"""

import os
import sys

def reset_admin():
    """Удаление базы и создание нового админа"""
    print("🔄 Сброс админ аккаунта...")
    
    # Удаляем базу данных
    db_path = "data/users.db"
    if os.path.exists(db_path):
        os.remove(db_path)
        print("🗑️ Старая база данных удалена")
    
    # Создаем новую базу с админом
    print("🔧 Создание нового админ аккаунта...")
    
    try:
        from database import UserDatabase
        
        # Создаем новую базу
        db = UserDatabase()
        
        # Создаем админа с правильным email
        result = db.create_user(
            username='adm1n',
            email='adm1n@cryptowatch.com',
            password='adm1n'
        )
        
        # Помечаем админа как верифицированного
        if result['success']:
            user_id = result.get('user_id')
            if user_id:
                # Обновляем статус верификации напрямую в базе
                conn = db.get_connection()
                cursor = conn.cursor()
                cursor.execute(
                    "UPDATE users SET is_verified = 1 WHERE id = ?",
                    (user_id,)
                )
                conn.commit()
                cursor.close()
                conn.close()
                print("✅ Админ помечен как верифицированный")
        
        if result['success']:
            print("✅ Новый админ аккаунт создан!")
            print("\n🔑 Данные для входа:")
            print("   Email: adm1n@cryptowatch.com")
            print("   Пароль: adm1n")
            print("\n🚀 Теперь можно войти в систему!")
            return True
        else:
            print(f"❌ Ошибка: {result['error']}")
            return False
            
    except Exception as e:
        print(f"❌ Критическая ошибка: {e}")
        return False

if __name__ == "__main__":
    print("🚀 CryptoWatch MEXC - Сброс Админ Аккаунта")
    print("=" * 50)
    
    success = reset_admin()
    
    if success:
        print("\n🎯 ГОТОВО! Админ аккаунт пересоздан.")
        print("💡 Используйте новые данные для входа")
    else:
        print("\n❌ Не удалось пересоздать админ аккаунт!")
        sys.exit(1)
