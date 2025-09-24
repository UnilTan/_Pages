// Auth Integration for Main Page

class MainPageAuth {
    constructor() {
        this.isAuthenticated = false;
        this.userInfo = null;
        this.init();
    }

    async init() {
        await this.checkAuthStatus();
        this.renderAuthSection();
        this.bindEvents();
    }

    async checkAuthStatus() {
        try {
            const response = await fetch('/api/auth/session', {
                credentials: 'include'
            });
            const data = await response.json();
            
            if (data.authenticated) {
                this.isAuthenticated = true;
                this.userInfo = data.user;
            }
        } catch (error) {
            console.log('No active session');
            this.isAuthenticated = false;
        }
    }

    renderAuthSection() {
        const navAuthSection = document.getElementById('navAuthSection');
        const mobileAuthSection = document.getElementById('mobileAuthSection');

        if (this.isAuthenticated) {
            // User is logged in - show user menu
            const userMenu = this.createUserMenu();
            if (navAuthSection) {
                navAuthSection.innerHTML = userMenu.desktop;
            }
            if (mobileAuthSection) {
                mobileAuthSection.innerHTML = userMenu.mobile;
            }
        } else {
            // User not logged in - show auth buttons
            const authButtons = this.createAuthButtons();
            if (navAuthSection) {
                navAuthSection.innerHTML = authButtons.desktop;
            }
            if (mobileAuthSection) {
                mobileAuthSection.innerHTML = authButtons.mobile;
            }
        }
    }

    createAuthButtons() {
        return {
            desktop: `
                <button class="nav-link btn-primary auth-modal-btn" onclick="mainPageAuth.openAuthModal()">
                    <i class="fas fa-user"></i>
                    <span>Авторизация</span>
                </button>
            `,
            mobile: `
                <a href="#" class="nav-link primary-link auth-mobile-btn" onclick="mainPageAuth.openAuthModal()">
                    <i class="fas fa-user"></i>
                    <span>Авторизация</span>
                </a>
            `
        };
    }

    createUserMenu() {
        const username = this.userInfo?.username || 'Пользователь';
        const email = this.userInfo?.email || '';
        
        return {
            desktop: `
                <div class="nav-user-menu">
                    <div class="nav-user-info">
                        <div class="nav-user-avatar">
                            <i class="fas fa-user"></i>
                        </div>
                        <div class="nav-user-details">
                            <span class="nav-user-name">${username}</span>
                            <span class="nav-user-email">${email}</span>
                        </div>
                        <i class="fas fa-chevron-down nav-dropdown-icon"></i>
                    </div>
                    <div class="nav-user-dropdown" id="navUserDropdown">
                        <a href="dashboard.html" class="nav-dropdown-item">
                            <i class="fas fa-tachometer-alt"></i>
                            <span>Личный кабинет</span>
                        </a>
                        <a href="dashboard.html#settings" class="nav-dropdown-item">
                            <i class="fas fa-cog"></i>
                            <span>Настройки</span>
                        </a>
                        <div class="nav-dropdown-divider"></div>
                        <a href="#" class="nav-dropdown-item" onclick="mainPageAuth.logout()">
                            <i class="fas fa-sign-out-alt"></i>
                            <span>Выйти</span>
                        </a>
                    </div>
                </div>
            `,
            mobile: `
                <div class="mobile-user-section">
                    <div class="mobile-user-info">
                        <div class="mobile-user-avatar">
                            <i class="fas fa-user"></i>
                        </div>
                        <div class="mobile-user-details">
                            <span class="mobile-user-name">${username}</span>
                            <span class="mobile-user-email">${email}</span>
                        </div>
                    </div>
                    <a href="dashboard.html" class="nav-link mobile-dashboard-link">
                        <i class="fas fa-tachometer-alt"></i>
                        <span>Личный кабинет</span>
                    </a>
                    <a href="#" class="nav-link mobile-logout-link" onclick="mainPageAuth.logout()">
                        <i class="fas fa-sign-out-alt"></i>
                        <span>Выйти</span>
                    </a>
                </div>
            `
        };
    }

