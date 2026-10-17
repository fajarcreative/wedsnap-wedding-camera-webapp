// WedSnap Lightweight Safe PWA Service Worker
// Designed for GitHub Pages & Mobile Webviews (eliminates stale cache and network crashes)

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(keys.map((key) => caches.delete(key)));
    })
  );
  self.clients.claim();
});

// Pass-through fetch event listener satisfies PWA install criteria
// without caching stale hashed chunks or throwing respondWith errors on mobile
self.addEventListener('fetch', (event) => {
  // Standard network request - pass-through
});
