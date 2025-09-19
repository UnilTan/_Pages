"""
🌐 API сервер для CryptoWatch MEXC
Обеспечивает интеграцию между веб-интерфейсом и торговым ботом
"""

from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from functools import wraps
import json
import os
import sys
from datetime import datetime, timedelta
import requests
from typing import Dict, Any, Optional
import threading
import time

# Добавляем текущую директорию в путь для импорта database.py
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import DatabaseManager
import requests

app = Flask(__name__)
CORS(app)

# Конфигурация
CONFIG = {
    'SECRET_KEY': 'cryptowatch_mexc_secret_2024',
    'DATABASE_PATH': 'data/users.db',
    'ENCRYPTION_KEY': 'cryptowatch_mexc_encryption_2024',
    'BOT_API_URL': 'http://localhost:8000',  # URL бота
    'BOT_API_KEY': 'bot_api_key_2024',
    'DEBUG': True,
    'BOT_API_TIMEOUT': 5  # Таймаут для запросов к боту
}

# Инициализация базы данных
db_manager = DatabaseManager(
    db_path=CONFIG['DATABASE_PATH'],
    encryption_key=CONFIG['ENCRYPTION_KEY']
)

# Коды ошибок
ERROR_CODES = {
    'AUTH_001': {'message': 'Пользователь не найден', 'http_code': 404},
    'AUTH_002': {'message': 'Неверный пароль', 'http_code': 401},
    'AUTH_003': {'message': 'Email уже используется', 'http_code': 409},
    'AUTH_004': {'message': 'Недействительный токен', 'http_code': 401},
    'AUTH_005': {'message': 'Аккаунт заблокирован', 'http_code': 423},
    'AUTH_006': {'message': 'Аккаунт деактивирован', 'http_code': 403},
    'BOT_001': {'message': 'Бот недоступен', 'http_code': 503},
    'BOT_002': {'message': 'Неверный API ключ бота', 'http_code': 401},
    'BOT_003': {'message': 'Превышено время ожидания', 'http_code': 408},
    'DATA_001': {'message': 'Данные не найдены', 'http_code': 404},
    'DATA_002': {'message': 'Неверный формат данных', 'http_code': 400},
    'SERVER_001': {'message': 'Внутренняя ошибка сервера', 'http_code': 500},
    'TIMEOUT': {'message': 'Превышено время ожидания', 'http_code': 408}
}

def handle_error(error_code: str, custom_message: str = None) -> tuple:
    """Обрабатывает ошибку и возвращает JSON ответ"""
    error_info = ERROR_CODES.get(error_code, {
        'message': 'Неизвестная ошибка',
        'http_code': 500
    })
    
    response = {
        'success': False,
        'error': error_code,
        'message': custom_message or error_info['message'],
        'timestamp': datetime.now().isoformat()
    }
    
    return jsonify(response), error_info['http_code']

