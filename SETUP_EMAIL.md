# 📧 Быстрая настройка email отправки

## 🚀 Пошаговая инструкция

### 1️⃣ Выберите email провайдера

#### 🔴 **Gmail (рекомендуется)**
```python
# В файле website/email_config.py найдите:
ACTIVE_PROVIDER = 'gmail'

# И заполните:
'gmail': {
    'email': 'ваш.email@gmail.com',
    'password': 'ваш_app_password',  # НЕ обычный пароль!
}
```

**Как получить App Password для Gmail:**
1. Зайдите в [Google Account Settings](https://myaccount.google.com/security)
2. Включите двухфакторную аутентификацию
3. Перейдите в [App Passwords](https://myaccount.google.com/apppasswords)
4. Создайте пароль для приложения
5. Используйте полученный 16-значный код

#### 🟡 **Yandex Mail**
```python
ACTIVE_PROVIDER = 'yandex'

'yandex': {
    'email': 'ваш.email@yandex.ru',
    'password': 'ваш_пароль',
}
```

#### 🔵 **Mail.ru**
```python
ACTIVE_PROVIDER = 'mailru'

'mailru': {
    'email': 'ваш.email@mail.ru', 
    'password': 'ваш_пароль',
}
```

### 2️⃣ Отредактируйте конфигурацию

Откройте файл `website/email_config.py` и заполните поля:

```python
# Найдите нужный провайдер и заполните:
SMTP_SETTINGS = {
    'gmail': {
        'smtp_server': 'smtp.gmail.com',
        'smtp_port': 587,
        'use_tls': True,
        'email': 'ВАШ_EMAIL@gmail.com',      # ← Сюда ваш email
        'password': 'ВАШ_APP_PASSWORD',       # ← Сюда App Password
    },
    # ...
}

# Установите активный провайдер:
ACTIVE_PROVIDER = 'gmail'  # ← Ваш выбор
```

### 3️⃣ Проверьте настройки

```bash
cd website
python email_config.py
```

Вы должны увидеть:
```
✅ Конфигурация email корректна!
📧 Провайдер: gmail
📧 Email: ваш.email@gmail.com
🔌 SMTP: smtp.gmail.com:587
```

### 4️⃣ Протестируйте отправку

```bash
python auth_api.py
```

При запуске сервера вы увидите:
```
✅ Email сервис инициализован: ваш.email@gmail.com
🚀 Сервер запущен на http://localhost:5000
```

## 🔧 Troubleshooting

### ❌ "Ошибка аутентификации"
- **Gmail**: Убедитесь, что используете App Password, а не обычный пароль
- **Yandex/Mail.ru**: Проверьте включение IMAP/POP3 в настройках

### ❌ "Подключение отклонено"
- Проверьте настройки firewall
- Убедитесь в правильности SMTP сервера и порта

### ❌ "SSL Error"
- Попробуйте изменить `use_tls: True` на `use_tls: False`
- Или измените порт на 465 для SSL

### ❌ "Конфигурация не найдена"
- Убедитесь, что файл `email_config.py` находится в папке `website/`
- Проверьте синтаксис Python в файле

## 📋 Checklist

- [ ] Выбрал email провайдера
- [ ] Получил App Password (для Gmail)
- [ ] Заполнил `email_config.py`
- [ ] Проверил конфигурацию: `python email_config.py`
- [ ] Запустил сервер: `python auth_api.py`
- [ ] Протестировал регистрацию нового пользователя

## 🔒 Безопасность

⚠️ **ВАЖНО:**
- Никогда не публикуйте файл `email_config.py` с паролями!
- Добавьте `email_config.py` в `.gitignore`
- Для продакшена используйте переменные окружения

## 🆘 Поддержка

Если что-то не работает, обратитесь в Telegram: [@Solnyshchko](https://t.me/Solnyshchko)

---

✨ **После настройки email система будет отправлять красивые письма с кодами верификации!**
