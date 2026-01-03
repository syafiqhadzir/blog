import { CacheableResponsePlugin } from 'workbox-cacheable-response';
import * as workboxCore from 'workbox-core';
import { ExpirationPlugin } from 'workbox-expiration';
import { cleanupOutdatedCaches, precacheAndRoute } from 'workbox-precaching';
import { NavigationRoute, registerRoute } from 'workbox-routing';
import { CacheFirst, NetworkFirst, StaleWhileRevalidate } from 'workbox-strategies';

// Cache names
const CACHE_PREFIX = 'sh-blog';
const CACHE_VERSION = 'v4';
const OFFLINE_URL = '/offline.html';

// Precache core assets
// eslint-disable-next-line unicorn/prefer-global-this
precacheAndRoute(self.__WB_MANIFEST);

// Clean up old caches
cleanupOutdatedCaches();

// Navigation requests: NetworkFirst with offline fallback
const navigationHandler = new NetworkFirst({
    cacheName: `${CACHE_PREFIX}-pages-${CACHE_VERSION}`,
    plugins: [
        new CacheableResponsePlugin({ statuses: [200] }),
        new ExpirationPlugin({
            maxAgeSeconds: 24 * 60 * 60, // 24 hours
            maxEntries: 50,
        }),
    ],
});

const navigationRoute = new NavigationRoute(
    async (parameters) => {
        try {
            return await navigationHandler.handle(parameters);
        } catch {
            const cache = await caches.open(`${CACHE_PREFIX}-pages-${CACHE_VERSION}`);
            // Try to find offline page in precache
            const precacheName = workboxCore.cacheNames.precache;
            const precache = await caches.open(precacheName);
            // workbox-build generates cache keys with revision info, so plain URL match might fail
            // unless we use match(url, {ignoreSearch: true}) or getCacheKeyForURL
            // But inside SW, we don't have getCacheKeyForURL easily exposed unless imported from precaching
            // However, OFFLINE_URL is precached.

            const offlineResponse = await precache.match(OFFLINE_URL);
            if (offlineResponse) return offlineResponse;

            return await cache.match(OFFLINE_URL);
        }
    },
    {
        denylist: [/\/sw\.js$/, /\/feed\.xml$/],
    },
);
registerRoute(navigationRoute);

// Images: CacheFirst with long expiration
registerRoute(
    ({ request }) => request.destination === 'image',
    new CacheFirst({
        cacheName: `${CACHE_PREFIX}-images-${CACHE_VERSION}`,
        plugins: [
            new CacheableResponsePlugin({ statuses: [200] }),
            new ExpirationPlugin({
                maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
                maxEntries: 100,
            }),
        ],
    }),
);

// CSS/JS: StaleWhileRevalidate
registerRoute(
    ({ request }) => request.destination === 'style' || request.destination === 'script',
    new StaleWhileRevalidate({
        cacheName: `${CACHE_PREFIX}-assets-${CACHE_VERSION}`,
        plugins: [
            new CacheableResponsePlugin({ statuses: [200] }),
            new ExpirationPlugin({
                maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
                maxEntries: 50,
            }),
        ],
    }),
);

// Fonts: CacheFirst
registerRoute(
    ({ request }) => request.destination === 'font',
    new CacheFirst({
        cacheName: `${CACHE_PREFIX}-fonts-${CACHE_VERSION}`,
        plugins: [
            new CacheableResponsePlugin({ statuses: [200] }),
            new ExpirationPlugin({
                maxAgeSeconds: 365 * 24 * 60 * 60, // 1 year
                maxEntries: 20,
            }),
        ],
    }),
);

// AMP CDN
registerRoute(
    ({ url }) => url.origin === 'https://cdn.ampproject.org',
    new StaleWhileRevalidate({
        cacheName: `${CACHE_PREFIX}-amp-${CACHE_VERSION}`,
        plugins: [
            new CacheableResponsePlugin({ statuses: [200] }),
            new ExpirationPlugin({
                maxAgeSeconds: 24 * 60 * 60, // 24 hours
                maxEntries: 30,
            }),
        ],
    }),
);

// Skip waiting on install
globalThis.addEventListener('install', () => globalThis.skipWaiting());

// Claim clients on activate
globalThis.addEventListener('activate', () => globalThis.clients.claim());
