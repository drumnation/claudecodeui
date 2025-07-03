// Service Worker Unregistration Script
// This script removes any previously registered service workers
console.log('Unregistering service worker...');

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(function(registrations) {
    for(let registration of registrations) {
      console.log('Unregistering service worker:', registration.scope);
      registration.unregister().then(function(success) {
        if (success) {
          console.log('Service worker unregistered successfully');
          // Force reload to clear cache
          window.location.reload(true);
        } else {
          console.log('Service worker unregistration failed');
        }
      });
    }
    
    if (registrations.length === 0) {
      console.log('No service workers found to unregister');
    }
  });
}