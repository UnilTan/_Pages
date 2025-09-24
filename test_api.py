#!/usr/bin/env python3
"""
Тест API эндпоинтов
"""

import requests
import json

BASE_URL = "http://localhost:8000"

def test_api_endpoints():
    """Тестирование основных API эндпоинтов"""
    print("🧪 Тестирование API эндпоинтов...")
    print("=" * 50)
    
    # Тест 1: Проверка сессии (должно вернуть не авторизован)
    print("1. Тест GET /api/auth/session")
    try:
        response = requests.get(f"{BASE_URL}/api/auth/session")
        print(f"   Статус: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"   Ответ: {json.dumps(data, indent=2, ensure_ascii=False)}")
        else:
            print(f"   Ошибка: {response.text}")
    except Exception as e:
        print(f"   ❌ Ошибка запроса: {e}")
    
    print()
    
    # Тест 2: Попытка входа с правильными данными
    print("2. Тест POST /api/auth/login")
    try:
        login_data = {
            "email": "adm1n@cryptowatch.com",
            "password": "adm1n"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json=login_data,
            headers={"Content-Type": "application/json"}
        )
        
        print(f"   Статус: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"   Ответ: {json.dumps(data, indent=2, ensure_ascii=False)}")
            
            # Сохраняем cookies для следующих запросов
            cookies = response.cookies
            
            # Тест 3: Проверка сессии после входа
            print("\n3. Тест сессии после входа")
            session_response = requests.get(
                f"{BASE_URL}/api/auth/session",
                cookies=cookies
            )
            print(f"   Статус: {session_response.status_code}")
            if session_response.status_code == 200:
                session_data = session_response.json()
                print(f"   Ответ: {json.dumps(session_data, indent=2, ensure_ascii=False)}")
            
        else:
            print(f"   Ошибка: {response.text}")
            
    except Exception as e:
        print(f"   ❌ Ошибка запроса: {e}")
    
    print()
    
    # Тест 4: Проверка главной страницы
    print("4. Тест GET / (главная страница)")
    try:
        response = requests.get(f"{BASE_URL}/")
        print(f"   Статус: {response.status_code}")
        print(f"   Content-Type: {response.headers.get('content-type', 'не указан')}")
        if response.status_code == 200:
            content = response.text
            if 'CryptoWatch MEXC' in content:
                print("   ✅ Главная страница загружается корректно")
            else:
                print("   ⚠️ Главная страница загружается, но содержимое неожиданное")
        else:
            print(f"   ❌ Ошибка загрузки: {response.status_code}")
    except Exception as e:
        print(f"   ❌ Ошибка запроса: {e}")
    
    print()
    
    # Тест 5: Проверка auth-integration.js
    print("5. Тест GET /js/auth-integration.js")
    try:
        response = requests.get(f"{BASE_URL}/js/auth-integration.js")
        print(f"   Статус: {response.status_code}")
        if response.status_code == 200:
            content = response.text
            if 'MainPageAuth' in content:
                print("   ✅ Скрипт авторизации загружается корректно")
            else:
                print("   ⚠️ Скрипт загружается, но содержимое неожиданное")
        else:
            print(f"   ❌ Ошибка загрузки: {response.status_code}")
    except Exception as e:
        print(f"   ❌ Ошибка запроса: {e}")

if __name__ == "__main__":
    test_api_endpoints()
    print("\n🎯 Тестирование завершено!")
    print("\n💡 Если все тесты прошли успешно, попробуйте:")
    print("   1. Откройте http://localhost:8000")
    print("   2. Нажмите F12 (Developer Tools)")
    print("   3. Обновите страницу")
    print("   4. Проверьте Console на наличие ошибок")
    print("   5. Нажмите кнопку 'Авторизация'")
