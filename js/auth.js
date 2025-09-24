// Auth Page JavaScript

class AuthManager {
    constructor() {
        this.currentForm = 'login';
        this.verificationEmail = '';
        this.resendTimer = null;
        this.init();
    }

    init() {
        this.bindEvents();
        this.checkExistingSession();
        this.initPasswordStrength();
    }

    bindEvents() {
        // Form submissions
        document.getElementById('loginFormElement')?.addEventListener('submit', (e) => this.handleLogin(e));
        document.getElementById('registerFormElement')?.addEventListener('submit', (e) => this.handleRegister(e));
        document.getElementById('verificationFormElement')?.addEventListener('submit', (e) => this.handleVerification(e));
        document.getElementById('forgotPasswordFormElement')?.addEventListener('submit', (e) => this.handleForgotPassword(e));

        // Real-time password confirmation
        const registerPassword = document.getElementById('registerPassword');
        const confirmPassword = document.getElementById('registerPasswordConfirm');
        
        if (confirmPassword) {
            confirmPassword.addEventListener('input', () => {
                this.validatePasswordMatch();
            });
        }

        // Verification code formatting
        const verificationCode = document.getElementById('verificationCode');
        if (verificationCode) {
            verificationCode.addEventListener('input', (e) => {
                // Only allow numbers
                e.target.value = e.target.value.replace(/[^0-9]/g, '');
                
                // Auto-submit when 6 digits entered
                if (e.target.value.length === 6) {
                    setTimeout(() => {
                        this.handleVerification(new Event('submit'));
                    }, 500);
                }
            });
        }
    }

    // Password strength indicator
    initPasswordStrength() {
        const passwordInput = document.getElementById('registerPassword');
        if (passwordInput) {
            passwordInput.addEventListener('input', (e) => {
                this.updatePasswordStrength(e.target.value);
            });
        }
    }

    updatePasswordStrength(password) {
        const strengthMeter = document.querySelector('.strength-fill');
        const strengthText = document.querySelector('.strength-text');
        
        if (!strengthMeter || !strengthText) return;

        let strength = 0;
        let text = 'Очень слабый';
        
        if (password.length >= 6) strength += 1;
        if (password.match(/[a-z]/)) strength += 1;
        if (password.match(/[A-Z]/)) strength += 1;
        if (password.match(/[0-9]/)) strength += 1;
        if (password.match(/[^a-zA-Z0-9]/)) strength += 1;

        strengthMeter.className = 'strength-fill';
        
        if (strength === 0) {
            text = 'Введите пароль';
        } else if (strength <= 2) {
            strengthMeter.classList.add('weak');
            text = 'Слабый пароль';
        } else if (strength <= 4) {
            strengthMeter.classList.add('medium');
            text = 'Средний пароль';
        } else {
            strengthMeter.classList.add('strong');
            text = 'Надежный пароль';
        }

        strengthText.textContent = text;
    }

    validatePasswordMatch() {
        const password = document.getElementById('registerPassword')?.value;
        const confirmPassword = document.getElementById('registerPasswordConfirm');
        
        if (!confirmPassword) return;

        if (confirmPassword.value && password !== confirmPassword.value) {
            confirmPassword.classList.add('error');
            confirmPassword.classList.remove('success');
        } else if (confirmPassword.value) {
            confirmPassword.classList.add('success');
            confirmPassword.classList.remove('error');
        } else {
            confirmPassword.classList.remove('error', 'success');
        }
    }

    // Check existing session
    async checkExistingSession() {
        try {
            const response = await fetch('/api/auth/session', {
                credentials: 'include'
            });
            const data = await response.json();
            
            if (data.authenticated) {
                // Redirect to dashboard
                window.location.href = 'dashboard.html';
            }
        } catch (error) {
            console.log('No existing session');
        }
    }

    // Show/hide forms
    showForm(formId) {
        const forms = ['loginForm', 'registerForm', 'verificationForm', 'forgotPasswordForm'];
        
        forms.forEach(id => {
            const form = document.getElementById(id);
            if (form) {
                if (id === formId) {
                    form.style.display = 'block';
                    form.classList.add('fade-in');
                    form.classList.remove('fade-out');
                } else {
                    form.classList.add('fade-out');
                    form.classList.remove('fade-in');
                    setTimeout(() => {
                        form.style.display = 'none';
                    }, 300);
                }
            }
        });
        
        this.currentForm = formId.replace('Form', '');
    }

