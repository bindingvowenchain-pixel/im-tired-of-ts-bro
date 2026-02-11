const CACHE_NAME = 'fnae-offline-v1';  // Change to v2/v3 when updating game

const urlsToCache = [
  '/', 
  '/index.html',
  '/TemplateData/style.css',
  '/TemplateData/favicon.ico',
  '/TemplateData/progress-bar-empty-dark.png',
  '/TemplateData/progress-bar-empty-light.png',
  '/TemplateData/progress-bar-full-dark.png',
  '/TemplateData/progress-bar-full-light.png',
  '/TemplateData/unity-logo-dark.png',
  '/TemplateData/unity-logo-light.png',
  '/TemplateData/webmemd-icon.png',
  '/Build/fnae.loader.js',
  '/Build/fnae.framework.js',
  '/Build/fnae.data.part1',
  '/Build/fnae.data.part2',
  '/Build/fnae.data.part3',
  '/Build/fnae.wasm.part1',
  '/Build/fnae.wasm.part2',
  '/StreamingAssets/202512191935.webm.part1',
  '/StreamingAssets/202512191935.webm.part2',
  '/StreamingAssets/202512191935.webm.part3'
  // Add more if your game loads extra files dynamically
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
      .catch(err => console.error('Cache addAll failed:', err))
  );
  self.skipWaiting();  // Activate immediately
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      );
    })
  );
  self.clients.claim();  // Take control right away
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});
