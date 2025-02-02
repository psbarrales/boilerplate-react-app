/// <reference no-default-lib="true"/>
/// <reference lib="esnext" />
/// <reference lib="webworker" /> 

const CACHE_NAME = 'static-cache-v1';

// Archivos que serán cacheados automáticamente
const STATIC_ASSETS = [
  './', // Asegura que la raíz esté también en el caché
];

// Evento de instalación: se cachean los archivos iniciales
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Pre-caching static assets');
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
          if (cache !== CACHE_NAME) {
            console.log('[Service Worker] Deleting old cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Intercepción de fetch: almacenamos en caché CSS y JS
self.addEventListener('fetch', (event) => {
  if (event.request.url.endsWith('.css') || event.request.url.endsWith('.js')) {
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
          return caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          });
        });
      })
    );
  }
});
