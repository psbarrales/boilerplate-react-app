/// <reference no-default-lib="true"/>
/// <reference lib="esnext" />
/// <reference lib="webworker" />

const CACHE_NAME = 'static-cache-v1';
const DYNAMIC_CACHE_NAME = 'dynamic-cache-v1';
const FALLBACK_PAGE = '/offline.html';

// Archivos que serán cacheados automáticamente
const STATIC_ASSETS = [
  './', // Asegura que la raíz esté también en el caché
  FALLBACK_PAGE, // Página de fallback para modo offline
];

// Evento de instalación: se cachean los archivos iniciales
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log(
        '[Service Worker] Pre-caching static assets',
        CACHE_NAME,
        STATIC_ASSETS
      );
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Evento de activación: limpia caches antiguos
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME && cache !== DYNAMIC_CACHE_NAME) {
            console.log('[Service Worker] Deleting old cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Intercepción de fetch: almacenamos en caché CSS, JS y otros recursos dinámicos
self.addEventListener('fetch', (event) => {
  if (event.request.mode === 'navigate') {
    event.respondWith(
      (async () => {
        try {
          // First, try to use the navigation preload response if it's
          // supported.
          const preloadResponse = await event.preloadResponse;
          if (preloadResponse) {
            return preloadResponse;
          }

          // Always try the network first.
          const networkResponse = await fetch(event.request);
          return networkResponse;
        } catch (error) {
          // catch is only triggered if an exception is thrown, which is
          // likely due to a network error.
          // If fetch() returns a valid HTTP response with a response code in
          // the 4xx or 5xx range, the catch() will NOT be called.
          console.log('Fetch failed; returning offline page instead.', error);

          const cache = await caches.open(CACHE_NAME);
          const cachedResponse = await cache.match(FALLBACK_PAGE);
          return cachedResponse;
        }
      })()
    );
  } else if (
    event.request.url.endsWith('.css') ||
    event.request.url.endsWith('.js')
  ) {
    event.respondWith(
      caches.match(event.request).then((response) => {
        if (response) {
          console.log(
            '[Service Worker] Fetching from cache:',
            event.request.url
          );
          return response;
        }

        console.log(
          '[Service Worker] Fetching from network:',
          event.request.url
        );
        return fetch(event.request).then((networkResponse) => {
          return caches.open(DYNAMIC_CACHE_NAME).then((cache) => {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          });
        });
      })
    );
  } else if (event.request.method === 'GET') {
    event.respondWith(
      caches.match(event.request).then((response) => {
        if (response) {
          console.log(
            '[Service Worker] Fetching from cache:',
            event.request.url
          );
          return response;
        }

        console.log(
          '[Service Worker] Fetching from network:',
          event.request.url
        );
        return fetch(event.request)
          .then((networkResponse) => {
            return caches.open(DYNAMIC_CACHE_NAME).then((cache) => {
              cache.put(event.request, networkResponse.clone());
              return networkResponse;
            });
          })
          .catch(() => {
            if (event.request.mode === 'navigate') {
              return caches.match(FALLBACK_PAGE);
            }
          });
      })
    );
  }
});

// Manejo de notificaciones push
self.addEventListener('push', (event) => {
  if (event.data) {
    console.log({ event }, event.data);
    const data = event.data.text();
    console.log('[Service Worker] Push received:', data);
    const options = {
      body: data,
      icon: '/icon.png',
      badge: '/badge.png',
    };

    event.waitUntil(self.registration.showNotification(data, options));
  }
});

self.addEventListener('sync', (event) => {
  console.log('[Service Worker] Sync event:', event);
});

self.addEventListener('periodicsync', (event) => {
  console.log('[Service Worker] Periodic Sync event:', event);
  event.waitUntil(
    self.registration.showNotification('Latest News', {
      body: 'You have new news!',
      icon: '/icon.png',
      badge: '/badge.png',
    })
  );
});

// Manejo de respuesta a notificaciones push
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  console.log('[Service Worker] Notification click:', event);
});
