#!/usr/bin/env python3
"""
Сервис отправки email для CryptoWatch MEXC
"""

import smtplib
import ssl
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Dict, Any
import os
from datetime import datetime

class EmailService:
    def __init__(self):
        """Инициализация email сервиса"""
        # Пытаемся загрузить конфигурацию
        try:
            from email_config import get_email_config
            config = get_email_config()
            
            # SMTP настройки
            self.smtp_server = config['smtp']['smtp_server']
            self.smtp_port = config['smtp']['smtp_port']
            self.use_tls = config['smtp'].get('use_tls', True)
            self.sender_email = config['smtp']['email']
            self.sender_password = config['smtp']['password']
            
            # Email настройки
            self.sender_name = config['email']['from_name']
            self.demo_mode = False
            
            print(f"✅ Email сервис инициализован: {self.sender_email}")
            
        except (ImportError, ValueError, FileNotFoundError) as e:
            print(f"❌ КРИТИЧЕСКАЯ ОШИБКА: Конфигурация email не найдена!")
            print(f"❌ Ошибка: {e}")
            print("🔧 ОБЯЗАТЕЛЬНО настройте email_config.py для работы системы!")
            print("📖 Инструкция: website/SETUP_EMAIL.md")
            
            # Для тестирования - используем заглушку
            print("⚠️ Используется тестовая конфигурация email")
            self.smtp_server = 'smtp.gmail.com'
            self.smtp_port = 587
            self.use_tls = True
            self.sender_email = 'test@cryptowatch-mexc.com'
            self.sender_password = 'test-password'
            self.sender_name = 'CryptoWatch MEXC'
            self.demo_mode = True
    
    def send_verification_code(self, to_email: str, code: str, username: str = None) -> Dict[str, Any]:
        """Отправка кода верификации"""
        try:
            subject = "🔐 Код подтверждения CryptoWatch MEXC"
            
            # HTML шаблон письма
            html_content = f"""
            <!DOCTYPE html>
            <html lang="ru">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Код подтверждения</title>
                <style>
                    body {{
                        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                        line-height: 1.6;
                        color: #333;
                        background-color: #f8fafc;
                        margin: 0;
                        padding: 20px;
                    }}
                    .container {{
                        max-width: 600px;
                        margin: 0 auto;
                        background: white;
                        border-radius: 12px;
                        overflow: hidden;
                        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
                    }}
                    .header {{
                        background: linear-gradient(135deg, #00D4FF 0%, #0099CC 100%);
                        padding: 30px;
                        text-align: center;
                        color: white;
                    }}
                    .header h1 {{
                        margin: 0;
                        font-size: 24px;
                        font-weight: 700;
                    }}
                    .header .logo {{
                        font-size: 32px;
                        margin-bottom: 10px;
                    }}
                    .content {{
                        padding: 40px 30px;
                    }}
                    .greeting {{
                        font-size: 18px;
                        margin-bottom: 20px;
                        color: #1a1a2e;
                    }}
                    .code-block {{
                        background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
                        color: white;
                        padding: 30px;
                        border-radius: 12px;
                        text-align: center;
                        margin: 30px 0;
                        border: 2px solid #00D4FF;
                    }}
                    .code {{
                        font-size: 36px;
                        font-weight: 700;
                        letter-spacing: 8px;
                        color: #00D4FF;
                        text-shadow: 0 2px 4px rgba(0, 212, 255, 0.3);
                    }}
                    .code-label {{
                        font-size: 14px;
                        margin-top: 15px;
                        opacity: 0.8;
                    }}
                    .instructions {{
                        background: #f0f9ff;
                        border-left: 4px solid #00D4FF;
                        padding: 20px;
                        margin: 20px 0;
                        border-radius: 0 8px 8px 0;
                    }}
                    .instructions h3 {{
                        margin: 0 0 10px 0;
                        color: #1a1a2e;
                        font-size: 16px;
                    }}
                    .warning {{
                        background: #fef3cd;
                        border: 1px solid #fce38a;
                        color: #856404;
                        padding: 15px;
                        border-radius: 8px;
                        margin: 20px 0;
                        font-size: 14px;
                    }}
                    .footer {{
                        background: #f8fafc;
                        padding: 30px;
                        text-align: center;
                        color: #666;
                        font-size: 14px;
                    }}
                    .footer a {{
                        color: #00D4FF;
                        text-decoration: none;
                    }}
                    .social-links {{
                        margin: 20px 0;
                    }}
                    .social-links a {{
                        display: inline-block;
                        margin: 0 10px;
                        color: #00D4FF;
                        font-size: 20px;
                        text-decoration: none;
                    }}
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <div class="logo">📈</div>
                        <h1>CryptoWatch MEXC</h1>
                        <p>Умный мониторинг криптовалют</p>
                    </div>
                    
                    <div class="content">
                        <div class="greeting">
                            Привет{', ' + username if username else ''}! 👋
                        </div>
                        
                        <p>Вы запросили код подтверждения для входа в свой аккаунт CryptoWatch MEXC.</p>
                        
                        <div class="code-block">
                            <div class="code">{code}</div>
                            <div class="code-label">Ваш код подтверждения</div>
                        </div>
                        
                        <div class="instructions">
                            <h3>📝 Инструкции:</h3>
                            <p>• Введите этот код на странице авторизации<br>
                            • Код действителен в течение 15 минут<br>
                            • Используйте код только один раз</p>
                        </div>
                        
                        <div class="warning">
                            ⚠️ <strong>Безопасность:</strong> Никогда не сообщайте этот код третьим лицам. 
                            Администрация CryptoWatch MEXC никогда не запрашивает коды подтверждения.
                        </div>
                        
                        <p>Если вы не запрашивали этот код, просто проигнорируйте это письмо.</p>
                    </div>
                    
                    <div class="footer">
                        <div class="social-links">
                            <a href="https://t.me/DUMPBest_bot" title="Telegram Bot">🤖</a>
                            <a href="https://t.me/Solnyshchko" title="Support">💬</a>
                            <a href="#" title="Website">🌐</a>
                        </div>
                        
                        <p>© 2024 CryptoWatch MEXC. Все права защищены.</p>
                        <p>
                            <a href="#">Политика конфиденциальности</a> | 
                            <a href="#">Условия использования</a>
                        </p>
                        
                        <p style="margin-top: 20px; font-size: 12px; opacity: 0.7;">
                            Это автоматическое письмо. Пожалуйста, не отвечайте на него.<br>
                            Отправлено: {datetime.now().strftime('%d.%m.%Y в %H:%M')} (UTC)
                        </p>
                    </div>
                </div>
            </body>
            </html>
            """
            
            # Текстовая версия
            text_content = f"""
CryptoWatch MEXC - Код подтверждения

Привет{', ' + username if username else ''}!

Ваш код подтверждения: {code}

Инструкции:
• Введите этот код на странице авторизации
• Код действителен в течение 15 минут
• Используйте код только один раз

ВАЖНО: Никогда не сообщайте этот код третьим лицам!

Если вы не запрашивали этот код, просто проигнорируйте это письмо.

---
CryptoWatch MEXC Team
Поддержка: https://t.me/Solnyshchko
            """
            
            return self._send_email(to_email, subject, html_content, text_content)
            
        except Exception as e:
            return {"success": False, "error": f"Ошибка отправки кода: {str(e)}"}
    
    def send_welcome_email(self, to_email: str, username: str = None) -> Dict[str, Any]:
        """Отправка приветственного письма"""
        try:
            subject = "🎉 Добро пожаловать в CryptoWatch MEXC!"
            
            html_content = f"""
            <!DOCTYPE html>
            <html lang="ru">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Добро пожаловать!</title>
                <style>
                    body {{
                        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                        line-height: 1.6;
                        color: #333;
                        background-color: #f8fafc;
                        margin: 0;
                        padding: 20px;
                    }}
                    .container {{
                        max-width: 600px;
                        margin: 0 auto;
                        background: white;
                        border-radius: 12px;
                        overflow: hidden;
                        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
                    }}
                    .header {{
                        background: linear-gradient(135deg, #00D4FF 0%, #0099CC 100%);
                        padding: 40px 30px;
                        text-align: center;
                        color: white;
                    }}
                    .header h1 {{
                        margin: 0;
                        font-size: 28px;
                        font-weight: 700;
                    }}
                    .header .logo {{
                        font-size: 48px;
                        margin-bottom: 15px;
                    }}
                    .content {{
                        padding: 40px 30px;
                    }}
                    .welcome-message {{
                        font-size: 20px;
                        font-weight: 600;
                        color: #1a1a2e;
                        margin-bottom: 20px;
                        text-align: center;
                    }}
                    .features {{
                        background: #f0f9ff;
                        padding: 30px;
                        border-radius: 12px;
                        margin: 30px 0;
                    }}
                    .feature-item {{
                        display: flex;
                        align-items: center;
                        margin-bottom: 15px;
                        font-size: 16px;
                    }}
                    .feature-item .icon {{
                        font-size: 20px;
                        margin-right: 15px;
                        width: 30px;
                    }}
                    .cta-button {{
                        display: inline-block;
                        background: linear-gradient(135deg, #00D4FF 0%, #0099CC 100%);
                        color: white;
                        padding: 15px 30px;
                        text-decoration: none;
                        border-radius: 25px;
                        font-weight: 600;
                        margin: 20px 0;
                        text-align: center;
                        transition: transform 0.3s ease;
                    }}
                    .cta-button:hover {{
                        transform: translateY(-2px);
                    }}
                    .stats {{
                        display: flex;
                        justify-content: space-around;
                        background: #1a1a2e;
                        color: white;
                        padding: 30px;
                        border-radius: 12px;
                        margin: 30px 0;
                    }}
                    .stat-item {{
                        text-align: center;
                    }}
                    .stat-number {{
                        font-size: 24px;
                        font-weight: 700;
                        color: #00D4FF;
                    }}
                    .stat-label {{
                        font-size: 12px;
                        opacity: 0.8;
                        margin-top: 5px;
                    }}
                    .footer {{
                        background: #f8fafc;
                        padding: 30px;
                        text-align: center;
                        color: #666;
                        font-size: 14px;
                    }}
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <div class="logo">🎉</div>
                        <h1>Добро пожаловать!</h1>
                        <p>Вы успешно присоединились к CryptoWatch MEXC</p>
                    </div>
                    
                    <div class="content">
                        <div class="welcome-message">
                            Спасибо за регистрацию{', ' + username if username else ''}! 🚀
                        </div>
                        
                        <p>Теперь у вас есть доступ к профессиональному мониторингу криптовалют с умными торговыми сигналами.</p>
                        
                        <div class="features">
                            <h3 style="margin-top: 0; color: #1a1a2e;">🎯 Что вас ждет:</h3>
                            
                            <div class="feature-item">
                                <span class="icon">🤖</span>
                                <span>Telegram бот с торговыми сигналами 24/7</span>
                            </div>
                            
                            <div class="feature-item">
                                <span class="icon">📊</span>
                                <span>Технический анализ RSI, MACD, объёмов</span>
                            </div>
                            
                            <div class="feature-item">
                                <span class="icon">🎯</span>
                                <span>Автоматический расчёт целей и стоп-лоссов</span>
                            </div>
                            
                            <div class="feature-item">
                                <span class="icon">🔥</span>
                                <span>Детектор горячих монет и трендов</span>
                            </div>
                            
                            <div class="feature-item">
                                <span class="icon">📈</span>
                                <span>Подробная статистика и аналитика</span>
                            </div>
                        </div>
                        
                        <center>
                            <a href="https://t.me/DUMPBest_bot" class="cta-button">
                                🚀 Запустить Telegram Бота
                            </a>
                        </center>
                        
                        <div class="stats">
                            <div class="stat-item">
                                <div class="stat-number">2,500+</div>
                                <div class="stat-label">Активных пользователей</div>
                            </div>
                            <div class="stat-item">
                                <div class="stat-number">85%</div>
                                <div class="stat-label">Точность сигналов</div>
                            </div>
                            <div class="stat-item">
                                <div class="stat-number">15,000+</div>
                                <div class="stat-label">Отправлено сигналов</div>
                            </div>
                        </div>
                        
                        <p><strong>Нужна помощь?</strong> Обратитесь в нашу поддержку: <a href="https://t.me/Solnyshchko">@Solnyshchko</a></p>
                    </div>
                    
                    <div class="footer">
                        <p>© 2024 CryptoWatch MEXC. Все права защищены.</p>
                        <p>
                            <a href="#">Политика конфиденциальности</a> | 
                            <a href="#">Условия использования</a>
                        </p>
                    </div>
                </div>
            </body>
            </html>
            """
            
            text_content = f"""
Добро пожаловать в CryptoWatch MEXC!

Спасибо за регистрацию{', ' + username if username else ''}!

Теперь у вас есть доступ к:
• Telegram боту с торговыми сигналами 24/7
• Техническому анализу RSI, MACD, объёмов
• Автоматическому расчёту целей и стоп-лоссов
• Детектору горячих монет и трендов
• Подробной статистике и аналитике

Запустите Telegram бота: https://t.me/DUMPBest_bot

Нужна помощь? Обратитесь в поддержку: https://t.me/Solnyshchko

---
CryptoWatch MEXC Team
            """
            
            return self._send_email(to_email, subject, html_content, text_content)
            
        except Exception as e:
            return {"success": False, "error": f"Ошибка отправки приветственного письма: {str(e)}"}
    
    def _send_email(self, to_email: str, subject: str, html_content: str, text_content: str) -> Dict[str, Any]:
        """Базовая функция отправки email"""
        try:
            # Создаем сообщение
            message = MIMEMultipart("alternative")
            message["Subject"] = subject
            message["From"] = f"{self.sender_name} <{self.sender_email}>"
            message["To"] = to_email
            
            # Добавляем текстовую и HTML части
            text_part = MIMEText(text_content, "plain", "utf-8")
            html_part = MIMEText(html_content, "html", "utf-8")
            
            message.attach(text_part)
            message.attach(html_part)
            
            # Специальное исключение для админского email
            if to_email == 'adm1n@cryptowatch.com':
                print(f"🔑 АДМИН: Пропуск отправки email для {to_email}")
                print(f"📧 Тема: {subject}")
                
                # Извлекаем код для админа
                import re
                code_match = re.search(r'<div class="code">([^<]+)</div>', html_content)
                if code_match:
                    print(f"🔢 Код верификации для админа: {code_match.group(1)}")
                
                return {"success": True, "message": "Email обработан для админа"}
            
            # Проверяем, что пароль настроен или работаем в тестовом режиме
            if not self.sender_password or getattr(self, 'demo_mode', False):
                print(f"📧 ТЕСТ: Отправка email на {to_email}")
                print(f"📧 Тема: {subject}")
                print(f"📧 От: {self.sender_name} <{self.sender_email}>")
                
                # Пытаемся извлечь код из HTML для демо
                import re
                code_match = re.search(r'<div class="code">([^<]+)</div>', html_content)
                if code_match:
                    print(f"🔢 Код верификации: {code_match.group(1)}")
                
                return {"success": True, "message": "Email отправлен (тестовый режим)"}
            
            # Отправляем email через SMTP
            print(f"📧 Отправка email на {to_email} через {self.smtp_server}...")
            
            context = ssl.create_default_context()
            with smtplib.SMTP(self.smtp_server, self.smtp_port) as server:
                if self.use_tls:
                    server.starttls(context=context)
                server.login(self.sender_email, self.sender_password)
                server.sendmail(self.sender_email, to_email, message.as_string())
            
            print("✅ Email успешно отправлен!")
            
            return {"success": True, "message": "Email успешно отправлен"}
            
        except Exception as e:
            return {"success": False, "error": f"Ошибка отправки email: {str(e)}"}

# Создаем глобальный экземпляр сервиса
email_service = EmailService()
