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

// Modal Management System
class ModalManager {
    constructor() {
        this.activeModal = null;
        this.init();
    }

    init() {
        // Add event listeners for modal triggers and closes
        this.addEventListeners();
    }

    addEventListeners() {
        // Close modals when clicking outside or pressing Escape
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('info-modal') || 
                e.target.classList.contains('video-modal')) {
                this.closeModal(e.target);
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.activeModal) {
                this.closeModal(this.activeModal);
            }
        });

        // Close buttons
        document.querySelectorAll('.info-modal-close, .video-modal-close').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const modal = e.target.closest('.info-modal, .video-modal');
                this.closeModal(modal);
            });
        });
    }

    openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (!modal) return false;

        // Close any existing modal first
        if (this.activeModal) {
            this.closeModal(this.activeModal);
        }

        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        
        // Smooth animation
        requestAnimationFrame(() => {
            modal.classList.add('show');
        });

        this.activeModal = modal;
        return true;
    }

    closeModal(modal) {
        if (!modal) return;

        modal.classList.remove('show');
        
        setTimeout(() => {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
            if (this.activeModal === modal) {
                this.activeModal = null;
            }
        }, 300);
    }
}

// Initialize modal manager
const modalManager = new ModalManager();

// Modal Functions
function showContactModal() {
    modalManager.openModal('contactModal');
}

function showHelpModal() {
    modalManager.openModal('helpModal');
}

function showDocsModal() {
    modalManager.openModal('docsModal');
}

// FAQ Toggle Functionality
function toggleFAQ(element) {
    const faqItem = element.parentElement;
    const answer = faqItem.querySelector('.faq-answer');
    const icon = element.querySelector('i');
    
    // Close other FAQ items
    document.querySelectorAll('.faq-item').forEach(item => {
        if (item !== faqItem) {
            item.querySelector('.faq-question').classList.remove('active');
            item.querySelector('.faq-answer').classList.remove('active');
        }
    });
    
    // Toggle current FAQ item
    element.classList.toggle('active');
    answer.classList.toggle('active');
}

// Documentation Navigation
function showDocsSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.docs-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Remove active from all nav items
    document.querySelectorAll('.docs-nav-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Show selected section
    const section = document.getElementById(sectionId);
    if (section) {
        section.classList.add('active');
    }
    
    // Add active to clicked nav item
    event.target.classList.add('active');
}

// Enhanced Button Animations
function addButtonEnhancements() {
    // Add ripple effect to buttons
    document.querySelectorAll('.btn, .contact-btn, .copy-btn').forEach(btn => {
        btn.addEventListener('click', createRippleEffect);
    });

    // Add magnetic effect to primary buttons
    document.querySelectorAll('.btn-primary').forEach(btn => {
        btn.addEventListener('mouseenter', addMagneticEffect);
        btn.addEventListener('mouseleave', removeMagneticEffect);
        btn.addEventListener('mousemove', updateMagneticEffect);
    });
}

function createRippleEffect(e) {
    const button = e.currentTarget;
    const ripple = document.createElement('span');
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;
    
    ripple.style.cssText = `
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.6);
        transform: scale(0);
        animation: ripple 0.6s linear;
        left: ${x}px;
        top: ${y}px;
        width: ${size}px;
        height: ${size}px;
        pointer-events: none;
    `;
    
    // Add ripple animation keyframes if not exists
    if (!document.querySelector('#ripple-styles')) {
        const style = document.createElement('style');
        style.id = 'ripple-styles';
        style.textContent = `
            @keyframes ripple {
                to {
                    transform: scale(4);
                    opacity: 0;
                }
            }
            .btn, .contact-btn, .copy-btn {
                position: relative;
                overflow: hidden;
            }
        `;
        document.head.appendChild(style);
    }
    
    button.appendChild(ripple);
    
    setTimeout(() => {
        ripple.remove();
    }, 600);
}

function addMagneticEffect(e) {
    const btn = e.currentTarget;
    btn.style.transition = 'transform 0.3s ease';
}

function removeMagneticEffect(e) {
    const btn = e.currentTarget;
    btn.style.transform = 'translate(0, 0) scale(1)';
}

