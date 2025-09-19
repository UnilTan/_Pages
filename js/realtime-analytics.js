/**
 * 📊 Система аналитики и мониторинга в реальном времени
 * Получает и обрабатывает реальные данные от торгового бота
 */

class RealTimeAnalytics {
    constructor() {
        this.botAPI = 'http://localhost:8000/api';
        this.fallbackAPI = '/api/bot';
        this.updateInterval = 15000; // 15 секунд
        this.charts = {};
        this.metrics = {};
        this.isConnected = false;
        this.retryCount = 0;
        this.maxRetries = 5;
        
        // Колбэки для обновлений
        this.onDataUpdate = null;
        this.onConnectionChange = null;
        
        this.init();
    }

    /**
     * 🚀 Инициализация системы аналитики
     */
    async init() {
        console.log('🚀 Инициализация системы реального времени...');
        
        // Проверяем подключение к боту
        await this.checkConnection();
        
        // Загружаем начальные данные
        await this.loadInitialData();
        
        // Запускаем автообновление
        this.startRealTimeUpdates();
        
        // Инициализируем графики
        this.initializeCharts();
        
        console.log('✅ Система аналитики запущена');
    }

    /**
     * 🔌 Проверка подключения к боту
     */
    async checkConnection() {
        try {
            const response = await fetch(`${this.botAPI}/health`, {
                method: 'GET',
                timeout: 5000
            });
            
            if (response.ok) {
                this.isConnected = true;
                this.retryCount = 0;
                console.log('✅ Подключение к боту установлено');
                
                if (this.onConnectionChange) {
                    this.onConnectionChange(true);
                }
                
                return true;
            }
        } catch (error) {
            console.warn('⚠️ Бот недоступен, используем fallback API');
        }
        
        this.isConnected = false;
        if (this.onConnectionChange) {
            this.onConnectionChange(false);
        }
        
        return false;
    }

    /**
     * 📊 Загрузка начальных данных
     */
    async loadInitialData() {
        try {
            console.log('📊 Загрузка начальных данных...');
            
            // Загружаем все данные параллельно
            const [stats, signals, trades, analytics] = await Promise.all([
                this.fetchStats(),
                this.fetchSignals(),
                this.fetchTrades(),
                this.fetchAnalytics()
            ]);
            
            // Обновляем интерфейс
            this.updateMetrics(stats);
            this.updateSignalsDisplay(signals);
            this.updateTradesDisplay(trades);
            this.updateChartsData(analytics);
            
            console.log('✅ Начальные данные загружены');
            
        } catch (error) {
            console.error('❌ Ошибка загрузки данных:', error);
            this.handleError(error);
        }
    }

    /**
     * 📈 Получение статистики
     */
    async fetchStats() {
        const apiUrl = this.isConnected ? `${this.botAPI}/stats` : `${this.fallbackAPI}/stats`;
        
        try {
            const response = await fetch(apiUrl, {
                headers: this.getHeaders()
            });
            
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            
            const data = await response.json();
            return {
                success: true,
                data: data.data || data,
                source: this.isConnected ? 'bot' : 'fallback'
            };
            
        } catch (error) {
            console.warn('⚠️ Ошибка получения статистики:', error);
            return {
                success: false,
                data: this.getDemoStats(),
                source: 'demo'
            };
        }
    }

    /**
     * 📡 Получение сигналов
     */
    async fetchSignals() {
        const apiUrl = this.isConnected ? `${this.botAPI}/signals` : `${this.fallbackAPI}/signals`;
        
        try {
            const response = await fetch(apiUrl, {
                headers: this.getHeaders()
            });
            
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            
            const data = await response.json();
            return {
                success: true,
                data: data.signals || data.data?.signals || [],
                source: this.isConnected ? 'bot' : 'fallback'
            };
            
        } catch (error) {
            console.warn('⚠️ Ошибка получения сигналов:', error);
            return {
                success: false,
                data: this.getDemoSignals(),
                source: 'demo'
            };
        }
    }

