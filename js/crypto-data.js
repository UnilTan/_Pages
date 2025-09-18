/**
 * Модуль для получения реальных данных о криптовалютах
 */

class CryptoDataAPI {
    constructor() {
        this.baseURL = 'https://api.binance.com/api/v3';
        this.symbol = 'BTCUSDT';
        this.previousPrice = null;
        this.priceHistory = [];
        this.updateInterval = null;
    }

    /**
     * Получить текущую цену и 24h статистику
     */
    async getCurrentPrice() {
        try {
            console.log(`🔄 Запрос к Binance API: ${this.baseURL}/ticker/24hr?symbol=${this.symbol}`);
            
            const response = await fetch(`${this.baseURL}/ticker/24hr?symbol=${this.symbol}`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                },
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            
            console.log('📊 Получены данные от Binance:', {
                symbol: data.symbol,
                price: data.lastPrice,
                change: data.priceChangePercent,
                timestamp: new Date().toLocaleTimeString()
            });
            
            const processedData = {
                symbol: data.symbol,
                price: parseFloat(data.lastPrice),
                change24h: parseFloat(data.priceChangePercent),
                changeAmount: parseFloat(data.priceChange),
                volume: parseFloat(data.volume),
                high24h: parseFloat(data.highPrice),
                low24h: parseFloat(data.lowPrice),
                openPrice: parseFloat(data.openPrice),
                count: parseInt(data.count),
                timestamp: Date.now(),
                rawData: data // Сохраняем сырые данные для отладки
            };
            
            return processedData;
            
        } catch (error) {
            console.error('❌ Ошибка при получении цены:', error);
            
            // Возвращаем тестовые данные если API недоступен
            console.warn('⚠️ Используем тестовые данные из-за ошибки API');
            return this.getFallbackData();
        }
    }

    /**
     * Резервные данные если API недоступен
     */
    getFallbackData() {
        // Генерируем реалистичные данные на основе примерной текущей цены BTC
        const basePrice = 63000; // Примерная цена BTC
        const variation = (Math.random() - 0.5) * 2000; // ±1000
        const currentPrice = basePrice + variation;
        const change24h = (Math.random() - 0.5) * 10; // ±5%
        
        return {
            symbol: 'BTCUSDT',
            price: currentPrice,
            change24h: change24h,
            changeAmount: (currentPrice * change24h) / 100,
            volume: 25000 + Math.random() * 10000,
            high24h: currentPrice * 1.05,
            low24h: currentPrice * 0.95,
            openPrice: currentPrice - (currentPrice * change24h) / 100,
            count: 1000000,
            timestamp: Date.now(),
            isFallback: true
        };
    }

    /**
     * Получить исторические данные для расчета индикаторов
     */
    async getKlineData(interval = '1h', limit = 100) {
        try {
            const response = await fetch(`${this.baseURL}/klines?symbol=${this.symbol}&interval=${interval}&limit=${limit}`);
            if (!response.ok) throw new Error('Ошибка загрузки исторических данных');
            
            const data = await response.json();
            return data.map(kline => ({
                openTime: kline[0],
                open: parseFloat(kline[1]),
                high: parseFloat(kline[2]),
                low: parseFloat(kline[3]),
                close: parseFloat(kline[4]),
                volume: parseFloat(kline[5]),
                closeTime: kline[6]
            }));
        } catch (error) {
            console.error('Ошибка при получении исторических данных:', error);
            return [];
        }
    }

    /**
     * Рассчитать RSI (Relative Strength Index)
     */
    calculateRSI(prices, period = 14) {
        if (prices.length < period + 1) return null;

        let gains = [];
        let losses = [];

        // Рассчитываем изменения цен
        for (let i = 1; i < prices.length; i++) {
            const change = prices[i] - prices[i - 1];
            gains.push(change > 0 ? change : 0);
            losses.push(change < 0 ? Math.abs(change) : 0);
        }

        // Средние значения прибылей и убытков
        let avgGain = gains.slice(0, period).reduce((a, b) => a + b) / period;
        let avgLoss = losses.slice(0, period).reduce((a, b) => a + b) / period;

        // Рассчитываем RSI для последних значений
        for (let i = period; i < gains.length; i++) {
            avgGain = (avgGain * (period - 1) + gains[i]) / period;
            avgLoss = (avgLoss * (period - 1) + losses[i]) / period;
        }

        if (avgLoss === 0) return 100;
        const rs = avgGain / avgLoss;
        return 100 - (100 / (1 + rs));
    }

    /**
     * Рассчитать простую скользящую среднюю (SMA)
     */
    calculateSMA(prices, period) {
        if (prices.length < period) return null;
        const sum = prices.slice(-period).reduce((a, b) => a + b);
        return sum / period;
    }

