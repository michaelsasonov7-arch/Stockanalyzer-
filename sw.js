// Stock Analyzer Pro — Service Worker
// Bump CACHE_VERSION on every deploy so old clients pick up the new app shell.
const CACHE_VERSION = 'stock-analyzer-v1';
const APP_SHELL = [
  './',
  './index.html',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

// Install — pre-cache the app shell, activate immediately
self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => cache.addAll(APP_SHELL)).catch(() => {})
  );
});

// Activate — drop old caches, take control of open tabs
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Fetch — network-first (stock data must be live), fall back to cache when offline.
// Only intercepts same-origin requests; API calls to external providers pass straight through.
self.addEventListener('fetch', (e) => {
  if (!e.request.url.startsWith(self.location.origin)) return;
  e.respondWith(
    fetch(e.request)
      .then((res) => {
        const copy = res.clone();
        caches.open(CACHE_VERSION).then((cache) => cache.put(e.request, copy)).catch(() => {});
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});

// Push notification handler (for future server-sent price alerts)
self.addEventListener('push', (e) => {
  const data = e.data ? e.data.json() : { title: 'Stock Alert', body: 'Price alert triggered!' };
  e.waitUntil(
    self.registration.showNotification(data.title || 'Stock Analyzer Pro', {
      body: data.body || '',
      icon: data.icon || './icons/icon-192.png',
      badge: data.badge || './icons/icon-96.png',
      tag: data.tag || 'stock-alert',
      requireInteraction: data.requireInteraction || false,
      data: data.url ? { url: data.url } : {}
    })
  );
});

// Notification click — focus existing tab or open a new one
self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      if (clientList.length > 0) return clientList[0].focus();
      return clients.openWindow(e.notification.data?.url || './');
    })
  );
});

// Background sync placeholder (future: periodic price checks)
self.addEventListener('sync', (e) => {
  if (e.tag === 'price-check') {
    // Reserved for a future background price-check feature
  }
});