    // Handle login
    async handleLogin(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const data = {
            email: formData.get('email'),
            password: formData.get('password')
        };

        if (!this.validateEmail(data.email)) {
            this.showNotification('Введите корректный email адрес', 'error');
            return;
        }

        if (!data.password) {
            this.showNotification('Введите пароль', 'error');
            return;
        }

        this.showLoading(true);

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (result.success) {
                // Set session cookie
                if (result.session_token) {
                    document.cookie = `session_token=${result.session_token}; path=/; max-age=2592000`; // 30 days
                }
                
                this.showNotification('Успешный вход! Перенаправление...', 'success');
                
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 1500);
            } else if (result.email_verification_required) {
                this.verificationEmail = data.email;
                document.getElementById('verificationEmail').textContent = data.email;
                this.showForm('verificationForm');
                this.showNotification('Подтвердите email для входа', 'warning');
                
                // Show verification code for demo
                if (result.verification_code) {
                    setTimeout(() => {
                        this.showNotification(`Код для тестирования: ${result.verification_code}`, 'info');
                    }, 2000);
                }
            } else {
                this.showNotification(result.error || 'Ошибка входа', 'error');
            }
        } catch (error) {
            console.error('Login error:', error);
            this.showNotification('Ошибка соединения с сервером', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    // Handle registration
    async handleRegister(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const data = {
            email: formData.get('email'),
            password: formData.get('password'),
            username: formData.get('username') || ''
        };

        const passwordConfirm = formData.get('passwordConfirm');
        const agree = formData.get('agree');

        // Validation
        if (!this.validateEmail(data.email)) {
            this.showNotification('Введите корректный email адрес', 'error');
            return;
        }

        if (data.password.length < 6) {
            this.showNotification('Пароль должен содержать минимум 6 символов', 'error');
            return;
        }

        if (data.password !== passwordConfirm) {
            this.showNotification('Пароли не совпадают', 'error');
            return;
        }

        if (!agree) {
            this.showNotification('Необходимо согласиться с условиями использования', 'error');
            return;
        }

        this.showLoading(true);

        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (result.success) {
                this.verificationEmail = data.email;
                document.getElementById('verificationEmail').textContent = data.email;
                this.showForm('verificationForm');
                this.showNotification('Регистрация успешна! Проверьте email', 'success');
                
                // Show verification code for demo
                if (result.verification_code) {
                    setTimeout(() => {
                        this.showNotification(`Код для тестирования: ${result.verification_code}`, 'info');
                    }, 2000);
                }
            } else {
                this.showNotification(result.error || 'Ошибка регистрации', 'error');
            }
        } catch (error) {
            console.error('Registration error:', error);
            this.showNotification('Ошибка соединения с сервером', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    // Handle email verification
    async handleVerification(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const code = formData.get('code');

        if (!code || code.length !== 6) {
            this.showNotification('Введите 6-значный код', 'error');
            return;
        }

        this.showLoading(true);

        try {
            const response = await fetch('/api/auth/verify-email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: this.verificationEmail,
                    code: code
                })
            });

            const result = await response.json();

            if (result.success) {
                this.showNotification('Email подтвержден! Можете войти в аккаунт', 'success');
                setTimeout(() => {
                    this.showForm('loginForm');
                }, 2000);
            } else {
                this.showNotification(result.error || 'Неверный код', 'error');
            }
        } catch (error) {
            console.error('Verification error:', error);
            this.showNotification('Ошибка соединения с сервером', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    // Handle forgot password
    async handleForgotPassword(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const email = formData.get('email');

        if (!this.validateEmail(email)) {
            this.showNotification('Введите корректный email адрес', 'error');
            return;
        }

        this.showLoading(true);

        try {
            const response = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email })
            });

            const result = await response.json();

            if (result.success) {
                this.showNotification('Код для сброса пароля отправлен на email', 'success');
                
                // Show reset code for demo
                if (result.reset_code) {
                    setTimeout(() => {
                        this.showNotification(`Код для тестирования: ${result.reset_code}`, 'info');
                    }, 2000);
                }
            } else {
                this.showNotification(result.error || 'Ошибка отправки', 'error');
            }
        } catch (error) {
            console.error('Forgot password error:', error);
            this.showNotification('Ошибка соединения с сервером', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    // Resend verification code
    async resendCode() {
        if (!this.verificationEmail) {
            this.showNotification('Email не найден', 'error');
            return;
        }

        this.showLoading(true);

        try {
            const response = await fetch('/api/auth/resend-code', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: this.verificationEmail
                })
            });

            const result = await response.json();

            if (result.success) {
                this.showNotification('Код отправлен повторно', 'success');
                this.startResendTimer();
                
                // Show verification code for demo
                if (result.verification_code) {
                    setTimeout(() => {
                        this.showNotification(`Код для тестирования: ${result.verification_code}`, 'info');
                    }, 2000);
                }
            } else {
                this.showNotification(result.error || 'Ошибка отправки', 'error');
            }
        } catch (error) {
            console.error('Resend error:', error);
            this.showNotification('Ошибка соединения с сервером', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    // Start resend timer
    startResendTimer() {
        const resendBtn = document.getElementById('resendBtn');
        const resendTimer = document.getElementById('resendTimer');
        const timerSeconds = document.getElementById('timerSeconds');
        
        if (!resendBtn || !resendTimer || !timerSeconds) return;

        let seconds = 60;
        resendBtn.style.display = 'none';
        resendTimer.style.display = 'block';
        
        this.resendTimer = setInterval(() => {
            seconds--;
            timerSeconds.textContent = seconds;
            
            if (seconds <= 0) {
                clearInterval(this.resendTimer);
                resendBtn.style.display = 'inline-flex';
                resendTimer.style.display = 'none';
            }
        }, 1000);
    }

    // Telegram authentication
    async authWithTelegram() {
        this.showNotification('Функция Telegram авторизации в разработке', 'info');
        
        // В реальном проекте здесь будет интеграция с Telegram Login Widget
        // https://core.telegram.org/widgets/login
    }

    // Utility functions
    validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    showNotification(message, type = 'info') {
        const notification = document.getElementById('notification');
        if (!notification) return;

        notification.textContent = message;
        notification.className = `notification ${type}`;
        notification.classList.add('show');

        setTimeout(() => {
            notification.classList.remove('show');
        }, 5000);
    }

    showLoading(show) {
        const overlay = document.getElementById('loadingOverlay');
        if (!overlay) return;

        if (show) {
            overlay.classList.add('show');
        } else {
            overlay.classList.remove('show');
        }
    }
}

// Global functions for onclick handlers
function showLogin() {
    authManager.showForm('loginForm');
}

function showRegister() {
    authManager.showForm('registerForm');
}

function showForgotPassword() {
    authManager.showForm('forgotPasswordForm');
}

function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    const icon = input.nextElementSibling.querySelector('i');
    
    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        input.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
}

function resendCode() {
    authManager.resendCode();
}

function authWithTelegram() {
    authManager.authWithTelegram();
}

function showTerms() {
    alert('Здесь будут условия использования');
}

function showPrivacy() {
    alert('Здесь будет политика конфиденциальности');
}

// Initialize auth manager when DOM is loaded
let authManager;
document.addEventListener('DOMContentLoaded', () => {
    authManager = new AuthManager();
});

// Handle back/forward browser navigation
window.addEventListener('popstate', () => {
    // Handle browser navigation if needed
});

// Prevent form submission on Enter in some cases
document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && e.target.classList.contains('no-submit')) {
        e.preventDefault();
    }
});

// Auto-save form data to localStorage (optional)
function saveFormData(formId) {
    const form = document.getElementById(formId);
    if (!form) return;

    const formData = new FormData(form);
    const data = {};
    
    for (let [key, value] of formData.entries()) {
        if (key !== 'password' && key !== 'passwordConfirm') { // Don't save passwords
            data[key] = value;
        }
    }
    
    localStorage.setItem(`${formId}_data`, JSON.stringify(data));
}

function loadFormData(formId) {
    const savedData = localStorage.getItem(`${formId}_data`);
    if (!savedData) return;

    try {
        const data = JSON.parse(savedData);
        const form = document.getElementById(formId);
        
        for (let [key, value] of Object.entries(data)) {
            const input = form.querySelector(`[name="${key}"]`);
            if (input && input.type !== 'password') {
                input.value = value;
            }
        }
    } catch (error) {
        console.log('Error loading saved form data:', error);
    }
}

// Clear saved form data after successful submission
function clearFormData(formId) {
    localStorage.removeItem(`${formId}_data`);
}

// Load saved data when page loads
document.addEventListener('DOMContentLoaded', () => {
    loadFormData('loginFormElement');
    loadFormData('registerFormElement');
});