    /**
     * Рассчитать экспоненциальную скользящую среднюю (EMA)
     */
    calculateEMA(prices, period) {
        if (prices.length < period) return null;
        
        const multiplier = 2 / (period + 1);
        let ema = prices.slice(0, period).reduce((a, b) => a + b) / period;
        
        for (let i = period; i < prices.length; i++) {
            ema = (prices[i] * multiplier) + (ema * (1 - multiplier));
        }
        
        return ema;
    }

    /**
     * Рассчитать MACD
     */
    calculateMACD(prices, fastPeriod = 12, slowPeriod = 26, signalPeriod = 9) {
        const fastEMA = this.calculateEMA(prices, fastPeriod);
        const slowEMA = this.calculateEMA(prices, slowPeriod);
        
        if (!fastEMA || !slowEMA) return null;
        
        const macdLine = fastEMA - slowEMA;
        
        // Для упрощения возвращаем только MACD линию
        return {
            macd: macdLine,
            signal: macdLine > 0 ? 'Бычий' : 'Медвежий',
            histogram: macdLine
        };
    }

    /**
     * Определить качество сигнала
     */
    calculateSignalQuality(rsi, macd, volumeRatio) {
        let quality = 50; // Базовое quality

        // RSI анализ
        if (rsi) {
            if (rsi > 70) quality += 10; // Перекупленность может означать сильный тренд
            if (rsi < 30) quality += 10; // Перепроданность может означать отскок
            if (rsi >= 40 && rsi <= 60) quality += 15; // Нейтральная зона - стабильность
        }

        // MACD анализ
        if (macd && macd.macd > 0) quality += 15;

        // Объем
        if (volumeRatio > 1.5) quality += 10; // Высокий объем

        return Math.min(Math.max(quality, 0), 100);
    }

    /**
     * Рассчитать цели и стоп-лосс
     */
    calculateTargets(currentPrice, change24h, signalQuality) {
        const baseMultiplier = signalQuality / 100;
        const volatilityFactor = Math.abs(change24h) / 100;
        
        // Цели (более консервативные для реальных данных)
        const target1 = currentPrice * (1 + (0.02 + volatilityFactor) * baseMultiplier);
        const target2 = currentPrice * (1 + (0.04 + volatilityFactor * 1.5) * baseMultiplier);
        const target3 = currentPrice * (1 + (0.06 + volatilityFactor * 2) * baseMultiplier);
        
        // Стоп-лосс
        const stopLoss = currentPrice * (1 - (0.03 + volatilityFactor * 0.5));
        
        return {
            targets: [target1, target2, target3],
            stopLoss: stopLoss
        };
    }

    /**
     * Получить полные данные для карточки
     */
    async getFullData() {
        try {
            // Получаем текущие данные
            const currentData = await this.getCurrentPrice();
            if (!currentData) return null;

            // Получаем исторические данные
            const klineData = await this.getKlineData('1h', 100);
            if (klineData.length === 0) return null;

            // Извлекаем цены закрытия для расчетов
            const closePrices = klineData.map(k => k.close);
            
            // Рассчитываем индикаторы
            const rsi = this.calculateRSI(closePrices);
            const macd = this.calculateMACD(closePrices);
            
            // Рассчитываем качество сигнала
            const volumeRatio = currentData.volume / (klineData[0].volume || 1);
            const signalQuality = this.calculateSignalQuality(rsi, macd, volumeRatio);
            
            // Рассчитываем цели
            const targets = this.calculateTargets(currentData.price, currentData.change24h, signalQuality);
            
            // Сохраняем предыдущую цену для анимации
            this.previousPrice = this.previousPrice || currentData.openPrice;
            
            return {
                symbol: currentData.symbol,
                currentPrice: currentData.price,
                previousPrice: this.previousPrice,
                change24h: currentData.change24h,
                rsi: rsi,
                macd: macd,
                signalQuality: signalQuality,
                targets: targets,
                volume: currentData.volume,
                timestamp: Date.now()
            };
            
        } catch (error) {
            console.error('Ошибка при получении полных данных:', error);
            return null;
        }
    }

    /**
     * Запустить автоматическое обновление
     */
    startRealTimeUpdates(callback, interval = 30000) {
        // Первое обновление сразу
        this.updateData(callback);
        
        // Затем каждые interval миллисекунд
        this.updateInterval = setInterval(() => {
            this.updateData(callback);
        }, interval);
        
        console.log(`🔄 Запущено автоматическое обновление каждые ${interval/1000} секунд`);
    }

    /**
     * Остановить автоматическое обновление
     */
    stopRealTimeUpdates() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
            console.log('⏹️ Автоматическое обновление остановлено');
        }
    }

    /**
     * Обновить данные
     */
    async updateData(callback) {
        const data = await this.getFullData();
        if (data && callback) {
            // Обновляем предыдущую цену для следующего обновления
            this.previousPrice = data.currentPrice;
            callback(data);
        }
    }
}

// Экспортируем класс для использования в других файлах
window.CryptoDataAPI = CryptoDataAPI;
