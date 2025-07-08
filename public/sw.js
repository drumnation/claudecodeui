// Service Worker for Claude Code UI PWA
const CACHE_NAME = 'claude-ui-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json'
];

// Install event
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
  );
  self.skipWaiting();
});

// Fetch event
self.addEventListener('fetch', event => {
  // Skip cross-origin requests and extension requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }
  
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Return cached response if found
        if (response) {
          return response;
        }
        // Otherwise fetch from network with error handling
        return fetch(event.request).catch(error => {
          console.warn('SW fetch failed:', event.request.url, error);
          // For development/ngrok, just return a basic response for failed fetches
          if (event.request.url.includes('ngrok') || event.request.url.includes('localhost')) {
            return new Response('Service Worker: Resource unavailable in development mode', {
              status: 503,
              statusText: 'Service Unavailable'
            });
          }
          throw error;
        });
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
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});