    /**
     * 💹 Получение сделок
     */
    async fetchTrades() {
        const apiUrl = this.isConnected ? `${this.botAPI}/trades` : `${this.fallbackAPI}/trades`;
        
        try {
            const response = await fetch(apiUrl, {
                headers: this.getHeaders()
            });
            
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            
            const data = await response.json();
            return {
                success: true,
                data: data.trades || data.data?.trades || [],
                source: this.isConnected ? 'bot' : 'fallback'
            };
            
        } catch (error) {
            console.warn('⚠️ Ошибка получения сделок:', error);
            return {
                success: false,
                data: this.getDemoTrades(),
                source: 'demo'
            };
        }
    }

    /**
     * 📊 Получение аналитических данных
     */
    async fetchAnalytics() {
        const apiUrl = this.isConnected ? `${this.botAPI}/analytics` : `${this.fallbackAPI}/analytics`;
        
        try {
            const response = await fetch(apiUrl, {
                headers: this.getHeaders()
            });
            
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            
            const data = await response.json();
            return {
                success: true,
                data: data.data || data,
                source: this.isConnected ? 'bot' : 'fallback'
            };
            
        } catch (error) {
            console.warn('⚠️ Ошибка получения аналитики:', error);
            return {
                success: false,
                data: this.getDemoAnalytics(),
                source: 'demo'
            };
        }
    }

    /**
     * 🔄 Запуск автообновления
     */
    startRealTimeUpdates() {
        console.log(`🔄 Запуск автообновления (${this.updateInterval/1000}с)`);
        
        // Очищаем предыдущий интервал если есть
        if (this.updateTimer) {
            clearInterval(this.updateTimer);
        }
        
        this.updateTimer = setInterval(async () => {
            await this.updateAllData();
        }, this.updateInterval);
    }

    /**
     * 🔄 Обновление всех данных
     */
    async updateAllData() {
        try {
            console.log('🔄 Обновление данных в реальном времени...');
            
            // Проверяем подключение
            if (!this.isConnected) {
                await this.checkConnection();
            }
            
            // Обновляем данные
            const [stats, signals, trades, analytics] = await Promise.all([
                this.fetchStats(),
                this.fetchSignals(),
                this.fetchTrades(),
                this.fetchAnalytics()
            ]);
            
            // Обновляем интерфейс
            this.updateMetrics(stats);
            this.updateSignalsDisplay(signals);
            this.updateTradesDisplay(trades);
            this.updateChartsData(analytics);
            
            // Обновляем индикатор подключения
            this.updateConnectionStatus();
            
            // Вызываем колбэк если есть
            if (this.onDataUpdate) {
                this.onDataUpdate({
                    stats, signals, trades, analytics,
                    timestamp: new Date(),
                    connected: this.isConnected
                });
            }
            
            console.log('✅ Данные обновлены');
            
        } catch (error) {
            console.error('❌ Ошибка обновления данных:', error);
            this.handleError(error);
        }
    }

    /**
     * 📊 Обновление метрик на странице
     */
    updateMetrics(statsResult) {
        if (!statsResult.success) return;
        
        const stats = statsResult.data;
        
        // Обновляем основные метрики
        this.updateElement('winRateValue', `${stats.success_rate || 0}%`);
        this.updateElement('avgMultiplierValue', `${stats.avg_profit || 0}%`);
        this.updateElement('activeSignalsValue', stats.active_signals || 0);
        
        // Обновляем дополнительные метрики
        this.updateElement('totalSignalsValue', stats.total_signals || 0);
        this.updateElement('totalProfitValue', `${stats.total_profit || 0}%`);
        this.updateElement('todaySignalsValue', stats.today_signals || 0);
        
        // Сохраняем метрики
        this.metrics = stats;
        
        console.log(`📊 Метрики обновлены (источник: ${statsResult.source})`);
    }

