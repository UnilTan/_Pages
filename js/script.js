// Mobile Navigation Toggle
document.addEventListener('DOMContentLoaded', function() {
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');
    
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            navToggle.classList.toggle('active');
        });
        
        // Close menu when clicking on links
        const navLinks = navMenu.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                navToggle.classList.remove('active');
            });
        });
    }
});

// Smooth Scrolling for Navigation Links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const offsetTop = target.offsetTop - 80; // Account for fixed navbar
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    });
});

// Navbar Background on Scroll
window.addEventListener('scroll', function() {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.style.background = 'rgba(26, 26, 46, 0.98)';
    } else {
        navbar.style.background = 'rgba(26, 26, 46, 0.95)';
    }
});

// Performance Chart
function createPerformanceChart() {
    const canvas = document.getElementById('performanceChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    // Sample data for the chart
    const data = {
        labels: ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен'],
        datasets: [{
            label: 'Прибыль (%)',
            data: [12, 19, 8, 15, 25, 18, 32, 28, 35],
            borderColor: '#00D4FF',
            backgroundColor: 'rgba(0, 212, 255, 0.1)',
            borderWidth: 3,
            fill: true,
            tension: 0.4
        }, {
            label: 'Точность (%)',
            data: [75, 82, 78, 85, 88, 83, 90, 87, 92],
            borderColor: '#4ECDC4',
            backgroundColor: 'rgba(78, 205, 196, 0.1)',
            borderWidth: 3,
            fill: true,
            tension: 0.4
        }]
    };
    
    const config = {
        type: 'line',
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        usePointStyle: true,
                        padding: 20,
                        font: {
                            family: 'Inter',
                            size: 12
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        font: {
                            family: 'Inter',
                            size: 11
                        }
                    }
                },
                y: {
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)'
                    },
                    ticks: {
                        font: {
                            family: 'Inter',
                            size: 11
                        }
                    }
                }
            },
            elements: {
                point: {
                    radius: 6,
                    hoverRadius: 8
                }
            },
            interaction: {
                intersect: false,
                mode: 'index'
            }
        }
    };
    
    new Chart(ctx, config);
}

// Intersection Observer for Animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animate-fade-in-up');
        }
    });
}, observerOptions);

// Observe elements for animation
document.addEventListener('DOMContentLoaded', function() {
    const animateElements = document.querySelectorAll(
        '.feature-card, .signal-card, .step-card, .section-header'
    );
    animateElements.forEach(el => observer.observe(el));
    
    // Initialize chart after DOM is loaded
    setTimeout(createPerformanceChart, 100);
});

// Counter Animation for Stats
function animateCounters() {
    const counters = document.querySelectorAll('.stat-number, .metric-value');
    
    counters.forEach(counter => {
        const target = counter.textContent;
        const isPercentage = target.includes('%');
        const isMultiplier = target.includes('x');
        const isTime = target.includes('/');
        
        // Skip non-numeric counters
        if (isTime || target.includes('RSI') || target.includes('MACD')) return;
        
        let numericTarget = parseFloat(target.replace(/[^\d.]/g, ''));
        if (isNaN(numericTarget)) return;
        
        let current = 0;
        const increment = numericTarget / 50; // 50 steps
        const timer = setInterval(() => {
            current += increment;
            if (current >= numericTarget) {
                current = numericTarget;
                clearInterval(timer);
            }
            
            let displayValue = Math.floor(current * 10) / 10;
            if (isPercentage) {
                counter.textContent = displayValue + '%';
            } else if (isMultiplier) {
                counter.textContent = displayValue.toFixed(1) + 'x';
            } else {
                counter.textContent = Math.floor(displayValue);
            }
        }, 30);
    });
}

// Trigger counter animation when stats section is visible
const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            animateCounters();
            statsObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.5 });

document.addEventListener('DOMContentLoaded', function() {
    const statsSection = document.querySelector('.hero-stats');
    const metricsSection = document.querySelector('.analytics-metrics');
    
    if (statsSection) statsObserver.observe(statsSection);
    if (metricsSection) statsObserver.observe(metricsSection);
});

// Crypto Icons Animation Enhancement
document.addEventListener('DOMContentLoaded', function() {
    const cryptoIcons = document.querySelectorAll('.crypto-icon');
    
    cryptoIcons.forEach((icon, index) => {
        // Add random movement
        setInterval(() => {
            const randomX = Math.random() * 20 - 10;
            const randomY = Math.random() * 20 - 10;
            icon.style.transform = `translate(${randomX}px, ${randomY}px) rotate(${Math.random() * 360}deg)`;
        }, 3000 + index * 500);
    });
});

// Trading Card Real-time Updates Simulation
function simulateTradingUpdates() {
    const priceElements = document.querySelectorAll('.price-current');
    const rsiElement = document.querySelector('.indicator .value.green');
    
    if (priceElements.length === 0) return;
    
    setInterval(() => {
        priceElements.forEach(el => {
            const currentPrice = parseFloat(el.textContent.replace(/[$,]/g, ''));
            const change = (Math.random() - 0.5) * 100; // Random change
            const newPrice = Math.max(currentPrice + change, 1000); // Minimum price
            el.textContent = '$' + newPrice.toLocaleString('en-US', {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
            });
        });
        
        // Update RSI
        if (rsiElement) {
            const newRSI = (Math.random() * 40 + 50).toFixed(1); // RSI between 50-90
            const status = newRSI > 70 ? '🔴 Перекуплено' : newRSI < 30 ? '🟢 Перепродано' : '🟡 Нейтрально';
            rsiElement.textContent = `${newRSI} ${status}`;
        }
    }, 5000); // Update every 5 seconds
}