    bindEvents() {
        // Toggle user dropdown on desktop
        document.addEventListener('click', (e) => {
            const userMenu = e.target.closest('.nav-user-menu');
            const dropdown = document.getElementById('navUserDropdown');
            
            if (userMenu && dropdown) {
                e.preventDefault();
                dropdown.classList.toggle('show');
            } else if (dropdown && !e.target.closest('.nav-user-dropdown')) {
                dropdown.classList.remove('show');
            }
        });

        // Handle modal close on click outside
        document.addEventListener('click', (e) => {
            const modal = document.getElementById('authModal');
            if (modal && e.target === modal) {
                this.closeAuthModal();
            }
        });

        // Handle escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeAuthModal();
            }
        });
    }

    openAuthModal(tab = 'login') {
        this.createAuthModal();
        const modal = document.getElementById('authModal');
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
        this.switchTab(tab);
    }

    closeAuthModal() {
        const modal = document.getElementById('authModal');
        if (modal) {
            modal.classList.remove('show');
            document.body.style.overflow = '';
        }
    }

    switchTab(tab) {
        // Update tab buttons
        document.querySelectorAll('.auth-tab').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tab}"]`)?.classList.add('active');

        // Update tab content
        document.querySelectorAll('.auth-tab-content').forEach(content => {
            content.classList.remove('active');
        });
        
        if (tab === 'verification') {
            document.getElementById('verificationTabContent')?.classList.add('active');
        } else if (tab === 'register') {
            document.getElementById('registerTabContent')?.classList.add('active');
        } else {
            document.getElementById('loginTabContent')?.classList.add('active');
        }
    }

    async logout() {
        try {
            const response = await fetch('/api/auth/logout', {
                method: 'POST',
                credentials: 'include'
            });
            
            // Clear session cookie
            document.cookie = 'session_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
            
            // Reset auth state
            this.isAuthenticated = false;
            this.userInfo = null;
            
            // Re-render auth section
            this.renderAuthSection();
            
            // Show notification
            this.showNotification('Вы успешно вышли из системы', 'success');
        } catch (error) {
            console.error('Logout error:', error);
            this.showNotification('Ошибка при выходе', 'error');
        }
    }

    showNotification(message, type = 'info') {
        // Create notification element if it doesn't exist
        let notification = document.getElementById('mainPageNotification');
        if (!notification) {
            notification = document.createElement('div');
            notification.id = 'mainPageNotification';
            notification.className = 'main-page-notification';
            document.body.appendChild(notification);
        }

        notification.textContent = message;
        notification.className = `main-page-notification ${type} show`;

        setTimeout(() => {
            notification.classList.remove('show');
        }, 4000);
    }

    // Public method to refresh auth status
    async refresh() {
        await this.checkAuthStatus();
        this.renderAuthSection();
    }
}

// Global instance
let mainPageAuth;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    mainPageAuth = new MainPageAuth();
});

// Also refresh auth status when page becomes visible (user might have logged in from another tab)
document.addEventListener('visibilitychange', () => {
    if (!document.hidden && mainPageAuth) {
        mainPageAuth.refresh();
    }
});

