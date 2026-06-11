/* NeuraLearn Service Worker v2 — Full Offline Support */
const CACHE_NAME = 'neuralearn-v5';
const API_CACHE = 'neuralearn-api-v5';

// Core app shell — simplified for development and production reliability
const SHELL_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
];

// API endpoints to pre-cache
const API_PRECACHE = [
  '/api/lessons',
  '/api/knowledge-graph',
];

// ── Install: cache app shell ───────────────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      cache.addAll(SHELL_ASSETS).catch(() => {})
    )
  );
  self.skipWaiting();
});

// ── Activate: clean old caches ─────────────────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== CACHE_NAME && k !== API_CACHE)
          .map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// ── Fetch strategy ─────────────────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET
  if (request.method !== 'GET') return;

  // API calls: network-first, fallback to API cache
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then((res) => {
          if (res.ok) {
            const clone = res.clone();
            caches.open(API_CACHE).then((c) => c.put(request, clone));
          }
          return res;
        })
        .catch(() =>
          caches.match(request).then((cached) => {
            if (cached) return cached;
            return new Response(
              JSON.stringify({ error: 'offline', message: 'You are offline. Showing cached data.' }),
              { headers: { 'Content-Type': 'application/json' } }
            );
          })
        )
    );
    return;
  }

  // Static assets: cache-first, network fallback
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request)
        .then((res) => {
          if (res.status === 200) {
            const clone = res.clone();
            caches.open(CACHE_NAME).then((c) => c.put(request, clone));
          }
          return res;
        })
        .catch(() => {
          if (request.mode === 'navigate') {
            // Fallback to index.html for SPA routing
            return caches.match('/index.html').then((r) => {
              if (r) return r;
              // If not in cache, try to fetch it again as a last resort
              return fetch('/index.html').catch(() => new Response('Offline', { status: 503 }));
            });
          }
          return new Response('Offline', { status: 503 });
        });
    })
  );
});

// ── Background sync for offline quiz submissions ───────────────────────────
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-quiz-results') {
    event.waitUntil(syncFromIndexedDB());
  }
});

async function syncFromIndexedDB() {
  // Notify clients to run sync via offlineDB.js
  const clients = await self.clients.matchAll();
  clients.forEach((client) => {
    client.postMessage({ type: 'SYNC_QUIZZES' });
  });
}

// ── Message handler ────────────────────────────────────────────────────────
self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  if (event.data?.type === 'PRECACHE_LESSONS') {
    // Cache lesson data sent from the app
    const { lessons } = event.data;
    if (lessons) {
      caches.open(API_CACHE).then((cache) => {
        lessons.forEach((lesson) => {
          const url = `/api/lessons/${lesson.id}`;
          const response = new Response(JSON.stringify({ lesson }), {
            headers: { 'Content-Type': 'application/json' },
          });
          cache.put(url, response);
        });
      });
    }
  }
});
