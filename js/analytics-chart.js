/**
 * 📊 Analytics Chart Manager
 * Управляет графиком производительности в разделе аналитики
 */

class AnalyticsChartManager {
    constructor() {
        this.chart = null;
        this.chartCanvas = null;
        this.dataManager = null;
    }

    /**
     * 🎨 Инициализирует график производительности
     */
    async initializeChart() {
        try {
            this.chartCanvas = document.getElementById('performanceChart');
            if (!this.chartCanvas) {
                console.warn('⚠️ Canvas для графика аналитики не найден');
                return;
            }

            // Инициализируем менеджер данных
            this.dataManager = new AnalyticsDataManager();
            await this.dataManager.loadTradeResults();

            // Создаем график
            await this.createChart();
            
            console.log('✅ График аналитики инициализирован');
        } catch (error) {
            console.error('❌ Ошибка инициализации графика аналитики:', error);
            this.createFallbackChart();
        }
    }

    /**
     * 📈 Создает основной график
     */
    async createChart() {
        const chartData = this.dataManager.generateChartData(30);
        
        const ctx = this.chartCanvas.getContext('2d');
        
        // Уничтожаем существующий график если есть
        if (this.chart) {
            this.chart.destroy();
        }

        this.chart = new Chart(ctx, {
            type: 'line',
            data: chartData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    mode: 'index',
                    intersect: false,
                },
                plugins: {
                    title: {
                        display: true,
                        text: 'Производительность торговых сигналов (30 дней)',
                        font: {
                            size: 16,
                            weight: '600'
                        },
                        color: '#1f2937'
                    },
                    legend: {
                        position: 'top',
                        labels: {
                            usePointStyle: true,
                            padding: 20,
                            font: {
                                size: 12
                            }
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        titleColor: '#1f2937',
                        bodyColor: '#374151',
                        borderColor: '#e5e7eb',
                        borderWidth: 1,
                        cornerRadius: 8,
                        displayColors: true,
                        callbacks: {
                            title: function(context) {
                                return `📅 ${context[0].label}`;
                            },
                            label: function(context) {
                                const label = context.dataset.label;
                                const value = context.parsed.y;
                                
                                if (label.includes('прибыль')) {
                                    return `💰 ${label}: ${value > 0 ? '+' : ''}${value}%`;
                                } else {
                                    return `🎯 ${label}: ${value}%`;
                                }
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        display: true,
                        title: {
                            display: true,
                            text: 'Дата',
                            font: {
                                weight: '600'
                            }
                        },
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        }
                    },
                    y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        title: {
                            display: true,
                            text: 'Накопительная прибыль (%)',
                            color: '#3B82F6',
                            font: {
                                weight: '600'
                            }
                        },
                        grid: {
                            color: 'rgba(59, 130, 246, 0.1)'
                        },
                        ticks: {
                            callback: function(value) {
                                return value > 0 ? `+${value}%` : `${value}%`;
                            }
                        }
                    },
                    y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        title: {
                            display: true,
                            text: 'Процент успеха (%)',
                            color: '#10B981',
                            font: {
                                weight: '600'
                            }
                        },
                        grid: {
                            drawOnChartArea: false,
                            color: 'rgba(16, 185, 129, 0.1)'
                        },
                        min: 0,
                        max: 100,
                        ticks: {
                            callback: function(value) {
                                return `${value}%`;
                            }
                        }
                    }
                },
                animation: {
                    duration: 2000,
                    easing: 'easeInOutQuart'
                },
                elements: {
                    point: {
                        radius: 4,
                        hoverRadius: 8,
                        borderWidth: 2,
                        hoverBorderWidth: 3
                    },
                    line: {
                        borderWidth: 3,
                        tension: 0.4
                    }
                }
            }
        });

        // Добавляем анимацию появления
        this.animateChartAppearance();
    }

    /**
     * 🎭 Создает запасной график с тестовыми данными
     */
    createFallbackChart() {
        if (!this.chartCanvas) return;

        const ctx = this.chartCanvas.getContext('2d');
        
        // Генерируем тестовые данные
        const labels = [];
        const profitData = [];
        const winRateData = [];
        
        let cumulativeProfit = 0;
        
        for (let i = 29; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            
            const dailyProfit = (Math.random() - 0.3) * 2; // Преимущественно положительный тренд
            cumulativeProfit += dailyProfit;
            
            const winRate = 65 + Math.random() * 25; // 65-90%
            
            labels.push(date.toLocaleDateString('ru-RU', { month: 'short', day: 'numeric' }));
            profitData.push(Math.round(cumulativeProfit * 100) / 100);
            winRateData.push(Math.round(winRate * 10) / 10);
        }

        this.chart = new Chart(ctx, {
            type: 'line',
            data: {
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
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Производительность торговых сигналов',
                        font: { size: 16, weight: '600' },
                        color: '#1f2937'
                    },
                    legend: {
                        position: 'top'
                    }
                },
                scales: {
                    y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        title: {
                            display: true,
                            text: 'Прибыль (%)',
                            color: '#3B82F6'
                        }
                    },
                    y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        title: {
                            display: true,
                            text: 'Успех (%)',
                            color: '#10B981'
                        },
                        grid: {
                            drawOnChartArea: false
                        },
                        min: 0,
                        max: 100
                    }
                }
            }
        });
    }

    /**
     * 🎬 Анимация появления графика
     */
    animateChartAppearance() {
        if (!this.chartCanvas) return;

        // Добавляем CSS класс для анимации
        this.chartCanvas.style.opacity = '0';
        this.chartCanvas.style.transform = 'translateY(20px)';
        this.chartCanvas.style.transition = 'opacity 0.8s ease, transform 0.8s ease';

        // Запускаем анимацию после небольшой задержки
        setTimeout(() => {
            this.chartCanvas.style.opacity = '1';
            this.chartCanvas.style.transform = 'translateY(0)';
        }, 300);
    }

    /**
     * 🔄 Обновляет график новыми данными
     */
    async updateChart() {
        if (!this.chart || !this.dataManager) return;

        try {
            // Обновляем данные
            await this.dataManager.refresh();
            const newChartData = this.dataManager.generateChartData(30);
            
            // Обновляем график
            this.chart.data = newChartData;
            this.chart.update('active');
            
            console.log('✅ График аналитики обновлен');
        } catch (error) {
            console.error('❌ Ошибка обновления графика:', error);
        }
    }

    /**
     * 🎨 Изменяет тему графика
     */
    updateTheme(isDark = false) {
        if (!this.chart) return;

        const textColor = isDark ? '#f3f4f6' : '#1f2937';
        const gridColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)';

        this.chart.options.plugins.title.color = textColor;
        this.chart.options.scales.x.title.color = textColor;
        this.chart.options.scales.x.grid.color = gridColor;
        this.chart.options.scales.y.grid.color = gridColor;
        this.chart.options.scales.y1.grid.color = gridColor;

        this.chart.update();
    }

    /**
     * 🗑️ Уничтожает график
     */
    destroy() {
        if (this.chart) {
            this.chart.destroy();
            this.chart = null;
        }
    }
}

// Экспорт для использования в других модулях
window.AnalyticsChartManager = AnalyticsChartManager;