// Add modal creation method to MainPageAuth class
MainPageAuth.prototype.createAuthModal = function() {
    // Create modal if it doesn't exist
    if (document.getElementById('authModal')) return;

    const modal = document.createElement('div');
    modal.id = 'authModal';
    modal.className = 'auth-modal';
    modal.innerHTML = `
        <div class="auth-modal-content">
            <button class="auth-modal-close" onclick="mainPageAuth.closeAuthModal()">
                <i class="fas fa-times"></i>
            </button>
            
            <div class="auth-modal-header">
                <div class="auth-modal-logo">
                    <i class="fas fa-chart-line"></i>
                </div>
                <h2>CryptoWatch MEXC</h2>
                <p>Войдите в свой аккаунт или создайте новый</p>
            </div>

            <div class="auth-modal-tabs">
                <button class="auth-tab active" data-tab="login" onclick="mainPageAuth.switchTab('login')">
                    <i class="fas fa-sign-in-alt"></i>
                    <span>Войти</span>
                </button>
                <!-- ВРЕМЕННО ОТКЛЮЧЕНО
                <button class="auth-tab" data-tab="register" onclick="mainPageAuth.switchTab('register')">
                    <i class="fas fa-user-plus"></i>
                    <span>Регистрация</span>
                </button>
                -->

            <div class="auth-modal-body">
                <!-- Login Form -->
                <div class="auth-tab-content active" id="loginTabContent">
                    <form class="auth-modal-form" id="modalLoginForm">
                        <div class="form-group">
                            <label>Email адрес</label>
                            <div class="input-wrapper">
                                <i class="fas fa-envelope"></i>
                                <input type="email" name="email" placeholder="ваш@email.com" required autocomplete="email">
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label>Пароль</label>
                            <div class="input-wrapper">
                                <i class="fas fa-lock"></i>
                                <input type="password" name="password" placeholder="Введите пароль" required autocomplete="current-password">
                                <button type="button" class="password-toggle" onclick="mainPageAuth.togglePassword(this)">
                                    <i class="fas fa-eye"></i>
                                </button>
                            </div>
                        </div>
                        
                        <div class="form-options">
                            <label class="checkbox-wrapper">
                                <input type="checkbox" name="remember">
                                <span class="checkmark"></span>
                                <span class="checkbox-label">Запомнить меня</span>
                            </label>
                        </div>
                        
                        <button type="submit" class="auth-modal-btn primary">
                            <i class="fas fa-sign-in-alt"></i>
                            <span>Войти</span>
                        </button>
                        
                        <div class="divider">
                            <span>или</span>
                        </div>
                        
                        <button type="button" class="auth-modal-btn telegram" onclick="mainPageAuth.authWithTelegram()">
                            <i class="fab fa-telegram"></i>
                            <span>Войти через Telegram</span>
                        </button>
                    </form>
                </div>

                <!-- ВРЕМЕННО ОТКЛЮЧЕНО: Register Form
                <div class="auth-tab-content" id="registerTabContent">
                    <form class="auth-modal-form" id="modalRegisterForm">
                        <div class="form-group">
                            <label>Email адрес</label>
                            <div class="input-wrapper">
                                <i class="fas fa-envelope"></i>
                                <input type="email" name="email" placeholder="ваш@email.com" required autocomplete="email">
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label>Пароль</label>
                            <div class="input-wrapper">
                                <i class="fas fa-lock"></i>
                                <input type="password" name="password" placeholder="Минимум 6 символов" required autocomplete="new-password" id="modalPasswordInput">
                                <button type="button" class="password-toggle" onclick="mainPageAuth.togglePassword(this)">
                                    <i class="fas fa-eye"></i>
                                </button>
                            </div>
                            <div class="password-strength-line"></div>
                            <div class="password-tooltip" id="modalPasswordTooltip" style="display: none;">
                                <div class="tooltip-content">
                                    <div class="tooltip-title">Требования к паролю:</div>
                                    <div class="tooltip-requirements">
                                        <div class="tooltip-req" data-req="length">
                                            <i class="fas fa-times"></i>
                                            <span>Минимум 6 символов</span>
                                        </div>
                                        <div class="tooltip-req" data-req="letter">
                                            <i class="fas fa-times"></i>
                                            <span>Буквы (a-z)</span>
                                        </div>
                                        <div class="tooltip-req" data-req="number">
                                            <i class="fas fa-times"></i>
                                            <span>Цифры (0-9)</span>
                                        </div>
                                    </div>
                                </div>
                                <div class="tooltip-arrow"></div>
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label>Подтверждение пароля</label>
                            <div class="input-wrapper">
                                <i class="fas fa-lock"></i>
                                <input type="password" name="passwordConfirm" placeholder="Повторите пароль" required autocomplete="new-password">
                            </div>
                        </div>
                        
                        <div class="form-group checkbox-group">
                            <label class="checkbox-wrapper">
                                <input type="checkbox" name="agree" required>
                                <span class="checkmark"></span>
                                <span class="checkbox-label">
                                    Я согласен с условиями использования
                                </span>
                            </label>
                        </div>
                        
                        <button type="submit" class="auth-modal-btn primary">
                            <i class="fas fa-user-plus"></i>
                            <span>Создать аккаунт</span>
                        </button>
                    </form>
                </div>
                -->

                <!-- Verification Form -->
                <div class="auth-tab-content" id="verificationTabContent">
                    <div class="verification-info">
                        <div class="verification-icon">
                            <i class="fas fa-envelope-open"></i>
                        </div>
                        <h3>Подтверждение email</h3>
                        <p>Мы отправили код подтверждения на ваш email</p>
                    </div>
                    
                    <form class="auth-modal-form" id="modalVerificationForm">
                        <div class="form-group">
                            <label>Код подтверждения</label>
                            <div class="verification-code-input">
                                <input type="text" name="code" placeholder="123456" required maxlength="6">
                            </div>
                        </div>
                        
                        <button type="submit" class="auth-modal-btn primary">
                            <i class="fas fa-check"></i>
                            <span>Подтвердить</span>
                        </button>
                        
                        <div class="auth-modal-footer">
                            <button type="button" class="back-to-login-btn" onclick="mainPageAuth.switchTab('login')">
                                <i class="fas fa-arrow-left"></i>
                                Вернуться к входу
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    this.bindModalEvents();
};

// Add utility methods
MainPageAuth.prototype.togglePassword = function(button) {
    const input = button.previousElementSibling;
    const icon = button.querySelector('i');
    
    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        input.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
};

MainPageAuth.prototype.authWithTelegram = function() {
    this.showNotification('Функция Telegram авторизации в разработке', 'info');
};

MainPageAuth.prototype.bindModalEvents = function() {
    // Password strength check and tooltip
    const passwordInput = document.getElementById('modalPasswordInput');
    if (passwordInput) {
        passwordInput.addEventListener('input', (e) => {
            this.updatePasswordStrength(e.target.value);
        });
        
        passwordInput.addEventListener('focus', () => {
            this.showPasswordTooltip();
        });
        
        passwordInput.addEventListener('blur', () => {
            setTimeout(() => this.hidePasswordTooltip(), 150);
        });
    }

    // Login form
    document.getElementById('modalLoginForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const data = {
            email: formData.get('email'),
            password: formData.get('password')
        };

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (result.success) {
                if (result.session_token) {
                    document.cookie = `session_token=${result.session_token}; path=/; max-age=2592000`;
                }
                this.showNotification('Успешный вход!', 'success');
                this.closeAuthModal();
                await this.refresh();
            } else if (result.email_verification_required) {
                this.switchTab('verification');
                this.showNotification('Подтвердите email для входа', 'warning');
            } else {
                this.showNotification(result.error || 'Ошибка входа', 'error');
            }
        } catch (error) {
            this.showNotification('Ошибка соединения', 'error');
        }
    });

    // ВРЕМЕННО ОТКЛЮЧЕНО: Register form
    /*
    document.getElementById('modalRegisterForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const data = {
            email: formData.get('email'),
            password: formData.get('password'),
            username: formData.get('username') || ''
        };

        const passwordConfirm = formData.get('passwordConfirm');
        const agree = formData.get('agree');

        if (data.password !== passwordConfirm) {
            this.showNotification('Пароли не совпадают', 'error');
            return;
        }

        if (!agree) {
            this.showNotification('Необходимо согласиться с условиями', 'error');
            return;
        }

        // Check password strength
        const passwordStrength = this.calculatePasswordStrength(data.password);
        if (passwordStrength.score < 2) {
            this.showPasswordError('Пароль слишком слабый. Проверьте требования.');
            return;
        }

        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (result.success) {
                this.switchTab('verification');
                this.showNotification('Регистрация успешна! Проверьте email', 'success');
            } else {
                this.showNotification(result.error || 'Ошибка регистрации', 'error');
            }
        } catch (error) {
            this.showNotification('Ошибка соединения', 'error');
        }
    });
    */

    // Verification form
    document.getElementById('modalVerificationForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const code = formData.get('code');
        const email = document.querySelector('#modalLoginForm input[name="email"]')?.value || 
                     document.querySelector('#modalRegisterForm input[name="email"]')?.value;

        if (!code || code.length !== 6) {
            this.showNotification('Введите 6-значный код', 'error');
            return;
        }

        try {
            const response = await fetch('/api/auth/verify-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, code })
            });

            const result = await response.json();

            if (result.success) {
                this.showNotification('Email подтвержден!', 'success');
                this.closeAuthModal();
                this.switchTab('login');
            } else {
                this.showNotification(result.error || 'Неверный код', 'error');
            }
        } catch (error) {
            this.showNotification('Ошибка соединения', 'error');
        }
    });
};

// Password strength functions (без спец. символов)
MainPageAuth.prototype.calculatePasswordStrength = function(password) {
    let score = 0;
    
    const requirements = {
        length: password.length >= 6,
        letter: /[a-zA-Z]/.test(password),
        number: /[0-9]/.test(password)
    };

    // Length scoring
    if (password.length >= 6) score += 1;
    if (password.length >= 8) score += 1;

    // Character type scoring
    if (requirements.letter) score += 1;
    if (requirements.number) score += 1;

    // Bonus for mixed case
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1;

    // Penalties
    if (password.length < 6) score = 0;
    if (/(.)\1{2,}/.test(password)) score -= 1; // Repeated characters
    if (/123|abc|qwe|password/i.test(password)) score -= 2; // Common patterns

    // Normalize score to 0-4
    score = Math.max(0, Math.min(4, score));

    const levels = ['Очень слабый', 'Слабый', 'Средний', 'Сильный', 'Очень сильный'];
    
    return {
        score: score,
        level: levels[score],
        requirements: requirements
    };
};

MainPageAuth.prototype.updatePasswordStrength = function(password) {
    const strengthLine = document.querySelector('.password-strength-line');
    const tooltip = document.getElementById('modalPasswordTooltip');
    
    if (!strengthLine || !tooltip) return;

    const strength = this.calculatePasswordStrength(password);
    
    // Update strength line
    if (!password) {
        strengthLine.style.width = '0%';
        strengthLine.className = 'password-strength-line';
    } else {
        const widthPercent = (strength.score / 4) * 100;
        strengthLine.style.width = widthPercent + '%';
        
        // Update colors based on strength
        strengthLine.className = 'password-strength-line';
        if (strength.score === 0) {
            strengthLine.classList.add('very-weak');
        } else if (strength.score === 1) {
            strengthLine.classList.add('weak');
        } else if (strength.score === 2) {
            strengthLine.classList.add('medium');
        } else if (strength.score === 3) {
            strengthLine.classList.add('strong');
        } else {
            strengthLine.classList.add('very-strong');
        }
    }

    // Update tooltip requirements
    const requirements = tooltip.querySelectorAll('.tooltip-req');
    requirements.forEach(req => {
        const reqType = req.getAttribute('data-req');
        const icon = req.querySelector('i');
        
        if (strength.requirements[reqType]) {
            req.classList.add('met');
            icon.className = 'fas fa-check';
        } else {
            req.classList.remove('met');
            icon.className = 'fas fa-times';
        }
    });
};

// Tooltip methods
MainPageAuth.prototype.showPasswordTooltip = function() {
    const tooltip = document.getElementById('modalPasswordTooltip');
    if (tooltip) {
        tooltip.style.display = 'block';
        setTimeout(() => tooltip.classList.add('show'), 10);
    }
};

MainPageAuth.prototype.hidePasswordTooltip = function() {
    const tooltip = document.getElementById('modalPasswordTooltip');
    if (tooltip) {
        tooltip.classList.remove('show');
        setTimeout(() => tooltip.style.display = 'none', 300);
    }
};

MainPageAuth.prototype.showPasswordError = function(message) {
    const tooltip = document.getElementById('modalPasswordTooltip');
    if (tooltip) {
        const title = tooltip.querySelector('.tooltip-title');
        if (title) {
            title.textContent = message;
            title.style.color = '#ef4444';
        }
        this.showPasswordTooltip();
        
        // Reset after 3 seconds
        setTimeout(() => {
            if (title) {
                title.textContent = 'Требования к паролю:';
                title.style.color = '';
            }
        }, 3000);
    }
};
