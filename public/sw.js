// Service Worker for Telekom Servis PWA
const CACHE_NAME = 'telekom-servis-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Network first for all API and HTML requests
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
