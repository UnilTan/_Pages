/**
 * 🔐 Система авторизации CryptoWatch MEXC
 * Обеспечивает безопасную авторизацию и регистрацию пользователей
 */

class AuthManager {
    constructor() {
        this.apiUrl = '/api/auth'; // Базовый URL для API авторизации
        this.currentUser = null;
        this.isLoading = false;
        
        this.init();
    }

    init() {
        console.log('🔐 Инициализация системы авторизации...');
        
        // Инициализируем элементы интерфейса
        this.initElements();
        
        // Добавляем обработчики событий
        this.attachEventListeners();
        
        // Проверяем существующую сессию
        this.checkExistingSession();
        
        // Инициализируем валидацию форм
        this.initFormValidation();
        
        console.log('✅ Система авторизации инициализирована');
    }

    initElements() {
        // Вкладки
        this.loginTab = document.querySelector('[data-tab="login"]');
        this.registerTab = document.querySelector('[data-tab="register"]');
        
        // Контейнеры форм
        this.loginForm = document.getElementById('login-form');
        this.registerForm = document.getElementById('register-form');
        
        // Формы
        this.loginFormElement = document.getElementById('loginForm');
        this.registerFormElement = document.getElementById('registerForm');
        
        // Элементы загрузки
        this.loadingOverlay = document.getElementById('loadingOverlay');
        
        // Кнопки
        this.telegramAuthBtn = document.getElementById('telegramAuth');
        this.passwordToggles = document.querySelectorAll('.password-toggle');
    }

    attachEventListeners() {
        // Переключение вкладок
        this.loginTab?.addEventListener('click', () => this.switchTab('login'));
        this.registerTab?.addEventListener('click', () => this.switchTab('register'));
        
        // Обработка форм
        this.loginFormElement?.addEventListener('submit', (e) => this.handleLogin(e));
        this.registerFormElement?.addEventListener('submit', (e) => this.handleRegister(e));
        
        // Telegram авторизация
        this.telegramAuthBtn?.addEventListener('click', () => this.handleTelegramAuth());
        
        // Переключатели паролей
        this.passwordToggles.forEach(toggle => {
            toggle.addEventListener('click', () => this.togglePassword(toggle));
        });
        
        // Проверка силы пароля в реальном времени
        const registerPassword = document.getElementById('registerPassword');
        registerPassword?.addEventListener('input', (e) => this.checkPasswordStrength(e.target.value));
        
        // Проверка совпадения паролей
        const confirmPassword = document.getElementById('confirmPassword');
        confirmPassword?.addEventListener('input', (e) => this.validatePasswordConfirmation());
    }

    switchTab(tab) {
        console.log(`🔄 Переключение на вкладку: ${tab}`);
        
        // Обновляем активные вкладки
        document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.auth-form-container').forEach(c => c.classList.remove('active'));
        
        if (tab === 'login') {
            this.loginTab.classList.add('active');
            this.loginForm.classList.add('active');
        } else {
            this.registerTab.classList.add('active');
            this.registerForm.classList.add('active');
        }
        
        // Очищаем ошибки
        this.clearFormErrors();
    }

    async handleLogin(e) {
        e.preventDefault();
        
        if (this.isLoading) return;
        
        console.log('🔑 Обработка входа...');
        
        const formData = new FormData(e.target);
        const loginData = {
            email: formData.get('email'),
            password: formData.get('password'),
            remember: formData.get('rememberMe') === 'on'
        };
        
        // Валидация
        if (!this.validateLoginForm(loginData)) {
            return;
        }
        
        this.setLoading(true);
        
        try {
            const response = await this.makeAuthRequest('/login', loginData);
            
            if (response.success) {
                console.log('✅ Успешный вход');
                this.handleAuthSuccess(response.data);
            } else {
                this.handleAuthError(response.error);
            }
        } catch (error) {
            console.error('❌ Ошибка входа:', error);
            this.handleAuthError('Ошибка соединения с сервером');
        } finally {
            this.setLoading(false);
        }
    }

