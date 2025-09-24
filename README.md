# CryptoWatch MEXC - Website

Официальный веб-сайт для торгового бота CryptoWatch MEXC, построенный на Jekyll для GitHub Pages.

## 🚀 Быстрый старт

### Локальная разработка

1. **Установите Jekyll и bundler:**
   ```bash
   gem install jekyll bundler
   ```

2. **Установите зависимости:**
   ```bash
   bundle install
   ```

3. **Запустите локальный сервер:**
   ```bash
   bundle exec jekyll serve
   ```

4. **Откройте в браузере:**
   ```
   http://localhost:4000
   ```

### Деплой на GitHub Pages

1. **Убедитесь, что все файлы добавлены в git:**
   ```bash
   git add .
   git commit -m "Update website"
   ```

2. **Отправьте изменения:**
   ```bash
   git push origin main
   ```

3. **Настройте GitHub Pages:**
   - Перейдите в Settings → Pages
   - Source: Deploy from a branch
   - Branch: main / website
   - Сайт будет доступен по адресу: `https://позитив007.github.io/CryptoWatch-MEXC/`

## 📁 Структура проекта

```
website/
├── _config.yml          # Конфигурация Jekyll
├── _layouts/            # Шаблоны страниц
│   ├── default.html     # Основной шаблон
│   └── page.html        # Шаблон для страниц
├── _includes/           # Переиспользуемые компоненты
│   ├── head.html        # HTML head с мета-тегами
│   ├── header.html      # Навигация
│   ├── footer.html      # Футер
│   ├── modals.html      # Модальные окна
│   └── trading-card.html # Торговая карточка
├── _data/               # Данные сайта
│   ├── navigation.yml   # Навигационное меню
│   └── social.yml       # Социальные сети
├── css/                 # Стили
│   └── style.css        # Основные стили
├── js/                  # JavaScript
│   ├── script.js        # Основная логика
│   ├── analytics-*.js   # Аналитика
│   └── crypto-data.js   # Криптоданные
├── assets/              # Статические ресурсы
│   ├── images/          # Изображения
│   └── icons/           # Иконки
├── index.html           # Главная страница
├── about.html           # О проекте
├── features.html        # Возможности
├── analytics.html       # Аналитика
├── contact.html         # Контакты
├── 404.html             # Страница ошибки
├── robots.txt           # Для поисковых систем
├── manifest.json        # PWA манифест
├── sw.js                # Service Worker
└── README.md            # Эта документация
```

## 🎨 Кастомизация

### Изменение цветовой схемы

Основные цвета определены в CSS переменных в `css/style.css`:

```css
:root {
    --primary-color: #00D4FF;
    --secondary-color: #1a202c;
    --success-color: #10B981;
    --warning-color: #F59E0B;
    --danger-color: #EF4444;
    --primary-gradient: linear-gradient(135deg, #4ECDC4 0%, #00D4FF 100%);
}
```

### Добавление новых страниц

1. Создайте новый HTML файл в корне
2. Добавьте YAML front matter:
   ```yaml
   ---
   layout: page
   title: "Заголовок страницы"
   description: "Описание для SEO"
   ---
   ```
3. Добавьте ссылку в `_data/navigation.yml`

### Настройка конфигурации

Основные настройки в `_config.yml`:

```yaml
title: "CryptoWatch MEXC"
description: "Описание сайта"
baseurl: "/CryptoWatch-MEXC"  # Для GitHub Pages
url: "https://позитив007.github.io"

# Контакты
telegram_bot: "https://t.me/DUMPBest_bot"
support_contact: "https://t.me/Solnyshchko"

# Социальные сети в _data/social.yml
```

## 🔧 Функциональность

### Адаптивный дизайн
- Mobile-first подход
- Поддержка всех устройств
- Оптимизированные изображения

### SEO оптимизация
- Мета-теги для всех страниц
- Open Graph для социальных сетей
- Структурированные данные Schema.org
- Sitemap.xml автоматически генерируется Jekyll

### PWA поддержка
- Service Worker для оффлайн режима
- Манифест для установки на устройство
- Кэширование ресурсов

### Производительность
- Минификация CSS и HTML
- Оптимизированная загрузка шрифтов
- Lazy loading изображений
- CDN для внешних библиотек

## 📊 Аналитика

### Интеграция Google Analytics
```yaml
# В _config.yml
analytics:
  google_id: "G-XXXXXXXXXX"  # Ваш GA ID
```

### Яндекс.Метрика
```yaml
analytics:
  yandex_id: "XXXXXXXX"  # Ваш Yandex ID
```

## 🔄 Обновления

### Обновление торговых данных
Данные обновляются через JavaScript файлы в папке `js/`:
- `trade_results.json` - результаты торгов
- `analytics-data.js` - данные аналитики

### Автоматическое обновление
Service Worker автоматически обновляет кэш при изменении файлов.

## 🐛 Отладка

### Локальная отладка
```bash
# Режим разработки с автообновлением
bundle exec jekyll serve --livereload

# Генерация без сервера
bundle exec jekyll build

# Очистка кэша
bundle exec jekyll clean
```

### Проверка на ошибки
```bash
# Проверка HTML
bundle exec htmlproofer ./_site

# Проверка конфигурации
bundle exec jekyll doctor
```

## 📱 Тестирование

### Lighthouse аудит
- Производительность: 90+
- Доступность: 95+
- Лучшие практики: 90+
- SEO: 95+

### Кроссбраузерность
- Chrome/Chromium
- Firefox
- Safari
- Edge
- Мобильные браузеры

## 🔐 Безопасность

### CSP заголовки
Настройте Content Security Policy через Jekyll или сервер:

```html
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; script-src 'self' 'unsafe-inline' cdnjs.cloudflare.com;">
```

### HTTPS
GitHub Pages автоматически предоставляет HTTPS для пользовательских доменов.

## 📞 Поддержка

### Контакты разработчиков
- Telegram: [@Solnyshchko](https://t.me/Solnyshchko)
- Email: support@cryptowatch-mexc.com
- GitHub Issues: [Создать issue](https://github.com/позитив007/CryptoWatch-MEXC/issues)

### FAQ

**Q: Как добавить новую страницу?**
A: Создайте HTML файл с YAML front matter и добавьте в навигацию.

**Q: Как изменить дизайн?**
A: Отредактируйте CSS переменные в `css/style.css`.

**Q: Как настроить домен?**
A: Добавьте файл `CNAME` с вашим доменом в корень репозитория.

## 📄 Лицензия

MIT License - см. файл LICENSE в корне проекта.

---

**CryptoWatch MEXC** - профессиональный торговый бот для криптовалют.
