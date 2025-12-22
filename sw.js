---
    layout: null
permalink: /sw.js
---
// Service Worker v3 - Stale-While-Revalidate Strategy
// Generated: {{ 'now' | date: '%Y-%m-%d' }}

const CACHE_VERSION = 'sh-blog-v3';
const OFFLINE_URL = '{{ "offline.html" | relative_url }}';

// Assets to precache on install
const PRECACHE_ASSETS = [
    '{{ "/" | relative_url }}',
    '{{ "offline.html" | relative_url }}',
    '{{ "archive.html" | relative_url }}',
    '{{ "about.html" | relative_url }}',
    '{{ "logo.png" | relative_url }}',
    '{{ "icons/icon-192.png" | relative_url }}',
    '{{ "icons/icon-512.png" | relative_url }}'
];

// Install: Precache core assets
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_VERSION)
            .then(cache => cache.addAll(PRECACHE_ASSETS))
            .then(() => self.skipWaiting())
    );
});

// Activate: Clean old caches
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys()
            .then(keys => Promise.all(
                keys.filter(key => key !== CACHE_VERSION)
                    .map(key => caches.delete(key))
            ))
            .then(() => self.clients.claim())
    );
});

// Fetch: Stale-while-revalidate for HTML, cache-first for assets
self.addEventListener('fetch', event => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip non-GET requests
    if (request.method !== 'GET') return;

    // Skip cross-origin requests
    if (url.origin !== location.origin) return;

    // Navigation requests: Network-first with offline fallback
    if (request.mode === 'navigate') {
        event.respondWith(
            fetch(request)
                .then(response => {
                    // Cache successful responses
                    if (response.status === 200) {
                        const clone = response.clone();
                        caches.open(CACHE_VERSION)
                            .then(cache => cache.put(request, clone));
                    }
                    return response;
                })
                .catch(() => caches.match(OFFLINE_URL))
        );
        return;
    }

    // Static assets: Stale-while-revalidate
    event.respondWith(
        caches.open(CACHE_VERSION).then(cache =>
            cache.match(request).then(cached => {
                const fetched = fetch(request).then(response => {
                    if (response.status === 200 && response.type === 'basic') {
                        cache.put(request, response.clone());
                    }
                    return response;
                }).catch(() => cached);

                return cached || fetched;
            })
        )
    );
});
