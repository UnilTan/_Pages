#!/usr/bin/env python3
"""
API для аутентификации CryptoWatch MEXC
"""

import json
import urllib.parse
import http.server
import socketserver
from urllib.parse import urlparse, parse_qs
import re
from typing import Dict, Any, Optional
import traceback
from pathlib import Path
import os

from database import user_db
from email_service import email_service

class AuthAPIHandler(http.server.SimpleHTTPRequestHandler):
    """Обработчик HTTP запросов для API аутентификации"""
    
    def __init__(self, *args, **kwargs):
        # Устанавливаем директорию для статических файлов
        super().__init__(*args, directory=Path(__file__).parent, **kwargs)
    
    def log_message(self, format, *args):
        """Отключаем стандартное логирование для чистоты вывода"""
        return
    
    def do_OPTIONS(self):
        """Обработка CORS preflight запросов"""
        self.send_response(200)
        self.send_cors_headers()
        self.end_headers()
    
    def send_cors_headers(self):
        """Добавление CORS заголовков"""
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With')
        self.send_header('Access-Control-Max-Age', '3600')
    
    def send_json_response(self, data: Dict[str, Any], status_code: int = 200):
        """Отправка JSON ответа"""
        try:
            response = json.dumps(data, ensure_ascii=False, indent=2)
            response_bytes = response.encode('utf-8')
            
            self.send_response(status_code)
            self.send_cors_headers()
            self.send_header('Content-Type', 'application/json; charset=utf-8')
            self.send_header('Content-Length', str(len(response_bytes)))
            self.end_headers()
            self.wfile.write(response_bytes)
        except Exception as e:
            print(f"Ошибка отправки JSON ответа: {e}")
            self.send_error(500, "Internal Server Error")
    
    def get_request_body(self) -> Dict[str, Any]:
        """Получение тела запроса"""
        try:
            content_length = int(self.headers.get('Content-Length', 0))
            if content_length > 0:
                body = self.rfile.read(content_length).decode('utf-8')
                return json.loads(body)
            return {}
        except Exception as e:
            print(f"Ошибка парсинга тела запроса: {e}")
            return {}
    
    def get_session_from_cookie(self) -> Optional[str]:
        """Извлечение сессии из cookie"""
        try:
            cookie_header = self.headers.get('Cookie', '')
            if 'session_token=' in cookie_header:
                for cookie in cookie_header.split(';'):
                    if 'session_token=' in cookie:
                        return cookie.split('session_token=')[1].strip()
            return None
        except:
            return None
    
    def do_POST(self):
        """Обработка POST запросов"""
        try:
            path = urlparse(self.path).path
            
            # API маршруты
            # ВРЕМЕННО ОТКЛЮЧЕНО: регистрация
            # if path == '/api/auth/register':
            #     self.handle_register()
            if path == '/api/auth/login':
                self.handle_login()
            elif path == '/api/auth/verify-email':
                self.handle_verify_email()
            elif path == '/api/auth/resend-code':
                self.handle_resend_code()
            elif path == '/api/auth/forgot-password':
                self.handle_forgot_password()
            elif path == '/api/auth/reset-password':
                self.handle_reset_password()
            elif path == '/api/auth/logout':
                self.handle_logout()
            elif path == '/api/auth/telegram-auth':
                self.handle_telegram_auth()
            elif path == '/api/auth/link-telegram':
                self.handle_link_telegram()
            else:
                self.send_json_response({"error": "API endpoint not found"}, 404)
                
        except Exception as e:
            print(f"Ошибка в do_POST: {e}")
            print(traceback.format_exc())
            self.send_json_response({"error": "Internal server error"}, 500)
    
    def do_GET(self):
        """Обработка GET запросов"""
        try:
            path = urlparse(self.path).path
            query_params = parse_qs(urlparse(self.path).query)
            
            # API маршруты
            if path == '/api/auth/profile':
                self.handle_get_profile()
            elif path == '/api/auth/session':
                self.handle_check_session()
            elif path == '/api/auth/telegram-callback':
                self.handle_telegram_callback(query_params)
            else:
                # Обслуживание статических файлов
                super().do_GET()
                
        except Exception as e:
            print(f"Ошибка в do_GET: {e}")
            print(traceback.format_exc())
            if path.startswith('/api/'):
                self.send_json_response({"error": "Internal server error"}, 500)
            else:
                self.send_error(500, "Internal Server Error")
    
    def handle_register(self):
        """Регистрация нового пользователя"""
        try:
            data = self.get_request_body()
            
            email = data.get('email', '').strip().lower()
            password = data.get('password', '')
            username = data.get('username', '').strip()
            
            # Валидация
            if not email or not password:
                self.send_json_response({"error": "Email и пароль обязательны"}, 400)
                return
            
            # Проверка формата email
            email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
            if not re.match(email_pattern, email):
                self.send_json_response({"error": "Неверный формат email"}, 400)
                return
            
            # Проверка длины пароля
            if len(password) < 6:
                self.send_json_response({"error": "Пароль должен содержать минимум 6 символов"}, 400)
                return
            
            # Создание пользователя
            result = user_db.create_user(email, password, username)
            
            if not result['success']:
                self.send_json_response({"error": result['error']}, 400)
                return
            
            # Создание кода верификации
            verification_code = user_db.create_verification_code(email, 'email_verification')
            
            # Отправка email с кодом верификации
            email_result = email_service.send_verification_code(email, verification_code, username)
            
            if email_result['success']:
                self.send_json_response({
                    "success": True,
                    "message": "Регистрация успешна! Проверьте email для подтверждения аккаунта",
                    "email_sent": True
                })
            else:
                self.send_json_response({
                    "success": True,
                    "message": "Регистрация успешна! Код верификации отправлен",
                    "email_sent": False,
                    "verification_code": verification_code  # Только для тестирования
                })
                
        except Exception as e:
            print(f"Ошибка регистрации: {e}")
            self.send_json_response({"error": "Ошибка сервера при регистрации"}, 500)
    
    def handle_login(self):
        """Авторизация пользователя"""
        try:
            data = self.get_request_body()
            
            email = data.get('email', '').strip().lower()
            password = data.get('password', '')
            
            if not email or not password:
                self.send_json_response({"error": "Email и пароль обязательны"}, 400)
                return
            
            # Аутентификация
            auth_result = user_db.authenticate_user(email, password)
            
            if not auth_result['success']:
                self.send_json_response({"error": auth_result['error']}, 401)
                return
            
            user = auth_result['user']
            
            # Проверка верификации email
            if not user['is_verified']:
                # Создаем новый код верификации
                verification_code = user_db.create_verification_code(email, 'email_verification')
                
                # Пытаемся отправить email
                email_result = email_service.send_verification_code(email, verification_code, user['username'])
                
                response_data = {
                    "error": "Email не подтвержден",
                    "email_verification_required": True,
                    "email_sent": email_result['success']
                }
                
                if not email_result['success']:
                    response_data["verification_code"] = verification_code  # Для тестирования
                
                self.send_json_response(response_data, 403)
                return
            
            # Создание сессии
            client_ip = self.client_address[0]
            user_agent = self.headers.get('User-Agent', '')
            session_token = user_db.create_session(user['id'], client_ip, user_agent)
            
            self.send_json_response({
                "success": True,
                "message": "Успешная авторизация",
                "user": user,
                "session_token": session_token
            })
            
        except Exception as e:
            print(f"Ошибка авторизации: {e}")
            self.send_json_response({"error": "Ошибка сервера при авторизации"}, 500)
    
    def handle_verify_email(self):
        """Подтверждение email"""
        try:
            data = self.get_request_body()
            
            email = data.get('email', '').strip().lower()
            code = data.get('code', '').strip()
            
            if not email or not code:
                self.send_json_response({"error": "Email и код обязательны"}, 400)
                return
            
            # Проверка кода
            if user_db.verify_code(email, code, 'email_verification'):
                # Отправляем приветственное письмо
                try:
                    # Получаем данные пользователя
                    auth_result = user_db.authenticate_user(email, "dummy")  # Получаем пользователя
                    if auth_result.get('user', {}).get('username'):
                        email_service.send_welcome_email(email, auth_result['user']['username'])
                except:
                    pass  # Не критично если приветственное письмо не отправится
                
                self.send_json_response({
                    "success": True,
                    "message": "Email успешно подтвержден!"
                })
            else:
                self.send_json_response({"error": "Неверный или истекший код"}, 400)
                
        except Exception as e:
            print(f"Ошибка подтверждения email: {e}")
            self.send_json_response({"error": "Ошибка сервера"}, 500)
    
    def handle_resend_code(self):
        """Повторная отправка кода верификации"""
        try:
            data = self.get_request_body()
            email = data.get('email', '').strip().lower()
            
            if not email:
                self.send_json_response({"error": "Email обязателен"}, 400)
                return
            
            # Создаем новый код
            verification_code = user_db.create_verification_code(email, 'email_verification')
            
            # Отправляем email
            email_result = email_service.send_verification_code(email, verification_code)
            
            if email_result['success']:
                self.send_json_response({
                    "success": True,
                    "message": "Код отправлен повторно"
                })
            else:
                self.send_json_response({
                    "success": True,
                    "message": "Код создан",
                    "verification_code": verification_code  # Для тестирования
                })
                
        except Exception as e:
            print(f"Ошибка повторной отправки кода: {e}")
            self.send_json_response({"error": "Ошибка сервера"}, 500)
    
    def handle_forgot_password(self):
        """Восстановление пароля"""
        try:
            data = self.get_request_body()
            email = data.get('email', '').strip().lower()
            
            if not email:
                self.send_json_response({"error": "Email обязателен"}, 400)
                return
            
            # Создаем код для сброса пароля
            reset_code = user_db.create_verification_code(email, 'password_reset')
            
            # Отправляем email (в реальной системе)
            # email_service.send_password_reset_code(email, reset_code)
            
            self.send_json_response({
                "success": True,
                "message": "Код для сброса пароля отправлен на email",
                "reset_code": reset_code  # Только для тестирования
            })
            
        except Exception as e:
            print(f"Ошибка восстановления пароля: {e}")
            self.send_json_response({"error": "Ошибка сервера"}, 500)
    
    def handle_reset_password(self):
        """Сброс пароля"""
        try:
            data = self.get_request_body()
            
            email = data.get('email', '').strip().lower()
            code = data.get('code', '').strip()
            new_password = data.get('new_password', '')
            
            if not all([email, code, new_password]):
                self.send_json_response({"error": "Все поля обязательны"}, 400)
                return
            
            if len(new_password) < 6:
                self.send_json_response({"error": "Пароль должен содержать минимум 6 символов"}, 400)
                return
            
            # Проверяем код
            if not user_db.verify_code(email, code, 'password_reset'):
                self.send_json_response({"error": "Неверный или истекший код"}, 400)
                return
            
            # Обновляем пароль (здесь нужно добавить метод в user_db)
            # user_db.update_password(email, new_password)
            
            self.send_json_response({
                "success": True,
                "message": "Пароль успешно изменен"
            })
            
        except Exception as e:
            print(f"Ошибка сброса пароля: {e}")
            self.send_json_response({"error": "Ошибка сервера"}, 500)
    
    def handle_logout(self):
        """Выход из системы"""
        try:
            session_token = self.get_session_from_cookie()
            
            if session_token:
                user_db.logout_session(session_token)
            
            self.send_json_response({
                "success": True,
                "message": "Выход выполнен успешно"
            })
            
        except Exception as e:
            print(f"Ошибка выхода: {e}")
            self.send_json_response({"error": "Ошибка сервера"}, 500)
    
    def handle_get_profile(self):
        """Получение профиля пользователя"""
        try:
            session_token = self.get_session_from_cookie()
            
            if not session_token:
                self.send_json_response({"error": "Необходима авторизация"}, 401)
                return
            
            session = user_db.validate_session(session_token)
            if not session:
                self.send_json_response({"error": "Недействительная сессия"}, 401)
                return
            
            profile = user_db.get_user_profile(session['user_id'])
            if not profile:
                self.send_json_response({"error": "Профиль не найден"}, 404)
                return
            
            self.send_json_response({
                "success": True,
                "profile": profile
            })
            
        except Exception as e:
            print(f"Ошибка получения профиля: {e}")
            self.send_json_response({"error": "Ошибка сервера"}, 500)
    
    def handle_check_session(self):
        """Проверка активной сессии"""
        try:
            session_token = self.get_session_from_cookie()
            
            if not session_token:
                self.send_json_response({"authenticated": False})
                return
            
            session = user_db.validate_session(session_token)
            
            if session:
                self.send_json_response({
                    "authenticated": True,
                    "user": session
                })
            else:
                self.send_json_response({"authenticated": False})
                
        except Exception as e:
            print(f"Ошибка проверки сессии: {e}")
            self.send_json_response({"authenticated": False})
    
    def handle_telegram_auth(self):
        """Создание Telegram авторизации"""
        try:
            data = self.get_request_body()
            telegram_id = data.get('telegram_id', '').strip()
            telegram_username = data.get('telegram_username', '').strip()
            
            if not telegram_id:
                self.send_json_response({"error": "Telegram ID обязателен"}, 400)
                return
            
            # Создаем токен для авторизации через Telegram
            auth_token = user_db.create_telegram_auth(telegram_id, telegram_username)
            
            self.send_json_response({
                "success": True,
                "auth_token": auth_token,
                "message": "Токен создан для Telegram авторизации"
            })
            
        except Exception as e:
            print(f"Ошибка Telegram авторизации: {e}")
            self.send_json_response({"error": "Ошибка сервера"}, 500)
    
    def handle_telegram_callback(self, query_params):
        """Обработка callback от Telegram"""
        try:
            auth_token = query_params.get('token', [''])[0]
            
            if not auth_token:
                self.send_json_response({"error": "Токен не найден"}, 400)
                return
            
            # Проверяем токен
            telegram_data = user_db.verify_telegram_auth(auth_token)
            
            if not telegram_data:
                self.send_json_response({"error": "Недействительный токен"}, 400)
                return
            
            # Если пользователь уже связан, авторизуем его
            if telegram_data['user_id']:
                session_token = user_db.create_session(telegram_data['user_id'])
                
                self.send_json_response({
                    "success": True,
                    "message": "Авторизация через Telegram успешна",
                    "session_token": session_token,
                    "telegram_data": telegram_data
                })
            else:
                # Возвращаем данные для привязки к аккаунту
                self.send_json_response({
                    "success": True,
                    "telegram_data": telegram_data,
                    "requires_account_link": True
                })
                
        except Exception as e:
            print(f"Ошибка Telegram callback: {e}")
            self.send_json_response({"error": "Ошибка сервера"}, 500)
    
    def handle_link_telegram(self):
        """Привязка Telegram к существующему аккаунту"""
        try:
            data = self.get_request_body()
            session_token = self.get_session_from_cookie()
            
            telegram_id = data.get('telegram_id', '').strip()
            telegram_username = data.get('telegram_username', '').strip()
            
            if not session_token:
                self.send_json_response({"error": "Необходима авторизация"}, 401)
                return
            
            if not telegram_id:
                self.send_json_response({"error": "Telegram ID обязателен"}, 400)
                return
            
            # Проверяем сессию
            session = user_db.validate_session(session_token)
            if not session:
                self.send_json_response({"error": "Недействительная сессия"}, 401)
                return
            
            # Привязываем Telegram к пользователю
            success = user_db.link_telegram_to_user(session['user_id'], telegram_id, telegram_username)
            
            if success:
                self.send_json_response({
                    "success": True,
                    "message": "Telegram успешно привязан к аккаунту"
                })
            else:
                self.send_json_response({"error": "Ошибка привязки Telegram"}, 500)
                
        except Exception as e:
            print(f"Ошибка привязки Telegram: {e}")
            self.send_json_response({"error": "Ошибка сервера"}, 500)

