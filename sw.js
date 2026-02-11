const CACHE_NAME = 'fnae-unity-cache-v1';  // Bump 'v1' → 'v2' when updating game to force re-cache

const urlsToCache = [
  '/',                          // Root → serves index.html
  '/index.html',
  '/Build/fnae.loader.js',
  '/Build/fnae.framework.js',
  '/Build/fnae.data.part1',
  '/Build/fnae.data.part2',
  '/Build/fnae.data.part3',
  '/Build/fnae.wasm.part1',
  '/Build/fnae.wasm.part2',
  '/TemplateData/style.css',
  '/TemplateData/favicon.ico',
  '/TemplateData/progress-bar-empty-dark.png',
  '/TemplateData/progress-bar-empty-light.png',
  '/TemplateData/progress-bar-full-dark.png',
  '/TemplateData/progress-bar-full-light.png',
  '/TemplateData/unity-logo-dark.png',
  '/TemplateData/unity-logo-light.png',
  '/TemplateData/webmemd-icon.png',
  // If you have more icons or other files in /icons/, add them like:
  // '/TemplateData/icons/unity-logo-dark.png',
  // Add any other assets your game loads dynamically (e.g., audio, extra images)
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Caching Unity files');
        return cache.addAll(urlsToCache);
      })
      .catch(err => console.error('Cache addAll failed:', err))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(name => name !== CACHE_NAME)
          .map(name => caches.delete(name))
      );
    })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;  // Serve from cache
        }
        // Optional: cache new requests on-the-fly (good for any missed files)
        return fetch(event.request).then(networkResponse => {
          if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
            return networkResponse;
          }
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME)
            .then(cache => cache.put(event.request, responseToCache));
          return networkResponse;
        });
      })
  );
});
