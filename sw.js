/* وِرد — service worker : application entièrement hors ligne.
   Pré-cache de la coquille, des données coraniques, des polices et des icônes.
   Publier une mise à jour = incrémenter VERSION (et APP_VERSION dans js/app.js). */
const VERSION = 'wird-v6';

const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './css/app.css',
  './js/app.js',
  './data/quran.json',
  './data/tajweed.json',
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

/* 'no-cache' : chaque fichier est revalidé auprès du serveur (ETag), sinon la
   nouvelle version du service worker précacherait l'ancien code depuis le cache HTTP */
const fresh = (url) => new Request(url, { cache: 'no-cache' });

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(VERSION).then((cache) => cache.addAll(ASSETS.map(fresh))).then(() => self.skipWaiting())
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
   revalide la coquille, remplace le cache et indique au client si quelque chose a changé. */
self.addEventListener('message', (event) => {
  if (!event.data || event.data.type !== 'REFRESH_SHELL') return;
  const reply = (msg) => { if (event.source) event.source.postMessage(Object.assign({ type: 'SHELL_REFRESHED' }, msg)); };
  const job = refreshShell()
    .then((changed) => reply({ ok: true, changed }))
    .catch(() => reply({ ok: false }));
  if (event.waitUntil) event.waitUntil(job);
});

function sameResponse(a, b) {
  const tag = (r) => r.headers.get('etag') || r.headers.get('last-modified');
  if (tag(a) && tag(b)) return Promise.resolve(tag(a) === tag(b));
  return Promise.all([a.clone().arrayBuffer(), b.clone().arrayBuffer()]).then(([x, y]) => {
    if (x.byteLength !== y.byteLength) return false;
    const u = new Uint8Array(x), v = new Uint8Array(y);
    for (let i = 0; i < u.length; i++) if (u[i] !== v[i]) return false;
    return true;
  });
}

function refreshShell() {
  return caches.open(VERSION).then((cache) =>
    Promise.all(ASSETS.map((url) =>
      Promise.all([cache.match(url), fetch(fresh(url))]).then(([old, res]) => {
        if (!res.ok) throw new Error(url);
        const check = old ? sameResponse(old, res) : Promise.resolve(false);
        return check.then((same) => cache.put(url, res).then(() => !same));
      })
    )).then((changes) => changes.some(Boolean))
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
