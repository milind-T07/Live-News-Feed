/* ============================================
   SERVICE WORKER (sw.js) — Dev Agency Dispatch PWA
   Provides offline caching for core editorial assets
   ============================================ */

const CACHE_NAME = "dev-agency-dispatch-v1";
const STATIC_ASSETS = [
  "./",
  "./index.html",
  "./css/style.css",
  "./favicon.svg",
  "./manifest.webmanifest",
  "./js/theme.js",
  "./js/mock-data.js",
  "./js/api.js",
  "./js/ui.js",
  "./js/main.js"
];

// Install event: Pre-cache static assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// Activate event: Clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event: Cache-first for local static assets
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Handle same-origin static requests
  if (url.origin === location.origin) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const clone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return networkResponse;
        });
      })
    );
  }
});
