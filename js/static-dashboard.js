// Static Dashboard for GitHub Pages
document.addEventListener('DOMContentLoaded', () => {
    // Проверяем авторизацию
    if (!staticAuth || !staticAuth.isLoggedIn()) {
        console.log('❌ Пользователь не авторизован, перенаправление...');
        window.location.href = 'index.html';
        return;
    }

    // DOM Elements
    const sidebar = document.querySelector('.sidebar');
    const menuToggle = document.getElementById('menuToggle');
    const navItems = document.querySelectorAll('.sidebar-nav .nav-item');
    const contentSections = document.querySelectorAll('.content-section');
    const currentSectionTitle = document.getElementById('currentSectionTitle');
    const dashboardUsername = document.getElementById('dashboardUsername');
    const logoutBtn = document.getElementById('logoutBtn');

    // Mobile menu toggle
    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            sidebar.classList.toggle('active');
        });
    }

    // Section switching
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            // Remove active class from all nav items
            navItems.forEach(nav => nav.classList.remove('active'));
            
            // Add active class to clicked item
            item.classList.add('active');

            // Get target section
            const targetSection = item.getAttribute('data-section');
            
            // Hide all sections
            contentSections.forEach(section => {
                section.classList.remove('active');
            });
            
            // Show target section
            const targetSectionElement = document.getElementById(targetSection);
            if (targetSectionElement) {
                targetSectionElement.classList.add('active');
            }
            
            // Update page title
            const sectionTitle = item.querySelector('span').textContent;
            if (currentSectionTitle) {
                currentSectionTitle.textContent = sectionTitle;
            }

            // Close sidebar on mobile after selection
            if (window.innerWidth <= 768) {
                sidebar.classList.remove('active');
            }
            
            // Initialize section-specific functionality
            initSectionContent(targetSection);
        });
    });

    // Initialize section content
    function initSectionContent(sectionId) {
        console.log(`Initializing ${sectionId} section`);
        
        switch(sectionId) {
            case 'overview':
                initOverviewSection();
                break;
            case 'signals':
                initSignalsSection();
                break;
            case 'analytics':
                initAnalyticsSection();
                break;
            case 'portfolio':
                initPortfolioSection();
                break;
            case 'settings':
                initSettingsSection();
                break;
        }
    }

    // Overview section initialization
    function initOverviewSection() {
        updateLiveCounters();
        loadRecentSignals();
        loadPortfolioSummary();
    }

    // Update live counters with modern animations
    function updateLiveCounters() {
        const counters = {
            activeSignals: 23,
            winRate: 87.3,
            totalProfit: 15.2,
            totalUsers: 2847
        };
        
        // Анимированное обновление счетчиков
        Object.keys(counters).forEach(key => {
            updateCounterWithAnimation(key, counters[key], key.includes('Rate') || key.includes('Profit') ? '%' : '');
        });
    }

    function updateCounterWithAnimation(elementId, targetValue, suffix = '') {
        const element = document.getElementById(elementId);
        if (!element) return;
        
        const startValue = 0;
        const duration = 1500; // 1.5 секунды
        const startTime = performance.now();
        
        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function для плавной анимации
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
            const currentValue = startValue + (targetValue - startValue) * easeOutQuart;
            
            if (suffix === '%') {
                element.textContent = currentValue.toFixed(1) + suffix;
            } else if (targetValue > 1000) {
                element.textContent = Math.round(currentValue).toLocaleString() + suffix;
            } else {
                element.textContent = Math.round(currentValue) + suffix;
            }
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        
        requestAnimationFrame(animate);
    }

    // Load recent signals
    function loadRecentSignals() {
        const recentSignals = [
            { symbol: 'BTC/USDT', action: 'BUY', profit: 2.3, status: 'completed', time: '2 часа назад' },
            { symbol: 'ETH/USDT', action: 'SELL', profit: -1.1, status: 'completed', time: '4 часа назад' },
            { symbol: 'ADA/USDT', action: 'BUY', profit: 4.2, status: 'active', time: '6 часов назад' },
            { symbol: 'DOT/USDT', action: 'BUY', profit: 1.8, status: 'completed', time: '8 часов назад' },
            { symbol: 'MATIC/USDT', action: 'SELL', profit: 3.1, status: 'active', time: '12 часов назад' }
        ];
        
        updateRecentSignalsList(recentSignals);
    }

    function updateRecentSignalsList(signals) {
        const container = document.getElementById('recentSignalsList');
        if (!container) return;
        
        container.innerHTML = signals.map(signal => `
            <div class="signal-item ${signal.status}">
                <div class="signal-info">
                    <div class="signal-symbol">${signal.symbol}</div>
                    <div class="signal-time">${signal.time}</div>
                </div>
                <div class="signal-action ${signal.action.toLowerCase()}">${signal.action}</div>
                <div class="signal-profit ${signal.profit > 0 ? 'positive' : 'negative'}">
                    ${signal.profit > 0 ? '+' : ''}${signal.profit}%
                </div>
                <div class="signal-status ${signal.status}">
                    ${signal.status === 'active' ? 'Активен' : 'Завершен'}
                </div>
            </div>
        `).join('');
    }

    // Load portfolio summary
    function loadPortfolioSummary() {
        const portfolio = {
            totalValue: 5420.75,
            dayChange: 2.34,
            weekChange: -1.23,
            positions: 8
        };
        
        updatePortfolioSummary(portfolio);
    }

    function updatePortfolioSummary(portfolio) {
        const valueElement = document.getElementById('portfolioValue');
        const changeElement = document.getElementById('portfolioChange');
        const weekChangeElement = document.getElementById('portfolioWeekChange');
        const positionsElement = document.getElementById('portfolioPositions');
        
        if (valueElement) valueElement.textContent = `$${portfolio.totalValue.toFixed(2)}`;
        if (changeElement) {
            changeElement.textContent = `${portfolio.dayChange > 0 ? '+' : ''}${portfolio.dayChange}%`;
            changeElement.className = `portfolio-change ${portfolio.dayChange > 0 ? 'positive' : 'negative'}`;
        }
        if (weekChangeElement) {
            weekChangeElement.textContent = `${portfolio.weekChange > 0 ? '+' : ''}${portfolio.weekChange}%`;
            weekChangeElement.className = `portfolio-change ${portfolio.weekChange > 0 ? 'positive' : 'negative'}`;
        }
        if (positionsElement) positionsElement.textContent = portfolio.positions;
    }

    // Other section functions
    function initSignalsSection() {
        loadAllSignals();
    }

    function initAnalyticsSection() {
        loadAnalyticsCharts();
    }

    function initPortfolioSection() {
        loadPortfolioData();
    }

    function initSettingsSection() {
        loadUserSettings();
    }

    function loadAllSignals() {
        console.log('Loading all signals...');
        // Mock implementation
        showNotification('Загрузка всех сигналов...', 'info');
    }

    function loadAnalyticsCharts() {
        console.log('Loading analytics charts...');
        createPerformanceChart();
    }

    // Создание графика производительности
    function createPerformanceChart() {
        const canvas = document.getElementById('performanceChart');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        
        // Проверяем, подключен ли Chart.js
        if (typeof Chart === 'undefined') {
            console.log('Chart.js не загружен, создаем простой график...');
            createSimpleChart(ctx, canvas);
            return;
        }
        
        // Данные для графика
        const data = {
            labels: ['1 нед', '2 нед', '3 нед', '4 нед'],
            datasets: [{
                label: 'Прибыль (%)',
                data: [5.2, 8.7, 12.1, 15.2],
                borderColor: '#22d3ee',
                backgroundColor: 'rgba(34, 211, 238, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4
            }]
        };
        
        const options = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: {
                        color: '#94a3b8'
                    }
                },
                x: {
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: {
                        color: '#94a3b8'
                    }
                }
            }
        };
        
        new Chart(ctx, {
            type: 'line',
            data: data,
            options: options
        });
    }

    // Простой график без Chart.js
    function createSimpleChart(ctx, canvas) {
        const width = canvas.offsetWidth;
        const height = canvas.offsetHeight;
        canvas.width = width;
        canvas.height = height;
        
        const data = [5.2, 8.7, 12.1, 15.2];
        const labels = ['1 нед', '2 нед', '3 нед', '4 нед'];
        
        const padding = 40;
        const chartWidth = width - 2 * padding;
        const chartHeight = height - 2 * padding;
        
        // Фон
        ctx.fillStyle = 'rgba(26, 31, 58, 0.5)';
        ctx.fillRect(0, 0, width, height);
        
        // Градиентная заливка под линией
        const gradient = ctx.createLinearGradient(0, padding, 0, height - padding);
        gradient.addColorStop(0, 'rgba(34, 211, 238, 0.3)');
        gradient.addColorStop(1, 'rgba(34, 211, 238, 0.0)');
        
        // Рисуем линию и заливку
        ctx.beginPath();
        ctx.moveTo(padding, height - padding);
        
        data.forEach((value, index) => {
            const x = padding + (index / (data.length - 1)) * chartWidth;
            const y = height - padding - (value / 20) * chartHeight;
            
            if (index === 0) {
                ctx.lineTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });
        
        ctx.lineTo(width - padding, height - padding);
        ctx.closePath();
        
        ctx.fillStyle = gradient;
        ctx.fill();
        
        // Рисуем линию
        ctx.beginPath();
        data.forEach((value, index) => {
            const x = padding + (index / (data.length - 1)) * chartWidth;
            const y = height - padding - (value / 20) * chartHeight;
            
            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });
        
        ctx.strokeStyle = '#22d3ee';
        ctx.lineWidth = 3;
        ctx.stroke();
        
        // Рисуем точки
        data.forEach((value, index) => {
            const x = padding + (index / (data.length - 1)) * chartWidth;
            const y = height - padding - (value / 20) * chartHeight;
            
            ctx.beginPath();
            ctx.arc(x, y, 6, 0, 2 * Math.PI);
            ctx.fillStyle = '#22d3ee';
            ctx.fill();
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2;
            ctx.stroke();
        });
        
        // Подписи
        ctx.fillStyle = '#94a3b8';
        ctx.font = '12px Inter';
        ctx.textAlign = 'center';
        
        labels.forEach((label, index) => {
            const x = padding + (index / (labels.length - 1)) * chartWidth;
            ctx.fillText(label, x, height - 10);
        });
    }

    function loadPortfolioData() {
        console.log('Loading portfolio data...');
        // Mock implementation
        showNotification('Загрузка портфеля...', 'info');
    }

    function loadUserSettings() {
        console.log('Loading user settings...');
        // Mock implementation
        const user = staticAuth.getCurrentUser();
        if (user) {
            const emailInput = document.getElementById('settingsEmail');
            const usernameInput = document.getElementById('settingsUsername');
            
            if (emailInput) emailInput.value = user.email;
            if (usernameInput) usernameInput.value = user.username;
        }
    }

    // User data initialization
    function initUserData() {
        const user = staticAuth.getCurrentUser();
        if (user) {
            // Update username display
            if (dashboardUsername) {
                dashboardUsername.textContent = user.username || user.email;
            }
            
            console.log('✅ User profile loaded:', user);
        } else {
            console.error('❌ No user data available');
            window.location.href = 'index.html';
        }
    }

    // Logout functionality
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            if (confirm('Вы уверены, что хотите выйти?')) {
                staticAuth.logout();
                // Перенаправление произойдет автоматически в staticAuth.logout()
            }
        });
    }

    // Notification system
    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `dashboard-notification ${type}`;
        notification.innerHTML = `
            <i class="fas ${getNotificationIcon(type)}"></i>
            <span>${message}</span>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    function getNotificationIcon(type) {
        switch(type) {
            case 'success': return 'fa-check-circle';
            case 'error': return 'fa-exclamation-circle';
            case 'warning': return 'fa-exclamation-triangle';
            default: return 'fa-info-circle';
        }
    }

    // Initialize dashboard
    function initDashboard() {
        console.log('🚀 Initializing static dashboard...');
        
        // Initialize user data
        initUserData();
        
        // Initialize overview section by default
        initOverviewSection();
        
        // Load chart after a short delay to ensure DOM is ready
        setTimeout(() => {
            createPerformanceChart();
        }, 500);
        
        // Show welcome message
        const user = staticAuth.getCurrentUser();
        showNotification(`Добро пожаловать, ${user.username}!`, 'success');
        
        console.log('✅ Static dashboard initialized successfully');
    }

    // Chart filter handlers
    function bindChartFilters() {
        const filterBtns = document.querySelectorAll('.filter-btn');
        filterBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                // Remove active class from all buttons
                filterBtns.forEach(b => b.classList.remove('active'));
                
                // Add active class to clicked button
                this.classList.add('active');
                
                // Update chart data based on period
                const period = this.getAttribute('data-period');
                updateChartData(period);
                
                showNotification(`Данные обновлены за ${period}`, 'info');
            });
        });
    }

    function updateChartData(period) {
        console.log(`Updating chart data for period: ${period}`);
        // В реальном приложении здесь бы загружались новые данные
        // Для демо просто перерисовываем график
        setTimeout(() => {
            createPerformanceChart();
        }, 300);
    }

    // Bind chart filters after DOM is ready
    setTimeout(() => {
        bindChartFilters();
    }, 1000);

    // Start dashboard initialization
    initDashboard();
    
    // Update counters every 30 seconds
    setInterval(updateLiveCounters, 30000);
    
    // Refresh signals every 60 seconds
    setInterval(() => {
        if (document.getElementById('overview').classList.contains('active')) {
            loadRecentSignals();
        }
    }, 60000);
});
