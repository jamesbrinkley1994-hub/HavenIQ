const CACHE_NAME = 'haveniq-v1'
const STATIC_ASSETS = [
  '/haven/app',
  '/haven/login',
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS)).catch(() => {})
  )
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
    )
  )
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  // Network first — always get fresh data, fall back to cache
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  )
})