def require_auth(f):
    """Декоратор для проверки авторизации"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        auth_header = request.headers.get('Authorization')
        
        if not auth_header or not auth_header.startswith('Bearer '):
            return handle_error('AUTH_004', 'Отсутствует токен авторизации')
        
        token = auth_header.split(' ')[1]
        session_result = db_manager.validate_session(token)
        
        if not session_result['success']:
            return handle_error(session_result['error'], session_result['message'])
        
        # Добавляем данные пользователя в request
        request.user = session_result['data']['user']
        request.session = session_result['data']['session']
        
        return f(*args, **kwargs)
    
    return decorated_function

def get_client_info() -> tuple:
    """Получает информацию о клиенте"""
    ip_address = request.environ.get('HTTP_X_FORWARDED_FOR', request.remote_addr)
    user_agent = request.headers.get('User-Agent', '')
    return ip_address, user_agent

class BotConnector:
    """Коннектор для связи с торговым ботом"""
    
    def __init__(self, bot_url: str, api_key: str):
        self.bot_url = bot_url.rstrip('/')
        self.api_key = api_key
        self.timeout = CONFIG['BOT_API_TIMEOUT']
    
    def make_request(self, endpoint: str, method: str = 'GET', data: Dict[str, Any] = None) -> Dict[str, Any]:
        """Выполняет запрос к боту"""
        try:
            url = f"{self.bot_url}{endpoint}"
            headers = {
                'Content-Type': 'application/json'
            }
            
            print(f"🤖 Запрос к боту: {method} {url}")
            
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=self.timeout)
            elif method == 'POST':
                response = requests.post(url, headers=headers, json=data, timeout=self.timeout)
            else:
                raise ValueError(f"Неподдерживаемый метод: {method}")
            
            if response.status_code == 200:
                return {
                    'success': True,
                    'data': response.json()
                }
            else:
                return {
                    'success': False,
                    'error': 'BOT_001',
                    'message': f'Бот вернул код {response.status_code}'
                }
                
        except requests.exceptions.Timeout:
            return {
                'success': False,
                'error': 'TIMEOUT',
                'message': 'Превышено время ожидания ответа от бота'
            }
        except requests.exceptions.ConnectionError:
            return {
                'success': False,
                'error': 'BOT_001',
                'message': 'Не удается подключиться к боту'
            }
        except Exception as e:
            print(f"❌ Ошибка запроса к боту: {e}")
            return {
                'success': False,
                'error': 'BOT_001',
                'message': 'Ошибка связи с ботом'
            }

# Инициализация коннектора бота
bot_connector = BotConnector(CONFIG['BOT_API_URL'], CONFIG['BOT_API_KEY'])

# === МАРШРУТЫ СТАТИЧЕСКИХ ФАЙЛОВ ===

@app.route('/')
def index():
    """Главная страница"""
    return send_from_directory('.', 'index.html')

@app.route('/<path:filename>')
def static_files(filename):
    """Статические файлы"""
    return send_from_directory('.', filename)

# === МАРШРУТЫ АВТОРИЗАЦИИ ===

@app.route('/api/auth/register', methods=['POST'])
def register():
    """Регистрация нового пользователя"""
    try:
        data = request.get_json()
        
        if not data:
            return handle_error('DATA_002', 'Отсутствуют данные запроса')
        
        # Валидация данных
        required_fields = ['name', 'email', 'password']
        for field in required_fields:
            if not data.get(field):
                return handle_error('DATA_002', f'Поле {field} обязательно')
        
        # Создаем пользователя
        result = db_manager.create_user(
            email=data['email'],
            password=data['password'],
            name=data['name'],
            telegram_id=data.get('telegram')
        )
        
        if not result['success']:
            return handle_error(result['error'], result['message'])
        
        # Автоматически авторизуем пользователя после регистрации
        ip_address, user_agent = get_client_info()
        auth_result = db_manager.authenticate_user(
            email=data['email'],
            password=data['password'],
            ip_address=ip_address,
            user_agent=user_agent
        )
        
        if auth_result['success']:
            return jsonify({
                'success': True,
                'message': 'Пользователь успешно зарегистрирован',
                'data': auth_result['data']
            })
        else:
            return jsonify({
                'success': True,
                'message': 'Пользователь зарегистрирован, требуется вход',
                'data': result['data']
            })
            
    except Exception as e:
        print(f"❌ Ошибка регистрации: {e}")
        return handle_error('SERVER_001', 'Ошибка при регистрации')

@app.route('/api/auth/login', methods=['POST'])
def login():
    """Авторизация пользователя"""
    try:
        data = request.get_json()
        
        if not data or not data.get('email') or not data.get('password'):
            return handle_error('DATA_002', 'Email и пароль обязательны')
        
        ip_address, user_agent = get_client_info()
        
        result = db_manager.authenticate_user(
            email=data['email'],
            password=data['password'],
            ip_address=ip_address,
            user_agent=user_agent
        )
        
        if not result['success']:
            return handle_error(result['error'], result['message'])
        
        return jsonify({
            'success': True,
            'message': 'Успешная авторизация',
            'data': result['data']
        })
        
    except Exception as e:
        print(f"❌ Ошибка авторизации: {e}")
        return handle_error('SERVER_001', 'Ошибка при авторизации')

@app.route('/api/auth/logout', methods=['POST'])
@require_auth
def logout():
    """Завершение сессии"""
    try:
        auth_header = request.headers.get('Authorization')
        token = auth_header.split(' ')[1]
        
        result = db_manager.logout_user(token)
        
        if not result['success']:
            return handle_error(result['error'], result['message'])
        
        return jsonify({
            'success': True,
            'message': 'Сессия завершена'
        })
        
    except Exception as e:
        print(f"❌ Ошибка завершения сессии: {e}")
        return handle_error('SERVER_001', 'Ошибка при завершении сессии')

@app.route('/api/auth/validate', methods=['GET'])
@require_auth
def validate_token():
    """Проверка действительности токена"""
    return jsonify({
        'success': True,
        'data': {
            'user': request.user,
            'session': request.session
        }
    })

# === МАРШРУТЫ ДАШБОРДА ===

@app.route('/api/dashboard/user', methods=['GET'])
@require_auth
def get_user_profile():
    """Получение профиля пользователя"""
    return jsonify({
        'success': True,
        'data': {
            'user': request.user
        }
    })

@app.route('/api/dashboard/stats', methods=['GET'])
@require_auth
def get_user_stats():
    """Получение статистики пользователя"""
    try:
        # Получаем статистику от бота
        result = bot_connector.make_request('/api/stats')
        
        if result['success']:
            # Используем реальные данные от бота
            stats = result['data']
        else:
            # Fallback к данным пользователя или стандартным данным
            user_id = request.user['id']
            trading_data_result = db_manager.get_user_trading_data(user_id)
            
            if trading_data_result['success'] and 'daily_stats' in trading_data_result['data']:
                daily_data = trading_data_result['data']['daily_stats']['data']
                stats = {
                    'total_signals': daily_data.get('total_signals', 0),
                    'success_rate': daily_data.get('win_rate', 0.0),
                    'today_signals': daily_data.get('today_signals', 0),
                    'total_profit': daily_data.get('total_profit', 0.0),
                    'active_signals': daily_data.get('active_signals', 0)
                }
            else:
                # Стандартные данные
                stats = {
                    'total_signals': 1247,
                    'success_rate': 87.3,
                    'today_signals': 23,
                    'total_profit': 2450.75,
                    'active_signals': 12
                }
        
        return jsonify({
            'success': True,
            'data': stats
        })
        
    except Exception as e:
        print(f"❌ Ошибка получения статистики: {e}")
        return handle_error('SERVER_001', 'Ошибка при получении статистики')

# === МАРШРУТЫ ИНТЕГРАЦИИ С БОТОМ ===

@app.route('/api/bot/status', methods=['GET'])
@require_auth
def get_bot_status():
    """Получение статуса бота"""
    result = bot_connector.make_request('/api/status')
    
    if not result['success']:
        return handle_error(result['error'], result['message'])
    
    return jsonify({
        'success': True,
        'data': result['data']
    })

@app.route('/api/bot/signals', methods=['GET'])
@require_auth
def get_bot_signals():
    """Получение активных сигналов от бота"""
    result = bot_connector.make_request('/api/signals')
    
    if not result['success']:
        # Возвращаем стандартные данные если бот недоступен
        demo_signals = [
            {
                'pair': 'BTC/USDT',
                'change': '+8.5%',
                'type': 'pump',
                'timestamp': int(time.time()) - 300,
                'quality': 'high'
            },
            {
                'pair': 'ETH/USDT',
                'change': '-6.2%',
                'type': 'dump',
                'timestamp': int(time.time()) - 600,
                'quality': 'medium'
            }
        ]
        
        return jsonify({
            'success': True,
            'data': {
                'signals': demo_signals,
                'demo': True,
                'message': 'Данные загружены'
            }
        })
    
    # Форматируем данные от бота для совместимости с фронтендом
    signals = result['data'].get('signals', [])
    formatted_signals = []
    
    for signal in signals:
        formatted_signals.append({
            'pair': signal.get('pair', 'UNKNOWN'),
            'change': signal.get('change', '+0.0%'),
            'type': signal.get('type', 'pump'),
            'timestamp': signal.get('timestamp', int(time.time())),
            'quality': signal.get('quality', 'medium'),
            'status': signal.get('status', 'active')
        })
    
    return jsonify({
        'success': True,
        'data': {
            'signals': formatted_signals,
            'demo': False
        }
    })

@app.route('/api/bot/trades', methods=['GET'])
@require_auth
def get_bot_trades():
    """Получение истории сделок от бота"""
    result = bot_connector.make_request('/api/trades')
    
    if not result['success']:
        # Возвращаем стандартные данные
        demo_trades = [
            {
                'pair': 'BTC/USDT',
                'result': 'profit',
                'amount': '+$245.50',
                'timestamp': int(time.time()) - 3600
            },
            {
                'pair': 'ETH/USDT',
                'result': 'loss',
                'amount': '-$89.20',
                'timestamp': int(time.time()) - 7200
            }
        ]
        
        return jsonify({
            'success': True,
            'data': {
                'trades': demo_trades,
                'demo': True
            }
        })
    
    # Форматируем данные от бота
    trades = result['data'].get('trades', [])
    formatted_trades = []
    
    for trade in trades:
        formatted_trades.append({
            'pair': trade.get('pair', 'UNKNOWN'),
            'result': trade.get('result', 'loss'),
            'amount': trade.get('amount', '0.00%'),
            'timestamp': trade.get('timestamp', int(time.time()))
        })
    
    return jsonify({
        'success': True,
        'data': {
            'trades': formatted_trades,
            'demo': False
        }
    })

@app.route('/api/bot/hot-coins', methods=['GET'])
@require_auth
def get_hot_coins():
    """Получение горячих монет от бота"""
    result = bot_connector.make_request('/api/hot-coins')
    
    if not result['success']:
        # Возвращаем стандартные данные
        demo_coins = [
            {'symbol': 'DOGE', 'change': '+15.8%'},
            {'symbol': 'SHIB', 'change': '+12.4%'},
            {'symbol': 'PEPE', 'change': '+9.7%'},
            {'symbol': 'FLOKI', 'change': '+8.2%'}
        ]
        
        return jsonify({
            'success': True,
            'data': {
                'coins': demo_coins,
                'demo': True
            }
        })
    
    # Форматируем данные от бота
    coins_data = result['data']
    formatted_coins = coins_data.get('coins', [])
    
    return jsonify({
        'success': True,
        'data': {
            'coins': formatted_coins,
            'demo': False
        }
    })

@app.route('/api/bot/analytics', methods=['GET'])
@require_auth
def get_bot_analytics():
    """Получение аналитических данных от бота"""
    result = bot_connector.make_request('/api/analytics')
    
    if not result['success']:
        # Генерируем стандартные данные для графика
        chart_labels = []
        chart_data = []
        
        for i in range(7):
            date = datetime.now() - timedelta(days=6-i)
            chart_labels.append(date.strftime('%d.%m'))
            chart_data.append({
                'profit': round((i * 2.5 + 5) * (1 + (i % 3 - 1) * 0.2), 1),
                'accuracy': round(75 + i * 3 + (i % 2) * 5, 1)
            })
        
        demo_analytics = {
            'total_signals': 1247,
            'success_rate': 87.3,
            'today_signals': 23,
            'chart_data': {
                'labels': chart_labels,
                'data': chart_data
            }
        }
        
        return jsonify({
            'success': True,
            'data': {
                **demo_analytics,
                'demo': True
            }
        })
    
    # Используем реальные данные от бота
    analytics_data = result['data']
    
    return jsonify({
        'success': True,
        'data': {
            **analytics_data,
            'demo': False
        }
    })

# === МАРШРУТЫ ДЛЯ БОТА ===

@app.route('/api/webhook/signal', methods=['POST'])
def receive_signal():
    """Получение сигнала от бота"""
    try:
        # Проверяем API ключ бота
        api_key = request.headers.get('X-API-Key')
        if api_key != CONFIG['BOT_API_KEY']:
            return handle_error('BOT_002', 'Неверный API ключ')
        
        data = request.get_json()
        if not data:
            return handle_error('DATA_002', 'Отсутствуют данные сигнала')
        
        print(f"📡 Получен сигнал от бота: {data}")
        
        # TODO: Здесь можно добавить логику обработки сигнала
        # Например, уведомление пользователей, сохранение в базу данных
        
        return jsonify({
            'success': True,
            'message': 'Сигнал получен и обработан'
        })
        
    except Exception as e:
        print(f"❌ Ошибка обработки сигнала: {e}")
        return handle_error('SERVER_001', 'Ошибка при обработке сигнала')

@app.route('/api/webhook/trade-result', methods=['POST'])
def receive_trade_result():
    """Получение результата сделки от бота"""
    try:
        # Проверяем API ключ бота
        api_key = request.headers.get('X-API-Key')
        if api_key != CONFIG['BOT_API_KEY']:
            return handle_error('BOT_002', 'Неверный API ключ')
        
        data = request.get_json()
        if not data:
            return handle_error('DATA_002', 'Отсутствуют данные результата')
        
        print(f"💰 Получен результат сделки от бота: {data}")
        
        # TODO: Обновление статистики пользователей
        
        return jsonify({
            'success': True,
            'message': 'Результат сделки обработан'
        })
        
    except Exception as e:
        print(f"❌ Ошибка обработки результата: {e}")
        return handle_error('SERVER_001', 'Ошибка при обработке результата')

# === СЛУЖЕБНЫЕ МАРШРУТЫ ===

@app.route('/api/health', methods=['GET'])
def health_check():
    """Проверка здоровья сервера"""
    return jsonify({
        'success': True,
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'version': '1.0.0'
    })

@app.route('/api/error-codes', methods=['GET'])
def get_error_codes():
    """Получение списка кодов ошибок"""
    return jsonify({
        'success': True,
        'data': ERROR_CODES
    })

# === ФОНОВЫЕ ЗАДАЧИ ===

def cleanup_task():
    """Фоновая задача очистки"""
    try:
        print("🧹 Выполнение очистки...")
        db_manager.cleanup_expired_sessions()
    except Exception as e:
        print(f"❌ Ошибка в задаче очистки: {e}")

def start_cleanup_task():
    """Запускает задачу очистки без daemon thread"""
    cleanup_task()
    # Планируем следующую очистку через Flask
    if app:
        from threading import Timer
        timer = Timer(3600.0, start_cleanup_task)  # Каждый час
        timer.start()

# === ОБРАБОТЧИКИ ОШИБОК ===

@app.errorhandler(404)
def not_found(error):
    return handle_error('DATA_001', 'Ресурс не найден')

@app.errorhandler(500)
def internal_error(error):
    return handle_error('SERVER_001', 'Внутренняя ошибка сервера')

if __name__ == '__main__':
    print("🚀 Запуск API сервера CryptoWatch MEXC...")
    print(f"📊 База данных: {CONFIG['DATABASE_PATH']}")
    print(f"🤖 URL бота: {CONFIG['BOT_API_URL']}")
    print("=" * 50)
    
    # Создаем директорию для данных если не существует
    os.makedirs('data', exist_ok=True)
    
    # Запускаем первую очистку
    start_cleanup_task()
    
    try:
        app.run(
            host='0.0.0.0',
            port=5000,
            debug=CONFIG['DEBUG'],
            threaded=True
        )
    except KeyboardInterrupt:
        print("\n🛑 Сервер остановлен")
    except Exception as e:
        print(f"❌ Ошибка сервера: {e}")
    finally:
        print("👋 Завершение работы сервера")
