// Rybiorz: działanie bez zasięgu. Zmień numer wersji przy każdej aktualizacji apki.
const WERSJA = 'rybiorz-v1';
const PLIKI = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css', 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(WERSJA).then(c => c.addAll(PLIKI)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(k => Promise.all(k.filter(n => n !== WERSJA).map(n => caches.delete(n)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET') return;
  // pogoda i mapa tylko z internetu
  if (url.hostname.includes('open-meteo') || url.hostname.includes('openstreetmap')) return;
  // apka: najpierw internet (świeża wersja), bez zasięgu z pamięci
  e.respondWith(
    fetch(e.request).then(r => {
      if (r.ok) { const kopia = r.clone(); caches.open(WERSJA).then(c => c.put(e.request, kopia)); }
      return r;
    }).catch(() => caches.match(e.request, {ignoreSearch: true}).then(r => r || caches.match('./index.html')))
  );
});
