const CACHE = 'emberfall-blackstar-2d-v15-3';
const CORE = [
  './',
  './index.html',
  './styles.css',
  './veilforged.css',
  './nightfall.css',
  './reforged.css',
  './modern2d.css',
  './cinematic2d-v13.css',
  './cinematic2d-v14.css',
  './renderer2d-v14.js',
  './combat-fx2d.js',
  './actionrpg2d.js',
  './reforged-ui.js',
  './game.js',
  './mobile.js',
  './manifest.webmanifest',
  './assets/promo.png',
  './assets/icon-192.png',
  './assets/icon-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then(cached => {
      const network = fetch(event.request)
        .then(response => {
          if (response && response.ok && new URL(event.request.url).origin === self.location.origin) {
            const copy = response.clone();
            caches.open(CACHE).then(cache => cache.put(event.request, copy));
          }
          return response;
        })
        .catch(() => cached || caches.match('./index.html'));
      return cached || network;
    })
  );
});