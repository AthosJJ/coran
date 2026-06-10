/* وِرد — service worker : application entièrement hors ligne.
   Pré-cache de la coquille, des données coraniques, des polices et des icônes.
   Publier une mise à jour = incrémenter VERSION (et APP_VERSION dans js/app.js). */
const VERSION = 'wird-v2';

const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './css/app.css',
  './js/app.js',
  './data/quran.json',
  './fonts/UthmanicHafs.woff2',
  './fonts/ReemKufi.woff2',
  './fonts/IBMPlexSansArabic-Light.woff2',
  './fonts/IBMPlexSansArabic-Regular.woff2',
  './fonts/IBMPlexSansArabic-Medium.woff2',
  './icons/favicon.png',
  './icons/apple-touch-icon.png',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(VERSION).then((cache) => cache.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

/* Mise à jour à la demande (bouton « Rechercher une mise à jour ») :
   re-télécharge la coquille avec des requêtes conditionnelles (ETag → 304
   si inchangé) et remplace le cache, puis prévient le client. */
self.addEventListener('message', (event) => {
  if (!event.data || event.data.type !== 'REFRESH_SHELL') return;
  const job = refreshShell()
    .then((ok) => { if (event.source) event.source.postMessage({ type: 'SHELL_REFRESHED', ok }); })
    .catch(() => { if (event.source) event.source.postMessage({ type: 'SHELL_REFRESHED', ok: false }); });
  if (event.waitUntil) event.waitUntil(job);
});

function refreshShell() {
  return caches.open(VERSION).then((cache) =>
    Promise.all(ASSETS.map((url) =>
      fetch(url, { cache: 'no-cache' }).then((res) => {
        if (!res.ok) throw new Error(url);
        return cache.put(url, res);
      })
    )).then(() => true)
  );
}

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;

  event.respondWith(
    caches.match(req, { ignoreSearch: true }).then((hit) => {
      if (hit) return hit;
      return fetch(req)
        .then((res) => {
          // mise en cache opportuniste de ce qui n'était pas pré-caché
          if (res.ok) {
            const copy = res.clone();
            caches.open(VERSION).then((cache) => cache.put(req, copy));
          }
          return res;
        })
        .catch(() => {
          if (req.mode === 'navigate') return caches.match('./index.html');
          return Response.error();
        });
    })
  );
});