function updateMagneticEffect(e) {
    const btn = e.currentTarget;
    const rect = btn.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    
    const moveX = x * 0.1;
    const moveY = y * 0.1;
    
    btn.style.transform = `translate(${moveX}px, ${moveY}px) scale(1.05)`;
}

// Enhanced Card Animations
function addCardAnimations() {
    const cards = document.querySelectorAll('.feature-card, .signal-card, .step-card');
    
    cards.forEach(card => {
        card.addEventListener('mouseenter', (e) => {
            // Add floating effect
            e.currentTarget.style.transform = 'translateY(-10px) scale(1.02)';
            e.currentTarget.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
            
            // Add glow effect
            e.currentTarget.style.boxShadow = '0 20px 40px rgba(0, 212, 255, 0.15)';
        });
        
        card.addEventListener('mouseleave', (e) => {
            e.currentTarget.style.transform = 'translateY(0) scale(1)';
            e.currentTarget.style.boxShadow = '';
        });
    });
}

// Enhanced Navigation Animations
function addNavAnimations() {
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        link.addEventListener('mouseenter', (e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.textShadow = '0 4px 8px rgba(0, 212, 255, 0.3)';
        });
        
        link.addEventListener('mouseleave', (e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.textShadow = '';
        });
    });
}

// Scroll-triggered Animations
function addScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const animateObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animation = 'slideInUp 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards';
                animateObserver.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Add animation styles
    if (!document.querySelector('#scroll-animations')) {
        const style = document.createElement('style');
        style.id = 'scroll-animations';
        style.textContent = `
            @keyframes slideInUp {
                from {
                    opacity: 0;
                    transform: translateY(50px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            
            @keyframes fadeInScale {
                from {
                    opacity: 0;
                    transform: scale(0.8);
                }
                to {
                    opacity: 1;
                    transform: scale(1);
                }
            }
            
            @keyframes slideInLeft {
                from {
                    opacity: 0;
                    transform: translateX(-50px);
                }
                to {
                    opacity: 1;
                    transform: translateX(0);
                }
            }
            
            @keyframes slideInRight {
                from {
                    opacity: 0;
                    transform: translateX(50px);
                }
                to {
                    opacity: 1;
                    transform: translateX(0);
                }
            }
        `;
        document.head.appendChild(style);
    }

    // Observe elements for animations
    const elementsToAnimate = document.querySelectorAll(
        '.feature-card, .signal-card, .step-card, .section-header, .analytics-text, .hero-visual'
    );
    
    elementsToAnimate.forEach((el, index) => {
        // Add different animation delays
        el.style.animationDelay = `${index * 0.1}s`;
        el.style.opacity = '0';
        animateObserver.observe(el);
    });
}

// Contact Form Enhancement
function enhanceContactForm() {
    const contactForm = document.getElementById('contactForm');
    if (!contactForm) return;

    contactForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = new FormData(this);
        const submitBtn = this.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        
        // Show loading state
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Отправляется...';
        submitBtn.disabled = true;
        
        // Simulate form submission (replace with actual endpoint)
        try {
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Success state
            submitBtn.innerHTML = '<i class="fas fa-check"></i> Отправлено!';
            submitBtn.style.background = 'var(--success-color)';
            
            showNotification('Сообщение успешно отправлено! Мы свяжемся с вами в ближайшее время.', 'success');
            
            // Reset form
            this.reset();
            
            // Close modal after delay
            setTimeout(() => {
                modalManager.closeModal(document.getElementById('contactModal'));
            }, 2000);
            
        } catch (error) {
            submitBtn.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Ошибка';
            submitBtn.style.background = 'var(--danger-color)';
            showNotification('Произошла ошибка при отправке. Попробуйте позже.', 'error');
        } finally {
            setTimeout(() => {
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
                submitBtn.style.background = '';
            }, 3000);
        }
    });
}

