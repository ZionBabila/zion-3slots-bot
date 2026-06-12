const CACHE = 'csharp-hero-v1';
const ASSETS = [
  '/zion-3slots-bot/',
  '/zion-3slots-bot/index.html',
  '/zion-3slots-bot/arrays.html',
  '/zion-3slots-bot/constructors.html',
  '/zion-3slots-bot/unity.html',
  '/zion-3slots-bot/manifest.json'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
  ));
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  );
});
