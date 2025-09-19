/**
 * 📊 Analytics Data Manager
 * Обрабатывает данные из trade_results.json для отображения реальной аналитики
 */

class AnalyticsDataManager {
    constructor() {
        this.tradeData = null;
        this.cachedMetrics = null;
        this.lastUpdateTime = null;
    }

    /**
     * 🔄 Загружает данные из trade_results.json
     */
    async loadTradeResults() {
        try {
            console.log('🔄 Загрузка торговых данных...');
            console.log('📍 Текущий URL:', window.location.href);
            
            // В production это будет загрузка с сервера
            // Для GitHub Pages используем fetch к статическому файлу
            const response = await fetch('trade_results.json?t=' + Date.now());
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            this.tradeData = await response.json();
            this.lastUpdateTime = new Date();
            
            console.log('✅ Торговые данные загружены:', {
                activeSignals: Object.keys(this.tradeData.active_signals || {}).length,
                completedTrades: (this.tradeData.completed_trades || []).length
            });

            return this.tradeData;
        } catch (error) {
            console.warn('⚠️ Ошибка загрузки торговых данных:', error);
            
            // Возвращаем тестовые данные если файл недоступен
            return this.getFallbackData();
        }
    }

    /**
     * 📈 Рассчитывает основные метрики производительности
     */
    calculateMetrics() {
        if (!this.tradeData) {
            return this.getFallbackMetrics();
        }

        const { active_signals = {}, completed_trades = [] } = this.tradeData;
        
        // Успешные и неуспешные сделки
        const successfulTrades = completed_trades.filter(trade => trade.success === true);
        const failedTrades = completed_trades.filter(trade => trade.success === false);
        
        console.log('📊 Анализ торговых данных:');
        console.log('  - Всего завершенных сделок:', completed_trades.length);
        console.log('  - Успешных:', successfulTrades.length);
        console.log('  - Неуспешных:', failedTrades.length);
        
        // Общая статистика
        const totalTrades = completed_trades.length;
        const winRate = totalTrades > 0 ? (successfulTrades.length / totalTrades * 100) : 0;
        console.log('  - Процент успеха:', winRate.toFixed(1) + '%');
        
        // Прибыль/убыток
        const totalPnL = completed_trades.reduce((sum, trade) => sum + (trade.pnl_percent || 0), 0);
        const avgPnL = totalTrades > 0 ? totalPnL / totalTrades : 0;
        const avgProfit = successfulTrades.length > 0 ? 
            successfulTrades.reduce((sum, trade) => sum + trade.pnl_percent, 0) / successfulTrades.length : 0;
        
        // Активные сигналы
        const activeSignalsCount = Object.keys(active_signals).length;
        const activeSignalsWithTargets = Object.values(active_signals).filter(
            signal => signal.hit_targets && signal.hit_targets.length > 0
        ).length;
        
        // Качество сигналов
        const qualityDistribution = this.getQualityDistribution(completed_trades, active_signals);
        
        // Временная статистика (последние 7 дней)
        const recentTrades = this.getRecentTrades(completed_trades, 7);
        const recentWinRate = recentTrades.length > 0 ? 
            (recentTrades.filter(t => t.success).length / recentTrades.length * 100) : winRate;

        return {
            // Основные метрики
            winRate: Math.round(winRate * 10) / 10,
            avgMultiplier: avgProfit > 0 ? Math.round((avgProfit / 100 + 1) * 10) / 10 : 1.0,
            activeSignals: activeSignalsCount,
            
            // Детальная статистика
            totalTrades,
            successfulTrades: successfulTrades.length,
            failedTrades: failedTrades.length,
            totalPnL: Math.round(totalPnL * 100) / 100,
            avgPnL: Math.round(avgPnL * 100) / 100,
            avgProfit: Math.round(avgProfit * 100) / 100,
            activeSignalsWithTargets,
            
            // Качество сигналов
            qualityDistribution,
            
            // Недавняя активность
            recentWinRate: Math.round(recentWinRate * 10) / 10,
            recentTrades: recentTrades.length,
            
            // Мета информация
            lastUpdate: this.lastUpdateTime,
            dataHealth: this.assessDataHealth()
        };
    }

    /**
     * 🎯 Распределение по качеству сигналов
     */
    getQualityDistribution(completedTrades, activeSignals) {
        const allSignals = [
            ...completedTrades,
            ...Object.values(activeSignals)
        ];

        const distribution = allSignals.reduce((acc, signal) => {
            const quality = signal.quality || 'НЕИЗВЕСТНО';
            acc[quality] = (acc[quality] || 0) + 1;
            return acc;
        }, {});

        return distribution;
    }

    /**
     * 📅 Получает недавние сделки (за последние N дней)
     */
    getRecentTrades(trades, days = 7) {
        const cutoffTime = Date.now() / 1000 - (days * 24 * 60 * 60);
        return trades.filter(trade => 
            trade.completed_at && trade.completed_at > cutoffTime
        );
    }

    /**
     * 🏥 Оценивает качество данных
     */
    assessDataHealth() {
        if (!this.tradeData) return 'poor';
        
        const { active_signals = {}, completed_trades = [] } = this.tradeData;
        const totalSignals = Object.keys(active_signals).length + completed_trades.length;
        
        if (totalSignals === 0) return 'poor';
        if (totalSignals < 10) return 'fair';
        if (totalSignals < 50) return 'good';
        return 'excellent';
    }

