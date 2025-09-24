// Static Authentication System for GitHub Pages
// Работает без сервера, использует localStorage

class StaticAuth {
    constructor() {
        this.isAuthenticated = false;
        this.userInfo = null;
        this.users = this.loadUsers();
        this.init();
    }

    init() {
        this.checkAuthStatus();
        this.renderAuthSection();
        this.bindEvents();
    }

    // Загрузка пользователей из localStorage
    loadUsers() {
        const defaultUsers = {
            'adm1n@cryptowatch.com': {
                id: 1,
                username: 'adm1n',
                email: 'adm1n@cryptowatch.com',
                password: 'adm1n', // В реальном приложении пароли должны быть хэшированы
                isVerified: true,
                createdAt: new Date().toISOString()
            }
        };

        const storedUsers = localStorage.getItem('cryptowatch_users');
        if (storedUsers) {
            try {
                return { ...defaultUsers, ...JSON.parse(storedUsers) };
            } catch (e) {
                console.error('Ошибка парсинга пользователей:', e);
                return defaultUsers;
            }
        }
        
        // Сохраняем дефолтных пользователей
        this.saveUsers(defaultUsers);
        return defaultUsers;
    }

    // Сохранение пользователей в localStorage
    saveUsers(users) {
        try {
            localStorage.setItem('cryptowatch_users', JSON.stringify(users));
        } catch (e) {
            console.error('Ошибка сохранения пользователей:', e);
        }
    }

    // Проверка статуса авторизации
    checkAuthStatus() {
        const sessionData = localStorage.getItem('cryptowatch_session');
        if (sessionData) {
            try {
                const session = JSON.parse(sessionData);
                const now = new Date().getTime();
                
                // Проверяем, не истекла ли сессия (24 часа)
                if (session.expiresAt > now) {
                    this.isAuthenticated = true;
                    this.userInfo = session.user;
                    console.log('✅ Пользователь авторизован:', this.userInfo.username);
                } else {
                    console.log('⏰ Сессия истекла');
                    this.logout();
                }
            } catch (e) {
                console.error('Ошибка парсинга сессии:', e);
                this.logout();
            }
        }
    }

    // Отображение секции авторизации
    renderAuthSection() {
        const navAuthSection = document.getElementById('navAuthSection');
        const mobileAuthSection = document.getElementById('mobileAuthSection');

        if (this.isAuthenticated) {
            // Показываем меню пользователя
            const userMenu = this.createUserMenu();
            if (navAuthSection) {
                navAuthSection.innerHTML = userMenu.desktop;
            }
            if (mobileAuthSection) {
                mobileAuthSection.innerHTML = userMenu.mobile;
            }
        } else {
            // Показываем кнопки авторизации
            const authButtons = this.createAuthButtons();
            if (navAuthSection) {
                navAuthSection.innerHTML = authButtons.desktop;
            }
            if (mobileAuthSection) {
                mobileAuthSection.innerHTML = authButtons.mobile;
            }
        }
    }

    // Создание кнопок авторизации
    createAuthButtons() {
        return {
            desktop: `
                <button class="nav-link btn-primary auth-modal-btn" onclick="staticAuth.openAuthModal()">
                    <i class="fas fa-user"></i>
                    <span>Авторизация</span>
                </button>
            `,
            mobile: `
                <a href="#" class="nav-link primary-link auth-mobile-btn" onclick="staticAuth.openAuthModal()">
                    <i class="fas fa-user"></i>
                    <span>Авторизация</span>
                </a>
            `
        };
    }

