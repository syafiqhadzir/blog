---
    layout: null
permalink: /sw.js
---
/**
 * Service Worker v4 - Workbox 7 Implementation
 * Production-grade caching with Google Workbox
 * Generated: {{ 'now' | date: '%Y-%m-%d' }}
 */

// Import Workbox from CDN
importScripts('https://storage.googleapis.com/workbox-cdn/releases/7.3.0/workbox-sw.js');

// Configure Workbox
workbox.setConfig({ debug: false });

const { precacheAndRoute, cleanupOutdatedCaches } = workbox.precaching;
const { registerRoute, NavigationRoute, Route } = workbox.routing;
const { CacheFirst, StaleWhileRevalidate, NetworkFirst } = workbox.strategies;
const { ExpirationPlugin } = workbox.expiration;
const { CacheableResponsePlugin } = workbox.cacheableResponse;

// Cache names
const CACHE_PREFIX = 'sh-blog';
const CACHE_VERSION = 'v4';
const OFFLINE_URL = '{{ "offline.html" | relative_url }}';

// Precache core assets
precacheAndRoute([
    { url: '{{ "/" | relative_url }}', revision: '{{ site.time | date: "%s" }}' },
    { url: '{{ "offline.html" | relative_url }}', revision: '{{ site.time | date: "%s" }}' },
    { url: '{{ "archive.html" | relative_url }}', revision: '{{ site.time | date: "%s" }}' },
    { url: '{{ "logo.png" | relative_url }}', revision: '1' },
    { url: '{{ "icons/icon-192.png" | relative_url }}', revision: '1' },
    { url: '{{ "icons/icon-512.png" | relative_url }}', revision: '1' }
]);

// Clean up old caches
cleanupOutdatedCaches();

// Navigation requests: NetworkFirst with offline fallback
const navigationHandler = new NetworkFirst({
    cacheName: `${CACHE_PREFIX}-pages-${CACHE_VERSION}`,
    plugins: [
        new CacheableResponsePlugin({ statuses: [200] }),
        new ExpirationPlugin({
            maxEntries: 50,
            maxAgeSeconds: 24 * 60 * 60, // 24 hours
        }),
    ],
});

// Offline fallback for navigation
const navigationRoute = new NavigationRoute(navigationHandler, {
    denylist: [/\/sw\.js$/, /\/feed\.xml$/],
});
registerRoute(navigationRoute);

// Images: CacheFirst with long expiration
registerRoute(
    ({ request }) => request.destination === 'image',
    new CacheFirst({
        cacheName: `${CACHE_PREFIX}-images-${CACHE_VERSION}`,
        plugins: [
            new CacheableResponsePlugin({ statuses: [200] }),
            new ExpirationPlugin({
                maxEntries: 100,
                maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
            }),
        ],
    })
);

// CSS/JS: StaleWhileRevalidate for fast loads with updates
registerRoute(
    ({ request }) =>
        request.destination === 'style' || request.destination === 'script',
    new StaleWhileRevalidate({
        cacheName: `${CACHE_PREFIX}-assets-${CACHE_VERSION}`,
        plugins: [
            new CacheableResponsePlugin({ statuses: [200] }),
            new ExpirationPlugin({
                maxEntries: 50,
                maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
            }),
        ],
    })
);

// Fonts: CacheFirst for performance
registerRoute(
    ({ request }) => request.destination === 'font',
    new CacheFirst({
        cacheName: `${CACHE_PREFIX}-fonts-${CACHE_VERSION}`,
        plugins: [
            new CacheableResponsePlugin({ statuses: [200] }),
            new ExpirationPlugin({
                maxEntries: 20,
                maxAgeSeconds: 365 * 24 * 60 * 60, // 1 year
            }),
        ],
    })
);

// AMP CDN: StaleWhileRevalidate for third-party scripts
registerRoute(
    ({ url }) => url.origin === 'https://cdn.ampproject.org',
    new StaleWhileRevalidate({
        cacheName: `${CACHE_PREFIX}-amp-${CACHE_VERSION}`,
        plugins: [
            new CacheableResponsePlugin({ statuses: [200] }),
            new ExpirationPlugin({
                maxEntries: 30,
                maxAgeSeconds: 24 * 60 * 60, // 24 hours
            }),
        ],
    })
);

// Offline fallback
self.addEventListener('fetch', (event) => {
    if (event.request.mode === 'navigate') {
        event.respondWith(
            (async () => {
                try {
                    return await navigationHandler.handle({ event, request: event.request });
                } catch (error) {
                    const cache = await caches.open(`${CACHE_PREFIX}-pages-${CACHE_VERSION}`);
                    return await cache.match(OFFLINE_URL);
                }
            })()
        );
    }
});

// Skip waiting on install
self.addEventListener('install', () => self.skipWaiting());

// Claim clients on activate
self.addEventListener('activate', () => self.clients.claim());

