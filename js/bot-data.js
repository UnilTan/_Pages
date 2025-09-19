/**
 * Модуль для получения данных от торгового бота
 */

class BotDataAPI {
    constructor() {
        this.botAPI = 'http://localhost:8000/api';
        this.websiteAPI = 'http://localhost:5000/api';
        this.updateInterval = null;
        this.callbacks = {
            signals: [],
            trades: [],
            analytics: [],
            hotCoins: []
        };
    }

    /**
     * Получение активных сигналов от бота
     */
    async getSignals() {
        try {
            // Пробуем получить данные напрямую от бота
            let response = await fetch(`${this.botAPI}/signals`);
            
            if (!response.ok) {
                // Если бот недоступен, пробуем через website API
                response = await fetch(`${this.websiteAPI}/bot/signals`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('auth_token') || 'demo'}`
                    }
                });
            }
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            
            console.log('📊 Получены сигналы от бота:', data);
            
            return {
                success: true,
                data: data.signals || data.data?.signals || [],
                demo: data.demo || false
            };
            
        } catch (error) {
            console.error('❌ Ошибка получения сигналов:', error);
            
            // Возвращаем стандартные данные в случае ошибки
            return {
                success: false,
                data: this.getDemoSignals(),
                demo: true,
                error: error.message
            };
        }
    }

    /**
     * Получение истории сделок от бота
     */
    async getTrades() {
        try {
            let response = await fetch(`${this.botAPI}/trades`);
            
            if (!response.ok) {
                response = await fetch(`${this.websiteAPI}/bot/trades`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('auth_token') || 'demo'}`
                    }
                });
            }
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            
            console.log('📈 Получены сделки от бота:', data);
            
            return {
                success: true,
                data: data.trades || data.data?.trades || [],
                demo: data.demo || false
            };
            
        } catch (error) {
            console.error('❌ Ошибка получения сделок:', error);
            
            return {
                success: false,
                data: this.getDemoTrades(),
                demo: true,
                error: error.message
            };
        }
    }

    /**
     * Получение горячих монет от бота
     */
    async getHotCoins() {
        try {
            let response = await fetch(`${this.botAPI}/hot-coins`);
            
            if (!response.ok) {
                response = await fetch(`${this.websiteAPI}/bot/hot-coins`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('auth_token') || 'demo'}`
                    }
                });
            }
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            
            console.log('🔥 Получены горячие монеты от бота:', data);
            
            return {
                success: true,
                data: data.coins || data.data?.coins || [],
                demo: data.demo || false
            };
            
        } catch (error) {
            console.error('❌ Ошибка получения горячих монет:', error);
            
            return {
                success: false,
                data: this.getDemoHotCoins(),
                demo: true,
                error: error.message
            };
        }
    }

    /**
     * Получение аналитических данных от бота
     */
    async getAnalytics() {
        try {
            let response = await fetch(`${this.botAPI}/analytics`);
            
            if (!response.ok) {
                response = await fetch(`${this.websiteAPI}/bot/analytics`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('auth_token') || 'demo'}`
                    }
                });
            }
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            
            console.log('📊 Получена аналитика от бота:', data);
            
            return {
                success: true,
                data: data.data || data,
                demo: data.demo || false
            };
            
        } catch (error) {
            console.error('❌ Ошибка получения аналитики:', error);
            
            return {
                success: false,
                data: this.getDemoAnalytics(),
                demo: true,
                error: error.message
            };
        }
    }

    /**
     * Получение статистики от бота
     */
    async getStats() {
        try {
            let response = await fetch(`${this.botAPI}/stats`);
            
            if (!response.ok) {
                response = await fetch(`${this.websiteAPI}/dashboard/stats`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('auth_token') || 'demo'}`
                    }
                });
            }
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            
            console.log('📈 Получена статистика от бота:', data);
            
            return {
                success: true,
                data: data.data || data,
                demo: data.demo || false
            };
            
        } catch (error) {
            console.error('❌ Ошибка получения статистики:', error);
            
            return {
                success: false,
                data: this.getDemoStats(),
                demo: true,
                error: error.message
            };
        }
    }

    /**
     * Запуск автоматических обновлений
     */
    startRealTimeUpdates(interval = 30000) {
        console.log('🚀 Запуск автоматических обновлений данных бота...');
        
        // Первое обновление сразу
        this.updateAllData();
        
        // Периодические обновления
        this.updateInterval = setInterval(() => {
            this.updateAllData();
        }, interval);
    }

    /**
     * Остановка автоматических обновлений
     */
    stopRealTimeUpdates() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
            console.log('⏹️ Автоматические обновления остановлены');
        }
    }

    /**
     * Обновление всех данных
     */
    async updateAllData() {
        try {
            console.log('🔄 Обновление всех данных от бота...');
            
            // Получаем все данные параллельно
            const [signals, trades, hotCoins, analytics, stats] = await Promise.all([
                this.getSignals(),
                this.getTrades(), 
                this.getHotCoins(),
                this.getAnalytics(),
                this.getStats()
            ]);

            // Вызываем колбэки для обновления UI
            this.callbacks.signals.forEach(callback => callback(signals));
            this.callbacks.trades.forEach(callback => callback(trades));
            this.callbacks.hotCoins.forEach(callback => callback(hotCoins));
            this.callbacks.analytics.forEach(callback => callback(analytics));
            this.callbacks.stats.forEach(callback => callback(stats));
            
            console.log('✅ Все данные обновлены');
            
        } catch (error) {
            console.error('❌ Ошибка обновления данных:', error);
        }
    }

    /**
     * Подписка на обновления сигналов
     */
    onSignalsUpdate(callback) {
        this.callbacks.signals.push(callback);
    }

    /**
     * Подписка на обновления сделок
     */
    onTradesUpdate(callback) {
        this.callbacks.trades.push(callback);
    }

    /**
     * Подписка на обновления горячих монет
     */
    onHotCoinsUpdate(callback) {
        this.callbacks.hotCoins.push(callback);
    }

    /**
     * Подписка на обновления аналитики
     */
    onAnalyticsUpdate(callback) {
        this.callbacks.analytics.push(callback);
    }

    /**
     * Подписка на обновления статистики
     */
    onStatsUpdate(callback) {
        this.callbacks.stats.push(callback);
    }

    // Стандартные данные для fallback
    getDemoSignals() {
        return [
            {
                pair: 'BTC',
                change: '+8.5%',
                type: 'pump',
                timestamp: Date.now() - 300000,
                quality: 'high',
                status: 'active'
            },
            {
                pair: 'ETH',
                change: '-6.2%',
                type: 'dump',
                timestamp: Date.now() - 600000,
                quality: 'medium',
                status: 'active'
            }
        ];
    }

    getDemoTrades() {
        return [
            {
                pair: 'BTC',
                result: 'profit',
                amount: '+$245.50',
                timestamp: Date.now() - 3600000
            },
            {
                pair: 'ETH',
                result: 'loss',
                amount: '-$89.20',
                timestamp: Date.now() - 7200000
            }
        ];
    }

    getDemoHotCoins() {
        return [
            { symbol: 'DOGE', change: '+15.8%' },
            { symbol: 'SHIB', change: '+12.4%' },
            { symbol: 'PEPE', change: '+9.7%' },
            { symbol: 'FLOKI', change: '+8.2%' }
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
            total_signals: 1247,
            success_rate: 87.3,
            today_signals: 23,
            chart_data: {
                labels: labels,
                data: data
            }
        };
    }

    getDemoStats() {
        return {
            total_signals: 1247,
            success_rate: 87.3,
            today_signals: 23,
            total_profit: 2450.75,
            active_signals: 12,
            avg_profit: 3.2,
            win_count: 1089,
            loss_count: 158
        };
    }
}

// Создаем глобальный экземпляр
window.botDataAPI = new BotDataAPI();
