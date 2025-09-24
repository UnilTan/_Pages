#!/usr/bin/env python3
"""
База данных для системы аутентификации CryptoWatch MEXC
"""

import sqlite3
import hashlib
import secrets
import os
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
import json

class UserDatabase:
    def __init__(self, db_path: str = "data/users.db"):
        """Инициализация базы данных пользователей"""
        self.db_path = db_path
        
        # Создаем папку для базы данных если её нет
        os.makedirs(os.path.dirname(db_path), exist_ok=True)
        
        # Инициализация таблиц
        self._init_database()
    
    def _init_database(self):
        """Создание таблиц в базе данных"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            
            # Таблица пользователей
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS users (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    email TEXT UNIQUE NOT NULL,
                    password_hash TEXT NOT NULL,
                    username TEXT,
                    telegram_id TEXT,
                    telegram_username TEXT,
                    phone TEXT,
                    is_verified INTEGER DEFAULT 0,
                    is_active INTEGER DEFAULT 1,
                    subscription_type TEXT DEFAULT 'free',
                    subscription_expires_at TEXT,
                    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
                    last_login_at TEXT,
                    profile_data TEXT DEFAULT '{}',
                    preferences TEXT DEFAULT '{}'
                )
            """)
            
            # Таблица сессий
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS sessions (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id INTEGER NOT NULL,
                    session_token TEXT UNIQUE NOT NULL,
                    expires_at TEXT NOT NULL,
                    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                    ip_address TEXT,
                    user_agent TEXT,
                    is_active INTEGER DEFAULT 1,
                    FOREIGN KEY (user_id) REFERENCES users (id)
                )
            """)
            
            # Таблица кодов верификации
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS verification_codes (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    email TEXT NOT NULL,
                    code TEXT NOT NULL,
                    code_type TEXT NOT NULL,
                    expires_at TEXT NOT NULL,
                    used INTEGER DEFAULT 0,
                    created_at TEXT DEFAULT CURRENT_TIMESTAMP
                )
            """)
            
            # Таблица Telegram интеграции
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS telegram_auth (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id INTEGER,
                    telegram_id TEXT UNIQUE NOT NULL,
                    telegram_username TEXT,
                    auth_token TEXT UNIQUE NOT NULL,
                    expires_at TEXT NOT NULL,
                    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                    is_verified INTEGER DEFAULT 0,
                    FOREIGN KEY (user_id) REFERENCES users (id)
                )
            """)
            
            conn.commit()
    
    def _hash_password(self, password: str) -> str:
        """Хеширование пароля"""
        salt = secrets.token_hex(32)
        pwd_hash = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt.encode('utf-8'), 100000)
        return f"{salt}${pwd_hash.hex()}"
    
    def _verify_password(self, password: str, hashed: str) -> bool:
        """Проверка пароля"""
        try:
            salt, pwd_hash = hashed.split('$')
            new_hash = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt.encode('utf-8'), 100000)
            return pwd_hash == new_hash.hex()
        except:
            return False
    
    def create_user(self, email: str, password: str, username: str = None, telegram_id: str = None) -> Dict[str, Any]:
        """Создание нового пользователя"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                
                # Проверяем, существует ли пользователь с таким email
                cursor.execute("SELECT id FROM users WHERE email = ?", (email,))
                if cursor.fetchone():
                    return {"success": False, "error": "Пользователь с таким email уже существует"}
                
                # Хешируем пароль
                password_hash = self._hash_password(password)
                
                # Создаем пользователя
                cursor.execute("""
                    INSERT INTO users (email, password_hash, username, telegram_id, profile_data, preferences)
                    VALUES (?, ?, ?, ?, '{}', '{}')
                """, (email, password_hash, username, telegram_id))
                
                user_id = cursor.lastrowid
                conn.commit()
                
                return {
                    "success": True,
                    "user_id": user_id,
                    "message": "Пользователь успешно создан"
                }
        except Exception as e:
            return {"success": False, "error": f"Ошибка при создании пользователя: {str(e)}"}
    
    def authenticate_user(self, email: str, password: str) -> Dict[str, Any]:
        """Аутентификация пользователя"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                
                cursor.execute("""
                    SELECT id, password_hash, is_verified, is_active, username, telegram_id
                    FROM users WHERE email = ?
                """, (email,))
                
                user = cursor.fetchone()
                if not user:
                    return {"success": False, "error": "Неверный email или пароль"}
                
                user_id, password_hash, is_verified, is_active, username, telegram_id = user
                
                if not is_active:
                    return {"success": False, "error": "Аккаунт заблокирован"}
                
                if not self._verify_password(password, password_hash):
                    return {"success": False, "error": "Неверный email или пароль"}
                
                # Обновляем время последнего входа
                cursor.execute("""
                    UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id = ?
                """, (user_id,))
                conn.commit()
                
                return {
                    "success": True,
                    "user": {
                        "id": user_id,
                        "email": email,
                        "username": username,
                        "telegram_id": telegram_id,
                        "is_verified": bool(is_verified)
                    }
                }
        except Exception as e:
            return {"success": False, "error": f"Ошибка аутентификации: {str(e)}"}
    
    def create_session(self, user_id: int, ip_address: str = None, user_agent: str = None) -> str:
        """Создание новой сессии"""
        session_token = secrets.token_urlsafe(64)
        expires_at = (datetime.now() + timedelta(days=30)).isoformat()
        
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO sessions (user_id, session_token, expires_at, ip_address, user_agent)
                VALUES (?, ?, ?, ?, ?)
            """, (user_id, session_token, expires_at, ip_address, user_agent))
            conn.commit()
        
        return session_token
    
    def validate_session(self, session_token: str) -> Optional[Dict[str, Any]]:
        """Проверка действительности сессии"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                
                cursor.execute("""
                    SELECT s.user_id, s.expires_at, u.email, u.username, u.is_verified, u.is_active
                    FROM sessions s
                    JOIN users u ON s.user_id = u.id
                    WHERE s.session_token = ? AND s.is_active = 1
                """, (session_token,))
                
                session = cursor.fetchone()
                if not session:
                    return None
                
                user_id, expires_at, email, username, is_verified, is_active = session
                
                # Проверяем срок действия
                if datetime.fromisoformat(expires_at) < datetime.now():
                    # Деактивируем просроченную сессию
                    cursor.execute("UPDATE sessions SET is_active = 0 WHERE session_token = ?", (session_token,))
                    conn.commit()
                    return None
                
                if not is_active:
                    return None
                
                return {
                    "user_id": user_id,
                    "email": email,
                    "username": username,
                    "is_verified": bool(is_verified)
                }
        except Exception:
            return None
    
    def logout_session(self, session_token: str) -> bool:
        """Выход из сессии"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                cursor.execute("UPDATE sessions SET is_active = 0 WHERE session_token = ?", (session_token,))
                conn.commit()
                return True
        except:
            return False
    
    def create_verification_code(self, email: str, code_type: str = 'email_verification') -> str:
        """Создание кода верификации"""
        code = str(secrets.randbelow(900000) + 100000)  # 6-значный код
        expires_at = (datetime.now() + timedelta(minutes=15)).isoformat()
        
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            # Деактивируем старые коды
            cursor.execute("""
                UPDATE verification_codes SET used = 1 
                WHERE email = ? AND code_type = ?
            """, (email, code_type))
            
            # Создаем новый код
            cursor.execute("""
                INSERT INTO verification_codes (email, code, code_type, expires_at)
                VALUES (?, ?, ?, ?)
            """, (email, code, code_type, expires_at))
            conn.commit()
        
        return code
    
    def verify_code(self, email: str, code: str, code_type: str = 'email_verification') -> bool:
        """Проверка кода верификации"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                
                cursor.execute("""
                    SELECT id, expires_at FROM verification_codes
                    WHERE email = ? AND code = ? AND code_type = ? AND used = 0
                """, (email, code, code_type))
                
                result = cursor.fetchone()
                if not result:
                    return False
                
                code_id, expires_at = result
                
                # Проверяем срок действия
                if datetime.fromisoformat(expires_at) < datetime.now():
                    return False
                
                # Помечаем код как использованный
                cursor.execute("UPDATE verification_codes SET used = 1 WHERE id = ?", (code_id,))
                
                # Если это верификация email, обновляем статус пользователя
                if code_type == 'email_verification':
                    cursor.execute("UPDATE users SET is_verified = 1 WHERE email = ?", (email,))
                
                conn.commit()
                return True
        except:
            return False
    
    def create_telegram_auth(self, telegram_id: str, telegram_username: str = None) -> str:
        """Создание Telegram авторизации"""
        auth_token = secrets.token_urlsafe(32)
        expires_at = (datetime.now() + timedelta(minutes=10)).isoformat()
        
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            
            # Удаляем старые токены
            cursor.execute("DELETE FROM telegram_auth WHERE telegram_id = ?", (telegram_id,))
            
            cursor.execute("""
                INSERT INTO telegram_auth (telegram_id, telegram_username, auth_token, expires_at)
                VALUES (?, ?, ?, ?)
            """, (telegram_id, telegram_username, auth_token, expires_at))
            conn.commit()
        
        return auth_token
    
    def verify_telegram_auth(self, auth_token: str) -> Optional[Dict[str, Any]]:
        """Проверка Telegram авторизации"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                
                cursor.execute("""
                    SELECT telegram_id, telegram_username, expires_at, user_id
                    FROM telegram_auth WHERE auth_token = ?
                """, (auth_token,))
                
                result = cursor.fetchone()
                if not result:
                    return None
                
                telegram_id, telegram_username, expires_at, user_id = result
                
                # Проверяем срок действия
                if datetime.fromisoformat(expires_at) < datetime.now():
                    cursor.execute("DELETE FROM telegram_auth WHERE auth_token = ?", (auth_token,))
                    conn.commit()
                    return None
                
                return {
                    "telegram_id": telegram_id,
                    "telegram_username": telegram_username,
                    "user_id": user_id
                }
        except:
            return None
    
    def link_telegram_to_user(self, user_id: int, telegram_id: str, telegram_username: str = None) -> bool:
        """Привязка Telegram к пользователю"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                
                # Обновляем данные пользователя
                cursor.execute("""
                    UPDATE users SET telegram_id = ?, telegram_username = ?
                    WHERE id = ?
                """, (telegram_id, telegram_username, user_id))
                
                # Обновляем таблицу telegram_auth
                cursor.execute("""
                    UPDATE telegram_auth SET user_id = ?, is_verified = 1
                    WHERE telegram_id = ?
                """, (user_id, telegram_id))
                
                conn.commit()
                return True
        except:
            return False
    
    def get_user_profile(self, user_id: int) -> Optional[Dict[str, Any]]:
        """Получение профиля пользователя"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                
                cursor.execute("""
                    SELECT email, username, telegram_id, telegram_username, phone,
                           is_verified, subscription_type, subscription_expires_at,
                           created_at, last_login_at, profile_data, preferences
                    FROM users WHERE id = ?
                """, (user_id,))
                
                user = cursor.fetchone()
                if not user:
                    return None
                
                (email, username, telegram_id, telegram_username, phone,
                 is_verified, subscription_type, subscription_expires_at,
                 created_at, last_login_at, profile_data, preferences) = user
                
                return {
                    "id": user_id,
                    "email": email,
                    "username": username,
                    "telegram_id": telegram_id,
                    "telegram_username": telegram_username,
                    "phone": phone,
                    "is_verified": bool(is_verified),
                    "subscription_type": subscription_type,
                    "subscription_expires_at": subscription_expires_at,
                    "created_at": created_at,
                    "last_login_at": last_login_at,
                    "profile_data": json.loads(profile_data or '{}'),
                    "preferences": json.loads(preferences or '{}')
                }
        except Exception:
            return None
    
    def update_user_profile(self, user_id: int, **kwargs) -> bool:
        """Обновление профиля пользователя"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                
                # Разрешенные поля для обновления
                allowed_fields = ['username', 'phone', 'profile_data', 'preferences']
                
                updates = []
                values = []
                
                for field, value in kwargs.items():
                    if field in allowed_fields:
                        if field in ['profile_data', 'preferences'] and isinstance(value, dict):
                            value = json.dumps(value)
                        updates.append(f"{field} = ?")
                        values.append(value)
                
                if not updates:
                    return False
                
                updates.append("updated_at = CURRENT_TIMESTAMP")
                values.append(user_id)
                
                query = f"UPDATE users SET {', '.join(updates)} WHERE id = ?"
                cursor.execute(query, values)
                conn.commit()
                
                return True
        except:
            return False

# Создаем глобальный экземпляр базы данных
user_db = UserDatabase()