    /**
     * 📡 Обновление отображения сигналов
     */
    updateSignalsDisplay(signalsResult) {
        if (!signalsResult.success) return;
        
        const signals = signalsResult.data;
        const container = document.getElementById('signalsContainer');
        
        if (!container) return;
        
        // Очищаем контейнер
        container.innerHTML = '';
        
        // Добавляем сигналы
        signals.slice(0, 5).forEach(signal => {
            const signalElement = this.createSignalElement(signal);
            container.appendChild(signalElement);
        });
        
        console.log(`📡 Сигналы обновлены: ${signals.length} (источник: ${signalsResult.source})`);
    }

    /**
     * 💹 Обновление отображения сделок
     */
    updateTradesDisplay(tradesResult) {
        if (!tradesResult.success) return;
        
        const trades = tradesResult.data;
        const container = document.getElementById('tradesContainer');
        
        if (!container) return;
        
        // Очищаем контейнер
        container.innerHTML = '';
        
        // Добавляем сделки
        trades.slice(0, 10).forEach(trade => {
            const tradeElement = this.createTradeElement(trade);
            container.appendChild(tradeElement);
        });
        
        console.log(`💹 Сделки обновлены: ${trades.length} (источник: ${tradesResult.source})`);
    }

    /**
     * 📈 Обновление данных графиков
     */
    updateChartsData(analyticsResult) {
        if (!analyticsResult.success) return;
        
        const analytics = analyticsResult.data;
        
        // Обновляем график производительности
        if (analytics.chart_data && this.charts.performance) {
            this.updatePerformanceChart(analytics.chart_data);
        }
        
        console.log(`📈 Графики обновлены (источник: ${analyticsResult.source})`);
    }

