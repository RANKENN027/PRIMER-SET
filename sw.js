/* Primer Set: guarda la app en el dispositivo para abrirla sin internet. */
var VERSION = 'primer-set-20261101133627';
var SHELL = ['./', 'index.html', 'app.css', 'app.js', 'manifest.webmanifest', 'icons/icon-v9-48.png', 'icons/icon-v9-180.png', 'icons/icon-v9-192.png', 'icons/icon-v9-512.png', 'icons/icon-v9-maskable-512.png'];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(VERSION).then(function (c) { return c.addAll(SHELL); }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k !== VERSION && k !== 'primer-set-fonts'; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});
/* Primero la red (con 3 s de espera) y, si falla o no hay internet, lo guardado.
   Así los cambios y el logo nuevo aparecen en cuanto hay conexión. */
function nf(req, cacheName) {
  return caches.open(cacheName).then(function (cache) {
    return new Promise(function (resolve) {
      var done = false;
      function fallback() { cache.match(req).then(function (hit) { if (!done) { done = true; resolve(hit || Response.error()); } }); }
      var t = setTimeout(fallback, 3000);
      fetch(req).then(function (res) {
        clearTimeout(t);
        if (res && res.ok) cache.put(req, res.clone());
        if (!done) { done = true; resolve(res); }
      }).catch(function () { clearTimeout(t); fallback(); });
    });
  });
}
/* Fuentes: lo guardado primero y se actualiza en segundo plano. */
function swr(req, cacheName) {
  return caches.open(cacheName).then(function (cache) {
    return cache.match(req).then(function (hit) {
      var net = fetch(req).then(function (res) {
        if (res && (res.ok || res.type === 'opaque')) cache.put(req, res.clone());
        return res;
      }).catch(function () { return hit; });
      return hit || net;
    });
  });
}
self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET') return;
  var url = new URL(req.url);
  if (url.origin === location.origin) {
    if (req.mode === 'navigate') {
      e.respondWith(nf(new Request('index.html'), VERSION));
    } else {
      e.respondWith(nf(req, VERSION));
    }
  } else if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    e.respondWith(swr(req, 'primer-set-fonts'));
  }
});
