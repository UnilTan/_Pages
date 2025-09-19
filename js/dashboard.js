/**
 * 📊 Личный кабинет CryptoWatch MEXC
 * Управление данными пользователя и интеграция с ботом
 */

class DashboardManager {
    constructor() {
        this.apiUrl = '/api/dashboard';
        this.botApiUrl = '/api/bot';
        this.currentUser = null;
        this.botStatus = 'checking';
        this.updateIntervals = {};
        this.chart = null;
        
        this.init();
    }

    async init() {
        console.log('📊 Инициализация личного кабинета...');
        
        // Проверяем авторизацию
        if (!this.checkAuth()) {
            return;
        }
        
        // Инициализируем элементы интерфейса
        this.initElements();
        
        // Добавляем обработчики событий
        this.attachEventListeners();
        
        // Загружаем данные пользователя
        await this.loadUserData();
        
        // Проверяем статус бота
        await this.checkBotStatus();
        
        // Инициализируем график
        this.initChart();
        
        // Загружаем данные дашборда
        await this.loadDashboardData();
        
        // Настраиваем автообновление
        this.setupAutoRefresh();
        
        console.log('✅ Личный кабинет инициализирован');
    }

    checkAuth() {
        const authData = this.getAuthData();
        
        if (!authData || !authData.token || this.isTokenExpired(authData.expiresAt)) {
            console.warn('⚠️ Пользователь не авторизован, перенаправление...');
            window.location.href = 'auth.html';
            return false;
        }
        
        this.currentUser = authData.user;
        console.log('👤 Пользователь авторизован:', this.currentUser.name);
        return true;
    }

    initElements() {
        // Пользовательские элементы
        this.userNameElement = document.getElementById('userName');
        this.welcomeUserNameElement = document.getElementById('welcomeUserName');
        this.userMenuToggle = document.getElementById('userMenuToggle');
        this.userDropdown = document.getElementById('userDropdown');
        this.logoutBtn = document.getElementById('logoutBtn');
        
        // Статус бота
        this.botStatusElement = document.getElementById('botStatus');
        this.botStatusDisplay = document.getElementById('botStatusDisplay');
        
        // Статистика
        this.totalSignalsElement = document.getElementById('totalSignals');
        this.successRateElement = document.getElementById('successRate');
        this.todaySignalsElement = document.getElementById('todaySignals');
        
        // Списки данных
        this.signalsListElement = document.getElementById('signalsList');
        this.tradesListElement = document.getElementById('tradesList');
        this.hotCoinsListElement = document.getElementById('hotCoinsList');
        
        // Кнопки управления
        this.refreshSignalsBtn = document.getElementById('refreshSignals');
        this.retryConnectionBtn = document.getElementById('retryConnection');
        
        // Модалы
        this.connectionModal = document.getElementById('connectionModal');
        this.closeConnectionModalBtn = document.getElementById('closeConnectionModal');
        
        // График
        this.chartCanvas = document.getElementById('performanceChart');
        this.chartPeriodSelect = document.getElementById('chartPeriod');
        
        // Настройки
        this.notificationsEnabled = document.getElementById('notificationsEnabled');
        this.soundEnabled = document.getElementById('soundEnabled');
        this.signalThreshold = document.getElementById('signalThreshold');
        this.autoRefreshSelect = document.getElementById('autoRefresh');
    }

    attachEventListeners() {
        // Пользовательское меню
        this.userMenuToggle?.addEventListener('click', () => this.toggleUserMenu());
        document.addEventListener('click', (e) => this.handleOutsideClick(e));
        this.logoutBtn?.addEventListener('click', () => this.handleLogout());
        
        // Кнопки управления
        this.refreshSignalsBtn?.addEventListener('click', () => this.refreshSignals());
        this.retryConnectionBtn?.addEventListener('click', () => this.retryBotConnection());
        this.closeConnectionModalBtn?.addEventListener('click', () => this.hideConnectionModal());
        
        // График
        this.chartPeriodSelect?.addEventListener('change', (e) => this.updateChartPeriod(e.target.value));
        
        // Настройки
        this.notificationsEnabled?.addEventListener('change', () => this.updateSettings());
        this.soundEnabled?.addEventListener('change', () => this.updateSettings());
        this.signalThreshold?.addEventListener('change', () => this.updateSettings());
        this.autoRefreshSelect?.addEventListener('change', () => this.updateAutoRefresh());
    }

