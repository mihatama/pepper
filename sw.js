const CACHE_NAME = 'pepper-craft-ai-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/css/style.css',
  '/css/responsive.css',
  '/js/app.js',
  '/js/radar-chart.js',
  '/js/pepper-calculator.js',
  '/js/speech-recognition.js',
  '/js/gemini-api.js',
  '/js/i18n.js',
  '/locales/en.json',
  '/locales/ja.json',
  '/manifest.json'
  // Removed external CDN to avoid CSP issues
];

// Install event
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch event
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Return cached version or fetch from network
        if (response) {
          return response;
        }
        return fetch(event.request);
      }
    )
  );
});

// Activate event
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
