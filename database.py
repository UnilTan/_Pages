"""
🔐 Система базы данных с шифрованием для CryptoWatch MEXC
Обеспечивает безопасное хранение пользовательских данных
"""

import sqlite3
import hashlib
import secrets
import json
import os
from datetime import datetime, timedelta
from typing import Optional, Dict, Any, List
from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
import base64

class EncryptionManager:
    """Менеджер шифрования данных"""
    
    def __init__(self, password: str):
        self.password = password.encode()
        self.salt = b'cryptowatch_mexc_salt_2024'  # В продакшене должен быть случайным
        self.fernet = self._create_fernet()
    
    def _create_fernet(self) -> Fernet:
        """Создает объект Fernet для шифрования"""
        kdf = PBKDF2HMAC(
            algorithm=hashes.SHA256(),
            length=32,
            salt=self.salt,
            iterations=100000,
        )
        key = base64.urlsafe_b64encode(kdf.derive(self.password))
        return Fernet(key)
    
    def encrypt(self, data: str) -> str:
        """Шифрует строку"""
        return self.fernet.encrypt(data.encode()).decode()
    
    def decrypt(self, encrypted_data: str) -> str:
        """Расшифровывает строку"""
        return self.fernet.decrypt(encrypted_data.encode()).decode()
    
    def encrypt_dict(self, data: Dict[str, Any]) -> str:
        """Шифрует словарь как JSON"""
        json_data = json.dumps(data, ensure_ascii=False)
        return self.encrypt(json_data)
    
    def decrypt_dict(self, encrypted_data: str) -> Dict[str, Any]:
        """Расшифровывает словарь из JSON"""
        json_data = self.decrypt(encrypted_data)
        return json.loads(json_data)