    async loadUserData() {
        try {
            console.log('👤 Загрузка данных пользователя...');
            
            // Обновляем имя пользователя в интерфейсе
            if (this.userNameElement) {
                this.userNameElement.textContent = this.currentUser.name;
            }
            if (this.welcomeUserNameElement) {
                this.welcomeUserNameElement.textContent = this.currentUser.name;
            }
            
            console.log('✅ Данные пользователя загружены');
        } catch (error) {
            console.error('❌ Ошибка загрузки данных пользователя:', error);
        }
    }

    async checkBotStatus() {
        try {
            console.log('🤖 Проверка статуса бота...');
            
            const response = await this.makeBotRequest('/status');
            
            if (response.success) {
                this.botStatus = 'online';
                this.updateBotStatusDisplay('online', 'Бот активен', 'Все системы работают');
                console.log('✅ Бот онлайн');
            } else {
                throw new Error(response.error || 'Bot offline');
            }
        } catch (error) {
            console.error('❌ Бот недоступен:', error);
            this.botStatus = 'offline';
            this.updateBotStatusDisplay('offline', 'Бот недоступен', 'Проверьте соединение');
            this.showConnectionModal('TIMEOUT');
        }
    }

    async makeBotRequest(endpoint, data = null) {
        // Симуляция запроса к боту (заменить на реальный API)
        console.log(`🤖 Запрос к боту: ${endpoint}`, data);
        
        // Имитация задержки сети
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Симуляция ответа (90% успешных запросов)
        if (Math.random() < 0.9) {
            return {
                success: true,
                data: this.generateMockBotData(endpoint)
            };
        } else {
            return {
                success: false,
                error: 'TIMEOUT',
                message: 'Превышено время ожидания'
            };
        }
    }

    generateMockBotData(endpoint) {
        switch (endpoint) {
            case '/status':
                return {
                    status: 'online',
                    uptime: '2d 14h 32m',
                    lastSignal: '5 мин назад',
                    activePairs: 24
                };
            
            case '/signals':
                return {
                    signals: [
                        {
                            pair: 'BTC/USDT',
                            change: '+8.5%',
                            type: 'pump',
                            timestamp: Date.now() - 300000,
                            quality: 'high'
                        },
                        {
                            pair: 'ETH/USDT',
                            change: '-6.2%',
                            type: 'dump',
                            timestamp: Date.now() - 600000,
                            quality: 'medium'
                        },
                        {
                            pair: 'ADA/USDT',
                            change: '+12.1%',
                            type: 'pump',
                            timestamp: Date.now() - 900000,
                            quality: 'high'
                        }
                    ]
                };
            
            case '/trades':
                return {
                    trades: [
                        {
                            pair: 'BTC/USDT',
                            result: 'profit',
                            amount: '+$245.50',
                            timestamp: Date.now() - 3600000
                        },
                        {
                            pair: 'ETH/USDT',
                            result: 'loss',
                            amount: '-$89.20',
                            timestamp: Date.now() - 7200000
                        }
                    ]
                };
            
            case '/hot-coins':
                return {
                    coins: [
                        { symbol: 'DOGE', change: '+15.8%' },
                        { symbol: 'SHIB', change: '+12.4%' },
                        { symbol: 'PEPE', change: '+9.7%' },
                        { symbol: 'FLOKI', change: '+8.2%' }
                    ]
                };
            
            case '/analytics':
                return {
                    totalSignals: 1247,
                    successRate: 87.3,
                    todaySignals: 23,
                    chartData: this.generateChartData()
                };
            
            default:
                return {};
        }
    }

