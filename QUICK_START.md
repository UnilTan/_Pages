# 🚀 Быстрый запуск CryptoWatch MEXC

## ⚡ Мгновенный запуск (без email)

```bash
cd website
python start_simple.py
```

Откройте: **http://localhost:8000**

**Данные для входа:**
- Логин: `adm1n`
- Пароль: `adm1n`

---

## 🔧 Полный запуск (с email и API)

### 1. Настройте email (опционально)

Отредактируйте `website/email_config.py`:

```python
ACTIVE_PROVIDER = 'gmail'

'gmail': {
    'email': 'ваш@gmail.com',
    'password': 'ваш_app_password',
}
```

### 2. Запустите API сервер

```bash
cd website
python auth_api.py
```

Откройте: **http://localhost:8000**

---

## 📋 Что работает

### ✅ Простой сервер (`start_simple.py`)
- ✅ Главная страница
- ✅ Кнопка авторизации  
- ❌ Вход в систему (нет API)
- ❌ Личный кабинет (нет API)

### ✅ API сервер (`auth_api.py`)
- ✅ Главная страница
- ✅ Полная авторизация
- ✅ Личный кабинет
- ✅ Все функции

---

## 🎯 Рекомендация

**Для демонстрации:** Используйте `start_simple.py`
**Для разработки:** Используйте `auth_api.py`

---

## 🆘 Проблемы?

**Email ошибки:** Используйте `start_simple.py`
**Порт занят:** Добавьте `--port 8001`
**Поддержка:** [@Solnyshchko](https://t.me/Solnyshchko)