// Initialize trading updates
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(simulateTradingUpdates, 2000);
});

// Form Validation and Interaction (if forms are added later)
function initFormHandlers() {
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Basic validation
            const inputs = form.querySelectorAll('input[required]');
            let isValid = true;
            
            inputs.forEach(input => {
                if (!input.value.trim()) {
                    isValid = false;
                    input.classList.add('error');
                } else {
                    input.classList.remove('error');
                }
            });
            
            if (isValid) {
                // Show success message
                showNotification('Форма успешно отправлена!', 'success');
            } else {
                showNotification('Пожалуйста, заполните все обязательные поля', 'error');
            }
        });
    });
}

// Notification System
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Style the notification
    Object.assign(notification.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        padding: '15px 20px',
        borderRadius: '8px',
        color: 'white',
        fontWeight: '500',
        zIndex: '10000',
        transform: 'translateX(100%)',
        transition: 'transform 0.3s ease-out',
        maxWidth: '300px',
        wordWrap: 'break-word'
    });
    
    // Set background color based on type
    const colors = {
        success: '#4ECDC4',
        error: '#FF6B6B',
        info: '#00D4FF',
        warning: '#FFE66D'
    };
    notification.style.backgroundColor = colors[type] || colors.info;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 10);
    
    // Remove after 5 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 5000);
}

// Lazy Loading for Images
function initLazyLoading() {
    const images = document.querySelectorAll('img[data-src]');
    
    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                imageObserver.unobserve(img);
            }
        });
    });
    
    images.forEach(img => imageObserver.observe(img));
}

// Parallax Effect for Hero Background
function initParallax() {
    const heroBackground = document.querySelector('.hero-background');
    
    if (!heroBackground) return;
    
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const rate = scrolled * -0.5;
        heroBackground.style.transform = `translateY(${rate}px)`;
    });
}

// Copy to Clipboard Functionality
function initCopyToClipboard() {
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('copy-btn')) {
            const textToCopy = e.target.dataset.copy;
            
            navigator.clipboard.writeText(textToCopy).then(() => {
                showNotification('Скопировано в буфер обмена!', 'success');
            }).catch(() => {
                showNotification('Ошибка при копировании', 'error');
            });
        }
    });
}

// Theme Toggle (Dark/Light mode)
function initThemeToggle() {
    const themeToggle = document.getElementById('themeToggle');
    
    if (!themeToggle) return;
    
    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    
    themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    });
}

// Real-time Trading Card Updates
let tradingCardUpdater = null;

function initRealTimeData() {
    // Инициализируем обновлятор торговой карточки
    if (window.TradingCardUpdater) {
        tradingCardUpdater = new TradingCardUpdater();
        const success = tradingCardUpdater.init();
        
        if (success) {
            console.log('✅ Инициализированы реальные данные для торговой карточки');
        } else {
            console.warn('⚠️ Не удалось инициализировать реальные данные');
        }
    }
}

// Cleanup function for real-time updates
function cleanupRealTimeData() {
    if (tradingCardUpdater) {
        tradingCardUpdater.stopUpdates();
        tradingCardUpdater = null;
    }
}

// Initialize all functionality
document.addEventListener('DOMContentLoaded', function() {
    initFormHandlers();
    initLazyLoading();
    initParallax();
    initCopyToClipboard();
    initThemeToggle();
    initVideoModal();
    
    // Инициализируем реальные данные после загрузки всех модулей
    setTimeout(initRealTimeData, 1000);
});

// Cleanup when page is about to unload
window.addEventListener('beforeunload', cleanupRealTimeData);

// Performance optimization - Debounce scroll events
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Apply debounce to scroll events
window.addEventListener('scroll', debounce(() => {
    // Scroll-based animations can be added here
}, 10));

// Error Handling
window.addEventListener('error', function(e) {
    console.error('JavaScript Error:', e.error);
    // You can send error reports to your analytics service here
});

// Video Modal Functionality
function initVideoModal() {
    const demoBtn = document.getElementById('demoBtn');
    const videoModal = document.getElementById('videoModal');
    const videoModalClose = document.querySelector('.video-modal-close');
    const vimeoPlayer = document.getElementById('vimeoPlayer');
    
    const vimeoVideoId = '1119964600';
    const vimeoEmbedUrl = `https://player.vimeo.com/video/${vimeoVideoId}?autoplay=1&title=0&byline=0&portrait=0&responsive=1`;
    
    if (!demoBtn || !videoModal || !videoModalClose || !vimeoPlayer) {
        console.warn('Video modal elements not found');
        return;
    }
    
    // Open modal
    function openVideoModal() {
        vimeoPlayer.src = vimeoEmbedUrl;
        videoModal.style.display = 'flex';
        
        // Smooth animation
        requestAnimationFrame(() => {
            videoModal.classList.add('show');
        });
        
        // Prevent body scroll
        document.body.style.overflow = 'hidden';
    }
    
    // Close modal
    function closeVideoModal() {
        videoModal.classList.remove('show');
        
        setTimeout(() => {
            videoModal.style.display = 'none';
            vimeoPlayer.src = ''; // Stop video playback
            document.body.style.overflow = 'auto';
        }, 300);
    }
    
    // Event listeners
    demoBtn.addEventListener('click', openVideoModal);
    videoModalClose.addEventListener('click', closeVideoModal);
    
    // Close modal when clicking outside
    videoModal.addEventListener('click', function(e) {
        if (e.target === videoModal) {
            closeVideoModal();
        }
    });
    
    // Close modal with Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && videoModal.classList.contains('show')) {
            closeVideoModal();
        }
    });
}

// Service Worker Registration (for PWA capabilities)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}