    async handleRegister(e) {
        e.preventDefault();
        
        if (this.isLoading) return;
        
        console.log('📝 Обработка регистрации...');
        
        const formData = new FormData(e.target);
        const registerData = {
            name: formData.get('name'),
            email: formData.get('email'),
            password: formData.get('password'),
            confirmPassword: formData.get('confirmPassword'),
            telegram: formData.get('telegram') || null,
            agreeTerms: formData.get('agreeTerms') === 'on'
        };
        
        // Валидация
        if (!this.validateRegisterForm(registerData)) {
            return;
        }
        
        this.setLoading(true);
        
        try {
            const response = await this.makeAuthRequest('/register', registerData);
            
            if (response.success) {
                console.log('✅ Успешная регистрация');
                this.handleAuthSuccess(response.data);
            } else {
                this.handleAuthError(response.error);
            }
        } catch (error) {
            console.error('❌ Ошибка регистрации:', error);
            this.handleAuthError('Ошибка соединения с сервером');
        } finally {
            this.setLoading(false);
        }
    }

    async makeAuthRequest(endpoint, data) {
        // Симуляция запроса к серверу (заменить на реальный API)
        console.log(`📡 Отправка запроса: ${endpoint}`, data);
        
        // Имитация задержки сети
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Симуляция ответа сервера
        if (endpoint === '/login') {
            return this.simulateLogin(data);
        } else if (endpoint === '/register') {
            return this.simulateRegister(data);
        }
        
        throw new Error('Unknown endpoint');
    }