class DatabaseManager:
    """Менеджер базы данных с шифрованием"""
    
    def __init__(self, db_path: str = "data/users.db", encryption_key: str = "default_key_2024"):
        self.db_path = db_path
        self.encryption = EncryptionManager(encryption_key)
        self._init_database()
    
    def _init_database(self):
        """Инициализирует базу данных"""
        # Создаем директорию если не существует
        os.makedirs(os.path.dirname(self.db_path) if os.path.dirname(self.db_path) else '.', exist_ok=True)
        
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            
            # Таблица пользователей
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS users (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    email TEXT UNIQUE NOT NULL,
                    password_hash TEXT NOT NULL,
                    salt TEXT NOT NULL,
                    encrypted_data TEXT NOT NULL,
                    telegram_id TEXT,
                    is_active BOOLEAN DEFAULT 1,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    last_login TIMESTAMP,
                    login_attempts INTEGER DEFAULT 0,
                    locked_until TIMESTAMP
                )
            """)
            
            # Таблица сессий
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS sessions (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id INTEGER NOT NULL,
                    token_hash TEXT UNIQUE NOT NULL,
                    encrypted_data TEXT NOT NULL,
                    expires_at TIMESTAMP NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    ip_address TEXT,
                    user_agent TEXT,
                    FOREIGN KEY (user_id) REFERENCES users (id)
                )
            """)
            
            # Таблица торговых данных пользователя
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS user_trading_data (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id INTEGER NOT NULL,
                    encrypted_data TEXT NOT NULL,
                    data_type TEXT NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users (id)
                )
            """)
            
            # Таблица настроек пользователя
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS user_settings (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id INTEGER UNIQUE NOT NULL,
                    encrypted_settings TEXT NOT NULL,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users (id)
                )
            """)
            
            # Таблица логов безопасности
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS security_logs (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id INTEGER,
                    event_type TEXT NOT NULL,
                    event_data TEXT,
                    ip_address TEXT,
                    user_agent TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users (id)
                )
            """)
            
            conn.commit()
            print("✅ База данных инициализирована")
    
    def _hash_password(self, password: str, salt: str = None) -> tuple[str, str]:
        """Хеширует пароль с солью"""
        if salt is None:
            salt = secrets.token_hex(32)
        
        password_hash = hashlib.pbkdf2_hmac(
            'sha256',
            password.encode('utf-8'),
            salt.encode('utf-8'),
            100000  # 100k итераций
        )
        
        return base64.b64encode(password_hash).decode('utf-8'), salt
    
    def _verify_password(self, password: str, password_hash: str, salt: str) -> bool:
        """Проверяет пароль"""
        test_hash, _ = self._hash_password(password, salt)
        return test_hash == password_hash
    
    def _generate_token(self) -> str:
        """Генерирует токен сессии"""
        return secrets.token_urlsafe(32)
    
    def _hash_token(self, token: str) -> str:
        """Хеширует токен для хранения в БД"""
        return hashlib.sha256(token.encode()).hexdigest()
    
    def create_user(self, email: str, password: str, name: str, telegram_id: str = None) -> Dict[str, Any]:
        """Создает нового пользователя"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                
                # Проверяем, не существует ли пользователь
                cursor.execute("SELECT id FROM users WHERE email = ?", (email,))
                if cursor.fetchone():
                    return {
                        'success': False,
                        'error': 'AUTH_003',
                        'message': 'Пользователь с таким email уже существует'
                    }
                
                # Хешируем пароль
                password_hash, salt = self._hash_password(password)
                
                # Шифруем персональные данные
                user_data = {
                    'name': name,
                    'email': email,
                    'telegram_id': telegram_id,
                    'preferences': {
                        'notifications': True,
                        'sound': True,
                        'signal_threshold': '7',
                        'auto_refresh': '60'
                    }
                }
                encrypted_data = self.encryption.encrypt_dict(user_data)
                
                # Создаем пользователя
                cursor.execute("""
                    INSERT INTO users (email, password_hash, salt, encrypted_data, telegram_id, created_at)
                    VALUES (?, ?, ?, ?, ?, ?)
                """, (email, password_hash, salt, encrypted_data, telegram_id, datetime.now()))
                
                user_id = cursor.lastrowid
                
                # Создаем начальные настройки
                default_settings = {
                    'notifications_enabled': True,
                    'sound_enabled': True,
                    'signal_threshold': 7,
                    'auto_refresh_interval': 60,
                    'theme': 'light'
                }
                encrypted_settings = self.encryption.encrypt_dict(default_settings)
                
                cursor.execute("""
                    INSERT INTO user_settings (user_id, encrypted_settings)
                    VALUES (?, ?)
                """, (user_id, encrypted_settings))
                
                # Логируем событие
                self._log_security_event(user_id, 'USER_CREATED', {'email': email})
                
                conn.commit()
                
                return {
                    'success': True,
                    'data': {
                        'user_id': user_id,
                        'email': email,
                        'name': name
                    }
                }
                
        except Exception as e:
            print(f"❌ Ошибка создания пользователя: {e}")
            return {
                'success': False,
                'error': 'DATABASE_ERROR',
                'message': 'Ошибка при создании пользователя'
            }
    
    def authenticate_user(self, email: str, password: str, ip_address: str = None, user_agent: str = None) -> Dict[str, Any]:
        """Аутентифицирует пользователя"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                
                # Получаем данные пользователя
                cursor.execute("""
                    SELECT id, password_hash, salt, encrypted_data, is_active, 
                           login_attempts, locked_until
                    FROM users WHERE email = ?
                """, (email,))
                
                user_row = cursor.fetchone()
                if not user_row:
                    self._log_security_event(None, 'LOGIN_FAILED', {
                        'email': email, 'reason': 'user_not_found'
                    }, ip_address, user_agent)
                    return {
                        'success': False,
                        'error': 'AUTH_001',
                        'message': 'Пользователь не найден'
                    }
                
                user_id, password_hash, salt, encrypted_data, is_active, login_attempts, locked_until = user_row
                
                # Проверяем блокировку аккаунта
                if locked_until and datetime.fromisoformat(locked_until) > datetime.now():
                    self._log_security_event(user_id, 'LOGIN_BLOCKED', {
                        'reason': 'account_locked', 'locked_until': locked_until
                    }, ip_address, user_agent)
                    return {
                        'success': False,
                        'error': 'AUTH_005',
                        'message': 'Аккаунт заблокирован'
                    }
                
                # Проверяем активность аккаунта
                if not is_active:
                    self._log_security_event(user_id, 'LOGIN_FAILED', {
                        'reason': 'account_inactive'
                    }, ip_address, user_agent)
                    return {
                        'success': False,
                        'error': 'AUTH_006',
                        'message': 'Аккаунт деактивирован'
                    }
                
                # Проверяем пароль
                if not self._verify_password(password, password_hash, salt):
                    # Увеличиваем счетчик неудачных попыток
                    new_attempts = login_attempts + 1
                    locked_until_time = None
                    
                    if new_attempts >= 5:  # Блокируем после 5 неудачных попыток
                        locked_until_time = datetime.now() + timedelta(minutes=30)
                        cursor.execute("""
                            UPDATE users SET login_attempts = ?, locked_until = ?
                            WHERE id = ?
                        """, (new_attempts, locked_until_time, user_id))
                    else:
                        cursor.execute("""
                            UPDATE users SET login_attempts = ?
                            WHERE id = ?
                        """, (new_attempts, user_id))
                    
                    conn.commit()
                    
                    self._log_security_event(user_id, 'LOGIN_FAILED', {
                        'reason': 'wrong_password', 'attempts': new_attempts
                    }, ip_address, user_agent)
                    
                    return {
                        'success': False,
                        'error': 'AUTH_002',
                        'message': 'Неверный пароль'
                    }
                
                # Успешная аутентификация - сбрасываем счетчик попыток
                cursor.execute("""
                    UPDATE users SET login_attempts = 0, locked_until = NULL, last_login = ?
                    WHERE id = ?
                """, (datetime.now(), user_id))
                
                # Расшифровываем данные пользователя
                user_data = self.encryption.decrypt_dict(encrypted_data)
                
                # Создаем сессию
                token = self._generate_token()
                token_hash = self._hash_token(token)
                expires_at = datetime.now() + timedelta(days=7)  # Токен действует 7 дней
                
                session_data = {
                    'user_id': user_id,
                    'email': email,
                    'created_at': datetime.now().isoformat(),
                    'ip_address': ip_address,
                    'user_agent': user_agent
                }
                encrypted_session = self.encryption.encrypt_dict(session_data)
                
                cursor.execute("""
                    INSERT INTO sessions (user_id, token_hash, encrypted_data, expires_at, ip_address, user_agent)
                    VALUES (?, ?, ?, ?, ?, ?)
                """, (user_id, token_hash, encrypted_session, expires_at, ip_address, user_agent))
                
                conn.commit()
                
                self._log_security_event(user_id, 'LOGIN_SUCCESS', {
                    'session_created': True
                }, ip_address, user_agent)
                
                return {
                    'success': True,
                    'data': {
                        'user': {
                            'id': user_id,
                            'name': user_data['name'],
                            'email': user_data['email'],
                            'telegram_id': user_data.get('telegram_id')
                        },
                        'token': token,
                        'expires_at': expires_at.isoformat()
                    }
                }
                
        except Exception as e:
            print(f"❌ Ошибка аутентификации: {e}")
            return {
                'success': False,
                'error': 'DATABASE_ERROR',
                'message': 'Ошибка при аутентификации'
            }
    
    def validate_session(self, token: str) -> Dict[str, Any]:
        """Проверяет действительность сессии"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                
                token_hash = self._hash_token(token)
                
                cursor.execute("""
                    SELECT s.user_id, s.encrypted_data, s.expires_at, u.encrypted_data
                    FROM sessions s
                    JOIN users u ON s.user_id = u.id
                    WHERE s.token_hash = ? AND s.expires_at > ? AND u.is_active = 1
                """, (token_hash, datetime.now()))
                
                session_row = cursor.fetchone()
                if not session_row:
                    return {
                        'success': False,
                        'error': 'AUTH_004',
                        'message': 'Недействительный токен'
                    }
                
                user_id, session_encrypted_data, expires_at, user_encrypted_data = session_row
                
                # Обновляем время последней активности
                cursor.execute("""
                    UPDATE sessions SET last_activity = ?
                    WHERE token_hash = ?
                """, (datetime.now(), token_hash))
                
                conn.commit()
                
                # Расшифровываем данные
                session_data = self.encryption.decrypt_dict(session_encrypted_data)
                user_data = self.encryption.decrypt_dict(user_encrypted_data)
                
                return {
                    'success': True,
                    'data': {
                        'user': {
                            'id': user_id,
                            'name': user_data['name'],
                            'email': user_data['email'],
                            'telegram_id': user_data.get('telegram_id')
                        },
                        'session': session_data
                    }
                }
                
        except Exception as e:
            print(f"❌ Ошибка валидации сессии: {e}")
            return {
                'success': False,
                'error': 'DATABASE_ERROR',
                'message': 'Ошибка при проверке сессии'
            }
    
    def logout_user(self, token: str) -> Dict[str, Any]:
        """Завершает сессию пользователя"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                
                token_hash = self._hash_token(token)
                
                # Получаем информацию о сессии перед удалением
                cursor.execute("""
                    SELECT user_id FROM sessions WHERE token_hash = ?
                """, (token_hash,))
                
                session_row = cursor.fetchone()
                if session_row:
                    user_id = session_row[0]
                    
                    # Удаляем сессию
                    cursor.execute("DELETE FROM sessions WHERE token_hash = ?", (token_hash,))
                    conn.commit()
                    
                    self._log_security_event(user_id, 'LOGOUT', {'session_ended': True})
                    
                    return {
                        'success': True,
                        'message': 'Сессия завершена'
                    }
                else:
                    return {
                        'success': False,
                        'error': 'AUTH_004',
                        'message': 'Сессия не найдена'
                    }
                    
        except Exception as e:
            print(f"❌ Ошибка завершения сессии: {e}")
            return {
                'success': False,
                'error': 'DATABASE_ERROR',
                'message': 'Ошибка при завершении сессии'
            }
    
    def save_user_trading_data(self, user_id: int, data_type: str, data: Dict[str, Any]) -> Dict[str, Any]:
        """Сохраняет торговые данные пользователя"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                
                encrypted_data = self.encryption.encrypt_dict(data)
                
                # Проверяем, существуют ли уже данные этого типа
                cursor.execute("""
                    SELECT id FROM user_trading_data 
                    WHERE user_id = ? AND data_type = ?
                """, (user_id, data_type))
                
                existing_row = cursor.fetchone()
                
                if existing_row:
                    # Обновляем существующие данные
                    cursor.execute("""
                        UPDATE user_trading_data 
                        SET encrypted_data = ?, updated_at = ?
                        WHERE user_id = ? AND data_type = ?
                    """, (encrypted_data, datetime.now(), user_id, data_type))
                else:
                    # Создаем новые данные
                    cursor.execute("""
                        INSERT INTO user_trading_data (user_id, encrypted_data, data_type)
                        VALUES (?, ?, ?)
                    """, (user_id, encrypted_data, data_type))
                
                conn.commit()
                
                return {
                    'success': True,
                    'message': 'Данные сохранены'
                }
                
        except Exception as e:
            print(f"❌ Ошибка сохранения торговых данных: {e}")
            return {
                'success': False,
                'error': 'DATABASE_ERROR',
                'message': 'Ошибка при сохранении данных'
            }
    
    def get_user_trading_data(self, user_id: int, data_type: str = None) -> Dict[str, Any]:
        """Получает торговые данные пользователя"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                
                if data_type:
                    cursor.execute("""
                        SELECT encrypted_data, data_type, updated_at
                        FROM user_trading_data 
                        WHERE user_id = ? AND data_type = ?
                        ORDER BY updated_at DESC
                    """, (user_id, data_type))
                else:
                    cursor.execute("""
                        SELECT encrypted_data, data_type, updated_at
                        FROM user_trading_data 
                        WHERE user_id = ?
                        ORDER BY updated_at DESC
                    """, (user_id,))
                
                rows = cursor.fetchall()
                
                if not rows:
                    return {
                        'success': True,
                        'data': {}
                    }
                
                result = {}
                for encrypted_data, dtype, updated_at in rows:
                    decrypted_data = self.encryption.decrypt_dict(encrypted_data)
                    result[dtype] = {
                        'data': decrypted_data,
                        'updated_at': updated_at
                    }
                
                return {
                    'success': True,
                    'data': result
                }
                
        except Exception as e:
            print(f"❌ Ошибка получения торговых данных: {e}")
            return {
                'success': False,
                'error': 'DATABASE_ERROR',
                'message': 'Ошибка при получении данных'
            }
    
    def _log_security_event(self, user_id: Optional[int], event_type: str, event_data: Dict[str, Any] = None, 
                          ip_address: str = None, user_agent: str = None):
        """Логирует события безопасности"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                
                cursor.execute("""
                    INSERT INTO security_logs (user_id, event_type, event_data, ip_address, user_agent)
                    VALUES (?, ?, ?, ?, ?)
                """, (user_id, event_type, json.dumps(event_data) if event_data else None, 
                      ip_address, user_agent))
                
                conn.commit()
                
        except Exception as e:
            print(f"❌ Ошибка логирования: {e}")
    
    def cleanup_expired_sessions(self):
        """Очищает истекшие сессии"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                
                cursor.execute("""
                    DELETE FROM sessions WHERE expires_at < ?
                """, (datetime.now(),))
                
                deleted_count = cursor.rowcount
                conn.commit()
                
                if deleted_count > 0:
                    print(f"🧹 Удалено {deleted_count} истекших сессий")
                    
        except Exception as e:
            print(f"❌ Ошибка очистки сессий: {e}")

# Пример использования
if __name__ == "__main__":
    # Инициализируем базу данных
    db = DatabaseManager()
    
    # Создаем тестового пользователя
    result = db.create_user(
        email="test@example.com",
        password="test123456",
        name="Тестовый пользователь",
        telegram_id="@testuser"
    )
    print("Создание пользователя:", result)
    
    # Аутентифицируем пользователя
    auth_result = db.authenticate_user(
        email="test@example.com",
        password="test123456",
        ip_address="127.0.0.1"
    )
    print("Аутентификация:", auth_result)
    
    if auth_result['success']:
        token = auth_result['data']['token']
        
        # Проверяем сессию
        session_result = db.validate_session(token)
        print("Валидация сессии:", session_result)
        
        # Сохраняем торговые данные
        trading_data = {
            'signals': [
                {'pair': 'BTC/USDT', 'change': '+5.2%', 'timestamp': datetime.now().isoformat()}
            ],
            'total_profit': 1250.75,
            'win_rate': 87.3
        }
        
        save_result = db.save_user_trading_data(
            user_id=auth_result['data']['user']['id'],
            data_type='daily_stats',
            data=trading_data
        )
        print("Сохранение данных:", save_result)
        
        # Получаем торговые данные
        get_result = db.get_user_trading_data(
            user_id=auth_result['data']['user']['id']
        )
        print("Получение данных:", get_result)
    
    # Очищаем истекшие сессии
    db.cleanup_expired_sessions()