// Enhanced Copy Functionality
function enhanceCopyFunctionality() {
    document.addEventListener('click', async function(e) {
        if (e.target.classList.contains('copy-btn') || e.target.closest('.copy-btn')) {
            const btn = e.target.closest('.copy-btn') || e.target;
            const textToCopy = btn.dataset.copy;
            
            if (!textToCopy) return;
            
            try {
                await navigator.clipboard.writeText(textToCopy);
                
                // Visual feedback
                const originalIcon = btn.querySelector('i').className;
                const iconElement = btn.querySelector('i');
                
                iconElement.className = 'fas fa-check';
                btn.style.background = 'rgba(76, 205, 196, 0.2)';
                
                showNotification('Скопировано в буфер обмена!', 'success');
                
                setTimeout(() => {
                    iconElement.className = originalIcon;
                    btn.style.background = '';
                }, 2000);
                
            } catch (error) {
                showNotification('Ошибка при копировании', 'error');
            }
        }
    });
}

// Enhanced Notification System
function enhanceNotifications() {
    // Override the existing showNotification function with better styling
    window.showNotification = function(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        
        // Add icon based on type
        const icons = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-circle',
            info: 'fas fa-info-circle',
            warning: 'fas fa-exclamation-triangle'
        };
        
        notification.innerHTML = `
            <i class="${icons[type] || icons.info}"></i>
            <span>${message}</span>
            <button class="notification-close">&times;</button>
        `;
        
        // Enhanced styling
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '15px 20px',
            borderRadius: '12px',
            color: 'white',
            fontWeight: '500',
            zIndex: '10000',
            transform: 'translateX(100%)',
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            maxWidth: '350px',
            minWidth: '250px',
            wordWrap: 'break-word',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
            backdropFilter: 'blur(10px)'
        });
        
        // Set background color based on type
        const colors = {
            success: 'linear-gradient(135deg, #4ECDC4 0%, #44A08D 100%)',
            error: 'linear-gradient(135deg, #FF6B6B 0%, #EE5A52 100%)',
            info: 'linear-gradient(135deg, #00D4FF 0%, #0099CC 100%)',
            warning: 'linear-gradient(135deg, #FFE66D 0%, #FFA726 100%)'
        };
        notification.style.background = colors[type] || colors.info;
        
        // Close button styling
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.style.cssText = `
            background: rgba(255, 255, 255, 0.2);
            border: none;
            color: white;
            width: 24px;
            height: 24px;
            border-radius: 50%;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 16px;
            margin-left: auto;
            transition: all 0.2s ease;
        `;
        
        closeBtn.addEventListener('click', () => {
            removeNotification(notification);
        });
        
        closeBtn.addEventListener('mouseenter', () => {
            closeBtn.style.background = 'rgba(255, 255, 255, 0.3)';
            closeBtn.style.transform = 'scale(1.1)';
        });
        
        closeBtn.addEventListener('mouseleave', () => {
            closeBtn.style.background = 'rgba(255, 255, 255, 0.2)';
            closeBtn.style.transform = 'scale(1)';
        });
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 10);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            removeNotification(notification);
        }, 5000);
        
        function removeNotification(notif) {
            notif.style.transform = 'translateX(100%)';
            notif.style.opacity = '0';
            setTimeout(() => {
                if (notif.parentNode) {
                    notif.parentNode.removeChild(notif);
                }
            }, 400);
        }
    };
}

// Signal Card Selection System
let selectedSignal = null;

function selectSignalCard(cardElement) {
    const signalType = cardElement.dataset.signal;
    
    // Remove selection from all cards
    document.querySelectorAll('.signal-card').forEach(card => {
        card.classList.remove('selected');
    });
    
    // Add selection to clicked card
    cardElement.classList.add('selected');
    selectedSignal = signalType;
    
    // Show selection feedback
    showNotification(`Выбран тип сигналов: ${signalType}%`, 'info');
    
    // Add selection animation without breaking the card visibility
    cardElement.style.transform = 'scale(1.05)';
    setTimeout(() => {
        cardElement.style.transform = '';
    }, 200);
    
    // Store selection in localStorage
    localStorage.setItem('selectedSignal', signalType);
    
    console.log(`🎯 Выбран тип сигналов: ${signalType}%`);
}

