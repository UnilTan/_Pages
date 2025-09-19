/**
 * Модуль для обновления торговой карточки реальными данными
 */

class TradingCardUpdater {
    constructor() {
        this.cryptoAPI = new CryptoDataAPI();
        this.cardElement = null;
        this.isAnimating = false;
        this.lastUpdate = null;
    }

    /**
     * Инициализация обновлятора
     */
    init() {
        this.cardElement = document.querySelector('.trading-card');
        if (!this.cardElement) {
            console.warn('Торговая карточка не найдена');
            return false;
        }

        // Запускаем получение реальных данных
        this.startUpdates();
        return true;
    }

    /**
     * Запуск обновлений
     */
    startUpdates() {
        console.log('🚀 Запуск обновления торговой карточки реальными данными...');
        
        this.cryptoAPI.startRealTimeUpdates((data) => {
            this.updateCard(data);
        }, 10000); // Обновляем каждые 10 секунд для более актуальных данных
    }

    /**
     * Остановка обновлений
     */
    stopUpdates() {
        this.cryptoAPI.stopRealTimeUpdates();
    }

    /**
     * Обновление карточки данными
     */
    updateCard(data) {
        if (!data || !this.cardElement) return;

        console.log('📊 Обновление данных:', {
            symbol: data.symbol,
            price: data.price,
            change24h: data.change24h,
            isFallback: data.isFallback,
            timestamp: new Date(data.timestamp).toLocaleTimeString()
        });

        try {
            // Обновляем заголовок с процентным изменением
            this.updateHeader(data);
            
            // Обновляем цены
            this.updatePrices(data);
            
            // Обновляем технические индикаторы
            this.updateTechnicalIndicators(data);
            
            // Обновляем цели и стоп-лосс
            this.updateTargets(data);
            
            // Добавляем анимацию обновления
            this.addUpdateAnimation();
            
            // Обновляем индикатор времени
            this.addUpdateIndicator(data);
            
            this.lastUpdate = Date.now();
            
        } catch (error) {
            console.error('Ошибка при обновлении карточки:', error);
        }
    }

    /**
     * Обновление заголовка
     */
    updateHeader(data) {
        const signalBadge = this.cardElement.querySelector('.signal-badge');
        const coinName = this.cardElement.querySelector('.coin-name');
        
        if (signalBadge) {
            const changePercent = data.change24h.toFixed(2);
            const isPositive = data.change24h > 0;
            
            signalBadge.textContent = `${isPositive ? '📈' : '📉'} ${isPositive ? 'PUMP' : 'DUMP'}: ${isPositive ? '+' : ''}${changePercent}%`;
            
            // Обновляем стиль в зависимости от изменения
            signalBadge.className = `signal-badge ${isPositive ? 'pump' : 'dump'}`;
            
            if (!isPositive) {
                signalBadge.style.backgroundColor = 'rgba(255, 107, 107, 0.2)';
                signalBadge.style.color = '#FF6B6B';
                signalBadge.style.borderColor = '#FF6B6B';
            }
        }
        
        if (coinName) {
            coinName.textContent = data.symbol.replace('USDT', '_USDT');
        }
    }

    /**
     * Обновление цен
     */
    updatePrices(data) {
        const priceOld = this.cardElement.querySelector('.price-old');
        const priceCurrent = this.cardElement.querySelector('.price-current');
        
        if (priceOld && priceCurrent) {
            const oldPrice = data.previousPrice || (data.currentPrice * 0.98);
            const currentPrice = data.currentPrice;
            
            priceOld.textContent = `$${this.formatPrice(oldPrice)}`;
            priceCurrent.textContent = `$${this.formatPrice(currentPrice)}`;
            
            // Анимация изменения цены
            this.animatePriceChange(priceCurrent, data.change24h > 0);
        }
    }

    /**
     * Обновление технических индикаторов
     */
    updateTechnicalIndicators(data) {
        const indicators = this.cardElement.querySelectorAll('.indicator');
        
        indicators.forEach(indicator => {
            const label = indicator.querySelector('.label');
            const value = indicator.querySelector('.value');
            
            if (!label || !value) return;
            
            const labelText = label.textContent.toLowerCase();
            
            if (labelText.includes('rsi')) {
                if (data.rsi !== null) {
                    const rsiValue = data.rsi.toFixed(1);
                    let status = '🟡 Нейтрально';
                    let colorClass = '';
                    
                    if (data.rsi > 70) {
                        status = '🔴 Перекуплено';
                        colorClass = 'red';
                    } else if (data.rsi < 30) {
                        status = '🟢 Перепродано';
                        colorClass = 'green';
                    }
                    
                    value.textContent = `${rsiValue} ${status}`;
                    value.className = `value ${colorClass}`;
                }
            } else if (labelText.includes('macd')) {
                if (data.macd) {
                    const signal = data.macd.signal;
                    const icon = signal === 'Бычий' ? '📈' : '📉';
                    value.textContent = `${icon} ${signal}`;
                    value.className = `value ${signal === 'Бычий' ? 'green' : 'red'}`;
                }
            } else if (labelText.includes('качество')) {
                const quality = Math.round(data.signalQuality);
                let qualityText = 'НИЗКИЙ';
                let colorClass = 'red';
                
                if (quality >= 80) {
                    qualityText = 'ВЫСОКИЙ';
                    colorClass = 'green';
                } else if (quality >= 60) {
                    qualityText = 'СРЕДНИЙ';
                    colorClass = 'yellow';
                }
                
                value.textContent = `${qualityText} (${quality}%)`;
                value.className = `value ${colorClass}`;
            }
        });
    }

