// Dashboard JavaScript
document.addEventListener('DOMContentLoaded', () => {
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

    // Initialize section content based on active section
    function initSectionContent(sectionId) {
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
        console.log('Initializing overview section');
        updateLiveCounters();
        loadRecentSignals();
        loadPortfolioSummary();
    }

    // Signals section initialization
    function initSignalsSection() {
        console.log('Initializing signals section');
        loadAllSignals();
    }

    // Analytics section initialization
    function initAnalyticsSection() {
        console.log('Initializing analytics section');
        loadPerformanceChart();
        loadWinRateChart();
    }

    // Portfolio section initialization
    function initPortfolioSection() {
        console.log('Initializing portfolio section');
        loadPortfolioData();
        loadPnLChart();
    }

    // Settings section initialization
    function initSettingsSection() {
        console.log('Initializing settings section');
        loadUserSettings();
        bindSettingsForms();
    }

    // User data fetching
    async function fetchUserData() {
        try {
            const response = await fetch('/api/auth/profile', {
                credentials: 'include'
            });
            
            const data = await response.json();
            
            if (data.success && data.user) {
                // Update username display
                if (dashboardUsername) {
                    dashboardUsername.textContent = data.user.username || data.user.email;
                }
                
                // Store user data globally for other functions
                window.currentUser = data.user;
                
                console.log('User profile loaded:', data.user);
                return data.user;
            } else {
                console.error('Failed to fetch user profile:', data.error);
                // Redirect to main page if session invalid
                window.location.href = 'index.html';
                return null;
            }
        } catch (error) {
            console.error('Error fetching user profile:', error);
            // Redirect to main page on network error
            window.location.href = 'index.html';
            return null;
        }
    }

    // Logout functionality
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            try {
                const response = await fetch('/api/auth/logout', {
                    method: 'POST',
                    credentials: 'include'
                });
                
                const result = await response.json();
                
                if (result.success) {
                    // Clear any stored session data
                    document.cookie = 'session_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;';
                    
                    // Redirect to main page
                    window.location.href = 'index.html';
                } else {
                    console.error('Logout failed:', result.error);
                    showNotification('Ошибка при выходе', 'error');
                }
            } catch (error) {
                console.error('Error during logout:', error);
                showNotification('Ошибка сети при выходе', 'error');
            }
        });
    }

    // Live counters update
    function updateLiveCounters() {
        // Mock data for now - replace with real API calls
        const counters = {
            totalSignals: 147,
            activeSignals: 23,
            winRate: 73.5,
            totalProfit: 15.2
        };
        
        updateCounter('totalSignals', counters.totalSignals);
        updateCounter('activeSignals', counters.activeSignals);
        updateCounter('winRate', counters.winRate, '%');
        updateCounter('totalProfit', counters.totalProfit, '%');
    }

    function updateCounter(elementId, value, suffix = '') {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = value + suffix;
        }
    }

    // Load recent signals for overview
    function loadRecentSignals() {
        // Mock data - replace with real API
        const recentSignals = [
            { symbol: 'BTC/USDT', action: 'BUY', profit: 2.3, status: 'completed' },
            { symbol: 'ETH/USDT', action: 'SELL', profit: -1.1, status: 'completed' },
            { symbol: 'ADA/USDT', action: 'BUY', profit: 4.2, status: 'active' }
        ];
        
        updateRecentSignalsList(recentSignals);
    }

    function updateRecentSignalsList(signals) {
        const container = document.getElementById('recentSignalsList');
        if (!container) return;
        
        container.innerHTML = signals.map(signal => `
            <div class="signal-item ${signal.status}">
                <div class="signal-symbol">${signal.symbol}</div>
                <div class="signal-action ${signal.action.toLowerCase()}">${signal.action}</div>
                <div class="signal-profit ${signal.profit > 0 ? 'positive' : 'negative'}">
                    ${signal.profit > 0 ? '+' : ''}${signal.profit}%
                </div>
                <div class="signal-status">${signal.status}</div>
            </div>
        `).join('');
    }

    // Load portfolio summary
    function loadPortfolioSummary() {
        // Mock data - replace with real API
        const portfolio = {
            totalValue: 5420.75,
            dayChange: 2.34,
            positions: 8
        };
        
        updatePortfolioSummary(portfolio);
    }

    function updatePortfolioSummary(portfolio) {
        const valueElement = document.getElementById('portfolioValue');
        const changeElement = document.getElementById('portfolioChange');
        const positionsElement = document.getElementById('portfolioPositions');
        
        if (valueElement) valueElement.textContent = `$${portfolio.totalValue}`;
        if (changeElement) {
            changeElement.textContent = `${portfolio.dayChange > 0 ? '+' : ''}${portfolio.dayChange}%`;
            changeElement.className = `portfolio-change ${portfolio.dayChange > 0 ? 'positive' : 'negative'}`;
        }
        if (positionsElement) positionsElement.textContent = portfolio.positions;
    }

    // Notification system
    function showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `dashboard-notification ${type}`;
        notification.textContent = message;
        
        // Add to page
        document.body.appendChild(notification);
        
        // Show notification
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        // Remove notification after 3 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    // Placeholder functions for other sections
    function loadAllSignals() {
        console.log('Loading all signals...');
        // TODO: Implement signals loading
    }

    function loadPerformanceChart() {
        console.log('Loading performance chart...');
        // TODO: Implement performance chart
    }

    function loadWinRateChart() {
        console.log('Loading win rate chart...');
        // TODO: Implement win rate chart
    }

    function loadPortfolioData() {
        console.log('Loading portfolio data...');
        // TODO: Implement portfolio data loading
    }

    function loadPnLChart() {
        console.log('Loading P&L chart...');
        // TODO: Implement P&L chart
    }

    function loadUserSettings() {
        console.log('Loading user settings...');
        // TODO: Implement user settings loading
    }

    function bindSettingsForms() {
        console.log('Binding settings forms...');
        // TODO: Implement settings forms binding
    }

    // Initialize dashboard
    async function initDashboard() {
        console.log('🚀 Initializing dashboard...');
        
        // Fetch user data first
        const user = await fetchUserData();
        
        if (user) {
            // Initialize overview section by default
            initOverviewSection();
            
            console.log('✅ Dashboard initialized successfully');
        }
    }

    // Start dashboard initialization
    initDashboard();
    
    // Update counters every 30 seconds
    setInterval(updateLiveCounters, 30000);
});

// Global utility functions
window.dashboardUtils = {
    showNotification: function(message, type = 'info') {
        // Same as the local showNotification function
        const notification = document.createElement('div');
        notification.className = `dashboard-notification ${type}`;
        notification.textContent = message;
        
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
    },
    
    formatCurrency: function(amount, currency = 'USD') {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency
        }).format(amount);
    },
    
    formatPercentage: function(value, decimals = 2) {
        return (value >= 0 ? '+' : '') + value.toFixed(decimals) + '%';
    }
};
