// Rustam's Habit Tracker: offline service worker. Bump CACHE_VERSION whenever you replace any file.
const CACHE_VERSION = 'rustams-habit-tracker-v1-5';
const ASSETS = ['./', './index.html', './style.css', './flagship.css', './buttons.css', './habit.css', './btnlook.js', './app.js', './game.js', './art/scene-day.webp', './art/scene-sunset.webp', './art/scene-night.webp', './art/scene-storm.webp', './art/scene-blood.webp', './art/prince-01.webp', './art/prince-02.webp', './art/prince-03.webp', './art/prince-04.webp', './art/prince-05.webp', './art/prince-06.webp', './art/prince-07.webp', './art/prince-08.webp', './art/prince-09.webp', './art/prince-10.webp', './art/prince-11.webp', './art/prince-12.webp', './art/prince-13.webp', './art/prince-14.webp', './art/prince-15.webp', './art/prince-16.webp', './art/prince-17.webp', './art/prince-18.webp', './art/prince-19.webp', './art/prince-20.webp', './art/prince-21.webp', './art/prince-22.webp', './art/prince-23.webp', './art/prince-24.webp', './art/prince-25.webp', './manifest.webmanifest', './icon-192.png', './icon-512.png', './icon-maskable-512.png', './fonts/inter-latin-200-normal.woff2', './fonts/inter-latin-300-normal.woff2', './fonts/inter-latin-400-normal.woff2', './fonts/manrope-latin-200-normal.woff2', './fonts/manrope-latin-300-normal.woff2', './fonts/manrope-latin-400-normal.woff2'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE_VERSION).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE_VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  e.respondWith(caches.match(req, { ignoreSearch: true }).then(cached => {
    const refresh = fetch(req).then(res => { if (res && res.ok) { const copy = res.clone(); caches.open(CACHE_VERSION).then(c => c.put(req, copy)); } return res; }).catch(() => cached);
    return cached || refresh;
  }));
});