    /**
     * Обновление целей и стоп-лосса
     */
    updateTargets(data) {
        const targetItems = this.cardElement.querySelectorAll('.target-item');
        
        targetItems.forEach((item, index) => {
            const text = item.textContent.toLowerCase();
            
            if (text.includes('цели') && data.targets && data.targets.targets) {
                const targets = data.targets.targets;
                const targetsText = targets.map(t => `$${this.formatPrice(t)}`).join(' | ');
                item.textContent = `🎯 Цели: ${targetsText}`;
            } else if (text.includes('стоп') && data.targets && data.targets.stopLoss) {
                const stopLoss = data.targets.stopLoss;
                item.textContent = `🛡 Стоп: $${this.formatPrice(stopLoss)}`;
            }
        });
    }

    /**
     * Анимация изменения цены
     */
    animatePriceChange(element, isPositive) {
        if (this.isAnimating) return;
        
        this.isAnimating = true;
        const originalColor = element.style.color;
        const flashColor = isPositive ? '#4ECDC4' : '#FF6B6B';
        
        // Флэш эффект
        element.style.transition = 'color 0.3s ease';
        element.style.color = flashColor;
        
        setTimeout(() => {
            element.style.color = originalColor;
            this.isAnimating = false;
        }, 300);
    }

    /**
     * Анимация обновления карточки
     */
    addUpdateAnimation() {
        if (!this.cardElement) return;
        
        this.cardElement.style.transition = 'transform 0.2s ease, box-shadow 0.2s ease';
        this.cardElement.style.transform = 'scale(1.02)';
        this.cardElement.style.boxShadow = '0 10px 30px rgba(0, 212, 255, 0.3)';
        
        setTimeout(() => {
            this.cardElement.style.transform = 'scale(1)';
            this.cardElement.style.boxShadow = '';
        }, 200);
    }

    /**
     * Форматирование цены
     */
    formatPrice(price) {
        if (price >= 1000) {
            return price.toLocaleString('en-US', {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
            });
        } else if (price >= 1) {
            return price.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            });
        } else {
            return price.toLocaleString('en-US', {
                minimumFractionDigits: 4,
                maximumFractionDigits: 6
            });
        }
    }

    /**
     * Добавить индикатор последнего обновления
     */
    addUpdateIndicator(data) {
        let indicator = this.cardElement.querySelector('.last-update');
        
        if (!indicator) {
            indicator = document.createElement('div');
            indicator.className = 'last-update';
            indicator.style.cssText = `
                position: absolute;
                bottom: 8px;
                right: 8px;
                font-size: 8px;
                color: #666;
                background: rgba(255, 255, 255, 0.7);
                padding: 2px 6px;
                border-radius: 8px;
                font-weight: 500;
                z-index: 5;
                transition: all 0.3s ease;
                border: 1px solid rgba(0, 0, 0, 0.05);
                backdrop-filter: blur(4px);
                max-width: 60px;
                text-align: center;
            `;
            this.cardElement.appendChild(indicator);
        }
        
        const now = new Date();
        const source = data && data.isFallback ? '⚠️ Тест' : '🟢 Binance';
        indicator.innerHTML = `${source}<br><small>${now.toLocaleTimeString()}</small>`;
        
        // Анимация индикатора
        const isRealData = data && !data.isFallback;
        indicator.style.backgroundColor = isRealData ? 'rgba(76, 205, 196, 0.8)' : 'rgba(255, 193, 7, 0.8)';
        indicator.style.color = 'white';
        indicator.style.borderColor = isRealData ? '#4ECDC4' : '#FFC107';
        
        setTimeout(() => {
            indicator.style.backgroundColor = 'rgba(255, 255, 255, 0.7)';
            indicator.style.color = '#666';
            indicator.style.borderColor = 'rgba(0, 0, 0, 0.05)';
        }, 2000);
    }
}

// Экспортируем класс
window.TradingCardUpdater = TradingCardUpdater;