    // Создание меню пользователя
    createUserMenu() {
        return {
            desktop: `
                <div class="nav-user-menu">
                    <div class="nav-user-info">
                        <i class="fas fa-user-circle"></i>
                        <span>${this.userInfo.username}</span>
                        <i class="fas fa-chevron-down"></i>
                    </div>
                    <div class="nav-dropdown">
                        <a href="dashboard.html" class="dropdown-item">
                            <i class="fas fa-tachometer-alt"></i>
                            <span>Личный кабинет</span>
                        </a>
                        <a href="#" class="dropdown-item" onclick="staticAuth.logout()">
                            <i class="fas fa-sign-out-alt"></i>
                            <span>Выйти</span>
                        </a>
                    </div>
                </div>
            `,
            mobile: `
                <div class="mobile-user-menu">
                    <a href="dashboard.html" class="nav-link">
                        <i class="fas fa-tachometer-alt"></i>
                        <span>Личный кабинет</span>
                    </a>
                    <a href="#" class="nav-link" onclick="staticAuth.logout()">
                        <i class="fas fa-sign-out-alt"></i>
                        <span>Выйти</span>
                    </a>
                </div>
            `
        };
    }

    // Открытие модального окна авторизации
    openAuthModal() {
        // Создаем модальное окно если его нет
        if (!document.getElementById('authModal')) {
            this.createAuthModal();
        }
        
        const modal = document.getElementById('authModal');
        if (modal) {
            modal.style.display = 'flex';
            setTimeout(() => {
                modal.style.opacity = '1';
            }, 10);
            
            // Фокус на первое поле
            const emailInput = modal.querySelector('input[name="email"]');
            if (emailInput) {
                setTimeout(() => emailInput.focus(), 100);
            }
        }
    }

    // Закрытие модального окна
    closeAuthModal() {
        const modal = document.getElementById('authModal');
        if (modal) {
            modal.style.opacity = '0';
            setTimeout(() => {
                modal.style.display = 'none';
            }, 300);
        }
    }

