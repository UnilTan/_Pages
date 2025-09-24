# Конфигурация для отправки email
# ================================

# НАСТРОЙКИ SMTP СЕРВЕРА
# Заполните эти поля своими данными:

# Gmail (рекомендуется)
SMTP_SETTINGS = {
    'gmail': {
        'smtp_server': 'smtp.gmail.com',
        'smtp_port': 587,
        'use_tls': True,
        'email': 'test@gmail.com',  # Временный email для теста
        'password': 'test-app-password',  # Временный пароль для теста
    },
    
    # Yandex Mail
    'yandex': {
        'smtp_server': 'smtp.yandex.ru',
        'smtp_port': 587,
        'use_tls': True,
        'email': '',  # Ваш Yandex адрес (например: yourname@yandex.ru)
        'password': '',  # Пароль от аккаунта или App Password
    },
    
    # Mail.ru
    'mailru': {
        'smtp_server': 'smtp.mail.ru',
        'smtp_port': 587,
        'use_tls': True,
        'email': '',  # Ваш Mail.ru адрес (например: yourname@mail.ru)
        'password': '',  # Пароль от аккаунта
    },
    
    # Пользовательский SMTP
    'custom': {
        'smtp_server': '',  # Например: smtp.yourdomain.com
        'smtp_port': 587,
        'use_tls': True,
        'email': '',  # Ваш email адрес
        'password': '',  # Пароль
    }
}

# АКТИВНЫЙ ПРОВАЙДЕР
# Выберите один из: 'gmail', 'yandex', 'mailru', 'custom'
ACTIVE_PROVIDER = 'gmail'  # ← Настроен Gmail

# НАСТРОЙКИ ПИСЕМ
EMAIL_CONFIG = {
    'from_name': 'CryptoWatch MEXC',
    'from_email': '',  # Будет заполнен автоматически из SMTP_SETTINGS
    'reply_to': '',    # Куда отвечать (опционально)
    
    # Время жизни кода верификации (в минутах)
    'verification_code_lifetime': 15,
    
    # Длина кода верификации
    'verification_code_length': 6,
}

# =====================================
# ИНСТРУКЦИИ ПО НАСТРОЙКЕ:
# =====================================

"""
🔧 ДЛЯ GMAIL:
1. Перейдите в Google Account Settings
2. Включите двухфакторную аутентификацию
3. Создайте App Password: https://myaccount.google.com/apppasswords
4. Используйте полученный App Password (НЕ обычный пароль!)

🔧 ДЛЯ YANDEX:
1. Зайдите в настройки Яндекс.Почты
2. Включите "Доступ по протоколу IMAP"
3. Можете использовать обычный пароль или создать App Password

🔧 ДЛЯ MAIL.RU:
1. Зайдите в настройки Mail.ru
2. Включите "Доступ по протоколу IMAP/POP3"
3. Используйте обычный пароль от аккаунта

⚠️ БЕЗОПАСНОСТЬ:
- Никогда не публикуйте этот файл с паролями!
- Добавьте email_config.py в .gitignore
- Используйте переменные окружения для продакшена
"""

# Функция для получения активной конфигурации
def get_email_config():
    if not ACTIVE_PROVIDER:
        raise ValueError("❌ ACTIVE_PROVIDER не указан! Выберите провайдера в файле email_config.py")
    
    if ACTIVE_PROVIDER not in SMTP_SETTINGS:
        raise ValueError(f"❌ Неизвестный провайдер: {ACTIVE_PROVIDER}. Доступные: {list(SMTP_SETTINGS.keys())}")
    
    config = SMTP_SETTINGS[ACTIVE_PROVIDER].copy()
    
    # Проверяем, что все обязательные поля заполнены
    required_fields = ['smtp_server', 'smtp_port', 'email', 'password']
    missing_fields = [field for field in required_fields if not config.get(field)]
    
    if missing_fields:
        raise ValueError(f"❌ Не заполнены обязательные поля для {ACTIVE_PROVIDER}: {', '.join(missing_fields)}")
    
    # Проверяем формат email
    import re
    if not re.match(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$', config['email']):
        raise ValueError(f"❌ Неверный формат email: {config['email']}")
    
    # Автоматически заполняем from_email
    EMAIL_CONFIG['from_email'] = config['email']
    
    return {
        'smtp': config,
        'email': EMAIL_CONFIG
    }

# Проверка конфигурации
if __name__ == "__main__":
    try:
        config = get_email_config()
        print("✅ Конфигурация email корректна!")
        print(f"📧 Провайдер: {ACTIVE_PROVIDER}")
        print(f"📧 Email: {config['smtp']['email']}")
        print(f"🔌 SMTP: {config['smtp']['smtp_server']}:{config['smtp']['smtp_port']}")
        print(f"🔒 TLS: {'Включен' if config['smtp'].get('use_tls') else 'Отключен'}")
        print("\n🚀 Готово к отправке email!")
    except ValueError as e:
        print(f"❌ ОШИБКА КОНФИГУРАЦИИ: {e}")
        print("\n🔧 ИНСТРУКЦИЯ ПО НАСТРОЙКЕ:")
        print("1. Откройте файл website/email_config.py")
        print("2. Выберите провайдера: ACTIVE_PROVIDER = 'gmail'")
        print("3. Заполните email и пароль в соответствующей секции")
        print("4. Для Gmail используйте App Password!")
        print("5. Запустите проверку: python email_config.py")
        print("\n📖 Подробная инструкция: website/SETUP_EMAIL.md")
        exit(1)
