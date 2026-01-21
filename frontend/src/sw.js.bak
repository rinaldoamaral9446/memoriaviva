import { cleanupOutdatedCaches, precacheAndRoute } from 'workbox-precaching'
import { registerRoute } from 'workbox-routing'
import { NetworkFirst, StaleWhileRevalidate, CacheFirst, NetworkOnly } from 'workbox-strategies'
import { BackgroundSyncPlugin } from 'workbox-background-sync'
import { ExpirationPlugin } from 'workbox-expiration'

// Cleanup old caches
cleanupOutdatedCaches()

// Precache static assets (Vite injects definitions here)
precacheAndRoute(self.__WB_MANIFEST)

// ---------------------------------------------------------------------------
// 1. Runtime Caching Strategies
// ---------------------------------------------------------------------------

// API Navigation (App Shell behavior for SPA)
// Ensures the app shell loads even if offline
registerRoute(
    ({ request }) => request.mode === 'navigate',
    new NetworkFirst({
        cacheName: 'app-shell',
        plugins: [
            new ExpirationPlugin({ maxEntries: 50 }),
        ],
    })
)

// Styles and Scripts (StaleWhileRevalidate)
registerRoute(
    ({ request }) => request.destination === 'style' || request.destination === 'script' || request.destination === 'worker',
    new StaleWhileRevalidate({
        cacheName: 'assets-cache',
    })
)

// Images (CacheFirst)
registerRoute(
    ({ request }) => request.destination === 'image',
    new CacheFirst({
        cacheName: 'image-cache',
        plugins: [
            new ExpirationPlugin({
                maxEntries: 60,
                maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
            }),
        ],
    })
)

// Google Fonts (CacheFirst)
registerRoute(
    ({ url }) => url.origin === 'https://fonts.googleapis.com' || url.origin === 'https://fonts.gstatic.com',
    new CacheFirst({
        cacheName: 'google-fonts',
        plugins: [
            new ExpirationPlugin({
                maxEntries: 30,
                maxAgeSeconds: 365 * 24 * 60 * 60, // 1 year
            }),
        ],
    })
)

// ---------------------------------------------------------------------------
// 2. Background Sync
// ---------------------------------------------------------------------------

// Queue for retry requests
const bgSyncPlugin = new BackgroundSyncPlugin('memoria-viva-queue', {
    maxRetentionTime: 24 * 60, // Retry for 24h
})

// Register sync for Memory Creation (POST)
registerRoute(
    ({ url, method }) => url.pathname.includes('/api/memories') && method === 'POST',
    new NetworkOnly({
        plugins: [bgSyncPlugin],
    })
)

self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting()
    }
})
