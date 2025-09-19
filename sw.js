// Service Worker для CryptoWatch MEXC
const CACHE_NAME = 'cryptowatch-mexc-v1';
const urlsToCache = [
    '/',
    '/css/style.css',
    '/css/auth.css',
    '/css/dashboard.css',
    '/js/script.js',
    '/js/auth.js',
    '/js/dashboard.js',
    '/js/crypto-data.js',
    '/js/analytics-data.js',
    '/js/analytics-chart.js',
    '/js/trading-card-updater.js'
];

// Установка Service Worker
self.addEventListener('install', function(event) {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(function(cache) {
                console.log('Opened cache');
                return cache.addAll(urlsToCache);
            })
    );
});

// Обработка запросов
self.addEventListener('fetch', function(event) {
    event.respondWith(
        caches.match(event.request)
            .then(function(response) {
                // Возвращаем кешированный ресурс или загружаем из сети
                if (response) {
                    return response;
                }
                return fetch(event.request);
            }
        )
    );
});

// Обновление Service Worker
self.addEventListener('activate', function(event) {
    event.waitUntil(
        caches.keys().then(function(cacheNames) {
            return Promise.all(
                cacheNames.map(function(cacheName) {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});