    // Создание модального окна
    createAuthModal() {
        const modalHTML = `
            <div class="auth-modal" id="authModal" style="display: none;">
                <div class="auth-modal-content">
                    <div class="auth-modal-close" onclick="staticAuth.closeAuthModal()">
                        <i class="fas fa-times"></i>
                    </div>
                    
                    <div class="auth-modal-header">
                        <h2>Войдите в свой аккаунт</h2>
                        <p>Получите доступ к персональной аналитике</p>
                    </div>
                    
                    <div class="auth-modal-body">
                        <!-- Login Form -->
                        <div class="auth-tab-content active" id="loginTabContent">
                            <form class="auth-modal-form" id="staticLoginForm">
                                <div class="form-group">
                                    <label>Email</label>
                                    <div class="input-wrapper">
                                        <i class="fas fa-envelope"></i>
                                        <input type="email" name="email" placeholder="Введите ваш email" required autocomplete="email">
                                    </div>
                                </div>
                                
                                <div class="form-group">
                                    <label>Пароль</label>
                                    <div class="input-wrapper">
                                        <i class="fas fa-lock"></i>
                                        <input type="password" name="password" placeholder="Введите пароль" required autocomplete="current-password">
                                        <button type="button" class="password-toggle" onclick="staticAuth.togglePassword(this)">
                                            <i class="fas fa-eye"></i>
                                        </button>
                                    </div>
                                </div>
                                
                                <div class="auth-modal-error" id="staticAuthError" style="display: none;"></div>
                                
                                <button type="submit" class="auth-modal-btn primary">
                                    <i class="fas fa-sign-in-alt"></i>
                                    <span>Войти</span>
                                </button>
                                
                                <div class="auth-divider">
                                    <span>Тестовые данные</span>
                                </div>
                                
                                <div class="test-credentials">
                                    <p><strong>Email:</strong> adm1n@cryptowatch.com</p>
                                    <p><strong>Пароль:</strong> adm1n</p>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        this.bindModalEvents();
    }

    // Привязка событий модального окна
    bindModalEvents() {
        const loginForm = document.getElementById('staticLoginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleLogin(e);
            });
        }

        // Закрытие по клику вне модального окна
        const modal = document.getElementById('authModal');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeAuthModal();
                }
            });
        }

        // Закрытие по ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeAuthModal();
            }
        });
    }

    // Обработка входа
    async handleLogin(event) {
        const form = event.target;
        const formData = new FormData(form);
        const email = formData.get('email').trim();
        const password = formData.get('password');

        console.log('🔐 Попытка входа:', email);

        // Проверяем данные
        if (!email || !password) {
            this.showAuthError('Введите email и пароль');
            return;
        }

        // Ищем пользователя
        const user = this.users[email];
        if (!user) {
            this.showAuthError('Пользователь не найден');
            return;
        }

        // Проверяем пароль (в реальном приложении должна быть проверка хэша)
        if (user.password !== password) {
            this.showAuthError('Неверный пароль');
            return;
        }

        // Проверяем верификацию
        if (!user.isVerified) {
            this.showAuthError('Аккаунт не верифицирован');
            return;
        }

        // Успешный вход
        this.createSession(user);
        this.showNotification('Успешный вход в систему!', 'success');
        this.closeAuthModal();
        
        // Перенаправляем на дашборд если мы на главной странице
        if (window.location.pathname === '/' || window.location.pathname.endsWith('index.html')) {
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1000);
        }
    }

    // Создание сессии
    createSession(user) {
        const sessionData = {
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                isVerified: user.isVerified
            },
            expiresAt: new Date().getTime() + (24 * 60 * 60 * 1000), // 24 часа
            createdAt: new Date().toISOString()
        };

        localStorage.setItem('cryptowatch_session', JSON.stringify(sessionData));
        
        this.isAuthenticated = true;
        this.userInfo = sessionData.user;
        this.renderAuthSection();
        
        console.log('✅ Сессия создана для:', user.username);
    }

    // Выход из системы
    logout() {
        localStorage.removeItem('cryptowatch_session');
        this.isAuthenticated = false;
        this.userInfo = null;
        this.renderAuthSection();
        
        this.showNotification('Вы вышли из системы', 'info');
        
        // Если мы на странице дашборда, перенаправляем на главную
        if (window.location.pathname.includes('dashboard.html')) {
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);
        }
        
        console.log('👋 Пользователь вышел из системы');
    }

    // Показ ошибки авторизации
    showAuthError(message) {
        const errorElement = document.getElementById('staticAuthError');
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = 'block';
            
            // Скрываем ошибку через 5 секунд
            setTimeout(() => {
                errorElement.style.display = 'none';
            }, 5000);
        }
    }

    // Переключение видимости пароля
    togglePassword(button) {
        const input = button.parentNode.querySelector('input');
        const icon = button.querySelector('i');
        
        if (input.type === 'password') {
            input.type = 'text';
            icon.className = 'fas fa-eye-slash';
        } else {
            input.type = 'password';
            icon.className = 'fas fa-eye';
        }
    }

    // Показ уведомлений
    showNotification(message, type = 'info') {
        // Создаем элемент уведомления
        let notification = document.getElementById('staticNotification');
        if (!notification) {
            notification = document.createElement('div');
            notification.id = 'staticNotification';
            notification.className = 'main-page-notification';
            document.body.appendChild(notification);
        }

        notification.className = `main-page-notification ${type}`;
        notification.textContent = message;

        // Показываем уведомление
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);

        // Скрываем через 3 секунды
        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }

    // Привязка событий
    bindEvents() {
        // Обновляем состояние при изменении localStorage в другой вкладке
        window.addEventListener('storage', (e) => {
            if (e.key === 'cryptowatch_session') {
                this.checkAuthStatus();
                this.renderAuthSection();
            }
        });
    }

    // Обновление состояния
    refresh() {
        this.checkAuthStatus();
        this.renderAuthSection();
    }

    // Получение текущего пользователя
    getCurrentUser() {
        return this.userInfo;
    }

    // Проверка авторизации
    isLoggedIn() {
        return this.isAuthenticated;
    }
}

// Глобальный экземпляр
let staticAuth;

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    staticAuth = new StaticAuth();
    console.log('✅ Статическая система авторизации инициализирована');
});

// Обновление при возвращении на вкладку
document.addEventListener('visibilitychange', () => {
    if (!document.hidden && staticAuth) {
        staticAuth.refresh();
    }
});
