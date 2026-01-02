// BeatMaster - Service Worker (Platzhalter)
// Wird in Phase 7 vollständig implementiert

const CACHE_NAME = 'beatmaster-v1';

// Installation
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installiert');
  self.skipWaiting();
});

// Aktivierung
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Aktiviert');
  event.waitUntil(clients.claim());
});

// Fetch - Aktuell nur Netzwerk (Caching in Phase 7)
self.addEventListener('fetch', (event) => {
  // Aktuell: Nur Netzwerk, kein Caching
  event.respondWith(fetch(event.request));
});
