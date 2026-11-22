// Réseau d'abord : chaque module publié sur GitHub Pages arrive tout de suite.
// Le cache ne sert que hors connexion. VERSION est recalculée par build.py à chaque publication.
const VERSION = 'laureat-607c1119c5';
const ASSETS = ['./', './index.html', './style.css', './data.js', './app.js', './manifest.json', './icon-192.png', './icon-512.png', './icon-maskable-512.png', './eb-garamond-400.woff2', './eb-garamond-400-italic.woff2', './eb-garamond-600.woff2'];
self.addEventListener('install', e => { e.waitUntil(caches.open(VERSION).then(c => c.addAll(ASSETS))); self.skipWaiting(); });
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== location.origin) return;
  e.respondWith(
    fetch(e.request).then(r => { if (r.ok) { const cp = r.clone(); caches.open(VERSION).then(c => c.put(e.request, cp)); } return r; })
      .catch(() => caches.match(e.request, { ignoreSearch: true }).then(r => r || caches.match('./index.html')))
  );
});