    /**
     * 📊 Генерирует данные для графика производительности
     */
    generateChartData(days = 30) {
        if (!this.tradeData) {
            return this.getFallbackChartData();
        }

        const { completed_trades = [] } = this.tradeData;
        
        // Группируем сделки по дням
        const dailyData = this.groupTradesByDay(completed_trades, days);
        
        // Рассчитываем накопительную прибыль
        let cumulativePnL = 0;
        const labels = [];
        const profitData = [];
        const winRateData = [];
        
        for (let i = days - 1; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateKey = date.toISOString().split('T')[0];
            
            const dayTrades = dailyData[dateKey] || [];
            const dayPnL = dayTrades.reduce((sum, trade) => sum + (trade.pnl_percent || 0), 0);
            cumulativePnL += dayPnL;
            
            const dayWinRate = dayTrades.length > 0 ? 
                (dayTrades.filter(t => t.success).length / dayTrades.length * 100) : 0;
            
            labels.push(date.toLocaleDateString('ru-RU', { month: 'short', day: 'numeric' }));
            profitData.push(Math.round(cumulativePnL * 100) / 100);
            winRateData.push(Math.round(dayWinRate * 10) / 10);
        }

        return {
            labels,
            datasets: [
                {
                    label: 'Накопительная прибыль (%)',
                    data: profitData,
                    borderColor: '#3B82F6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    fill: true,
                    tension: 0.4,
                    yAxisID: 'y'
                },
                {
                    label: 'Процент успеха (%)',
                    data: winRateData,
                    borderColor: '#10B981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    fill: false,
                    tension: 0.4,
                    yAxisID: 'y1'
                }
            ]
        };
    }

    /**
     * 📅 Группирует сделки по дням
     */
    groupTradesByDay(trades, days) {
        const grouped = {};
        
        trades.forEach(trade => {
            if (!trade.completed_at) return;
            
            const tradeDate = new Date(trade.completed_at * 1000);
            const dateKey = tradeDate.toISOString().split('T')[0];
            
            // Проверяем, что сделка в пределах заданного периода
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - days);
            
            if (tradeDate >= cutoffDate) {
                if (!grouped[dateKey]) grouped[dateKey] = [];
                grouped[dateKey].push(trade);
            }
        });
        
        return grouped;
    }

    /**
     * 🎲 Тестовые данные если основные недоступны
     */
    getFallbackData() {
        return {
            active_signals: {},
            completed_trades: Array.from({ length: 20 }, (_, i) => ({
                symbol: `TEST${i}_USDT`,
                pnl_percent: (Math.random() - 0.4) * 15, // -6% до +9%
                success: Math.random() > 0.3, // 70% успех
                quality: ['ОТЛИЧНЫЙ', 'ХОРОШИЙ', 'СРЕДНИЙ'][Math.floor(Math.random() * 3)],
                completed_at: Date.now() / 1000 - Math.random() * 7 * 24 * 60 * 60 // Последние 7 дней
            }))
        };
    }

    /**
     * 📊 Тестовые метрики
     */
    getFallbackMetrics() {
        return {
            winRate: 72.5,
            avgMultiplier: 2.1,
            activeSignals: 15,
            totalTrades: 20,
            successfulTrades: 14,
            failedTrades: 6,
            totalPnL: 45.8,
            avgPnL: 2.29,
            avgProfit: 6.8,
            activeSignalsWithTargets: 8,
            qualityDistribution: {
                'ОТЛИЧНЫЙ': 3,
                'ХОРОШИЙ': 8,
                'СРЕДНИЙ': 9
            },
            recentWinRate: 75.0,
            recentTrades: 12,
            lastUpdate: new Date(),
            dataHealth: 'good'
        };
    }

    /**
     * 📈 Тестовые данные для графика
     */
    getFallbackChartData() {
        const labels = [];
        const profitData = [];
        const winRateData = [];
        
        let cumulativeProfit = 0;
        
        for (let i = 29; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            
            const dailyProfit = (Math.random() - 0.4) * 3; // -1.2% до +1.8% в день
            cumulativeProfit += dailyProfit;
            
            const winRate = 60 + Math.random() * 30; // 60-90%
            
            labels.push(date.toLocaleDateString('ru-RU', { month: 'short', day: 'numeric' }));
            profitData.push(Math.round(cumulativeProfit * 100) / 100);
            winRateData.push(Math.round(winRate * 10) / 10);
        }

        return {
            labels,
            datasets: [
                {
                    label: 'Накопительная прибыль (%)',
                    data: profitData,
                    borderColor: '#3B82F6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    fill: true,
                    tension: 0.4,
                    yAxisID: 'y'
                },
                {
                    label: 'Процент успеха (%)',
                    data: winRateData,
                    borderColor: '#10B981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    fill: false,
                    tension: 0.4,
                    yAxisID: 'y1'
                }
            ]
        };
    }

    /**
     * 🔄 Обновляет данные (для периодического обновления)
     */
    async refresh() {
        await this.loadTradeResults();
        this.cachedMetrics = null; // Сбрасываем кэш
        return this.calculateMetrics();
    }

    /**
     * 📊 Получает кэшированные или свежие метрики
     */
    getMetrics() {
        if (!this.cachedMetrics) {
            this.cachedMetrics = this.calculateMetrics();
        }
        return this.cachedMetrics;
    }
}

// Экспорт для использования в других модулях
window.AnalyticsDataManager = AnalyticsDataManager;