    simulateLogin(data) {
        // Симуляция проверки учетных данных
        const users = this.getStoredUsers();
        const user = users.find(u => u.email === data.email);
        
        if (!user) {
            return {
                success: false,
                error: 'AUTH_001', // Пользователь не найден
                message: 'Пользователь с таким email не найден'
            };
        }
        
        // Проверяем пароль (в реальности должно быть хеширование)
        if (user.password !== this.hashPassword(data.password)) {
            return {
                success: false,
                error: 'AUTH_002', // Неверный пароль
                message: 'Неверный пароль'
            };
        }
        
        return {
            success: true,
            data: {
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    telegram: user.telegram,
                    createdAt: user.createdAt
                },
                token: this.generateToken(user.id),
                expiresIn: data.remember ? 30 * 24 * 60 * 60 : 24 * 60 * 60 // 30 дней или 1 день
            }
        };
    }

    simulateRegister(data) {
        const users = this.getStoredUsers();
        
        // Проверяем, не существует ли уже пользователь
        if (users.find(u => u.email === data.email)) {
            return {
                success: false,
                error: 'AUTH_003', // Email уже используется
                message: 'Пользователь с таким email уже существует'
            };
        }
        
        // Создаем нового пользователя
        const newUser = {
            id: Date.now().toString(),
            name: data.name,
            email: data.email,
            password: this.hashPassword(data.password),
            telegram: data.telegram,
            createdAt: new Date().toISOString(),
            isActive: true
        };
        
        users.push(newUser);
        this.saveUsers(users);
        
        return {
            success: true,
            data: {
                user: {
                    id: newUser.id,
                    name: newUser.name,
                    email: newUser.email,
                    telegram: newUser.telegram,
                    createdAt: newUser.createdAt
                },
                token: this.generateToken(newUser.id),
                expiresIn: 24 * 60 * 60 // 1 день
            }
        };
    }

    validateLoginForm(data) {
        let isValid = true;
        
        // Email
        if (!data.email || !this.isValidEmail(data.email)) {
            this.showFieldError('loginEmailError', 'Введите корректный email');
            isValid = false;
        } else {
            this.hideFieldError('loginEmailError');
        }
        
        // Пароль
        if (!data.password || data.password.length < 6) {
            this.showFieldError('loginPasswordError', 'Пароль должен содержать минимум 6 символов');
            isValid = false;
        } else {
            this.hideFieldError('loginPasswordError');
        }
        
        return isValid;
    }

    validateRegisterForm(data) {
        let isValid = true;
        
        // Имя
        if (!data.name || data.name.trim().length < 2) {
            this.showFieldError('registerNameError', 'Имя должно содержать минимум 2 символа');
            isValid = false;
        } else {
            this.hideFieldError('registerNameError');
        }
        
        // Email
        if (!data.email || !this.isValidEmail(data.email)) {
            this.showFieldError('registerEmailError', 'Введите корректный email');
            isValid = false;
        } else {
            this.hideFieldError('registerEmailError');
        }
        
        // Пароль
        const passwordStrength = this.getPasswordStrength(data.password);
        if (passwordStrength === 'weak' || !data.password) {
            this.showFieldError('registerPasswordError', 'Пароль слишком слабый. Используйте буквы, цифры и символы');
            isValid = false;
        } else {
            this.hideFieldError('registerPasswordError');
        }
        
        // Подтверждение пароля
        if (data.password !== data.confirmPassword) {
            this.showFieldError('confirmPasswordError', 'Пароли не совпадают');
            isValid = false;
        } else {
            this.hideFieldError('confirmPasswordError');
        }
        
        // Согласие с условиями
        if (!data.agreeTerms) {
            this.showNotification('Необходимо согласиться с условиями использования', 'error');
            isValid = false;
        }
        
        return isValid;
    }

    checkPasswordStrength(password) {
        const strength = this.getPasswordStrength(password);
        const strengthElement = document.getElementById('passwordStrength');
        
        if (strengthElement) {
            strengthElement.className = `password-strength ${strength}`;
        }
        
        return strength;
    }

    getPasswordStrength(password) {
        if (!password) return 'weak';
        
        let score = 0;
        
        // Длина
        if (password.length >= 8) score++;
        if (password.length >= 12) score++;
        
        // Содержание
        if (/[a-z]/.test(password)) score++;
        if (/[A-Z]/.test(password)) score++;
        if (/[0-9]/.test(password)) score++;
        if (/[^A-Za-z0-9]/.test(password)) score++;
        
        if (score < 3) return 'weak';
        if (score < 4) return 'fair';
        if (score < 6) return 'good';
        return 'strong';
    }

    validatePasswordConfirmation() {
        const password = document.getElementById('registerPassword')?.value;
        const confirmPassword = document.getElementById('confirmPassword')?.value;
        
        if (confirmPassword && password !== confirmPassword) {
            this.showFieldError('confirmPasswordError', 'Пароли не совпадают');
        } else {
            this.hideFieldError('confirmPasswordError');
        }
    }

    togglePassword(toggle) {
        const targetId = toggle.dataset.target;
        const input = document.getElementById(targetId);
        const icon = toggle.querySelector('i');
        
        if (input.type === 'password') {
            input.type = 'text';
            icon.className = 'fas fa-eye-slash';
        } else {
            input.type = 'password';
            icon.className = 'fas fa-eye';
        }
    }

    handleAuthSuccess(data) {
        console.log('🎉 Авторизация успешна:', data);
        
        // Сохраняем данные пользователя
        this.currentUser = data.user;
        this.saveAuthData(data);
        
        // Показываем уведомление
        this.showNotification('Добро пожаловать!', 'success');
        
        // Перенаправляем в личный кабинет
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1500);
    }

    handleAuthError(error) {
        console.error('❌ Ошибка авторизации:', error);
        
        const errorMessages = {
            'AUTH_001': 'Пользователь не найден',
            'AUTH_002': 'Неверный пароль',
            'AUTH_003': 'Email уже используется',
            'AUTH_004': 'Недействительный токен',
            'TIMEOUT': 'Превышено время ожидания'
        };
        
        const message = errorMessages[error] || error || 'Произошла ошибка';
        this.showNotification(message, 'error');
    }

    async handleTelegramAuth() {
        console.log('📱 Авторизация через Telegram...');
        
        this.showNotification('Функция в разработке', 'info');
        
        // TODO: Интеграция с Telegram Widget
        // const telegramData = await this.getTelegramAuthData();
        // if (telegramData) {
        //     const response = await this.makeAuthRequest('/telegram-auth', telegramData);
        //     if (response.success) {
        //         this.handleAuthSuccess(response.data);
        //     } else {
        //         this.handleAuthError(response.error);
        //     }
        // }
    }

    showFieldError(fieldId, message) {
        const errorElement = document.getElementById(fieldId);
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.classList.add('show');
        }
        
        // Добавляем класс ошибки к полю
        const fieldName = fieldId.replace('Error', '');
        const field = document.getElementById(fieldName);
        if (field) {
            field.classList.add('error');
            field.classList.remove('success');
        }
    }

    hideFieldError(fieldId) {
        const errorElement = document.getElementById(fieldId);
        if (errorElement) {
            errorElement.classList.remove('show');
        }
        
        // Убираем класс ошибки с поля
        const fieldName = fieldId.replace('Error', '');
        const field = document.getElementById(fieldName);
        if (field) {
            field.classList.remove('error');
            field.classList.add('success');
        }
    }

    clearFormErrors() {
        document.querySelectorAll('.form-error').forEach(error => {
            error.classList.remove('show');
        });
        
        document.querySelectorAll('input').forEach(input => {
            input.classList.remove('error', 'success');
        });
    }

    setLoading(loading) {
        this.isLoading = loading;
        
        if (loading) {
            this.loadingOverlay?.classList.add('show');
        } else {
            this.loadingOverlay?.classList.remove('show');
        }
        
        // Блокируем/разблокируем формы
        const forms = document.querySelectorAll('.auth-form');
        forms.forEach(form => {
            const inputs = form.querySelectorAll('input, button');
            inputs.forEach(input => {
                input.disabled = loading;
            });
        });
    }

    checkExistingSession() {
        const authData = this.getAuthData();
        if (authData && authData.token && !this.isTokenExpired(authData.expiresAt)) {
            console.log('🔄 Найдена активная сессия, перенаправление...');
            window.location.href = 'dashboard.html';
        }
    }

    initFormValidation() {
        // Добавляем валидацию в реальном времени
        const inputs = document.querySelectorAll('.auth-form input');
        inputs.forEach(input => {
            input.addEventListener('blur', () => this.validateField(input));
            input.addEventListener('input', () => this.clearFieldValidation(input));
        });
    }

    validateField(input) {
        const value = input.value.trim();
        const type = input.type;
        const id = input.id;
        
        if (type === 'email' && value) {
            if (!this.isValidEmail(value)) {
                input.classList.add('error');
            } else {
                input.classList.remove('error');
                input.classList.add('success');
            }
        }
        
        if (type === 'password' && value && id.includes('register')) {
            const strength = this.getPasswordStrength(value);
            if (strength === 'weak') {
                input.classList.add('error');
            } else {
                input.classList.remove('error');
                input.classList.add('success');
            }
        }
    }

    clearFieldValidation(input) {
        input.classList.remove('error', 'success');
    }

    // Утилиты
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    hashPassword(password) {
        // Простое хеширование для демонстрации (в продакшене использовать bcrypt)
        return btoa(password + 'salt123');
    }

    generateToken(userId) {
        return btoa(JSON.stringify({
            userId,
            timestamp: Date.now(),
            random: Math.random()
        }));
    }

    isTokenExpired(expiresAt) {
        return Date.now() > expiresAt;
    }

    // Работа с localStorage
    getStoredUsers() {
        try {
            return JSON.parse(localStorage.getItem('cryptowatch_users') || '[]');
        } catch {
            return [];
        }
    }

    saveUsers(users) {
        localStorage.setItem('cryptowatch_users', JSON.stringify(users));
    }

    saveAuthData(data) {
        const authData = {
            user: data.user,
            token: data.token,
            expiresAt: Date.now() + (data.expiresIn * 1000)
        };
        localStorage.setItem('cryptowatch_auth', JSON.stringify(authData));
    }

    getAuthData() {
        try {
            return JSON.parse(localStorage.getItem('cryptowatch_auth'));
        } catch {
            return null;
        }
    }

    clearAuthData() {
        localStorage.removeItem('cryptowatch_auth');
    }

    showNotification(message, type = 'info') {
        // Используем глобальную функцию уведомлений
        if (typeof showNotification === 'function') {
            showNotification(message, type);
        } else {
            console.log(`${type.toUpperCase()}: ${message}`);
        }
    }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Загрузка страницы авторизации...');
    
    // Создаем экземпляр менеджера авторизации
    window.authManager = new AuthManager();
    
    console.log('✅ Страница авторизации загружена');
});

// Экспорт для использования в других модулях
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AuthManager;
}
