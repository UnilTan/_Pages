// Service Worker для CryptoWatch MEXC
const CACHE_NAME = 'cryptowatch-mexc-v1.0.0';
const CACHE_URLS = [
  '/',
  '/about/',
  '/features/',
  '/analytics/',
  '/contact/',
  '/404.html',
  '/css/style.css',
  '/js/script.js',
  '/js/crypto-data.js',
  '/js/analytics-data.js',
  '/js/analytics-chart.js',
  '/js/trading-card-updater.js',
  '/manifest.json',
  // Внешние ресурсы
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/3.9.1/chart.min.js'
];

// Установка Service Worker
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching files');
        return cache.addAll(CACHE_URLS);
      })
      .then(() => {
        console.log('Service Worker: Installed successfully');
        return self.skipWaiting();
      })
  );
});

// Активация Service Worker
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('Service Worker: Activated');
      return self.clients.claim();
    })
  );
});

// Обработка запросов
self.addEventListener('fetch', (event) => {
  // Игнорируем запросы к внешним API
  if (event.request.url.includes('api.') || 
      event.request.url.includes('telegram.org') ||
      event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        // Возвращаем кэшированную версию, если есть
        if (cachedResponse) {
          return cachedResponse;
        }

        // Иначе делаем запрос к сети
        return fetch(event.request)
          .then((networkResponse) => {
            // Проверяем валидность ответа
            if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
              return networkResponse;
            }

            // Клонируем ответ для кэширования
            const responseToCache = networkResponse.clone();

            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return networkResponse;
          })
          .catch(() => {
            // В случае ошибки сети показываем офлайн страницу
            if (event.request.destination === 'document') {
              return caches.match('/404.html');
            }
          });
      })
  );
});

// Обработка сообщений от клиента
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Push уведомления (для будущего использования)
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push received');
  
  const options = {
    body: event.data ? event.data.text() : 'Новый торговый сигнал!',
    icon: '/assets/icon-192x192.png',
    badge: '/assets/badge-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Посмотреть',
        icon: '/assets/action-explore.png'
      },
      {
        action: 'close',
        title: 'Закрыть',
        icon: '/assets/action-close.png'
      }
    ],
    requireInteraction: true,
    silent: false
  };

  event.waitUntil(
    self.registration.showNotification('CryptoWatch MEXC', options)
  );
});

// Обработка клика по уведомлению
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification click received');

  event.notification.close();

  if (event.action === 'explore') {
    // Открываем страницу аналитики
    event.waitUntil(
      clients.openWindow('/analytics/')
    );
  } else if (event.action === 'close') {
    // Просто закрываем уведомление
    event.notification.close();
  } else {
    // Клик по основному уведомлению - открываем главную страницу
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Обработка закрытия уведомления
self.addEventListener('notificationclose', (event) => {
  console.log('Service Worker: Notification closed', event);
});

// Синхронизация в фоне
self.addEventListener('sync', (event) => {
  console.log('Service Worker: Background sync', event.tag);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  try {
    // Здесь можно синхронизировать данные
    console.log('Service Worker: Performing background sync');
    
    // Пример: обновление кэша важных данных
    const cache = await caches.open(CACHE_NAME);
    
    // Обновляем критически важные ресурсы
    const criticalResources = [
      '/',
      '/analytics/',
      '/js/trading-card-updater.js'
    ];
    
    for (const resource of criticalResources) {
      try {
        const response = await fetch(resource);
        if (response.ok) {
          await cache.put(resource, response);
        }
      } catch (error) {
        console.log('Service Worker: Failed to update resource:', resource, error);
      }
    }
    
  } catch (error) {
    console.log('Service Worker: Background sync failed:', error);
  }
}

// Информация о версии
console.log(`Service Worker: CryptoWatch MEXC v${CACHE_NAME.split('-v')[1]} initialized`);

// Функция очистки старых данных
const cleanupOldData = async () => {
  try {
    const cacheNames = await caches.keys();
    const oldCaches = cacheNames.filter(name => name.startsWith('cryptowatch-mexc-') && name !== CACHE_NAME);
    
    await Promise.all(oldCaches.map(name => caches.delete(name)));
    console.log('Service Worker: Cleaned up old caches:', oldCaches);
  } catch (error) {
    console.log('Service Worker: Cleanup failed:', error);
  }
};

// Запускаем очистку при активации
self.addEventListener('activate', (event) => {
  event.waitUntil(cleanupOldData());
});
