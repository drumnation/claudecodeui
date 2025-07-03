// Claude Code UI Service Worker
// Provides PWA functionality without interfering with development

const CACHE_NAME = 'claude-code-ui-v1';
const DEV_MODE = location.hostname === 'localhost' || location.hostname === '127.0.0.1';

console.log('SW: Claude Code UI Service Worker starting...');

self.addEventListener('install', function(event) {
  console.log('SW: Installing...');
  
  if (DEV_MODE) {
    // In development, skip waiting to avoid conflicts
    self.skipWaiting();
  } else {
    // In production, cache essential assets
    event.waitUntil(
      caches.open(CACHE_NAME).then(function(cache) {
        return cache.addAll([
          '/',
          '/manifest.json',
          '/icons/icon-192x192.png',
          '/icons/icon-512x512.png'
        ]);
      })
    );
  }
});

self.addEventListener('activate', function(event) {
  console.log('SW: Activating...');
  
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then(function(cacheNames) {
        return Promise.all(
          cacheNames.map(function(cacheName) {
            if (cacheName !== CACHE_NAME) {
              console.log('SW: Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // Take control of all clients
      self.clients.claim()
    ])
  );
});

self.addEventListener('fetch', function(event) {
  // In development mode, don't intercept fetches at all - let the browser handle everything
  if (DEV_MODE) {
    return; // Don't call event.respondWith() - let browser handle naturally
  }

  // Only handle specific requests in production to avoid conflicts
  const url = new URL(event.request.url);
  
  // Only handle same-origin requests for PWA assets
  if (url.origin !== location.origin) {
    return; // Let browser handle cross-origin requests
  }

  // Only handle specific PWA assets
  if (url.pathname.startsWith('/icons/') || 
      url.pathname === '/manifest.json' || 
      url.pathname === '/') {
    
    event.respondWith(
      caches.match(event.request)
        .then(function(response) {
          if (response) {
            return response;
          }
          
          return fetch(event.request)
            .then(function(response) {
              if (response.status === 200) {
                const responseClone = response.clone();
                caches.open(CACHE_NAME)
                  .then(function(cache) {
                    cache.put(event.request, responseClone);
                  })
                  .catch(function(error) {
                    console.log('SW: Cache put failed:', error);
                  });
              }
              return response;
            })
            .catch(function(error) {
              console.log('SW: Fetch failed:', error);
              throw error;
            });
        })
        .catch(function(error) {
          console.log('SW: Cache match failed:', error);
          return fetch(event.request);
        })
    );
  }
  // For all other requests, let the browser handle them naturally
});