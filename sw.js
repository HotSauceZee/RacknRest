const CACHE_NAME = 'plate-timer-v5';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './vite.svg'
];

self.addEventListener('install', (event) => {
  self.skipWaiting(); // Force this new SW to verify and install immediately
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      self.clients.claim(), // Take control of all clients immediately
      caches.keys().then((keys) => { // Delete all old caches
        return Promise.all(
          keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
        );
      })
    ])
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