def start_auth_server(port: int = 8000, host: str = "localhost"):
    """Запуск сервера с API аутентификации"""
    
    # Проверяем email конфигурацию при запуске
    print("🔧 Проверка email конфигурации...")
    try:
        from email_service import email_service
        print("✅ Email система готова")
    except RuntimeError as e:
        print(f"❌ КРИТИЧЕСКАЯ ОШИБКА: {e}")
        print("🔧 ОБЯЗАТЕЛЬНО настройте email_config.py перед запуском!")
        print("📖 Инструкция: website/SETUP_EMAIL.md")
        print("🧪 Тест системы: python test_email.py")
        print("=" * 60)
        return
    except Exception as e:
        print(f"❌ Ошибка инициализации email: {e}")
        print("🔧 Проверьте настройки email_config.py")
        return
    
    try:
        with socketserver.TCPServer((host, port), AuthAPIHandler) as httpd:
            print(f"🚀 Сервер CryptoWatch MEXC запущен на http://{host}:{port}")
            print(f"📂 Корневая директория: {Path(__file__).parent}")
            print("📱 API endpoints доступны:")
            print("   POST /api/auth/register - Регистрация")
            print("   POST /api/auth/login - Авторизация")
            print("   POST /api/auth/verify-email - Подтверждение email")
            print("   POST /api/auth/resend-code - Повторная отправка кода")
            print("   POST /api/auth/logout - Выход")
            print("   GET  /api/auth/profile - Профиль пользователя")
            print("   GET  /api/auth/session - Проверка сессии")
            print("⏹️  Для остановки нажмите Ctrl+C")
            print("-" * 60)
            
            httpd.serve_forever()
            
    except KeyboardInterrupt:
        print("\n🛑 Сервер остановлен")
    except Exception as e:
        print(f"❌ Ошибка запуска сервера: {e}")

if __name__ == "__main__":
    start_auth_server()