// Load previously selected signal on page load
function loadSelectedSignal() {
    const savedSignal = localStorage.getItem('selectedSignal');
    if (savedSignal) {
        const savedCard = document.querySelector(`[data-signal="${savedSignal}"]`);
        if (savedCard) {
            // Add selection without notification on page load
            document.querySelectorAll('.signal-card').forEach(card => {
                card.classList.remove('selected');
            });
            savedCard.classList.add('selected');
            selectedSignal = savedSignal;
            console.log(`🎯 Восстановлен выбор: ${savedSignal}% сигналы`);
        }
    } else {
        // Default selection - 7% signals (featured)
        const defaultCard = document.querySelector('[data-signal="7"]');
        if (defaultCard) {
            defaultCard.classList.add('selected');
            selectedSignal = '7';
            localStorage.setItem('selectedSignal', '7');
            console.log('🎯 Выбор по умолчанию: 7% сигналы');
        }
    }
}

// Enhanced signal card interactions
function enhanceSignalCards() {
    const signalCards = document.querySelectorAll('.signal-card.clickable');
    
    signalCards.forEach(card => {
        // Add keyboard support
        card.setAttribute('tabindex', '0');
        card.setAttribute('role', 'button');
        card.setAttribute('aria-label', `Выбрать ${card.dataset.signal}% сигналы`);
        
        // Keyboard navigation
        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                selectSignalCard(card);
            }
        });
        
        // Enhanced hover effects
        card.addEventListener('mouseenter', () => {
            if (!card.classList.contains('selected')) {
                card.style.transform = 'translateY(-5px) scale(1.02)';
                card.style.boxShadow = '0 15px 35px rgba(0, 212, 255, 0.15)';
            }
        });
        
        card.addEventListener('mouseleave', () => {
            if (!card.classList.contains('selected')) {
                card.style.transform = '';
                card.style.boxShadow = '';
            }
        });
    });
    
    // Load saved selection
    setTimeout(loadSelectedSignal, 500);
}

// Boosty button analytics
function trackBoostyClick(signalType) {
    // Analytics tracking
    console.log(`🚀 Boosty click: ${signalType}% signals`);
    
    // Show feedback
    showNotification('Переход на Boosty...', 'info');
    
    // You can add analytics code here
    // gtag('event', 'boosty_click', { signal_type: signalType });
}

// Add click tracking to boosty buttons
function enhanceBoostyButtons() {
    document.querySelectorAll('.boosty-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const signalCard = e.target.closest('.signal-card');
            const signalType = signalCard ? signalCard.dataset.signal : 'unknown';
            trackBoostyClick(signalType);
        });
    });
}

// Signal card comparison feature
function addSignalComparison() {
    const signalData = {
        '5': {
            frequency: 'Высокая',
            quality: 'Средняя',
            risk: 'Высокий',
            profit: '5-15%',
            timeframe: '1-5 мин'
        },
        '7': {
            frequency: 'Средняя',
            quality: 'Высокая',
            risk: 'Средний',
            profit: '7-20%',
            timeframe: '5-15 мин'
        },
        '12': {
            frequency: 'Низкая',
            quality: 'Очень высокая',
            risk: 'Низкий',
            profit: '12-30%',
            timeframe: '15-60 мин'
        }
    };
    
    // Add tooltip with comparison data
    document.querySelectorAll('.signal-card').forEach(card => {
        const signalType = card.dataset.signal;
        const data = signalData[signalType];
        
        if (data) {
            card.setAttribute('title', 
                `Частота: ${data.frequency}\n` +
                `Качество: ${data.quality}\n` +
                `Риск: ${data.risk}\n` +
                `Потенциал: ${data.profit}\n` +
                `Таймфрейм: ${data.timeframe}`
            );
        }
    });
}

// Initialize all enhancements
document.addEventListener('DOMContentLoaded', function() {
    // Existing initializations
    initFormHandlers();
    initLazyLoading();
    initParallax();
    initCopyToClipboard();
    initThemeToggle();
    initVideoModal();
    
    // New enhancements
    addButtonEnhancements();
    addCardAnimations();
    addNavAnimations();
    addScrollAnimations();
    enhanceContactForm();
    enhanceCopyFunctionality();
    enhanceNotifications();
    
    // Signal cards enhancements
    enhanceSignalCards();
    enhanceBoostyButtons();
    addSignalComparison();
    
    // Initialize real-time data after all enhancements
    setTimeout(initRealTimeData, 1000);
    
    console.log('🎉 Все улучшения интерфейса загружены!');
    console.log('🎯 Система выбора сигналов активирована!');
});

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