    /**
     * 📈 Инициализация графиков
     */
    initializeCharts() {
        // График производительности
        const performanceCtx = document.getElementById('performanceChart');
        if (performanceCtx) {
            this.charts.performance = new Chart(performanceCtx, {
                type: 'line',
                data: {
                    labels: [],
                    datasets: [{
                        label: 'Прибыль (%)',
                        data: [],
                        borderColor: '#00ff88',
                        backgroundColor: 'rgba(0, 255, 136, 0.1)',
                        tension: 0.4,
                        fill: true
                    }, {
                        label: 'Точность (%)',
                        data: [],
                        borderColor: '#00d4ff',
                        backgroundColor: 'rgba(0, 212, 255, 0.1)',
                        tension: 0.4,
                        fill: false
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        title: {
                            display: true,
                            text: 'Производительность (7 дней)'
                        },
                        legend: {
                            display: true
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            title: {
                                display: true,
                                text: 'Значение'
                            }
                        }
                    },
                    animation: {
                        duration: 1000
                    }
                }
            });
        }
    }

    /**
     * 📊 Обновление графика производительности
     */
    updatePerformanceChart(chartData) {
        if (!this.charts.performance || !chartData) return;
        
        const chart = this.charts.performance;
        
        // Обновляем данные
        chart.data.labels = chartData.labels || [];
        
        if (chartData.data) {
            // Данные прибыли
            const profitData = chartData.data.map(item => item.profit || 0);
            chart.data.datasets[0].data = profitData;
            
            // Данные точности
            const accuracyData = chartData.data.map(item => item.accuracy || 0);
            chart.data.datasets[1].data = accuracyData;
        }
        
        // Обновляем график
        chart.update('active');
    }

    /**
     * 📡 Создание элемента сигнала
     */
    createSignalElement(signal) {
        const div = document.createElement('div');
        div.className = 'signal-item';
        
        const typeClass = signal.type === 'pump' ? 'success' : signal.type === 'dump' ? 'danger' : 'info';
        const timeAgo = this.getTimeAgo(signal.timestamp);
        
        div.innerHTML = `
            <div class="signal-header">
                <span class="signal-pair">${signal.pair}</span>
                <span class="signal-change ${typeClass}">${signal.change}</span>
            </div>
            <div class="signal-meta">
                <span class="signal-time">${timeAgo}</span>
                <span class="signal-quality">${signal.quality || 'medium'}</span>
                <span class="signal-status ${signal.status || 'active'}">${signal.status || 'active'}</span>
            </div>
        `;
        
        return div;
    }

    /**
     * 💹 Создание элемента сделки
     */
    createTradeElement(trade) {
        const div = document.createElement('div');
        div.className = 'trade-item';
        
        const resultClass = trade.result === 'profit' ? 'success' : 'danger';
        const timeAgo = this.getTimeAgo(trade.timestamp);
        
        div.innerHTML = `
            <div class="trade-header">
                <span class="trade-pair">${trade.pair}</span>
                <span class="trade-result ${resultClass}">${trade.amount}</span>
            </div>
            <div class="trade-meta">
                <span class="trade-time">${timeAgo}</span>
                <span class="trade-type">${trade.result}</span>
            </div>
        `;
        
        return div;
    }

    /**
     * 🔗 Обновление статуса подключения
     */
    updateConnectionStatus() {
        const statusElement = document.getElementById('connectionStatus');
        if (!statusElement) return;
        
        if (this.isConnected) {
            statusElement.className = 'connection-status connected';
            statusElement.innerHTML = '🟢 Подключено к боту';
        } else {
            statusElement.className = 'connection-status disconnected';
            statusElement.innerHTML = '🟡 Подключение...';
        }
    }

    /**
     * 🛠️ Вспомогательные методы
     */
    updateElement(id, value) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
        }
    }

    getHeaders() {
        const headers = {
            'Content-Type': 'application/json'
        };
        
        // Добавляем токен авторизации если есть
        const token = localStorage.getItem('auth_token');
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        
        return headers;
    }

    getTimeAgo(timestamp) {
        const now = Date.now();
        const diff = now - (timestamp * 1000);
        const minutes = Math.floor(diff / 60000);
        
        if (minutes < 1) return 'только что';
        if (minutes < 60) return `${minutes}м назад`;
        
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}ч назад`;
        
        const days = Math.floor(hours / 24);
        return `${days}д назад`;
    }

    handleError(error) {
        this.retryCount++;
        
        if (this.retryCount <= this.maxRetries) {
            console.log(`🔄 Повтор попытки ${this.retryCount}/${this.maxRetries}...`);
            setTimeout(() => this.updateAllData(), 5000);
        } else {
            console.error('❌ Превышено максимальное количество попыток');
            this.retryCount = 0;
        }
    }

    /**
     * 📊 Стандартные данные
     */
    getDemoStats() {
        return {
            total_signals: 1247,
            success_rate: 87.3,
            today_signals: 23,
            total_profit: 2450.75,
            active_signals: 12,
            avg_profit: 3.2
        };
    }

    getDemoSignals() {
        return [
            { pair: 'BTC', change: '+8.5%', type: 'pump', timestamp: Date.now()/1000 - 300, quality: 'high', status: 'active' },
            { pair: 'ETH', change: '-6.2%', type: 'dump', timestamp: Date.now()/1000 - 600, quality: 'medium', status: 'active' }
        ];
    }

    getDemoTrades() {
        return [
            { pair: 'BTC', result: 'profit', amount: '+$245.50', timestamp: Date.now()/1000 - 3600 },
            { pair: 'ETH', result: 'loss', amount: '-$89.20', timestamp: Date.now()/1000 - 7200 }
        ];
    }

    getDemoAnalytics() {
        const labels = [];
        const data = [];
        
        for (let i = 0; i < 7; i++) {
            const date = new Date();
            date.setDate(date.getDate() - (6 - i));
            labels.push(date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' }));
            data.push({
                profit: Math.round((i * 2.5 + 5) * (1 + (i % 3 - 1) * 0.2) * 10) / 10,
                accuracy: Math.round(75 + i * 3 + (i % 2) * 5)
            });
        }
        
        return {
            chart_data: { labels, data }
        };
    }

    /**
     * 🛑 Остановка системы
     */
    stop() {
        if (this.updateTimer) {
            clearInterval(this.updateTimer);
            this.updateTimer = null;
        }
        
        console.log('⏹️ Система аналитики остановлена');
    }
}

// Создаем глобальный экземпляр
window.realTimeAnalytics = new RealTimeAnalytics();