    generateChartData() {
        const data = [];
        const labels = [];
        const now = new Date();
        
        for (let i = 6; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(date.getDate() - i);
            labels.push(date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' }));
            
            // Генерируем данные для отображения
            data.push({
                profit: Math.random() * 20 - 5, // от -5% до +15%
                accuracy: 70 + Math.random() * 25 // от 70% до 95%
            });
        }
        
        return { labels, data };
    }

    async loadDashboardData() {
        try {
            console.log('📊 Загрузка данных дашборда...');
            
            // Загружаем все данные параллельно
            const [signalsData, tradesData, hotCoinsData, analyticsData] = await Promise.all([
                this.makeBotRequest('/signals'),
                this.makeBotRequest('/trades'),
                this.makeBotRequest('/hot-coins'),
                this.makeBotRequest('/analytics')
            ]);
            
            // Обновляем интерфейс
            if (signalsData.success) {
                this.updateSignalsList(signalsData.data.signals);
            }
            
            if (tradesData.success) {
                this.updateTradesList(tradesData.data.trades);
            }
            
            if (hotCoinsData.success) {
                this.updateHotCoinsList(hotCoinsData.data.coins);
            }
            
            if (analyticsData.success) {
                this.updateAnalytics(analyticsData.data);
                this.updateChart(analyticsData.data.chartData);
            }
            
            console.log('✅ Данные дашборда загружены');
        } catch (error) {
            console.error('❌ Ошибка загрузки данных дашборда:', error);
            this.showNotification('Ошибка загрузки данных', 'error');
        }
    }

    updateBotStatusDisplay(status, title, subtitle) {
        if (!this.botStatusElement || !this.botStatusDisplay) return;
        
        // Обновляем статус в хедере
        const headerIndicator = this.botStatusElement.querySelector('.status-indicator');
        const headerText = this.botStatusElement.querySelector('.status-text');
        
        if (headerIndicator) {
            headerIndicator.className = `fas fa-circle status-indicator ${status}`;
        }
        if (headerText) {
            headerText.textContent = title;
        }
        
        // Обновляем детальный статус
        const statusIcon = this.botStatusDisplay.querySelector('.status-icon');
        const statusTitle = this.botStatusDisplay.querySelector('.status-title');
        const statusSubtitle = this.botStatusDisplay.querySelector('.status-subtitle');
        
        if (statusIcon) {
            statusIcon.className = `status-icon ${status}`;
        }
        if (statusTitle) {
            statusTitle.textContent = title;
        }
        if (statusSubtitle) {
            statusSubtitle.textContent = subtitle;
        }
        
        // Обновляем метрики бота
        if (status === 'online') {
            const botData = this.generateMockBotData('/status');
            this.updateBotMetrics(botData);
        }
    }

    updateBotMetrics(data) {
        const uptimeElement = document.getElementById('botUptime');
        const lastSignalElement = document.getElementById('lastSignalTime');
        const activePairsElement = document.getElementById('activePairs');
        
        if (uptimeElement) uptimeElement.textContent = data.uptime || '--:--:--';
        if (lastSignalElement) lastSignalElement.textContent = data.lastSignal || 'Нет данных';
        if (activePairsElement) activePairsElement.textContent = data.activePairs || '0';
    }

    updateSignalsList(signals) {
        if (!this.signalsListElement) return;
        
        if (!signals || signals.length === 0) {
            this.signalsListElement.innerHTML = `
                <div class="signals-placeholder">
                    <i class="fas fa-satellite-dish"></i>
                    <p>Нет активных сигналов</p>
                </div>
            `;
            return;
        }
        
        const signalsHtml = signals.map(signal => `
            <div class="signal-item">
                <div class="signal-info">
                    <span class="signal-pair">${signal.pair}</span>
                    <span class="signal-time">${this.formatTime(signal.timestamp)}</span>
                </div>
                <div class="signal-details">
                    <span class="signal-change ${signal.type === 'pump' ? 'positive' : 'negative'}">
                        ${signal.change}
                    </span>
                    <span class="signal-quality">${this.getQualityBadge(signal.quality)}</span>
                </div>
            </div>
        `).join('');
        
        this.signalsListElement.innerHTML = signalsHtml;
    }

    updateTradesList(trades) {
        if (!this.tradesListElement) return;
        
        if (!trades || trades.length === 0) {
            this.tradesListElement.innerHTML = `
                <div class="trades-placeholder">
                    <i class="fas fa-exchange-alt"></i>
                    <p>История сделок пуста</p>
                </div>
            `;
            return;
        }
        
        const tradesHtml = trades.map(trade => `
            <div class="trade-item ${trade.result}">
                <div class="trade-info">
                    <span class="trade-pair">${trade.pair}</span>
                    <span class="trade-time">${this.formatTime(trade.timestamp)}</span>
                </div>
                <div class="trade-result">
                    <span class="trade-amount ${trade.result === 'profit' ? 'positive' : 'negative'}">
                        ${trade.amount}
                    </span>
                </div>
            </div>
        `).join('');
        
        this.tradesListElement.innerHTML = tradesHtml;
    }

    updateHotCoinsList(coins) {
        if (!this.hotCoinsListElement) return;
        
        if (!coins || coins.length === 0) {
            this.hotCoinsListElement.innerHTML = `
                <div class="hot-coins-placeholder">
                    <i class="fas fa-fire"></i>
                    <p>Нет горячих монет</p>
                </div>
            `;
            return;
        }
        
        const coinsHtml = coins.map(coin => `
            <div class="hot-coin-item">
                <span class="coin-symbol">${coin.symbol}</span>
                <span class="coin-change">${coin.change}</span>
            </div>
        `).join('');
        
        this.hotCoinsListElement.innerHTML = coinsHtml;
        
        // Обновляем время последнего обновления
        const updateTimeElement = document.getElementById('hotCoinsUpdate');
        if (updateTimeElement) {
            updateTimeElement.textContent = `Обновлено: ${new Date().toLocaleTimeString('ru-RU')}`;
        }
    }

    updateAnalytics(data) {
        // Обновляем статистику с анимацией
        if (this.totalSignalsElement) {
            this.animateValue(this.totalSignalsElement, data.totalSignals);
        }
        if (this.successRateElement) {
            this.animateValue(this.successRateElement, data.successRate, '%');
        }
        if (this.todaySignalsElement) {
            this.animateValue(this.todaySignalsElement, data.todaySignals);
        }
    }

    animateValue(element, endValue, suffix = '') {
        const startValue = parseInt(element.textContent) || 0;
        const duration = 2000;
        const range = endValue - startValue;
        const increment = range / (duration / 16);
        let current = startValue;
        
        const timer = setInterval(() => {
            current += increment;
            
            if ((increment > 0 && current >= endValue) || (increment < 0 && current <= endValue)) {
                current = endValue;
                clearInterval(timer);
            }
            
            element.textContent = Math.round(current) + suffix;
        }, 16);
    }

    initChart() {
        if (!this.chartCanvas) return;
        
        const ctx = this.chartCanvas.getContext('2d');
        
        this.chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Прибыль (%)',
                    data: [],
                    borderColor: '#00D4FF',
                    backgroundColor: 'rgba(0, 212, 255, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4
                }, {
                    label: 'Точность (%)',
                    data: [],
                    borderColor: '#4ECDC4',
                    backgroundColor: 'rgba(78, 205, 196, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)'
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });
    }

    updateChart(chartData) {
        if (!this.chart || !chartData) return;
        
        this.chart.data.labels = chartData.labels;
        this.chart.data.datasets[0].data = chartData.data.map(d => d.profit);
        this.chart.data.datasets[1].data = chartData.data.map(d => d.accuracy);
        this.chart.update();
    }

    setupAutoRefresh() {
        const refreshInterval = parseInt(this.autoRefreshSelect?.value || '60') * 1000;
        
        // Очищаем существующие интервалы
        Object.values(this.updateIntervals).forEach(interval => clearInterval(interval));
        this.updateIntervals = {};
        
        // Настраиваем новые интервалы
        this.updateIntervals.dashboard = setInterval(() => {
            this.loadDashboardData();
        }, refreshInterval);
        
        this.updateIntervals.botStatus = setInterval(() => {
            this.checkBotStatus();
        }, 30000); // Проверяем статус бота каждые 30 секунд
        
        console.log(`🔄 Автообновление настроено на ${refreshInterval / 1000} сек`);
    }

    async refreshSignals() {
        const btn = this.refreshSignalsBtn;
        if (!btn) return;
        
        const originalIcon = btn.querySelector('i').className;
        btn.querySelector('i').className = 'fas fa-sync-alt fa-spin';
        btn.disabled = true;
        
        try {
            await this.loadDashboardData();
            this.showNotification('Данные обновлены', 'success');
        } catch (error) {
            this.showNotification('Ошибка обновления', 'error');
        } finally {
            btn.querySelector('i').className = originalIcon;
            btn.disabled = false;
        }
    }

    async retryBotConnection() {
        this.hideConnectionModal();
        this.updateBotStatusDisplay('checking', 'Подключение...', 'Проверка соединения');
        await this.checkBotStatus();
    }

    toggleUserMenu() {
        if (!this.userDropdown) return;
        this.userDropdown.classList.toggle('show');
    }

    handleOutsideClick(e) {
        if (!this.userDropdown) return;
        
        if (!e.target.closest('.user-menu')) {
            this.userDropdown.classList.remove('show');
        }
    }

    handleLogout() {
        console.log('👋 Выход из аккаунта...');
        this.clearAuthData();
        this.showNotification('Вы вышли из аккаунта', 'info');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1500);
    }

    updateSettings() {
        const settings = {
            notifications: this.notificationsEnabled?.checked || false,
            sound: this.soundEnabled?.checked || false,
            signalThreshold: this.signalThreshold?.value || '7'
        };
        
        localStorage.setItem('cryptowatch_settings', JSON.stringify(settings));
        console.log('⚙️ Настройки сохранены:', settings);
        this.showNotification('Настройки сохранены', 'success');
    }

    updateAutoRefresh() {
        this.setupAutoRefresh();
        this.showNotification('Интервал обновления изменен', 'info');
    }

    updateChartPeriod(period) {
        console.log(`📈 Изменение периода графика: ${period}`);
        // TODO: Загрузить данные для нового периода
        this.showNotification(`График обновлен для периода: ${period}`, 'info');
    }

    showConnectionModal(errorCode) {
        if (!this.connectionModal) return;
        
        const errorCodeElement = document.getElementById('errorCode');
        if (errorCodeElement) {
            errorCodeElement.textContent = errorCode;
        }
        
        this.connectionModal.classList.add('show');
    }

    hideConnectionModal() {
        if (!this.connectionModal) return;
        this.connectionModal.classList.remove('show');
    }

    // Утилиты
    formatTime(timestamp) {
        const now = Date.now();
        const diff = now - timestamp;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);
        
        if (minutes < 1) return 'только что';
        if (minutes < 60) return `${minutes} мин назад`;
        if (hours < 24) return `${hours} ч назад`;
        return `${days} дн назад`;
    }

    getQualityBadge(quality) {
        const badges = {
            high: '🟢 Высокое',
            medium: '🟡 Среднее',
            low: '🔴 Низкое'
        };
        return badges[quality] || '⚪ Неизвестно';
    }

    // Работа с localStorage
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

    isTokenExpired(expiresAt) {
        return Date.now() > expiresAt;
    }

    showNotification(message, type = 'info') {
        if (typeof showNotification === 'function') {
            showNotification(message, type);
        } else {
            console.log(`${type.toUpperCase()}: ${message}`);
        }
    }

    // Очистка ресурсов при выходе
    destroy() {
        Object.values(this.updateIntervals).forEach(interval => clearInterval(interval));
        if (this.chart) {
            this.chart.destroy();
        }
    }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Загрузка личного кабинета...');
    
    // Создаем экземпляр менеджера дашборда
    window.dashboardManager = new DashboardManager();
    
    console.log('✅ Личный кабинет загружен');
});

// Очистка при выходе со страницы
window.addEventListener('beforeunload', function() {
    if (window.dashboardManager) {
        window.dashboardManager.destroy();
    }
});

// Экспорт для использования в других модулях
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DashboardManager;
}
