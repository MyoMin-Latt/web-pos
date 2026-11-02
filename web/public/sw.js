/* Web POS service worker — app-shell + static-asset cache.
   API calls (/api) are NEVER cached: they must go to the server, and the
   existing IndexedDB outbox + syncEngine already handles offline sales. */
const CACHE = 'web-pos-v1';
const APP_SHELL = ['/', '/index.html', '/manifest.webmanifest', '/icons/icon-192.png', '/icons/icon-512.png'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(APP_SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // API: network only, never cache. A failed fetch is expected offline;
  // the app queues the sale in IndexedDB and syncs when back online.
  if (url.pathname.startsWith('/api')) return;

  // SPA navigation (/, /pos, /invoices, ...): network first, cached
  // index.html as the offline fallback so routes still open offline.
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req).catch(() => caches.match('/index.html', { ignoreSearch: true }))
    );
    return;
  }

  // Same-origin static assets (hashed JS/CSS, icons): cache first, so the
  // app shell works offline after the first online load. New deploys get a
  // new cache name (bump CACHE above) so stale assets are dropped.
  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(req, { ignoreSearch: true }).then((cached) => {
        if (cached) return cached;
        return fetch(req).then((res) => {
          if (res.ok) {
            const copy = res.clone();
            caches.open(CACHE).then((cache) => cache.put(req, copy));
          }
          return res;
        });
      })
    );
  }
  // Cross-origin (fonts, etc.): network only.
});
