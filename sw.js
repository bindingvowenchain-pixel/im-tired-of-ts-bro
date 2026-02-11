const CACHE_NAME = 'fnae-unity-offline-v2';  // Bump version (e.g., v3) on game updates to force refresh

const urlsToCache = [
  '/',                          // Ensures index.html
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
  // If icons/ has separate files, add e.g.:
  // '/TemplateData/icons/unity-logo-dark.png',

  // Loader & framework (small, but essential)
  '/Build/fnae.loader.js',
  '/Build/fnae.framework.js',

  // All split parts – critical for merging offline
  '/Build/fnae.data.part1',
  '/Build/fnae.data.part2',
  '/Build/fnae.data.part3',
  '/Build/fnae.wasm.part1',
  '/Build/fnae.wasm.part2',
  '/StreamingAssets/202512191935.webm.part1',
  '/StreamingAssets/202512191935.webm.part2',
  '/StreamingAssets/202512191935.webm.part3',

  // Add any other files Unity might load dynamically (check Network tab)
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[SW] Caching core files + parts');
        return cache.addAll(urlsToCache)
          .catch(err => {
            console.error('[SW] Some files failed to cache during install:', err);
            // Continue anyway – partial cache is better than none
          });
      })
  );
  // Skip waiting so new SW activates immediately
  self.skipWaiting();
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
  // Take control of open pages immediately
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        if (cachedResponse) {
          console.log('[SW] Serving from cache:', event.request.url);
          return cachedResponse;
        }

        // Not cached → fetch from network, cache for future
        return fetch(event.request).then(networkResponse => {
          if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
            return networkResponse;
          }

          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseToCache);
            });

          return networkResponse;
        }).catch(() => {
          // Offline fallback (optional: show a message or cached fallback page)
          console.log('[SW] Offline – no network and not cached');
          // Could return a custom Response if you want
        });
      })
  );
});
