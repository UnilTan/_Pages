#!/usr/bin/env python3
"""
Тест отправки email для CryptoWatch MEXC
"""

import sys
import os

def test_email_sending():
    """Тестирование отправки email"""
    
    print("🧪 Тестирование системы отправки email...")
    print("=" * 50)
    
    try:
        # Проверяем конфигурацию
        print("1️⃣ Проверка конфигурации...")
        from email_config import get_email_config
        
        config = get_email_config()
        print(f"✅ Конфигурация загружена: {config['smtp']['email']}")
        
        # Инициализируем email сервис
        print("\n2️⃣ Инициализация email сервиса...")
        from email_service import EmailService
        
        email_service = EmailService()
        print("✅ Email сервис инициализирован")
        
        # Запрашиваем email для тестирования
        print("\n3️⃣ Тестовая отправка...")
        test_email = input("📧 Введите email для тестирования: ").strip()
        
        if not test_email:
            print("❌ Email не указан!")
            return False
        
        # Отправляем тестовый код
        print(f"📤 Отправка тестового кода на {test_email}...")
        
        result = email_service.send_verification_code(
            to_email=test_email,
            code="123456",
            username="Тестовый пользователь"
        )
        
        if result["success"]:
            print("✅ УСПЕХ! Email отправлен!")
            print(f"📝 Сообщение: {result['message']}")
            print("\n🎉 Система email работает корректно!")
            return True
        else:
            print(f"❌ ОШИБКА: {result['error']}")
            return False
            
    except Exception as e:
        print(f"❌ КРИТИЧЕСКАЯ ОШИБКА: {e}")
        print("\n🔧 Проверьте:")
        print("1. Настройки в email_config.py")
        print("2. Интернет-соединение")
        print("3. Правильность пароля/App Password")
        print("4. Настройки безопасности email провайдера")
        return False

def main():
    """Основная функция"""
    print("🚀 CryptoWatch MEXC - Тест Email Системы")
    print("=" * 50)
    
    success = test_email_sending()
    
    if success:
        print("\n🎯 РЕЗУЛЬТАТ: Система готова к работе!")
        print("💡 Теперь можно запускать auth_api.py")
    else:
        print("\n❌ РЕЗУЛЬТАТ: Требуется настройка!")
        print("📖 Инструкция: website/SETUP_EMAIL.md")
        sys.exit(1)

if __name__ == "__main__":
    main()
