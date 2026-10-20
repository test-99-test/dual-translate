// Service Worker for Gemini Live PWA & Offline Support
const CACHE_NAME = 'gemini-live-v5.2.0';

self.addEventListener('install', (event) => {
  // Do not automatically skip waiting if we want voluntary/optional user updates
  console.log('[SW] Service Worker installed');
});

self.addEventListener('activate', (event) => {
  console.log('[SW] Service Worker activated');
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[SW] Removing old cache:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  // Pass-through network first with cache fallback for static assets
  if (
    event.request.method !== 'GET' ||
    event.request.url.includes('/ws/') ||
    event.request.url.includes('/api/') ||
    event.request.url.includes('google.ai.generativelanguage')
  ) {
    return;
  }

  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('[SW] skipWaiting message received');
    self.skipWaiting();
  }
});
