---
    layout: null
permalink: /sw.js
---
const CACHE_NAME = 'sh-blog-v2';
const OFFLINE_URL = '{{ "offline.html" | relative_url }}';

const PRECACHE_ASSETS = [
    '{{ "/" | relative_url }}',
    '{{ "offline.html" | relative_url }}',
    '{{ "logo.png" | relative_url }}',
    '{{ "icons/icon-192.png" | relative_url }}',
    '{{ "icons/icon-512.png" | relative_url }}'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return cache.addAll(PRECACHE_ASSETS);
        })
    );
    self.skipWaiting();
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(
                keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
            );
        })
    );
    self.clients.claim();
});

self.addEventListener('fetch', event => {
    if (event.request.mode === 'navigate') {
        event.respondWith(
            fetch(event.request).catch(() => {
                return caches.match(OFFLINE_URL);
            })
        );
        return;
    }

    event.respondWith(
        caches.match(event.request).then(cached => {
            return cached || fetch(event.request).then(response => {
                if (response.status === 200 && response.type === 'basic') {
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
                }
                return response;
            });
        })
    );
});
