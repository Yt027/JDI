// Define a cache name
const cacheName = 'jdi-v1';

// List of static assets to cache
const staticAssets = [
  '/',
  '/index.html',
  '/assets/style/app.css',
  '/assets/style/all.min.css',
  '/assets/scripts/app.js',
  '/assets/icons/JDI-192x192.png',
  '/assets/icons/JDI-512x512.png',
  '/assets/libs/JS/ApexChart/apexcharts.min.js',
  // Add other assets here
];

// Install event: Cache the static assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(cacheName)
      .then(cache => cache.addAll(staticAssets))
  );
});

// Activate event: Clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(name => name !== cacheName)
          .map(name => caches.delete(name))
      );
    })
  );
});

// Fetch event: Serve cached assets when offline
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});