// Service Worker - Force Unregister and Clear Cache
console.log('SW: Force unregistering...');

self.addEventListener('install', function(event) {
  console.log('SW: Installing and skipping waiting...');
  self.skipWaiting();
});

self.addEventListener('activate', function(event) {
  console.log('SW: Activating and clearing all caches...');
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          console.log('SW: Deleting cache:', cacheName);
          return caches.delete(cacheName);
        })
      );
    }).then(function() {
      console.log('SW: All caches cleared, claiming clients...');
      return self.clients.claim();
    }).then(function() {
      console.log('SW: Unregistering self...');
      return self.registration.unregister();
    }).then(function() {
      console.log('SW: Forcing page reload...');
      return self.clients.matchAll().then(function(clients) {
        clients.forEach(client => {
          client.navigate(client.url);
        });
      });
    })
  );
});

// Pass through all fetch requests without caching
self.addEventListener('fetch', function(event) {
  event.respondWith(fetch(event.request));
});